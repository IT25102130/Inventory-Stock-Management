document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const loginBtn = document.getElementById('loginBtn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            showError("Please fill in both fields");
            return;
        }

        try {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing in...';
            
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
                // Store user role if needed
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('username', username);
                
                // Redirect to a default dashboard page (e.g. products)
                setTimeout(() => {
                    window.location.href = '/product/login.html';
                }, 1000);
            } else {
                showError(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error('Error during login:', error);
            showError("A network error occurred. Please try again.");
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }
});
