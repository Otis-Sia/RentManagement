package com.rentmanagement.repository;

import com.rentmanagement.domain.LeaseDocument;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;

@Repository
public interface LeaseDocumentRepository extends JpaRepository<LeaseDocument, Long> {
}
