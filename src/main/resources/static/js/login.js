document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const errorText = document.getElementById('errorText');
    const successText = document.getElementById('successText');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError("Please fill in both fields");
            return;
        }

        try {
            loginBtn.disabled = true;
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Signing in...</span>';

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showSuccess("Login successful! Redirecting...");
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('username', username);

                setTimeout(() => {
                    window.location.href = '/product/index.html';
                }, 1500);
            } else {
                showError(data.message || "Invalid credentials. Please try again.");
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Error during login:', error);
            showError("Network error. Please check your connection and try again.");
            loginBtn.disabled = false;
            loginBtn.innerHTML = originalText;
        }
    });

    // Show error message
    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        successMessage.style.display = 'none';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // Show success message
    function showSuccess(message) {
        successText.textContent = message;
        successMessage.style.display = 'flex';
        errorMessage.style.display = 'none';
    }

    // Clear error/success when user starts typing
    usernameInput.addEventListener('input', () => {
        if (errorMessage.style.display === 'flex' || successMessage.style.display === 'flex') {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        }
    });

    passwordInput.addEventListener('input', () => {
        if (errorMessage.style.display === 'flex' || successMessage.style.display === 'flex') {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        }
    });
});