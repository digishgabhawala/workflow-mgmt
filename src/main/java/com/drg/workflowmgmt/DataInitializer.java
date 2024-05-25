package com.drg.workflowmgmt;

import com.drg.workflowmgmt.usermgmt.*;
import com.drg.workflowmgmt.workflow.Job;
import com.drg.workflowmgmt.workflow.JobService;
import com.drg.workflowmgmt.workflow.JobState;
import com.drg.workflowmgmt.order.Audit;
import com.drg.workflowmgmt.order.Order;
import com.drg.workflowmgmt.order.OrderService;
import com.drg.workflowmgmt.order.OwnerDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;

@Configuration
public class DataInitializer {

    @Autowired
    private JobService jobService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserDetailsService userDetailsService;


    @Autowired
    private UserService userService;

    @Bean
    @Transactional
    public ApplicationRunner initializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            initializeData(userRepository, roleRepository, passwordEncoder);
            JobsInitializer.initJobs(jobService,userService);
            initOrders();
        };
    }

    private void initJobs() {
        // Create sample JobStates
        JobState startState = new JobState();
        startState.setName("Start");
        startState.setRoles(Arrays.asList("ROLE_ADMIN"));
        startState.setEstimate(LocalTime.of(1, 0)); // 1 hour

        JobState endState = new JobState();
        endState.setName("End");
        endState.setRoles(Arrays.asList("ROLE_USER"));
        endState.setEstimate(LocalTime.of(1, 30)); // 1 hour 30 minutes

        // Create additional JobStates
        JobState jobState1 = new JobState();
        jobState1.setName("Pending");
        jobState1.setRoles(Arrays.asList("ROLE_ADMIN", "ROLE_USER"));
        jobState1.setEstimate(LocalTime.of(2, 30)); // 2 hours 30 minutes

        JobState jobState2 = new JobState();
        jobState2.setName("Completed");
        jobState2.setRoles(Arrays.asList("ROLE_USER", "ROLE_drg"));
        jobState2.setEstimate(LocalTime.of(1, 0)); // 1 hour

        // Save JobStates
        startState = jobService.createJobState(startState);
        endState = jobService.createJobState(endState);
        jobState1 = jobService.createJobState(jobState1);
        jobState2 = jobService.createJobState(jobState2);

        // Create sample Job
        Job job = new Job();
        job.setName("Sample Job");

        // Save Job with startState and endState
        Job createdJob = jobService.createJob(job, startState, endState);

        if (createdJob != null) {
            // Add additional JobStates to Job
            jobService.addJobStateToJob(createdJob.getId(), jobState1);
            jobService.addJobStateToJob(createdJob.getId(), jobState2);
        }
    }


    public void initializeData(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        // Create roles
        Role adminRole = new Role();
        adminRole.setName("ROLE_ADMIN");
        Role customerRole = new Role();
        customerRole.setName("ROLE_CUSTOMER");
        Role waiterRole = new Role();
        waiterRole.setName("ROLE_WAITER");
        Role cookRole = new Role();
        cookRole.setName("ROLE_COOK");
        Role billerRole = new Role();
        billerRole.setName("ROLE_BILLER");

        // Save roles
        roleRepository.saveAll(Arrays.asList(adminRole, customerRole, waiterRole, cookRole, billerRole));

        // Retrieve roles to ensure they are managed by the current session
        Role adminRoleFromDb = roleRepository.findByName("ROLE_ADMIN").orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
        Role customerRoleFromDb = roleRepository.findByName("ROLE_CUSTOMER").orElseThrow(() -> new RuntimeException("ROLE_CUSTOMER not found"));
        Role waiterRoleFromDb = roleRepository.findByName("ROLE_WAITER").orElseThrow(() -> new RuntimeException("ROLE_WAITER not found"));
        Role cookRoleFromDb = roleRepository.findByName("ROLE_COOK").orElseThrow(() -> new RuntimeException("ROLE_COOK not found"));
        Role billerRoleFromDb = roleRepository.findByName("ROLE_BILLER").orElseThrow(() -> new RuntimeException("ROLE_BILLER not found"));

        // Create users with managed roles
        createUser(userRepository, passwordEncoder, "admin", adminRoleFromDb);
        createUser(userRepository, passwordEncoder, "customer", customerRoleFromDb);
        createUser(userRepository, passwordEncoder, "waiter", waiterRoleFromDb);
        createUser(userRepository, passwordEncoder, "cook", cookRoleFromDb);
        createUser(userRepository, passwordEncoder, "biller", billerRoleFromDb);
    }
    private void createUser(UserRepository userRepository, PasswordEncoder passwordEncoder, String username, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(username+"_"+"drg"));
        user.setRoles(Set.of(role));
        userRepository.save(user);
    }
    private void setSecurityContext(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    private void initOrders() {
        List<Job> jobs = jobService.getAllJobs();
        List<JobState> jobStates = jobService.getAllJobStates();
        List<User> users = userService.getAllUsers();

        if (!jobs.isEmpty() && !jobStates.isEmpty() && !users.isEmpty()) {
            // Simulate a logged-in user
            User loggedInUser = users.get(0); // Use the first user for initialization
            setSecurityContext(loggedInUser);

            // Create sample Order
            Order order = new Order();
            order.setOrderType(jobs.get(0)); // Assuming the first job is the type
            order.setCurrentState(jobStates.get(0)); // Assuming the first state as the initial state

            // Owner details
            OwnerDetails ownerDetails = new OwnerDetails();
            ownerDetails.setOwnerName("John Doe");
            ownerDetails.setOwnerAddress("123 Main St");
            ownerDetails.setOwnerEmail("john.doe@example.com");
            ownerDetails.setOwnerMobile("1234567890");
            order.setOwnerDetails(ownerDetails);

            order.setPriority(1); // Higher number means more priority
            order.setNote("This is a sample order");

            // Create and add audit items
            Audit audit = new Audit();
            audit.setUser(loggedInUser);
            audit.setUserRole("ROLE_USER");
            audit.setFromState(jobStates.get(0));
            audit.setToState(jobStates.get(1)); // Assuming the second state as the next state
            audit.setNote("Initial audit item");

            order.setAuditItems(List.of(audit));

            // Save Order
            try {
                orderService.createOrder(order);
            } catch (IllegalArgumentException e) {
                // Handle validation error
                e.printStackTrace();
            }

            // Clear the security context after initialization
            SecurityContextHolder.clearContext();
        }
    }



}
