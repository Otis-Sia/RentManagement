package com.rentmanagement.repository;

import com.rentmanagement.domain.PayrollRun;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {
}
