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
    @PostMapping("/{jobId}/removestates")
    public ResponseEntity<?> removeJobStateFromJob(@PathVariable Long jobId, @RequestBody JobState jobState) {
        try {
            Job updatedJob = jobService.removeJobStateFromJob(jobId, jobState);
            if (updatedJob != null) {
                return ResponseEntity.ok(updatedJob);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST));
        }
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


    @PostMapping("/{jobId}/transitions")
    public ResponseEntity<?> addTransition(@PathVariable Long jobId, @RequestBody TransitionRequest transitionRequest) {
        try {
            Job updatedJob = jobService.addTransition(jobId, transitionRequest.getFromStateId(), transitionRequest.getToStateId());
            if (updatedJob != null) {
                return ResponseEntity.ok(updatedJob);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }


    @DeleteMapping("/{jobId}/transitions")
    public ResponseEntity<Job> removeTransition(@PathVariable Long jobId, @RequestBody TransitionDto transitionDto) {
        Job updatedJob = jobService.removeTransition(jobId, transitionDto.getFromStateId(), transitionDto.getToStateId());
        if (updatedJob != null) {
            return new ResponseEntity<>(updatedJob, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<JobState> updateJobState(@PathVariable Long id, @RequestBody JobState jobStateDetails) {
        JobState updatedJobState = jobService.updateJobState(id, jobStateDetails);
        return ResponseEntity.ok(updatedJobState);
    }

    public static class TransitionRequest {
        private Long fromStateId;
        private Long toStateId;

        public Long getFromStateId() {
            return fromStateId;
        }

        public void setFromStateId(Long fromStateId) {
            this.fromStateId = fromStateId;
        }

        public Long getToStateId() {
            return toStateId;
        }

        public void setToStateId(Long toStateId) {
            this.toStateId = toStateId;
        }
    }

    public static class TransitionDto {
        private Long fromStateId;
        private Long toStateId;

        public Long getFromStateId() {
            return fromStateId;
        }

        public void setFromStateId(Long fromStateId) {
            this.fromStateId = fromStateId;
        }

        public Long getToStateId() {
            return toStateId;
        }

        public void setToStateId(Long toStateId) {
            this.toStateId = toStateId;
        }

    }

    public static class ErrorResponse {
        private String message;
        private HttpStatus status;

        public ErrorResponse(String message, HttpStatus status) {
            this.message = message;
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public HttpStatus getStatus() {
            return status;
        }

        public void setStatus(HttpStatus status) {
            this.status = status;
        }
    }

}
