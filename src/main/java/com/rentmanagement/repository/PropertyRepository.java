package com.rentmanagement.repository;

import com.rentmanagement.domain.Property;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.jpa.repository.JpaRepository;
import io.micronaut.data.annotation.Query;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Query("SELECT DISTINCT p.address FROM Property p ORDER BY p.address")
    List<String> findDistinctAddresses();
}
