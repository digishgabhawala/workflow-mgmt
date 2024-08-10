async function addAdditionalFieldsInContainer(order, cardBody) {
    if (order.additionalFields) {
        const additionalFields = JSON.parse(order.additionalFields);
        const additionalFieldsHtml = await Promise.all(Object.entries(additionalFields).map(async ([key, value]) => {
            if (isValidURL(value)) {
                if (value.endsWith('.jpg') || value.endsWith('.jpeg') || value.endsWith('.png') || value.endsWith('.gif')) {
                    // Assume it's an image URL
                    const fileId = extractFileIdFromURL(value); // Function to extract file ID from URL
                    return `
                        <p><strong>${key}:</strong>
                            <img src="/files/icon/${fileId}" alt="${key}" class="thumbnail-image" onclick="openImagePopup('${value}')">
                        </p>
                        <p><a href="${value}" target="_blank">Download</a></p>
                    `;
                } else {
                    return `<p><strong>${key}:</strong> <a href="${value}" target="_blank">Download</a></p>`;
                }
            }
            return `<p><strong>${key}:</strong> ${value}</p>`;
        }));

        cardBody.innerHTML += additionalFieldsHtml.join('');
    }
}

function openImagePopup(imageUrl) {
    const popup = document.createElement('div');
    popup.classList.add('image-popup');
    popup.innerHTML = `
        <div class="popup-content">
            <span class="close-button" onclick="closeImagePopup()">&times;</span>
            <img src="${imageUrl}" alt="Full Size Image">
        </div>
    `;
    document.body.appendChild(popup);
}

function closeImagePopup() {
    const popup = document.querySelector('.image-popup');
    if (popup) {
        document.body.removeChild(popup);
    }
}

function extractFileIdFromURL(url) {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1]; // Assuming fileId is the last part of the URL
}

function additionalFields(order){
    if (order.additionalFields) {
            const additionalFields = JSON.parse(order.additionalFields);
            for (const [key, value] of Object.entries(additionalFields)) {
                const fieldElement = document.createElement('p');
                fieldElement.innerHTML = `<strong>${key}:</strong> ${value}`;
                additionalFieldsContainer.appendChild(fieldElement);
            }
        }
}

function isValidURL(value) {

    if (typeof value === 'string' && value.startsWith('/files/download/') ) {
            return true;
    }
    return false;
}

function populateAdditionalFields(additionalFields) {
    const dynamicFieldsContainer = document.getElementById('dynamicFields');
    dynamicFieldsContainer.innerHTML = ''; // Clear any existing fields

    additionalFields.forEach(field => {
        if (['text', 'number', 'date', 'file'].includes(field.fieldType)) {
            const formGroup = document.createElement('div');
            formGroup.classList.add('form-group');
            const label = document.createElement('label');
            label.textContent = field.fieldName;
            formGroup.appendChild(label);

            let input;
            switch (field.fieldType) {
                case 'text':
                    input = document.createElement('input');
                    input.type = 'text';
                    break;
                case 'number':
                    input = document.createElement('input');
                    input.type = 'number';
                    break;
                case 'date':
                    input = document.createElement('input');
                    input.type = 'date';
                    break;
                case 'file':
                    input = createFileField(field);
                    break;
            }

            input.id = field.fieldName;
            input.classList.add('form-control');
            if (field.mandatory) {
                input.required = true;
            }
            formGroup.appendChild(input);
            dynamicFieldsContainer.appendChild(formGroup);
        }
    });
}

function createFileField(field) {
    const input = document.createElement('input');
    input.type = 'file';
    input.dataset.fieldId = field.fieldName;

    // Add file size and type validation
    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!validateFile(file)) {
            showAlertModal('Error', 'Invalid file type or size. Please upload a PDF or image file under 5MB.');
            event.target.value = ''; // Reset the input
        }
    });

    return input;
}

function validateFile(file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
        return false;
    }

    if (file.size > maxSize) {
        return false;
    }

    return true;
}

async function getAdditionalFieldsJsonFromForm(){
    const additionalFields = {};
    const formControls = document.querySelectorAll('#dynamicFields .form-control');
    for (const input of formControls) {
        if (input.type === 'file' && input.files.length > 0) {
            // Handle file upload
            const file = input.files[0];
            try {
                const fileID = await uploadFile(file);
                additionalFields[input.id] = fileID;
            } catch (error) {
                console.error('Error uploading file:', error);
                showAlertModal('Error', 'Failed to upload file. Please try again.');
                isSubmitting = false;
                return;
            }
        } else {
            additionalFields[input.id] = input.value;
        }
    }
    return additionalFields;
}

async function uploadFile(file) {
    const csrfToken = await fetchCsrfToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/files/upload', {
            method: 'POST',
            headers: {
                'X-CSRF-Token': csrfToken
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.fileDownloadUri; // Assuming the backend returns a JSON with the fileDownloadUri
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}
