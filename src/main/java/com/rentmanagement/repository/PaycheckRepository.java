package com.rentmanagement.repository;

import com.rentmanagement.domain.Paycheck;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;
import java.util.List;

@Repository
public interface PaycheckRepository extends JpaRepository<Paycheck, Long> {
    List<Paycheck> findByPayrollRunId(Long payrollRunId);

    List<Paycheck> findByEmployeeId(Long employeeId);

    boolean existsByPayrollRunIdAndEmployeeId(Long payrollRunId, Long employeeId);
}
