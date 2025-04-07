import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ThreeGlobe from 'three-globe';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
camera.position.z = 800;

const controls = new OrbitControls(camera, renderer.domElement);
const globe = new ThreeGlobe().globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg');
scene.add(globe);
scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));

let activePoints = [];
let locationCount = {};

function updatePoints() {
  const now = Math.max(...activePoints.map(p => p.timestamp));

  // Remove old points (older than 10 seconds)
  activePoints = activePoints.filter(p => now - p.timestamp < 10);

  globe
    .pointsData(activePoints)
    .pointAltitude(0.00001)
    .pointColor("color")
    .pointRadius("size");

  updateTopLocations();
}

function updateTopLocations() {
  // Clear and recalculate the location count from the active points
  locationCount = {};

  activePoints.forEach(point => {
    const location = `${point.lat.toFixed(2)},${point.lng.toFixed(2)}`;
    locationCount[location] = (locationCount[location] || 0) + 1;
  });

  const sortedLocations = Object.entries(locationCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Get top 5 locations

  const topLocationsDiv = document.getElementById('top-locations');
  topLocationsDiv.innerHTML = sortedLocations
    .map(([location, count]) => `<div class="location">${location} - ${count}</div>`)
    .join('');
}

function fetchData() {
  fetch("http://localhost:5000/data")
    .then(res => res.json())
    .then(data => {
      const now = Date.now();
      // Map the new data into activePoints and update the location count
      data.forEach(d => {
        activePoints.push({
          lat: d.latitude,
          lng: d.longitude,
          size: 0.5,
          color: d.suspicious ? 'red' : 'white',
          timestamp: d.timestamp
        });
      });
      updatePoints();
    });
}

setInterval(fetchData, 1000);
setInterval(updatePoints, 1000);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
