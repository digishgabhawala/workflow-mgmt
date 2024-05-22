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

async function loadJobs() {
    const jobs = await fetchJobs();
    const tableBody = document.getElementById('jobTableBody');
    tableBody.innerHTML = '';
    jobs.forEach(job => {
        const jobStates = job.jobStates.map(state => `<li>${state.name}</li>`).join('');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${job.id}</td>
            <td>${job.name}</td>
            <td>
                <ul>${jobStates}</ul>
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
