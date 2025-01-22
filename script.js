document.addEventListener("DOMContentLoaded", function() {
    setupNavigation();
    setupTripCalculations();
});

function setupNavigation() {
    const toTripViewButton = document.getElementById("toTripView");
    if (toTripViewButton) {
        toTripViewButton.addEventListener("click", handleNavigation);
    }
}

function handleNavigation() {
    const vehicleData = {
        fuelConsumption: parseFloat(document.getElementById("fuelConsumption").value),
        fuelCost: parseFloat(document.getElementById("fuelCost").value),
        maintenanceCost: parseFloat(document.getElementById("maintenanceCost").value),
        depreciation: parseFloat(document.getElementById("depreciation").value),
        annualMileage: parseFloat(document.getElementById("annualMileage").value),
    };
    localStorage.setItem("vehicleData", JSON.stringify(vehicleData));
    window.location.href = "trip.html";
}

function setupTripCalculations() {
    const tripForm = document.getElementById("tripForm");
    if (tripForm) {
        const stepsContainer = document.getElementById("stepsContainer");
        const addStepButton = document.getElementById("addStep");
        const resultsDiv = document.getElementById("results");
        let stepCount = 1;

        const vehicleData = JSON.parse(localStorage.getItem("vehicleData"));
        const costPerKm = calculateCostPerKm(vehicleData);

        addStepButton.addEventListener("click", () => addStep(stepsContainer, ++stepCount));
        tripForm.addEventListener("submit", function(event) {
            event.preventDefault();
            handleTripFormSubmit(event, stepCount, costPerKm, resultsDiv);
        });
    }
}

function addStep(stepsContainer, stepCount) {
    const stepDiv = document.createElement("div");
    stepDiv.classList.add("step");
    stepDiv.innerHTML = `
        <h2>Step ${stepCount}</h2>
        <label for="distance${stepCount}">Distance (km):</label>
        <input type="number" id="distance${stepCount}" name="distance" required>
        <label for="passengers${stepCount}">Passengers (comma-separated names):</label>
        <input type="text" id="passengers${stepCount}" name="passengers" required>
    `;
    stepsContainer.appendChild(stepDiv);
}

function handleTripFormSubmit(event, stepCount, costPerKm, resultsDiv) {
    const distances = [...document.querySelectorAll("input[name='distance']")].map(input => parseFloat(input.value));
    const passengersList = [...document.querySelectorAll("input[name='passengers']")].map(input => input.value.split(',').map(name => name.trim()));
    const fixedCost = parseFloat(document.getElementById("fixedCost").value);

    let totalCost = 0;
    let resultsHtml = "<h2>Results</h2>";
    const passengerCosts = {};

    distances.forEach((distance, index) => {
        const passengers = passengersList[index];
        const stepCost = (distance * costPerKm) / passengers.length;
        totalCost += stepCost * passengers.length;

        passengers.forEach(passenger => {
            if (!passengerCosts[passenger]) {
                passengerCosts[passenger] = 0;
            }
            passengerCosts[passenger] += stepCost;
        });

        resultsHtml += `<p>Step ${index + 1}: ${stepCost.toFixed(2)} $/passenger</p>`;
    });

    const fixedCostPerPassenger = fixedCost / passengersList[passengersList.length - 1].length;
    totalCost += fixedCost;
    resultsHtml += `<p>Fixed costs per passenger: ${fixedCostPerPassenger.toFixed(2)} $</p>`;

    resultsHtml += `<h3>Total cost per passenger:</h3>`;
    for (const [passenger, cost] of Object.entries(passengerCosts)) {
        resultsHtml += `<p>${passenger}: ${(cost + fixedCostPerPassenger).toFixed(2)} $</p>`;
    }

    resultsDiv.innerHTML = resultsHtml;
}

function calculateCostPerKm(data) {
    const fuelCostPerKm = (data.fuelConsumption * data.fuelCost) / 100;
    const maintenanceCostPerKm = data.maintenanceCost / data.annualMileage;
    const depreciationCostPerKm = data.depreciation / data.annualMileage;
    return fuelCostPerKm + maintenanceCostPerKm + depreciationCostPerKm;
}
