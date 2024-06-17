async function loadJobs() {
    const jobs = await fetchJobs();
    const jobStates = await fetchJobStates();
    const tableBody = document.getElementById('jobTableBody');
    tableBody.innerHTML = '';

    jobs.forEach(job => {
        const { availableJobStates, existingJobStates } = filterJobStates(jobStates, job);
        const jobStateOptions = generateJobStateOptions(availableJobStates);
        const jobTransitionOptions = generateJobStateOptions(existingJobStates);

        const jobStatesList = generateJobStatesList(job);
        const transitionsList = generateTransitionsList(job, jobStates);

        const row = createJobRow(job, jobStateOptions, jobTransitionOptions, jobStatesList, transitionsList);
        tableBody.appendChild(row);
    });

    loadJobStates(); // Ensure job states are loaded after jobs
    populateJobStateDropdowns(); // Populate dropdowns for start and end states
}

function populateJobStateDropdowns() {
    const jobStateSelectElements = ['startState', 'endState'];
    jobStateSelectElements.forEach(async (elementId) => {
        const selectElement = document.getElementById(elementId);
        const jobStates = await fetchJobStates();
        selectElement.innerHTML = generateJobStateOptions(jobStates);
    });
}

function filterJobStates(jobStates, job) {
    const availableJobStates = [];
    const existingJobStates = [];
    for (let state of jobStates) {
        let isPartOfJob = false;
        for (let jobState of job.jobStates) {
            if (jobState.id === state.id) {
                isPartOfJob = true;
                break;
            }
        }
        if (!isPartOfJob) {
            availableJobStates.push(state);
        } else {
            existingJobStates.push(state);
        }
    }
    return { availableJobStates, existingJobStates };
}

function generateJobStateOptions(states) {
    return states.map(state => `<option value="${state.id}">${state.name}</option>`).join('');
}

function generateJobStatesList(job) {
    const startStateId = job.startState.id;
    const endStateId = job.endState.id;

    return job.jobStates.map(state => {
        let removeButton = ''; // Initialize removeButton variable

        // Check if the state is the start or end state
        if (state.id === startStateId || state.id === endStateId) {
            // Disable the remove button if it's the start or end state
            removeButton = `<button class="btn btn-sm btn-danger ml-2" disabled>Remove</button>`;
        } else {
            // Render the remove button normally if it's not the start or end state
            removeButton = `<button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveJobState(event, ${job.id}, ${state.id})">Remove</button>`;
        }

        return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${state.name}
                ${removeButton}
            </li>
        `;
    }).join('');
}

function generateTransitionsList(job, jobStates) {
    return job.fromJobStateIds.map((fromStateId, index) => {
        const fromState = jobStates.find(state => state.id === fromStateId);
        const toState = jobStates.find(state => state.id === job.toJobStateIds[index]);
        return fromState && toState ? `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${fromState.name} -> ${toState.name}
                <button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveTransition(event, ${job.id}, ${fromStateId}, ${job.toJobStateIds[index]})">Remove</button>
            </li>
        ` : '';
    }).join('');
}

function createJobRow(job, jobStateOptions, jobTransitionOptions, jobStatesList, transitionsList) {
    const addJobStateForm = `
        <button class="btn btn-sm btn-primary btn-block" onclick="document.getElementById('addJobStateForm-${job.id}').classList.toggle('d-none')">
            <i class="fas fa-plus"></i> Add Job State
        </button>
        <form id="addJobStateForm-${job.id}" class="form-inline mt-2 d-none" onsubmit="handleAddJobState(event, ${job.id})">
            <select id="jobStateSelect-${job.id}" class="form-control mr-2 jobStateDropdown">${jobStateOptions}</select>
            <button type="submit" class="btn btn-primary btn-sm">Add</button>
        </form>
    `;

    const addTransitionForm = `
        <button class="btn btn-sm btn-primary btn-block" onclick="document.getElementById('transitionForm-${job.id}').classList.toggle('d-none')">
            <i class="fas fa-plus"></i> Add Transition
        </button>
        <form id="transitionForm-${job.id}" class="d-none mt-2" onsubmit="handleAddTransition(event, ${job.id})">
            <div class="form-group">
                <label for="fromState-${job.id}">From State:</label>
                <select id="fromState-${job.id}" class="form-control">${jobTransitionOptions}</select>
            </div>
            <div class="form-group">
                <label for="toState-${job.id}">To State:</label>
                <select id="toState-${job.id}" class="form-control">${jobTransitionOptions}</select>
            </div>
            <button type="submit" class="btn btn-primary">Add Transition</button>
        </form>
    `;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${job.id}</td>
        <td>${job.name}</td>
        <td>
            <ul class="list-group">
                <li class="list-group-item">
                    ${addJobStateForm}
                </li>
                ${jobStatesList}
            </ul>
        </td>
        <td>
            <ul class="list-group">
                <li class="list-group-item">
                    ${addTransitionForm}
                </li>
                ${transitionsList}
            </ul>
        </td>
    `;
    return row;
}

async function handleSubmitJob(event) {
    event.preventDefault();

    const jobName = document.getElementById('jobName').value;
    const startStateId = document.getElementById('startState').value;
    const endStateId = document.getElementById('endState').value;
    const csrfToken = await fetchCsrfToken();

    const job = {
        name: jobName,
        startState: { id: startStateId }, // Pass startState and endState as objects
        endState: { id: endStateId }
    };

    try {
        response = await createJob(job, csrfToken);
        if(response.id){
            loadJobs();
            document.getElementById('jobForm').reset();
            document.getElementById('jobForm').classList.add('d-none');
            document.getElementById('showJobFormButton').style.display = 'inline-block';
        } else if(response.message){
            showAlertModal('Error',response.message);
        }
    } catch (error) {
        console.error('Error creating job:', error);
        showAlertModal('Error','Failed to create job. Please try again.');
    }
}

async function createJob(job, csrfToken) {
    const response = await fetch('/jobs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(job)
    });

    return response.json();
}
async function fetchJobs() {
    const response = await fetch('/jobs');
    const data = await response.json();
    return data;
}
