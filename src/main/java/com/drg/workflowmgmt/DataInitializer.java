package com.drg.workflowmgmt;
import com.drg.workflowmgmt.usermgmt.Role;
import com.drg.workflowmgmt.usermgmt.RoleRepository;
import com.drg.workflowmgmt.usermgmt.User;
import com.drg.workflowmgmt.usermgmt.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public ApplicationRunner initializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> initializeData(userRepository, roleRepository, passwordEncoder);
    }

    @Transactional
    public void initializeData(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        // Create roles
        Role adminRole = new Role();
        adminRole.setName("ROLE_ADMIN");
        Role userRole = new Role();
        userRole.setName("ROLE_USER");
        Role drgRole = new Role();
        drgRole.setName("ROLE_drg");

        // Save roles
        roleRepository.save(adminRole);
        roleRepository.save(userRole);
        roleRepository.save(drgRole);

        // Retrieve roles to ensure they are managed by the current session
        Role adminRoleFromDb = roleRepository.findByName("ROLE_ADMIN").orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
        Role userRoleFromDb = roleRepository.findByName("ROLE_USER").orElseThrow(() -> new RuntimeException("ROLE_USER not found"));
        Role drgRoleFromDb = roleRepository.findByName("ROLE_drg").orElseThrow(() -> new RuntimeException("ROLE_drg not found"));

        // Create users with managed roles
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("adminpass"));
        admin.setRoles(Set.of(adminRoleFromDb, userRoleFromDb,drgRoleFromDb));
        userRepository.save(admin);

        User user = new User();
        user.setUsername("drg");
        user.setPassword(passwordEncoder.encode("drg"));
        user.setRoles(Set.of(drgRoleFromDb));
        userRepository.save(user);

        User user1 = new User();
        user1.setUsername("u");
        user1.setPassword(passwordEncoder.encode("u"));
        user1.setRoles(Set.of(userRoleFromDb));
        userRepository.save(user1);
    }
}
