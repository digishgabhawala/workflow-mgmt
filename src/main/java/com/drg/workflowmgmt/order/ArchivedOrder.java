package com.drg.workflowmgmt.order;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "archived_orders")
public class ArchivedOrder {
    @Id
    private Long id;

    private String orderType;
    private String currentState;
    private String note;
    @Embedded
    private OwnerDetails ownerDetails;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<ArchivedAudit> auditItems;

    private Double amount; // New field for amount

    private Integer priority;

    @Column(updatable = false)
    private LocalDateTime archivedAt = LocalDateTime.now();

    @Column(name = "timestamp")
    private LocalDateTime creationDate; // New field for timestamp

    // Getters and setters


    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getCurrentState() {
        return currentState;
    }

    public void setCurrentState(String currentState) {
        this.currentState = currentState;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }


    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }

    public List<ArchivedAudit> getAuditItems() {
        return auditItems;
    }

    public void setAuditItems(List<ArchivedAudit> auditItems) {
        this.auditItems = auditItems;
    }

    public OwnerDetails getOwnerDetails() {
        return ownerDetails;
    }

    public void setOwnerDetails(OwnerDetails ownerDetails) {
        this.ownerDetails = ownerDetails;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
}
