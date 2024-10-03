/**
Author:    Build Rise Shine with Nyros (BRS)
Created:   11.05.2022
Library / Component: Script file
Description: Logic behind the app (fetching the data from the API)
(c) Copyright by BRS with Nyros.
**/
let marker;
let zoom_level = 5;
let center_iss = true;
let chathams_blue = '#1A4B84';
let controller = new AbortController();
let speed = document.getElementById('speed');
let utcTime = document.getElementById('utcTime');
let iss_location = document.getElementById('iss_location');
let altitude = document.getElementById('altitude');
let latitude = document.getElementById('latitude');
let localTime = document.getElementById('localTime');
let longitude = document.getElementById('longitude');
let iss_center = document.getElementById('iss_center');
let visibility = document.getElementById('visibility');

const geoCodingUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const iss_location_api_endpoint = 'https://api.wheretheiss.at/v1/satellites/25544';
let mapbox_accesstoken = 'pk.eyJ1IjoicGFyaXNyaSIsImEiOiJja2ppNXpmaHUxNmIwMnpsbzd5YzczM2Q1In0.8VJaqwqZ_zh8qyeAuqWQgw';
mapboxgl.accessToken = mapbox_accesstoken;

iss_center.addEventListener('change', function (e) { center_iss = e.target.checked; });

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-v9'
});

// Create a marker element
const markerElement = document.createElement('div');
markerElement.className = 'marker';
marker = new mapboxgl.Marker(markerElement).setLngLat([0, 0]).addTo(map); // Initial marker position

async function getISSLocation() {
    controller.abort();
    controller = new AbortController();
    const signal = controller.signal;
    const issLocation = await fetch(iss_location_api_endpoint, { signal: signal });
    let iss_data = await issLocation.json();
    if (iss_data?.status === 404) return;

    const visibility = iss_data.visibility;
    const speed = iss_data.velocity.toFixed(2);
    const altitude = iss_data.altitude.toFixed(2);
    const timestamp = new Date(iss_data.timestamp * 1000);
    const timestampHours = timestamp.getHours();
    const timestampMinutes = timestamp.getMinutes();
    const timestampSeconds = timestamp.getSeconds();
    const timestampUTCHours = timestamp.getUTCHours();
    const timestampUTCSeconds = timestamp.getUTCSeconds();
    const timestampUTCMinutes = timestamp.getUTCMinutes();
    const lngLat = [iss_data.longitude.toFixed(2), iss_data.latitude.toFixed(2)];
    const localTimeFormat = [timestampHours, timestampMinutes, timestampSeconds].join(':');
    const utcTimeFormat = [timestampUTCHours, timestampUTCMinutes, timestampUTCSeconds].join(':');

    updateISS(lngLat, utcTimeFormat, localTimeFormat, speed, altitude, visibility);
}

async function updateISS(lngLat, utcTimeFormat, localTimeFormat, sp, al, vi) {
    if (center_iss) {
        map.flyTo({ center: lngLat, zoom: zoom_level });
    }

    visibility.innerText = vi;
    speed.innerText = `${sp} km/hr`;
    altitude.innerText = `${al} km`;
    
    // Update marker position
    marker.setLngLat(lngLat);
    
    utcTime.innerHTML = [utcTimeFormat, 'UTC'].join(' ');
    localTime.innerHTML = [localTimeFormat, 'IST'].join(' ');
    latitude.innerHTML = Math.abs(lngLat[1]) + `&#176; ${getDirection(lngLat[1], 'lat')}`;
    longitude.innerHTML = Math.abs(lngLat[0]) + `&#176; ${getDirection(lngLat[0], 'lng')}`;

    // Fetch location details
    const locDetails = await fetch(`${geoCodingUrl}/${lngLat[0]},${lngLat[1]}.json?access_token=${mapbox_accesstoken}`);
    console.log(`Fetching location for coordinates: ${lngLat[0]}, ${lngLat[1]}`); // Debugging line
    const locData = await locDetails.json();

    // Error handling
    if (locDetails.status !== 200) {
        console.error(`Geocoding API error: ${locDetails.status} - ${locData.message}`);
        iss_location.innerHTML = 'Location not available';
        return;
    }

    let region_data = locData.features.filter(e => e.place_type[0] === 'region')[0];
    if (region_data?.place_name) {
        iss_location.innerHTML = region_data?.place_name;
    } else {
        iss_location.innerHTML = locData.features[0]?.place_name || 'Not Available';
    }
}

function getDirection(coordinate, lngLat) {
    if (lngLat === 'lat') {
        return parseFloat(coordinate) < 0 ? 'South' : 'North';
    }
    return parseFloat(coordinate) < 0 ? 'West' : 'East';
}

setInterval(() => {
    getISSLocation();
}, 1000);

function setTheme(theme) {
    document.documentElement.style.setProperty('--primary-color', theme);
    localStorage.setItem('iss-theme', theme);
}

setTheme(localStorage.getItem('iss-theme') || chathams_blue);
