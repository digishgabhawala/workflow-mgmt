package com.drg.workflowmgmt.workflow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobStateRepository jobStateRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public Job getJob(Long id) {
        return jobRepository.findById(id).orElse(null);
    }

    public Job addJobStateToJob(Long jobId, JobState jobState) {
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job != null) {
            job.getJobStates().add(jobState);
            return jobRepository.save(job);
        }
        return null;
    }

    public JobState createJobState(JobState jobState) {
        return jobStateRepository.save(jobState);
    }

    public List<JobState> getAllJobStates() {
        return jobStateRepository.findAll();
    }

    public List<Job> searchJobsByName(String jobName) {
        return jobRepository.findByNameContaining(jobName);
    }

    public List<JobState> searchJobStatesByName(String jobStateName) {
        return jobStateRepository.findByNameContaining(jobStateName);
    }
}
