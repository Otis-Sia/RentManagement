package com.rentmanagement.repository;

import com.rentmanagement.domain.Invoice;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
}
