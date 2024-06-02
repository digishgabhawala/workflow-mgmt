package com.drg.workflowmgmt;

import com.drg.workflowmgmt.usermgmt.Role;
import com.drg.workflowmgmt.usermgmt.RoleRepository;
import com.drg.workflowmgmt.usermgmt.UserService;
import com.drg.workflowmgmt.workflow.Job;
import com.drg.workflowmgmt.workflow.JobService;
import com.drg.workflowmgmt.workflow.JobState;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class JobsInitializer {


    public static void initJobs(JobService jobService, UserService userService) {
        // Create sample JobStates
        List<Role> roles = userService.getAllRoles();
        // Retrieve roles to ensure they are managed by the current session
//        Role adminRoleFromDb = roleRepository.findByName("ROLE_ADMIN").orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
//        Role customerRoleFromDb = roleRepository.findByName("ROLE_CUSTOMER").orElseThrow(() -> new RuntimeException("ROLE_CUSTOMER not found"));
//        Role waiterRoleFromDb = roleRepository.findByName("ROLE_WAITER").orElseThrow(() -> new RuntimeException("ROLE_WAITER not found"));
//        Role cookRoleFromDb = roleRepository.findByName("ROLE_COOK").orElseThrow(() -> new RuntimeException("ROLE_COOK not found"));
//        Role billerRoleFromDb = roleRepository.findByName("ROLE_BILLER").orElseThrow(() -> new RuntimeException("ROLE_BILLER not found"));


        JobState startState = createJobState("Start", Arrays.asList("ROLE_ADMIN", "ROLE_CUSTOMER"), LocalTime.of(1, 0));
        JobState sittingState = createJobState("Sitting", Arrays.asList("ROLE_CUSTOMER"), LocalTime.of(0, 30));
        JobState orderingState = createJobState("Ordering", Arrays.asList("ROLE_WAITER"), LocalTime.of(0, 45));
        JobState preparingState = createJobState("Preparing", Arrays.asList("ROLE_COOK"), LocalTime.of(1, 30));
        JobState servingState = createJobState("Serving", Arrays.asList("ROLE_WAITER"), LocalTime.of(0, 45));
        JobState eatingState = createJobState("Eating", Arrays.asList("ROLE_CUSTOMER"), LocalTime.of(1, 0));
        JobState billingState = createJobState("Billing", Arrays.asList("ROLE_BILLER"), LocalTime.of(0, 15));
        JobState endState = createJobState("End", Arrays.asList("ROLE_BILLER","ROLE_ADMIN"), LocalTime.of(0, 30));
        JobState dummy = createJobState("Dummy", Arrays.asList("ROLE_ADMIN"), LocalTime.of(0, 30));

        // Save JobStates
        startState = jobService.createJobState(startState);
        sittingState = jobService.createJobState(sittingState);
        orderingState = jobService.createJobState(orderingState);
        preparingState = jobService.createJobState(preparingState);
        servingState = jobService.createJobState(servingState);
        eatingState = jobService.createJobState(eatingState);
        billingState = jobService.createJobState(billingState);
        endState = jobService.createJobState(endState);
        dummy = jobService.createJobState(dummy);

        // Create sample Job
        Job job = new Job();
        job.setName("Restaurant Job");

        Job testJob = new Job();
        testJob.setName("Quick Test Job");

        // Save Job with all states
        Job createdJob = jobService.createJob(job, startState, endState);
        Job createdTestJob = jobService.createJob(testJob,startState,endState);

        JobState[] statesToAdd = new JobState[]{sittingState, orderingState, preparingState, servingState, eatingState, billingState};
        for (JobState jobState : statesToAdd){
            jobService.addJobStateToJob(createdJob.getId(),jobState);
        }

        if (createdJob != null) {
            // Add transitions
            addTransition(jobService, createdJob, startState, sittingState);
            addTransition(jobService, createdJob, sittingState, orderingState);
            addTransition(jobService, createdJob, orderingState, preparingState);
            addTransition(jobService, createdJob, preparingState, servingState);
            addTransition(jobService, createdJob, servingState, eatingState);
            addTransition(jobService, createdJob, eatingState, billingState);
            addTransition(jobService, createdJob, billingState, endState);
        }
        jobService.addJobStateToJob(createdTestJob.getId(),dummy);
        addTransition(jobService,createdTestJob,startState,dummy);
        addTransition(jobService,createdTestJob,dummy,endState);
    }

    private static JobState createJobState(String name, List<String> roles, LocalTime estimate) {
        JobState jobState = new JobState();
        jobState.setName(name);
        jobState.setRoles(roles);
        jobState.setEstimate(estimate);
        return jobState;
    }

    private static void addTransition(JobService jobService, Job job, JobState fromState, JobState toState) {
        jobService.addTransition(job.getId(), fromState.getId(), toState.getId());
    }
}
