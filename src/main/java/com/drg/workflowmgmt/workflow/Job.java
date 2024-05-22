package com.drg.workflowmgmt.workflow;
import jakarta.persistence.*;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
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
}