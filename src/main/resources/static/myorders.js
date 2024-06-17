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

        const myOrders = await response.json();
        const currentOrdersCards = document.getElementById('currentOrdersCards');
        currentOrdersCards.innerHTML = '';

        myOrders.forEach(order => {
            addOrderCard(order, currentOrdersCards, 'Mark as Done', markAsDone, csrfToken);
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

        const availableOrders = await response.json();
        const availableOrdersCards = document.getElementById('availableOrdersCards');
        availableOrdersCards.innerHTML = '';

        availableOrders.forEach(order => {
            addOrderCard(order, availableOrdersCards, 'Assign to Me', assignOrderToMe, csrfToken);
        });
    } catch (error) {
        console.error('Error loading available orders:', error);
    }
}

function addOrderCard(order, container, buttonText, actionFunction, csrfToken) {
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
                <button class="btn btn-primary">${buttonText}</button>
            </div>
        </div>
    `;

    const cardHeader = card.querySelector('.card-header');
    const cardBody = card.querySelector('.card-body');
    const actionButton = card.querySelector('.btn');

    cardHeader.addEventListener('click', () => {
        cardBody.classList.toggle('d-none');
        const icon = cardHeader.querySelector('.fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });

    actionButton.addEventListener('click', () => actionFunction(order, csrfToken));

    container.appendChild(card);
}

async function markAsDone(order, csrfToken) {
    try {
        const currentStateId = order.currentState.id;
        const currentStateIndex = order.orderType.fromJobStateIds.indexOf(currentStateId);
        const nextStateId = order.orderType.toJobStateIds[currentStateIndex];

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
        console.error('Error marking order as done:', error);
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
