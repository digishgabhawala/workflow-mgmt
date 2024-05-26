// common.js

// Function to create the header
function createHeader(username) {
    const headerHTML = `
        <div class="d-flex justify-content-between align-items-center mt-3 mb-4">
            <h1 id="userName">Hello: Username</h1>
            <button id="logoutButton" class="btn btn-danger" onclick="handleLogout()">Logout</button>
        </div>
    `;
    return headerHTML;
}

// Function to create the footer
function createFooter() {
    const footerHTML = `
        <footer class="bg-light text-center py-3">
            <p>&copy; 2024 Management System</p>
        </footer>
    `;
    return footerHTML;
}

// Function to insert the header and footer into the page
function insertHeaderAndFooter(username) {
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', createHeader());
    }
    document.body.insertAdjacentHTML('beforeend', createFooter());
}

// Fetch the username and insert the header and footer
document.addEventListener('DOMContentLoaded', () => {
    // Replace with the actual method of fetching the username
    loadUserName()
    insertHeaderAndFooter();
});

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
        document.getElementById('userName').textContent = `Hello: ${user.username}`;
    } catch (error) {
        console.error('Error loading user details:', error);
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


