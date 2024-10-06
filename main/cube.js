import * as THREE from "three";

const darkModeToggle = document.querySelector(".left-bottom");
const wrapper = document.getElementById("wrapper"); // Select the body element
const body = document.body;

function applyTheme(theme) {
  if (theme === "dark") {
    wrapper.classList.add("dark-mode");
    body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️"; // Switch to sun icon for light mode
  } else {
    body.classList.remove("dark-mode");
    wrapper.classList.remove("dark-mode");
    darkModeToggle.textContent = "🌙"; // Switch to moon icon for dark mode
  }
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  applyTheme(savedTheme); // Apply saved theme on page load
} else {
  applyTheme("light"); // Default theme is light
}

darkModeToggle.addEventListener("click", () => {
  const currentTheme = wrapper.classList.contains("dark-mode")
    ? "dark"
    : "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  applyTheme(newTheme);
  localStorage.setItem("theme", newTheme); // Save the new theme to localStorage
});

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

const fovSlider = document.getElementById("fovRange");
fovSlider.addEventListener("input", () => {
  const fovValue = fovSlider.value;
  camera.fov = fovValue; // Update the camera's FOV
  camera.updateProjectionMatrix(); // Apply the change
});

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 50, window.innerHeight - 50);
document.body.appendChild(renderer.domElement);

// Disable orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const infoBox = document.getElementById("info");
const title = document.getElementById("title");

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

    if (intersectedObject.userData) {
      const planetData = intersectedObject.userData;
      title.innerText = planetData["Planet Name"];
      infoBox.innerHTML = `<strong>Host name:</strong> ${planetData["Host name"]} <br>
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
        <strong>Distance(pc):</strong> ${planetData["Distance(pc)"]} <br>`;
    }
  }
});

loadData();

let moveForward = false,
  moveBackward = false,
  moveLeft = false,
  moveRight = false,
  moveUp = false,
  moveDown = false,
  sprint = false;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 50; // Movement speed
const sprintMultiplier = 1.5; // Sprint speed multiplier
const lookSpeed = 0.002; // Mouse look sensitivity

let yaw = 0;
let pitch = 0;

const onKeyDown = (event) => {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveBackward = true;
      break;
    case "ArrowLeft":
    case "KeyA":
      moveLeft = true;
      break;
    case "ArrowDown":
    case "KeyS":
      moveForward = true;
      break;
    case "ArrowRight":
    case "KeyD":
      moveRight = true;
      break;
    case "ShiftLeft":
      sprint = true;
      break;
    case "Space":
      moveUp = true;
      break;
    case "ControlLeft":
      moveDown = true;
      break;
  }
};

const onKeyUp = (event) => {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveBackward = false;
      break;
    case "ArrowLeft":
    case "KeyA":
      moveLeft = false;
      break;
    case "ArrowDown":
    case "KeyS":
      moveForward = false;
      break;
    case "ArrowRight":
    case "KeyD":
      moveRight = false;
      break;
    case "ShiftLeft":
      sprint = false;
      break;
    case "Space":
      moveUp = false;
      break;
    case "ControlLeft":
      moveDown = false;
      break;
  }
};

const onMouseMove = (event) => {
  const movementX =
    event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  const movementY =
    event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  yaw -= movementX * lookSpeed;
  pitch -= movementY * lookSpeed;
};

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("mousemove", onMouseMove);

function animate() {
  requestAnimationFrame(animate);

  // Camera movement logic
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.y = Number(moveUp) - Number(moveDown);
  direction.normalize();

  const currentSpeed = sprint ? speed * sprintMultiplier : speed;

  velocity.x = direction.x * currentSpeed * 0.02;
  velocity.y = direction.y * currentSpeed * 0.02;
  velocity.z = direction.z * currentSpeed * 0.02;

  camera.translateX(velocity.x);
  camera.translateY(velocity.y);
  camera.translateZ(velocity.z);

  // Mouse look logic
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}
