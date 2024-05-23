

async function fetchRoles() {
    const response = await fetch('/users/roles');
    return response.json();
}

async function populateRoleDropdown(jobStateId) {
    const roles = await fetchRoles();
    const jobState = await fetchJobState(jobStateId);
    const dropdown = document.getElementById(`roleDropdown-${jobStateId}`);
    dropdown.innerHTML = '';

    // Filter roles that are not already assigned to the job state
    const availableRoles = roles.filter(role => !jobState.roles.includes(role.name));

    availableRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        dropdown.appendChild(option);
    });
}
async function fetchJobStates() {
    const response = await fetch('/jobs/states');
    const data = await response.json();
    return data;
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
            <td>${estimate}</td>
        `;
        tableBody.appendChild(row);

        // Populate the role dropdown after adding the row
        populateRoleDropdown(jobState.id);
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

async function addRoleToJobState(jobStateId, roleName, csrfToken) {
    const jobState = await fetchJobState(jobStateId);
    if (!jobState.roles.includes(roleName)) {
        jobState.roles.push(roleName);
        await updateJobState(jobStateId, jobState, csrfToken);
    }
}

async function removeRoleFromJobState(jobStateId, roleName, csrfToken) {
    const jobState = await fetchJobState(jobStateId);
    const roleIndex = jobState.roles.indexOf(roleName);
    if (roleIndex > -1) {
        jobState.roles.splice(roleIndex, 1);
        await updateJobState(jobStateId, jobState, csrfToken);
    }
}

async function fetchJobState(jobStateId) {
    const response = await fetch(`jobsstates/${jobStateId}`);
    return response.json();
}

async function updateJobState(jobStateId, jobState, csrfToken) {
    const response = await fetch(`/jobs/jobState/${jobStateId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(jobState)
    });
    return response.json();
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
        alert (response.message);
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
        alert (response.message);
    } else {
        alert('Failed to remove transition');
    }
}
