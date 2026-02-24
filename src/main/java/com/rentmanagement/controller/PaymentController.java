package com.rentmanagement.controller;

import com.rentmanagement.domain.Payment;
import com.rentmanagement.domain.Payment.*;
import com.rentmanagement.repository.PaymentRepository;
import com.rentmanagement.repository.TenantRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Controller("/api/payments")
public class PaymentController {

    @Inject
    PaymentRepository paymentRepository;
    @Inject
    TenantRepository tenantRepository;

    @Get("/")
    @Transactional
    public List<Map<String, Object>> list(@QueryValue Optional<String> status,
            @QueryValue Optional<String> payment_type,
            @QueryValue Optional<Long> tenant) {
        List<Payment> payments = paymentRepository.findAllOrderByDateDueDesc();
        return payments.stream()
                .filter(p -> status.isEmpty() || p.getStatus().name().equals(status.get()))
                .filter(p -> payment_type.isEmpty() || p.getPaymentType().name().equals(payment_type.get()))
                .filter(p -> tenant.isEmpty() || (p.getTenant() != null && p.getTenant().getId().equals(tenant.get())))
                .map(this::toMap)
                .toList();
    }

    @Get("/{id}")
    @Transactional
    public HttpResponse<?> get(Long id) {
        return paymentRepository.findById(id)
                .map(p -> HttpResponse.ok(toMap(p)))
                .orElse(HttpResponse.notFound());
    }

    @Post("/")
    @Transactional
    public HttpResponse<?> create(@Body Map<String, Object> body) {
        String paymentType = (String) body.getOrDefault("payment_type", "RENT");
        Long tenantId = body.get("tenant") != null ? Long.valueOf(body.get("tenant").toString()) : null;
        String dateDueStr = (String) body.get("date_due");

        Payment targetPayment = null;

        // Reconciliation: find existing PENDING payment to update
        if ("RENT".equals(paymentType) && tenantId != null && dateDueStr != null) {
            LocalDate dateDue = LocalDate.parse(dateDueStr);
            targetPayment = paymentRepository.findByTenantIdAndStatusAndPaymentTypeAndDateDue(
                    tenantId, PaymentStatus.PENDING, PaymentType.RENT, dateDue).orElse(null);
        }

        Payment payment;
        if (targetPayment != null) {
            payment = targetPayment;
            mapBodyToPayment(payment, body);
        } else {
            payment = new Payment();
            mapBodyToPayment(payment, body);
        }
        payment = paymentRepository.save(payment);

        // Next-month auto-generation
        if (payment.getPaymentType() == PaymentType.RENT && payment.getStatus() == PaymentStatus.PAID) {
            var latestRent = paymentRepository.findFirstByTenantIdAndPaymentTypeOrderByDateDueDesc(
                    payment.getTenant().getId(), PaymentType.RENT);
            if (latestRent.isPresent()) {
                LocalDate nextDueDate = latestRent.get().getDateDue().plusMonths(1);
                boolean exists = paymentRepository.existsByTenantIdAndPaymentTypeAndDateDue(
                        payment.getTenant().getId(), PaymentType.RENT, nextDueDate);
                if (!exists) {
                    Payment nextPayment = new Payment();
                    nextPayment.setTenant(payment.getTenant());
                    nextPayment.setAmount(payment.getTenant().getRentAmount());
                    nextPayment.setOriginalAmount(payment.getTenant().getRentAmount());
                    nextPayment.setDateDue(nextDueDate);
                    nextPayment.setPaymentType(PaymentType.RENT);
                    nextPayment.setStatus(PaymentStatus.PENDING);
                    paymentRepository.save(nextPayment);
                }
            }
        }

        return HttpResponse.created(toMap(payment));
    }

    @Put("/{id}")
    @Transactional
    public HttpResponse<?> update(Long id, @Body Map<String, Object> body) {
        return paymentRepository.findById(id)
                .map(existing -> {
                    // Prevent editing PAID payments (immutable fields)
                    if (existing.getStatus() == PaymentStatus.PAID) {
                        Set<String> immutableFields = Set.of("amount", "date_due", "tenant", "payment_type");
                        for (String field : immutableFields) {
                            if (body.containsKey(field)) {
                                return HttpResponse.badRequest(Map.of("detail",
                                        "Cannot modify " + field + " on a PAID payment."));
                            }
                        }
                    }
                    mapBodyToPayment(existing, body);
                    return HttpResponse.ok(toMap(paymentRepository.update(existing)));
                })
                .orElse(HttpResponse.notFound());
    }

    @Patch("/{id}")
    @Transactional
    public HttpResponse<?> patch(Long id, @Body Map<String, Object> body) {
        return update(id, body);
    }

    @Delete("/{id}")
    @Transactional
    public HttpResponse<?> delete(Long id) {
        return paymentRepository.findById(id)
                .map(payment -> {
                    if (payment.getStatus() == PaymentStatus.PAID) {
                        return HttpResponse.badRequest(Map.of("detail",
                                "Cannot delete a PAID payment. Void it instead."));
                    }
                    paymentRepository.delete(payment);
                    return HttpResponse.noContent();
                })
                .orElse(HttpResponse.notFound());
    }

    @Get("/{id}/receipt")
    @Transactional
    public HttpResponse<?> receipt(Long id) {
        return paymentRepository.findById(id)
                .map(payment -> {
                    if (payment.getStatus() != PaymentStatus.PAID) {
                        return HttpResponse.badRequest(Map.of("detail",
                                "Receipt is only available for PAID payments."));
                    }

                    Map<String, Object> receipt = new LinkedHashMap<>();
                    receipt.put("receipt_number", String.format("RCP-%06d", payment.getId()));
                    receipt.put("date_issued", LocalDate.now().toString());

                    Map<String, Object> tenantData = new LinkedHashMap<>();
                    tenantData.put("name", payment.getTenant().getName());
                    tenantData.put("email", payment.getTenant().getEmail());
                    tenantData.put("phone", payment.getTenant().getPhone());
                    receipt.put("tenant", tenantData);

                    Map<String, Object> propData = new LinkedHashMap<>();
                    if (payment.getTenant().getProperty() != null) {
                        propData.put("house_number", payment.getTenant().getProperty().getHouseNumber());
                        propData.put("address", payment.getTenant().getProperty().getAddress());
                    }
                    receipt.put("property", propData);

                    Map<String, Object> paymentData = new LinkedHashMap<>();
                    paymentData.put("id", payment.getId());
                    paymentData.put("type", payment.getPaymentTypeDisplay());
                    paymentData.put("method", payment.getPaymentMethodDisplay());
                    paymentData.put("amount", payment.getAmount().toString());
                    paymentData.put("amount_paid", payment.getAmountPaid().toString());
                    paymentData.put("date_due", payment.getDateDue().toString());
                    paymentData.put("date_paid",
                            payment.getDatePaid() != null ? payment.getDatePaid().toString() : null);
                    paymentData.put("transaction_id",
                            payment.getTransactionId() != null ? payment.getTransactionId() : "");
                    paymentData.put("notes", payment.getNotes());
                    receipt.put("payment", paymentData);
                    receipt.put("utilization", payment.getUtilizationData());
                    receipt.put("balance", payment.getBalance().toString());

                    return HttpResponse.ok(receipt);
                })
                .orElse(HttpResponse.notFound());
    }

    private void mapBodyToPayment(Payment payment, Map<String, Object> body) {
        if (body.containsKey("tenant")) {
            Long tid = Long.valueOf(body.get("tenant").toString());
            tenantRepository.findById(tid).ifPresent(payment::setTenant);
        }
        if (body.containsKey("amount"))
            payment.setAmount(new BigDecimal(body.get("amount").toString()));
        if (body.containsKey("amount_paid"))
            payment.setAmountPaid(new BigDecimal(body.get("amount_paid").toString()));
        if (body.containsKey("date_due"))
            payment.setDateDue(LocalDate.parse((String) body.get("date_due")));
        if (body.containsKey("date_paid") && body.get("date_paid") != null) {
            payment.setDatePaid(LocalDate.parse((String) body.get("date_paid")));
        }
        if (body.containsKey("payment_type"))
            payment.setPaymentType(PaymentType.valueOf((String) body.get("payment_type")));
        if (body.containsKey("payment_method"))
            payment.setPaymentMethod(PaymentMethod.valueOf((String) body.get("payment_method")));
        if (body.containsKey("status"))
            payment.setStatus(PaymentStatus.valueOf((String) body.get("status")));
        if (body.containsKey("transaction_id"))
            payment.setTransactionId((String) body.get("transaction_id"));
        if (body.containsKey("notes"))
            payment.setNotes((String) body.get("notes"));
        if (body.containsKey("utilization_data"))
            payment.setUtilizationData(body.get("utilization_data").toString());
    }

    private Map<String, Object> toMap(Payment p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("tenant", p.getTenant() != null ? p.getTenant().getId() : null);
        m.put("tenant_name", p.getTenant() != null ? p.getTenant().getName() : null);
        if (p.getTenant() != null && p.getTenant().getProperty() != null) {
            m.put("property_id", p.getTenant().getProperty().getId());
            m.put("property_house_number", p.getTenant().getProperty().getHouseNumber());
        }
        m.put("amount", p.getAmount());
        m.put("amount_paid", p.getAmountPaid());
        m.put("original_amount", p.getOriginalAmount());
        m.put("date_due", p.getDateDue());
        m.put("date_paid", p.getDatePaid());
        m.put("payment_type", p.getPaymentType());
        m.put("payment_type_display", p.getPaymentTypeDisplay());
        m.put("payment_method", p.getPaymentMethod());
        m.put("payment_method_display", p.getPaymentMethodDisplay());
        m.put("status", p.getStatus());
        m.put("status_display", p.getStatusDisplay());
        m.put("transaction_id", p.getTransactionId());
        m.put("notes", p.getNotes());
        m.put("balance", p.getBalance());
        m.put("created_at", p.getCreatedAt());
        m.put("updated_at", p.getUpdatedAt());
        return m;
    }
}
