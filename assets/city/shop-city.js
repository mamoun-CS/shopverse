/* ================================================================
   ShopVerse 3D City  —  Main Script
   Uses Three.js r68 (bundled in boilerplate_lib)
   ================================================================ */
'use strict';

(function () {

  /* ── 1. SHOP DATA ─────────────────────────────────────────── */
  var SHOPS = window.STORES_FROM_APP || [
    { id:0,  name:'TechZone',    type:'Electronics',  cat:'Electronics',   color:0x1565C0, accent:0x42A5F5, h:65, icon:'⚡', rating:4.5, price:'$$',   desc:'Latest gadgets & cutting-edge electronics for every need.' },
    { id:1,  name:'Style & Co',  type:'Fashion',      cat:'Fashion',       color:0xAD1457, accent:0xF48FB1, h:45, icon:'👗', rating:4.2, price:'$$$',  desc:'Premium fashion and haute couture for the modern trendsetter.' },
    { id:2,  name:'Bean & Brew', type:'Café',         cat:'Food',          color:0x4E342E, accent:0xA1887F, h:35, icon:'☕', rating:4.8, price:'$',    desc:'Artisan coffee, specialty brews and freshly-baked pastries.' },
    { id:3,  name:'FreshMart',   type:'Grocery',      cat:'Food',          color:0x2E7D32, accent:0x81C784, h:40, icon:'🥬', rating:4.3, price:'$',    desc:'Farm-fresh produce, organic foods and daily essentials.' },
    { id:4,  name:'PageTurner',  type:'Bookstore',    cat:'Entertainment', color:0xBF360C, accent:0xFF8A50, h:38, icon:'📚', rating:4.6, price:'$',    desc:'Thousands of titles: fiction, science, art and more.' },
    { id:5,  name:'HealthPlus',  type:'Pharmacy',     cat:'Lifestyle',     color:0x00695C, accent:0x80CBC4, h:35, icon:'💊', rating:4.1, price:'$$',   desc:'Pharmaceutical products, vitamins and wellness advice.' },
    { id:6,  name:'La Piazza',   type:'Restaurant',   cat:'Food',          color:0xB71C1C, accent:0xEF9A9A, h:42, icon:'🍕', rating:4.7, price:'$$',   desc:'Authentic Italian cuisine, handmade pasta and fine wines.' },
    { id:7,  name:'Luxe Gems',   type:'Jewelry',      cat:'Lifestyle',     color:0xF57F17, accent:0xFFD54F, h:30, icon:'💎', rating:4.9, price:'$$$$', desc:'Fine jewelry, certified diamonds and luxury Swiss watches.' },
    { id:8,  name:'SportZone',   type:'Sports',       cat:'Lifestyle',     color:0x1A237E, accent:0x9FA8DA, h:55, icon:'⚽', rating:4.4, price:'$$',   desc:'Premium sports gear, performance apparel and footwear.' },
    { id:9,  name:'HomeStyle',   type:'Home & Decor', cat:'Lifestyle',     color:0x37474F, accent:0x90A4AE, h:48, icon:'🛋', rating:4.3, price:'$$',   desc:'Modern furniture, lighting and interior design pieces.' },
    { id:10, name:'Toy World',   type:'Toys',         cat:'Entertainment', color:0xE65100, accent:0xFFD740, h:36, icon:'🧸', rating:4.5, price:'$$',   desc:'Educational toys and games for children of all ages.' },
    { id:11, name:'Beauty Bar',  type:'Beauty',       cat:'Fashion',       color:0x880E4F, accent:0xF8BBD9, h:33, icon:'💄', rating:4.6, price:'$$',   desc:'Premium beauty, professional skincare and luxury cosmetics.' },
    { id:12, name:'AutoShop',    type:'Automotive',   cat:'Lifestyle',     color:0x263238, accent:0x78909C, h:50, icon:'🚗', rating:4.0, price:'$$',   desc:'Auto parts, accessories and expert customization services.' },
    { id:13, name:'MusicBox',    type:'Music',        cat:'Entertainment', color:0x4527A0, accent:0xB39DDB, h:43, icon:'🎵', rating:4.7, price:'$$',   desc:'Instruments, high-fidelity audio and music lessons.' },
    { id:14, name:'PetCorner',   type:'Pet Store',    cat:'Lifestyle',     color:0x558B2F, accent:0xAED581, h:37, icon:'🐾', rating:4.8, price:'$',    desc:'Everything your furry, feathered or scaled friend needs.' },
    { id:15, name:'ArtHouse',    type:'Art Gallery',  cat:'Entertainment', color:0x6A1B9A, accent:0xCE93D8, h:60, icon:'🎨', rating:4.5, price:'$$$',  desc:'Curated local and contemporary fine art — prints & originals.' },
    { id:16, name:'TestShop1',  type:'Test',          cat:'Lifestyle',     color:0xFF5722, accent:0xFFAB91, h:40, icon:'🛒', rating:4.0, price:'$',    desc:'Test shop 1 for city 3d.' },
    { id:17, name:'TestShop2',  type:'Test',          cat:'Lifestyle',     color:0x00BCD4, accent:0x80DEEA, h:45, icon:'🛒', rating:4.1, price:'$$',  desc:'Test shop 2 for city 3d.' },
    { id:18, name:'TestShop3',  type:'Test',          cat:'Entertainment', color:0x9C27B0, accent:0xCE93D8, h:35, icon:'🛒', rating:4.2, price:'$',    desc:'Test shop 3 for city 3d.' },
    { id:19, name:'TestShop4',  type:'Test',          cat:'Fashion',       color:0xE91E63, accent:0xF48FB1, h:38, icon:'🛒', rating:4.3, price:'$$',  desc:'Test shop 4 for city 3d.' }
  ];

  /* ── 2. CITY LAYOUT CONSTANTS ─────────────────────────────── */
  var BLOCK_W  = 60;            // shop plot width (Three.js units)
  var BLOCK_D  = 60;            // shop plot depth
  var ROAD_W   = 28;            // road lane width
  var COLS     = 4;
  var ROWS     = 4;
  var STEP_X   = BLOCK_W + ROAD_W;   // 88
  var STEP_Z   = BLOCK_D + ROAD_W;   // 88
  var CITY_W   = COLS * STEP_X + ROAD_W;  // total city width
  var CITY_D   = ROWS * STEP_Z + ROAD_W;
  var CENTER_X = CITY_W / 2;
  var CENTER_Z = CITY_D / 2;

  /* ── 3. SCENE STATE ───────────────────────────────────────── */
  var renderer, scene, camera, clock;
  var raycaster, mouse;
  var shopMeshes = [];       // [{mesh, shop}]
  var signMeshes = [];       // [{mesh, shop}]
  var hoveredMesh  = null;
  var selectedShop = null;
  var activeFilter = 'all';

  /* ── 3.1 AVATAR STATE ─────────────────────────────────────── */
  var avatar, avatarGroup;
  var avatarSpeed = 2.5;
  var keys = { w: false, a: false, s: false, d: false };
  var followMode = false;

  /* ── 4. CAMERA ORBIT STATE ────────────────────────────────── */
  var isPointerDown = false;
  var pointerStart  = { x: 0, y: 0 };
  var camTheta  = -Math.PI / 4;
  var camPhi    = Math.PI / 3.8;
  var camRadius = 420;
  var camTarget;   // THREE.Vector3 — set after THREE loads

/* ── 5. INIT ──────────────────────────────────────────────── */
  function init() {
    console.log('ShopCity: init() called');
    try {
    camTarget = new THREE.Vector3(CENTER_X, 0, CENTER_Z);
    mouse     = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    clock     = new THREE.Clock();

    console.log('ShopCity: Creating renderer...');
    /* Renderer */
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled  = true;
    renderer.shadowMapType     = THREE.PCFSoftShadowMap;
    renderer.setClearColorHex(0x87CEEB, 1);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    console.log('ShopCity: Renderer created');

    /* Scene */
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 400, 1100);

    /* Camera */
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
    updateCameraPosition();

    /* Build the world */
    createLights();
    createGround();
    createRoads();
    createStreetLights();
    createAvatar();
    createShopBuildings();
    createSkyGradient();

    /* UI */
    buildLegend();
    createAvatarControlsHint();
    bindEvents();

    /* Hide loader */
    var loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(function () { loader.style.display = 'none'; }, 700);

    console.log('ShopCity: Init complete, starting animation');
    animate();
    } catch (err) {
      console.error('ShopCity: Init error:', err);
    }
  }

  /* ── 6. CAMERA HELPERS ────────────────────────────────────── */
  function updateCameraPosition() {
    var x = camTarget.x + camRadius * Math.sin(camPhi) * Math.cos(camTheta);
    var y = camRadius * Math.cos(camPhi);
    var z = camTarget.z + camRadius * Math.sin(camPhi) * Math.sin(camTheta);
    camera.position.set(x, Math.max(20, y), z);
    camera.lookAt(camTarget);
  }

  /* ── 7. LIGHTS ────────────────────────────────────────────── */
  function createLights() {
    scene.add(new THREE.AmbientLight(0xffeedd, 0.55));

    var sun = new THREE.DirectionalLight(0xfff4e0, 1.1);
    sun.position.set(300, 500, 200);
    sun.castShadow = true;
    sun.shadowMapWidth  = 2048;
    sun.shadowMapHeight = 2048;
    sun.shadowCameraNear = 50;
    sun.shadowCameraFar  = 2000;
    sun.shadowCameraLeft  = -500;
    sun.shadowCameraRight =  500;
    sun.shadowCameraTop   =  500;
    sun.shadowCameraBottom = -500;
    sun.shadowBias = -0.001;
    scene.add(sun);

    var fill = new THREE.DirectionalLight(0xaaccff, 0.35);
    fill.position.set(-200, 200, -300);
    scene.add(fill);
  }

  /* ── 8. GROUND PLANE ─────────────────────────────────────── */
  function createGround() {
    var geo  = new THREE.PlaneGeometry(CITY_W + 200, CITY_D + 200);
    var mat  = new THREE.MeshPhongMaterial({ color: 0x4a7c45, shininess: 2 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(CENTER_X, -0.5, CENTER_Z);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  /* ── 9. ROADS ─────────────────────────────────────────────── */
  function createRoads() {
    var roadMat = new THREE.MeshPhongMaterial({ color: 0x2d2d2d, shininess: 8 });
    var lineMat = new THREE.MeshPhongMaterial({ color: 0xf0c040, shininess: 0 });

    /* horizontal road strips (along X axis) */
    for (var row = 0; row <= ROWS; row++) {
      var gz = row * STEP_Z;
      addRoadStrip(roadMat, lineMat, CENTER_X, gz + ROAD_W / 2, CITY_W, ROAD_W, false);
    }
    /* vertical road strips (along Z axis) */
    for (var col = 0; col <= COLS; col++) {
      var gx = col * STEP_X;
      addRoadStrip(roadMat, lineMat, gx + ROAD_W / 2, CENTER_Z, ROAD_W, CITY_D, true);
    }

    /* Pavement / sidewalk squares at each block */
    var sidewalkMat = new THREE.MeshPhongMaterial({ color: 0xc8b89a, shininess: 4 });
    for (var c = 0; c < COLS; c++) {
      for (var r = 0; r < ROWS; r++) {
        var bx = ROAD_W + c * STEP_X + BLOCK_W / 2;
        var bz = ROAD_W + r * STEP_Z + BLOCK_D / 2;
        var swGeo  = new THREE.CubeGeometry(BLOCK_W, 0.6, BLOCK_D);
        var swMesh = new THREE.Mesh(swGeo, sidewalkMat);
        swMesh.position.set(bx, 0.3, bz);
        swMesh.receiveShadow = true;
        scene.add(swMesh);
      }
    }
  }

  function addRoadStrip(roadMat, lineMat, cx, cz, w, d, isVertical) {
    /* road slab */
    var geo  = new THREE.CubeGeometry(w, 0.5, d);
    var mesh = new THREE.Mesh(geo, roadMat);
    mesh.position.set(cx, 0, cz);
    mesh.receiveShadow = true;
    scene.add(mesh);

    /* center dashed line */
    var dashCount = Math.floor((isVertical ? d : w) / 12);
    for (var i = 0; i < dashCount; i++) {
      var dashGeo  = new THREE.CubeGeometry(isVertical ? 0.4 : 6, 0.6, isVertical ? 6 : 0.4);
      var dashMesh = new THREE.Mesh(dashGeo, lineMat);
      var offset   = -((isVertical ? d : w) / 2) + 6 + i * 12;
      dashMesh.position.set(
        isVertical ? cx : cx + offset,
        0.3,
        isVertical ? cz + offset : cz
      );
      scene.add(dashMesh);
    }
  }

  /* ── 10. AVATAR ─────────────────────────────────────────────── */
  function createAvatar() {
    var avatarGroup = new THREE.Object3D();
    avatarGroup.position.set(CENTER_X, 0, CENTER_Z);
    scene.add(avatarGroup);
    avatar = { x: CENTER_X, z: CENTER_Z, rotation: 0, group: avatarGroup };

    var bodyMat = new THREE.MeshPhongMaterial({ color: 0x3F51B5, shininess: 30 });
    var skinMat = new THREE.MeshPhongMaterial({ color: 0xFFCC80 });

    var bodyGeo = new THREE.CylinderGeometry(1.5, 1.5, 8, 8);
    var bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 4;
    bodyMesh.castShadow = true;
    avatarGroup.add(bodyMesh);

    var headGeo = new THREE.SphereGeometry(1.8, 8, 8);
    var headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 9;
    headMesh.castShadow = true;
    avatarGroup.add(headMesh);

    var hatGeo = new THREE.CylinderGeometry(1.2, 1.8, 1, 8);
    var hatMat = new THREE.MeshPhongMaterial({ color: 0xE91E63 });
    var hatMesh = new THREE.Mesh(hatGeo, hatMat);
    hatMesh.position.y = 10.2;
    avatarGroup.add(hatMesh);

    var legGeo = new THREE.CylinderGeometry(0.5, 0.5, 4, 6);
    var legMat = new THREE.MeshPhongMaterial({ color: 0x212121 });
    var legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.6, 2, 0);
    avatarGroup.add(legL);
    var legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.6, 2, 0);
    avatarGroup.add(legR);

    var armGeo = new THREE.CylinderGeometry(0.4, 0.4, 3, 6);
    var armMat = new THREE.MeshPhongMaterial({ color: 0x3F51B5 });
    var armL = new THREE.Mesh(armGeo, armMat);
    armL.position.set(-2.2, 4.5, 0);
    avatarGroup.add(armL);
    var armR = new THREE.Mesh(armGeo, armMat);
    armR.position.set(2.2, 4.5, 0);
    avatarGroup.add(armR);
  }

  function updateAvatar(dt) {
    if (!avatar) return;

    var moveX = 0;
    var moveZ = 0;

    if (keys.w) moveZ -= 1;
    if (keys.s) moveZ += 1;
    if (keys.a) moveX -= 1;
    if (keys.d) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
      var len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= len;
      moveZ /= len;

      var newX = avatar.x + moveX * avatarSpeed * dt;
      var newZ = avatar.z + moveZ * avatarSpeed * dt;

      var halfRoad = ROAD_W / 2;
      var minX = halfRoad + 5;
      var maxX = CITY_W - halfRoad - 5;
      var minZ = halfRoad + 5;
      var maxZ = CITY_D - halfRoad - 5;

      avatar.x = Math.max(minX, Math.min(maxX, newX));
      avatar.z = Math.max(minZ, Math.min(maxZ, newZ));

      avatar.rotation = Math.atan2(moveX, moveZ);
    }

    avatar.group.position.set(avatar.x, 0, avatar.z);
    avatar.group.rotation.y = avatar.rotation;

    if (followMode) {
      camTarget.x = avatar.x;
      camTarget.z = avatar.z;
      camTheta = avatar.rotation + Math.PI;
      updateCameraPosition();
    }
  }

  /* ── 10. SHOP BUILDINGS ───────────────────────────────────── */
  function createShopBuildings() {
    for (var i = 0; i < SHOPS.length; i++) {
      var shop = SHOPS[i];
      var col  = i % COLS;
      var row  = Math.floor(i / COLS);
      var bx   = ROAD_W + col * STEP_X + BLOCK_W / 2;
      var bz   = ROAD_W + row * STEP_Z + BLOCK_D / 2;
      createShop(shop, bx, bz);
    }
  }

  function createShop(shop, cx, cz) {
    var group = new THREE.Object3D();
    group.position.set(cx, 0, cz);
    scene.add(group);

    var bw = BLOCK_W * 0.75;
    var bd = BLOCK_D * 0.75;
    var bh = shop.h;

    /* ── Main body ── */
    var bodyMat = new THREE.MeshPhongMaterial({
      color: shop.color, specular: 0x444444, shininess: 30
    });
    var bodyGeo  = new THREE.CubeGeometry(bw, bh, bd);
    var bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = bh / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh._shop = shop;
    group.add(bodyMesh);
    shopMeshes.push({ mesh: bodyMesh, shop: shop });

    /* ── Accent top cap ── */
    var capMat  = new THREE.MeshPhongMaterial({ color: shop.accent, shininess: 60 });
    var capGeo  = new THREE.CubeGeometry(bw, 2.5, bd);
    var capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.y = bh + 1.25;
    capMesh.castShadow = true;
    group.add(capMesh);

    /* ── Glass window strips (front & back) ── */
    var winMat  = new THREE.MeshPhongMaterial({
      color: shop.accent, transparent: true, opacity: 0.55,
      specular: 0xffffff, shininess: 120
    });
    var floors  = Math.max(1, Math.floor(bh / 10));
    for (var f = 0; f < floors; f++) {
      var wy = 5 + f * 10;
      [-1, 1].forEach(function (side) {
        var wGeo  = new THREE.CubeGeometry(bw * 0.7, 4.5, 0.5);
        var wMesh = new THREE.Mesh(wGeo, winMat);
        wMesh.position.set(0, wy, side * (bd / 2 + 0.1));
        group.add(wMesh);
      });
    }

    /* ── Entrance canopy ── */
    var canopyMat  = new THREE.MeshPhongMaterial({ color: shop.accent, side: THREE.DoubleSide });
    var canopyGeo  = new THREE.CubeGeometry(bw * 0.55, 0.6, 6);
    var canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.set(0, 5, bd / 2 + 3);
    canopyMesh.castShadow = true;
    group.add(canopyMesh);

    /* ── Shop sign (canvas texture) ── */
    var signTex  = makeSignTexture(shop);
    var signMat  = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });
    var signGeo  = new THREE.PlaneGeometry(bw * 0.8, 8);
    var signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, bh - 10, bd / 2 + 0.6);
    group.add(signMesh);
    signMeshes.push({ mesh: signMesh, shop: shop });
  }

  /* Canvas texture for shop sign */
  function makeSignTexture(shop) {
    var W = 512, H = 128;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');

    /* gradient background */
    var hex = '#' + ('000000' + shop.color.toString(16)).slice(-6);
    var aHex = '#' + ('000000' + shop.accent.toString(16)).slice(-6);
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, hex);
    grad.addColorStop(1, aHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    /* overlay text */
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = 'bold 52px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(shop.name, W / 2, H * 0.45);

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText(shop.type, W / 2, H * 0.78);

    var tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  /* ── 11. STREET LIGHTS ────────────────────────────────────── */
  function createStreetLights() {
    var poleMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    var glowMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });

    for (var col = 0; col <= COLS; col++) {
      for (var row = 0; row <= ROWS; row++) {
        var lx = col * STEP_X + ROAD_W / 2;
        var lz = row * STEP_Z + ROAD_W / 2;
        createLamp(lx, lz, poleMat, glowMat);
      }
    }
  }

  function createLamp(lx, lz, poleMat, glowMat) {
    /* pole */
    var poleGeo  = new THREE.CubeGeometry(0.8, 18, 0.8);
    var poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.set(lx, 9, lz);
    poleMesh.castShadow = true;
    scene.add(poleMesh);

    /* arm */
    var armGeo  = new THREE.CubeGeometry(5, 0.5, 0.5);
    var armMesh = new THREE.Mesh(armGeo, poleMat);
    armMesh.position.set(lx + 2.5, 18, lz);
    scene.add(armMesh);

    /* bulb */
    var bulbGeo  = new THREE.SphereGeometry(1.2, 8, 8);
    var bulbMesh = new THREE.Mesh(bulbGeo, glowMat);
    bulbMesh.position.set(lx + 5, 17, lz);
    scene.add(bulbMesh);
  }

  /* ── 12. SKY GRADIENT (horizon mesh) ─────────────────────── */
  function createSkyGradient() {
    var skyGeo  = new THREE.CubeGeometry(3000, 1200, 3000);
    var skyMat  = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide });
    var skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.position.set(CENTER_X, 200, CENTER_Z);
    scene.add(skyMesh);
  }

  /* ── 13. EVENTS ──────────────────────────────────────────── */
  function bindEvents() {
    var canvas = renderer.domElement;

    /* Orbit — mouse drag */
    canvas.addEventListener('mousedown', function (e) {
      isPointerDown = true;
      pointerStart  = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup',   function () { isPointerDown = false; });
    window.addEventListener('mousemove', function (e) {
      updateMouse(e);
      if (isPointerDown) {
        var dx = e.clientX - pointerStart.x;
        var dy = e.clientY - pointerStart.y;
        camTheta += dx * 0.005;
        camPhi   = Math.max(0.15, Math.min(Math.PI / 2.1, camPhi - dy * 0.005));
        pointerStart = { x: e.clientX, y: e.clientY };
        updateCameraPosition();
      } else {
        doHoverTest(e);
      }
    });

    /* Zoom — scroll wheel */
    canvas.addEventListener('wheel', function (e) {
      camRadius = Math.max(60, Math.min(900, camRadius + e.deltaY * 0.5));
      updateCameraPosition();
      e.preventDefault();
    }, { passive: false });

    /* Click — open shop panel */
    canvas.addEventListener('click', function (e) {
      var hit = pickShop(e);
      if (hit) {
        showShopPanel(hit.shop);
      }
    });

    /* Touch orbit */
    var lastTouch = null;
    canvas.addEventListener('touchstart', function (e) {
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    canvas.addEventListener('touchmove', function (e) {
      if (!lastTouch) { return; }
      var dx = e.touches[0].clientX - lastTouch.x;
      var dy = e.touches[0].clientY - lastTouch.y;
      camTheta += dx * 0.006;
      camPhi   = Math.max(0.15, Math.min(Math.PI / 2.1, camPhi - dy * 0.006));
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      updateCameraPosition();
      e.preventDefault();
    }, { passive: false });

    /* Window resize */
    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* Keyboard controls for walking */
    window.addEventListener('keydown', function (e) {
      var key = e.key.toLowerCase();
      if (key in keys) { keys[key] = true; e.preventDefault(); }
      if (key === 'f') { followMode = !followMode; }
    });
    window.addEventListener('keyup', function (e) {
      var key = e.key.toLowerCase();
      if (key in keys) { keys[key] = false; }
    });

    /* Filter buttons */
    var filterBtns = document.querySelectorAll('.filter-btn');
    for (var i = 0; i < filterBtns.length; i++) {
      filterBtns[i].addEventListener('click', (function (btn) {
        return function () {
          for (var j = 0; j < filterBtns.length; j++) {
            filterBtns[j].classList.remove('active');
          }
          btn.classList.add('active');
          activeFilter = btn.getAttribute('data-filter');
          applyFilter(activeFilter);
        };
      }(filterBtns[i])));
    }

    /* Close shop panel */
    document.getElementById('shop-panel-close').addEventListener('click', function () {
      document.getElementById('shop-panel').classList.add('hidden');
      selectedShop = null;
    });

    /* Visit shop button */
    document.getElementById('shop-visit-btn').addEventListener('click', function () {
      if (selectedShop) {
        alert('Welcome to ' + selectedShop.name + '! 🛒\n\n' + selectedShop.desc);
      }
    });
  }

  function updateMouse(e) {
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  /* ── 14. RAYCASTING ───────────────────────────────────────── */
  function pickShop(e) {
    updateMouse(e);
    raycaster.setFromCamera(mouse, camera);
    var targets = shopMeshes.map(function (s) { return s.mesh; });
    var hits    = raycaster.intersectObjects(targets);
    if (hits.length > 0) {
      var mesh = hits[0].object;
      for (var i = 0; i < shopMeshes.length; i++) {
        if (shopMeshes[i].mesh === mesh) { return shopMeshes[i]; }
      }
    }
    return null;
  }

  var tooltipEl = document.getElementById('hover-tooltip');
  function doHoverTest(e) {
    updateMouse(e);
    raycaster.setFromCamera(mouse, camera);
    var targets = shopMeshes.map(function (s) { return s.mesh; });
    var hits    = raycaster.intersectObjects(targets);

    /* Reset previous hover */
    if (hoveredMesh) {
      hoveredMesh.material.emissive.setHex(0x000000);
      hoveredMesh = null;
      tooltipEl.classList.add('hidden');
      document.body.style.cursor = 'default';
    }

    if (hits.length > 0) {
      var mesh = hits[0].object;
      if (mesh._shop) {
        hoveredMesh = mesh;
        mesh.material.emissive.setHex(0x333333);
        tooltipEl.textContent = mesh._shop.name + ' — ' + mesh._shop.type;
        tooltipEl.style.left  = (e.clientX + 14) + 'px';
        tooltipEl.style.top   = (e.clientY - 10) + 'px';
        tooltipEl.classList.remove('hidden');
        document.body.style.cursor = 'pointer';
      }
    }
  }

  /* ── 15. SHOP PANEL UI ────────────────────────────────────── */
  function showShopPanel(shop) {
    selectedShop = shop;
    var panel = document.getElementById('shop-panel');

    /* header color */
    var hex = '#' + ('000000' + shop.color.toString(16)).slice(-6);
    document.getElementById('shop-icon-badge').style.background  = hex;
    document.getElementById('shop-icon-badge').textContent       = shop.icon;
    document.getElementById('shop-panel-name').textContent       = shop.name;
    document.getElementById('shop-panel-type').textContent       = shop.type;

    /* rating stars */
    var stars = '';
    for (var s = 0; s < 5; s++) {
      stars += s < Math.floor(shop.rating) ? '★' : (s < shop.rating ? '½' : '☆');
    }
    document.getElementById('shop-panel-rating').textContent = stars + ' ' + shop.rating;
    document.getElementById('shop-panel-price').textContent  = shop.price;
    document.getElementById('shop-panel-desc').textContent   = shop.desc;

    /* category tags */
    var tagHTML = '';
    [shop.cat, shop.type].forEach(function (t) {
      tagHTML += '<span class="shop-tag">' + t + '</span>';
    });
    document.getElementById('shop-panel-tags').innerHTML = tagHTML;

    panel.classList.remove('hidden');

    /* Send shop data to React Native app */
    if (typeof window.ReactNativeWebView !== 'undefined') {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'shop_selected',
        shop: {
          name: shop.name,
          type: shop.type,
          desc: shop.desc,
          rating: shop.rating,
          price: shop.price,
          icon: shop.icon
        }
      }));
    }
  }

  /* ── 16. FILTER ───────────────────────────────────────────── */
  function applyFilter(filter) {
    var count = 0;
    for (var i = 0; i < shopMeshes.length; i++) {
      var item    = shopMeshes[i];
      var visible = (filter === 'all' || item.shop.cat === filter);
      item.mesh.visible = visible;
      if (visible) { count++; }
    }
    for (var j = 0; j < signMeshes.length; j++) {
      signMeshes[j].mesh.visible = (filter === 'all' || signMeshes[j].shop.cat === filter);
    }
    document.getElementById('visible-count').textContent = count;

    /* update legend dots */
    var dots = document.querySelectorAll('.legend-dot');
    for (var k = 0; k < dots.length; k++) {
      var dot  = dots[k];
      var shop = SHOPS[parseInt(dot.getAttribute('data-id'), 10)];
      dot.classList.toggle('dimmed', filter !== 'all' && shop.cat !== filter);
    }

    /* hide panel if active shop filtered out */
    if (selectedShop && filter !== 'all' && selectedShop.cat !== filter) {
      document.getElementById('shop-panel').classList.add('hidden');
      selectedShop = null;
    }
  }

  /* ── 17. LEGEND GRID ──────────────────────────────────────── */
  function buildLegend() {
    var grid = document.getElementById('legend-grid');
    grid.innerHTML = '';
    for (var i = 0; i < SHOPS.length; i++) {
      var shop = SHOPS[i];
      var hex  = '#' + ('000000' + shop.color.toString(16)).slice(-6);
      var dot  = document.createElement('div');
      dot.className = 'legend-dot';
      dot.style.background = hex;
      dot.title = shop.name;
      dot.textContent = shop.icon;
      dot.setAttribute('data-id', i);
      (function (s) {
        dot.addEventListener('click', function () { showShopPanel(s); });
      }(shop));
      grid.appendChild(dot);
    }
  }

  /* ── 18. ANIMATION LOOP ───────────────────────────────────── */
  function animate() {
    requestAnimationFrame(animate);
    var dt = clock.getDelta();
    updateAvatar(dt);
    renderer.render(scene, camera);
  }

  /* exported for deferred use */
  window.ShopCity = {
    init: init,
    SHOPS: SHOPS,
    getShopAt: function (i) { return SHOPS[i]; }
  };

  /* Start when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    console.log('ShopCity: Document already loaded, initializing...');
    init();
  }

}());
