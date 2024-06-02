// common.js


// Function to create the header with offcanvas button
function createHeader(username) {
    const headerHTML = `
        <header class="bg-primary text-white text-center py-3">
            <div class="container d-flex justify-content-between align-items-center">
                <h1 class="m-0">Workflow Management System</h1>
                <button class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar">
                    <i class="bi bi-list"></i>
                </button>
            </div>
        </header>
    `;
    return headerHTML;
}

// Function to create the off-canvas sidebar
function createOffcanvasSidebar(user) {
    let usersLink = '';
    let ordersLink = '';
    if (user.roles.includes('ROLE_ADMIN')) {
        usersLink = '<a href="users.html">Users</a>';
        ordersLink = '<a href="order.html">Orders Dashboard</a>';
        jobsLink = '<a href="jobs.html">Jobs Dashboard</a>';
    }

    const sidebarHTML = `
        <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasSidebar" aria-labelledby="offcanvasSidebarLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvasSidebarLabel">Settings</h5>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
                <h3>Hello, ${user.username} </h3>
                <a href="myorders.html">My Orders</a>
                ${ordersLink}
                ${jobsLink}
                ${usersLink}
                <button id="logoutButton" class="btn btn-danger mt-3" onclick="handleLogout()">Logout</button>
            </div>
        </div>
    `;
    return sidebarHTML;
}

// Function to create the footer
function createFooter() {
    const footerHTML = `
        <footer class="bg-dark text-white text-center py-3">
            <div class="container">
                <p>&copy; 2024 Workflow Management System | All Rights Reserved</p>
            </div>
        </footer>
    `;
    return footerHTML;
}

// Function to insert the header, sidebar, and footer into the page
function insertHeaderSidebarAndFooter(user) {
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', createHeader());
        container.insertAdjacentHTML('beforeend', createOffcanvasSidebar(user));
    }
    document.body.insertAdjacentHTML('beforeend', createFooter());
}

// Fetch the username and insert the header, sidebar, and footer
document.addEventListener('DOMContentLoaded', () => {
    loadUser().then(user => {
        insertHeaderSidebarAndFooter(user);
    }).catch(error => {
        console.error('Error loading user details:', error);
        insertHeaderSidebarAndFooter('User');
    });
});

// Function to load the user from the server
async function loadUser() {
    try {
        const response = await fetch('/users/details', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error loading user details:', error);
        throw error;
    }
}

// Logout function
async function handleLogout() {
    try {
        const csrfToken = await fetchCsrfToken();
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (response.ok) {
            window.location.href = '/login'; // Redirect to login page after logout
        } else {
            throw new Error('Failed to logout');
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// Function to fetch CSRF token
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
