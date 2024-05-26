document.addEventListener('DOMContentLoaded', async () => {
    try {
        const csrfToken = await fetchCsrfToken();
//        await loadUserName();
        await loadMyOrders(csrfToken);
        await loadAvailableOrders(csrfToken);

//        document.getElementById('logoutButton').addEventListener('click', async () => {
//            await logout(csrfToken);
//        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
});

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
        const myOrdersTableBody = document.getElementById('myOrdersTable').querySelector('tbody');
        myOrdersTableBody.innerHTML = '';

        myOrders.forEach(order => {
            const row = myOrdersTableBody.insertRow();
            row.insertCell(0).textContent = order.id;
            row.insertCell(1).textContent = order.orderType.name;
            row.insertCell(2).textContent = order.currentState.name;
            row.insertCell(3).textContent = order.note || 'N/A';
            row.insertCell(4).textContent = order.ownerDetails ? `${order.ownerDetails.ownerName} / ${order.ownerDetails.ownerMobile}` : 'N/A';

            const actionCell = row.insertCell(5);
            const doneButton = document.createElement('button');
            doneButton.textContent = 'Mark as Done';
            doneButton.className = 'btn btn-success btn-sm';
            doneButton.addEventListener('click', () => markAsDone(order, csrfToken));
            actionCell.appendChild(doneButton);
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
        const availableOrdersTableBody = document.getElementById('availableOrdersTable').querySelector('tbody');
        availableOrdersTableBody.innerHTML = '';

        availableOrders.forEach(order => {
            const row = availableOrdersTableBody.insertRow();
            row.insertCell(0).textContent = order.id;
            row.insertCell(1).textContent = order.orderType.name;
            row.insertCell(2).textContent = order.currentState.name;
            row.insertCell(3).textContent = order.note || 'N/A';
            row.insertCell(4).textContent = order.ownerDetails ? `${order.ownerDetails.ownerName} / ${order.ownerDetails.ownerMobile}` : 'N/A';

            const actionCell = row.insertCell(5);
            const assignButton = document.createElement('button');
            assignButton.textContent = 'Assign to Me';
            assignButton.className = 'btn btn-primary btn-sm';
            assignButton.addEventListener('click', () => assignOrderToMe(order.id, csrfToken));
            actionCell.appendChild(assignButton);
        });
    } catch (error) {
        console.error('Error loading available orders:', error);
    }
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

        // Refresh the orders after marking as done
        await loadMyOrders(csrfToken);
        await loadAvailableOrders(csrfToken);
    } catch (error) {
        console.error('Error marking order as done:', error);
    }
}

async function assignOrderToMe(orderId, csrfToken) {
    try {
        const response = await fetch(`/orders/${orderId}/assignToMe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to assign order to me');
        }

        // Refresh the orders after assignment
        await loadMyOrders(csrfToken);
        await loadAvailableOrders(csrfToken);
    } catch (error) {
        console.error('Error assigning order to me:', error);
    }
}
