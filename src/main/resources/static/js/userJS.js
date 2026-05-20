document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const userTableBody = document.getElementById('userTableBody');
    const roleSelect = document.getElementById('roleId');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const formTitle = document.getElementById('formTitle');
    const totalUsersElement = document.getElementById('totalUsers');
    const userRole = localStorage.getItem('userRole');

    // Role-based Access Control (RBAC)
    const canManageUsers = userRole === 'ADMIN' || userRole === 'MANAGER';

    const formSection = document.querySelector('.form-section');
    if (!canManageUsers) {
        formSection.style.display = 'none';
    }

    /* =====================================
       ACTIVE SIDEBAR LINK
    ===================================== */
    const links = document.querySelectorAll('.sidebar-nav .nav-item');
    const currentPath = window.location.pathname;

    links.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath)) {
            link.classList.add('active');
        }
    });

    let isEditing = false;

    /* =====================================
       LOAD ROLES
    ===================================== */
    async function loadRoles() {
        try {
            const response = await fetch('/api/user/roles');
            const roles = await response.json();
            roleSelect.innerHTML = '<option value="">Select Role</option>';
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = role.roleName;
                roleSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading roles:', error);
            showAlert('Failed to load roles', 'error');
        }
    }

    /* =====================================
       LOAD USERS
    ===================================== */
    async function loadUsers() {
        try {
            const response = await fetch('/api/user');
            const users = await response.json();
            userTableBody.innerHTML = '';

            if (totalUsersElement) {
                totalUsersElement.textContent = users.length;
            }

            users.forEach((user, index) => {
                const tr = document.createElement('tr');

                const createdDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                    : 'N/A';

                const actionsHtml = canManageUsers
                    ? `
                    <td>
                        <button class="btn-edit" onclick="editUser(${user.id})" title="Edit user">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn-delete" onclick="deleteUser(${user.id})" title="Delete user">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </td>
                `
                    : `<td><span class="text-muted"><i class="fas fa-lock"></i> No Permission</span></td>`;

                tr.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-user-circle" style="color: var(--primary); font-size: 18px;"></i>
                            <strong>${user.username}</strong>
                        </div>
                    </td>
                    <td>
                        <span class="badge">
                            <i class="fas fa-shield-alt"></i>
                            ${user.roleName || 'N/A'}
                        </span>
                    </td>
                    <td>
                        <small>${createdDate}</small>
                    </td>
                    ${actionsHtml}
                `;

                // Add animation delay
                tr.style.animation = `slideUp 0.4s ease-out ${index * 0.05}s both`;
                userTableBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading users:', error);
            showAlert('Failed to load users', 'error');
        }
    }

    /* =====================================
       HANDLE FORM SUBMIT
    ===================================== */
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('userId').value;
        const userData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            roleId: parseInt(document.getElementById('roleId').value)
        };

        // Validation
        if (!userData.username || !userData.roleId) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        if (!isEditing && !userData.password) {
            showAlert('Password is required for new users', 'error');
            return;
        }

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `/api/user/${id}` : '/api/user';

        try {
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Processing...</span>';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const message = isEditing ? 'User updated successfully!' : 'User created successfully!';
                showAlert(message, 'success');
                resetForm();
                loadUsers();
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'Error saving user', 'error');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            showAlert('A network error occurred. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    /* =====================================
       EDIT USER
    ===================================== */
    window.editUser = async (id) => {
        try {
            const response = await fetch(`/api/user/${id}`);
            const user = await response.json();

            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('password').value = '';
            document.getElementById('roleId').value = user.roleId;

            isEditing = true;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Update User</span>';
            formTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit User';

            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            console.error('Error fetching user for edit:', error);
            showAlert('Failed to load user details', 'error');
        }
    };

    /* =====================================
       DELETE USER
    ===================================== */
    window.deleteUser = async (id) => {
        const confirmDelete = confirm('Are you sure you want to delete this user? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/user/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showAlert('User deleted successfully!', 'success');
                loadUsers();
            } else {
                const errorData = await response.json();
                showAlert(errorData.message || 'Error deleting user', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showAlert('A network error occurred. Please try again.', 'error');
        }
    };

    /* =====================================
       RESET FORM
    ===================================== */
    function resetForm() {
        userForm.reset();
        document.getElementById('userId').value = '';
        isEditing = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>Add User</span>';
        formTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New User';
    }

    clearBtn.addEventListener('click', resetForm);

    /* =====================================
       SHOW ALERT (Toast Notification)
    ===================================== */
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 10px;
            font-weight: 500;
            z-index: 10000;
            animation: slideDown 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        `;

        const typeConfig = {
            success: {
                bg: '#ECFDF5',
                color: '#059669',
                icon: 'fa-check-circle',
                border: '#10B981'
            },
            error: {
                bg: '#FEF2F2',
                color: '#DC2626',
                icon: 'fa-exclamation-circle',
                border: '#EF4444'
            },
            info: {
                bg: '#EFF6FF',
                color: '#2563EB',
                icon: 'fa-info-circle',
                border: '#2563EB'
            }
        };

        const config = typeConfig[type] || typeConfig.info;
        alertDiv.style.background = config.bg;
        alertDiv.style.color = config.color;
        alertDiv.style.border = `2px solid ${config.border}`;

        alertDiv.innerHTML = `
            <i class="fas ${config.icon}" style="font-size: 18px;"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.style.animation = 'slideUp 0.3s ease-out forwards';
            setTimeout(() => alertDiv.remove(), 300);
        }, 4000);
    }

    /* =====================================
       INIT
    ===================================== */
    loadRoles();
    loadUsers();
});