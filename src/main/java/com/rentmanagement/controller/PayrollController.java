package com.rentmanagement.controller;

import com.rentmanagement.domain.*;
import com.rentmanagement.domain.PayrollRun.RunStatus;
import com.rentmanagement.repository.*;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Controller("/api/payroll")
public class PayrollController {

    @Inject
    EmployeeRepository employeeRepo;
    @Inject
    PayrollRunRepository payrollRunRepo;
    @Inject
    PaycheckRepository paycheckRepo;

    // ========== Employees ==========
    @Get("/employees/")
    public List<Employee> listEmployees(@QueryValue Optional<String> active) {
        if (active.isPresent() && "true".equals(active.get())) {
            return employeeRepo.findByIsActiveTrue();
        }
        return employeeRepo.findAll();
    }

    @Get("/employees/{id}")
    public HttpResponse<Employee> getEmployee(Long id) {
        return employeeRepo.findById(id).map(HttpResponse::ok).orElse(HttpResponse.notFound());
    }

    @Post("/employees/")
    @Transactional
    public HttpResponse<Employee> createEmployee(@Body Map<String, Object> body) {
        Employee emp = new Employee();
        mapEmployeeBody(emp, body);
        return HttpResponse.created(employeeRepo.save(emp));
    }

    @Put("/employees/{id}")
    @Transactional
    public HttpResponse<Employee> updateEmployee(Long id, @Body Map<String, Object> body) {
        return employeeRepo.findById(id).map(existing -> {
            mapEmployeeBody(existing, body);
            return HttpResponse.ok(employeeRepo.update(existing));
        }).orElse(HttpResponse.notFound());
    }

    @Patch("/employees/{id}")
    @Transactional
    public HttpResponse<Employee> patchEmployee(Long id, @Body Map<String, Object> body) {
        return updateEmployee(id, body);
    }

    @Delete("/employees/{id}")
    @Transactional
    public HttpResponse<?> deleteEmployee(Long id) {
        if (employeeRepo.existsById(id)) {
            employeeRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    // ========== Payroll Runs ==========
    @Get("/payroll-runs/")
    public List<PayrollRun> listPayrollRuns() {
        return payrollRunRepo.findAll();
    }

    @Get("/payroll-runs/{id}")
    public HttpResponse<PayrollRun> getPayrollRun(Long id) {
        return payrollRunRepo.findById(id).map(HttpResponse::ok).orElse(HttpResponse.notFound());
    }

    @Post("/payroll-runs/")
    @Transactional
    public HttpResponse<PayrollRun> createPayrollRun(@Body Map<String, Object> body) {
        PayrollRun run = new PayrollRun();
        if (body.containsKey("name"))
            run.setName((String) body.get("name"));
        if (body.containsKey("period_start"))
            run.setPeriodStart(LocalDate.parse((String) body.get("period_start")));
        if (body.containsKey("period_end"))
            run.setPeriodEnd(LocalDate.parse((String) body.get("period_end")));
        if (body.containsKey("pay_date"))
            run.setPayDate(LocalDate.parse((String) body.get("pay_date")));
        if (body.containsKey("notes"))
            run.setNotes((String) body.get("notes"));
        return HttpResponse.created(payrollRunRepo.save(run));
    }

    @Put("/payroll-runs/{id}")
    @Transactional
    public HttpResponse<PayrollRun> updatePayrollRun(Long id, @Body Map<String, Object> body) {
        return payrollRunRepo.findById(id).map(existing -> {
            if (body.containsKey("name"))
                existing.setName((String) body.get("name"));
            if (body.containsKey("notes"))
                existing.setNotes((String) body.get("notes"));
            return HttpResponse.ok(payrollRunRepo.update(existing));
        }).orElse(HttpResponse.notFound());
    }

    @Delete("/payroll-runs/{id}")
    @Transactional
    public HttpResponse<?> deletePayrollRun(Long id) {
        if (payrollRunRepo.existsById(id)) {
            payrollRunRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    @Post("/payroll-runs/{id}/generate_paychecks/")
    @Transactional
    public HttpResponse<?> generatePaychecks(Long id) {
        return payrollRunRepo.findById(id).map(run -> {
            if (run.getStatus() != RunStatus.DRAFT) {
                return HttpResponse.badRequest(Map.of("error", "Can only generate paychecks for DRAFT payroll runs"));
            }
            var activeEmployees = employeeRepo.findByIsActiveTrue();
            int created = 0;
            for (Employee emp : activeEmployees) {
                if (!paycheckRepo.existsByPayrollRunIdAndEmployeeId(run.getId(), emp.getId())) {
                    Paycheck paycheck = new Paycheck();
                    paycheck.setPayrollRun(run);
                    paycheck.setEmployee(emp);
                    paycheck.setGrossPay(emp.getBaseSalary());
                    paycheckRepo.save(paycheck);
                    created++;
                }
            }
            run.setStatus(RunStatus.PROCESSING);
            // Reload paychecks for recalculation
            run.setPaychecks(paycheckRepo.findByPayrollRunId(run.getId()));
            run.recalculateTotals();
            payrollRunRepo.update(run);
            return HttpResponse.ok(Map.of("message", "Generated " + created + " paychecks", "payroll", run));
        }).orElse(HttpResponse.notFound());
    }

    @Post("/payroll-runs/{id}/approve/")
    @Transactional
    public HttpResponse<?> approve(Long id) {
        return payrollRunRepo.findById(id).map(run -> {
            if (run.getStatus() != RunStatus.PROCESSING && run.getStatus() != RunStatus.DRAFT) {
                return HttpResponse.badRequest(Map.of("error", "Can only approve PROCESSING or DRAFT payroll runs"));
            }
            run.setStatus(RunStatus.APPROVED);
            return HttpResponse.ok(payrollRunRepo.update(run));
        }).orElse(HttpResponse.notFound());
    }

    @Post("/payroll-runs/{id}/mark_paid/")
    @Transactional
    public HttpResponse<?> markPaid(Long id) {
        return payrollRunRepo.findById(id).map(run -> {
            if (run.getStatus() != RunStatus.APPROVED) {
                return HttpResponse.badRequest(Map.of("error", "Can only mark APPROVED payroll runs as paid"));
            }
            run.setStatus(RunStatus.PAID);
            return HttpResponse.ok(payrollRunRepo.update(run));
        }).orElse(HttpResponse.notFound());
    }

    // ========== Paychecks ==========
    @Get("/paychecks/")
    public List<Paycheck> listPaychecks(@QueryValue Optional<Long> payroll_run,
            @QueryValue Optional<Long> employee) {
        if (payroll_run.isPresent())
            return paycheckRepo.findByPayrollRunId(payroll_run.get());
        if (employee.isPresent())
            return paycheckRepo.findByEmployeeId(employee.get());
        return paycheckRepo.findAll();
    }

    @Get("/paychecks/{id}")
    public HttpResponse<Paycheck> getPaycheck(Long id) {
        return paycheckRepo.findById(id).map(HttpResponse::ok).orElse(HttpResponse.notFound());
    }

    @Delete("/paychecks/{id}")
    @Transactional
    public HttpResponse<?> deletePaycheck(Long id) {
        if (paycheckRepo.existsById(id)) {
            paycheckRepo.deleteById(id);
            return HttpResponse.noContent();
        }
        return HttpResponse.notFound();
    }

    private void mapEmployeeBody(Employee emp, Map<String, Object> body) {
        if (body.containsKey("first_name"))
            emp.setFirstName((String) body.get("first_name"));
        if (body.containsKey("last_name"))
            emp.setLastName((String) body.get("last_name"));
        if (body.containsKey("email"))
            emp.setEmail((String) body.get("email"));
        if (body.containsKey("phone"))
            emp.setPhone((String) body.get("phone"));
        if (body.containsKey("id_number"))
            emp.setIdNumber((String) body.get("id_number"));
        if (body.containsKey("kra_pin"))
            emp.setKraPin((String) body.get("kra_pin"));
        if (body.containsKey("employment_type"))
            emp.setEmploymentType(Employee.EmploymentType.valueOf((String) body.get("employment_type")));
        if (body.containsKey("job_title"))
            emp.setJobTitle((String) body.get("job_title"));
        if (body.containsKey("department"))
            emp.setDepartment((String) body.get("department"));
        if (body.containsKey("hire_date"))
            emp.setHireDate(LocalDate.parse((String) body.get("hire_date")));
        if (body.containsKey("base_salary"))
            emp.setBaseSalary(new BigDecimal(body.get("base_salary").toString()));
        if (body.containsKey("pay_frequency"))
            emp.setPayFrequency(Employee.PayFrequency.valueOf((String) body.get("pay_frequency")));
        if (body.containsKey("bank_name"))
            emp.setBankName((String) body.get("bank_name"));
        if (body.containsKey("bank_account_number"))
            emp.setBankAccountNumber((String) body.get("bank_account_number"));
        if (body.containsKey("nhif_number"))
            emp.setNhifNumber((String) body.get("nhif_number"));
        if (body.containsKey("nssf_number"))
            emp.setNssfNumber((String) body.get("nssf_number"));
        if (body.containsKey("is_active"))
            emp.setIsActive((Boolean) body.get("is_active"));
    }
}
