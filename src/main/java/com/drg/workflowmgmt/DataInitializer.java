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
import com.github.javafaker.Faker;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.TimeUnit;

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

    int ownerDetailsListSize = 10;
    List<OwnerDetails> ownerDetailsList = new ArrayList<>(10);
    Faker faker;

    public DataInitializer() {
        faker = new Faker();
        for (int i =0;i<ownerDetailsListSize;i++){
            // Owner details
            OwnerDetails ownerDetails = new OwnerDetails();
            ownerDetails.setOwnerName(faker.name().fullName());
            ownerDetails.setOwnerAddress(faker.address().fullAddress());
            ownerDetails.setOwnerEmail(faker.internet().emailAddress());
            ownerDetails.setOwnerMobile(faker.phoneNumber().cellPhone());
            ownerDetailsList.add(ownerDetails);
        }

    }

    @Bean
    @Transactional
    public ApplicationRunner initializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            try{
                if( userRepository.count() == 0){
                    initializeData(userRepository, roleRepository, passwordEncoder);
                    JobsInitializer.initJobs(jobService, userService);
                    initTestOrders();
                    initOrders();
                }
            }catch (Exception e){
                e.printStackTrace();
                initializeData(userRepository, roleRepository, passwordEncoder);
                JobsInitializer.initJobs(jobService, userService);
                initTestOrders();
                initOrders();
            }
        };
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
        createUser(userRepository, passwordEncoder, "customer2", customerRoleFromDb);
        createUser(userRepository, passwordEncoder, "customer3", customerRoleFromDb);
        createUser(userRepository, passwordEncoder, "customer4", customerRoleFromDb);
        createUser(userRepository, passwordEncoder, "waiter2", waiterRoleFromDb);
        createUser(userRepository, passwordEncoder, "cook2", cookRoleFromDb);
        createUser(userRepository, passwordEncoder, "biller2", billerRoleFromDb);
    }

    private void createUser(UserRepository userRepository, PasswordEncoder passwordEncoder, String username, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(username + "_" + "pass"));
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
        List<Role> roles = userService.getAllRoles();

        User admin = users.get(0);
//        User customer = users.get(1);
//        User waiter = users.get(2);
//        User cook = users.get(3);
//        User biller  = users.get(4);
        List<User> customers = Arrays.asList(users.get(1),users.get(5),users.get(6),users.get(7));
        List<User> waiters = Arrays.asList(users.get(2),users.get(8));
        List<User> cooks = Arrays.asList(users.get(3),users.get(9));
        List<User> billers = Arrays.asList(users.get(4),users.get(10));
        Job orderType = jobs.get(0);

        JobState startState = jobStates.get(0);
        JobState sittingState = jobStates.get(1);
        JobState orderingState = jobStates.get(2);
        JobState preparingState = jobStates.get(3);
        JobState servingState = jobStates.get(4);
        JobState eatingState = jobStates.get(5);
        JobState billingState = jobStates.get(6);
        JobState endState = jobStates.get(7);


        int startStateMins = 60;
        int sittingStateMins = 30;
        int orderingStateMins = 45;
        int preparingStateMins = 90;
        int serviceStateMins = 45;
        int eatingStateMins = 60;
        int billingStateMins = 15;
        int endStateMins = 30;

        if (!jobs.isEmpty() && !jobStates.isEmpty() && !users.isEmpty()) {

            for(int i=0;i<50;i++){
                setSecurityContext(admin);

                LocalDateTime dt = LocalDateTime.now();

                Date fakeDate = faker.date().past(20,1, TimeUnit.DAYS);
                LocalDateTime ldt = LocalDateTime.ofInstant(fakeDate.toInstant(), ZoneId.systemDefault());
                // Create sample Order
                Order order = createFakeOrder(orderType);
                order.setTimestamp(ldt);
                order.setCurrentState(startState);

                order = orderService.createOrder(order);

                fakeDate = moveToNext(customers,sittingState, startStateMins, fakeDate, order);
                fakeDate = moveToNext(customers, orderingState, orderingStateMins, fakeDate, order);
                fakeDate = moveToNext(waiters,preparingState, preparingStateMins, fakeDate, order);
                fakeDate = moveToNext(cooks,servingState, serviceStateMins, fakeDate, order);
                fakeDate = moveToNext(waiters,eatingState, eatingStateMins, fakeDate, order);
                fakeDate = moveToNext(customers,billingState, billingStateMins, fakeDate, order);
                moveToNext(billers,endState, endStateMins, fakeDate, order);
            }
            // Clear the security context after initialization
            SecurityContextHolder.clearContext();
        }
    }

    private Date moveToNext(List<User> users, JobState state, int stateTimeInMins,  Date earlierDate, Order order) {
        User user = users.get(faker.number().numberBetween(0,users.size()));
        LocalDateTime ldt;
        int bufferMins = 10;
        setSecurityContext(user);
        orderService.assignOrderToMe(order.getId());
        Date newDate = faker.date().future(stateTimeInMins + bufferMins,TimeUnit.MINUTES, earlierDate);
        ldt = LocalDateTime.ofInstant(newDate.toInstant(), ZoneId.systemDefault());
        orderService.moveToState(order.getId(), state.getId(),ldt);
        return newDate;
    }

    private void initTestOrders() {
        List<Job> jobs = jobService.getAllJobs();
        List<JobState> jobStates = jobService.getAllJobStates();
        List<User> users = userService.getAllUsers();
        List<Role> roles = userService.getAllRoles();
        JobState startState = jobStates.get(0);
        JobState endState = jobStates.get(7);
        JobState dummy = jobStates.get(8);

        Job orderType = jobs.get(1);

        if (!jobs.isEmpty() && !jobStates.isEmpty() && !users.isEmpty()) {
            // Simulate a logged-in user
            User loggedInUser = userService.findByUsername("admin").get();
            setSecurityContext(loggedInUser);
            // Create sample Order
            for(int i = 0; i< 10;i++){
                Order order = createFakeOrder(orderType);
                Date fakeDate = faker.date().past(20,1, TimeUnit.DAYS);
                LocalDateTime ldt = LocalDateTime.ofInstant(fakeDate.toInstant(), ZoneId.systemDefault());
                order.setTimestamp(ldt);

                order = orderService.createOrder(order);
                List<User> admins = Arrays.asList(loggedInUser);

                fakeDate = moveToNext(admins, dummy, 60, fakeDate, order);
                moveToNext(admins, endState, 30, fakeDate, order);
            }
            // Clear the security context after initialization
            SecurityContextHolder.clearContext();
        }
    }

    private Order createFakeOrder(Job orderType){
        Faker faker = new Faker();
        Order order = new Order();
        order.setOrderType(orderType); // Assuming the first job is the type

        order.setOwnerDetails(ownerDetailsList.get(faker.number().numberBetween(0,9)));

        order.setPriority(faker.number().numberBetween(1, 4)); // Random priority between 1 and 10
        order.setAmount(faker.number().randomDouble(0, 1, 100)); // Random amount between 1 and 1000 with 2 decimal places
        order.setNote(faker.lorem().sentence()); // Random lorem sentence for note
        return order;
    }



}
