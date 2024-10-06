import * as THREE from "three";

let camera, scene, renderer, starGeo, stars;

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

  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setClearColor(0x000000);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(new Float32Array(6000 * 3), 3)
  );
  for (let i = 0; i < 6000; i++) {
    const star = new THREE.Vector3(
      Math.random() * 600 - 300,
      Math.random() * 600 - 300,
      Math.random() * 600 - 300
    );
    star.velocity = 0.1; // Optional if used later
    star.acceleration = 0.02; // Optional if used later
    starGeo.attributes.position.setXYZ(i, star.x, star.y, star.z);
  }
  let sprite = new THREE.TextureLoader().load("../assets/star.png");
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.5,
    sizeAttenuation: true,
    map: sprite,
  });

  stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);
  animate();
}

function animate() {
  const position = starGeo.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const p = position.getX(i), y = position.getY(i), z = position.getZ(i);
    position.setXYZ(i, p, y - 0.3, z);
    if (y < -300) {
      position.setXYZ(i, p, 300, z);
    }
  }
  starGeo.attributes.position.needsUpdate = true;
  stars.rotation.y += 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

init();
