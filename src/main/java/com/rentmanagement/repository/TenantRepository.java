package com.rentmanagement.repository;

import com.rentmanagement.domain.Tenant;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;
import java.util.List;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    List<Tenant> findByIsActiveTrue();

    List<Tenant> findByPropertyId(Long propertyId);

    List<Tenant> findByIsActiveTrueAndPropertyId(Long propertyId);
}
