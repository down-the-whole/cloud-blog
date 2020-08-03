import './index.scss'

let container = document.querySelector("body"),
    w = container.clientWidth,
    h = container.clientHeight,
    scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(25, w / h, 0.001, 1000),
    controls = new THREE.TrackballControls(camera, container),
    renderConfig = { antialias: true, alpha: true },
    renderer = new THREE.WebGLRenderer(renderConfig);

controls.target = new THREE.Vector3(0, 0, 0.75);
controls.panSpeed = 0.4;
camera.position.set(0, 0, 40);
camera.lookAt(new THREE.Vector3(0, 0, 0));
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(w, h);
container.appendChild(renderer.domElement);

window.addEventListener("resize", function () {
    w = container.clientWidth;
    h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});

function render(a) {
    const frame = Math.floor(a % 10000) * 0.0001;
    const rotationCoordinate = d3.easeCubic(frame) * Math.PI * 2;

    piece1.rotation.x = rotationCoordinate;
    piece1.rotation.y = rotationCoordinate;
    piece2.rotation.x = rotationCoordinate * -1;
    piece2.rotation.y = rotationCoordinate * -1;
    piece3.rotation.x = rotationCoordinate;
    piece3.rotation.y = rotationCoordinate * -1;

    particleSystem.rotation.y += 0.0001;
    particleSystem.rotation.x += 0.0003;

    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
}

// Create Triangles
let normalMap = new THREE.TextureLoader().load(
    "./metal-seamless-normal-mapping.jpg"
);
normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
let material = new THREE.MeshPhongMaterial({
    color: 0xf6c12a,
    normalMap: normalMap,
    shininess: 70
});

let shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(2, 3);
shape.lineTo(4, 0);
shape.lineTo(0, 0);

let extrudeSettings = {
    steps: 5,
    depth: 1,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.5,
    bevelOffset: 0,
    bevelSegments: 1
};

let geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);

// Sets the origin to the center of geometry for rotation
geometry.center();

let piece1 = new THREE.Mesh(geometry, material);
let piece2 = new THREE.Mesh(geometry, material);
let piece3 = new THREE.Mesh(geometry, material);

piece1.position.x = -3.9;
piece1.position.y = -3;
piece1.scale.set(1.5, 1.5, 1.5);

piece2.position.x = 3.9;
piece2.position.y = -3;
piece2.scale.set(1.5, 1.5, 1.5);

piece3.position.x = 0;
piece3.position.y = 3;
piece3.scale.set(1.5, 1.5, 1.5);

let group = new THREE.Group();
group.add(piece1);
group.add(piece2);
group.add(piece3);
scene.add(group);

// Background
geometry = new THREE.PlaneGeometry(1000, 1000, 1);
material = new THREE.MeshPhysicalMaterial({ color: 0x444444 });
let plane = new THREE.Mesh(geometry, material);
plane.position.z = -50;
scene.add(plane);

// Lighting
let ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

let pointLight1 = new THREE.PointLight(0xf9eac8, 1, 100);
pointLight1.position.set(20, 30, 10);
pointLight1.castShadow = true;
pointLight1.shadow.camera.top = 20;
scene.add(pointLight1);

let pointLight2 = new THREE.PointLight(0xd2e0fa, 1, 100);
pointLight2.position.set(-20, 30, 10);
pointLight2.castShadow = true;
pointLight2.shadow.camera.top = 20;
scene.add(pointLight2);

let pointLight3 = new THREE.PointLight(0xdcfbe2, 1, 100);
pointLight3.position.set(0, -3.5, -5);
pointLight3.castShadow = true;
pointLight3.shadow.camera.top = 20;
scene.add(pointLight3);

// Particle System from https://aerotwist.com/tutorials/creating-particles-with-three-js/
let particleTexture = new THREE.TextureLoader().load(
    "./particle.png"
);

let particleCount = 600,
    particles = new THREE.Geometry(),
    pMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: Math.random() * (3.5 - 2) + 2,
        map: particleTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        alphaTest: 0.005,
        transparent: true,
        opacity: 0.3
    });

// now create the individual particles
for (let p = 0; p < particleCount; p++) {
    let pX = Math.random() * 50 - 25,
        pY = Math.random() * 50 - 25,
        pZ = Math.random() * 50 - 25,
        particle = new THREE.Vector3(pX, pY, pZ);
    particle.velocity = new THREE.Vector3(0, -Math.random(), 0);

    // add it to the geometry
    particles.vertices.push(particle);
}

// create the particle system
let particleSystem = new THREE.Points(particles, pMaterial);

// add it to the scene
scene.add(particleSystem);

render();
