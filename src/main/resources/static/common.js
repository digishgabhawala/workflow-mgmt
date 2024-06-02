// common.js

// Function to create the header
function createHeader(username) {
    const headerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
                <a class="navbar-brand" href="#">Workflow Management System</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="#">Hello, ${username}</a>
                        </li>
                        <li class="nav-item">
                            <button class="btn btn-primary nav-link" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar">
                                <i class="bi bi-gear"></i> Settings
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
    return headerHTML;
}

// Function to create the off-canvas sidebar
function createOffcanvasSidebar() {
    const sidebarHTML = `
        <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasSidebar" aria-labelledby="offcanvasSidebarLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvasSidebarLabel">Settings</h5>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
                <h3>Menu</h3>
                <a href="#">Dashboard</a>
                <a href="#">Users</a>
                <a href="#">Roles</a>
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
function insertHeaderSidebarAndFooter(username) {
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', createHeader(username));
        container.insertAdjacentHTML('beforeend', createOffcanvasSidebar());
    }
    document.body.insertAdjacentHTML('beforeend', createFooter());
}

// Fetch the username and insert the header, sidebar, and footer
document.addEventListener('DOMContentLoaded', () => {
    loadUserName().then(username => {
        insertHeaderSidebarAndFooter(username);
    }).catch(error => {
        console.error('Error loading user details:', error);
        insertHeaderSidebarAndFooter('User');
    });
});

// Function to load the username from the server
async function loadUserName() {
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
        return user.username;
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
