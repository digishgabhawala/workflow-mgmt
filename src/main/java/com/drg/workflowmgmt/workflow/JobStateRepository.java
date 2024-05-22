package com.drg.workflowmgmt.workflow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobStateRepository extends JpaRepository<JobState, Long> {
    List<JobState> findByNameContaining(String name);

}
