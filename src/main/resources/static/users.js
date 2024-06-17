
async function fetchUsers() {
    const response = await fetch('/users');
    const data = await response.json();
    return data;
}

async function fetchRoles() {
    const response = await fetch('/users/roles');
    const data = await response.json();
    return data;
}

async function createUser(userName, password, csrfToken) {
    const response = await fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ username: userName, password: password })
    });
    return response.json();
}

async function createRole(roleName, csrfToken) {
    const response = await fetch('/users/roles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ name: roleName })
    });
    return response.json();
}

async function addRoleToUser(userId, roleId, csrfToken) {
    const response = await fetch(`/users/${userId}/roles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ id: roleId })
    });
    return response.json();
}

async function removeRoleFromUser(userId, roleId, csrfToken) {
    const response = await fetch(`/users/${userId}/removeroles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ id: roleId })
    });
    return response.json();
}

async function handleSubmitUser(event) {
    event.preventDefault();
    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;
    const rolesSelect = document.getElementById('roles');
    const selectedRoles = Array.from(rolesSelect.selectedOptions).map(option => option.value);

    if (selectedRoles.length === 0) {
        showAlertModal('Error','Please select at least one role');
        return;
    }

    const csrfToken = await fetchCsrfToken();
    const createdUser = await createUser(userName, password, csrfToken);

    if (createdUser.id) {
        for (const roleId of selectedRoles) {
            await addRoleToUser(createdUser.id, roleId, csrfToken);
        }

        loadUsers();
        document.getElementById('userForm').reset();
        document.getElementById('userForm').classList.add('d-none');
        document.getElementById('showUserFormButton').style.display = 'inline-block';
    }
}

async function handleSubmitRole(event) {
    event.preventDefault();
    const roleName = document.getElementById('roleName').value;
    const csrfToken = await fetchCsrfToken();
    const createdRole = await createRole(roleName, csrfToken);
    if (createdRole.id) {
        loadUsers();
        loadRoles();
        document.getElementById('roleForm').reset();
        document.getElementById('roleForm').classList.add('d-none');
        document.getElementById('showRoleFormButton').style.display = 'inline-block';
    }
}

async function handleAddRole(event, userId) {
    event.preventDefault();
    const roleId = document.getElementById(`roleSelect-${userId}`).value;
    const csrfToken = await fetchCsrfToken();
    const response = await addRoleToUser(userId, roleId, csrfToken);
    if (response.id) {
        loadUsers();
        document.getElementById(`addRoleForm-${userId}`).classList.add('d-none');
    } else {
        showAlertModal('Error','Failed to add role to user');
    }
}

async function handleRemoveRole(userId, roleId) {
    const csrfToken = await fetchCsrfToken();
    const removedRole = await removeRoleFromUser(userId, roleId, csrfToken);
    if (removedRole.id) {
        loadUsers();
    } else {
        showAlertModal('Error','Failed to remove role from user');
    }
}

function showUserForm() {
    document.getElementById('userForm').classList.remove('d-none');
    document.getElementById('showUserFormButton').style.display = 'none';
    loadRolesDropdown();
}

function hideUserForm() {
    document.getElementById('userForm').classList.add('d-none');
    document.getElementById('userForm').reset();
    document.getElementById('showUserFormButton').style.display = 'inline-block';
}

function showRoleForm() {
    document.getElementById('roleForm').classList.remove('d-none');
    document.getElementById('showRoleFormButton').style.display = 'none';
}

function hideRoleForm() {
    document.getElementById('roleForm').classList.add('d-none');
    document.getElementById('roleForm').reset();
    document.getElementById('showRoleFormButton').style.display = 'inline-block';
}

async function loadRolesDropdown() {
    const roles = await fetchRoles();
    const rolesSelect = document.getElementById('roles');
    rolesSelect.innerHTML = '';
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        rolesSelect.appendChild(option);
    });
}


async function loadUsers() {
    const users = await fetchUsers();
    const roles = await fetchRoles();
    const userCardsContainer = document.getElementById('userCards');
    userCardsContainer.innerHTML = '';
    users.forEach(user => {
        const card = document.createElement('div');
        card.classList.add('card', 'mb-3', 'col-md-4', 'col-sm-6');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        cardBody.innerHTML = `
            <h5 class="card-title">${user.username}</h5>
            <p class="card-text"><strong>ID:</strong> ${user.id}</p>
            <p class="card-text"><strong>Roles:</strong></p>
            <ul class="list-group mb-2">${getUserRoles(user, roles)}</ul>
            <button class="btn btn-success btn-sm mb-2 w-100" onclick="document.getElementById('addRoleForm-${user.id}').classList.toggle('d-none')">+ Add Role</button>
            <form id="addRoleForm-${user.id}" class="form-inline mt-2 d-none" onsubmit="handleAddRole(event, ${user.id})">
                <select id="roleSelect-${user.id}" class="form-select mb-2">${getRoleOptions(roles, user.roles)}</select>
                <button type="submit" class="btn btn-primary btn-sm w-100">Add</button>
            </form>
            <button class="btn btn-danger btn-sm w-100" onclick="handleDeleteUser(${user.id})">Delete</button>
        `;

        card.appendChild(cardBody);
        userCardsContainer.appendChild(card);
    });
}

function getUserRoles(user, roles) {
    if (!user.roles || !Array.isArray(user.roles)) {
        return '<li class="list-group-item">No roles assigned</li>';
    }

    const userRoles = [];
    for (let i = 0; i < user.roles.length; i++) {
        const roleId = user.roles[i].id;
        const role = roles.find(role => role.id === roleId);
        if (role) {
            userRoles.push(role);
        }
    }

    if (userRoles.length === 0) {
        return '<li class="list-group-item">No roles assigned</li>';
    }

    return userRoles.map(role => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${role.name}
            <button class="btn btn-sm btn-danger" onclick="handleRemoveRole(${user.id}, ${role.id})">Remove</button>
        </li>
    `).join('');
}

function getRoleOptions(allRoles, userRoles) {
    const userRoleIds = userRoles.map(role => role.id);
    const filteredRoles = allRoles.filter(role => !userRoleIds.includes(role.id));
    return filteredRoles.map(role => `<option value="${role.id}">${role.name}</option>`).join('');
}


async function loadRoles() {
    const roles = await fetchRoles();
    const tableBody = document.getElementById('roleTableBody');
    tableBody.innerHTML = '';
    roles.forEach(role => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${role.id}</td><td>${role.name}</td>`;
        tableBody.appendChild(row);
    });
}

async function deleteUser(userId, csrfToken) {
    const response = await fetch(`/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        }
    });
    if (response.ok) {
        loadUsers();
    } else {
        showAlertModal('Error','Failed to delete user');
    }
}

async function handleDeleteUser(userId) {
    const confirmation = confirm('Are you sure you want to delete this user?');
    if (confirmation) {
        const csrfToken = await fetchCsrfToken();
        deleteUser(userId, csrfToken);
    }
}

window.onload = async function() {
    loadUsers();
    loadRoles();
    loadRolesDropdown();
};
