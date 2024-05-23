


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

