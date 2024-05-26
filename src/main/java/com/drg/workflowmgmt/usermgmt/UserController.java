package com.drg.workflowmgmt.usermgmt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserService.UserWithRolesDto>> getAllUsers() {
        List<UserService.UserWithRolesDto> users = userService.getAllUsersWithRoles();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/{userId}/roles")
    public ResponseEntity<User> addRoleToUser(@PathVariable Long userId, @RequestBody Role role) {
        User updatedUser = userService.addRoleToUser(userId, role.getId());
        if (updatedUser != null) {
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{userId}/removeroles")
    public ResponseEntity<User> removeRoleFromUser(@PathVariable Long userId, @RequestBody Role role) {
        User user = userService.removeRoleFromUser(userId, role.getId());
        return new ResponseEntity<>(user,HttpStatus.OK);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = userService.getAllRoles();
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    @PostMapping("/roles")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        if(!role.getName().contains("ROLE_")){
            role.setName("ROLE_"+role.getName());
        }
        Role createdRole = userService.createRole(role);
        return new ResponseEntity<>(createdRole, HttpStatus.CREATED);
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<Role> getRole(@PathVariable Long id) {
        Role role = userService.getRole(id);
        if (role != null) {
            return new ResponseEntity<>(role, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @GetMapping("/details")
    public ResponseEntity<UserDto> getCurrentUserDetails() {
        User user= userService.getCurrentUser();
        if (user != null) {
            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setUsername(user.getUsername());
            userDto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
            return new ResponseEntity<>(userDto, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    // Add this method to UserController
    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        boolean deleted = userService.deleteUser(userId);
        if (deleted) {
            return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
    }


}
