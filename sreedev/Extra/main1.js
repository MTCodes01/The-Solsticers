let camera, scene, renderer, starGeo, stars, star;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 1;
  camera.rotation.x = Math.PI / 2;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  starGeo = new THREE.Geometry();
  for (let i = 0; i < 6000; i++) {
    star = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    star.velocity = 0;
    star.acceleration = 0.02;
    starGeo.vertices.push(star);
  }
  let sprite = new THREE.TextureLoader().load("star.png");
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.5,
    map: sprite,
  });

  stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);
  animate();
}

// Control variables for free camera movement
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
};

let rotationSpeed = 0.002; // Mouse sensitivity
let moveSpeed = 0.05; // Camera movement speed

// Event listeners for keyboard inputs
document.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.forward = true;
      break; // Move forward
    case "KeyS":
      keys.backward = true;
      break; // Move backward
    case "KeyA":
      keys.left = true;
      break; // Strafe left
    case "KeyD":
      keys.right = true;
      break; // Strafe right
    case "Space":
      keys.up = true;
      break; // Move up
    case "ShiftLeft":
      keys.down = true;
      break; // Move down
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.forward = false;
      break;
    case "KeyS":
      keys.backward = false;
      break;
    case "KeyA":
      keys.left = false;
      break;
    case "KeyD":
      keys.right = false;
      break;
    case "Space":
      keys.up = false;
      break;
    case "ShiftLeft":
      keys.down = false;
      break;
  }
});

// Mouse movement to control camera look-around
document.addEventListener("mousemove", (event) => {
  const deltaX = event.movementX * rotationSpeed;
  const deltaY = event.movementY * rotationSpeed;

  camera.rotation.y -= deltaX; // Rotate left/right
  camera.rotation.x -= deltaY; // Rotate up/down
});

// Update the camera position based on the keys pressed
function updateCameraMovement() {
  const direction = new THREE.Vector3();

  if (keys.forward) {
    camera.getWorldDirection(direction);
    camera.position.addScaledVector(direction, moveSpeed);
  }
  if (keys.backward) {
    camera.getWorldDirection(direction);
    camera.position.addScaledVector(direction, -moveSpeed);
  }
  if (keys.left) {
    camera.position.x -= moveSpeed;
  }
  if (keys.right) {
    camera.position.x += moveSpeed;
  }
  if (keys.up) {
    camera.position.y += moveSpeed;
  }
  if (keys.down) {
    camera.position.y -= moveSpeed;
  }
}

function animate() {
  starGeo.vertices.forEach((p) => {
    p.velocity += p.acceleration;
    p.y -= p.velocity;
    if (p.y < -200) {
      p.y = 200;
      p.velocity = 0;
    }
  });
  starGeo.verticesNeedUpdate = true;
  stars.rotation.y += 0.002;
  updateCameraMovement();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function revealListItems() {
  const listItems = document.querySelectorAll(".points li");
  listItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add("reveal");
    }, index * 100);
  });
}

revealListItems();
init();
