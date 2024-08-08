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
            <button class="btn btn-sm btn-primary btn-block" onclick="document.getElementById('additionalFieldsForm-${job.id}').classList.toggle('d-none');addAdditionalField(${job.id}, document.getElementById('additionalFieldsContainer-${job.id}'),true)">
                <i class="fas fa-plus"></i> Add Form Fields
            </button>
            <div id="additionalFieldsContainer-${job.id}">
            </div>
            <form id="additionalFieldsForm-${job.id}" class="d-none mt-2" onsubmit="handleAddFormFields(event, ${job.id})">
                <button type="button" class="btn btn-secondary btn-sm" onclick="addAdditionalField(${job.id}, document.getElementById('additionalFieldsContainer-${job.id}'),true)">Add Another Field</button>
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
            console.log('index',index)
            addAdditionalField(job.id, additionalFieldsContainer,false, field);
        });
    }

    return card;
}


async function addAdditionalField(jobId, container,expand , field = { fieldName: "New Additional Field", fieldType: "", partOfForm: "", mandatory: false }) {
    // Fetch field types (with caching)
    const fieldTypes = await fetchSupportedFieldTypes();

    const fieldId = container.children.length;
    console.log('fieldId',fieldId)


    const fieldCard = document.createElement('div');
    fieldCard.classList.add('card', 'mb-3', 'additional-field-group');
    fieldCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="card-title m-0">${field.fieldName || 'New Additional Field'}</h6>
            <div class="ml-auto d-flex align-items-center">
                <button class="btn btn-sm btn-danger mr-2" onclick="deleteAdditionalField(${jobId}, ${fieldId}, this)">
                    <i class="fas fa-trash"></i>
                </button>
                <i class="fas fa-chevron-down ml-2"></i>
            </div>
        </div>
        <div class="card-body ${expand ? '' : 'd-none'}">
            <input type="hidden" id="fieldChanged-${jobId}-${fieldId}" value="false">
            <div class="form-group">
                <label for="fieldName-${jobId}-${fieldId}">Field Name:</label>
                <input type="text" id="fieldName-${jobId}-${fieldId}" name="fieldName-${jobId}" class="form-control" value="${field.fieldName}" oninput="updateFieldName(${jobId}, ${fieldId}, this); markFieldChanged(${jobId}, ${fieldId});">
                <div class="invalid-feedback">Field name is required.</div>
            </div>
            <div class="form-group">
                <label for="fieldType-${jobId}-${fieldId}">Field Type:</label>
                <select id="fieldType-${jobId}-${fieldId}" name="fieldType-${jobId}-${fieldId}" class="form-control" onchange="markFieldChanged(${jobId}, ${fieldId});">
                    ${fieldTypes.map(type => `
                        <option value="${type}" ${field.fieldType === type ? "selected" : ""}>${type}</option>
                    `).join('')}
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

    // Automatically expand the field card if `expand` is true
    if (expand) {
        fieldCardBody.classList.remove('d-none');
        const icon = fieldCardHeader.querySelector('.fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    }
}
