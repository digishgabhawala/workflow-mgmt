// Function to create the header with offcanvas button
function createHeader() {
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
    let adminActions = '';
    let oldOrdersLink = '';
    let jobsLink = '';

    if (user.roles.includes('ROLE_ADMIN')) {
        usersLink = '<a href="users.html">Users</a>';
        ordersLink = '<a href="order.html">Orders Dashboard</a>';
        oldOrdersLink = '<a href="completedOrders.html">Old Orders</a>';
        jobsLink = '<a href="jobs.html">Manage Job</a>';
        adminActions = `
            <button id="exportButton" class="btn btn-secondary mt-3" onclick="handleExport()">Export Database</button>
            <button id="importButton" class="btn btn-secondary mt-3" onclick="showImportForm()">Import Database</button>
            <form id="importForm" class="mt-3" style="display: none;" onsubmit="handleImport(event)">
                <input type="file" id="importFile" required>
                <button type="submit" class="btn btn-primary mt-2">Import</button>
            </form>
        `;
    }

    const sidebarHTML = `
        <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasSidebar" aria-labelledby="offcanvasSidebarLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvasSidebarLabel">Settings</h5>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
                <h3>Hello, ${user.username}</h3>
                <a href="myorders.html">My Orders</a>
                ${ordersLink}
                ${oldOrdersLink}
                ${jobsLink}
                ${usersLink}
                ${adminActions}
                <button id="changePasswordButton" class="btn btn-secondary mt-3" onclick="showChangePasswordModal()">Change Password</button>
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
        container.insertAdjacentHTML('beforeend', createChangePasswordModal());
    }
    document.body.insertAdjacentHTML('beforeend', createFooter());
}

// Function to create the change password modal
function createChangePasswordModal() {
    const modalHTML = `
        <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="changePasswordModalLabel">Change Password</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="changePasswordForm" onsubmit="handleChangePassword(event)">
                            <div class="mb-3">
                                <label for="oldPassword" class="form-label">Current Password</label>
                                <input type="password" class="form-control" id="oldPassword" required>
                            </div>
                            <div class="mb-3">
                                <label for="newPassword" class="form-label">New Password</label>
                                <input type="password" class="form-control" id="newPassword" required>
                            </div>
                            <div class="mb-3">
                                <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
                                <input type="password" class="form-control" id="confirmNewPassword" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Change Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    return modalHTML;
}

// Function to show the change password modal
function showChangePasswordModal() {
    const changePasswordModal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    changePasswordModal.show();
}

// Function to handle password change
async function handleChangePassword(event) {
    event.preventDefault();

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
        alert('New password and confirm new password do not match.');
        return;
    }

    try {
        const csrfToken = await fetchCsrfToken();
        const response = await fetch('/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        if (response.ok) {
            showAlertModal('Success', 'Password changed successfully.');
            const changePasswordModal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
            changePasswordModal.hide();
        } else {
            const errorData = await response.json();
            showAlertModal('Error', `Failed to change password: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showAlertModal('Error', 'An error occurred while changing password.');
    }
}

// Function to handle export
async function handleExport() {
    try {
        const response = await fetch('/db/export', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'database_dump.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            showAlertModal('Error', 'Failed to export database.');
        }
    } catch (error) {
        console.error('Error exporting database:', error);
        showAlertModal('Error', 'An error occurred while exporting the database.');
    }
}

// Function to show the import form
function showImportForm() {
    document.getElementById('importForm').style.display = 'block';
}

// Function to handle import
async function handleImport(event) {
    event.preventDefault();

    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const csrfToken = await fetchCsrfToken();
        const response = await fetch('/db/import', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            },
            body: formData
        });

        if (response.ok) {
            showAlertModal('Success', 'Database imported successfully.');
        } else {
            showAlertModal('Error', 'Failed to import database.');
        }
    } catch (error) {
        console.error('Error importing database:', error);
        showAlertModal('Error', 'An error occurred while importing the database.');
    }
}

// Fetch the user details and insert the header, sidebar, and footer
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
        showAlertModal('Error', 'Failed to load user details.');
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
            showAlertModal('Logout', 'Successfully logged out.');
            window.location.href = '/myorders.html'; // Redirect to login page after logout
        } else {
            showAlertModal('Error', 'Failed to logout.');
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

// Function to create a generic alert modal
function createAlertModal(title, message) {
    const modalHTML = `
        <div class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="alertModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="alertModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    return modalHTML;
}

// Function to show the alert modal
function showAlertModal(title, message,onCloseCallback) {
    // Remove any existing alert modal first
    const existingModal = document.getElementById('alertModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create new alert modal
    const modalHTML = createAlertModal(title, message);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show the modal
    const alertModal = new bootstrap.Modal(document.getElementById('alertModal'));
    alertModal.show();

    // Add event listener for modal close
    const modalElement = document.getElementById('alertModal');
    modalElement.addEventListener('hidden.bs.modal', () => {
        if (onCloseCallback) {
            onCloseCallback();
        }
    });
}
