package com.drg.workflowmgmt.order;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArchivedOrderRepository extends JpaRepository<ArchivedOrder, Long> {
}
