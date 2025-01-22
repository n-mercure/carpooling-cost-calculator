
document.addEventListener("DOMContentLoaded", function() {
    // Navigation between views
    const toTripViewButton = document.getElementById("toTripView");
    if (toTripViewButton) {
        toTripViewButton.addEventListener("click", function() {
            const vehicleData = {
                fuelConsumption: parseFloat(document.getElementById("fuelConsumption").value),
                fuelCost: parseFloat(document.getElementById("fuelCost").value),
                maintenanceCost: parseFloat(document.getElementById("maintenanceCost").value),
                depreciation: parseFloat(document.getElementById("depreciation").value),
                annualMileage: parseFloat(document.getElementById("annualMileage").value),
            };
            localStorage.setItem("vehicleData", JSON.stringify(vehicleData));
            window.location.href = "trip.html";
        });
    }

    // Trip calculations
    const tripForm = document.getElementById("tripForm");
    if (tripForm) {
        const stepsContainer = document.getElementById("stepsContainer");
        const addStepButton = document.getElementById("addStep");
        const resultsDiv = document.getElementById("results");
        let stepCount = 1;

        const vehicleData = JSON.parse(localStorage.getItem("vehicleData"));
        const costPerKm = calculateCostPerKm(vehicleData);

        addStepButton.addEventListener("click", () => {
            stepCount++;
            const stepDiv = document.createElement("div");
            stepDiv.classList.add("step");
            stepDiv.innerHTML = `
                <h2>Step ${stepCount}</h2>
                <label for="distance${stepCount}">Distance (km):</label>
                <input type="number" id="distance${stepCount}" name="distance" required>
                <label for="passengers${stepCount}">Passengers:</label>
                <input type="number" id="passengers${stepCount}" name="passengers" required>
            `;
            stepsContainer.appendChild(stepDiv);
        });

        tripForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const distances = [...document.querySelectorAll("input[name='distance']")].map(input => parseFloat(input.value));
            const passengers = [...document.querySelectorAll("input[name='passengers']")].map(input => parseInt(input.value));
            const fixedCost = parseFloat(document.getElementById("fixedCost").value);

            let totalCost = 0;
            let resultsHtml = "<h2>Results</h2>";

            distances.forEach((distance, index) => {
                const stepCost = (distance * costPerKm) / passengers[index];
                totalCost += stepCost;
                resultsHtml += `<p>Step ${index + 1}: ${stepCost.toFixed(2)} $/passenger</p>`;
            });

            const fixedCostPerPassenger = fixedCost / passengers[passengers.length - 1];
            totalCost += fixedCost;
            resultsHtml += `<p>Fixed costs per passenger: ${fixedCostPerPassenger.toFixed(2)} $</p>`;
            resultsHtml += `<h3>Total cost per passenger: ${(totalCost / passengers[passengers.length - 1]).toFixed(2)} $</h3>`;

            resultsDiv.innerHTML = resultsHtml;
        });

        function calculateCostPerKm(data) {
            const fuelCostPerKm = (data.fuelConsumption * data.fuelCost) / 100;
            const maintenanceCostPerKm = data.maintenanceCost / data.annualMileage;
            const depreciationCostPerKm = data.depreciation / data.annualMileage;
            return fuelCostPerKm + maintenanceCostPerKm + depreciationCostPerKm;
        }
    }
});
