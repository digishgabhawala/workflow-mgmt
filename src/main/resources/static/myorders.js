document.addEventListener('DOMContentLoaded', async () => {
    try {
        const csrfToken = await fetchCsrfToken();
        await loadMyOrders(csrfToken);
        await loadAvailableOrders(csrfToken);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
});

async function loadMyOrders(csrfToken) {
    try {
        const response = await fetch('/orders/myOrders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch my orders');
        }

        let myOrders = await response.json();
        myOrders = sortOrdersByPriority(myOrders);

        const currentOrdersCards = document.getElementById('currentOrdersCards');
        currentOrdersCards.innerHTML = '';

        myOrders.forEach(order => {
            addOrderCard(order, currentOrdersCards, 'myOrders', csrfToken);
        });
    } catch (error) {
        console.error('Error loading my orders:', error);
    }
}

async function loadAvailableOrders(csrfToken) {
    try {
        const response = await fetch('/orders/availableOrdersForMe', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch available orders');
        }

        let availableOrders = await response.json();
        availableOrders = sortOrdersByPriority(availableOrders);

        const availableOrdersCards = document.getElementById('availableOrdersCards');
        availableOrdersCards.innerHTML = '';

        availableOrders.forEach(order => {
            addOrderCard(order, availableOrdersCards, 'availableOrders', csrfToken);
        });
    } catch (error) {
        console.error('Error loading available orders:', error);
    }
}

function sortOrdersByPriority(orders) {
    return orders.sort((a, b) => a.priority - b.priority);
}

function addOrderCard(order, container, type, csrfToken) {
    const card = document.createElement('div');
    card.classList.add('col');
    card.innerHTML = `
        <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge bg-primary">${order.ownerDetails ? order.ownerDetails.ownerName : 'N/A'}</span>
                    ${order.priority ? `<span class="badge bg-secondary">${order.priority}</span>` : ''}
                </div>
                <div>
                    <span class="badge bg-info">${order.currentState ? order.currentState.name : 'N/A'}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="card-body d-none">
                <p><strong>Owner Details:</strong><br>
                   Name: ${order.ownerDetails ? order.ownerDetails.ownerName : 'N/A'}<br>
                   Address: ${order.ownerDetails ? order.ownerDetails.ownerAddress : 'N/A'}<br>
                   Email: ${order.ownerDetails ? order.ownerDetails.ownerEmail : 'N/A'}<br>
                   Mobile: ${order.ownerDetails ? order.ownerDetails.ownerMobile : 'N/A'}</p>
                <p><strong>Order ID:</strong> ${order.id ? order.id : 'N/A'}</p>
                <p><strong>Order Type:</strong> ${order.orderType.name ? order.orderType.name : 'N/A'}</p>
                <p><strong>Current Status:</strong> ${order.currentState.name ? order.currentState.name : 'N/A'}</p>
                <p><strong>Priority:</strong> ${order.priority ? order.priority : 'N/A'}</p>
                <p><strong>Amount:</strong> ${order.amount ? order.amount : 'N/A'}</p>
                <p><strong>Note:</strong> ${order.note ? order.note : 'N/A'}</p>
                <p><strong>Assigned to:</strong> ${order.currentUser ? order.currentUser.username : 'N/A'}</p>
                <div class="additional-fields">
                    <!-- Additional fields will be inserted here -->
                </div>
                <div class="action-buttons mt-3">
                    <!-- Action buttons will be inserted here -->
                </div>
            </div>
        </div>
    `;

    const cardHeader = card.querySelector('.card-header');
    const cardBody = card.querySelector('.card-body');
    const additionalFieldsContainer = card.querySelector('.additional-fields');
    const actionButtonsContainer = card.querySelector('.action-buttons');

    cardHeader.addEventListener('click', () => {
        cardBody.classList.toggle('d-none');
        const icon = cardHeader.querySelector('.fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });

    // Add additional fields
    if (order.additionalFields) {
        const additionalFields = JSON.parse(order.additionalFields);
        for (const [key, value] of Object.entries(additionalFields)) {
            const fieldElement = document.createElement('p');
            fieldElement.innerHTML = `<strong>${key}:</strong> ${value}`;
            additionalFieldsContainer.appendChild(fieldElement);
        }
    }

    if (type === 'availableOrders') {
        const assignButton = document.createElement('button');
        assignButton.classList.add('btn', 'btn-primary', 'mr-2', 'mb-2');
        assignButton.textContent = 'Assign to Me';
        assignButton.addEventListener('click', () => assignOrderToMe(order, csrfToken));
        actionButtonsContainer.appendChild(assignButton);
    } else if (type === 'myOrders') {
        const currentStateId = order.currentState.id;
        order.orderType.fromJobStateIds.forEach((stateId, index) => {
            if (stateId === currentStateId) {
                const nextStateId = order.orderType.toJobStateIds[index];
                const nextState = order.orderType.jobStates.find(state => state.id === nextStateId);
                const nextStateName = nextState ? nextState.name : 'Unknown';

                const actionButton = document.createElement('button');
                actionButton.classList.add('btn', 'btn-primary', 'mr-2', 'mb-2');
                actionButton.textContent = `Move to ${nextStateName}`;
                actionButton.addEventListener('click', () => moveToState(order, nextStateId, csrfToken));

                actionButtonsContainer.appendChild(actionButton);
            }
        });
    }

    container.appendChild(card);
}

async function moveToState(order, nextStateId, csrfToken) {
    try {
        const response = await fetch(`/orders/${order.id}/moveToState?nextStateId=${nextStateId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to move order to next state');
        }

        await loadMyOrders(csrfToken);
        await loadAvailableOrders(csrfToken);
    } catch (error) {
        console.error('Error moving order to next state:', error);
    }
}

async function assignOrderToMe(order, csrfToken) {
    try {
        const response = await fetch(`/orders/${order.id}/assignToMe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to assign order to me');
        }

        await loadMyOrders(csrfToken);
        await loadAvailableOrders(csrfToken);
    } catch (error) {
        console.error('Error assigning order to me:', error);
    }
}
