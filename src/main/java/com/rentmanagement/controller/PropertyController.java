package com.rentmanagement.controller;

import com.rentmanagement.domain.Property;
import com.rentmanagement.repository.PropertyRepository;
import com.rentmanagement.repository.TenantRepository;
import com.rentmanagement.repository.PaymentRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.*;

@Controller("/api/houses")
public class PropertyController {

    @Inject
    PropertyRepository propertyRepository;
    @Inject
    TenantRepository tenantRepository;
    @Inject
    PaymentRepository paymentRepository;

    @Get("/")
    public List<Property> list() {
        return propertyRepository.findAll();
    }

    @Get("/{id}")
    @Transactional
    public HttpResponse<?> get(Long id) {
        return propertyRepository.findById(id)
                .map(property -> {
                    Map<String, Object> data = new LinkedHashMap<>();
                    data.put("id", property.getId());
                    data.put("house_number", property.getHouseNumber());
                    data.put("address", property.getAddress());
                    data.put("bedrooms", property.getBedrooms());
                    data.put("bathrooms", property.getBathrooms());
                    data.put("square_feet", property.getSquareFeet());
                    data.put("monthly_rent", property.getMonthlyRent());
                    data.put("is_occupied", property.getIsOccupied());
                    data.put("created_at", property.getCreatedAt());
                    data.put("updated_at", property.getUpdatedAt());

                    // Current tenant
                    var tenants = tenantRepository.findByIsActiveTrueAndPropertyId(property.getId());
                    if (!tenants.isEmpty()) {
                        var t = tenants.get(0);
                        Map<String, Object> tenantMap = new LinkedHashMap<>();
                        tenantMap.put("id", t.getId());
                        tenantMap.put("name", t.getName());
                        tenantMap.put("email", t.getEmail());
                        tenantMap.put("phone", t.getPhone());
                        tenantMap.put("rent_amount", t.getRentAmount());
                        tenantMap.put("lease_start", t.getLeaseStart());
                        tenantMap.put("lease_end", t.getLeaseEnd());
                        data.put("current_tenant", tenantMap);
                    } else {
                        data.put("current_tenant", null);
                    }

                    // Tenant history
                    var allTenants = tenantRepository.findByPropertyId(property.getId());
                    List<Map<String, Object>> tenantHistory = allTenants.stream().map(t -> {
                        Map<String, Object> m = new LinkedHashMap<>();
                        m.put("id", t.getId());
                        m.put("name", t.getName());
                        m.put("lease_start", t.getLeaseStart());
                        m.put("lease_end", t.getLeaseEnd());
                        m.put("is_active", t.getIsActive());
                        return m;
                    }).toList();
                    data.put("tenant_history", tenantHistory);

                    return HttpResponse.ok(data);
                })
                .orElse(HttpResponse.notFound());
    }

    @Post("/")
    @Transactional
    public HttpResponse<Property> create(@Body Property property) {
        return HttpResponse.created(propertyRepository.save(property));
    }

    @Put("/{id}")
    @Transactional
    public HttpResponse<Property> update(Long id, @Body Property property) {
        return propertyRepository.findById(id)
                .map(existing -> {
                    existing.setHouseNumber(property.getHouseNumber());
                    existing.setAddress(property.getAddress());
                    existing.setBedrooms(property.getBedrooms());
                    existing.setBathrooms(property.getBathrooms());
                    existing.setSquareFeet(property.getSquareFeet());
                    existing.setMonthlyRent(property.getMonthlyRent());
                    existing.setIsOccupied(property.getIsOccupied());
                    return HttpResponse.ok(propertyRepository.update(existing));
                })
                .orElse(HttpResponse.notFound());
    }

    @Patch("/{id}")
    @Transactional
    public HttpResponse<Property> patch(Long id, @Body Map<String, Object> fields) {
        return propertyRepository.findById(id)
                .map(existing -> {
                    if (fields.containsKey("house_number"))
                        existing.setHouseNumber((String) fields.get("house_number"));
                    if (fields.containsKey("address"))
                        existing.setAddress((String) fields.get("address"));
                    if (fields.containsKey("bedrooms"))
                        existing.setBedrooms((Integer) fields.get("bedrooms"));
                    if (fields.containsKey("bathrooms"))
                        existing.setBathrooms((Integer) fields.get("bathrooms"));
                    if (fields.containsKey("is_occupied"))
                        existing.setIsOccupied((Boolean) fields.get("is_occupied"));
                    return HttpResponse.ok(propertyRepository.update(existing));
                })
                .orElse(HttpResponse.notFound());
    }

    @Delete("/{id}")
    @Transactional
    public HttpResponse<?> delete(Long id) {
        if (propertyRepository.existsById(id)) {
            propertyRepository.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }
}
