package com.drg.workflowmgmt.usermgmt;

import jakarta.persistence.Column;

import java.util.List;
import java.util.Set;

public class UserDto {
    private Long id;
    private String username;

    private Set<String> roles;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
