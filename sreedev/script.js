import * as THREE from "three";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";

let planetGroup = new THREE.Group();
const tempData = {
  minTemp: 0,
  avgTemp: 5426.44382,
  maxTemp: 57000,
};
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoBox = document.getElementById("info");

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function getRandomCoordinates(distance) {
  const k = 100;
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(Math.random() * 2 - 1);
  const x = k * distance * Math.sin(phi) * Math.cos(theta);
  const y = k * distance * Math.sin(phi) * Math.sin(theta);
  const z = k * distance * Math.cos(phi);

  return { x, y, z };
}

const interpolateColor = (color1, color2, factor) => {
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  return c1.lerp(c2, factor);
};

const getColorFromTemp = (st_teff, minTemp, avgTemp, maxTemp) => {
  const darkBlue = 0x00008b;
  const white = 0xffffff;
  const darkRed = 0x8b0000;

  const clampedTeff = Math.min(Math.max(st_teff, minTemp), maxTemp);

  if (clampedTeff <= avgTemp) {
    const factor = (clampedTeff - minTemp) / (avgTemp - minTemp);
    return interpolateColor(darkBlue, white, factor);
  } else {
    const factor = (clampedTeff - avgTemp) / (maxTemp - avgTemp);
    return interpolateColor(darkRed, white, factor);
  }
};

const createPlanet = (
  pl_name,
  hostname,
  discoverymethod,
  disc_year,
  disc_facility,
  pl_orbper,
  pl_orbsmax,
  pl_rade,
  pl_bmasse,
  pl_orbeccen,
  pl_insol,
  pl_eqt,
  st_spectype,
  st_teff,
  sy_dist
) => {
  const size = pl_rade;

  const { minTemp, avgTemp, maxTemp } = tempData;
  const coordinates = getRandomCoordinates(parseInt(sy_dist));
  const color = getColorFromTemp(st_teff, minTemp, avgTemp, maxTemp);

  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: color.getHex() });
  const planet = new THREE.Mesh(geometry, material);

  planet.position.set(coordinates.x, coordinates.y, coordinates.z);

  planet.userData = {
    Color: color.getHex(),
    "Planet Name": pl_name,
    "Host name": hostname,
    "Discovery Method": discoverymethod,
    "Discovery Year": disc_year,
    "Discovery Facility": disc_facility,
    "Planet Orbital Period(days)": pl_orbper,
    "Planet Orbital Semi-Major Axis(au)": pl_orbsmax,
    "Planet Radius": pl_rade,
    "Planet Mass(Earth Mass)": pl_bmasse,
    "Planet Eccentricity": pl_orbeccen,
    "Insolation Flux (Earth Flux)": pl_insol,
    "Equilibrium Temperature(K)": pl_eqt,
    "Spectral Type": st_spectype,
    "Stellar Effective Temperature(K)": st_teff,
    "Distance(pc)": sy_dist,
  };

  return planet;
};

async function loadData() {
  try {
    const response = await fetch("./data.json");
    const data = await response.json();
    // const planetGroup = new THREE.Group();

    data.info.forEach((planetData) => {
      const {
        pl_name,
        hostname,
        discoverymethod,
        disc_year,
        disc_facility,
        pl_orbper,
        pl_orbsmax,
        pl_rade,
        pl_bmasse,
        pl_orbeccen,
        pl_insol,
        pl_eqt,
        st_spectype,
        st_teff,
        sy_dist,
      } = planetData;
      const planet = createPlanet(
        pl_name,
        hostname,
        discoverymethod,
        disc_year,
        disc_facility,
        pl_orbper,
        pl_orbsmax,
        pl_rade,
        pl_bmasse,
        pl_orbeccen,
        pl_insol,
        pl_eqt,
        st_spectype,
        st_teff,
        sy_dist
      );
      planetGroup.add(planet);
    });

    scene.add(planetGroup);

    animate();
  } catch (error) {
    console.error("Error loading planet data:", error);
  }
}

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(planetGroup.children, true);

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;

    if (intersectedObject.userData /* && isInView(intersectedObject) */) {
      const planetData = intersectedObject.userData;
      infoBox.innerHTML = `
        <strong>Planet Name:</strong> ${planetData["Planet Name"]} <br>
        <strong>Host name:</strong> ${planetData["Host name"]} <br>
        <strong>Discovery Method:</strong> ${planetData["Discovery Method"]} <br>
        <strong>Discovery Year:</strong> ${planetData["Discovery Year"]} <br>
        <strong>Discovery Facility:</strong> ${planetData["Discovery Facility"]} <br>
        <strong>Planet Orbital Period(days):</strong> ${planetData["Planet Orbital Period(days)"]} <br>
        <strong>Planet Orbital Semi-Major Axis(au):</strong> ${planetData["Planet Orbital Semi-Major Axis(au)"]} <br>
        <strong>Planet Radius:</strong> ${planetData["Planet Radius"]} <br>
        <strong>Planet Mass(Earth Mass):</strong> ${planetData["Planet Mass(Earth Mass)"]} <br>
        <strong>Planet Eccentricity:</strong> ${planetData["Planet Eccentricity"]} <br>
        <strong>Insolation Flux (Earth Flux):</strong> ${planetData["Insolation Flux (Earth Flux)"]} <br>
        <strong>Equilibrium Temperature(K):</strong> ${planetData["Equilibrium Temperature(K)"]} <br>
        <strong>Spectral Type:</strong> ${planetData["Spectral Type"]} <br>
        <strong>Stellar Effective Temperature(K):</strong> ${planetData["Stellar Effective Temperature(K)"]} <br>
        <strong>Distance(pc):</strong> ${planetData["Distance(pc)"]} <br>
      `;
      // Highlight the clicked planet
      intersectedObject.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => intersectedObject.scale.set(1, 1, 1), 500);
    } else {
      infoBox.innerHTML = "Click on a planet to see details.";
    }
  }
});

function isInView(object) {
  const frustum = new THREE.Frustum();
  const cameraViewProjectionMatrix = new THREE.Matrix4();

  cameraViewProjectionMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

  const distance = camera.position.distanceTo(object.position);
  return frustum.intersectsObject(object) && distance < 50;
}

const clock = new THREE.Clock();

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

loadData();
