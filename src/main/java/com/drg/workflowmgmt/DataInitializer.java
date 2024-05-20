package com.drg.workflowmgmt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if users already exist in the database
        if (userRepository.count() == 0) {
            // Create users
            User user1 = new User();
            user1.setUsername("user1");
            user1.setPassword(passwordEncoder.encode("password1")); // Encrypt password
            user1.setEnabled(true);
            userRepository.save(user1);

            User user2 = new User();
            user2.setUsername("drg");
            user2.setPassword(passwordEncoder.encode("drg")); // Encrypt password
            user2.setEnabled(true);
            userRepository.save(user2);

            // Add more users as needed
        }
    }
}
