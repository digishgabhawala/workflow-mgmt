document.addEventListener('DOMContentLoaded', initializeOrderForm);

// Function to initialize the order creation form
async function initializeOrderForm() {
    try {
        await populateOrderTypeDropdown();
        const orderForm = document.getElementById('orderForm');
        if (!orderForm.getAttribute('data-listener-added')) {
            orderForm.addEventListener('submit', handleSubmitOrder);
            orderForm.setAttribute('data-listener-added', 'true');
        }
        await loadOrders(); // Load existing orders on page load
    } catch (error) {
        console.error('Error initializing order form:', error);
        showAlertModal('Error', 'Failed to initialize order form. Please try again.');
    }
}

// Function to populate the order type dropdown
async function populateOrderTypeDropdown() {
    try {
        const orderTypes = await fetchOrderTypes();
        const orderTypeDropdown = document.getElementById('orderType');
        orderTypeDropdown.innerHTML = '';

        const activeOrderTypes = orderTypes.filter(orderType => !orderType.archived);

        activeOrderTypes.forEach(orderType => {
            const option = document.createElement('option');
            option.value = orderType.id;
            option.textContent = orderType.name;
            option.dataset.additionalFields = JSON.stringify(orderType.additionalFields);
            orderTypeDropdown.appendChild(option);
        });

        orderTypeDropdown.addEventListener('change', handleOrderTypeChange);
    } catch (error) {
        console.error('Error populating order type dropdown:', error);
        showAlertModal('Error', 'Failed to populate order type dropdown. Please try again.');
    }
}

// Function to handle order type change and populate additional fields
function handleOrderTypeChange(event) {
    const selectedOrderType = event.target.options[event.target.selectedIndex];
    const additionalFields = JSON.parse(selectedOrderType.dataset.additionalFields);
    populateAdditionalFields(additionalFields);
}

// Function to populate additional fields based on the selected order type
function populateAdditionalFields(additionalFields) {
    const dynamicFieldsContainer = document.getElementById('dynamicFields');
    dynamicFieldsContainer.innerHTML = ''; // Clear any existing fields

    additionalFields.forEach(field => {
        if (['text', 'number', 'date'].includes(field.fieldType)) {
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

// Function to fetch order types from the backend
async function fetchOrderTypes() {
    try {
        const response = await fetch('/jobs');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching order types:', error);
        throw new Error('Failed to fetch order types');
    }
}

// Function to fetch the CSRF token from the backend
async function fetchCsrfToken() {
    try {
        const response = await fetch('/csrf-token');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        throw new Error('Failed to fetch CSRF token');
    }
}

// Function to create a new order
async function createOrder(order) {
    const csrfToken = await fetchCsrfToken();
    try {
        console.log('Payload being sent:', JSON.stringify(order)); // Add this line to log the payload
        const response = await fetch('/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(order)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
    }
}

// Function to handle order form submission
let isSubmitting = false; // Track if a submission is in progress

async function handleSubmitOrder(event) {
    event.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions
    isSubmitting = true;

    const orderTypeId = document.getElementById('orderType').value;
    const priority = document.getElementById('priority').value;
    const ownerName = document.getElementById('ownerName').value;
    const ownerAddress = document.getElementById('ownerAddress').value;
    const ownerEmail = document.getElementById('ownerEmail').value;
    const ownerMobile = document.getElementById('ownerMobile').value;
    const note = document.getElementById('note').value;
    const amount = document.getElementById('amount').value;

    const additionalFields = Array.from(document.querySelectorAll('#dynamicFields .form-control')).reduce((acc, input) => {
        acc[input.id] = input.value;
        return acc;
    }, {});

    const order = {
        orderType: { id: orderTypeId },
                priority: priority || 1,
                amount: amount || null,
                ownerDetails: {
                    ownerName: ownerName || null,
                    ownerAddress: ownerAddress || null,
                    ownerEmail: ownerEmail || null,
                    ownerMobile: ownerMobile || null
                },
                note: note || null,
                additionalFields : JSON.stringify(additionalFields) || null
    };

    try {
        const createdOrder = await createOrder(order);
        if (createdOrder.id) {
            showAlertModal('Success', 'Order created successfully!', () => {
                window.location.reload();
            });
        } else {
            showAlertModal('Error', 'Failed to create order. Please try again.');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        showAlertModal('Error', 'Failed to create order. Please try again.');
    } finally {
        isSubmitting = false; // Reset the submission flag
    }
}

// Function to load existing orders
async function loadOrders() {
    try {
        let orders = await fetchOrders();
        orders = sortOrders(orders);
        const orderCardsContainer = document.getElementById('orderCards');
        orderCardsContainer.innerHTML = '';

        orders.forEach(order => {
            addOrderCard(order); // Add each order as a collapsible card
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlertModal('Error', 'Failed to load orders. Please try again.');
    }
}

// Function to create a card element for an order
function addOrderCard(order) {
    const orderCardsContainer = document.getElementById('orderCards');

    const card = document.createElement('div');
    card.classList.add('card', 'mb-3');
    card.dataset.orderId = order.id;

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header', 'd-flex', 'justify-content-between', 'align-items-center');

    const ownerName = order.ownerDetails ? order.ownerDetails.ownerName : 'N/A';
    const passedTimeData = calculatePassedTime(order);
    const { actualTimePassed, estimatedTimePassed, netDelayMinutes } = passedTimeData;

    let warningIconHTML = '';
    if (netDelayMinutes !== null) {
        warningIconHTML = '<i class="fas fa-exclamation-triangle text-warning mx-1"></i>';
    }
    let dangerIcon = '';
    if(!order.currentUser){
       dangerIcon = '<i class="fas fa-exclamation-circle text-danger mx-1"></i>';
    }

    cardHeader.innerHTML = `
        <div>
            <span class="badge bg-primary">${ownerName}</span>
            ${order.priority ? `<span class="badge bg-secondary">${order.priority}</span>` : ''}
            ${dangerIcon}
            ${warningIconHTML}
        </div>
        <div>
            <span class="badge bg-info">${order.currentState ? order.currentState.name : 'N/A'}</span>
            <i class="fas fa-chevron-down"></i>
        </div>
    `;

    cardHeader.addEventListener('click', () => {
        cardBody.classList.toggle('d-none');
        const icon = cardHeader.querySelector('.fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });

    const cardBody = document.createElement('div');
    const { pendingStates, passedStates } = getPendingStatesAndPassedStates(order);

    cardBody.classList.add('card-body', 'd-none');
    cardBody.innerHTML = `
        <p><strong>Owner Details:</strong><br>
           Name: ${order.ownerDetails ? order.ownerDetails.ownerName : 'N/A'}<br>
           Address: ${order.ownerDetails ? order.ownerDetails.ownerAddress : 'N/A'}<br>
           Email: ${order.ownerDetails ? order.ownerDetails.ownerEmail : 'N/A'}<br>
           Mobile: ${order.ownerDetails ? order.ownerDetails.ownerMobile : 'N/A'}</p>
        <p><strong>Priority:</strong> ${order.priority ? order.priority : 'N/A'}</p>
        <p><strong>Amount:</strong> ${order.amount ? order.amount : 'N/A'}</p>
        <p><strong>Note:</strong> ${order.note ? order.note : 'N/A'}</p>
        <p><strong>Creation Date:</strong> ${formatTimestamp(order.timestamp)}</p>
        <p><strong>Assigned to: </strong> ${order.currentUser ? order.currentUser.username : 'N/A'}</p>
        <p><strong>Pending States:</strong> ${pendingStates}</p>
        <p><strong>Completed States:</strong> ${passedStates}</p>
        <p><strong>Pending Time:</strong> ${calculateTotalEstimate(order, pendingStates)}</p>
        <p><strong>Passed Time: </strong> ${formatPassedTimeString(passedTimeData)}</p>
    `;

     if (order.additionalFields) {
            const additionalFields = JSON.parse(order.additionalFields);
            const additionalFieldsHtml = Object.entries(additionalFields).map(([key, value]) => `
                <p><strong>${key}:</strong> ${value}</p>
            `).join('');
            cardBody.innerHTML += `${additionalFieldsHtml}`;
        }

        cardBody.innerHTML += `
            <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Delete</button>
        `;

    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    orderCardsContainer.appendChild(card);
}


// Function to fetch existing orders from the backend
async function fetchOrders() {
    try {
        const response = await fetch('/orders');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
    }
}

// Function to sort orders based on criteria
function sortOrders(orders) {
    // First, sort by order.currentUser (null values first) and then by order.priority
    return orders.sort((a, b) => {
        // Sorting by currentUser (null first)
        if (!a.currentUser && b.currentUser) return -1;
        if (a.currentUser && !b.currentUser) return 1;
        // If both have the same currentUser status, then sort by priority
        const priorityA = a.priority || 0;
        const priorityB = b.priority || 0;
        return priorityA - priorityB;
    });
}

// Function to format timestamp into 'DD-MM-YY HH:MM'
function formatTimestamp(timestamp) {
    const date = timestampToDate(timestamp);

    const dayStr = String(date.getDate()).padStart(2, '0');
    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
    const yearStr = String(date.getFullYear()).slice(-2);
    const hourStr = String(date.getHours()).padStart(2, '0');
    const minuteStr = String(date.getMinutes()).padStart(2, '0');
    return `${dayStr}-${monthStr}-${yearStr} ${hourStr}:${minuteStr}`;
}

// Function to calculate total estimate time from pending states
function calculateTotalEstimate(order, pendingPaths) {
    const orderType = order.orderType;
    const jobStates = orderType.jobStates;

    function calculateEstimateForPath(path) {
        let totalHours = 0;
        let totalMinutes = 0;

        path.forEach(stateName => {
            const jobState = jobStates.find(state => state.name === stateName);
            if (jobState && jobState.estimate) {
                totalHours += jobState.estimate[0];
                totalMinutes += jobState.estimate[1];
            }
        });

        totalHours += Math.floor(totalMinutes / 60);
        totalMinutes = totalMinutes % 60;

        return `${totalHours}h ${totalMinutes}m`;
    }

    const paths = pendingPaths.split(' | ').map(path => path.split(' -> '));
    const estimates = paths.map(calculateEstimateForPath);

    return estimates.join(' | ');
}


// Function to format hours and minutes into 'Xh Ym' format
function formatTime(hours, minutes) {
    return `${hours}h ${minutes}m`;
}

// Function to parse actual time difference into hours and minutes
function parseActualTime(timeString) {
    const regex = /(\d+)h (\d+)m/;
    const match = timeString.match(regex);
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        return [hours, minutes];
    } else {
        return [0, 0]; // Default to 0 if parsing fails
    }
}

// Function to convert timestamp array to Date object
function timestampToDate(timestamp) {
    const [year, month, day, hour, minute, second, nanosecond] = timestamp;
    const formattedDate = new Date(year, month - 1, day, hour, minute, second, nanosecond / 1000000);
    return formattedDate;
}

// Helper function to parse estimated time into hours and minutes
function parseEstimateTime(estimatedTime) {
    const regex = /(\d+)h (\d+)m/g;
    const matches = [...estimatedTime.matchAll(regex)];
    if (matches.length === 1) {
        return [parseInt(matches[0][1]), parseInt(matches[0][2])];
    }
    return [0, 0];
}

// Function to delete an order
async function deleteOrder(orderId) {
    const csrfToken = await fetchCsrfToken();
    try {
        const response = await fetch(`/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-Token': csrfToken
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        showAlertModal('Success', 'Order deleted successfully!', () => {
            window.location.reload();
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        showAlertModal('Error', 'Failed to delete order. Please try again.');
    }
}

// Function to calculate time difference between two dates
function calculateTimeDifference(now, startTimeDate) {
    const diffMs = now - startTimeDate;
    const diffHrs = Math.floor(diffMs / 3600000); // milliseconds to hours
    const diffMins = Math.floor((diffMs % 3600000) / 60000); // remaining milliseconds to minutes

    return `${diffHrs}h ${diffMins}m`;
}

function calculatePassedTime(order) {
    const { pendingStates, passedStates } = getPendingStatesAndPassedStates(order);

    const actualTimePassed = calculateActualTimePassed(order.timestamp);
    const orderType = order.orderType;
    const estimatedTimePassed = calculateTotalEstimateTime(orderType.jobStates, passedStates);

    const actualMinutes = actualTimePassed.hours * 60 + actualTimePassed.minutes;
    const estimatedMinutes = estimatedTimePassed.hours * 60 + estimatedTimePassed.minutes;

    let netDelayMinutes = null;
    if (actualMinutes > estimatedMinutes) {
        netDelayMinutes = actualMinutes - estimatedMinutes;
    }

    return {
        actualTimePassed,
        estimatedTimePassed,
        netDelayMinutes
    };
}

function formatPassedTimeString(passedTimeData) {
    const { actualTimePassed, estimatedTimePassed, netDelayMinutes } = passedTimeData;

    const actualTimeStr = `${actualTimePassed.hours}h ${actualTimePassed.minutes}m`;
    const estimatedTimeStr = `${estimatedTimePassed.hours}h ${estimatedTimePassed.minutes}m`;

    let result = `[${actualTimeStr} / ${estimatedTimeStr}]`;

    if (netDelayMinutes !== null) {
        const netDelayHours = Math.floor(netDelayMinutes / 60);
        const netDelayRemainderMinutes = netDelayMinutes % 60;
        const netDelayStr = `${netDelayHours}h ${netDelayRemainderMinutes}m`;
        result += ` [Net ${netDelayStr} delay]`;
    }

    return result;
}

function calculateActualTimePassed(orderTimestamp) {
    const orderTime = timestampToDate(orderTimestamp);

    const currentTime = new Date();

    let diff = currentTime - orderTime;

    let minutes = Math.floor(diff / 60000);
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;

    return {
        hours: hours,
        minutes: minutes
    };
}

function calculateTotalEstimateTime(jobStates, statesData) {
    const states = statesData.split(' -> ');

    let totalHours = 0;
    let totalMinutes = 0;

    states.forEach(stateName => {
        const jobState = jobStates.find(state => state.name === stateName);
        if (jobState && jobState.estimate) {
            totalHours += jobState.estimate[0];
            totalMinutes += jobState.estimate[1];
        }
    });

    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    return {
        hours: totalHours,
        minutes: totalMinutes
    };
}

function getPendingStatesAndPassedStates(order) {
    const orderType = order.orderType;
    const currentState = order.currentState;
    const fromJobStateIds = orderType.fromJobStateIds;
    const toJobStateIds = orderType.toJobStateIds;
    const startState = orderType.startState;
    const endState = orderType.endState;

    const jobStatesMap = new Map(orderType.jobStates.map(state => [state.id, state]));

    function traversePath(startId, endId, path) {
        let currentStateId = startId;
        let currentIndex = fromJobStateIds.indexOf(currentStateId);

        while (currentStateId !== endId && currentIndex !== -1) {
            const nextStateId = toJobStateIds[currentIndex];
            const nextState = jobStatesMap.get(nextStateId);

            if (!nextState) break;

            path.push(nextState.name);
            currentStateId = nextState.id;
            currentIndex = fromJobStateIds.indexOf(currentStateId);
        }

        return path;
    }


    let path = [];
    path.push(startState.name);
    const passedStatesPath = traversePath(startState.id, currentState.id, path);
    path = [];
    const pendingStatesPath = traversePath(currentState.id, endState.id, path );

    return {
        pendingStates: pendingStatesPath.join(' -> '),
        passedStates: passedStatesPath.join(' -> ')
    };
}

// Function to toggle the order creation form visibility
function toggleOrderForm() {
    const orderForm = document.getElementById('orderForm');
    orderForm.classList.toggle('d-none');
    const toggleButton = document.getElementById('toggleOrderFormButton');
    toggleButton.textContent = orderForm.classList.contains('d-none') ? 'Create New Order' : 'Cancel';
}
