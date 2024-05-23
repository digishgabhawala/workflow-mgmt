
async function loadJobs() {
    const jobs = await fetchJobs();
    const jobStates = await fetchJobStates();
    const tableBody = document.getElementById('jobTableBody');
    tableBody.innerHTML = '';

    jobs.forEach(job => {
        // Filter out states already part of the job
        // Use a for loop to filter out states already part of the job
        const availableJobStates = [];
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
            }
        }
        const jobStateOptions = availableJobStates.map(state => `<option value="${state.id}">${state.name}</option>`).join('');

        const jobStatesList = job.jobStates.map(state => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${state.name}
                <button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveJobState(event, ${job.id}, ${state.id})">Remove</button>
            </li>
        `).join('');

        const addJobStateForm = `
            <button class="btn btn-sm btn-success btn-block" onclick="document.getElementById('addJobStateForm-${job.id}').classList.toggle('d-none')">+</button>
            <form id="addJobStateForm-${job.id}" class="form-inline mt-2 d-none" onsubmit="handleAddJobState(event, ${job.id})">
                <select id="jobStateSelect-${job.id}" class="form-control mr-2 jobStateDropdown">${jobStateOptions}</select>
                <button type="submit" class="btn btn-primary btn-sm">Add</button>
            </form>
        `;

        const transitionsList = job.fromJobStateIds.map((fromStateId, index) => {
            const fromState = jobStates.find(state => state.id === fromStateId);
            const toState = jobStates.find(state => state.id === job.toJobStateIds[index]);
            return fromState && toState ? `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${fromState.name} -> ${toState.name}
                    <button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveTransition(event, ${job.id}, ${fromStateId}, ${job.toJobStateIds[index]})">Remove</button>
                </li>
            ` : '';
        }).join('');

        const addTransitionForm = `
            <button class="btn btn-sm btn-primary btn-block" onclick="document.getElementById('transitionForm-${job.id}').classList.toggle('d-none')">+</button>
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
        tableBody.appendChild(row);
    });

    loadJobStates();
}
