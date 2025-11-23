const API_BASE = '/api';

async function apiRequest(path, options = {}) {
    const response = await fetch(API_BASE + path, {
    credentials: 'include', // send session cookie
    headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    },
    ...options
    });


  // backend sends json
    const data = await response.json().catch(() => ({}));


    if (!response.ok) {
    const msg = data.error || data.message || response.statusText;
    throw new Error(msg);
    }


    return data;
}

// logout handling

document.addEventListener("DOMContentLoaded", async () => {
    const logoutBtn = document.getElementById("nav-logout-btn");
    const navButtonsContainer = document.getElementById("nav-auth-buttons");

    if (!logoutBtn || !navButtonsContainer) return;

    // fetch session user
    try {
        const profile = await apiRequest("/auth/profile", { method: "GET" });

        // If logged in → show logout button
        logoutBtn.style.display = "inline-block";

        // role display in navbar
        const roleLabel = document.createElement("span");
        roleLabel.textContent = profile.user.role;
        roleLabel.style.marginRight = "15px";
        roleLabel.style.fontWeight = "600";
        roleLabel.style.color = "#2b4f32";

        navButtonsContainer.prepend(roleLabel);

    } catch (err) {
        // If not logged in → hide logout button
        logoutBtn.style.display = "none";
    }

    // logout click handler
    logoutBtn.addEventListener("click", async () => {
        try {
            await apiRequest("/auth/logout", { method: "POST" });
        } catch {}

        window.location.href = "login.html";
    });
});

