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
function calculateTotalTime(archivedOrder) {
    auditItems = archivedOrder.auditItems
    let totalTime = 0; // Time in milliseconds
    startTimestamp = timestampToDate(archivedOrder.creationDate);
    auditItems.forEach(item => {
        const archivedAt = timestampToDate(item.archivedAt);
        totalTime += (archivedAt - startTimestamp);
        startTimestamp = archivedAt;
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
function applyFilter1() {
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
    const totalTime = calculateTotalTime(archivedOrder);
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
let archivedOrderData = {}
let usersData = {}
let jobStatesData = {};

// Function to load archived orders
async function loadArchivedOrders() {
    try {
        const archivedOrders = await fetchArchivedOrders();
        archivedOrderData = archivedOrders;
        usersData = await fetchUsers();
        jobStatesData = await fetchJobStates();

        const archivedOrderTableBody = document.getElementById('archivedOrderTableBody');
        archivedOrderTableBody.innerHTML = '';

        archivedOrders.forEach(order => {
            const orderRow = createArchiveOrderRow(order);
            archivedOrderTableBody.appendChild(orderRow);
        });
        // Process and display analytics data
//        const analyticsData = processAnalyticsData(archivedOrders,users);
//        populateAnalyticsTable(analyticsData);


        // Show and reset the filter form and the archived order table
        document.getElementById('archivedOrderTable').classList.remove('d-none');
        applyFilter(); // Apply filter to the newly loaded data
    } catch (error) {
        console.error('Error loading archived orders:', error);
        showAlertModal('Error', 'Failed to load archived orders. Please try again.');
    }
}

function processAnalyticsData(orders, users, jobStates) {
    const userAnalyticsData = {};
    const jobStateAnalyticsData = {};
    const userIdToNameMap = {};
    const jobStateIdToNameMap = {};

    // Create a map from userId to userName
    users.forEach(user => {
        userIdToNameMap[user.id] = user.username;
    });

    // Create a map from jobStateId to jobStateName
    jobStates.forEach(state => {
        jobStateIdToNameMap[state.id] = state.name;
    });

    orders.forEach(order => {
        const auditItems = order.auditItems;
        const orderUsers = new Set();

        let startTimestamp = timestampToDate(order.creationDate);
        auditItems.forEach(item => {
            const userId = item.userId;
            const userName = userIdToNameMap[userId] || 'Unknown'; // Default to 'Unknown' if userId is not found
            const timeSpent = timestampToDate(item.archivedAt) - startTimestamp;
            startTimestamp = timestampToDate(item.archivedAt);
            const jobStateId = item.toStateId;
            const jobStateName = jobStateIdToNameMap[jobStateId] || 'Unknown'; // Default to 'Unknown' if jobStateId is not found

            // User-level analytics
            if (!userAnalyticsData[userId]) {
                userAnalyticsData[userId] = {
                    userName: userName,
                    jobsCompleted: 0,
                    ordersCompleted: 0,
                    totalTimeSpent: 0
                };
            }

            userAnalyticsData[userId].jobsCompleted += 1;
            userAnalyticsData[userId].totalTimeSpent += timeSpent;
            orderUsers.add(userId);

            // Job-state-level analytics
            if (!jobStateAnalyticsData[jobStateId]) {
                jobStateAnalyticsData[jobStateId] = {
                    jobStateName: jobStateName,
                    jobsCompleted: 0,
                    totalTimeSpent: 0
                };
            }

            jobStateAnalyticsData[jobStateId].jobsCompleted += 1;
            jobStateAnalyticsData[jobStateId].totalTimeSpent += timeSpent;
        });

        orderUsers.forEach(userId => {
            userAnalyticsData[userId].ordersCompleted += 1;
        });
    });

    return { userAnalyticsData, jobStateAnalyticsData };
}



// Function to format total time taken into 'HH:MM:SS'
function formatTime(totalTime) {
    const seconds = Math.floor((totalTime / 1000) % 60);
    const minutes = Math.floor((totalTime / (1000 * 60)) % 60);
    const hours = Math.floor((totalTime / (1000 * 60 * 60)) % 24);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function populateAnalyticsTables(userAnalyticsData, jobStateAnalyticsData) {
    // User analytics
    const userAnalyticsTableBody = document.getElementById('userAnalyticsTableBody');
    userAnalyticsTableBody.innerHTML = '';

    for (const userId in userAnalyticsData) {
        const { userName, jobsCompleted, ordersCompleted, totalTimeSpent } = userAnalyticsData[userId];
        const formattedTime = formatTime(totalTimeSpent);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${userName}</td> <!-- Display userName instead of userId -->
            <td>${jobsCompleted}</td>
            <td>${ordersCompleted}</td> <!-- Add column for orders completed -->
            <td>${formattedTime}</td>
        `;

        userAnalyticsTableBody.appendChild(row);
    }
    populateUserAnalyticsChart(userAnalyticsData);

    // Job-state analytics
    populateJobStateAnalyticsTable(jobStateAnalyticsData);
    populateJobStateAnalyticsChart(jobStateAnalyticsData);

}




async function fetchUsers() {
    const response = await fetch('/users');
    const data = await response.json();
    return data;
}

function filterOrders(orders) {
    const filterOrderType = document.getElementById('filterOrderType').value.toLowerCase();
    const filterPriority = document.getElementById('filterPriority').value;
    const filterOwnerDetails = document.getElementById('filterOwnerDetails').value.toLowerCase();
    const filterNote = document.getElementById('filterNote').value.toLowerCase();
    const filterCreationDate = document.getElementById('filterCreationDate').value.toLowerCase();

    return orders.filter(order => {
        const orderType = order.orderType.toLowerCase();
        const ownerDetails = order.ownerDetails ? `${order.ownerDetails.ownerName || 'N/A'} ${order.ownerDetails.ownerAddress || 'N/A'} ${order.ownerDetails.ownerEmail || 'N/A'} ${order.ownerDetails.ownerMobile || 'N/A'}`.toLowerCase() : 'N/A';
        const priority = order.priority;
        const creationDate = formatTimestamp(order.creationDate).toLowerCase();
        const note = order.note ? order.note.toLowerCase() : 'N/A';

        const matchesOrderType = !filterOrderType || orderType.includes(filterOrderType);
        const matchesPriority = !filterPriority || priority === filterPriority;
        const matchesOwnerDetails = !filterOwnerDetails || ownerDetails.includes(filterOwnerDetails);
        const matchesNote = !filterNote || note.includes(filterNote);
        const matchesCreationDate = !filterCreationDate || creationDate.includes(filterCreationDate);

        return matchesOrderType && matchesPriority && matchesOwnerDetails && matchesNote && matchesCreationDate;
    });
}

async function applyFilter() {
    const filterOrderType = document.getElementById('filterOrderType').value.toLowerCase();
    const filterPriority = document.getElementById('filterPriority').value;
    const filterOwnerDetails = document.getElementById('filterOwnerDetails').value.toLowerCase();
    const filterNote = document.getElementById('filterNote').value.toLowerCase();
    const filterCreationDate = document.getElementById('filterCreationDate').value.toLowerCase();

    const archivedOrderTableBody = document.getElementById('archivedOrderTableBody');
    const rows = archivedOrderTableBody.getElementsByTagName('tr');
    const filteredOrderIds = [];

    for (let row of rows) {
        const orderId = row.cells[0].textContent;
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
            filteredOrderIds.push(Number(orderId)); // Collect the order ID
        } else {
            row.style.display = 'none'; // Hide the row
        }
    }

    // Process and display analytics data based on the filtered order IDs
    await processFilteredAnalyticsData(filteredOrderIds);
}

async function processFilteredAnalyticsData(filteredOrderIds) {
    // Filter orders based on filteredOrderIds
    const filteredOrders = archivedOrderData.filter(order => filteredOrderIds.includes(order.id));

    // Process and display analytics data based on the filtered orders
    const { userAnalyticsData, jobStateAnalyticsData } = processAnalyticsData(filteredOrders, usersData, jobStatesData);
    populateAnalyticsTables(userAnalyticsData, jobStateAnalyticsData);
}


function populateJobAnalyticsTable(jobAnalyticsData) {
    const jobAnalyticsTableBody = document.getElementById('jobAnalyticsTableBody');
    jobAnalyticsTableBody.innerHTML = '';

    for (const jobName in jobAnalyticsData) {
        const { jobsCompleted, totalTimeSpent } = jobAnalyticsData[jobName];
        const avgTimeSpent = totalTimeSpent / jobsCompleted;
        const formattedTotalTime = formatTime(totalTimeSpent);
        const formattedAvgTime = formatTime(avgTimeSpent);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${jobName}</td>
            <td>${jobsCompleted}</td>
            <td>${formattedTotalTime}</td>
            <td>${formattedAvgTime}</td>
        `;

        jobAnalyticsTableBody.appendChild(row);
    }
}
async function fetchJobStates() {
    const response = await fetch('/jobstates');
    return response.json();
}

function populateJobStateAnalyticsTable(jobStateAnalyticsData) {
    const jobStateAnalyticsTableBody = document.getElementById('jobStateAnalyticsTableBody');
    jobStateAnalyticsTableBody.innerHTML = '';

    for (const jobStateId in jobStateAnalyticsData) {
        const { jobStateName, jobsCompleted, totalTimeSpent } = jobStateAnalyticsData[jobStateId];
        const avgTimeSpent = totalTimeSpent / jobsCompleted;
        const formattedTotalTime = formatTime(totalTimeSpent);
        const formattedAvgTime = formatTime(avgTimeSpent);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${jobStateName}</td>
            <td>${jobsCompleted}</td>
            <td>${formattedTotalTime}</td>
            <td>${formattedAvgTime}</td>
        `;

        jobStateAnalyticsTableBody.appendChild(row);
    }
}

let jobStateChart = null;

// Function to create or update the job-state analytics chart
function populateJobStateAnalyticsChart(jobStateAnalyticsData) {
    const labels = [];
    const totalTimeTakenData = [];
    const avgTimeTakenData = [];

    for (const jobStateId in jobStateAnalyticsData) {
        const { jobStateName, jobsCompleted, totalTimeSpent } = jobStateAnalyticsData[jobStateId];
        const avgTimeSpent = totalTimeSpent / jobsCompleted / 60000; // Convert to minutes

        labels.push(jobStateName);
        totalTimeTakenData.push(totalTimeSpent / 60000); // Convert to minutes
        avgTimeTakenData.push(avgTimeSpent);
    }

    const ctx = document.getElementById('jobStateAnalyticsChart').getContext('2d');

    // Calculate total time and average time as sum of all states
    const totalTotalTime = totalTimeTakenData.reduce((acc, cur) => acc + cur, 0);
    const totalAvgTime = avgTimeTakenData.reduce((acc, cur) => acc + cur, 0);

    if (jobStateChart) {
        // If chart already exists, update the data
        jobStateChart.data.labels = labels;
        jobStateChart.data.datasets[0].data = avgTimeTakenData;
        jobStateChart.data.datasets[1].data = totalTimeTakenData;
        jobStateChart.options.plugins.doughnutlayers.layers[0].datasets[0].data = [totalAvgTime];
        jobStateChart.options.plugins.doughnutlayers.layers[1].datasets[0].data = [totalTotalTime];
        jobStateChart.update();
    } else {
        // Create a new chart
        jobStateChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Average Time Taken (min)',
                        data: avgTimeTakenData,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)', // Red
                            'rgba(54, 162, 235, 0.6)', // Blue
                            'rgba(255, 206, 86, 0.6)', // Yellow
                            'rgba(75, 192, 192, 0.6)', // Teal
                            'rgba(153, 102, 255, 0.6)', // Purple
                            'rgba(255, 159, 64, 0.6)', // Orange
                            'rgba(255, 99, 255, 0.6)', // Pink
                            'rgba(0, 206, 209, 0.6)', // Dark Turquoise
                            'rgba(46, 139, 87, 0.6)', // Sea Green
                            'rgba(255, 69, 0, 0.6)', // Red-Orange
                            'rgba(218, 165, 32, 0.6)', // Goldenrod
                            'rgba(75, 0, 130, 0.6)', // Indigo
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)', // Red
                            'rgba(54, 162, 235, 1)', // Blue
                            'rgba(255, 206, 86, 1)', // Yellow
                            'rgba(75, 192, 192, 1)', // Teal
                            'rgba(153, 102, 255, 1)', // Purple
                            'rgba(255, 159, 64, 1)', // Orange
                            'rgba(255, 99, 255, 1)', // Pink
                            'rgba(0, 206, 209, 1)', // Dark Turquoise
                            'rgba(46, 139, 87, 1)', // Sea Green
                            'rgba(255, 69, 0, 1)', // Red-Orange
                            'rgba(218, 165, 32, 1)', // Goldenrod
                            'rgba(75, 0, 130, 1)', // Indigo
                        ],
                        borderWidth: 1
                    },
                    {
                        label: 'Total Time Taken (min)',
                        data: totalTimeTakenData,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)', // Red
                            'rgba(54, 162, 235, 0.8)', // Blue
                            'rgba(255, 206, 86, 0.8)', // Yellow
                            'rgba(75, 192, 192, 0.8)', // Teal
                            'rgba(153, 102, 255, 0.8)', // Purple
                            'rgba(255, 159, 64, 0.8)', // Orange
                            'rgba(255, 99, 255, 0.8)', // Pink
                            'rgba(0, 206, 209, 0.8)', // Dark Turquoise
                            'rgba(46, 139, 87, 0.8)', // Sea Green
                            'rgba(255, 69, 0, 0.8)', // Red-Orange
                            'rgba(218, 165, 32, 0.8)', // Goldenrod
                            'rgba(75, 0, 130, 0.8)', // Indigo
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)', // Red
                            'rgba(54, 162, 235, 1)', // Blue
                            'rgba(255, 206, 86, 1)', // Yellow
                            'rgba(75, 192, 192, 1)', // Teal
                            'rgba(153, 102, 255, 1)', // Purple
                            'rgba(255, 159, 64, 1)', // Orange
                            'rgba(255, 99, 255, 1)', // Pink
                            'rgba(0, 206, 209, 1)', // Dark Turquoise
                            'rgba(46, 139, 87, 1)', // Sea Green
                            'rgba(255, 69, 0, 1)', // Red-Orange
                            'rgba(218, 165, 32, 1)', // Goldenrod
                            'rgba(75, 0, 130, 1)', // Indigo
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                plugins: {
                    doughnutlayers: {
                        layers: [
                            {
                                datasets: [
                                    {
                                        data: [totalAvgTime],
                                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                        borderColor: 'rgba(255, 99, 132, 1)',
                                        borderWidth: 1
                                    }
                                ]
                            },
                            {
                                datasets: [
                                    {
                                        data: [totalTotalTime],
                                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        borderWidth: 1
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        });
    }
}

let userChart = null;
// Function to create or update the user analytics chart
function populateUserAnalyticsChart(userAnalyticsData) {
    const labels = [];
    const jobsCompletedData = [];
    const totalTimeSpentData = [];
    const avgTimeSpentData = [];

    for (const userId in userAnalyticsData) {
        const { userName, jobsCompleted, totalTimeSpent } = userAnalyticsData[userId];
        const avgTimeSpent = totalTimeSpent / jobsCompleted / 60000; // Convert to minutes

        labels.push(userName);
        jobsCompletedData.push(jobsCompleted);
        totalTimeSpentData.push(totalTimeSpent / 60000); // Convert to minutes
        avgTimeSpentData.push(avgTimeSpent);
    }

    const ctx = document.getElementById('userAnalyticsChart').getContext('2d');

    // Calculate total time and average time as sum of all users
    const totalTotalTime = totalTimeSpentData.reduce((acc, cur) => acc + cur, 0);
    const totalAvgTime = avgTimeSpentData.reduce((acc, cur) => acc + cur, 0);

    if (userChart) {
        // If chart already exists, update the data
        userChart.data.labels = labels;
        userChart.data.datasets[0].data = avgTimeSpentData;
        userChart.data.datasets[1].data = totalTimeSpentData;
        userChart.options.plugins.doughnutlayers.layers[0].datasets[0].data = [totalAvgTime];
        userChart.options.plugins.doughnutlayers.layers[1].datasets[0].data = [totalTotalTime];
        userChart.update();
    } else {
        // Create a new chart
        userChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Average Time Taken (min)',
                        data: avgTimeSpentData,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)', // Red
                            'rgba(54, 162, 235, 0.6)', // Blue
                            'rgba(255, 206, 86, 0.6)', // Yellow
                            'rgba(75, 192, 192, 0.6)', // Teal
                            'rgba(153, 102, 255, 0.6)', // Purple
                            'rgba(255, 159, 64, 0.6)', // Orange
                            'rgba(255, 99, 255, 0.6)', // Pink
                            'rgba(0, 206, 209, 0.6)', // Dark Turquoise
                            'rgba(46, 139, 87, 0.6)', // Sea Green
                            'rgba(255, 69, 0, 0.6)', // Red-Orange
                            'rgba(218, 165, 32, 0.6)', // Goldenrod
                            'rgba(75, 0, 130, 0.6)', // Indigo
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)', // Red
                            'rgba(54, 162, 235, 1)', // Blue
                            'rgba(255, 206, 86, 1)', // Yellow
                            'rgba(75, 192, 192, 1)', // Teal
                            'rgba(153, 102, 255, 1)', // Purple
                            'rgba(255, 159, 64, 1)', // Orange
                            'rgba(255, 99, 255, 1)', // Pink
                            'rgba(0, 206, 209, 1)', // Dark Turquoise
                            'rgba(46, 139, 87, 1)', // Sea Green
                            'rgba(255, 69, 0, 1)', // Red-Orange
                            'rgba(218, 165, 32, 1)', // Goldenrod
                            'rgba(75, 0, 130, 1)', // Indigo
                        ],
                        borderWidth: 1
                    },
                    {
                        label: 'Total Time Taken (min)',
                        data: totalTimeSpentData,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)', // Red
                            'rgba(54, 162, 235, 0.8)', // Blue
                            'rgba(255, 206, 86, 0.8)', // Yellow
                            'rgba(75, 192, 192, 0.8)', // Teal
                            'rgba(153, 102, 255, 0.8)', // Purple
                            'rgba(255, 159, 64, 0.8)', // Orange
                            'rgba(255, 99, 255, 0.8)', // Pink
                            'rgba(0, 206, 209, 0.8)', // Dark Turquoise
                            'rgba(46, 139, 87, 0.8)', // Sea Green
                            'rgba(255, 69, 0, 0.8)', // Red-Orange
                            'rgba(218, 165, 32, 0.8)', // Goldenrod
                            'rgba(75, 0, 130, 0.8)', // Indigo
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)', // Red
                            'rgba(54, 162, 235, 1)', // Blue
                            'rgba(255, 206, 86, 1)', // Yellow
                            'rgba(75, 192, 192, 1)', // Teal
                            'rgba(153, 102, 255, 1)', // Purple
                            'rgba(255, 159, 64, 1)', // Orange
                            'rgba(255, 99, 255, 1)', // Pink
                            'rgba(0, 206, 209, 1)', // Dark Turquoise
                            'rgba(46, 139, 87, 1)', // Sea Green
                            'rgba(255, 69, 0, 1)', // Red-Orange
                            'rgba(218, 165, 32, 1)', // Goldenrod
                            'rgba(75, 0, 130, 1)', // Indigo
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                plugins: {
                    doughnutlayers: {
                        layers: [
                            {
                                datasets: [
                                    {
                                        data: [totalAvgTime],
                                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                        borderColor: 'rgba(255, 99, 132, 1)',
                                        borderWidth: 1
                                    }
                                ]
                            },
                            {
                                datasets: [
                                    {
                                        data: [totalTotalTime],
                                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                        borderColor: 'rgba(54, 162, 235, 1)',
                                        borderWidth: 1
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        });
    }
}

    document.getElementById('toggleUserAnalyticsBtn').addEventListener('click', function () {
        const userAnalytics = document.getElementById('userAnalytics');
        userAnalytics.classList.toggle('d-none');

    });

    document.getElementById('toggleJobStateAnalyticsBtn').addEventListener('click', function () {
        const jobStateAnalytics = document.getElementById('jobStateAnalytics');
        jobStateAnalytics.classList.toggle('d-none');
    });

    document.getElementById('toggleArchivedOrderTableBtn').addEventListener('click', function () {
        const archivedOrderTable = document.getElementById('archivedOrderTable');
        archivedOrderTable.classList.toggle('d-none');
    });