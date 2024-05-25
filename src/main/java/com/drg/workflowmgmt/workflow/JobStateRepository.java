package com.drg.workflowmgmt.workflow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobStateRepository extends JpaRepository<JobState, Long> {
    List<JobState> findByNameContaining(String name);
    @Query("SELECT js.id FROM JobState js WHERE :role IN elements(js.roles)")
    List<Long> findStateIdsByRole(@Param("role") String role);
    @Query("SELECT DISTINCT js.id FROM JobState js JOIN js.roles r WHERE r IN :roles")
    List<Long> findStateIdsByRoles(@Param("roles") List<String> roles);}
