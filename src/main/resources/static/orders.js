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
        showAlertModal('Error','Failed to initialize order form. Please try again.')
    }
}

// Function to populate the order type dropdown
async function populateOrderTypeDropdown() {
    try {
        const orderTypes = await fetchOrderTypes();
        const orderTypeDropdown = document.getElementById('orderType');
        orderTypeDropdown.innerHTML = '';

        orderTypes.forEach(orderType => {
            const option = document.createElement('option');
            option.value = orderType.id;
            option.textContent = orderType.name;
            orderTypeDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating order type dropdown:', error);
        showAlertModal('Error','Failed to populate order type dropdown. Please try again.');
    }
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
        note: note || null
    };

    try {
        const createdOrder = await createOrder(order);
        if (createdOrder.id) {

            showAlertModal('Success', 'Order created successfully!', () => {
                    window.location.reload();
                });

        } else {
            showAlertModal('Error','Failed to create order. Please try again.');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        showAlertModal('Error','Failed to create order. Please try again.');
    } finally {
        isSubmitting = false; // Reset the submission flag
    }
}
async function loadOrders() {
    try {
        const orders = await fetchOrders();
        orders.forEach(order => {
            addOrderCard(order); // Add each order as a collapsible card
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlertModal('Error', 'Failed to load orders. Please try again.');
    }
}

// Function to add an order card to the DOM
function addOrderCard(order) {
    const orderCardsContainer = document.getElementById('orderCards');

    const card = document.createElement('div');
    card.classList.add('card', 'mb-3');
    card.dataset.orderId = order.id;

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header', 'd-flex', 'justify-content-between', 'align-items-center');

    // Show owner name in header instead of order.id
    const ownerName = order.ownerDetails ? order.ownerDetails.ownerName : 'N/A';
    cardHeader.innerHTML = `
        <div>
            <span class="badge bg-primary">${ownerName}</span>
            ${order.priority ? `<span class="badge bg-secondary">${order.priority}</span>` : ''}
            ${!order.currentUser ? '<i class="fas fa-exclamation-circle text-danger mx-1"></i>' : ''}
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
        <p><strong>Assigned to:</strong> ${order.currentUser ? order.currentUser.username : 'N/A'}</p>
        <p><strong>Pending States:</strong> ${getPendingStates(order)}</p>
        <p><strong>Pending Time:</strong> ${calculateTotalEstimate(order, getPendingStates(order))}</p>
        <p><strong>Passed Time:</strong> ${calculateTimeDifference(new Date(), timestampToDate(order.timestamp))}</p>

        <button class="btn btn-danger" onclick="deleteOrder(${order.id})">Delete</button>
    `;

    card.appendChild(cardHeader);
    card.appendChild(cardBody);
    orderCardsContainer.appendChild(card);
}



// Function to fetch orders from the backend
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

// Function to format timestamp into 'DD-MM-YY HH:MM'
function formatTimestamp(timestamp) {
    const [year, month, day, hour, minute, second, nanosecond] = timestamp;
    const formattedDate = new Date(year, month - 1, day, hour, minute, second, nanosecond / 1000000);
    const dayStr = String(formattedDate.getDate()).padStart(2, '0');
    const monthStr = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const yearStr = String(formattedDate.getFullYear()).slice(-2);
    const hourStr = String(formattedDate.getHours()).padStart(2, '0');
    const minuteStr = String(formattedDate.getMinutes()).padStart(2, '0');
    return `${dayStr}-${monthStr}-${yearStr} ${hourStr}:${minuteStr}`;
}

// Function to calculate total estimate time from pending states
function calculateTotalEstimate(order, pendingStates) {
    const orderType = order.orderType;
    const jobStates = orderType.jobStates;

    let totalHours = 0;
    let totalMinutes = 0;

    pendingStates.split(' -> ').forEach(stateName => {
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

// Function to calculate time difference between two dates
function calculateTimeDifference(now, startTimeDate) {
    const diffMs = now - startTimeDate;
    const diffHrs = Math.floor(diffMs / 3600000); // milliseconds to hours
    const diffMins = Math.floor((diffMs % 3600000) / 60000); // remaining milliseconds to minutes

    return `${diffHrs}h ${diffMins}m`;
}

// Function to get pending states as a string representation
function getPendingStates(order) {
    const orderType = order.orderType;
    const currentState = order.currentState;
    const fromJobStateIds = orderType.fromJobStateIds;
    const toJobStateIds = orderType.toJobStateIds;
    const endState = orderType.endState;

    let pendingStates = [];
    let currentStateId = currentState.id;
    let currentIndex = fromJobStateIds.indexOf(currentStateId);

    while (currentStateId !== endState.id && currentIndex !== -1) {
        const nextStateId = toJobStateIds[currentIndex];
        const nextState = orderType.jobStates.find(state => state.id === nextStateId);

        if (!nextState) break;

        pendingStates.push(nextState.name);
        currentStateId = nextState.id;
        currentIndex = fromJobStateIds.indexOf(currentStateId);
    }

    return pendingStates.join(' -> ');
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
        showAlertModal('Success','Order deleted successfully!',() => {
                                                                       window.location.reload();
                                                                   });

    } catch (error) {
        console.error('Error deleting order:', error);
        showAlertModal('Error','Failed to delete order. Please try again.');
    }
}

// Function to convert timestamp array to Date object
function timestampToDate(timestamp) {
    const [year, month, day, hour, minute, second, nanosecond] = timestamp;
    return new Date(year, month - 1, day, hour, minute, second, nanosecond / 1000000);
}

// Function to toggle the visibility of the order form
function toggleOrderForm() {
    const orderForm = document.getElementById('orderForm');
    orderForm.classList.toggle('d-none');
}
