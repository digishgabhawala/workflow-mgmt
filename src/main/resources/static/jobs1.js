async function fetchCsrfToken() {
    const response = await fetch('/csrf-token');
    const data = await response.json();
    return data.token;
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

async function removeJobStateFromJob(jobId, jobStateId, csrfToken) {
    const response = await fetch(`/jobs/${jobId}/removestates`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ id: jobStateId })
    });
    return response.json();
}


async function handleSubmitJobState(event) {
    event.preventDefault();
    const jobStateName = document.getElementById('jobStateName').value;
    const csrfToken = await fetchCsrfToken();
    const createdJobState = await createJobState(jobStateName, csrfToken);
    if (createdJobState.id) {
        loadJobStates();
        loadJobs(); // Update the jobs table as well
        document.getElementById('jobStateForm').reset();
        document.getElementById('jobStateForm').classList.add('d-none');
        document.getElementById('showJobStateFormButton').style.display = 'inline-block';
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

function showForm(formId, buttonId) {
    document.getElementById(formId).classList.remove('d-none');
    document.getElementById(buttonId).style.display = 'none';
}

async function handleRemoveJobState(event, jobId, jobStateId) {
    event.preventDefault();
    const csrfToken = await fetchCsrfToken();
    const response = await removeJobStateFromJob(jobId, jobStateId, csrfToken);
    if (response.id) {
        loadJobs();
    } else if(response.message){
        alert (response.message);
    } else {
        alert('Failed to remove job state');
    }
}
