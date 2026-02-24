package com.rentmanagement.repository;

import com.rentmanagement.domain.BroadcastMessage;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;

@Repository
public interface BroadcastMessageRepository extends JpaRepository<BroadcastMessage, Long> {
}
