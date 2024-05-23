package com.drg.workflowmgmt.workflow;
import jakarta.persistence.*;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_jobstate",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "jobstate_id"))
    private List<JobState> jobStates;
    @ElementCollection
    private List<Long> fromJobStateIds = new ArrayList<>();

    @ElementCollection
    private List<Long> toJobStateIds = new ArrayList<>();
    // Constructors, getters, setters

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

    public List<JobState> getJobStates() {
        return jobStates;
    }

    public void setJobStates(List<JobState> jobStates) {
        this.jobStates = jobStates;
    }
    public List<Long> getFromJobStateIds() {
        return fromJobStateIds;
    }

    public void setFromJobStateIds(List<Long> fromJobStateIds) {
        this.fromJobStateIds = fromJobStateIds;
    }

    public List<Long> getToJobStateIds() {
        return toJobStateIds;
    }

    public void setToJobStateIds(List<Long> toJobStateIds) {
        this.toJobStateIds = toJobStateIds;
    }
}