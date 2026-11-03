import * as THREE from "three";

// The house from the photo, rebuilt as a 3D model. Units are metres.
// Photo -> world: the door is 2.1 m tall and 122 px tall in the photo (58 px/m),
// x = 0 at the door centre, y = 0 at the ground.
const X = (px) => (px - 594) / 58;
const Y = (py) => (706 - py) / 58;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
const rand = (a, b) => a + Math.random() * (b - a);

function canvasTex(w, h, draw, { srgb = true, repeat } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.anisotropy = 8;
  }
  return t;
}

export function createHouse(canvas, hero, { onLost } = {}) {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1.6, 0.5, 400);
  const root = new THREE.Group();
  scene.add(root);

  // ---------- sky, fog, light ----------
  scene.background = canvasTex(4, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, "#9DB8D8");
    gr.addColorStop(0.45, "#D3DFEE");
    gr.addColorStop(0.72, "#F1DDD2");
    gr.addColorStop(1, "#EDBB92");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
  scene.fog = new THREE.Fog(0xcdd5e0, 70, 160);

  scene.add(new THREE.HemisphereLight(0xb9cfec, 0x3a332d, 0.95));
  const sun = new THREE.DirectionalLight(0xffd2a0, 2.1);
  sun.position.set(-16, 12, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 18, bottom: -10, near: 1, far: 80 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0x9db5d6, 0.5);
  fill.position.set(14, 6, 12);
  scene.add(fill);

  // ---------- textures and materials ----------
  const noise = canvasTex(128, 128, (g, w, h) => {
    for (let i = 0; i < 2600; i++) {
      const v = 90 + Math.random() * 120;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }, { srgb: false, repeat: [3, 3] });
  const paving = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#2B3138";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#3C444D";
    g.lineWidth = 3;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const off = r % 2 ? 32 : 0;
        const v = 40 + Math.random() * 14;
        g.fillStyle = `rgb(${v},${v + 5},${v + 10})`;
        g.fillRect(c * 64 + off + 2, r * 64 + 2, 60, 60);
        g.strokeRect(c * 64 + off, r * 64, 64, 64);
      }
    }
  }, { repeat: [150, 150] });
  const glowTex = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,236,190,1)");
    gr.addColorStop(0.3, "rgba(255,205,120,.55)");
    gr.addColorStop(1, "rgba(255,190,100,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });
  const cloudTex = canvasTex(128, 64, (g, w, h) => {
    const gr = g.createRadialGradient(64, 32, 0, 64, 32, 64);
    gr.addColorStop(0, "rgba(255,240,232,.9)");
    gr.addColorStop(1, "rgba(255,230,220,0)");
    g.setTransform(1, 0, 0, 0.5, 0, 16);
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h * 2);
  });
  const vineTex = canvasTex(256, 128, (g, w, h) => {
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * (0.35 + 0.65 * Math.random());
      g.fillStyle = `hsl(${105 + Math.random() * 30},${45 + Math.random() * 20}%,${18 + Math.random() * 20}%)`;
      g.beginPath();
      g.ellipse(x, y, 5 + Math.random() * 6, 3 + Math.random() * 4, Math.random() * 3, 0, 6.3);
      g.fill();
    }
  });

  const M = (color, rough = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
  const white = M(0xf2efe8, 0.92, { bumpMap: noise, bumpScale: 0.6 });
  const cream = M(0xe9dfc9, 0.9, { bumpMap: noise, bumpScale: 0.4 });
  const brown = M(0x8c5230, 0.55);
  const wood = M(0x5b3520, 0.6);
  const dark = M(0x2d1c12, 0.7);
  const stone = M(0x8a857f, 1, { bumpMap: noise, bumpScale: 1.2 });
  const slab = M(0x8b8782, 0.9, { bumpMap: noise, bumpScale: 0.5 });
  const floorWood = M(0x4a2f1f, 0.5);
  const pave = new THREE.MeshStandardMaterial({ map: paving, roughness: 0.38, metalness: 0.15 });

  const edgeMeshes = [];
  function bx(x0, x1, y0, y1, z0, z1, mat, { edge = false, cast = true } = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = cast;
    m.receiveShadow = true;
    root.add(m);
    if (edge) edgeMeshes.push(m);
    return m;
  }

  // ---------- ground ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), pave);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 25);
  ground.receiveShadow = true;
  root.add(ground);

  // ---------- left block: white mass with a brown frame ----------
  bx(X(185), X(420), 0, Y(243), -7, -0.3, white, { edge: true });
  bx(X(140), X(185), 0, Y(196), -7.2, 0.6, brown, { edge: true }); // column
  bx(X(133), X(420) + 0.15, Y(243), Y(196), -7.2, 0.6, brown, { edge: true }); // top beam
  bx(X(165), X(410), 0, 0.35, -0.3, 0.75, brown); // planter
  bx(X(350), X(493), Y(345), Y(345) + 0.32, -0.3, 1.6, brown, { edge: true }); // canopy

  const winMats = [];
  function win(x0, x1, y0, y1, z) {
    bx(x0 - 0.1, x1 + 0.1, y0 - 0.1, y1 + 0.1, z - 0.1, z + 0.06, dark, { edge: true });
    const gm = new THREE.MeshStandardMaterial({ color: 0xe6d3ac, emissive: 0xffc57a, emissiveIntensity: 0.55, roughness: 0.6 });
    winMats.push(gm);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), gm);
    glass.position.set((x0 + x1) / 2, (y0 + y1) / 2, z + 0.07);
    root.add(glass);
    for (const f of [1 / 3, 2 / 3]) bx(x0 + (x1 - x0) * f - 0.03, x0 + (x1 - x0) * f + 0.03, y0, y1, z + 0.06, z + 0.1, dark, { cast: false });
  }
  win(X(240), X(365), Y(452), Y(323), -0.3);
  win(X(240), X(365), Y(650), Y(523), -0.3);
  bx(X(240), X(365), Y(523), Y(452), -0.3, -0.18, stone); // stone strip between the windows

  // ---------- centre: entrance, balcony, tower ----------
  bx(X(420), X(636), 0, 4.5, -9, -2.7, white); // core mass behind
  bx(-3.0, -0.5, 0, 4.2, -2.7, -1.5, cream); // entry wall, left of the door
  bx(0.48, 0.72, 0, 4.2, -2.7, -1.5, cream);
  bx(-0.5, 0.48, 3.15, 4.2, -2.7, -1.5, cream); // header
  win(X(472), X(538), Y(627), Y(521), -1.5);

  bx(-3.0, 0.48, 0, 1.0, -2.7, 0.3, floorWood, { edge: true }); // porch floor
  bx(-3.0, 0.48, 0, 0.64, 0.3, 0.65, floorWood, { edge: true }); // steps
  bx(-3.0, 0.48, 0, 0.32, 0.65, 1.0, floorWood, { edge: true });

  // door, hinged on its left edge, opening inward
  const hinge = new THREE.Group();
  hinge.position.set(-0.5, 1.0, -1.5);
  root.add(hinge);
  const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.98, 2.15, 0.07), M(0x6b3e1e, 0.5));
  doorMesh.position.set(0.49, 1.07, 0);
  doorMesh.castShadow = true;
  hinge.add(doorMesh);
  const lattice = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.5, 0.03), dark);
  lattice.position.set(0.8, 1.07, 0.04);
  hinge.add(lattice);
  bx(-0.56, -0.5, 1.0, 3.2, -1.6, -1.44, dark, { edge: true });
  bx(0.48, 0.54, 1.0, 3.2, -1.6, -1.44, dark, { edge: true });
  const interior = new THREE.Mesh(new THREE.BoxGeometry(0.98, 2.15, 1.2), new THREE.MeshBasicMaterial({ color: 0xffd79a, side: THREE.BackSide }));
  interior.position.set(-0.01, 2.07, -2.1);
  root.add(interior);

  // balcony (slab, railing, hanging vines) and the grey tower above
  bx(X(432), X(650), 4.2, 4.5, -1.5, 1.4, white, { edge: true });
  bx(X(432), X(650), 5.0, 5.08, 1.28, 1.4, dark, { cast: false });
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.62, 0.03), dark, 34);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < 34; i++) {
    mtx.setPosition(X(432) + 0.05 + i * 0.112, 4.82, 1.34);
    bars.setMatrixAt(i, mtx);
  }
  root.add(bars);
  const vines = [];
  for (const z of [1.5, 1.25]) {
    const v = new THREE.Mesh(
      new THREE.PlaneGeometry(X(650) - X(432), 1.5),
      new THREE.MeshStandardMaterial({ map: vineTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 })
    );
    v.position.set((X(432) + X(650)) / 2, 3.55, z);
    root.add(v);
    vines.push(v);
  }
  bx(X(487), X(612), 4.5, Y(250), -3.2, -0.6, stone, { edge: true });
  bx(X(477), X(617), Y(250), Y(236), -3.4, -0.4, slab, { edge: true }); // cap

  // ---------- right block, porch, planter ----------
  bx(X(636), X(963), 0, Y(396), -9, -0.5, white, { edge: true });
  bx(X(636) - 0.1, X(963) + 0.1, Y(396), Y(388), -9.1, -0.4, slab, { edge: true }); // parapet
  bx(X(620), X(875), Y(512), Y(512) + 0.26, -0.5, 2.0, slab, { edge: true }); // porch roof
  bx(X(855), X(868), 0, Y(512), 1.7, 1.95, brown, { edge: true }); // porch column
  bx(X(622), X(735), Y(690), Y(520), -0.5, -0.38, stone); // stone panel
  win(X(733), X(850), Y(646), Y(524), -0.5);
  bx(X(628), X(955), 0, 0.33, -0.2, 0.6, white); // planter

  // ---------- carport, car, compound walls ----------
  bx(X(957), X(1140), Y(525), Y(512) + 0.2, -7, 2.6, slab, { edge: true });
  bx(X(1128), X(1140), 0, Y(520), 1.8, 2.0, slab);
  bx(X(957), X(1140), 0, Y(520), -7, -6.8, stone);
  bx(-34, X(140), 0, Y(592), 2.0, 2.4, stone, { edge: true });
  bx(X(1130), 34, 0, Y(590), 2.0, 2.4, stone, { edge: true });

  const car = new THREE.Group();
  const paint = M(0xe4e8ed, 0.3, { metalness: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 4.3), paint);
  body.position.y = 0.58;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.5, 2.2), M(0x232a31, 0.15, { metalness: 0.5 }));
  cab.position.set(0, 1.08, -0.3);
  car.add(body, cab);
  for (const [x, z] of [[-0.9, 1.4], [0.9, 1.4], [-0.9, -1.4], [0.9, -1.4]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 14), M(0x111111, 0.8));
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.34, z);
    car.add(w);
  }
  for (const x of [-0.6, 0.6]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xfff1cf }));
    l.position.set(x, 0.62, 2.16);
    car.add(l);
  }
  car.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  car.position.set(8.1, 0, 0.4);
  car.rotation.y = -0.5;
  root.add(car);

  // ---------- plants ----------
  const leafMat = M(0x3f8a55, 0.8);
  function agave(x, y, z) {
    const g = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55, 4), leafMat);
      c.position.y = 0.2;
      c.rotation.set(0.8, (i / 8) * 6.283, 0, "YXZ");
      c.translateY(0.1);
      g.add(c);
    }
    g.position.set(x, y, z);
    root.add(g);
  }
  for (let i = 0; i < 6; i++) agave(X(185) + 0.3 + i * 0.7, 0.35, 0.25);
  for (let i = 0; i < 6; i++) agave(X(650) + i * 0.95, 0.33, 0.2);
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.7, 6), wood);
  trunk.position.y = 0.85;
  tree.add(trunk);
  for (const [dx, dy, r] of [[0, 2.0, 0.62], [0.25, 2.45, 0.45], [-0.25, 1.65, 0.4]]) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M(0x4f8a4f, 0.8, { flatShading: true }));
    f.position.set(dx, dy, 0);
    f.castShadow = true;
    tree.add(f);
  }
  tree.position.set(X(908), 0.3, 0.3);
  root.add(tree);

  // palms and the tree line behind
  const frond = (() => {
    const N = 8, L = 4.2, pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const x = s * L, y = Math.sin(s * 1.4) * 0.5 - s * s * 1.6, w = Math.pow(1 - s, 0.6) * 0.55 + 0.02;
      pos.push(x, y, -w, x, y, w);
      if (i < N) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  })();
  const frondMat = M(0x2a6b3a, 0.8, { side: THREE.DoubleSide, emissive: 0x0f2e19, emissiveIntensity: 0.9 });
  const trunkMat = M(0x6b5a48, 1);
  const palms = [];
  function palm(x, z, h, lean) {
    const g = new THREE.Group();
    const pts = [[0, 0], [lean * 0.3, h * 0.35], [lean * 0.8, h * 0.7], [lean, h]].map(([a, b]) => new THREE.Vector3(a, b, 0));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.2, 6), trunkMat));
    const crown = new THREE.Group();
    crown.position.copy(pts[3]);
    for (let i = 0; i < 15; i++) {
      const piv = new THREE.Group();
      piv.rotation.y = (i / 15) * 6.283 + rand(0, 0.3);
      piv.scale.setScalar(rand(0.85, 1.25));
      const f = new THREE.Mesh(frond, frondMat);
      f.rotation.z = rand(0.2, 0.55);
      piv.add(f);
      crown.add(piv);
    }
    g.add(crown);
    g.position.set(x, 0, z);
    root.add(g);
    palms.push({ crown, ph: Math.random() * 6 });
  }
  [[-13, -6, 10, -1.2], [-17, -1, 12, -1.6], [-21, -9, 9.5, 0.8], [-11.5, -12, 11, -0.6], [-26, -4, 11, -1.4],
   [13.5, -5, 11, 1.1], [17.5, -8, 10, 1.5], [21, -2, 12, 1.2], [12, -14, 9.5, -0.7], [25, -9, 10.5, 1.0]]
    .forEach(([x, z, h, l]) => palm(x, z, h, l));
  const hedgeMat = [M(0x1f3d2a, 1, { flatShading: true }), M(0x274a32, 1, { flatShading: true }), M(0x1a3424, 1, { flatShading: true })];
  for (let i = 0; i < 46; i++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(2, 4.5), 1), hedgeMat[i % 3]);
    b.position.set(-48 + i * 2.1 + rand(-1, 1), rand(0.5, 3.5), rand(-34, -20));
    root.add(b);
  }

  // clouds
  const clouds = Array.from({ length: 12 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: rand(0.35, 0.65), depthWrite: false, fog: false }));
    s.scale.set(rand(18, 34), rand(5, 9), 1);
    s.position.set(rand(-70, 70), rand(16, 34), -80);
    scene.add(s);
    return s;
  });

  // ---------- wall lamps ----------
  const LAMPS = [
    [X(213), Y(383), -0.3], [X(389), Y(383), -0.3], [X(546), Y(368), -0.6],
    [X(213), Y(580), -0.3], [X(389), Y(580), -0.3], [X(678), Y(583), -0.38],
    [X(905), Y(517), -0.5], [X(72), Y(648), 2.4], [X(1192), Y(648), 2.4],
  ];
  const LIT = new Set([0, 2, 4, 5, 6]);
  const lamps = LAMPS.map(([x, y, z], i) => {
    const fixMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffd08a, emissiveIntensity: 0 });
    const fix = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.22, 8), fixMat);
    fix.position.set(x, y, z + 0.07);
    root.add(fix);
    const sprites = [[1.2, 1.2, 0, 0.55], [0.8, 2.2, 1.1, 0.4], [0.8, 2.2, -1.1, 0.4]].map(([sx, sy, dy, o]) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, fog: false }));
      s.scale.set(sx, sy, 1);
      s.position.set(x, y + dy, z + 0.25);
      s.userData.o = o;
      scene.add(s);
      return s;
    });
    let light = null;
    if (LIT.has(i)) {
      light = new THREE.PointLight(0xffc47a, 0, 10, 1.6);
      light.position.set(x, y, z + 0.6);
      scene.add(light);
    }
    return { fixMat, sprites, light };
  });

  // ---------- marigold toran over the entrance ----------
  const toran = new THREE.Group();
  scene.add(toran);
  const tCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(X(420), Y(512), 1.5), new THREE.Vector3(X(645), Y(512) - 1.1, 1.5), new THREE.Vector3(X(870), Y(512), 1.5));
  toran.add(new THREE.Mesh(new THREE.TubeGeometry(tCurve, 30, 0.012, 4), dark));
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), M(0xffffff, 0.6, { emissive: 0x3a2000 }), 46);
  const col = new THREE.Color();
  for (let i = 0; i < 46; i++) {
    const p = tCurve.getPoint(i / 45);
    mtx.setPosition(p.x, p.y, p.z);
    beads.setMatrixAt(i, mtx);
    beads.setColorAt(i, col.set(i % 2 ? 0xffc83a : 0xf2851b));
  }
  toran.add(beads);
  const leafGeo = new THREE.SphereGeometry(1, 8, 6);
  const leafM = M(0x2e5540, 0.7, { side: THREE.DoubleSide });
  const leaves = Array.from({ length: 9 }, (_, i) => {
    const p = tCurve.getPoint((i + 1) / 10);
    const g = new THREE.Group();
    g.position.copy(p);
    const m = new THREE.Mesh(leafGeo, leafM);
    m.scale.set(0.07, 0.23, 0.025);
    m.position.y = -0.24;
    g.add(m);
    toran.add(g);
    return g;
  });

  // ---------- the family ----------
  const SKIN = 0xb97a56, HAIR = 0x1b1411;
  function limb(r, len, mat) {
    return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 8), mat);
  }
  function person({ h, bottom, hem = 0.21, top, hemBand = 0xc9a24b, skirtTop = 0.95, kind }) {
    const s = h / 1.75;
    const g = new THREE.Group();
    const inner = new THREE.Group();
    g.add(inner);
    const skin = M(SKIN, 0.8), hair = M(HAIR, 0.9);
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.17 * s, hem * s, (skirtTop - 0.05) * s, 16), M(bottom, 0.85));
    skirt.position.y = ((skirtTop - 0.05) / 2 + 0.05) * s;
    const band = new THREE.Mesh(new THREE.CylinderGeometry((hem + 0.005) * s, (hem + 0.008) * s, 0.07 * s, 16), M(hemBand, 0.5));
    band.position.y = 0.09 * s;
    const torso = limb(0.15 * s, 0.32 * s, M(top, 0.85));
    torso.position.y = 1.12 * s;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045 * s, 0.05 * s, 0.1 * s, 8), skin);
    neck.position.y = 1.44 * s;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 14, 10), skin);
    head.position.y = 1.57 * s;
    const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.117 * s, 14, 10), hair);
    hairM.position.set(0, 1.585 * s, 0.025 * s); // back of the head faces the camera
    inner.add(skirt, band, torso, neck, head, hairM);

    const arm = (x, sleeve) => {
      const p = new THREE.Group();
      p.position.set(x * s, 1.32 * s, 0);
      const a = limb(0.045 * s, 0.4 * s, skin);
      a.position.y = -0.26 * s;
      const sl = limb(0.052 * s, 0.16 * s, M(sleeve, 0.85));
      sl.position.y = -0.1 * s;
      p.add(a, sl);
      inner.add(p);
      return p;
    };
    const armL = arm(-0.2, top);
    const armR = arm(0.2, top);

    const foot = (x) => {
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.055 * s, 8, 6), M(0x7a4b2e, 0.9));
      f.scale.set(1, 0.6, 1.5);
      f.position.set(x * s, 0.03 * s, -0.02 * s);
      inner.add(f);
      return f;
    };
    const footL = foot(-0.07), footR = foot(0.07);

    // shoulder cloth on the back (father, mother)
    if (kind === "father" || kind === "mother") {
      const sash = new THREE.Mesh(new THREE.BoxGeometry(0.13 * s, 0.62 * s, 0.03 * s), M(0xf6f0e0, 0.8));
      sash.position.set(0, 1.1 * s, 0.155 * s);
      sash.rotation.z = 0.6;
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.025 * s, 0.62 * s, 0.034 * s), M(0xc9a24b, 0.5));
      edge.position.set(0.05 * s, 1.1 * s, 0.158 * s);
      edge.rotation.z = 0.6;
      inner.add(sash, edge);
    }
    const jas = M(0xfffbef, 0.6);
    let flame = null, lampLight = null;
    if (kind === "mother") {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.065 * s, 10, 8), hair);
      bun.position.set(0, 1.66 * s, 0.11 * s);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.072 * s, 0.014 * s, 6, 14), jas);
      ring.position.copy(bun.position);
      inner.add(bun, ring);
      // brass lamp in her right hand
      armR.rotation.x = -1.0;
      const lamp = new THREE.Group();
      lamp.position.set(0, -0.5 * s, 0);
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.05, 10), M(0xc9972b, 0.35, { metalness: 0.8 }));
      flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false }));
      flame.scale.set(0.5, 0.5, 1);
      flame.position.y = 0.07;
      lampLight = new THREE.PointLight(0xffb85a, 0, 4, 1.8);
      lampLight.position.y = 0.1;
      lamp.add(bowl, flame, lampLight);
      armR.add(lamp);
    }
    if (kind === "girl") {
      const braid = limb(0.02 * s, 0.4 * s, hair);
      braid.position.set(0, 1.28 * s, 0.14 * s);
      inner.add(braid);
      for (let i = 0; i < 5; i++) {
        const j = new THREE.Mesh(new THREE.SphereGeometry(0.022 * s, 6, 5), jas);
        j.position.set(i % 2 ? 0.012 * s : -0.012 * s, (1.5 - i * 0.08) * s, 0.15 * s);
        inner.add(j);
      }
      const rib = new THREE.Mesh(new THREE.SphereGeometry(0.03 * s, 6, 5), M(0xc0392b, 0.7));
      rib.position.set(0, 1.07 * s, 0.14 * s);
      inner.add(rib);
    }
    inner.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return { g, inner, armL, armR, footL, footR, skirt, s, flame, lampLight, kind };
  }

  const father = person({ h: 1.72, bottom: 0xf4efe3, top: 0xfbf8f0, kind: "father" });
  const mother = person({ h: 1.58, bottom: 0xf6f0e0, hem: 0.23, top: 0x7e2230, kind: "mother" });
  const girl = person({ h: 1.2, bottom: 0x1f6b4a, hem: 0.36, top: 0xe8b94a, hemBand: 0xd9a93c, skirtTop: 0.7, kind: "girl" });
  const boy = person({ h: 1.05, bottom: 0xf6f0e0, hem: 0.2, top: 0xfbf8f0, skirtTop: 0.85, kind: "boy" });
  // the children hold hands
  girl.armR.rotation.z = 0.45;
  boy.armL.rotation.z = -0.5;

  const pair = new THREE.Group();
  girl.g.position.x = -0.24;
  boy.g.position.x = 0.25;
  pair.add(girl.g, boy.g);
  [mother.g, pair, father.g].forEach((p) => {
    p.scale.setScalar(1.15); // a little larger than life so they read at hero size
    root.add(p);
  });

  const D = 4.8, Z0 = 16, Z_IN = -2.2;
  const walkers = [
    { node: mother.g, fig: [mother], delay: 1.0, x0: -0.7, x1: -0.05 },
    { node: pair, fig: [girl, boy], delay: 1.3, x0: 0.5, x1: 0.02 },
    { node: father.g, fig: [father], delay: 1.7, x0: 1.1, x1: 0.08 },
  ];
  const stairY = (z) => ease(clamp((1.1 - z) / 0.4, 0, 1)) * 0.32 + ease(clamp((0.75 - z) / 0.4, 0, 1)) * 0.32 + ease(clamp((0.38 - z) / 0.4, 0, 1)) * 0.32;

  // interior light, spilling onto the steps when the door opens
  const doorLight = new THREE.PointLight(0xffcf8a, 0, 9, 1.4);
  doorLight.position.set(0, 2.2, -0.6);
  scene.add(doorLight);

  // ---------- blueprint trace ----------
  root.updateMatrixWorld(true);
  const tracePos = [];
  for (const m of edgeMeshes) {
    const e = new THREE.EdgesGeometry(m.geometry, 20);
    e.applyMatrix4(m.matrixWorld);
    tracePos.push(...e.attributes.position.array);
  }
  const traceGeo = new THREE.BufferGeometry();
  traceGeo.setAttribute("position", new THREE.Float32BufferAttribute(tracePos, 3));
  const traceCount = tracePos.length / 3;
  const trace = new THREE.LineSegments(traceGeo, new THREE.LineBasicMaterial({ color: 0xffe7b3, transparent: true, depthTest: false, fog: false }));
  trace.renderOrder = 10;
  trace.frustumCulled = false;
  scene.add(trace);

  // ---------- camera and interaction ----------
  const target = new THREE.Vector3(0.6, 4.5, 0);
  let dist = 26, yawT = 0, yaw = 0, drag = 0, dragging = false, lastX = 0, mx = 0, my = 0, pitchT = 0, pitch = 0;

  function layout() {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const W = clamp(camera.aspect * 15, 7.5, 26);
    dist = W / 2 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
  }
  const ro = new ResizeObserver(layout);
  ro.observe(canvas);
  layout();

  const onMove = (e) => {
    if (e.pointerType === "mouse") {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    if (dragging) {
      drag = clamp(drag + (e.clientX - lastX) * 0.005, -0.8, 0.8);
      lastX = e.clientX;
    }
  };
  const onDown = (e) => {
    if (e.target.closest("a, button")) return;
    dragging = true;
    lastX = e.clientX;
  };
  const onUp = () => (dragging = false);
  window.addEventListener("pointermove", onMove, { passive: true });
  hero.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);

  // ---------- per-frame update ----------
  function update(t, tw, dt) {
    // blueprint trace
    const tr = clamp(t / 3.2, 0, 1);
    trace.geometry.setDrawRange(0, Math.floor((tr * traceCount) / 2) * 2);
    trace.material.opacity = t < 3.2 ? 1 : Math.max(0, 1 - (t - 3.2) / 1.2);
    trace.visible = trace.material.opacity > 0.01;

    // lamps light up one by one, then breathe
    lamps.forEach((l, i) => {
      const a = ease(clamp((t - (1.2 + i * 0.2)) / 1.0, 0, 1));
      const k = a * (0.85 + 0.15 * Math.sin(tw * 1.6 + i));
      l.sprites.forEach((s) => (s.material.opacity = s.userData.o * k));
      l.fixMat.emissiveIntensity = 2.2 * a;
      if (l.light) l.light.intensity = 9 * k;
    });
    winMats.forEach((m, i) => (m.emissiveIntensity = 0.5 + 0.12 * Math.sin(tw * 0.9 + i * 1.7)));

    // toran drops in and sways
    const tp = ease(clamp((t - 1.8) / 1.2, 0, 1));
    toran.visible = tp > 0;
    toran.position.y = (1 - tp) * 1.6;
    leaves.forEach((g, i) => (g.rotation.z = Math.sin(tw * 1.8 + i * 0.7) * 0.18));

    // the family walks up and goes in
    walkers.forEach((w, wi) => {
      const u = clamp((t - w.delay) / D, 0, 1);
      const z = THREE.MathUtils.lerp(Z0, Z_IN, u);
      w.node.visible = u > 0 && u < 1 && z > Z_IN + 0.05;
      w.node.position.set(THREE.MathUtils.lerp(w.x0, w.x1, ease(clamp(u / 0.8, 0, 1))), stairY(z), z);
      const ph = t * 7 + wi * 1.3;
      w.fig.forEach((f) => {
        const k = f.s;
        f.inner.position.y = Math.abs(Math.sin(ph)) * 0.03 * k;
        f.skirt.rotation.z = Math.sin(ph) * 0.03;
        f.footL.position.y = (0.03 + Math.max(0, Math.sin(ph)) * 0.05) * k;
        f.footR.position.y = (0.03 + Math.max(0, -Math.sin(ph)) * 0.05) * k;
        if (f.kind === "father") { f.armL.rotation.x = Math.sin(ph) * 0.5; f.armR.rotation.x = -Math.sin(ph) * 0.5; }
        if (f.kind === "mother") { f.armL.rotation.x = Math.sin(ph) * 0.5; }
        if (f.kind === "girl") f.armL.rotation.x = Math.sin(ph) * 0.5;
        if (f.kind === "boy") f.armR.rotation.x = -Math.sin(ph) * 0.5;
        if (f.flame) {
          const fl = 0.45 + 0.1 * Math.sin(tw * 17) + 0.05 * Math.sin(tw * 29);
          f.flame.scale.set(fl, fl, 1);
          f.lampLight.intensity = 3 * (0.85 + 0.15 * Math.sin(tw * 13));
        }
      });
    });

    // door opens as the mother arrives
    const o = ease(clamp((t - 4.9) / 1.0, 0, 1));
    hinge.rotation.y = o * 1.45;
    doorLight.intensity = 14 * o;

    // the world keeps moving
    palms.forEach((p) => {
      p.crown.rotation.z = Math.sin(tw * 0.7 + p.ph) * 0.04;
      p.crown.rotation.x = Math.cos(tw * 0.55 + p.ph) * 0.03;
    });
    vines.forEach((v, i) => (v.rotation.z = Math.sin(tw * 1.1 + i) * 0.012));
    clouds.forEach((c, i) => {
      c.position.x += dt * (0.5 + (i % 3) * 0.2);
      if (c.position.x > 90) c.position.x = -90;
    });

    // camera: a slow dolly-in at the start, pointer and drag orbit, scroll swings it round
    const intro = ease(clamp(t / 3.5, 0, 1));
    const sy = clamp(window.scrollY / window.innerHeight, 0, 1.2);
    if (!dragging) drag *= 0.995;
    yawT = clamp(drag + mx * 0.2, -0.85, 0.85);
    yaw += (yawT - yaw) * 0.06;
    pitchT = my * 0.03;
    pitch += (pitchT - pitch) * 0.06;
    const yawAll = yaw - (1 - intro) * 0.22 + sy * 0.3 + Math.sin(tw * 0.25) * 0.02;
    const d = dist * (1 + (1 - intro) * 0.14 + sy * 0.1);
    camera.position.set(target.x + Math.sin(yawAll) * d, 2.4 + pitch * d, Math.cos(yawAll) * d);
    camera.lookAt(target);
  }

  // ---------- loop ----------
  let t0 = performance.now(), last = t0, raf = 0, manual = false, visible = true, dead = false;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (manual || !visible || dead) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    update((now - t0) / 1000, now / 1000, dt);
    renderer.render(scene, camera);
  }
  const lost = (e) => {
    e.preventDefault();
    dead = true;
    onLost?.();
  };
  canvas.addEventListener("webglcontextlost", lost);

  update(0, 0, 0);
  renderer.render(scene, camera);

  const api = {
    start() {
      t0 = last = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    },
    replay() {
      t0 = last = performance.now();
    },
    // for screenshots: ?debug3d then window.__house3d.seek(seconds)
    seek(sec) {
      manual = true;
      update(sec, sec, 0.016);
      renderer.render(scene, camera);
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      hero.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", lost);
      renderer.dispose();
    },
  };
  return api;
}
