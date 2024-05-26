package com.drg.workflowmgmt.order;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArchivedAuditRepository extends JpaRepository<ArchivedAudit, Long> {
}
