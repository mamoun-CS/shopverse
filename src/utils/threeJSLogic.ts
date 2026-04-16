export const generateThreeJSLogic = () => `
(function() {
  function sendError(e, context) {
    var errText = 'Caught Error in ' + context + ': ' + e.message + ' \\n ' + e.stack;
    var sub = document.querySelector('.loader-subtitle');
    if (sub) sub.innerHTML = '<span style="color:red">' + errText + '</span>';
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: errText }));
    }
  }

  window.onerror = function(msg, url, lineNo, columnNo, error) {
    if (error) return sendError(error, 'window.onerror');
    var errText = 'WebView Error: ' + msg + ' at line ' + lineNo;
    var sub = document.querySelector('.loader-subtitle');
    if (sub) sub.innerHTML = '<span style="color:red">' + errText + '</span>';
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: errText }));
    }
    return false;
  };
  console.log('🎮 ShopVerse City 3D Initializing...');
  
  // Configuration
  const CONFIG = {
    BLOCK_W: 60, BLOCK_D: 60, ROAD_W: 28,
    COLS: 4, ROWS: 4,
    AVATAR_SPEED: 10.0,
    CAM_RADIUS: 420,  
    CAM_THETA: -Math.PI / 4,
    CAM_PHI: Math.PI / 3.8,
    MIN_ZOOM: 80,
    MAX_ZOOM: 900,
    ANIMATION_SPEED: 1.0
  };
  
  // Calculate city dimensions
  const STEP_X = CONFIG.BLOCK_W + CONFIG.ROAD_W;
  const STEP_Z = CONFIG.BLOCK_D + CONFIG.ROAD_W;
  const CITY_W = CONFIG.COLS * STEP_X + CONFIG.ROAD_W;
  const CITY_D = CONFIG.ROWS * STEP_Z + CONFIG.ROAD_W;
  const CENTER_X = CITY_W / 2;
  const CENTER_Z = CITY_D / 2;
  
  // Global variables
  let renderer, scene, camera, clock, raycaster, projector;
  let shopMeshes = [], signMeshes = [], animatedObjects = [];
  let avatar, avatarGroup, avatarAnimations = { walking: false, time: 0 };
  let keys = { w: false, s: false, a: false, d: false };
  let followMode = false;
  let isDragging = false;
  let camTarget = new THREE.Vector3(CENTER_X, 0, CENTER_Z);
  let camRadius = CONFIG.CAM_RADIUS;
  let camTheta = CONFIG.CAM_THETA;
  let camPhi = CONFIG.CAM_PHI;
  let hoveredMesh = null;
  let selectedShop = null;
  let particles = [];
  let minimapCtx;
  
  // Shops data (will be injected from React Native)
  let SHOPS = window.STORES_FROM_APP || [];
  
  // Initialize minimap
  function initMinimap() {
    const canvas = document.getElementById('minimap-canvas');
    if (canvas) {
      minimapCtx = canvas.getContext('2d');
      updateMinimap();
    }
  }
  
  function updateMinimap() {
    if (!minimapCtx) return;
    const canvas = document.getElementById('minimap-canvas');
    if (!canvas) return;
    
    minimapCtx.fillStyle = 'rgba(15, 15, 30, 0.9)';
    minimapCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    minimapCtx.strokeStyle = 'rgba(108, 99, 255, 0.3)';
    minimapCtx.lineWidth = 1;
    for (let i = 0; i <= CONFIG.COLS; i++) {
      const x = (i / CONFIG.COLS) * canvas.width;
      minimapCtx.beginPath();
      minimapCtx.moveTo(x, 0);
      minimapCtx.lineTo(x, canvas.height);
      minimapCtx.stroke();
    }
    for (let i = 0; i <= CONFIG.ROWS; i++) {
      const y = (i / CONFIG.ROWS) * canvas.height;
      minimapCtx.beginPath();
      minimapCtx.moveTo(0, y);
      minimapCtx.lineTo(canvas.width, y);
      minimapCtx.stroke();
    }
    
    // Draw shops
    shopMeshes.forEach((item, index) => {
      const shop = item.shop;
      if (shop && shop.coordinates) {
        const x = (shop.coordinates.x / CITY_W) * canvas.width;
        const z = (shop.coordinates.z / CITY_D) * canvas.height;
        minimapCtx.fillStyle = '#' + shop.color.toString(16).padStart(6, '0');
        minimapCtx.fillRect(x - 3, z - 3, 6, 6);
      }
    });
    
    // Draw avatar
    if (avatar) {
      const x = (avatar.x / CITY_W) * canvas.width;
      const z = (avatar.z / CITY_D) * canvas.height;
      minimapCtx.fillStyle = '#6c63ff';
      minimapCtx.beginPath();
      minimapCtx.arc(x, z, 5, 0, Math.PI * 2);
      minimapCtx.fill();
      minimapCtx.fillStyle = 'white';
      minimapCtx.beginPath();
      minimapCtx.arc(x, z, 2, 0, Math.PI * 2);
      minimapCtx.fill();
    }
  }
  
  // Initialize Three.js
  function init() {
    try {
      console.log('🎨 Creating 3D scene...');
      
      // Setup renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMapEnabled = true;
      renderer.shadowMapType = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x0a0a2a, 1);
      document.getElementById('canvas-container').appendChild(renderer.domElement);
      
      // Setup scene
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0a0a2a, 0.0008);
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
    updateCameraPosition();
    
    // Setup clock
    clock = new THREE.Clock();
    
    // Setup raycaster and projector
    raycaster = new THREE.Raycaster();
    projector = new THREE.Projector();
    
    // Create world
    createLights();
    createGround();
    createRoads();
    createStreetLights();
    createAvatar();
    createShopBuildings();
    createParticleSystem();
    
    // Bind events
    bindEvents();
    initMinimap();
    
    // Update loader progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      const bar = document.getElementById('loader-progress-bar');
      if (bar) bar.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          document.getElementById('loader').classList.add('hidden');
          document.getElementById('visible-count').textContent = SHOPS.length;
        }, 500);
      }
    }, 200);
    
    // Start animation
    animate();
    
    console.log('✅ City initialized successfully');
    } catch(e) {
      sendError(e, 'init');
    }
  }
  
  // Create particle system for ambiance
  function createParticleSystem() {
    const particleCount = 500;
    const particleGeometry = new THREE.Geometry();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Vector3(
        Math.random() * CITY_W,
        Math.random() * 100,
        Math.random() * CITY_D
      );
      particleGeometry.vertices.push(particle);
      particles.push({
        velocity: Math.random() * 0.5 + 0.2,
        angle: Math.random() * Math.PI * 2
      });
    }
    
    const particleMaterial = new THREE.PointCloudMaterial({
      color: 0x6c63ff,
      size: 0.5,
      transparent: true,
      opacity: 0.5
    });
    
    const particleSystem = new THREE.PointCloud(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    animatedObjects.push({ system: particleSystem, geometry: particleGeometry });
  }
  
  // Update particles animation
  function updateParticles(deltaTime) {
    animatedObjects.forEach(obj => {
      if (obj.geometry && obj.geometry.vertices) {
        obj.geometry.vertices.forEach((vertex, i) => {
          vertex.y += particles[i].velocity * deltaTime;
          if (vertex.y > 100) vertex.y = 0;
        });
        obj.geometry.verticesNeedUpdate = true;
      }
    });
  }
  
  // Camera control
  function updateCameraPosition() {
    const x = camTarget.x + camRadius * Math.sin(camPhi) * Math.cos(camTheta);
    const y = camRadius * Math.cos(camPhi);
    const z = camTarget.z + camRadius * Math.sin(camPhi) * Math.sin(camTheta);
    camera.position.set(x, Math.max(20, y), z);
    camera.lookAt(camTarget);
  }
  
  // Zoom controls
  window.zoomIn = () => {
    camRadius = Math.max(CONFIG.MIN_ZOOM, camRadius - 40);
    updateCameraPosition();
  };
  
  window.zoomOut = () => {
    camRadius = Math.min(CONFIG.MAX_ZOOM, camRadius + 40);
    updateCameraPosition();
  };
  
  // Follow mode
  window.moveCameraToAvatar = () => {
    if (avatar) {
      camTarget.x = avatar.x;
      camTarget.z = avatar.z;
      updateCameraPosition();
    }
  };
  
  // Create lighting system
  function createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);
    
    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
    sunLight.position.set(300, 500, 200);
    sunLight.castShadow = true;
    sunLight.receiveShadow = true;
    sunLight.shadowMapWidth = 2048;
    sunLight.shadowMapHeight = 2048;
    sunLight.shadowCameraLeft = -500;
    sunLight.shadowCameraRight = 500;
    sunLight.shadowCameraTop = 500;
    sunLight.shadowCameraBottom = -500;
    scene.add(sunLight);
    
    // Fill light from below
    const fillLight = new THREE.PointLight(0x4466cc, 0.3);
    fillLight.position.set(0, -50, 0);
    scene.add(fillLight);
    
    // Dynamic colored lights for ambiance
    const colorLight = new THREE.PointLight(0xff66cc, 0.2);
    colorLight.position.set(200, 100, 200);
    scene.add(colorLight);
    
    // Animated lights
    setInterval(() => {
      if (colorLight) {
        colorLight.intensity = 0.2 + Math.random() * 0.3;
      }
    }, 2000);
  }
  
  // Create ground with texture
  function createGround() {
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x2a5a2a, shininess: 20 });
    const groundGeo = new THREE.PlaneGeometry(CITY_W + 400, CITY_D + 400);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(CENTER_X, -1, CENTER_Z);
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add grass patches
    const grassMat = new THREE.MeshPhongMaterial({ color: 0x3a7a3a });
    for (let i = 0; i < 200; i++) {
      const grassGeo = new THREE.CubeGeometry(0.5, Math.random() * 0.5 + 0.2, 0.5);
      const grass = new THREE.Mesh(grassGeo, grassMat);
      grass.position.set(
        Math.random() * CITY_W,
        -0.8,
        Math.random() * CITY_D
      );
      grass.castShadow = true;
      scene.add(grass);
    }
  }
  
  // Create road network
  function createRoads() {
    const roadMat = new THREE.MeshPhongMaterial({ color: 0x2a2a2a, shininess: 30 });
    const lineMat = new THREE.MeshPhongMaterial({ color: 0xffdd88 });
    
    for (let row = 0; row <= CONFIG.ROWS; row++) {
      const z = row * STEP_Z;
      addRoadStrip(roadMat, lineMat, CENTER_X, z + CONFIG.ROAD_W/2, CITY_W, CONFIG.ROAD_W, false);
    }
    
    for (let col = 0; col <= CONFIG.COLS; col++) {
      const x = col * STEP_X;
      addRoadStrip(roadMat, lineMat, x + CONFIG.ROAD_W/2, CENTER_Z, CONFIG.ROAD_W, CITY_D, true);
    }
    
    // Add sidewalks
    const sidewalkMat = new THREE.MeshPhongMaterial({ color: 0xaa9988, shininess: 40 });
    for (let c = 0; c < CONFIG.COLS; c++) {
      for (let r = 0; r < CONFIG.ROWS; r++) {
        const bx = CONFIG.ROAD_W + c * STEP_X + CONFIG.BLOCK_W / 2;
        const bz = CONFIG.ROAD_W + r * STEP_Z + CONFIG.BLOCK_D / 2;
        const sidewalkGeo = new THREE.CubeGeometry(CONFIG.BLOCK_W, 0.4, CONFIG.BLOCK_D);
        const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
        sidewalk.position.set(bx, -0.3, bz);
        sidewalk.receiveShadow = true;
        scene.add(sidewalk);
      }
    }
  }
  
  function addRoadStrip(roadMat, lineMat, cx, cz, w, d, isVertical) {
    const roadGeo = new THREE.CubeGeometry(w, 0.3, d);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(cx, -0.2, cz);
    road.receiveShadow = true;
    scene.add(road);
    
    // Add lane markings
    const dashCount = Math.floor((isVertical ? d : w) / 15);
    for (let i = 0; i < dashCount; i++) {
      const dashGeo = new THREE.CubeGeometry(isVertical ? 0.3 : 4, 0.2, isVertical ? 4 : 0.3);
      const dash = new THREE.Mesh(dashGeo, lineMat);
      const offset = -((isVertical ? d : w) / 2) + 8 + i * 15;
      dash.position.set(isVertical ? cx : cx + offset, -0.1, isVertical ? cz + offset : cz);
      scene.add(dash);
    }
  }
  
  function createStreetLights() {
    const poleMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, specular: 0x555555, shininess: 30 });
    const lampMat = new THREE.MeshPhongMaterial({ color: 0xffdd99, emissive: 0xffaa66 });
    
    for (let col = 0; col <= CONFIG.COLS; col++) {
      for (let row = 0; row <= CONFIG.ROWS; row++) {
        const lx = col * STEP_X + CONFIG.ROAD_W / 2;
        const lz = row * STEP_Z + CONFIG.ROAD_W / 2;
        
        const poleGeo = new THREE.CylinderGeometry(0.8, 1.2, 20, 8);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(lx, 10, lz);
        pole.castShadow = true;
        scene.add(pole);
        
        const lampGeo = new THREE.SphereGeometry(1.5, 16, 16);
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.set(lx, 19, lz);
        lamp.castShadow = true;
        scene.add(lamp);
        
        // Add light glow effect
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa66, transparent: true, opacity: 0.3 });
        const glowGeo = new THREE.SphereGeometry(3, 16, 16);
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(lx, 19, lz);
        scene.add(glow);
        animatedObjects.push({ mesh: glow, originalScale: 1, time: 0 });
      }
    }
  }
  
  // Create avatar (3D character)
  function createAvatar() {
    avatarGroup = new THREE.Object3D();
    avatarGroup.position.set(CENTER_X, 0, CENTER_Z);
    scene.add(avatarGroup);
    
    // Body
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xff6600, shininess: 60 });
    const bodyGeo = new THREE.CylinderGeometry(1.8, 1.8, 8, 8);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 4;
    body.castShadow = true;
    avatarGroup.add(body);
    
    // Head
    const headMat = new THREE.MeshPhongMaterial({ color: 0xffccaa });
    const headGeo = new THREE.SphereGeometry(2, 32, 32);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 9;
    head.castShadow = true;
    avatarGroup.add(head);
    
    // Eyes
    const eyeMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const eyeGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.8, 9.5, 1.8);
    leftEye.castShadow = true;
    avatarGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.8, 9.5, 1.8);
    rightEye.castShadow = true;
    avatarGroup.add(rightEye);
    
    // Pupils
    const pupilMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const pupilGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.8, 9.5, 2.2);
    avatarGroup.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.8, 9.5, 2.2);
    avatarGroup.add(rightPupil);
    
    // Hat
    const hatMat = new THREE.MeshPhongMaterial({ color: 0x3399ff });
    const hatGeo = new THREE.CylinderGeometry(1.5, 2.2, 1.2, 8);
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 10.5;
    hat.castShadow = true;
    avatarGroup.add(hat);
    
    avatar = { x: CENTER_X, z: CENTER_Z, rotation: 0, group: avatarGroup, eyes: [leftEye, rightEye], pupils: [leftPupil, rightPupil] };
  }
  
  // Create shop buildings
  function createShopBuildings() {
    SHOPS.forEach((shop, index) => {
      const col = index % CONFIG.COLS;
      const row = Math.floor(index / CONFIG.COLS);
      const bx = CONFIG.ROAD_W + col * STEP_X + CONFIG.BLOCK_W / 2;
      const bz = CONFIG.ROAD_W + row * STEP_Z + CONFIG.BLOCK_D / 2;
      createShopBuilding(shop, bx, bz, col, row);
    });
  }
  
  function createShopBuilding(shop, x, z, col, row) {
    const group = new THREE.Object3D();
    group.position.set(x, 0, z);
    scene.add(group);
    
    const width = CONFIG.BLOCK_W * 0.7;
    const depth = CONFIG.BLOCK_D * 0.7;
    const height = shop.height;
    
    // Store coordinates for minimap
    shop.coordinates = { x, z, col, row };
    
    // Main building
    const bodyMat = new THREE.MeshPhongMaterial({ color: shop.color, shininess: 50 });
    const bodyGeo = new THREE.CubeGeometry(width, height, depth);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData = { shop: shop };
    group.add(body);
    
    shopMeshes.push({ mesh: body, shop: shop });
    
    // Roof
    const roofMat = new THREE.MeshPhongMaterial({ color: shop.accent, shininess: 70 });
    const roofGeo = new THREE.CubeGeometry(width + 2, 1.5, depth + 2);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height + 0.75;
    roof.castShadow = true;
    group.add(roof);
    
    // Sign
    const signTexture = createSignTexture(shop);
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture, transparent: true });
    const signGeo = new THREE.PlaneGeometry(width * 0.7, 6);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, height - 8, depth / 2 + 0.1);
    group.add(sign);
    
    // Windows (decoration)
    const windowMat = new THREE.MeshPhongMaterial({ color: 0x88aaff, emissive: 0x224466 });
    for (let i = 0; i < 3; i++) {
      const windowGeo = new THREE.CubeGeometry(4, 5, 0.2);
      const windowMesh = new THREE.Mesh(windowGeo, windowMat);
      windowMesh.position.set(-width/3 + i * width/3, height/2, depth/2 + 0.1);
      windowMesh.castShadow = true;
      group.add(windowMesh);
    }
    
    // Add floating particles around shop
    const particleCount = 20;
    const particleGroup = new THREE.Object3D();
    for (let i = 0; i < particleCount; i++) {
      const particleMat = new THREE.MeshPhongMaterial({ color: shop.accent, emissive: shop.color });
      const particleGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const particle = new THREE.Mesh(particleGeo, particleMat);
      particle.userData = {
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        yOffset: Math.random() * height
      };
      particleGroup.add(particle);
    }
    particleGroup.position.set(0, 0, 0);
    group.add(particleGroup);
    animatedObjects.push({ group: particleGroup, type: 'particles', shop: shop });
  }
  
  function createSignTexture(shop) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#' + shop.color.toString(16).padStart(6, '0'));
    grad.addColorStop(1, '#' + shop.accent.toString(16).padStart(6, '0'));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px "Segoe UI", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.fillText(shop.name, canvas.width/2, canvas.height/2);
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
  
  // Update avatar movement
  function updateAvatar(deltaTime) {
    if (!avatar) return;
    
    let moveX = 0, moveZ = 0;
    let isMoving = false;
    
    if (keys.w) { moveZ -= 1; isMoving = true; }
    if (keys.s) { moveZ += 1; isMoving = true; }
    if (keys.a) { moveX -= 1; isMoving = true; }
    if (keys.d) { moveX += 1; isMoving = true; }
    
    // Update walking animation
    if (avatarAnimations.walking !== isMoving) {
      avatarAnimations.walking = isMoving;
    }
    
    if (isMoving) {
      avatarAnimations.time += deltaTime * 10;
      const legSwing = Math.sin(avatarAnimations.time) * 0.3;
      if (avatar.group.children[0]) {
        avatar.group.children[0].rotation.z = legSwing * 0.5;
      }
    } else {
      if (avatar.group.children[0]) {
        avatar.group.children[0].rotation.z = 0;
      }
    }
    
    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;
      
      const newX = avatar.x + moveX * CONFIG.AVATAR_SPEED * deltaTime;
      const newZ = avatar.z + moveZ * CONFIG.AVATAR_SPEED * deltaTime;
      
      const boundary = CONFIG.ROAD_W / 2 + 10;
      avatar.x = Math.max(boundary, Math.min(CITY_W - boundary, newX));
      avatar.z = Math.max(boundary, Math.min(CITY_D - boundary, newZ));
      avatar.rotation = Math.atan2(moveX, moveZ);
    }
    
    avatar.group.position.set(avatar.x, 0, avatar.z);
    avatar.group.rotation.y = avatar.rotation;
    
    // Animate eyes (look around)
    if (avatar.eyes) {
      const lookAngle = Math.sin(Date.now() * 0.001) * 0.2;
      avatar.eyes.forEach(eye => {
        if (eye) eye.rotation.y = lookAngle;
      });
    }
    
    if (followMode && !isDragging) {
      camTarget.x = avatar.x;
      camTarget.z = avatar.z;
      updateCameraPosition();
    }
    
    updateMinimap();
  }
  
  // Update animated objects (particles, floating elements)
  function updateAnimations(deltaTime) {
    animatedObjects.forEach(obj => {
      if (obj.type === 'particles' && obj.group) {
        obj.group.children.forEach((particle, i) => {
          if (particle.userData) {
            particle.userData.angle += particle.userData.speed * deltaTime;
            const x = Math.cos(particle.userData.angle) * particle.userData.radius;
            const z = Math.sin(particle.userData.angle) * particle.userData.radius;
            particle.position.set(x, particle.userData.yOffset + Math.sin(Date.now() * 0.002) * 0.5, z);
          }
        });
      } else if (obj.mesh && obj.originalScale) {
        obj.time += deltaTime;
        const scale = obj.originalScale + Math.sin(obj.time * 3) * 0.1;
        obj.mesh.scale.set(scale, scale, scale);
      }
    });
  }
  
  // Event bindings
  function bindEvents() {
    const canvas = renderer.domElement;
    
    // Mouse wheel zoom
    canvas.addEventListener('wheel', (e) => {
      camRadius = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, camRadius + e.deltaY * 0.5));
      updateCameraPosition();
      e.preventDefault();
    });
    
    // Mouse move for hover
    canvas.addEventListener('mousemove', handleHover);
    
    // Click for selection
    canvas.addEventListener('click', handleClick);
    
    // Keyboard
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) keys[key] = true;
      if (key === 'f') {
        followMode = !followMode;
        document.getElementById('follow-btn').classList.toggle('active', followMode);
        if (followMode) window.moveCameraToAvatar();
      }
    });
    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key in keys) keys[key] = false;
    });
    
    // Joystick
    setupJoystick();
    
    // Touch screen camera controls
    setupCameraTouchControls();
    
    // UI buttons
    document.getElementById('follow-btn').onclick = () => {
      followMode = !followMode;
      document.getElementById('follow-btn').classList.toggle('active', followMode);
      if (followMode) window.moveCameraToAvatar();
    };
    
    document.getElementById('zoom-in').onclick = () => window.zoomIn();
    document.getElementById('zoom-out').onclick = () => window.zoomOut();
    
    document.getElementById('shop-panel-close').onclick = () => {
      document.getElementById('shop-panel').classList.remove('visible');
      selectedShop = null;
    };
    
    document.getElementById('shop-visit-btn').onclick = () => {
      if (selectedShop && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'shop_selected',
          shop: selectedShop
        }));
        document.getElementById('shop-panel').classList.remove('visible');
      }
    };
  }
  
  function setupJoystick() {
    const joystickBase = document.getElementById('joystick-base');
    const joystickKnob = document.getElementById('joystick-knob');
    let active = false;
    let startX, startY;
    const maxDist = 40;
    
    const handleStart = (e) => {
      e.preventDefault();
      active = true;
      const touch = e.touches ? e.touches[0] : e;
      const rect = joystickBase.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    };
    
    const handleMove = (e) => {
      if (!active) return;
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      let dx = touch.clientX - startX;
      let dy = touch.clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) {
        dx = dx / dist * maxDist;
        dy = dy / dist * maxDist;
      }
      joystickKnob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
      keys.w = dy < -10;
      keys.s = dy > 10;
      keys.a = dx < -10;
      keys.d = dx > 10;
    };
    
    const handleEnd = () => {
      active = false;
      joystickKnob.style.transform = 'translate(-50%, -50%)';
      keys.w = keys.s = keys.a = keys.d = false;
    };
    
    joystickBase.addEventListener('touchstart', handleStart, { passive: false });
    joystickBase.addEventListener('touchmove', handleMove, { passive: false });
    joystickBase.addEventListener('touchend', handleEnd);
    joystickBase.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
  }
  
  function setupCameraTouchControls() {
    const canvas = renderer.domElement;
    let previousTouch = null;
    let initialPinchDist = null;
    let initialZoom = null;
    
    const handleTouchStart = (e) => {
      // Ignore if touching UI elements
      if (e.target.closest('#joystick-container') || e.target.closest('#shop-panel') || e.target.closest('#top-bar') || e.target.closest('#zoom-controls')) return;
      
      const touchCount = e.touches.length;
      if (touchCount === 1) {
        isDragging = true;
        previousTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (touchCount === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.sqrt(dx * dx + dy * dy);
        initialZoom = camRadius;
      }
    };
    
    const handleTouchMove = (e) => {
      const touchCount = e.touches.length;
      
      if (touchCount === 2 && initialPinchDist) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const zoomFactor = initialPinchDist / dist;
        camRadius = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, initialZoom * zoomFactor));
        updateCameraPosition();
        e.preventDefault();
        return;
      }
      
      if (!isDragging || !previousTouch || touchCount !== 1) return;
      
      const currentTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const deltaX = currentTouch.x - previousTouch.x;
      const deltaY = currentTouch.y - previousTouch.y;
      
      camTheta -= deltaX * 0.01;
      camPhi -= deltaY * 0.01;
      // Clamp phi to prevent flipping
      camPhi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, camPhi));
      
      updateCameraPosition();
      previousTouch = currentTouch;
      e.preventDefault();
    };
    
    const handleTouchEnd = (e) => {
      if (e.touches.length < 2) initialPinchDist = null;
      if (e.touches.length === 0) {
        isDragging = false;
        previousTouch = null;
      }
    };
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
  }
  
  function handleHover(e) {
    try {
      const mouse = new THREE.Vector2();
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      projector.unprojectVector(vector, camera);
      raycaster.set(camera.position, vector.sub(camera.position).normalize());
      
      const intersects = raycaster.intersectObjects(shopMeshes.map(s => s.mesh));
      
      const tooltip = document.getElementById('hover-tooltip');
      if (hoveredMesh) {
        hoveredMesh.material.emissive.setHex(0x000000);
        hoveredMesh = null;
        tooltip.classList.remove('visible');
      }
      
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.shop) {
          hoveredMesh = hit;
          hit.material.emissive.setHex(0x333333);
          const shop = hit.userData.shop;
          tooltip.textContent = shop.icon + ' ' + shop.name + ' • ' + shop.type + ' • ⭐' + shop.rating;
          tooltip.style.left = (e.clientX + 15) + 'px';
          tooltip.style.top = (e.clientY - 15) + 'px';
          tooltip.classList.add('visible');
        }
      }
    } catch(err) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: 'Hover Error: ' + err.message }));
    }
  }
  
  function handleClick(e) {
    try {
      const mouse = new THREE.Vector2();
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      projector.unprojectVector(vector, camera);
      raycaster.set(camera.position, vector.sub(camera.position).normalize());
      
      const intersects = raycaster.intersectObjects(shopMeshes.map(s => s.mesh));
      
      if (intersects.length > 0) {
        const shop = intersects[0].object.userData.shop;
        if (shop) showShopPanel(shop);
      }
    } catch(err) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: 'Click Error: ' + err.message }));
    }
  }
  
  function showShopPanel(shop) {
    selectedShop = shop;
    const panel = document.getElementById('shop-panel');
    
    document.getElementById('shop-icon-badge').textContent = shop.icon;
    document.getElementById('shop-icon-badge').style.background = 'linear-gradient(135deg, #' + shop.color.toString(16).padStart(6, '0') + ', #' + shop.accent.toString(16).padStart(6, '0') + ')';
    document.getElementById('shop-panel-name').textContent = shop.name;
    document.getElementById('shop-panel-type').textContent = shop.type;
    
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < Math.floor(shop.rating) ? '★' : (i < shop.rating ? '½' : '☆');
    }
    document.getElementById('shop-panel-rating').innerHTML = stars + ' ' + shop.rating;
    document.getElementById('shop-panel-price').textContent = shop.price;
    document.getElementById('shop-panel-desc').textContent = shop.description;
    
    const tagsHtml = '<span class="shop-tag">' + shop.category + '</span><span class="shop-tag">' + shop.type + '</span>';
    document.getElementById('shop-panel-tags').innerHTML = tagsHtml;
    
    panel.classList.add('visible');
  }
  
  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.033);
    updateAvatar(delta);
    updateParticles(delta);
    updateAnimations(delta);
    renderer.render(scene, camera);
  }
  
  // Refresh shops data function
  window.refreshCityShops = (newShops) => {
    if (newShops && newShops.length) {
      SHOPS = newShops;
      // Clear existing shop meshes
      shopMeshes.forEach(item => {
        if (item.mesh.parent) scene.remove(item.mesh.parent);
      });
      shopMeshes = [];
      // Recreate shops
      createShopBuildings();
      document.getElementById('visible-count').textContent = SHOPS.length;
      updateMinimap();
    }
  };
  
  // Start the application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;