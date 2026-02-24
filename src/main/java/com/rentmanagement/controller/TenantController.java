package com.rentmanagement.controller;

import com.rentmanagement.domain.Tenant;
import com.rentmanagement.repository.TenantRepository;
import com.rentmanagement.repository.PaymentRepository;
import com.rentmanagement.repository.PropertyRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Controller("/api/tenants")
public class TenantController {

    @Inject
    TenantRepository tenantRepository;
    @Inject
    PaymentRepository paymentRepository;
    @Inject
    PropertyRepository propertyRepository;

    @Get("/")
    public List<Tenant> list() {
        return tenantRepository.findAll();
    }

    @Get("/{id}")
    @Transactional
    public HttpResponse<?> get(Long id) {
        return tenantRepository.findById(id)
                .map(tenant -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", tenant.getId());
                    data.put("name", tenant.getName());
                    data.put("email", tenant.getEmail());
                    data.put("phone", tenant.getPhone());
                    data.put("lease_start", tenant.getLeaseStart());
                    data.put("lease_end", tenant.getLeaseEnd());
                    data.put("rent_amount", tenant.getRentAmount());
                    data.put("deposit", tenant.getDeposit());
                    data.put("rent_due_day", tenant.getRentDueDay());
                    data.put("is_active", tenant.getIsActive());
                    data.put("created_at", tenant.getCreatedAt());
                    data.put("updated_at", tenant.getUpdatedAt());

                    if (tenant.getProperty() != null) {
                        Map<String, Object> propMap = new LinkedHashMap<>();
                        propMap.put("id", tenant.getProperty().getId());
                        propMap.put("house_number", tenant.getProperty().getHouseNumber());
                        propMap.put("address", tenant.getProperty().getAddress());
                        propMap.put("monthly_rent", tenant.getProperty().getMonthlyRent());
                        data.put("property", propMap);
                        data.put("property_id", tenant.getProperty().getId());
                    } else {
                        data.put("property", null);
                        data.put("property_id", null);
                    }

                    // Payment history
                    var payments = paymentRepository.findByTenantId(tenant.getId());
                    List<Map<String, Object>> paymentList = payments.stream().map(p -> {
                        Map<String, Object> pm = new LinkedHashMap<>();
                        pm.put("id", p.getId());
                        pm.put("amount", p.getAmount());
                        pm.put("amount_paid", p.getAmountPaid());
                        pm.put("date_due", p.getDateDue());
                        pm.put("date_paid", p.getDatePaid());
                        pm.put("status", p.getStatus());
                        pm.put("payment_type", p.getPaymentType());
                        pm.put("balance", p.getBalance());
                        return pm;
                    }).toList();
                    data.put("payments", paymentList);

                    return HttpResponse.ok(data);
                })
                .orElse(HttpResponse.notFound());
    }

    @Post("/")
    @Transactional
    public HttpResponse<Tenant> create(@Body Map<String, Object> body) {
        Tenant tenant = new Tenant();
        mapBodyToTenant(tenant, body);
        return HttpResponse.created(tenantRepository.save(tenant));
    }

    @Put("/{id}")
    @Transactional
    public HttpResponse<Tenant> update(Long id, @Body Map<String, Object> body) {
        return tenantRepository.findById(id)
                .map(existing -> {
                    mapBodyToTenant(existing, body);
                    return HttpResponse.ok(tenantRepository.update(existing));
                })
                .orElse(HttpResponse.notFound());
    }

    @Patch("/{id}")
    @Transactional
    public HttpResponse<Tenant> patch(Long id, @Body Map<String, Object> body) {
        return update(id, body);
    }

    @Delete("/{id}")
    @Transactional
    public HttpResponse<?> delete(Long id) {
        if (tenantRepository.existsById(id)) {
            tenantRepository.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    private void mapBodyToTenant(Tenant tenant, Map<String, Object> body) {
        if (body.containsKey("name"))
            tenant.setName((String) body.get("name"));
        if (body.containsKey("email"))
            tenant.setEmail((String) body.get("email"));
        if (body.containsKey("phone"))
            tenant.setPhone((String) body.get("phone"));
        if (body.containsKey("lease_start"))
            tenant.setLeaseStart(LocalDate.parse((String) body.get("lease_start")));
        if (body.containsKey("lease_end"))
            tenant.setLeaseEnd(LocalDate.parse((String) body.get("lease_end")));
        if (body.containsKey("rent_amount"))
            tenant.setRentAmount(new BigDecimal(body.get("rent_amount").toString()));
        if (body.containsKey("deposit"))
            tenant.setDeposit(new BigDecimal(body.get("deposit").toString()));
        if (body.containsKey("rent_due_day"))
            tenant.setRentDueDay(((Number) body.get("rent_due_day")).intValue());
        if (body.containsKey("is_active"))
            tenant.setIsActive((Boolean) body.get("is_active"));
        if (body.containsKey("property") && body.get("property") != null) {
            Long propId = Long.valueOf(body.get("property").toString());
            propertyRepository.findById(propId).ifPresent(tenant::setProperty);
        }
    }
}
