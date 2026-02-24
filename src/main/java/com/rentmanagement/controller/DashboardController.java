package com.rentmanagement.controller;

import com.rentmanagement.domain.*;
import com.rentmanagement.domain.Payment.PaymentStatus;
import com.rentmanagement.domain.MaintenanceRequest.Status;
import com.rentmanagement.repository.*;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Controller("/api/reports")
public class DashboardController {

    @Inject
    PaymentRepository paymentRepo;
    @Inject
    MaintenanceRequestRepository maintenanceRepo;
    @Inject
    PropertyRepository propertyRepo;

    @Get("/dashboard/")
    @Transactional
    public Map<String, Object> dashboard() {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();

        // Monthly Income
        var paidPayments = paymentRepo.findPaidByYearAndMonth(year, month);
        BigDecimal monthlyIncome = paidPayments.stream()
                .map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Outstanding Balance
        var outstandingStatusList = List.of(
                PaymentStatus.PENDING, PaymentStatus.LATE, PaymentStatus.FAILED,
                PaymentStatus.SEVERE, PaymentStatus.DEFAULTED);
        var outstandingPayments = paymentRepo.findByStatusIn(outstandingStatusList);
        BigDecimal outstandingBalance = outstandingPayments.stream()
                .map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Maintenance Costs
        var completedMaintenance = maintenanceRepo.findByStatus(Status.COMPLETED);
        BigDecimal maintenanceCosts = completedMaintenance.stream()
                .filter(m -> m.getCost() != null)
                .map(MaintenanceRequest::getCost).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Recent Payments (last 10)
        var allPayments = paymentRepo.findAllWithTenantAndProperty();
        List<Map<String, Object>> recentPayments = allPayments.stream().limit(10).map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("tenant_id", p.getTenant().getId());
            m.put("tenant_name", p.getTenant().getName());
            m.put("property_id", p.getTenant().getProperty() != null ? p.getTenant().getProperty().getId() : null);
            m.put("property",
                    p.getTenant().getProperty() != null ? p.getTenant().getProperty().getHouseNumber() : "N/A");
            m.put("amount", p.getAmount());
            m.put("date_paid", p.getDatePaid());
            m.put("date_due", p.getDateDue());
            m.put("status", p.getStatus());
            m.put("payment_type", p.getPaymentType());
            return m;
        }).toList();

        // Upcoming Due Payments
        var upcomingDue = paymentRepo.findUpcomingDue(now);
        List<Map<String, Object>> upcomingPayments = upcomingDue.stream().limit(10).map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("tenant_id", p.getTenant().getId());
            m.put("tenant_name", p.getTenant().getName());
            m.put("property_id", p.getTenant().getProperty() != null ? p.getTenant().getProperty().getId() : null);
            m.put("property",
                    p.getTenant().getProperty() != null ? p.getTenant().getProperty().getHouseNumber() : "N/A");
            m.put("amount", p.getAmount());
            m.put("date_due", p.getDateDue());
            m.put("status", p.getStatus());
            return m;
        }).toList();

        // Maintenance by Status
        Map<String, Long> maintenanceByStatus = new LinkedHashMap<>();
        for (Status s : Status.values()) {
            long count = maintenanceRepo.countByStatus(s);
            if (count > 0)
                maintenanceByStatus.put(s.name(), count);
        }

        // Active Maintenance
        var activeMaint = maintenanceRepo.findByStatusIn(List.of(Status.OPEN, Status.IN_PROGRESS));
        List<Map<String, Object>> activeMaintData = activeMaint.stream().limit(10).map(m -> {
            Map<String, Object> mm = new LinkedHashMap<>();
            mm.put("id", m.getId());
            mm.put("title", m.getTitle());
            mm.put("tenant_id", m.getTenant().getId());
            mm.put("tenant_name", m.getTenant().getName());
            mm.put("property_id", m.getTenant().getProperty() != null ? m.getTenant().getProperty().getId() : null);
            mm.put("property",
                    m.getTenant().getProperty() != null ? m.getTenant().getProperty().getHouseNumber() : "N/A");
            mm.put("priority", m.getPriority());
            mm.put("status", m.getStatus());
            mm.put("request_date", m.getRequestDate());
            mm.put("cost", m.getCost());
            return mm;
        }).toList();

        // Payment Trends (last 6 months)
        List<Map<String, Object>> paymentTrends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate target = now.minusMonths(i);
            var monthPayments = paymentRepo.findPaidByYearAndMonth(target.getYear(), target.getMonthValue());
            BigDecimal income = monthPayments.stream()
                    .map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            String monthName = target.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            paymentTrends.add(Map.of(
                    "month", monthName + " " + target.getYear(),
                    "income", income));
        }

        // Payment Status Distribution
        Map<String, Long> paymentStatusDist = new LinkedHashMap<>();
        for (PaymentStatus s : PaymentStatus.values()) {
            var byStatus = paymentRepo.findByStatus(s);
            if (!byStatus.isEmpty())
                paymentStatusDist.put(s.name(), (long) byStatus.size());
        }

        // Property Occupancy
        var allProperties = propertyRepo.findAll();
        long totalProperties = allProperties.size();
        long occupiedProperties = allProperties.stream().filter(Property::getIsOccupied).count();
        double occupancyRate = totalProperties > 0 ? (double) occupiedProperties / totalProperties * 100 : 0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("monthly_income", monthlyIncome);
        result.put("outstanding_balance", outstandingBalance);
        result.put("maintenance_costs", maintenanceCosts);
        result.put("net_cash_flow", monthlyIncome.subtract(maintenanceCosts));
        result.put("recent_payments", recentPayments);
        result.put("upcoming_payments", upcomingPayments);
        result.put("maintenance_by_status", maintenanceByStatus);
        result.put("active_maintenance", activeMaintData);
        result.put("payment_trends", paymentTrends);
        result.put("payment_status_distribution", paymentStatusDist);
        result.put("occupancy", Map.of(
                "total", totalProperties,
                "occupied", occupiedProperties,
                "rate", BigDecimal.valueOf(occupancyRate).setScale(1, RoundingMode.HALF_UP)));

        return result;
    }
}
