package com.drg.workflowmgmt.order;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "archived_audits")
public class ArchivedAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderType;
    private LocalDateTime createdAt;

    @Column(updatable = false)
    private LocalDateTime archivedAt = LocalDateTime.now();

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderType() {
        return orderType;
    }

    public void setOrderType(Long orderType) {
        this.orderType = orderType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }
}
