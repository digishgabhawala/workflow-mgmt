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
    return job.jobStates.map(state => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${state.name}
            <button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveJobState(event, ${job.id}, ${state.id})">Remove</button>
        </li>
    `).join('');
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
