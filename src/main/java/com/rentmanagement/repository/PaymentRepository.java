package com.rentmanagement.repository;

import com.rentmanagement.domain.Payment;
import com.rentmanagement.domain.Payment.PaymentStatus;
import com.rentmanagement.domain.Payment.PaymentType;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;
import io.micronaut.data.annotation.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByStatusIn(List<PaymentStatus> statuses);

    List<Payment> findByTenantId(Long tenantId);

    Optional<Payment> findByTenantIdAndStatusAndPaymentTypeAndDateDue(
            Long tenantId, PaymentStatus status, PaymentType paymentType, LocalDate dateDue);

    Optional<Payment> findFirstByTenantIdAndPaymentTypeOrderByDateDueDesc(
            Long tenantId, PaymentType paymentType);

    boolean existsByTenantIdAndPaymentTypeAndDateDue(
            Long tenantId, PaymentType paymentType, LocalDate dateDue);

    @Query("SELECT p FROM Payment p WHERE p.status = 'PAID' AND YEAR(p.datePaid) = :year AND MONTH(p.datePaid) = :month")
    List<Payment> findPaidByYearAndMonth(int year, int month);

    @Query("SELECT p FROM Payment p WHERE p.status IN ('PENDING', 'LATE') AND p.dateDue >= :fromDate ORDER BY p.dateDue ASC")
    List<Payment> findUpcomingDue(LocalDate fromDate);

    @Query("SELECT p FROM Payment p JOIN FETCH p.tenant t LEFT JOIN FETCH t.property ORDER BY p.createdAt DESC")
    List<Payment> findAllWithTenantAndProperty();

    @Query("SELECT p FROM Payment p JOIN FETCH p.tenant t LEFT JOIN FETCH t.property ORDER BY p.dateDue DESC")
    List<Payment> findAllOrderByDateDueDesc();
}
