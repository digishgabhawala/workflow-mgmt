package com.drg.workflowmgmt.workflow;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobstates")
public class JobStateController {

    @Autowired
    private JobService jobService;

    @GetMapping("/{id}")
    public ResponseEntity<JobState> getJobState(@PathVariable Long id) {
        JobState jobState = jobService.getJobState(id);
        if (jobState != null) {
            return new ResponseEntity<>(jobState, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<JobState> createJobState(@RequestBody JobState jobState) {
        JobState createdJobState = jobService.createJobState(jobState);
        return new ResponseEntity<>(createdJobState, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<JobState>> getAllJobStates() {
        List<JobState> jobStates = jobService.getAllJobStates();
        return new ResponseEntity<>(jobStates, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobState>> searchJobStates(@RequestParam String jobStateName) {
        List<JobState> jobStates = jobService.searchJobStatesByName(jobStateName);
        return new ResponseEntity<>(jobStates, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobState> updateJobState(@PathVariable Long id, @RequestBody JobState jobStateDetails) {
        JobState updatedJobState = jobService.updateJobState(id, jobStateDetails);
        return ResponseEntity.ok(updatedJobState);
    }
}
