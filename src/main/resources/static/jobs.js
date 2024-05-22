async function fetchCsrfToken() {
    const response = await fetch('/csrf-token');
    const data = await response.json();
    return data.token;
}

async function fetchJobs() {
    const response = await fetch('/jobs');
    const data = await response.json();
    return data;
}

async function fetchJobStates() {
    const response = await fetch('/jobs/states');
    const data = await response.json();
    return data;
}

async function createJob(jobName, csrfToken) {
    const response = await fetch('/jobs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ name: jobName })
    });
    return response.json();
}

async function createJobState(jobStateName, csrfToken) {
    const response = await fetch(`/jobs/jobstates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ name: jobStateName })
    });
    return response.json();
}

async function addJobStateToJob(jobId, jobStateId, csrfToken) {
    const response = await fetch(`/jobs/${jobId}/jobstates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ id: jobStateId })
    });
    return response.json();
}

async function handleSubmitJob(event) {
    event.preventDefault();
    const jobName = document.getElementById('jobName').value;
    const csrfToken = await fetchCsrfToken();
    const createdJob = await createJob(jobName, csrfToken);
    if (createdJob.id) {
        loadJobs();
        loadJobStates();
        document.getElementById('jobForm').reset();
    }
}

async function handleSubmitJobState(event) {
    event.preventDefault();
    const jobStateName = document.getElementById('jobStateName').value;
    const csrfToken = await fetchCsrfToken();
    const createdJobState = await createJobState(jobStateName, csrfToken);
    if (createdJobState.id) {
        loadJobs();
        loadJobStates();
        document.getElementById('jobStateForm').reset();
    }
}

async function handleAddJobState(event, jobId) {
    event.preventDefault();
    const jobStateId = document.getElementById(`jobStateSelect-${jobId}`).value;
    const csrfToken = await fetchCsrfToken();
    const response = await addJobStateToJob(jobId, jobStateId, csrfToken);
    if (response.id) {
        loadJobs();
        document.getElementById(`addJobStateForm-${jobId}`).classList.add('d-none');
    } else {
        alert('Failed to add job state');
    }
}

async function loadJobs() {
    const jobs = await fetchJobs();
    const jobStates = await fetchJobStates();
    const tableBody = document.getElementById('jobTableBody');
    tableBody.innerHTML = '';
    jobs.forEach(job => {
        const jobStateOptions = jobStates.map(state => `<option value="${state.id}">${state.name}</option>`).join('');
        const jobStatesList = job.jobStates.map(state => `<li>${state.name}</li>`).join('');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${job.id}</td>
            <td>${job.name}</td>
            <td>
                <ul>${jobStatesList}</ul>
            </td>
            <td>
                <button class="btn btn-sm btn-success" onclick="document.getElementById('addJobStateForm-${job.id}').classList.toggle('d-none')">+</button>
                <form id="addJobStateForm-${job.id}" class="form-inline mt-2 d-none" onsubmit="handleAddJobState(event, ${job.id})">
                    <select id="jobStateSelect-${job.id}" class="form-control mr-2">${jobStateOptions}</select>
                    <button type="submit" class="btn btn-primary btn-sm">Add</button>
                </form>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function loadJobStates() {
    const jobStates = await fetchJobStates();
    const tableBody = document.getElementById('jobStateTableBody');
    tableBody.innerHTML = '';
    jobStates.forEach(jobState => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${jobState.id}</td><td>${jobState.name}</td>`;
        tableBody.appendChild(row);
    });
}

window.onload = async function() {
    loadJobs();
    loadJobStates();
};
