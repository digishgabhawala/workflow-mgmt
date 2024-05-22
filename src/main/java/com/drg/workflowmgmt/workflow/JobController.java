package com.drg.workflowmgmt.workflow;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        List<Job> jobs = jobService.getAllJobs();
        return new ResponseEntity<>(jobs, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        Job createdJob = jobService.createJob(job);
        return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable Long id) {
        Job job = jobService.getJob(id);
        if (job != null) {
            return new ResponseEntity<>(job, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{jobId}/jobstates")
    public ResponseEntity<Job> addJobStateToJob(@PathVariable Long jobId, @RequestBody JobState jobState) {
        Job updatedJob = jobService.addJobStateToJob(jobId, jobState);
        return new ResponseEntity<>(updatedJob, HttpStatus.OK);
    }

    @PostMapping("/jobstates")
    public ResponseEntity<JobState> createJobState(@RequestBody JobState jobState) {
        JobState createdJobState = jobService.createJobState(jobState);
        return new ResponseEntity<>(createdJobState, HttpStatus.CREATED);
    }

    @GetMapping("/states")
    public ResponseEntity<List<JobState>> getAllJobStates() {
        List<JobState> jobStates = jobService.getAllJobStates();
        return new ResponseEntity<>(jobStates, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(@RequestParam String jobName) {
        List<Job> jobs = jobService.searchJobsByName(jobName);
        return new ResponseEntity<>(jobs, HttpStatus.OK);
    }

    @GetMapping("/states/search")
    public ResponseEntity<List<JobState>> searchJobStates(@RequestParam String jobStateName) {
        List<JobState> jobStates = jobService.searchJobStatesByName(jobStateName);
        return new ResponseEntity<>(jobStates, HttpStatus.OK);
    }
}
