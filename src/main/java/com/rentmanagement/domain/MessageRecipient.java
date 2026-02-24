package com.rentmanagement.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messaging_messagerecipient")
public class MessageRecipient {

    public enum RecipientType {
        TENANT, EMPLOYEE
    }

    public enum WhatsAppStatus {
        PENDING, SENT, FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private BroadcastMessage message;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_type", length = 10, nullable = false)
    private RecipientType recipientType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "whatsapp_status", length = 10, nullable = false)
    private WhatsAppStatus whatsappStatus = WhatsAppStatus.PENDING;

    @Column(name = "whatsapp_sent_at")
    private LocalDateTime whatsappSentAt;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Transient
    public String getRecipientName() {
        if (tenant != null)
            return tenant.getName();
        if (employee != null)
            return employee.getFullName();
        return "Unknown";
    }

    @Transient
    public String getRecipientEmail() {
        if (tenant != null)
            return tenant.getEmail();
        if (employee != null)
            return employee.getEmail();
        return "";
    }

    @Transient
    public String getRecipientPhone() {
        if (tenant != null)
            return tenant.getPhone();
        if (employee != null)
            return employee.getPhone();
        return "";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BroadcastMessage getMessage() {
        return message;
    }

    public void setMessage(BroadcastMessage message) {
        this.message = message;
    }

    public RecipientType getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(RecipientType recipientType) {
        this.recipientType = recipientType;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public WhatsAppStatus getWhatsappStatus() {
        return whatsappStatus;
    }

    public void setWhatsappStatus(WhatsAppStatus whatsappStatus) {
        this.whatsappStatus = whatsappStatus;
    }

    public LocalDateTime getWhatsappSentAt() {
        return whatsappSentAt;
    }

    public void setWhatsappSentAt(LocalDateTime whatsappSentAt) {
        this.whatsappSentAt = whatsappSentAt;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return getRecipientName() + " - " + (message != null ? message.getSubject() : "Unknown");
    }
}
