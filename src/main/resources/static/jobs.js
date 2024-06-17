

async function fetchRoles() {
    const response = await fetch('/users/roles');
    return response.json();
}


async function loadJobStates() {
    const jobStates = await fetchJobStates();
    const tableBody = document.getElementById('jobStateTableBody');
    tableBody.innerHTML = '';

    jobStates.forEach(jobState => {
        const rolesList = jobState.roles ? jobState.roles.map(role => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${role}
                <button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveRole(event, ${jobState.id}, '${role}')">Remove</button>
            </li>
        `).join('') : '';

        const addRoleForm = `
            <button class="btn btn-sm btn-success btn-block" onclick="document.getElementById('addRoleForm-${jobState.id}').classList.toggle('d-none')">
                <i class="fas fa-plus"></i> Add Role
            </button>
            <form id="addRoleForm-${jobState.id}" class="form-inline mt-2 d-none" onsubmit="handleAddRole(event, ${jobState.id})">
                <select id="roleDropdown-${jobState.id}" class="form-control mr-2"></select>
                <button type="submit" class="btn btn-primary btn-sm">Add</button>
            </form>
        `;

        const estimate = jobState.estimate ? `${jobState.estimate[0]}h ${jobState.estimate[1]}m` : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${jobState.id}</td>
            <td>${jobState.name}</td>
            <td>
                <ul class="list-group">
                    <li class="list-group-item">
                        ${addRoleForm}
                    </li>
                    ${rolesList}
                </ul>
            </td>
            <td>
                <span id="estimate-${jobState.id}">${estimate}</span>
                <button class="btn btn-sm btn-primary ml-2" onclick="showTimeInput(${jobState.id})">Edit</button>
                <input type="time" id="timeInput-${jobState.id}" class="hidden time-input">
            </td>
        `;
        tableBody.appendChild(row);

        // Populate the role dropdown after adding the row
        populateRoleDropdown(jobState.id);

        // Initialize timepicker
        document.getElementById(`timeInput-${jobState.id}`).addEventListener('change', function() {
                    handleTimeInputChange(jobState.id, this.value);
                });
    });
}

async function handleAddRole(event, jobStateId) {
    event.preventDefault();
    const roleDropdown = document.getElementById(`roleDropdown-${jobStateId}`);
    const roleName = roleDropdown.options[roleDropdown.selectedIndex].text;
    if (roleName) {
        const csrfToken = await fetchCsrfToken();
        await addRoleToJobState(jobStateId, roleName, csrfToken);
        loadJobStates();
    }
}

async function handleRemoveRole(event, jobStateId, roleName) {
    event.preventDefault();
    const csrfToken = await fetchCsrfToken();
    await removeRoleFromJobState(jobStateId, roleName, csrfToken);
    loadJobStates();
}



function showTimeInput(jobStateId) {
    const timeInput = document.getElementById(`timeInput-${jobStateId}`);
    timeInput.classList.remove('hidden');
    timeInput.focus();
}

async function handleTimeInputChange(jobStateId, time) {
    const csrfToken = await fetchCsrfToken();
    const jobState = await fetchJobState(jobStateId);
    const [hours, minutes] = time.split(':').map(Number);
    jobState.estimate = [hours, minutes];
    await updateJobState(jobStateId, jobState, csrfToken);
    loadJobStates();
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
    } else if(response.message){
        showAlertModal('Error', response.message);
    } else {
        showAlertModal('Error', 'Failed to add transition');
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
    if(!response.ok){

    }
    return response.json();
}

window.onload = async function() {
    loadJobs();
    await loadJobStates();
    // Add event listeners to the Show/Hide buttons
    document.getElementById('toggleJobStatesTableBtn').addEventListener('click', toggleJobStatesTable);
    document.getElementById('toggleJobsTableBtn').addEventListener('click', toggleJobsTable);
    // Initially hide the Job States table
    jobStatesTable.style.display = 'none';
    jobsTable.style.display = 'table';
    // Set initial icons
    setIcon('jobStatesTableIcon', 'fas fa-eye'); // Show icon
    setIcon('jobsTableIcon', 'fas fa-eye-slash'); // Show icon
//    toggleJobStatesTable();
};


// Function to toggle visibility of the Job States table
function toggleJobStatesTable() {
    const jobStatesTable = document.getElementById('jobStatesTable');
    if (jobStatesTable.style.display === 'none' || !jobStatesTable.style.display) {
        jobStatesTable.style.display = 'table';
        setIcon('jobStatesTableIcon', 'fas fa-eye-slash'); // Hide icon
    } else {
        jobStatesTable.style.display = 'none';
        setIcon('jobStatesTableIcon', 'fas fa-eye'); // Show icon
    }
}

// Function to toggle visibility of the Jobs table
function toggleJobsTable() {
    const jobsTable = document.getElementById('jobsTable');
    if (jobsTable.style.display === 'none' || !jobsTable.style.display) {
        jobsTable.style.display = 'table';
        setIcon('jobsTableIcon', 'fas fa-eye-slash'); // Hide icon
    } else {
        jobsTable.style.display = 'none';
        setIcon('jobsTableIcon', 'fas fa-eye'); // Show icon
    }
}
// Function to set icon class
function setIcon(iconId, iconClass) {
    const icon = document.getElementById(iconId);
    if (icon) {
        icon.className = iconClass;
    }
}

async function handleRemoveTransition(event, jobId, fromStateId, toStateId) {
    event.preventDefault();
    const csrfToken = await fetchCsrfToken();
    const response = await fetch(`/jobs/${jobId}/transitions`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ fromStateId: fromStateId, toStateId: toStateId })
    });
    if (response.ok) {
        loadJobs();
    } else if(response.message){
        showAlertModal('Error', response.message);
    } else {
        showAlertModal('Error', 'Failed to remove transition');
    }
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
    }else if (createdJobState.message) {
         showAlertModal('Error', createdJobState.message);
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
        showAlertModal('Error', 'Failed to add job state');
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
        showAlertModal('Error', response.message);
    } else {
        showAlertModal('Error', 'Failed to remove job state');
    }
}
