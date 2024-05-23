package com.drg.workflowmgmt.workflow;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalTime;
import java.util.List;

@Entity
public class JobState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ElementCollection
    private List<String> roles;

    private LocalTime estimate;

    // Constructors, getters, setters

    public JobState() {}

    public JobState(String name, List<String> roles, LocalTime estimate) {
        this.name = name;
        this.roles = roles;
        this.estimate = estimate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public LocalTime getEstimate() {
        return estimate;
    }

    public void setEstimate(LocalTime estimate) {
        this.estimate = estimate;
    }
}
