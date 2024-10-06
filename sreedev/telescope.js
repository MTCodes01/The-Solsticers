import * as THREE from "three";
import { OrbitControls } from "./three/examples/jsm/controls/OrbitControls.js";

if (localStorage.getItem("page") === null) {
  localStorage.setItem("page", "telescope");
}
// Select the elements by their ID
// const cubeIcon = document.getElementById("cubeIcon");
// const binocularIcon = document.getElementById("binocularIcon");


// Add click event listener for the cube icon
// document.getElementById("cubeIcon").addEventListener("click", function(event) {
//   localStorage.setItem("page", "cube");
// });
// document.getElementById("binocularIcon").addEventListener("click", function(event) {
//   localStorage.setItem("page", "telescope");
// });



// const cube = document.getElementsByClassName("fa-cube");
// cube[0].addEventListener("click", function () {
//   localStorage.setItem("page", "cube");
// });

// const telescope = document.getElementsByClassName("fa-binoculars");
// telescope[0].addEventListener("click", function () {
//   localStorage.setItem("page", "telescope");
// });

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

  // Get the saved theme from localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme); // Apply saved theme on page load
  } else {
    applyTheme("light"); // Default theme is light
  }

  // Toggle theme on button click
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

  // Get the FOV slider element
  const fovSlider = document.getElementById("fovRange");

  // Set initial FOV value from slider
  fovSlider.addEventListener("input", () => {
    const fovValue = fovSlider.value;
    camera.fov = fovValue; // Update the camera's FOV
    camera.updateProjectionMatrix(); // Apply the change
  });

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth - 50, window.innerHeight - 50);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

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
  const searchInput = document.getElementById("planetSearch");

  function searchPlanetByName(query) {
    // Convert query to lowercase for case-insensitive search
    const searchTerm = query.toLowerCase();

    // Iterate over all the children (planets) in planetGroup
    for (let planet of planetGroup.children) {
      const planetName = planet.userData["Planet Name"].toLowerCase();

      if (planetName.includes(searchTerm)) {
        // If a match is found, highlight the planet and display its info
        planet.scale.set(1.5, 1.5, 1.5); // Highlight the matched planet
        title.innerText = planet.userData["Planet Name"];
        infoBox.innerHTML = `
        <strong>Host name:</strong> ${planet.userData["Host name"]} <br>
        <strong>Discovery Method:</strong> ${planet.userData["Discovery Method"]} <br>
        <strong>Discovery Year:</strong> ${planet.userData["Discovery Year"]} <br>
        <strong>Discovery Facility:</strong> ${planet.userData["Discovery Facility"]} <br>
        <strong>Planet Orbital Period(days):</strong> ${planet.userData["Planet Orbital Period(days)"]} <br>
        <strong>Planet Orbital Semi-Major Axis(au):</strong> ${planet.userData["Planet Orbital Semi-Major Axis(au)"]} <br>
        <strong>Planet Radius:</strong> ${planet.userData["Planet Radius"]} <br>
        <strong>Planet Mass(Earth Mass):</strong> ${planet.userData["Planet Mass(Earth Mass)"]} <br>
        <strong>Planet Eccentricity:</strong> ${planet.userData["Planet Eccentricity"]} <br>
        <strong>Insolation Flux (Earth Flux):</strong> ${planet.userData["Insolation Flux (Earth Flux)"]} <br>
        <strong>Equilibrium Temperature(K):</strong> ${planet.userData["Equilibrium Temperature(K)"]} <br>
        <strong>Spectral Type:</strong> ${planet.userData["Spectral Type"]} <br>
        <strong>Stellar Effective Temperature(K):</strong> ${planet.userData["Stellar Effective Temperature(K)"]} <br>
        <strong>Distance(pc):</strong> ${planet.userData["Distance(pc)"]} <br>
      `;

        // Optionally, you can stop the loop after finding the first match
        break;
      }
    }
  }

  // Add event listener to the search input field for keydown events
  searchInput.addEventListener("keydown", (event) => {
    // Check if the Enter key (key code 13) is pressed
    if (event.key === "Enter") {
      const searchQuery = searchInput.value;
      if (searchQuery) {
        searchPlanetByName(searchQuery);
      }
    }
  });

  const clock = new THREE.Clock();

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  loadData();

  

