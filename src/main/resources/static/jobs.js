
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
    } else {
        alert('Failed to remove job state');
    }
}

async function loadJobs() {
    const jobs = await fetchJobs();
    const jobStates = await fetchJobStates();
    const tableBody = document.getElementById('jobTableBody');
    tableBody.innerHTML = '';

    jobs.forEach(job => {
        const jobStateOptions = jobStates.map(state => `<option value="${state.id}">${state.name}</option>`).join('');

        const jobStatesList = job.jobStates.map(state => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${state.name}
                <button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveJobState(event, ${job.id}, ${state.id})">Remove</button>
            </li>
        `).join('');

        const transitions = job.fromJobStateIds.map((fromStateId, index) => {
            const fromState = jobStates.find(state => state.id === fromStateId);
            const toState = jobStates.find(state => state.id === job.toJobStateIds[index]);
            return fromState && toState ? `<li class="list-group-item">${fromState.name} -> ${toState.name}</li>` : '';
        }).join('');

        const transitionForm = `
            <button class="btn btn-sm btn-primary" onclick="document.getElementById('transitionForm-${job.id}').classList.toggle('d-none')">+</button>
            <form id="transitionForm-${job.id}" class="d-none mt-2" onsubmit="handleAddTransition(event, ${job.id})">
                <div class="form-group">
                    <label for="fromState-${job.id}">From State:</label>
                    <select id="fromState-${job.id}" class="form-control">${jobStateOptions}</select>
                </div>
                <div class="form-group">
                    <label for="toState-${job.id}">To State:</label>
                    <select id="toState-${job.id}" class="form-control">${jobStateOptions}</select>
                </div>
                <button type="submit" class="btn btn-primary">Add Transition</button>
            </form>
        `;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${job.id}</td>
            <td>${job.name}</td>
            <td>
                <ul class="list-group">${jobStatesList}</ul>
            </td>
            <td>
                <button class="btn btn-sm btn-success" onclick="document.getElementById('addJobStateForm-${job.id}').classList.toggle('d-none')">+</button>
                <form id="addJobStateForm-${job.id}" class="form-inline mt-2 d-none" onsubmit="handleAddJobState(event, ${job.id})">
                    <select id="jobStateSelect-${job.id}" class="form-control mr-2 jobStateDropdown">${jobStateOptions}</select>
                    <button type="submit" class="btn btn-primary btn-sm">Add</button>
                </form>
            </td>
            <td>
                <ul class="list-group">${transitions}</ul>
                ${transitionForm}
            </td>
        `;
        tableBody.appendChild(row);
    });

    loadJobStates();
}


async function loadJobStates() {
    const jobStates = await fetchJobStates();
    const tableBody = document.getElementById('jobStateTableBody');
    tableBody.innerHTML = '';
    const dropdowns = document.querySelectorAll('.jobStateDropdown');

    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = ''; // Clear existing options
        jobStates.forEach(jobState => {
            const option = document.createElement('option');
            option.value = jobState.id;
            option.textContent = jobState.name;
            dropdown.appendChild(option);
        });
    });

    jobStates.forEach(jobState => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${jobState.id}</td><td>${jobState.name}</td>`;
        tableBody.appendChild(row);
    });
}
function toggleTransitionForm(jobId) {
    const form = document.getElementById(`transitionForm-${jobId}`);
    form.classList.toggle('d-none');
}

async function handleAddTransition(event, jobId) {
    event.preventDefault();
    const fromStateId = document.getElementById(`fromState-${jobId}`).value;
    const toStateId = document.getElementById(`toState-${jobId}`).value;
    const csrfToken = await fetchCsrfToken();
    const response = await addJobTransition(jobId, fromStateId, toStateId, csrfToken);
    if (response.id) {
        loadJobs();
        document.getElementById(`transitionForm-${jobId}`).classList.add('d-none');
    } else {
        alert('Failed to add transition');
    }
}

async function addJobTransition(jobId, fromStateId, toStateId, csrfToken) {
    const response = await fetch(`/jobs/${jobId}/transitions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ fromStateId, toStateId })
    });
    return response.json();
}

window.onload = async function() {
    loadJobs();
    loadJobStates();
};
