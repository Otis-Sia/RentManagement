package com.rentmanagement.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "finance_transactioncategory")
public class TransactionCategory {

    public enum CategoryType {
        INCOME, EXPENSE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_type", length = 10, nullable = false)
    private CategoryType categoryType;

    @Column(columnDefinition = "TEXT")
    private String description = "";

    @Column(name = "is_tax_deductible", nullable = false)
    private Boolean isTaxDeductible = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
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

    public CategoryType getCategoryType() {
        return categoryType;
    }

    public void setCategoryType(CategoryType categoryType) {
        this.categoryType = categoryType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsTaxDeductible() {
        return isTaxDeductible;
    }

    public void setIsTaxDeductible(Boolean isTaxDeductible) {
        this.isTaxDeductible = isTaxDeductible;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return name + " (" + categoryType + ")";
    }
}
