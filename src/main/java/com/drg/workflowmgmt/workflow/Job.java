package com.drg.workflowmgmt.workflow;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private boolean archived = false;
    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_jobstate",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "jobstate_id"))
    private List<JobState> jobStates = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    private List<Long> fromJobStateIds = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    private List<Long> toJobStateIds = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "start_state_id", nullable = false)
    private JobState startState;

    @ManyToOne
    @JoinColumn(name = "end_state_id", nullable = false)
    private JobState endState;

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

    public JobState getStartState() {
        return startState;
    }

    public void setStartState(JobState startState) {
        this.startState = startState;
    }

    public JobState getEndState() {
        return endState;
    }

    public void setEndState(JobState endState) {
        this.endState = endState;
    }
}
