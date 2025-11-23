let chart;

async function fetchWeather() {
    try {
        const city = "Toronto";

        const res = await fetch(`/api/weather/${city}`);
        const data = await res.json();

        if (!data || data.error) {
            alert("Could not fetch weather.");
            return;
        }

        // Update text fields
        document.getElementById("temp").textContent = data.temperature;
        document.getElementById("humidity").textContent = data.humidity;
        document.getElementById("condition").textContent = data.condition;
        document.getElementById("city").textContent = data.city;

        // Update chart
        updateWeatherChart(data);
    }
    catch (err) {
        console.error(err);
        alert("Weather fetch failed.");
    }
}

function updateWeatherChart(data) {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    // prevent stacking
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        ],
        datasets: [{
            label: "Temperature (°C)",
            data: [data.temperature],
            borderWidth: 2,
            borderColor: "#183021",
            backgroundColor: "#295234",
            tension: 0.3,
            fill: true,
        }]
    },
    options: {
    responsive: true,
    plugins: {
        legend: {
            labels: {
                font: {
                    size: 18,
                    weight: 'bold'
                },
                padding: 20
            }
        }
    },
    scales: {
        x: {
            grid: { display: false },
            ticks: { display: false },
            title: {
                display: true,
                text: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                font: { size: 14},
                padding: { top: 10 }
            }
        },
        y: {
            beginAtZero: false
        }
    }
}

});

}


window.addEventListener("DOMContentLoaded", () => {
    fetchWeather();

    document.getElementById("refresh-weather").addEventListener("click", () => {
        fetchWeather();
    });
});
