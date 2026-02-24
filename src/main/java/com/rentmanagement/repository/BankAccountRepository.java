package com.rentmanagement.repository;

import com.rentmanagement.domain.BankAccount;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
}
