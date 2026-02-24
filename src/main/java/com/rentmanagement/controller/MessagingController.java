package com.rentmanagement.controller;

import com.rentmanagement.domain.*;
import com.rentmanagement.domain.MessageRecipient.*;
import com.rentmanagement.repository.*;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Controller("/api/messaging")
public class MessagingController {

    @Inject
    BroadcastMessageRepository broadcastRepo;
    @Inject
    MessageRecipientRepository recipientRepo;
    @Inject
    TenantRepository tenantRepo;
    @Inject
    EmployeeRepository employeeRepo;
    @Inject
    PropertyRepository propertyRepo;

    @Get("/broadcasts/")
    @Transactional
    public List<Map<String, Object>> listBroadcasts() {
        return broadcastRepo.findAll().stream().map(msg -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", msg.getId());
            m.put("subject", msg.getSubject());
            m.put("audience", msg.getAudience());
            m.put("priority", msg.getPriority());
            m.put("is_sent", msg.getIsSent());
            m.put("sent_at", msg.getSentAt());
            m.put("created_at", msg.getCreatedAt());
            m.put("recipient_count", recipientRepo.countByMessageId(msg.getId()));
            m.put("read_count", recipientRepo.countByMessageIdAndIsReadTrue(msg.getId()));
            return m;
        }).toList();
    }

    @Get("/broadcasts/{id}")
    @Transactional
    public HttpResponse<?> getBroadcast(Long id) {
        return broadcastRepo.findById(id).map(msg -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", msg.getId());
            m.put("subject", msg.getSubject());
            m.put("body", msg.getBody());
            m.put("audience", msg.getAudience());
            m.put("building_address", msg.getBuildingAddress());
            m.put("priority", msg.getPriority());
            m.put("is_sent", msg.getIsSent());
            m.put("sent_at", msg.getSentAt());
            m.put("created_at", msg.getCreatedAt());

            var recipients = recipientRepo.findByMessageId(msg.getId());
            List<Map<String, Object>> recipientList = recipients.stream().map(r -> {
                Map<String, Object> rm = new LinkedHashMap<>();
                rm.put("id", r.getId());
                rm.put("recipient_type", r.getRecipientType());
                rm.put("recipient_name", r.getRecipientName());
                rm.put("recipient_email", r.getRecipientEmail());
                rm.put("recipient_phone", r.getRecipientPhone());
                rm.put("whatsapp_status", r.getWhatsappStatus());
                rm.put("is_read", r.getIsRead());
                rm.put("read_at", r.getReadAt());
                return rm;
            }).toList();
            m.put("recipients", recipientList);
            return HttpResponse.ok(m);
        }).orElse(HttpResponse.notFound());
    }

    @Post("/broadcasts/")
    @Transactional
    public HttpResponse<BroadcastMessage> createBroadcast(@Body BroadcastMessage msg) {
        return HttpResponse.created(broadcastRepo.save(msg));
    }

    @Delete("/broadcasts/{id}")
    @Transactional
    public HttpResponse<?> deleteBroadcast(Long id) {
        if (broadcastRepo.existsById(id)) {
            broadcastRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    @Post("/broadcasts/{id}/send/")
    @Transactional
    public HttpResponse<?> sendBroadcast(Long id) {
        return broadcastRepo.findById(id).map(msg -> {
            if (msg.getIsSent()) {
                return HttpResponse.badRequest(Map.of("detail", "This message has already been sent."));
            }

            int created = 0;
            if (msg.getAudience() == BroadcastMessage.Audience.ALL_TENANTS) {
                for (Tenant t : tenantRepo.findByIsActiveTrue()) {
                    MessageRecipient r = new MessageRecipient();
                    r.setMessage(msg);
                    r.setRecipientType(RecipientType.TENANT);
                    r.setTenant(t);
                    recipientRepo.save(r);
                    created++;
                }
            } else if (msg.getAudience() == BroadcastMessage.Audience.BUILDING_TENANTS) {
                var properties = propertyRepo.findAll().stream()
                        .filter(p -> p.getAddress().equals(msg.getBuildingAddress())).toList();
                for (Property prop : properties) {
                    for (Tenant t : tenantRepo.findByIsActiveTrueAndPropertyId(prop.getId())) {
                        MessageRecipient r = new MessageRecipient();
                        r.setMessage(msg);
                        r.setRecipientType(RecipientType.TENANT);
                        r.setTenant(t);
                        recipientRepo.save(r);
                        created++;
                    }
                }
            } else if (msg.getAudience() == BroadcastMessage.Audience.ALL_EMPLOYEES) {
                for (Employee e : employeeRepo.findByIsActiveTrue()) {
                    MessageRecipient r = new MessageRecipient();
                    r.setMessage(msg);
                    r.setRecipientType(RecipientType.EMPLOYEE);
                    r.setEmployee(e);
                    recipientRepo.save(r);
                    created++;
                }
            }

            msg.setIsSent(true);
            msg.setSentAt(LocalDateTime.now());
            broadcastRepo.update(msg);

            return HttpResponse.ok(Map.of(
                    "detail", "Message sent to " + created + " recipient(s).",
                    "recipient_count", created));
        }).orElse(HttpResponse.notFound());
    }

    @Post("/broadcasts/{id}/mark-read/{recipientId}")
    @Transactional
    public HttpResponse<?> markRead(Long id, Long recipientId) {
        return recipientRepo.findById(recipientId).map(r -> {
            if (!r.getIsRead()) {
                r.setIsRead(true);
                r.setReadAt(LocalDateTime.now());
                recipientRepo.update(r);
            }
            return HttpResponse.ok(Map.of("detail", "Marked as read."));
        }).orElse(HttpResponse.notFound());
    }

    @Post("/broadcasts/{id}/mark-whatsapp-sent/{recipientId}")
    @Transactional
    public HttpResponse<?> markWhatsappSent(Long id, Long recipientId) {
        return recipientRepo.findById(recipientId).map(r -> {
            if (r.getWhatsappStatus() != WhatsAppStatus.SENT) {
                r.setWhatsappStatus(WhatsAppStatus.SENT);
                r.setWhatsappSentAt(LocalDateTime.now());
                recipientRepo.update(r);
            }
            return HttpResponse.ok(Map.of("detail", "Marked as WhatsApp sent."));
        }).orElse(HttpResponse.notFound());
    }

    @Get("/building-addresses/")
    public List<String> buildingAddresses() {
        return propertyRepo.findDistinctAddresses();
    }
}
