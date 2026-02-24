package com.rentmanagement.repository;

import com.rentmanagement.domain.MaintenanceRequest;
import com.rentmanagement.domain.MaintenanceRequest.Status;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;
import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByStatus(Status status);

    List<MaintenanceRequest> findByStatusIn(List<Status> statuses);

    List<MaintenanceRequest> findByTenantId(Long tenantId);

    long countByStatus(Status status);
}
