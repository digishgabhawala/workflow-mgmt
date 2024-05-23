package com.drg.workflowmgmt.workflow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


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

    public Job removeJobStateFromJob(Long jobId, JobState jobState) {
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job != null) {
            job.getJobStates().removeIf(state -> state.getId().equals(jobState.getId()));
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

    public Job addTransition(Long jobId, Long fromStateId, Long toStateId) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isPresent()) {
            Job job = jobOpt.get();
            JobState fromState = jobStateRepository.findById(fromStateId).orElse(null);
            JobState toState = jobStateRepository.findById(toStateId).orElse(null);

            if (fromState != null && toState != null) {
                // Add the transition logic here
                job.getFromJobStateIds().add(fromStateId);
                job.getToJobStateIds().add(toStateId);
                jobRepository.save(job);
                return job;
            }
        }
        return null;
    }


    public Job removeTransition(Long jobId, Long fromStateId, Long toStateId) {
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isPresent()) {
            Job job = jobOpt.get();
            List<Integer> indexesToRemove = new ArrayList<>();
            List<Long> fromStateIds = job.getFromJobStateIds();
            List<Long> toStateIds = job.getToJobStateIds();

            // Find all occurrences of the transition in the job
            for (int i = 0; i < fromStateIds.size(); i++) {
                if (fromStateIds.get(i).equals(fromStateId) && toStateIds.get(i).equals(toStateId)) {
                    indexesToRemove.add(i);
                }
            }

            // Remove the transition from the job
            if (!indexesToRemove.isEmpty()) {
                // Remove transitions in reverse order to avoid index shift
                for (int i = indexesToRemove.size() - 1; i >= 0; i--) {
                    int index = indexesToRemove.get(i);
                    fromStateIds.remove(index);
                    toStateIds.remove(index);
                }
                jobRepository.save(job);
                return job;
            }
        }
        return null;
    }


}
