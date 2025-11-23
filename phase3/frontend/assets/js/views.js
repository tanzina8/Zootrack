let currentViewData = [];
let currentChart = null;

// new names for views
const viewLabelMap = {
    aboveaveragedonationvisitors: "Above Average Donation Visitors",
    animalhealthoverview: "Animal Health Overview",
    animalvethabitatinfo: "Animal Vet Habitat Info",
    donationoverview: "Donation Overview",
    feedingscheduledetails: "Feeding Schedule Details",
    habitatconditions: "Habitat Conditions",
    latestcheckupperanimal: "Latest Check-Up Per Animal",
    visitordonationfull: "Visitor Donation Full",
    visitorswithticketsordonations: "Visitors With Tickets Or Donations",
    visitorticketsummary: "Visitor Ticket Summary"
};

function prettifyViewName(name) {
    const key = name.toLowerCase();
    if (viewLabelMap[key]) return viewLabelMap[key];

    return name
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
}

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("view-select");
    const loadBtn = document.getElementById("load-view-btn");
    const searchInput = document.getElementById("view-search");
    const title = document.getElementById("view-title");
    const errorEl = document.getElementById("view-error");

    const chartSection = document.getElementById("chart-section");
    const chartTitle = document.getElementById("chart-title");
    const chartCanvas = document.getElementById("viewChart");

    ensureAuthenticated().then(loadViewsList);

    async function ensureAuthenticated() {
        try {
            await apiRequest("/auth/profile", { method: "GET" });
        } catch {
            window.location.href = "index.html";
        }
    }

    // Load all SQL views
    async function loadViewsList() {
        try {
            const data = await apiRequest("/views", { method: "GET" });
            const views = (data.available_views || []).sort();

            select.innerHTML = "";

            views.forEach(viewName => {
                const opt = document.createElement("option");
                opt.value = viewName;
                opt.textContent = prettifyViewName(viewName);
                select.appendChild(opt);
            });

        } catch (err) {
            errorEl.textContent = "Failed to load views: " + err.message;
        }
    }

    // Load selected view
    loadBtn.addEventListener("click", loadSelectedView);

    async function loadSelectedView() {
        errorEl.textContent = "";
        currentViewData = [];

        const viewName = select.value;
        if (!viewName) return;

        try {
            const data = await apiRequest(`/views/${encodeURIComponent(viewName)}`, { method: "GET" });

            currentViewData = data.data || [];

            title.textContent = "View: " + prettifyViewName(viewName);
            renderViewTable();

            generateChartIfNeeded(viewName);

        } catch (err) {
            errorEl.textContent = "Unable to load view: " + err.message;
        }
    }

    // filter and search
    searchInput.addEventListener("input", renderViewTable);

    function renderViewTable() {
        const thead = document.getElementById("view-thead");
        const tbody = document.getElementById("view-tbody");
        const searchTerm = (searchInput.value || "").toLowerCase();

        thead.innerHTML = "";
        tbody.innerHTML = "";

        if (!currentViewData.length) return;

        const columns = Object.keys(currentViewData[0]);

        const trHead = document.createElement("tr");
        columns.forEach(col => {
            const th = document.createElement("th");
            th.textContent = prettifyViewName(col);
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);

        currentViewData
            .filter(row =>
                Object.values(row).some(value =>
                    String(value ?? "").toLowerCase().includes(searchTerm)
                )
            )
            .forEach(row => {
                const tr = document.createElement("tr");
                columns.forEach(col => {
                    const td = document.createElement("td");
                    td.textContent = row[col];
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
    }


    function generateChartIfNeeded(viewName) {
        const view = viewName.toLowerCase();

        // Reset old chart
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
        chartSection.style.display = "none";

        if (!currentViewData.length) return;

        const ctx = chartCanvas.getContext("2d");

        // bar chart for visitorticketsummary
        if (view === "visitorticketsummary") {
            const counts = {};

            currentViewData.forEach(row => {
                const type = row.ticket_type;
                const number = Number(row.number_of_tickets) || 0;
                if (!counts[type]) counts[type] = 0;
                counts[type] += number;
            });

            chartSection.style.display = "block";
            chartTitle.textContent = "Tickets Sold Per Ticket Type";

            currentChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        label: "Tickets Sold",
                        data: Object.values(counts),
                        backgroundColor: "#629468",
                        borderColor: "#4C7A52",
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {
                        x: { barPercentage: 0.5, categoryPercentage: 0.5 },
                        y: { beginAtZero: true }
                    },
                    plugins: {
                        legend: { labels: { font: { size: 18, weight: "bold" } } }
                    }
                }
            });
            return;
        }

        // bar chart for animalvethabitatinfo
        if (view === "animalvethabitatinfo") {
            const counts = {};

            currentViewData.forEach(row => {
                const status = row.recorded_health_status;
                if (!counts[status]) counts[status] = 0;
                counts[status]++;
            });

            chartSection.style.display = "block";
            chartTitle.textContent = "Animal Count Per Health Status";

            currentChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        label: "Animals",
                        data: Object.values(counts),
                        backgroundColor: "#7f9f7a",
                        borderColor: "#4f664b",
                        borderWidth: 2
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
            return;
        }

        // pie chart for donationoverview
        if (view === "donationoverview") {
            const names = [];
            const amounts = [];

            currentViewData.forEach(row => {
                names.push(row.VisitorName);
                amounts.push(Number(row.DonationAmount));
            });

            chartSection.style.display = "block";
            chartTitle.textContent = "Donations Per Visitor";

            currentChart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: names,
                    datasets: [{
                        label: "Donations",
                        data: amounts,
                        backgroundColor: [
                            "#295234",
                            "#77a681",
                            "#467a50",
                            "#183021",
                            "#abd6b4"
                        ],
                        borderColor: [
                            "#295234",
                            "#77a681",
                            "#467a50",
                            "#183021",
                            "#abd6b4"
                        ],
                        borderWidth: 2
                    }]
                }
            });

            return;
        }
    }

// export csv for views
document.getElementById("export-csv").addEventListener("click", () => {
    if (!currentViewData.length) return alert("No data to export.");

    const rows = [];
    const headers = Object.keys(currentViewData[0]);
    rows.push(headers.join(","));

    currentViewData.forEach(row => {
        rows.push(headers.map(h => `"${row[h] ?? ""}"`).join(","));
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();

    URL.revokeObjectURL(url);
});

// export pdf for views
document.getElementById("export-pdf").addEventListener("click", () => {
    if (!currentViewData.length) return alert("No data to export.");

    const win = window.open("", "_blank");

    win.document.write("<html><head><title>Report PDF</title></head><body>");
    win.document.write(`<h2>${document.getElementById("view-title").textContent}</h2>`);
    win.document.write("<table border='1' cellspacing='0' cellpadding='5'>");

    // Headers
    win.document.write("<tr>");
    Object.keys(currentViewData[0]).forEach(h => {
        win.document.write(`<th>${h}</th>`);
    });
    win.document.write("</tr>");

    // Data rows
    currentViewData.forEach(row => {
        win.document.write("<tr>");
        Object.keys(row).forEach(col => {
            win.document.write(`<td>${row[col]}</td>`);
        });
        win.document.write("</tr>");
    });

    win.document.write("</table>");
    win.document.write("</body></html>");

    win.document.close();
    win.print();
});

// Custom JSON Web Service: Load Animal Summary
document.getElementById("load-summary-btn").addEventListener("click", async () => {
    const output = document.getElementById("summary-output");
    output.textContent = "Loading...";

    try {
        const res = await apiRequest("/reports/animal-summary", { method: "GET" });
        output.textContent = JSON.stringify(res, null, 2);
    } catch (err) {
        output.textContent = "Error loading summary: " + err.message;
    }
});

});
