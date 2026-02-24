package com.rentmanagement.controller;

import com.rentmanagement.domain.MaintenanceRequest;
import com.rentmanagement.domain.MaintenanceRequest;
import com.rentmanagement.domain.MaintenanceRequest.Priority;
import com.rentmanagement.repository.MaintenanceRequestRepository;
import com.rentmanagement.repository.TenantRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Controller("/api/maintenance")
public class MaintenanceController {

    @Inject
    MaintenanceRequestRepository maintenanceRepo;
    @Inject
    TenantRepository tenantRepository;

    @Get("/")
    public List<MaintenanceRequest> list() {
        return maintenanceRepo.findAll();
    }

    @Get("/{id}")
    public HttpResponse<MaintenanceRequest> get(Long id) {
        return maintenanceRepo.findById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Post("/")
    @Transactional
    public HttpResponse<MaintenanceRequest> create(@Body Map<String, Object> body) {
        MaintenanceRequest req = new MaintenanceRequest();
        mapBody(req, body);
        return HttpResponse.created(maintenanceRepo.save(req));
    }

    @Put("/{id}")
    @Transactional
    public HttpResponse<MaintenanceRequest> update(Long id, @Body Map<String, Object> body) {
        return maintenanceRepo.findById(id)
                .map(existing -> {
                    mapBody(existing, body);
                    return HttpResponse.ok(maintenanceRepo.update(existing));
                })
                .orElse(HttpResponse.notFound());
    }

    @Patch("/{id}")
    @Transactional
    public HttpResponse<MaintenanceRequest> patch(Long id, @Body Map<String, Object> body) {
        return update(id, body);
    }

    @Delete("/{id}")
    @Transactional
    public HttpResponse<?> delete(Long id) {
        if (maintenanceRepo.existsById(id)) {
            maintenanceRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    private void mapBody(MaintenanceRequest req, Map<String, Object> body) {
        if (body.containsKey("tenant")) {
            Long tid = Long.valueOf(body.get("tenant").toString());
            tenantRepository.findById(tid).ifPresent(req::setTenant);
        }
        if (body.containsKey("title"))
            req.setTitle((String) body.get("title"));
        if (body.containsKey("description"))
            req.setDescription((String) body.get("description"));
        if (body.containsKey("priority"))
            req.setPriority(Priority.valueOf((String) body.get("priority")));
        if (body.containsKey("status"))
            req.setStatus(MaintenanceRequest.Status.valueOf((String) body.get("status")));
        if (body.containsKey("cost") && body.get("cost") != null)
            req.setCost(new BigDecimal(body.get("cost").toString()));
    }
}
