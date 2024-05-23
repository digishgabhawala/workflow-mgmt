async function loadJobs() {
    const jobs = await fetchJobs();
    const jobStates = await fetchJobStates();
    const tableBody = document.getElementById('jobTableBody');
    tableBody.innerHTML = '';

    jobs.forEach(job => {
        const { availableJobStates, existingJobStates } = filterJobStates(jobStates, job.jobStates);

        const row = document.createElement('tr');
        row.innerHTML = generateJobRow(job, availableJobStates, existingJobStates, jobStates);
        tableBody.appendChild(row);
    });

    loadJobStates(); // Ensure job states are loaded after jobs
}

function filterJobStates(jobStates, jobStatesOfJob) {
    const availableJobStates = [];
    const existingJobStates = [];

    for (let state of jobStates) {
        let isPartOfJob = false;
        for (let jobState of jobStatesOfJob) {
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

function generateJobRow(job, availableJobStates, existingJobStates, jobStates) {
    const jobStateOptions = availableJobStates.map(state => `<option value="${state.id}">${state.name}</option>`).join('');
    const jobTransitionOptions = existingJobStates.map(state => `<option value="${state.id}">${state.name}</option>`).join('');

    const jobStatesList = generateJobStatesList(job, existingJobStates);
    const addJobStateForm = generateAddJobStateForm(job.id, jobStateOptions);
    const transitionsList = generateTransitionsList(job, jobStates);
    const addTransitionForm = generateAddTransitionForm(job.id, jobTransitionOptions);

    return `
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
}

function generateJobStatesList(job, existingJobStates) {
    return job.jobStates.map(state => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${state.name}
            <button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveJobState(event, ${job.id}, ${state.id})">Remove</button>
        </li>
    `).join('');
}

function generateAddJobStateForm(jobId, jobStateOptions) {
    return `
        <button class="btn btn-sm btn-success btn-block" onclick="document.getElementById('addJobStateForm-${jobId}').classList.toggle('d-none')">+</button>
        <form id="addJobStateForm-${jobId}" class="form-inline mt-2 d-none" onsubmit="handleAddJobState(event, ${jobId})">
            <select id="jobStateSelect-${jobId}" class="form-control mr-2 jobStateDropdown">${jobStateOptions}</select>
            <button type="submit" class="btn btn-primary btn-sm">Add</button>
        </form>
    `;
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

function generateAddTransitionForm(jobId, jobTransitionOptions) {
    return `
        <button class="btn btn-sm btn-primary btn-block" onclick="document.getElementById('transitionForm-${jobId}').classList.toggle('d-none')">+</button>
        <form id="transitionForm-${jobId}" class="d-none mt-2" onsubmit="handleAddTransition(event, ${jobId})">
            <div class="form-group">
                <label for="fromState-${jobId}">From State:</label>
                <select id="fromState-${jobId}" class="form-control">${jobTransitionOptions}</select>
            </div>
            <div class="form-group">
                <label for="toState-${jobId}">To State:</label>
                <select id="toState-${jobId}" class="form-control">${jobTransitionOptions}</select>
            </div>
            <button type="submit" class="btn btn-primary">Add Transition</button>
        </form>
    `;
}
