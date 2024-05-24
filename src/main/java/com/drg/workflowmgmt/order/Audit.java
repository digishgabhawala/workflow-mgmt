package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.usermgmt.User;
import com.drg.workflowmgmt.workflow.JobState;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String userRole;

    @ManyToOne
    @JoinColumn(name = "from_state_id")
    private JobState fromState;

    @ManyToOne
    @JoinColumn(name = "to_state_id")
    private JobState toState;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    public Audit() {
        this.timestamp = LocalDateTime.now();
    }

    private String note;

    // Getters and setters
    // Constructor

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public JobState getFromState() {
        return fromState;
    }

    public void setFromState(JobState fromState) {
        this.fromState = fromState;
    }

    public JobState getToState() {
        return toState;
    }

    public void setToState(JobState toState) {
        this.toState = toState;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
