package com.drg.workflowmgmt.workflow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobStateRepository extends JpaRepository<JobState, Long> {
}
