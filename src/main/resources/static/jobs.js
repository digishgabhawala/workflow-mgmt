

async function fetchRoles() {
    const response = await fetch('/users/roles');
    return response.json();
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
    timeInput.classList.toggle('d-none');
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


window.onload = async function() {
    await loadJobs();
//    await loadJobStates();

    // Set up event listener for each job name header
//    const jobNameHeaders = document.querySelectorAll('.job-name-header');
//    jobNameHeaders.forEach(header => {
//        header.addEventListener('click', () => toggleJobCard(header));
//    });
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
async function populateRoleDropdown(jobStateId,roles,jobState) {
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


async function loadJobs() {
    const jobs = await fetchJobs();
    const jobStates = await fetchJobStates();
    const jobsCards = document.getElementById('jobsCards');
    jobsCards.innerHTML = '';

    jobs.forEach(job => {
        const { availableJobStates, existingJobStates } = filterJobStates(jobStates, job);
        const jobStateOptions = generateJobStateOptions(availableJobStates);
        const jobTransitionOptions = generateJobStateOptions(existingJobStates);

        const jobStatesList = generateJobStatesList(job);
        const transitionsList = generateTransitionsList(job, jobStates);

        const card = createJobCard(job, jobStateOptions, jobTransitionOptions, jobStatesList, transitionsList);

        jobsCards.appendChild(card);
    });

    loadJobStates(jobStates); // Ensure job states are loaded after jobs
    populateJobStateDropdowns(jobStates); // Populate dropdowns for start and end states
}


function populateJobStateDropdowns(jobStates) {
    const jobStateSelectElements = ['startState', 'endState'];
    jobStateSelectElements.forEach(async (elementId) => {
        const selectElement = document.getElementById(elementId);
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

    // Check if job is archived
    const isArchived = job.archived;

    return job.jobStates.map(state => {
        let removeButton = ''; // Initialize removeButton variable

        // Check if the state is the start or end state or if job is archived
        if (state.id === startStateId || state.id === endStateId || isArchived) {
            // Disable the remove button if it's the start or end state or if job is archived
            removeButton = `<button class="btn btn-sm btn-danger ml-2" disabled>Remove</button>`;
        } else {
            // Render the remove button normally if it's not the start or end state and job is not archived
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

        // Check if job is archived
        const isArchived = job.archived;

        // Conditionally render remove button
        const removeButton = isArchived
            ? `<button class="btn btn-sm btn-danger ml-2" disabled>Remove</button>`
            : `<button class="btn btn-sm btn-danger ml-2" onclick="handleRemoveTransition(event, ${job.id}, ${fromStateId}, ${job.toJobStateIds[index]})">Remove</button>`;

        return fromState && toState ? `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${fromState.name} -> ${toState.name}
                ${removeButton}
            </li>
        ` : '';
    }).join('');
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

// Function to toggle visibility of the Jobs cards
function toggleJobsCards() {
    const jobsCards = document.getElementById('jobsCards');
    if (jobsCards.style.display === 'none' || !jobsCards.style.display) {
        jobsCards.style.display = 'block';
        setIcon('jobsCardsIcon', 'fas fa-eye-slash'); // Hide icon
    } else {
        jobsCards.style.display = 'none';
        setIcon('jobsCardsIcon', 'fas fa-eye'); // Show icon
    }
}

async function handleDeleteJob(event, jobId) {
    event.preventDefault();
    const csrfToken = await fetchCsrfToken();
    const response = await fetch(`/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        }
    });

    if (response.ok) {
        loadJobs();
    } else {
        const responseData = await response.json();
        showAlertModal('Error', responseData.message || 'Failed to delete job');
    }
}

function createJobCard(job, jobStateOptions, jobTransitionOptions, jobStatesList, transitionsList) {
    const addJobStateForm = job.archived
        ? ''
        : `
          <button class="btn btn-sm btn-primary btn-block" onclick="document.getElementById('addJobStateForm-${job.id}').classList.toggle('d-none')">
              <i class="fas fa-plus"></i> Add Job State
          </button>
          <form id="addJobStateForm-${job.id}" class="form-inline mt-2 d-none" onsubmit="handleAddJobState(event, ${job.id})">
              <select id="jobStateSelect-${job.id}" class="form-control mr-2 jobStateDropdown">${jobStateOptions}</select>
              <button type="submit" class="btn btn-primary btn-sm">Add</button>
          </form>
        `;

    const copyButton = `
        <button class="btn btn-sm btn-secondary ml-2" onclick="copyJob(${job.id})">
            <i class="fas fa-copy"></i> Copy
        </button>
    `;

    const deleteButton = job.archived
        ? ''  // Empty string to hide delete button if archived
        : `
          <button class="btn btn-sm btn-danger ml-2" onclick="handleDeleteJob(event, ${job.id})">
              <i class="fas fa-trash"></i> Delete
          </button>
        `;

    const addTransitionForm = job.archived
        ? ''
        : `
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

    const jobStatesContent = `
        <div id="jobStates-${job.id}">
            <h6>Job States</h6>
            <h6>${copyButton} ${deleteButton}</h6>
            <ul class="list-group mb-3">
                <li class="list-group-item">
                    ${addJobStateForm}
                </li>
                ${jobStatesList}
            </ul>
        </div>
    `;

    const transitionsContent = `
        <div id="transitions-${job.id}">
            <h6>Transitions</h6>
            <ul class="list-group">
                <li class="list-group-item">
                    ${addTransitionForm}
                </li>
                ${transitionsList}
            </ul>
        </div>
    `;

    const additionalInfoContent = job.additionalInfo && job.additionalInfo.length > 0 ? `
        <div id="additionalInfo-${job.id}">
            <h6>Additional Information</h6>
            <ul class="list-group">
                ${job.additionalInfo.map(info => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${info.fieldName}: ${info.fieldType}
                        ${info.mandatory ? '<span class="badge badge-primary">Mandatory</span>' : ''}
                    </li>
                `).join('')}
            </ul>
        </div>
    ` : '';

    const additionalFieldsForm = `
        <div id="additionalFields-${job.id}">
            <button class="btn btn-sm btn-primary btn-block" onclick="document.getElementById('additionalFieldsForm-${job.id}').classList.toggle('d-none');">
                <i class="fas fa-plus"></i> Add Form Fields
            </button>
            <div id="additionalFieldsContainer-${job.id}">
            </div>
            <form id="additionalFieldsForm-${job.id}" class="d-none mt-2" onsubmit="handleAddFormFields(event, ${job.id})">
                <button type="button" class="btn btn-secondary btn-sm" onclick="addAdditionalField(${job.id}, document.getElementById('additionalFieldsContainer-${job.id}'))">Add Another Field</button>
                <button type="submit" class="btn btn-primary btn-sm">Submit</button>
            </form>
        </div>
    `;

    const card = document.createElement('div');
    card.classList.add('col-12', 'mb-4');
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title m-0">${job.name}</h5>
                <div class="ml-auto d-flex align-items-center">
                    <i class="fas fa-chevron-down ml-2"></i>
                </div>
            </div>
            <div class="card-body d-none">
                ${jobStatesContent}
                ${transitionsContent}
                ${additionalInfoContent}
                ${additionalFieldsForm}
            </div>
        </div>
    `;

    const cardHeader = card.querySelector('.card-header');
    const cardBody = card.querySelector('.card-body');

    cardHeader.addEventListener('click', () => {
        cardBody.classList.toggle('d-none');
        const icon = cardHeader.querySelector('.fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });

    // Ensure additionalFieldsContainer exists before accessing it
    const additionalFieldsContainer = card.querySelector(`#additionalFieldsContainer-${job.id}`);
    if (additionalFieldsContainer && job.additionalFields) {
        job.additionalFields.forEach((field, index) => {
            addAdditionalField(job.id, additionalFieldsContainer, field);
        });
    }

    return card;
}


function addAdditionalField(jobId, container, field = { fieldName: "New Additional Field", fieldType: "", partOfForm: "", mandatory: false }) {
    const fieldId = container.children.length;

    const fieldCard = document.createElement('div');
    fieldCard.classList.add('card', 'mb-3', 'additional-field-group');
    fieldCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="card-title m-0">${field.fieldName || 'New Additional Field'}</h6>
            <div class="ml-auto d-flex align-items-center">
                <button class="btn btn-sm btn-danger mr-2" onclick="deleteAdditionalField(${jobId}, ${fieldId}, this)">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <i class="fas fa-chevron-down ml-2"></i>
            </div>
        </div>
        <div class="card-body d-none">
            <input type="hidden" id="fieldChanged-${jobId}-${fieldId}" value="false">
            <div class="form-group">
                <label for="fieldName-${jobId}-${fieldId}">Field Name:</label>
                <input type="text" id="fieldName-${jobId}-${fieldId}" name="fieldName-${jobId}" class="form-control" value="${field.fieldName}" oninput="updateFieldName(${jobId}, ${fieldId}, this); markFieldChanged(${jobId}, ${fieldId});">
                <div class="invalid-feedback">Field name is required.</div>
            </div>
            <div class="form-group">
                <label for="fieldType-${jobId}-${fieldId}">Field Type:</label>
                <select id="fieldType-${jobId}-${fieldId}" name="fieldType-${jobId}" class="form-control" onchange="markFieldChanged(${jobId}, ${fieldId});">
                    <option value="text" ${field.fieldType === "text" ? "selected" : ""}>Text</option>
                    <option value="number" ${field.fieldType === "number" ? "selected" : ""}>Number</option>
                    <option value="date" ${field.fieldType === "date" ? "selected" : ""}>Date</option>
                    <!-- Add more options as needed -->
                </select>
            </div>
            <div class="form-group">
                <label for="partOfForm-${jobId}-${fieldId}">Part of Form:</label>
                <input type="text" id="partOfForm-${jobId}-${fieldId}" name="partOfForm-${jobId}" class="form-control" value="${field.partOfForm}" oninput="markFieldChanged(${jobId}, ${fieldId});">
            </div>
            <div class="form-group">
                <label>Mandatory:</label>
                <div>
                    <input type="radio" id="mandatoryYes-${jobId}-${fieldId}" name="mandatory-${jobId}-${fieldId}" value="yes" ${field.mandatory ? "checked" : ""} onclick="markFieldChanged(${jobId}, ${fieldId});">
                    <label for="mandatoryYes-${jobId}-${fieldId}">Yes</label>
                    <input type="radio" id="mandatoryNo-${jobId}-${fieldId}" name="mandatory-${jobId}-${fieldId}" value="no" ${!field.mandatory ? "checked" : ""} onclick="markFieldChanged(${jobId}, ${fieldId});">
                    <label for="mandatoryNo-${jobId}-${fieldId}">No</label>
                </div>
            </div>
        </div>
    `;

    const fieldCardHeader = fieldCard.querySelector('.card-header');
    const fieldCardBody = fieldCard.querySelector('.card-body');
    const fieldNameInput = fieldCard.querySelector(`#fieldName-${jobId}-${fieldId}`);

    fieldCardHeader.addEventListener('click', () => {
        fieldCardBody.classList.toggle('d-none');
        const icon = fieldCardHeader.querySelector('.fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });

    fieldNameInput.addEventListener('input', () => {
        const cardTitle = fieldCard.querySelector('.card-title');
        cardTitle.textContent = fieldNameInput.value || "New Additional Field";
        if (!fieldNameInput.value) {
            fieldNameInput.classList.add('is-invalid');
        } else {
            fieldNameInput.classList.remove('is-invalid');
        }
    });

    container.appendChild(fieldCard);
}

function markFieldChanged(jobId, fieldId) {
    document.getElementById(`fieldChanged-${jobId}-${fieldId}`).value = 'true';
}

async function deleteAdditionalField(jobId, fieldId, deleteButton) {
    const fieldCard = deleteButton.closest('.card');

    // Assuming you have a way to uniquely identify the additional field in your backend,
    // you might need to adjust this endpoint according to your actual API design.
    const response = await fetch(`/jobs/${jobId}/additionalfields/${fieldId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': await fetchCsrfToken()
        }
    });

    if (response.ok) {
        fieldCard.remove();
        console.log(`Deleted field ${fieldId} from job ${jobId}`);
    } else {
        console.error(`Failed to delete field ${fieldId} from job ${jobId}`);
    }
}

function updateFieldName(jobId, fieldId, inputElement) {
    const cardTitle = document.querySelector(`#additionalFieldsContainer-${jobId} .card:nth-child(${fieldId + 1}) .card-title`);
    cardTitle.textContent = inputElement.value || 'New Additional Field';
    if (!inputElement.value) {
        inputElement.classList.add('is-invalid');
    } else {
        inputElement.classList.remove('is-invalid');
    }
}
async function handleAddFormFields(event, jobId) {
    event.preventDefault();
    const csrfToken = await fetchCsrfToken();
    const additionalFieldsContainer = document.getElementById(`additionalFieldsContainer-${jobId}`);
    const additionalFields = [];

    additionalFieldsContainer.querySelectorAll('.card').forEach((fieldGroup, index) => {
        const fieldChanged = fieldGroup.querySelector(`#fieldChanged-${jobId}-${index}`).value;
        if (fieldChanged === 'true') {
            const fieldName = fieldGroup.querySelector(`#fieldName-${jobId}-${index}`).value;
            const fieldType = fieldGroup.querySelector(`#fieldType-${jobId}-${index}`).value;
            const partOfForm = fieldGroup.querySelector(`#partOfForm-${jobId}-${index}`).value;
            const mandatory = fieldGroup.querySelector(`input[name="mandatory-${jobId}-${index}"]:checked`).value === 'yes';

            additionalFields.push({ fieldName, fieldType, partOfForm, mandatory });
        }
    });

    if (additionalFields.length === 0) {
        console.log('No changes in additional fields');
        return;
    }

    const response = await fetch(`/jobs/${jobId}/additionalfields`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ additionalFields })
    });

    if (response.ok) {
        loadJobs(); // Refresh the jobs list
    } else {
        console.error('Failed to add additional fields');
    }
}





async function loadJobStates(jobStatesData) {
    let jobStates;
    if(jobStatesData){
         jobStates = jobStatesData;
    }
    else{
        jobStates = await fetchJobStates();
    }
    const jobStatesCards = document.getElementById('jobStatesCards');
    jobStatesCards.innerHTML = '';

    const roles = await fetchRoles();

    jobStates.forEach(jobState => {
//        jobStates
//        const jobState = await fetchJobState(jobState.id);

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

        const card = document.createElement('div');
        card.className = 'card mb-3';

        card.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center" role="button" onclick="toggleCardBody(this)">
                <h5 class="card-title m-0">${jobState.name}</h5>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="card-body d-none">
                <h5>Roles</h5>
                <ul class="list-group">
                    ${rolesList}
                    <li class="list-group-item">
                        ${addRoleForm}
                    </li>
                </ul>
                <h5>Estimate</h5>
                <div class="d-flex align-items-center">
                    <span id="estimate-${jobState.id}" class="mr-2">${estimate}</span>
                    <button class="btn btn-sm btn-primary ml-2" onclick="showTimeInput(${jobState.id})">Edit</button>
                    <input type="time" id="timeInput-${jobState.id}" class="form-control ml-2 d-none time-input">
                </div>
            </div>
        `;

        jobStatesCards.appendChild(card);

        // Populate the role dropdown after adding the card

        populateRoleDropdown(jobState.id,roles,jobState);

        // Initialize timepicker
        document.getElementById(`timeInput-${jobState.id}`).addEventListener('change', function() {
            handleTimeInputChange(jobState.id, this.value);
        });
    });
}


function toggleCardBody(headerElement) {
    const cardBody = headerElement.nextElementSibling;
    cardBody.classList.toggle('d-none');
}



async function addJobTransition(jobId, fromStateId, toStateId, csrfToken) {
    try {
        const response = await fetch(`/jobs/${jobId}/transitions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ fromStateId, toStateId })
        });

        if (!response.ok) {
            // If the response is not OK, throw an error with the status text
            throw new Error(response.statusText);
        }

        return response.json();
    } catch (error) {
        console.error('Error adding job transition:', error);
        return { message: 'Failed to add transition due to a network error.' };
    }
}

function hasLoop(job, fromStateId, toStateId) {
    let visited = new Set();
    let queue = [toStateId];

    while (queue.length > 0) {
        let currentState = queue.shift();

        // If we find the fromStateId in the reachable states, a loop exists
        if (currentState == fromStateId) {
            return true;
        }

        // Mark the current state as visited
        visited.add(currentState);

        // Get indexes where fromJobStateIds is the current state
        job.fromJobStateIds.forEach((state, index) => {
            console.log(state,currentState)
            if (state == currentState && !visited.has(job.toJobStateIds[index])) {
                queue.push(job.toJobStateIds[index]);
            }
        });
    }

    return false;
}

async function handleAddTransition(event, jobId) {
    event.preventDefault();
    const fromStateId = document.getElementById(`fromState-${jobId}`).value;
    const toStateId = document.getElementById(`toState-${jobId}`).value;
    const csrfToken = await fetchCsrfToken();

    // Fetch job details (assuming a function fetchJobDetails exists)
    const job = await fetchJobDetails(jobId);

    if (hasLoop(job, fromStateId, toStateId)) {
        showAlertModal('Error', 'Adding this transition will create a loop');
        return;
    }

    const response = await addJobTransition(jobId, fromStateId, toStateId, csrfToken);

    if (response.id) {
        showAlertModal('Success', 'Transition added successfully', () => {
            loadJobs();
            document.getElementById(`transitionForm-${jobId}`).classList.add('d-none');
        });
    } else if (response.message) {
        showAlertModal('Error', response.message);
    } else {
        showAlertModal('Error', 'Failed to add transition');
    }
}

async function fetchJobDetails(jobId) {
    const response = await fetch(`/jobs/${jobId}`);
    const data = await response.json();
    return data;

}

async function copyJob(jobId) {
    try {
        // Fetch details of the job to copy
        const job = await fetchJobDetails(jobId);

        // Show the modal and wait for user input
        const newJobName = await createModal(
            'Enter a new name for the copied job:', // Modal title
            'New job name',                        // Input label
            'Copy Job',                            // Confirm button label
            'Cancel'                               // Cancel button label
        );

        // If the user canceled or didn't provide a name, return
        if (!newJobName) return;

        // Create a new job with minimum attributes
        const csrfToken = await fetchCsrfToken();
        const newJob = {
            name: newJobName,
            startState: { id: job.startState.id },
            endState: { id: job.endState.id }
        };

        // Step 1: Create the new job
        const createdJob = await createJob(newJob, csrfToken);
        if (!createdJob.id) {
            showAlertModal('Error', 'Failed to create copied job');
            return;
        }

        // Step 2: Add job states to the new job
        for (const state of job.jobStates) {
            if (state.id !== job.startState.id && state.id !== job.endState.id) {
                await addJobStateToJob(createdJob.id, state.id, csrfToken);
            }
        }

        // Step 3: Add transitions between job states of the new job
        for (let i = 0; i < job.fromJobStateIds.length; i++) {
            const fromStateId = job.fromJobStateIds[i];
            const toStateId = job.toJobStateIds[i];
            await addJobTransition(createdJob.id, fromStateId, toStateId, csrfToken);
        }

        // Reload jobs after copying is completed
        loadJobs();
    } catch (error) {
        console.error('Error copying job:', error);
        showAlertModal('Error', 'Failed to copy job. Please try again.');
    }
}


