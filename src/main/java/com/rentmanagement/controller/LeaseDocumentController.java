package com.rentmanagement.controller;

import com.rentmanagement.domain.LeaseDocument;
import com.rentmanagement.repository.LeaseDocumentRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;

@Controller("/api/leases")
public class LeaseDocumentController {

    @Inject
    LeaseDocumentRepository leaseRepo;

    @Get("/")
    public List<LeaseDocument> list() {
        return leaseRepo.findAll();
    }

    @Get("/{id}")
    public HttpResponse<LeaseDocument> get(Long id) {
        return leaseRepo.findById(id).map(HttpResponse::ok).orElse(HttpResponse.notFound());
    }

    @Post("/")
    @Transactional
    public HttpResponse<LeaseDocument> create(@Body LeaseDocument doc) {
        return HttpResponse.created(leaseRepo.save(doc));
    }

    @Delete("/{id}")
    @Transactional
    public HttpResponse<?> delete(Long id) {
        if (leaseRepo.existsById(id)) {
            leaseRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }
}
