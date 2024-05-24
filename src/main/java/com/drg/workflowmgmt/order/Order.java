package com.drg.workflowmgmt.order;

import com.drg.workflowmgmt.usermgmt.User;
import com.drg.workflowmgmt.workflow.Job;
import com.drg.workflowmgmt.workflow.JobState;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job orderType;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<Audit> auditItems;

    @ManyToOne
    @JoinColumn(name = "current_state_id", nullable = false)
    private JobState currentState;

    @ManyToOne
    @JoinColumn(name = "current_user_id")
    private User currentUser;

    @Embedded
    private OwnerDetails ownerDetails;

    private Integer priority;

    private String note;

    @Column(name = "timestamp")
    private LocalDateTime timestamp; // New field for timestamp

    public Order() {
        this.timestamp = LocalDateTime.now();
    }

    // Getters and setters
    // Constructor

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getOrderType() {
        return orderType;
    }

    public void setOrderType(Job orderType) {
        this.orderType = orderType;
    }

    public List<Audit> getAuditItems() {
        return auditItems;
    }

    public void setAuditItems(List<Audit> auditItems) {
        this.auditItems = auditItems;
    }

    public JobState getCurrentState() {
        return currentState;
    }

    public void setCurrentState(JobState currentState) {
        this.currentState = currentState;
    }

    public User getCurrentUser() {
        return currentUser;
    }

    public void setCurrentUser(User currentUser) {
        this.currentUser = currentUser;
    }

    public OwnerDetails getOwnerDetails() {
        return ownerDetails;
    }

    public void setOwnerDetails(OwnerDetails ownerDetails) {
        this.ownerDetails = ownerDetails;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }


}

