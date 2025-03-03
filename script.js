//------>  1. SAHNE OLUŞTUR
const scene = new THREE.Scene();

//------>  2. KAMERA OLUŞTUR
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

//------>  3. RENDERER OLUŞTUR
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor();
document.body.appendChild(renderer.domElement);

//------>  4. TAŞ BENZERİ YAPI OLUŞTUR
const particlesCount = 15999;
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);
const originalPositions = new Float32Array(particlesCount * 3);
const velocities = new Float32Array(particlesCount * 3);

//------> Taş formunda başlat (Düzensiz küre benzeri yapı)
for (let i = 0; i < particlesCount; i++) {
    let theta = Math.random() * Math.PI * 3;
    let phi = Math.acos((Math.random() * 2) - 1);
    let r = 1.5 + (Math.random() - 0.5) * 0.3; //------> Taş görünümü için rastgele değişiklikler

    let x = r * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 0.2;
    let y = r * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 0.2;
    let z = r * Math.cos(phi) + (Math.random() - 0.5) * 0.2;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    originalPositions[i * 3] = x;
    originalPositions[i * 3 + 1] = y;
    originalPositions[i * 3 + 2] = z;

    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: 0x555555,
    size: 0.025,
    transparent: true,
    opacity: 1
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

//------>  TOZ PARÇACIKLARININ BAŞLANGIÇ POZİSYONU
for (let i = 0; i < particlesCount; i++) {
    let direction = Math.random();

    let x, y, z;

    if (direction < 0.25) { 
        // Sol taraftan gelen parçacıklar
        x = -5 - Math.random() * 2;
        y = (Math.random() - 0.5) * 10;
        z = (Math.random() - 0.5) * 10;
    } else if (direction < 0.5) { 
        // Sağ taraftan gelen parçacıklar
        x = 5 + Math.random() * 2;
        y = (Math.random() - 0.5) * 10;
        z = (Math.random() - 0.5) * 10;
    } else if (direction < 0.75) { 
        // Yukarıdan gelen parçacıklar
        x = (Math.random() - 0.5) * 10;
        y = 5 + Math.random() * 2;
        z = (Math.random() - 0.5) * 10;
    } else { 
        // Aşağıdan gelen parçacıklar
        x = (Math.random() - 0.5) * 10;
        y = -5 - Math.random() * 2;
        z = (Math.random() - 0.5) * 10;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

//------> Parçacıkları küreye doğru hareket ettirme animasyonu
let animationProgress = 0;
function formationAnimation() {
    if (animationProgress < 1) {
        animationProgress += 0.01;

        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3] += (originalPositions[i * 3] - positions[i * 3]) * 0.05;
            positions[i * 3 + 1] += (originalPositions[i * 3 + 1] - positions[i * 3 + 1]) * 0.05;
            positions[i * 3 + 2] += (originalPositions[i * 3 + 2] - positions[i * 3 + 2]) * 0.05;
        }

        particlesGeometry.attributes.position.needsUpdate = true;

        requestAnimationFrame(formationAnimation);
    }
}

//------> Animasyonu başlat
formationAnimation();



//------> 5. IŞIK EKLE
const light = new THREE.PointLight(0xffffff, 2, 100);
light.position.set(2, 2, 2);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

//------> 6. ORBIT CONTROLS
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.8;
controls.enableZoom = true;
controls.enablePan = true;

//------> 7. SCROLL EVENT
window.addEventListener('scroll', () => {
    let scrollY = window.scrollY;
    let maxScroll = document.body.scrollHeight - window.innerHeight;
    let progress = scrollY / maxScroll;

    for (let i = 0; i < particlesCount * 10; i++) {
        let direction = progress * 100;
        positions[i] = originalPositions[i] + velocities[i] * direction;
    }
    particlesGeometry.attributes.position.needsUpdate = true;

    particlesMaterial.opacity = 1;
});

//------> 7. SCROLL EVENT (Un partikülleri aşağı indikçe hareket edecek)
window.addEventListener('scroll', () => {
    let scrollY = window.scrollY;
    let maxScroll = document.body.scrollHeight - window.innerHeight;
    let progress = scrollY / maxScroll;

    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3 + 1] -= progress * 0.02;
    }
    particlesGeometry.attributes.position.needsUpdate = true;
});

//------> 8. ANİMASYON DÖNGÜSÜ
function animate() {
    requestAnimationFrame(animate);

    particles.rotation.y += 0.002;
    particles.rotation.x += 0.0015;
    controls.update();

    renderer.render(scene, camera);
}
//------> 9. EKRAN BOYUTLANDIĞINDA GÜNCELLE
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let offset = { x: 0, y: 0 };

document.addEventListener("mousedown", (event) => {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    let deltaX = event.clientX - previousMousePosition.x;
    let deltaY = event.clientY - previousMousePosition.y;

    particles.rotation.y += deltaX * 0.005;
    particles.rotation.x += deltaY * 0.005;

    offset.x += deltaX * 0.01;
    offset.y -= deltaY * 0.01;
    particles.position.x = offset.x;
    particles.position.y = offset.y;

    previousMousePosition = { x: event.clientX, y: event.clientY };
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

//------> 10. BAŞLAT
animate();

