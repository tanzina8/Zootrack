document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const profileCard = document.getElementById('profile-card');
    const profileName = document.getElementById('profile-name');
    const profileRole = document.getElementById('profile-role');
    const gotoAnimals = document.getElementById('goto-animals');
    const gotoViews = document.getElementById('goto-views');
    const logoutBtn = document.getElementById('logout-btn');
    const weatherForm = document.getElementById('weather-form');
    const weatherResult = document.getElementById('weather-result');

    // Check session
    checkProfile();

    async function checkProfile() {
        try {
            const data = await apiRequest('/auth/profile', { method: 'GET' });

            if (profileCard) {
                profileCard.style.display = 'block';
                profileName.textContent = data.user.name;
                profileRole.textContent = data.user.role;
            }
        } catch {
            if (profileCard) profileCard.style.display = 'none';
        }
    }

    // handles login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.textContent = '';

            const phone_number = document.getElementById('phone_number').value.trim();
            const password = document.getElementById('password').value;

            if (!phone_number || !password) {
                loginError.textContent = 'Phone number and password are required.';
                return;
            }

            try {
                await apiRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ phone_number, password })
                });

                // goes to dashboard
                window.location.href = 'index.html';

            } catch (err) {
                loginError.textContent = err.message || "Login failed";
            }
        });
    }

    if (gotoAnimals) {
        gotoAnimals.addEventListener('click', () => {
            window.location.href = 'animals.html';
        });
    }

    if (gotoViews) {
        gotoViews.addEventListener('click', () => {
            window.location.href = 'views.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await apiRequest('/auth/logout', { method: 'POST' });
            } catch {}

            window.location.reload();
        });
    }

    if (weatherForm) {
        weatherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            weatherResult.textContent = '';

            const city = document.getElementById('city').value.trim();
            if (!city) return;

            try {
                const data = await apiRequest(`/weather/${encodeURIComponent(city)}`, {
                    method: 'GET'
                });

                weatherResult.innerHTML = `
                    <p><strong>${data.city}</strong></p>
                    <p>Temperature: ${data.temperature} °C</p>
                    <p>Humidity: ${data.humidity}%</p>
                    <p>Condition: ${data.condition}</p>
                `;
            } catch (err) {
                weatherResult.textContent = err.message;
            }
        });
    }
});
