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
        alert('Failed to initialize order form. Please try again.');
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
        alert('Failed to populate order type dropdown. Please try again.');
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

    const order = {
        orderType: { id: orderTypeId },
        priority: priority || 1,
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
            alert('Order created successfully!');
            window.location.reload();
        } else {
            alert('Failed to create order. Please try again.');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Failed to create order. Please try again.');
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
        alert('Failed to load orders. Please try again.');
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

// Function to create an order row element for the table
function createOrderRow(order) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${order.id}</td>
        <td>${order.orderType.name}</td>
        <td>${order.currentState ? order.currentState.name : 'N/A'}</td>
        <td>${order.ownerDetails ? order.ownerDetails.ownerName : 'N/A'}</td>
        <td>${order.ownerDetails ? order.ownerDetails.ownerAddress : 'N/A'}</td>
        <td>${order.ownerDetails ? order.ownerDetails.ownerEmail : 'N/A'}</td>
        <td>${order.ownerDetails ? order.ownerDetails.ownerMobile : 'N/A'}</td>
        <td>${order.priority ? order.priority : 'N/A'}</td>
        <td>${order.note ? order.note : 'N/A'}</td>
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
        alert('Order deleted successfully!');
        window.location.reload();
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
    }
}

// Function to toggle the visibility of the order form
function toggleOrderForm() {
    const orderForm = document.getElementById('orderForm');
    orderForm.classList.toggle('d-none');
}
