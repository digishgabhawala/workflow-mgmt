package com.drg.workflowmgmt.order;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "archived_audits")
public class ArchivedAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long fromStateId;
    private Long toStateId;

    public Long getFromStateId() {
        return fromStateId;
    }

    public void setFromStateId(Long fromStateId) {
        this.fromStateId = fromStateId;
    }

    public Long getToStateId() {
        return toStateId;
    }

    public void setToStateId(Long toStateId) {
        this.toStateId = toStateId;
    }

    @Column(updatable = false)
    private LocalDateTime archivedAt = LocalDateTime.now();

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(LocalDateTime archivedAt) {
        this.archivedAt = archivedAt;
    }
}
