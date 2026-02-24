package com.rentmanagement.repository;

import com.rentmanagement.domain.FinTransaction;
import com.rentmanagement.domain.FinTransaction.TransactionType;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;
import io.micronaut.data.annotation.Query;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinTransactionRepository extends JpaRepository<FinTransaction, Long> {
    List<FinTransaction> findByTransactionType(TransactionType type);

    List<FinTransaction> findByCategoryIsNull();

    @Query("SELECT t FROM FinTransaction t WHERE t.date >= :start AND t.date <= :end")
    List<FinTransaction> findByDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT t FROM FinTransaction t WHERE t.transactionType = :type AND t.date >= :start AND t.date <= :end")
    List<FinTransaction> findByTypeAndDateBetween(TransactionType type, LocalDate start, LocalDate end);
}
