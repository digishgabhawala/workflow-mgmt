async function fetchJobState(jobStateId) {
    const response = await fetch(`/jobstates/${jobStateId}`);
    return response.json();
}

async function fetchJobStates() {
    const response = await fetch('/jobstates');
    return response.json();
}

async function createJobState(jobStateName, csrfToken) {
    const response = await fetch('/jobstates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ name: jobStateName })
    });
    return response.json();
}


async function updateJobState(jobStateId, jobState, csrfToken) {
    const response = await fetch(`/jobstates/${jobStateId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(jobState)
    });
    return response.json();
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

// Ensure the role dropdown is populated with roles not already assigned to the job state
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