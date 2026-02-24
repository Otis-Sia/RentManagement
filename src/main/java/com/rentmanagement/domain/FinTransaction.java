package com.rentmanagement.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "finance_transaction")
public class FinTransaction {

    public enum TransactionType {
        INCOME, EXPENSE, TRANSFER
    }

    public enum TransactionStatus {
        PENDING, CLEARED, RECONCILED, VOID
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id")
    private BankAccount bankAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private TransactionCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", length = 10, nullable = false)
    private TransactionType transactionType;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 500, nullable = false)
    private String description;

    @Column(length = 100)
    private String reference = "";

    @Column(length = 255)
    private String payee = "";

    @Enumerated(EnumType.STRING)
    @Column(length = 15, nullable = false)
    private TransactionStatus status = TransactionStatus.CLEARED;

    @Column(name = "is_auto_categorized", nullable = false)
    private Boolean isAutoCategorized = false;

    @Column(columnDefinition = "TEXT")
    private String notes = "";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_payment_id")
    private Payment linkedPayment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BankAccount getBankAccount() {
        return bankAccount;
    }

    public void setBankAccount(BankAccount bankAccount) {
        this.bankAccount = bankAccount;
    }

    public TransactionCategory getCategory() {
        return category;
    }

    public void setCategory(TransactionCategory category) {
        this.category = category;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getPayee() {
        return payee;
    }

    public void setPayee(String payee) {
        this.payee = payee;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public Boolean getIsAutoCategorized() {
        return isAutoCategorized;
    }

    public void setIsAutoCategorized(Boolean isAutoCategorized) {
        this.isAutoCategorized = isAutoCategorized;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Payment getLinkedPayment() {
        return linkedPayment;
    }

    public void setLinkedPayment(Payment linkedPayment) {
        this.linkedPayment = linkedPayment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getTransactionTypeDisplay() {
        return switch (transactionType) {
            case INCOME -> "Income";
            case EXPENSE -> "Expense";
            case TRANSFER -> "Transfer";
        };
    }

    @Override
    public String toString() {
        return getTransactionTypeDisplay() + " - " + description + " - " + amount;
    }
}
