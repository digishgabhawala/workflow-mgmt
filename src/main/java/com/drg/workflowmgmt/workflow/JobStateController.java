package com.drg.workflowmgmt.workflow;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobsstates")
public class JobStateController {
    @Autowired
    private JobService jobService;

    @GetMapping("/{id}")
    public ResponseEntity<JobState> getJob(@PathVariable Long id) {
        JobState jobState = jobService.getJobState(id);
        if (jobState != null) {
            return new ResponseEntity<>(jobState, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
