package com.drg.workflowmgmt.workflow;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> createJob(@RequestBody JobRequest jobRequest) {
        try {
            //Check if id are same
            if(jobRequest.getStartState().getId() == jobRequest.getEndState().getId()){
                return ResponseEntity.badRequest().body(new ErrorResponse("Start state and end state can not be same", HttpStatus.BAD_REQUEST));
            }
            // Check if startState and endState already exist
            JobState startState = jobService.getJobState(jobRequest.getStartState().getId());
            JobState endState = jobService.getJobState(jobRequest.getEndState().getId());

            // If startState or endState is null, return error response
            if (startState == null || endState == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Start state or end state not found", HttpStatus.BAD_REQUEST));
            }



            // Create job and return response
            Job job = new Job();
            job.setName(jobRequest.getName());
            Job createdJob = jobService.createJob(job, startState, endState);
            return new ResponseEntity<>(createdJob, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST));
        }
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        try {
            boolean deleted = jobService.deleteJob(id);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(new ErrorResponse("Job has orders and is archived instead of deleted", HttpStatus.BAD_REQUEST), HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @PostMapping("/{jobId}/additionalfields")
    public ResponseEntity<?> addAdditionalFields(@PathVariable Long jobId, @RequestBody AdditionalFieldsRequest additionalFieldsRequest) {
        try {
            Job updatedJob = jobService.addAdditionalFields(jobId, additionalFieldsRequest.getAdditionalFields());
            if (updatedJob != null) {
                return ResponseEntity.ok(updatedJob);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }


    public static class JobRequest {
        private String name;
        private JobState startState;
        private JobState endState;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public JobState getStartState() {
            return startState;
        }

        public void setStartState(JobState startState) {
            this.startState = startState;
        }

        public JobState getEndState() {
            return endState;
        }

        public void setEndState(JobState endState) {
            this.endState = endState;
        }
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

    public static class AdditionalFieldsRequest {
        private List<AdditionalField> additionalFields;

        public List<AdditionalField> getAdditionalFields() {
            return additionalFields;
        }

        public void setAdditionalFields(List<AdditionalField> additionalFields) {
            this.additionalFields = additionalFields;
        }
    }
}
