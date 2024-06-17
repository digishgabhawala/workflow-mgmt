document.addEventListener('DOMContentLoaded', loadArchivedOrders);

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

// Function to apply filter to archived orders
function applyFilter() {
    const filterOrderType = document.getElementById('filterOrderType').value.toLowerCase();
    const filterPriority = document.getElementById('filterPriority').value;
    const filterOwnerDetails = document.getElementById('filterOwnerDetails').value.toLowerCase();
    const filterNote = document.getElementById('filterNote').value.toLowerCase();
    const filterCreationDate = document.getElementById('filterCreationDate').value.toLowerCase();

    const archivedOrderTableBody = document.getElementById('archivedOrderTableBody');
    const rows = archivedOrderTableBody.getElementsByTagName('tr');

    for (let row of rows) {
        const orderType = row.cells[1].textContent.toLowerCase();
        const ownerDetails = row.cells[2].textContent.toLowerCase();
        const priority = row.cells[3].textContent;
        const creationDate = row.cells[6].textContent.toLowerCase();
        const note = row.cells[7].textContent.toLowerCase();

        const matchesOrderType = !filterOrderType || orderType.includes(filterOrderType);
        const matchesPriority = !filterPriority || priority === filterPriority;
        const matchesOwnerDetails = !filterOwnerDetails || ownerDetails.includes(filterOwnerDetails);
        const matchesNote = !filterNote || note.includes(filterNote);
        const matchesCreationDate = !filterCreationDate || creationDate.includes(filterCreationDate);

        if (matchesOrderType && matchesPriority && matchesOwnerDetails && matchesNote && matchesCreationDate) {
            row.style.display = ''; // Show the row
        } else {
            row.style.display = 'none'; // Hide the row
        }
    }
}

// Add event listeners to filter input fields for real-time filtering
document.getElementById('filterOrderType').addEventListener('input', applyFilter);
document.getElementById('filterPriority').addEventListener('input', applyFilter);
document.getElementById('filterOwnerDetails').addEventListener('input', applyFilter);
document.getElementById('filterNote').addEventListener('input', applyFilter);
document.getElementById('filterCreationDate').addEventListener('input', applyFilter);

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
    const creationDate = formatTimestamp(archivedOrder.creationDate); // Format the creation date

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${archivedOrder.id}</td>
        <td>${archivedOrder.orderType}</td>
        <td>${ownerDetails}</td>
        <td>${archivedOrder.priority}</td>
        <td>${archivedOrder.amount}</td>
        <td>${formattedTotalTime}</td>
        <td>${creationDate}</td>
        <td>${archivedOrder.note ? archivedOrder.note : 'N/A'}</td>
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

        // Show and reset the filter form and the archived order table
        document.getElementById('archivedOrderTable').classList.remove('d-none');
        applyFilter(); // Apply filter to the newly loaded data
    } catch (error) {
        console.error('Error loading archived orders:', error);
        showAlertModal('Error', 'Failed to load archived orders. Please try again.');
    }
}

