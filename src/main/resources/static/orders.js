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

// Function to load orders and populate the order table
async function loadOrders() {
    try {
        const orders = await fetchOrders();
        const orderTableBody = document.getElementById('orderTableBody');
        orderTableBody.innerHTML = '';

        orders.forEach(order => {
            const orderRow = createOrderRow(order);
            orderTableBody.appendChild(orderRow);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlertModal('Error','Failed to load orders. Please try again.');
    }
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

// Function to create an order row element for the table
function createOrderRow(order) {
    const startTime = formatTimestamp(order.timestamp);
    const endTime = startTime; // Initially set end time to start time

    const ownerDetails = order.ownerDetails
        ? `${order.ownerDetails.ownerName || 'N/A'}<br>
           ${order.ownerDetails.ownerAddress || 'N/A'}<br>
           ${order.ownerDetails.ownerEmail || 'N/A'}<br>
           ${order.ownerDetails.ownerMobile || 'N/A'}`
        : 'N/A';

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.orderType.name}</td>
        <td>${order.currentState ? order.currentState.name : 'N/A'}</td>
        <td>${ownerDetails}</td>
        <td>${order.priority ? order.priority : 'N/A'}</td>
        <td>${order.amount ? order.amount : 'N/A'}</td>
        <td>${order.note ? order.note : 'N/A'}</td>
        <td>${startTime}</td>
        <td>${endTime}</td>
        <td><button class="btn btn-danger" onclick="deleteOrder(${order.id})">Delete</button></td>
    `;
    return row;
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

// Function to toggle the visibility of the order form
function toggleOrderForm() {
    const orderForm = document.getElementById('orderForm');
    orderForm.classList.toggle('d-none');
}

// Function to create a row for archived orders
function createArchiveOrderRow(archivedOrder) {
    const ownerDetails = archivedOrder.ownerDetails
        ? `${archivedOrder.ownerDetails.ownerName || 'N/A'}<br>
           ${archivedOrder.ownerDetails.ownerAddress || 'N/A'}<br>
           ${archivedOrder.ownerDetails.ownerEmail || 'N/A'}<br>
           ${archivedOrder.ownerDetails.ownerMobile || 'N/A'}`
        : 'N/A';
    const totalTime = calculateTotalTime(archivedOrder.auditItems);
    const formattedTotalTime = formatTotalTime(totalTime);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${archivedOrder.id}</td>
        <td>${archivedOrder.orderType}</td>
        <td>${archivedOrder.currentState}</td>
        <td>${ownerDetails}</td>
        <td>${archivedOrder.priority}</td>
        <td>${archivedOrder.amount}</td>
        <td>${archivedOrder.note ? archivedOrder.note : 'N/A'}</td>
        <td>${formattedTotalTime}</td>
    `;
    return row;
}

// Function to load archived orders
async function loadArchivedOrders() {
    try {
        const archivedOrders = await fetchArchivedOrders();
        const archivedOrderTableBody = document.getElementById('archivedOrderTableBody');
        archivedOrderTableBody.innerHTML = '';

        archivedOrders.forEach(order => {
            const orderRow = createArchiveOrderRow(order);
            archivedOrderTableBody.appendChild(orderRow);
        });

        // Show the archived order table and hide the main order table
        document.getElementById('archivedOrderTable').classList.remove('d-none');
    } catch (error) {
        console.error('Error loading archived orders:', error);
        showAlertModal('Error','Failed to load archived orders. Please try again.');
    }
}

// Function to fetch archived orders from the backend
async function fetchArchivedOrders() {
    try {
        const response = await fetch('/orders/archived');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching archived orders:', error);
        throw new Error('Failed to fetch archived orders');
    }
}

// Function to convert timestamp array to Date object
function timestampToDate(timestamp) {
    const [year, month, day, hour, minute, second, nanosecond] = timestamp;
    return new Date(year, month - 1, day, hour, minute, second, nanosecond / 1000000);
}

// Function to calculate total time taken for an order
function calculateTotalTime(auditItems) {
    let totalTime = 0; // Time in milliseconds
    auditItems.forEach(item => {
        const createdAt = timestampToDate(item.createdAt);
        const archivedAt = timestampToDate(item.archivedAt);
        totalTime += (archivedAt - createdAt);
    });
    return totalTime;
}


// Function to format total time taken into 'HH:MM:SS'
function formatTotalTime(totalTime) {
    const seconds = Math.floor((totalTime / 1000) % 60);
    const minutes = Math.floor((totalTime / (1000 * 60)) % 60);
    const hours = Math.floor((totalTime / (1000 * 60 * 60)) % 24);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
