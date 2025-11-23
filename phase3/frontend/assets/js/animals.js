async function ensureAuthenticated() {
    try {
        await apiRequest('/auth/profile', { method: 'GET' });
        return true;
    } catch {
        window.location.href = 'login.html';
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    await ensureAuthenticated();

    // get user role
    let userRole = null;

    try {
        const profile = await apiRequest('/auth/profile', { method: 'GET' });
        userRole = profile.user.role.toLowerCase();
    } catch {
        window.location.href = 'login.html';
    }

    // Zookeepers cannot see the form
    if (userRole === 'zookeeper') {
        const formSection = document.getElementById("animal-form-section");
        if (formSection) formSection.style.display = "none";
    }

    const tbody = document.getElementById("animals-tbody");
    const form = document.getElementById("animal-form");
    const errorEl = document.getElementById("animal-form-error");

    const filterName = document.getElementById("filter-name");
    const filterSpecies = document.getElementById("filter-species");
    const filterHealth = document.getElementById("filter-health");

    const resetBtn = document.getElementById("reset-form");
    const logoutBtn = document.getElementById("nav-logout-btn");

    let animals = [];

    async function loadAnimals() {
        try {
            const data = await apiRequest("/animals", { method: "GET" });
            animals = data;
            renderTable();
        } catch (err) {
            console.error(err);
        }
    }

    loadAnimals();

    // render table
    function renderTable() {
        tbody.innerHTML = "";

        const filtered = animals.filter(a =>
            a.name.toLowerCase().includes(filterName.value.toLowerCase()) &&
            a.species.toLowerCase().includes(filterSpecies.value.toLowerCase()) &&
            a.current_health_status.toLowerCase().includes(filterHealth.value.toLowerCase())
        );

        filtered.forEach(a => {
            const row = document.createElement("tr");

            let actionButtons = "";

            if (userRole === "admin") {
                actionButtons = `
                    <div class="action-buttons">
                        <button class="secondary" data-edit="${a.animal_id}">Edit</button>
                        <button class="danger" data-delete="${a.animal_id}">Delete</button>
                    </div>`;
            }
            else if (userRole === "veterinarian") {
                actionButtons = `
                    <div class="action-buttons">
                        <button class="secondary" data-edit="${a.animal_id}">Edit</button>
                    </div>`;
            }
            else {
                actionButtons = `<span style="color:#777;">View Only</span>`;
            }

            row.innerHTML = `
                <td>${a.animal_id}</td>
                <td>${a.name}</td>
                <td>${a.species}</td>
                <td>${a.birth_date}</td>
                <td>${a.sex}</td>
                <td>${a.current_health_status}</td>
                <td>${a.habitat_id}</td>
                <td>${actionButtons}</td>
            `;

            tbody.appendChild(row);
        });
    }

    filterName.addEventListener("input", renderTable);
    filterSpecies.addEventListener("input", renderTable);
    filterHealth.addEventListener("input", renderTable);

    // added button
    tbody.addEventListener("click", (e) => {
        if (e.target.dataset.edit) {
            const id = Number(e.target.dataset.edit);
            const a = animals.find(x => x.animal_id === id);

            document.getElementById("animal_id").value = a.animal_id;
            document.getElementById("name").value = a.name;
            document.getElementById("species").value = a.species;
            document.getElementById("birth_date").value = a.birth_date;
            document.getElementById("sex").value = a.sex;
            document.getElementById("current_health_status").value = a.current_health_status;
            document.getElementById("habitat_id").value = a.habitat_id;
        }

        if (e.target.dataset.delete) {
            deleteAnimal(Number(e.target.dataset.delete));
        }
    });

    // delete button (admin only)
    async function deleteAnimal(id) {
        if (userRole !== "admin") {
            alert("Only admin can delete animals.");
            return;
        }

        if (!confirm("Delete this animal?")) return;

        try {
            await apiRequest(`/animals/${id}`, { method: "DELETE" });
            loadAnimals();
        } catch (err) {
            alert(err.message);
        }
    }

    // save and update animals
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.textContent = "";

        const id = document.getElementById("animal_id").value;

        // Zookeepers can't do anything
        if (userRole === "zookeeper") {
            errorEl.textContent = "Zookeepers cannot add or edit animals.";
            return;
        }

        // Vets can edit and add, not delete
        if (userRole === "veterinarian") {
        }

        // Admin gets full access

        const payload = {
            name: document.getElementById("name").value.trim(),
            species: document.getElementById("species").value.trim(),
            birth_date: document.getElementById("birth_date").value,
            sex: document.getElementById("sex").value,
            current_health_status: document.getElementById("current_health_status").value.trim(),
            habitat_id: Number(document.getElementById("habitat_id").value)
        };

        try {
            if (id) {
                // update
                await apiRequest(`/animals/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
            } else {
                // vets can add
                await apiRequest("/animals", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            }

            form.reset();
            document.getElementById("animal_id").value = "";
            loadAnimals();

        } catch (err) {
            errorEl.textContent = err.message;
        }
    });

    // reset form
    resetBtn.addEventListener("click", () => {
        form.reset();
        document.getElementById("animal_id").value = "";
    });

    // logout button
    logoutBtn.addEventListener("click", async () => {
        try {
            await apiRequest("/auth/logout", { method: "POST" });
        } catch {}
        window.location.href = "login.html";
    });

});
