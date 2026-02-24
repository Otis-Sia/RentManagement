package com.rentmanagement.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_paycheck", uniqueConstraints = @UniqueConstraint(columnNames = { "payroll_run_id",
        "employee_id" }))
public class Paycheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_run_id", nullable = false)
    private PayrollRun payrollRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "gross_pay", precision = 12, scale = 2, nullable = false)
    private BigDecimal grossPay;

    // Deductions
    @Column(name = "paye_tax", precision = 12, scale = 2, nullable = false)
    private BigDecimal payeTax = BigDecimal.ZERO;

    @Column(name = "nhif_deduction", precision = 12, scale = 2, nullable = false)
    private BigDecimal nhifDeduction = BigDecimal.ZERO;

    @Column(name = "nssf_deduction", precision = 12, scale = 2, nullable = false)
    private BigDecimal nssfDeduction = BigDecimal.ZERO;

    @Column(name = "housing_levy", precision = 12, scale = 2, nullable = false)
    private BigDecimal housingLevy = BigDecimal.ZERO;

    @Column(name = "other_deductions", precision = 12, scale = 2, nullable = false)
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    @Column(name = "deduction_notes", length = 500)
    private String deductionNotes = "";

    // Employer contributions
    @Column(name = "employer_nhif", precision = 12, scale = 2, nullable = false)
    private BigDecimal employerNhif = BigDecimal.ZERO;

    @Column(name = "employer_nssf", precision = 12, scale = 2, nullable = false)
    private BigDecimal employerNssf = BigDecimal.ZERO;

    // Computed
    @Column(name = "total_deductions", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "net_pay", precision = 12, scale = 2, nullable = false)
    private BigDecimal netPay = BigDecimal.ZERO;

    @Column(name = "is_direct_deposit", nullable = false)
    private Boolean isDirectDeposit = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        calculate();
    }

    @PreUpdate
    protected void onUpdate() {
        calculate();
    }

    /**
     * Calculate deductions and net pay based on Kenyan tax brackets.
     */
    public void calculate() {
        BigDecimal gross = this.grossPay;

        // PAYE (Kenya 2024/2025 tax brackets - simplified)
        BigDecimal taxable = gross;
        BigDecimal paye = BigDecimal.ZERO;

        if (taxable.compareTo(new BigDecimal("800000")) > 0) {
            paye = paye.add(taxable.subtract(new BigDecimal("800000")).multiply(new BigDecimal("0.35")));
            taxable = new BigDecimal("800000");
        }
        if (taxable.compareTo(new BigDecimal("500000")) > 0) {
            paye = paye.add(taxable.subtract(new BigDecimal("500000")).multiply(new BigDecimal("0.325")));
            taxable = new BigDecimal("500000");
        }
        if (taxable.compareTo(new BigDecimal("32333")) > 0) {
            paye = paye.add(taxable.subtract(new BigDecimal("32333")).multiply(new BigDecimal("0.30")));
            taxable = new BigDecimal("32333");
        }
        if (taxable.compareTo(new BigDecimal("24000")) > 0) {
            paye = paye.add(taxable.subtract(new BigDecimal("24000")).multiply(new BigDecimal("0.25")));
            taxable = new BigDecimal("24000");
        }
        paye = paye.add(taxable.multiply(new BigDecimal("0.10")));
        // Personal relief
        paye = paye.subtract(new BigDecimal("2400")).max(BigDecimal.ZERO);
        this.payeTax = paye.setScale(2, RoundingMode.HALF_UP);

        // NHIF (simplified tiered rates)
        if (gross.compareTo(new BigDecimal("5999")) <= 0) {
            this.nhifDeduction = new BigDecimal("150");
        } else if (gross.compareTo(new BigDecimal("7999")) <= 0) {
            this.nhifDeduction = new BigDecimal("300");
        } else if (gross.compareTo(new BigDecimal("11999")) <= 0) {
            this.nhifDeduction = new BigDecimal("400");
        } else if (gross.compareTo(new BigDecimal("14999")) <= 0) {
            this.nhifDeduction = new BigDecimal("500");
        } else if (gross.compareTo(new BigDecimal("19999")) <= 0) {
            this.nhifDeduction = new BigDecimal("600");
        } else if (gross.compareTo(new BigDecimal("24999")) <= 0) {
            this.nhifDeduction = new BigDecimal("750");
        } else if (gross.compareTo(new BigDecimal("29999")) <= 0) {
            this.nhifDeduction = new BigDecimal("850");
        } else if (gross.compareTo(new BigDecimal("34999")) <= 0) {
            this.nhifDeduction = new BigDecimal("900");
        } else if (gross.compareTo(new BigDecimal("39999")) <= 0) {
            this.nhifDeduction = new BigDecimal("950");
        } else if (gross.compareTo(new BigDecimal("44999")) <= 0) {
            this.nhifDeduction = new BigDecimal("1000");
        } else if (gross.compareTo(new BigDecimal("49999")) <= 0) {
            this.nhifDeduction = new BigDecimal("1100");
        } else if (gross.compareTo(new BigDecimal("59999")) <= 0) {
            this.nhifDeduction = new BigDecimal("1200");
        } else if (gross.compareTo(new BigDecimal("69999")) <= 0) {
            this.nhifDeduction = new BigDecimal("1300");
        } else if (gross.compareTo(new BigDecimal("79999")) <= 0) {
            this.nhifDeduction = new BigDecimal("1400");
        } else if (gross.compareTo(new BigDecimal("89999")) <= 0) {
            this.nhifDeduction = new BigDecimal("1500");
        } else if (gross.compareTo(new BigDecimal("99999")) <= 0) {
            this.nhifDeduction = new BigDecimal("1600");
        } else {
            this.nhifDeduction = new BigDecimal("1700");
        }

        // NSSF (Tier I + Tier II)
        BigDecimal tier1Limit = new BigDecimal("7000");
        BigDecimal tier2Limit = new BigDecimal("36000");
        BigDecimal nssfRate = new BigDecimal("0.06");
        if (gross.compareTo(tier1Limit) <= 0) {
            this.nssfDeduction = gross.multiply(nssfRate);
        } else if (gross.compareTo(tier2Limit) <= 0) {
            this.nssfDeduction = tier1Limit.multiply(nssfRate)
                    .add(gross.subtract(tier1Limit).multiply(nssfRate));
        } else {
            this.nssfDeduction = tier2Limit.multiply(nssfRate);
        }
        this.nssfDeduction = this.nssfDeduction.setScale(2, RoundingMode.HALF_UP);

        // Housing Levy (1.5% of gross)
        this.housingLevy = gross.multiply(new BigDecimal("0.015")).setScale(2, RoundingMode.HALF_UP);

        // Employer contributions (matched)
        this.employerNhif = this.nhifDeduction;
        this.employerNssf = this.nssfDeduction;

        // Totals
        this.totalDeductions = this.payeTax
                .add(this.nhifDeduction)
                .add(this.nssfDeduction)
                .add(this.housingLevy)
                .add(this.otherDeductions);
        this.netPay = this.grossPay.subtract(this.totalDeductions);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PayrollRun getPayrollRun() {
        return payrollRun;
    }

    public void setPayrollRun(PayrollRun payrollRun) {
        this.payrollRun = payrollRun;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public BigDecimal getGrossPay() {
        return grossPay;
    }

    public void setGrossPay(BigDecimal grossPay) {
        this.grossPay = grossPay;
    }

    public BigDecimal getPayeTax() {
        return payeTax;
    }

    public void setPayeTax(BigDecimal payeTax) {
        this.payeTax = payeTax;
    }

    public BigDecimal getNhifDeduction() {
        return nhifDeduction;
    }

    public void setNhifDeduction(BigDecimal nhifDeduction) {
        this.nhifDeduction = nhifDeduction;
    }

    public BigDecimal getNssfDeduction() {
        return nssfDeduction;
    }

    public void setNssfDeduction(BigDecimal nssfDeduction) {
        this.nssfDeduction = nssfDeduction;
    }

    public BigDecimal getHousingLevy() {
        return housingLevy;
    }

    public void setHousingLevy(BigDecimal housingLevy) {
        this.housingLevy = housingLevy;
    }

    public BigDecimal getOtherDeductions() {
        return otherDeductions;
    }

    public void setOtherDeductions(BigDecimal otherDeductions) {
        this.otherDeductions = otherDeductions;
    }

    public String getDeductionNotes() {
        return deductionNotes;
    }

    public void setDeductionNotes(String deductionNotes) {
        this.deductionNotes = deductionNotes;
    }

    public BigDecimal getEmployerNhif() {
        return employerNhif;
    }

    public void setEmployerNhif(BigDecimal employerNhif) {
        this.employerNhif = employerNhif;
    }

    public BigDecimal getEmployerNssf() {
        return employerNssf;
    }

    public void setEmployerNssf(BigDecimal employerNssf) {
        this.employerNssf = employerNssf;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getNetPay() {
        return netPay;
    }

    public void setNetPay(BigDecimal netPay) {
        this.netPay = netPay;
    }

    public Boolean getIsDirectDeposit() {
        return isDirectDeposit;
    }

    public void setIsDirectDeposit(Boolean isDirectDeposit) {
        this.isDirectDeposit = isDirectDeposit;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return (employee != null ? employee.getFullName() : "Unknown") + " - " +
                (payrollRun != null ? payrollRun.getName() : "Unknown");
    }
}
