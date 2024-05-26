package com.drg.workflowmgmt.usermgmt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User getUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User removeRoleFromUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.getRoles().removeIf(role -> role.getId().equals(roleId));
            user = userRepository.save(user);
        }
        return user;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role createRole(Role role)
    {
        Role createdRole =  roleRepository.save(role);
        User admin = userRepository.findByUsername("admin").get();
        addRoleToUser(admin.getId(),createdRole.getId());
        return createdRole;
    }

    public Role getRole(Long id) {
        return roleRepository.findById(id).orElse(null);
    }
    public User addRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId).orElse(null);
        Role role = roleRepository.findById(roleId).orElse(null);
        if (user != null && role != null) {
            user.getRoles().add(role);
            return userRepository.save(user);
        }
        return null;
    }


    public List<UserWithRolesDto> getAllUsersWithRoles() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    private UserWithRolesDto mapToDto(User user) {
        UserWithRolesDto userDto = new UserWithRolesDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setRoles(new ArrayList<>(user.getRoles()));
        return userDto;
    }

    public Optional<User> findByUsername(String loggedInUsername) {
        return userRepository.findByUsername(loggedInUsername);
    }

    public User getCurrentUser(){
        org.springframework.security.core.userdetails.User user = (org.springframework.security.core.userdetails.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser =  userRepository.findByUsername(user.getUsername()).get();
        return currentUser;
    }

    // Add this method to UserService
    public boolean deleteUser(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            userRepository.deleteById(userId);
            return true;
        }
        return false;
    }


    public class UserWithRolesDto {
        private Long id;
        private String username;
        private List<Role> roles; // List of role names associated with the user

        // Constructors, getters, and setters
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

        public List<Role> getRoles() {
            return roles;
        }

        public void setRoles(List<Role> roles) {
            this.roles = roles;
        }

    }
}
