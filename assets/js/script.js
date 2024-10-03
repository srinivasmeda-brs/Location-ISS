const map = L.map('map').setView([0, 0], 2); // Initialize map centered at [0, 0] with zoom level 2

// Load and display tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const issMarker = L.marker([0, 0]).addTo(map); // Create a marker for the ISS

async function getISSLocation() {
    const response = await fetch('http://api.open-notify.org/iss-now.json'); // Fetch ISS location
    const data = await response.json();
    const { latitude, longitude } = data.iss_position; // Extract latitude and longitude

    // Update marker position and map view
    issMarker.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], 4); // Adjust map view to ISS location
    document.getElementById('location').innerText = `Latitude: ${latitude}, Longitude: ${longitude}`; // Display coordinates
}
