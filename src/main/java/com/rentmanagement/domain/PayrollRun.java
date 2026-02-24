package com.rentmanagement.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payroll_payrollrun")
public class PayrollRun {

    public enum RunStatus {
        DRAFT, PROCESSING, APPROVED, PAID, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "pay_date", nullable = false)
    private LocalDate payDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 15, nullable = false)
    private RunStatus status = RunStatus.DRAFT;

    @Column(name = "total_gross", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalGross = BigDecimal.ZERO;

    @Column(name = "total_deductions", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "total_net", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalNet = BigDecimal.ZERO;

    @Column(name = "total_employer_taxes", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalEmployerTaxes = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes = "";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "payrollRun", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Paycheck> paychecks = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void recalculateTotals() {
        this.totalGross = paychecks.stream()
                .map(Paycheck::getGrossPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalDeductions = paychecks.stream()
                .map(Paycheck::getTotalDeductions)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalNet = paychecks.stream()
                .map(Paycheck::getNetPay)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalEmployerTaxes = paychecks.stream()
                .map(p -> p.getEmployerNhif().add(p.getEmployerNssf()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getPeriodStart() {
        return periodStart;
    }

    public void setPeriodStart(LocalDate periodStart) {
        this.periodStart = periodStart;
    }

    public LocalDate getPeriodEnd() {
        return periodEnd;
    }

    public void setPeriodEnd(LocalDate periodEnd) {
        this.periodEnd = periodEnd;
    }

    public LocalDate getPayDate() {
        return payDate;
    }

    public void setPayDate(LocalDate payDate) {
        this.payDate = payDate;
    }

    public RunStatus getStatus() {
        return status;
    }

    public void setStatus(RunStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalGross() {
        return totalGross;
    }

    public void setTotalGross(BigDecimal totalGross) {
        this.totalGross = totalGross;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getTotalNet() {
        return totalNet;
    }

    public void setTotalNet(BigDecimal totalNet) {
        this.totalNet = totalNet;
    }

    public BigDecimal getTotalEmployerTaxes() {
        return totalEmployerTaxes;
    }

    public void setTotalEmployerTaxes(BigDecimal totalEmployerTaxes) {
        this.totalEmployerTaxes = totalEmployerTaxes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<Paycheck> getPaychecks() {
        return paychecks;
    }

    public void setPaychecks(List<Paycheck> paychecks) {
        this.paychecks = paychecks;
    }

    @Override
    public String toString() {
        return name;
    }
}
