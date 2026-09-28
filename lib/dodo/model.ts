import * as THREE from 'three';

/**
 * Dodo Twin — original, procedurally modelled exhibit asset.
 * Metres; +Y up; +Z forward; planted feet at Y=0; neutral crown Y=0.70.
 * Joint angles are relative to the recorded rest transforms, in radians.
 * No external models, images, network requests, or copyrighted source assets.
 */
export interface DodoVisualState {
  blink?: number;
  breath?: number;
  gazeX?: number;
  gazeY?: number;
}

export interface DodoAsset {
  root: THREE.Group;
  joints: Record<string, THREE.Object3D>;
  skeleton: THREE.Group;
  updateVisuals: (state: DodoVisualState) => void;
  dispose: () => void;
}

type Ring = { y: number; rx: number; rz: number; z: number };
type Anchor = { object: THREE.Object3D; point: THREE.Vector3 };
const TAU = Math.PI * 2;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export function createDodo(): DodoAsset {
  const root = new THREE.Group();
  root.name = 'Dodo · Raphus cucullatus';
  const joints: Record<string, THREE.Object3D> = {};
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  let seed = 268194;
  const rand = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const geometry = <T extends THREE.BufferGeometry>(g: T): T => { geometries.add(g); return g; };
  const material = <T extends THREE.Material>(m: T): T => { materials.add(m); return m; };
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, parent: THREE.Object3D, name: string) => {
    const result = new THREE.Mesh(g, m);
    result.name = name;
    result.castShadow = true;
    result.receiveShadow = true;
    parent.add(result);
    return result;
  };
  const joint = (name: string, parent: THREE.Object3D, at: THREE.Vector3) => {
    const result = new THREE.Group();
    result.name = name;
    result.position.copy(at);
    parent.add(result);
    joints[name] = result;
    return result;
  };

  function canvasTexture(width: number, height: number, paint: (ctx: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('The dodo asset needs browser Canvas 2D texture support.');
    paint(ctx);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    textures.add(t);
    return t;
  }

  // Original barb-by-barb feather image. Geometry provides the feather outline;
  // this map adds a rachis, fine vanes, uneven pigment, and pale worn edges.
  const featherMap = canvasTexture(256, 512, ctx => {
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#b0a89a'); grad.addColorStop(0.47, '#f3ead8');
    grad.addColorStop(0.51, '#c6bba8'); grad.addColorStop(1, '#a29a8e');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 512);
    for (let i = 0; i < 1350; i++) {
      const y = rand() * 540 - 10;
      const side = rand() > 0.5 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(128, y);
      ctx.quadraticCurveTo(128 + side * 65, y - 27, 128 + side * 140, y - 65);
      ctx.strokeStyle = `rgba(${rand() > 0.54 ? '255,246,218' : '49,42,34'},${0.06 + rand() * 0.17})`;
      ctx.lineWidth = 0.45 + rand() * 1.15; ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(128, 0); ctx.lineTo(128, 512);
    ctx.strokeStyle = 'rgba(56,45,32,.32)'; ctx.lineWidth = 2.3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(129.5, 0); ctx.lineTo(129.5, 512);
    ctx.strokeStyle = 'rgba(255,248,225,.46)'; ctx.lineWidth = 1; ctx.stroke();
  });

  const downMap = canvasTexture(256, 256, ctx => {
    ctx.fillStyle = '#a59b8b'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 5700; i++) {
      const x = rand() * 256, y = rand() * 256;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand() * 3 - 1.5, y + 4 + rand() * 12);
      ctx.strokeStyle = rand() > 0.5 ? 'rgba(238,226,204,.13)' : 'rgba(39,34,28,.13)';
      ctx.lineWidth = 0.5; ctx.stroke();
    }
  });
  downMap.wrapS = downMap.wrapT = THREE.RepeatWrapping;
  downMap.repeat.set(3, 3);

  const scaleMap = canvasTexture(256, 512, ctx => {
    ctx.fillStyle = '#7c6539'; ctx.fillRect(0, 0, 256, 512);
    for (let row = -1; row < 25; row++) {
      for (let col = -1; col < 10; col++) {
        const x = col * 30 + (row % 2) * 15, y = row * 23;
        ctx.beginPath(); ctx.moveTo(x, y + 3);
        ctx.quadraticCurveTo(x + 15, y - 4, x + 29, y + 3);
        ctx.lineTo(x + 25, y + 18); ctx.quadraticCurveTo(x + 15, y + 26, x + 3, y + 18); ctx.closePath();
        const n = Math.round(rand() * 24);
        ctx.fillStyle = `rgb(${178 + n},${145 + n},${83 + n})`; ctx.fill();
        ctx.strokeStyle = 'rgba(71,52,27,.65)'; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 5, y + 5); ctx.quadraticCurveTo(x + 15, y, x + 25, y + 5);
        ctx.strokeStyle = 'rgba(243,213,149,.6)'; ctx.lineWidth = 1; ctx.stroke();
      }
    }
  });
  scaleMap.wrapS = scaleMap.wrapT = THREE.RepeatWrapping;

  const hornMap = canvasTexture(256, 256, ctx => {
    ctx.fillStyle = '#f2ebd5'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 650; i++) {
      const x = rand() * 256;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 4, 80, x - 4, 180, x + rand() * 8, 256);
      ctx.strokeStyle = `rgba(70,64,44,${0.01 + rand() * 0.08})`; ctx.lineWidth = 0.3 + rand(); ctx.stroke();
    }
  });

  const plumage = material(new THREE.MeshStandardMaterial({
    color: '#888178', map: featherMap, roughness: 0.94, metalness: 0,
    side: THREE.DoubleSide, envMapIntensity: 0.45,
  }));
  const bodyUndercoat = material(new THREE.MeshStandardMaterial({
    color: '#7e786f', map: downMap, roughness: 0.97,
  }));
  const neckUndercoat = material(new THREE.MeshStandardMaterial({
    color: '#797972', map: downMap, roughness: 0.95,
  }));
  // Evidence (see docs/01): grey naked face; bill in green, black and yellow
  // tones; stout yellowish legs with black claws; lighter primaries; a tuft of
  // curly light tail feathers. Exact hues remain an artistic interpretation.
  const skin = material(new THREE.MeshStandardMaterial({ color: '#97978c', roughness: 0.86, map: hornMap }));
  const faceSkin = material(new THREE.MeshStandardMaterial({ color: '#8c8c82', roughness: 0.9, map: hornMap }));
  const eyeRim = material(new THREE.MeshStandardMaterial({ color: '#76766b', roughness: 0.88 }));
  const keratin = material(new THREE.MeshStandardMaterial({ map: hornMap, vertexColors: true, roughness: 0.42, metalness: 0.02 }));
  const legMat = material(new THREE.MeshStandardMaterial({ color: '#cfb466', map: scaleMap, bumpMap: scaleMap, bumpScale: 0.0008, roughness: 0.78 }));
  const clawMat = material(new THREE.MeshStandardMaterial({ color: '#23211d', roughness: 0.45 }));
  const mouthMat = material(new THREE.MeshStandardMaterial({ color: '#2e2824', roughness: 0.89 }));
  // Contemporary accounts describe a darker, dun back; the folded wing uses it.
  const wingPlumage = material(new THREE.MeshStandardMaterial({ color: '#736b60', map: featherMap, roughness: 0.93, side: THREE.DoubleSide }));
  const lightPlumage = material(new THREE.MeshStandardMaterial({ color: '#c4bfb3', map: featherMap, roughness: 0.9, side: THREE.DoubleSide }));
  const ivoryFeather = material(new THREE.MeshStandardMaterial({ color: '#e7e2d4', map: featherMap, roughness: 0.9, side: THREE.DoubleSide }));
  const rachisMat = material(new THREE.MeshStandardMaterial({ color: '#d8cfb8', roughness: 0.72 }));

  // Catmull-Rom ring interpolation preserves one continuous body surface.
  function sampleRings(rings: Ring[], y: number): Ring {
    const i = Math.max(0, Math.min(rings.length - 2, rings.findIndex((r, k) => k < rings.length - 1 && y <= rings[k + 1].y)));
    const a = rings[Math.max(0, i - 1)], b = rings[i], c = rings[i + 1], d = rings[Math.min(rings.length - 1, i + 2)];
    const t = THREE.MathUtils.clamp((y - b.y) / (c.y - b.y), 0, 1);
    const f = (key: 'rx' | 'rz' | 'z') => {
      const p0 = a[key], p1 = b[key], p2 = c[key], p3 = d[key];
      return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
    };
    return { y, rx: Math.max(0.0003, f('rx')), rz: Math.max(0.0003, f('rz')), z: f('z') };
  }

  function loft(rings: Ring[], radial = 48, rows = 44) {
    const positions: number[] = [], uv: number[] = [], indices: number[] = [];
    const y0 = rings[0].y, y1 = rings[rings.length - 1].y;
    for (let j = 0; j <= rows; j++) {
      const r = sampleRings(rings, THREE.MathUtils.lerp(y0, y1, j / rows));
      for (let i = 0; i <= radial; i++) {
        const a = i / radial * TAU;
        positions.push(r.rx * Math.cos(a), r.y, r.z + r.rz * Math.sin(a));
        uv.push(i / radial, j / rows);
        if (j < rows && i < radial) {
          const k = j * (radial + 1) + i;
          indices.push(k, k + radial + 2, k + 1, k, k + radial + 1, k + radial + 2);
        }
      }
    }
    const g = geometry(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(indices); g.computeVertexNormals();
    return g;
  }

  // A gently cambered, irregular feather blade, measured in normalized units.
  function featherGeometry() {
    const pos: number[] = [], uv: number[] = [], ix: number[] = [];
    const rows = 11, cols = 6;
    for (let j = 0; j <= rows; j++) {
      const t = j / rows;
      const width = Math.pow(Math.sin(Math.PI * (0.06 + t * 0.94)), 0.7) * (0.91 + 0.09 * Math.cos(t * 13));
      for (let i = 0; i <= cols; i++) {
        const s = i / cols * 2 - 1;
        pos.push(s * width * 0.5, -t, 0.055 * (1 - s * s) * Math.sin(Math.PI * t) + 0.08 * t * t);
        uv.push(i / cols, 1 - t);
        if (j < rows && i < cols) {
          const k = j * (cols + 1) + i;
          ix.push(k, k + cols + 1, k + 1, k + 1, k + cols + 1, k + cols + 2);
        }
      }
    }
    const g = geometry(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeVertexNormals();
    return g;
  }
  const featherGeo = featherGeometry();

  function featherCoat(parent: THREE.Object3D, rings: Ring[], count: number, minY: number, maxY: number, length: number, width: number, mat: THREE.Material, name: string, skip?: (angle: number, y: number) => boolean) {
    const instances = new THREE.InstancedMesh(featherGeo, mat, count);
    instances.name = name; instances.castShadow = true; instances.receiveShadow = true;
    const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion();
    const up = V(), normal = V(), right = V(), theta = V(), tangent = V();
    const gold = Math.PI * (3 - Math.sqrt(5));
    let kept = 0;
    for (let i = 0; i < count; i++) {
      const y = THREE.MathUtils.lerp(minY, maxY, (i + 0.4) / count);
      const a = i * gold + (rand() - 0.5) * 0.17;
      if (skip?.(a, y)) continue;
      const ring = sampleRings(rings, y), lo = sampleRings(rings, y - 0.001), hi = sampleRings(rings, y + 0.001);
      theta.set(-ring.rx * Math.sin(a), 0, ring.rz * Math.cos(a));
      tangent.set((hi.rx - lo.rx) / 0.002 * Math.cos(a), 1, (hi.z - lo.z + (hi.rz - lo.rz) * Math.sin(a)) / 0.002);
      normal.crossVectors(tangent, theta).normalize();
      up.copy(tangent).normalize(); right.crossVectors(up, normal).normalize(); up.crossVectors(normal, right).normalize();
      rotation.setFromRotationMatrix(matrix.makeBasis(right, up, normal));
      const p = V(ring.rx * Math.cos(a), y, ring.z + ring.rz * Math.sin(a)).addScaledVector(normal, 0.0017 + rand() * 0.0018);
      const l = length * (0.75 + rand() * 0.46);
      matrix.compose(p, rotation, V(width * (0.8 + rand() * 0.35), l, l));
      instances.setMatrixAt(kept, matrix);
      const light = 0.81 + rand() * 0.29;
      instances.setColorAt(kept, new THREE.Color(light, light * (0.955 + rand() * 0.035), light * (0.9 + rand() * 0.06)));
      kept++;
    }
    instances.count = kept; instances.instanceMatrix.needsUpdate = true;
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
    instances.computeBoundingSphere(); parent.add(instances);
    return instances;
  }

  function tube(points: THREE.Vector3[], radius: number | ((t: number) => number), parent: THREE.Object3D, mat: THREE.Material, name: string, tubular = 32, radial = 9) {
    const curve = new THREE.CatmullRomCurve3(points);
    const frames = curve.computeFrenetFrames(tubular, false);
    const pos: number[] = [], uv: number[] = [], ix: number[] = [];
    for (let j = 0; j <= tubular; j++) {
      const t = j / tubular, p = curve.getPointAt(t), r = typeof radius === 'number' ? radius : radius(t);
      for (let i = 0; i <= radial; i++) {
        const a = i / radial * TAU;
        const q = p.clone().addScaledVector(frames.normals[j], Math.cos(a) * r).addScaledVector(frames.binormals[j], Math.sin(a) * r);
        pos.push(q.x, q.y, q.z); uv.push(i / radial, t);
        if (j < tubular && i < radial) {
          const k = j * (radial + 1) + i;
          ix.push(k, k + 1, k + radial + 1, k + 1, k + radial + 2, k + radial + 1);
        }
      }
    }
    const g = geometry(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeVertexNormals();
    return mesh(g, mat, parent, name);
  }

  function oval(parent: THREE.Object3D, position: THREE.Vector3, scale: THREE.Vector3, mat: THREE.Material, name: string) {
    const m = mesh(geometry(new THREE.SphereGeometry(1, 28, 20)), mat, parent, name);
    m.position.copy(position); m.scale.copy(scale); return m;
  }

  const bodyPitch = joint('body_pitch', root, V(0, 0.255, 0));
  const thorax = new THREE.Group(); thorax.name = 'Breathing plumage volume'; bodyPitch.add(thorax);
  // The belly reaches lower than in revision 01 so that only a short, stout
  // tarsus shows below the feathered thighs (artistic reading of "stout legs").
  const bodyRings: Ring[] = [
    { y: -0.066, rx: 0.014, rz: 0.018, z: -0.012 },
    { y: -0.052, rx: 0.062, rz: 0.068, z: -0.015 },
    { y: -0.020, rx: 0.104, rz: 0.112, z: -0.020 },
    { y: 0.020, rx: 0.132, rz: 0.141, z: -0.027 },
    { y: 0.070, rx: 0.148, rz: 0.160, z: -0.035 },
    { y: 0.120, rx: 0.152, rz: 0.164, z: -0.039 },
    { y: 0.177, rx: 0.138, rz: 0.148, z: -0.030 },
    { y: 0.226, rx: 0.104, rz: 0.112, z: -0.004 },
    { y: 0.259, rx: 0.060, rz: 0.067, z: 0.029 },
    { y: 0.272, rx: 0.007, rz: 0.009, z: 0.037 },
  ];
  mesh(loft(bodyRings, 64, 60), bodyUndercoat, thorax, 'Continuous pear-shaped torso');
  featherCoat(thorax, bodyRings, 1850, -0.056, 0.252, 0.047, 0.026, plumage, 'Layered contour plumage · 1850 feathers');

  const neckYaw = joint('neck_yaw', bodyPitch, V(0, 0.225, 0.060));
  const neckPitch = joint('neck_pitch', neckYaw, V());
  const neckRings: Ring[] = [
    { y: -0.018, rx: 0.054, rz: 0.060, z: -0.004 },
    { y: 0.020, rx: 0.061, rz: 0.061, z: 0.011 },
    { y: 0.063, rx: 0.049, rz: 0.049, z: 0.031 },
    { y: 0.105, rx: 0.038, rz: 0.040, z: 0.047 },
    { y: 0.146, rx: 0.034, rz: 0.037, z: 0.052 },
    { y: 0.156, rx: 0.009, rz: 0.014, z: 0.053 },
  ];
  mesh(loft(neckRings), neckUndercoat, neckPitch, 'Tapered rising neck');
  featherCoat(neckPitch, neckRings, 630, -0.007, 0.139, 0.022, 0.012, plumage, 'Fine neck feather tracts');

  const headYaw = joint('head_yaw', neckPitch, V(0, 0.142, 0.052));
  const headPitch = joint('head_pitch', headYaw, V());
  const skullRings: Ring[] = [
    { y: -0.026, rx: 0.011, rz: 0.017, z: 0.017 },
    { y: -0.010, rx: 0.033, rz: 0.039, z: 0.013 },
    { y: 0.018, rx: 0.047, rz: 0.053, z: 0.009 },
    { y: 0.044, rx: 0.042, rz: 0.047, z: 0.003 },
    { y: 0.066, rx: 0.027, rz: 0.030, z: -0.004 },
    { y: 0.074, rx: 0.003, rz: 0.005, z: -0.006 },
  ];
  // Revision 02: the front of the head is bare grey skin ("the head was grey
  // and naked"); feathers cover crown and nape only.
  mesh(loft(skullRings, 40, 32), faceSkin, headPitch, 'Small domed skull · bare grey face');
  featherCoat(headPitch, skullRings, 470, -0.014, 0.070, 0.012, 0.0068, plumage, 'Short crown and nape feathers', (angle, y) => Math.sin(angle) > -0.05 && y < 0.05 - Math.max(0, -Math.sin(angle)) * 0.1);

  // Bill revision 02. Evidence: upper bill nearly twice the cranium length,
  // hooked tip, nostrils elongated along the bill, green/black/yellow tones.
  // Artistic: exact profile, the swollen distal horn and the colour boundary.
  // Profile rows: [z, top, bottom, half-width] in metres, head_pitch frame.
  const UPPER_BILL = [
    [0.028, 0.046, -0.010, 0.031], [0.052, 0.043, -0.011, 0.030], [0.084, 0.036, -0.012, 0.026],
    [0.112, 0.032, -0.014, 0.0225], [0.138, 0.035, -0.017, 0.0235], [0.160, 0.037, -0.023, 0.0225],
    [0.176, 0.030, -0.034, 0.018], [0.186, 0.013, -0.047, 0.011], [0.190, -0.010, -0.056, 0.005],
    [0.1905, -0.046, -0.058, 0.0008],
  ];
  const LOWER_BILL = [
    [0.030, -0.008, -0.031, 0.027], [0.060, -0.011, -0.034, 0.025], [0.100, -0.014, -0.036, 0.0215],
    [0.134, -0.017, -0.038, 0.018], [0.157, -0.023, -0.041, 0.013], [0.170, -0.032, -0.045, 0.006],
    [0.1745, -0.039, -0.046, 0.0008],
  ];
  const catmull = (p0: number, p1: number, p2: number, p3: number, t: number) =>
    0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  function billRow(rows: number[][], u: number) {
    const f = THREE.MathUtils.clamp(u, 0, 1) * (rows.length - 1), n = Math.min(rows.length - 2, Math.floor(f)), t = f - n;
    const a = rows[Math.max(0, n - 1)], b = rows[n], c = rows[n + 1], d = rows[Math.min(rows.length - 1, n + 2)];
    return [0, 1, 2, 3].map(k => catmull(a[k], b[k], c[k], d[k], t));
  }
  // Cross-section: a keeled culmen on top, a flatter cutting edge (tomium)
  // below; the lower mandible gets a keel underneath.
  function billPoint(rows: number[][], u: number, a: number, lower: boolean, target = V()) {
    const [z, top, bottom, w] = billRow(rows, u), mid = (top + bottom) / 2, h = (top - bottom) / 2;
    const s = Math.sin(a), c = Math.cos(a);
    const sy = Math.sign(s) * Math.pow(Math.abs(s), lower ? (s < 0 ? 0.85 : 0.6) : (s < 0 ? 0.55 : 0.9));
    const keel = lower ? (s < 0 ? 1 - 0.28 * s * s : 1) : (s > 0 ? 1 - 0.38 * s * s : 1);
    return target.set(Math.sign(c) * Math.pow(Math.abs(c), 0.85) * w * keel, mid + h * sy, z);
  }
  function billGeometry(rows: number[][], lower: boolean, offsetZ: number) {
    const radial = 48, count = 72;
    const pos: number[] = [], uv: number[] = [], colors: number[] = [], ix: number[] = [];
    const black = new THREE.Color('#2f322c'), green = new THREE.Color('#77825a'), pale = new THREE.Color('#cfc98c'),
      yellow = new THREE.Color('#ddd08e'), hook = new THREE.Color('#9c8c5a'), edge = new THREE.Color('#3a3a30');
    const c = new THREE.Color(), p = V();
    for (let j = 0; j <= count; j++) {
      const u = j / count;
      for (let i = 0; i <= radial; i++) {
        const a = i / radial * TAU;
        billPoint(rows, u, a, lower, p);
        pos.push(p.x, p.y, p.z - offsetZ); uv.push(i / radial, u);
        // Dark proximal sheath, a fairly sharp boundary, then light green
        // mixed with pale yellow towards a slightly darker horn hook.
        const boundary = lower ? 0.34 : 0.42;
        c.copy(black).lerp(green, THREE.MathUtils.smoothstep(u, boundary - 0.07, boundary + 0.02))
          .lerp(pale, THREE.MathUtils.smoothstep(u, boundary + 0.02, boundary + 0.22))
          .lerp(yellow, THREE.MathUtils.smoothstep(u, 0.66, 0.84))
          .lerp(hook, THREE.MathUtils.smoothstep(u, 0.9, 1));
        const sa = Math.sin(a);
        if (!lower && sa < -0.35) c.lerp(edge, THREE.MathUtils.smoothstep(-sa, 0.35, 0.95) * 0.55);
        c.multiplyScalar(0.96 + Math.sin(a * 5 + u * 31) * 0.03);
        colors.push(c.r, c.g, c.b);
        if (j < count && i < radial) {
          const k = j * (radial + 1) + i; ix.push(k, k + 1, k + radial + 1, k + 1, k + radial + 2, k + radial + 1);
        }
      }
    }
    const g = geometry(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); g.setIndex(ix); g.computeVertexNormals();
    return g;
  }
  mesh(billGeometry(UPPER_BILL, false, 0), keratin, headPitch, 'Massive hooked upper bill · horn sheath');
  const beakJoint = joint('beak', headPitch, V(0, 0, 0.043));
  mesh(billGeometry(LOWER_BILL, true, 0.043), keratin, beakJoint, 'Articulated lower mandible');
  oval(beakJoint, V(0, -0.0135, 0.058), V(0.019, 0.0042, 0.056), mouthMat, 'Inner lower bill');
  const tongueMat = material(new THREE.MeshStandardMaterial({ color: '#776556', roughness: 0.9 }));
  oval(beakJoint, V(0, -0.0112, 0.047), V(0.011, 0.003, 0.035), tongueMat, 'Tongue');
  const outward = (q: THREE.Vector3, side: number, d: number) => q.set(q.x + side * d, q.y, q.z);
  for (const side of [-1, 1]) {
    const edgeAngle = side > 0 ? -0.34 : Math.PI + 0.34;
    // The gape runs back below the eye; the long nostril slit sits mid-bill.
    const gape = [0.02, 0.18, 0.36, 0.54, 0.7].map(u => outward(billPoint(UPPER_BILL, u, edgeAngle, false), side, 0.0004));
    gape.unshift(V(side * 0.036, -0.004, 0.028));
    tube(gape, t => 0.0013 * (1 - t * 0.35), headPitch, mouthMat, 'Bill commissure', 30, 6);
    const nostrilAngle = side > 0 ? 0.62 : Math.PI - 0.62;
    const slit = [0.2, 0.27, 0.34, 0.41].map(u => outward(billPoint(UPPER_BILL, u, nostrilAngle, false), side, 0.0005));
    tube(slit, t => 0.0017 * Math.sin(Math.PI * (0.12 + 0.76 * t)), headPitch, mouthMat, 'Elongated slit nostril', 16, 6);
  }

  const eyeGroups: THREE.Group[] = [];
  const eyelids: { geometry: THREE.BufferGeometry; upper: boolean }[] = [];
  const irisMat = material(new THREE.MeshStandardMaterial({ color: '#604625', roughness: 0.27, metalness: 0.03 }));
  const pupilMat = material(new THREE.MeshPhysicalMaterial({ color: '#10110e', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08 }));
  const eyeWhiteMat = material(new THREE.MeshStandardMaterial({ color: '#312f21', roughness: 0.23 }));
  const glintMat = material(new THREE.MeshBasicMaterial({ color: '#fcf8e6' }));
  for (const side of [-1, 1]) {
    const patch = oval(headPitch, V(side * 0.041, 0.031, 0.03), V(0.007, 0.019, 0.024), skin, 'Bare orbital skin');
    patch.rotation.y = side * -0.31;
    const eye = new THREE.Group(); eye.name = side < 0 ? 'Left eye' : 'Right eye';
    eye.position.set(side * 0.0445, 0.036, 0.037);
    eye.quaternion.setFromUnitVectors(V(0, 0, 1), V(side * 0.89, 0.06, 0.46).normalize());
    headPitch.add(eye);
    const rim = mesh(geometry(new THREE.TorusGeometry(0.0081, 0.00135, 8, 32)), eyeRim, eye, 'Orbital eyelid rim'); rim.position.z = 0.0002;
    const globe = new THREE.Group(); globe.name = 'Gaze'; eye.add(globe); eyeGroups.push(globe);
    oval(globe, V(0, 0, 0), V(0.0075, 0.0075, 0.0069), eyeWhiteMat, 'Dark eye globe');
    const iris = mesh(geometry(new THREE.CircleGeometry(0.0047, 32)), irisMat, globe, 'Amber-brown iris'); iris.position.z = 0.00685;
    const pupil = mesh(geometry(new THREE.CircleGeometry(0.00315, 32)), pupilMat, globe, 'Round pupil'); pupil.position.z = 0.00696;
    const glint = mesh(geometry(new THREE.CircleGeometry(0.00072, 12)), glintMat, globe, 'Small corneal catchlight'); glint.position.set(-0.0014, 0.0018, 0.00704); glint.castShadow = false;
    for (const upper of [true, false]) {
      const pos: number[] = [], ids: number[] = [];
      const columns = 22;
      for (let i = 0; i <= columns; i++) {
        const x = (i / columns * 2 - 1) * 0.0081;
        const y = Math.sqrt(Math.max(0, 0.0081 ** 2 - x * x)) * (upper ? 1 : -1);
        pos.push(x, y, 0.00765, x, y, 0.00767);
        if (i < columns) { const k = i * 2; ids.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
      }
      const g = geometry(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(ids); g.computeVertexNormals();
      const lid = mesh(g, skin, eye, upper ? 'Upper eyelid' : 'Lower eyelid');
      lid.material = material(skin.clone()); (lid.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
      lid.castShadow = false; eyelids.push({ geometry: g, upper });
    }
  }

  // Instanced feathers placed by position, pointing direction and outward
  // normal. The blade extends along `dir`; its camber faces `normal`.
  type FeatherSpec = { p: THREE.Vector3; dir: THREE.Vector3; normal: THREE.Vector3; w: number; l: number; shade?: number };
  function featherBatch(parent: THREE.Object3D, mat: THREE.Material, items: FeatherSpec[], name: string) {
    const inst = new THREE.InstancedMesh(featherGeo, mat, items.length);
    inst.name = name; inst.castShadow = true; inst.receiveShadow = true;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = V(), n = V(), right = V(), c = new THREE.Color();
    items.forEach((f, i) => {
      up.copy(f.dir).negate().normalize();
      n.copy(f.normal).addScaledVector(up, -f.normal.dot(up)).normalize();
      right.crossVectors(up, n).normalize();
      q.setFromRotationMatrix(m.makeBasis(right, up, n));
      m.compose(f.p, q, V(f.w, f.l, f.l));
      inst.setMatrixAt(i, m);
      const light = f.shade ?? (0.84 + rand() * 0.24);
      inst.setColorAt(i, c.setRGB(light, light * (0.955 + rand() * 0.035), light * (0.9 + rand() * 0.06)));
    });
    inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.computeBoundingSphere(); parent.add(inst);
    return inst;
  }

  // Wings revision 02. Evidence: small wings, lighter primary feathers; bone
  // scars suggest they were not fully vestigial. Artistic: a folded teardrop
  // lying along the flank, shingled coverts and a short fan of soft primaries,
  // replacing the round shoulder patch of revision 01.
  for (const side of [-1, 1]) {
    const wing = joint(side < 0 ? 'wing_left' : 'wing_right', bodyPitch, V(side * 0.134, 0.172, 0.015));
    // Lies on top of the flank plumage (≈12 mm thick), top edge tucked inward.
    const spine = (s: number) => V(side * (0.028 + 0.012 * s), 0.004 - 0.074 * s, 0.012 - 0.098 * s);
    const tangent = V(side * 0.012, -0.074, -0.098).normalize();
    const chord = V(side * -0.26, 1, 0.24).normalize();
    const out = V().crossVectors(chord, tangent).normalize(); if (out.x * side < 0) out.negate();
    const halfChord = (s: number) => 0.031 * Math.pow(1 - s * 0.72, 0.8);
    const coverts: FeatherSpec[] = [], primaries: FeatherSpec[] = [];
    for (let row = 0; row < 6; row++) {
      const across = 1 - row / 5 * 2, count = 8 - Math.floor(row / 2);
      for (let k = 0; k < count; k++) {
        const s = 0.04 + (k + (row % 2) * 0.5) / count * 0.74;
        const p = spine(s).addScaledVector(chord, halfChord(s) * across).addScaledVector(out, 0.0015 + row * 0.0011);
        const dir = V().copy(tangent).multiplyScalar(0.86).addScaledVector(chord, -0.42 - row * 0.03).normalize();
        coverts.push({ p, dir, normal: out, w: 0.018 + rand() * 0.004, l: 0.028 + row * 0.005 + s * 0.014 + rand() * 0.004, shade: 0.86 + rand() * 0.14 - row * 0.02 });
      }
    }
    // A fan of seven soft primaries emerges from under the coverts.
    for (let i = 0; i < 7; i++) {
      const s = 0.42 + i * 0.07;
      const p = spine(s).addScaledVector(chord, -halfChord(s) * (0.7 - i * 0.1)).addScaledVector(out, -0.0005 + i * 0.0004);
      const dir = V().copy(tangent).addScaledVector(chord, -0.95 + i * 0.16).addScaledVector(out, -0.05).normalize();
      primaries.push({ p, dir, normal: out, w: 0.017 + rand() * 0.003, l: 0.062 + i * 0.006 + rand() * 0.006, shade: 1.02 + rand() * 0.1 });
    }
    featherBatch(wing, wingPlumage, coverts, 'Shingled wing coverts');
    featherBatch(wing, lightPlumage, primaries, 'Soft lighter primaries');
  }

  // Tail revision 02. Evidence: a tuft of curly, light feathers high on the
  // rear. Artistic: count, curl radius and exact tone. Each plume is a curling
  // rachis carrying soft instanced barbs, replacing the flat ribbons of rev. 01.
  const tail = new THREE.Group(); tail.name = 'Curly light tail tuft'; thorax.add(tail);
  const barbs: FeatherSpec[] = [];
  const upAxis = V(0, 1, 0);
  for (let i = 0; i < 22; i++) {
    const yaw = (i / 21 - 0.5) * 1.5 + (rand() - 0.5) * 0.18;
    const back = V(Math.sin(yaw) * 0.6, 0, -1).normalize();
    const p = V(Math.sin(yaw) * 0.034, 0.172 + rand() * 0.034, -0.148 - Math.cos(yaw) * 0.012 - rand() * 0.008);
    const points = [p.clone()];
    const steps = 14, length = 0.08 + rand() * 0.055, ds = length / steps, curl = 13 + rand() * 9;
    let angle = 1.0 + rand() * 0.4;
    for (let j = 0; j < steps; j++) {
      angle += curl * (0.35 + j / steps * 1.7) * ds;
      p.addScaledVector(back, Math.cos(angle) * ds).addScaledVector(upAxis, Math.sin(angle) * ds);
      p.x += (rand() - 0.5) * 0.002;
      points.push(p.clone());
    }
    tube(points, t => 0.0009 * (1 - t * 0.7), tail, rachisMat, 'Curled tail rachis', 28, 5);
    for (let j = 1; j < points.length; j++) {
      const t = j / (points.length - 1), dirAlong = V().subVectors(points[j], points[j - 1]).normalize();
      const lateral = V().crossVectors(dirAlong, back).normalize();
      if (lateral.lengthSq() < 0.5) lateral.set(1, 0, 0);
      const normal = V().crossVectors(lateral, dirAlong).normalize();
      for (const s of [-1, 1]) {
        const dir = V().copy(lateral).multiplyScalar(s).addScaledVector(dirAlong, 0.75).addScaledVector(normal, (rand() - 0.5) * 0.6).normalize();
        barbs.push({ p: points[j].clone(), dir, normal, w: 0.0065 + rand() * 0.003, l: (0.02 + rand() * 0.008) * (1 - t * 0.45), shade: 0.9 + rand() * 0.14 });
      }
    }
  }
  featherBatch(tail, ivoryFeather, barbs, 'Soft tail barbs');

  // Legs revision 02. Evidence: stout, yellowish legs with black claws; leg
  // bones more robust than in living pigeons. Artistic: a feathered thigh
  // reaching low and a short, thick bare tarsus. Feet stay planted.
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.name = side < 0 ? 'Left planted leg' : 'Right planted leg'; root.add(leg);
    const x = side * 0.067;
    const thigh = new THREE.Group(); thigh.name = 'Feathered thigh'; thigh.position.x = x; leg.add(thigh);
    const thighRings: Ring[] = [
      { y: 0.160, rx: 0.006, rz: 0.008, z: 0.010 },
      { y: 0.168, rx: 0.027, rz: 0.029, z: 0.010 },
      { y: 0.192, rx: 0.035, rz: 0.037, z: 0.003 },
      { y: 0.224, rx: 0.037, rz: 0.041, z: -0.008 },
      { y: 0.256, rx: 0.030, rz: 0.034, z: -0.018 },
      { y: 0.272, rx: 0.010, rz: 0.012, z: -0.020 },
    ];
    mesh(loft(thighRings, 32, 24), bodyUndercoat, thigh, 'Feathered thigh volume');
    featherCoat(thigh, thighRings, 300, 0.163, 0.258, 0.026, 0.015, plumage, 'Thigh feathers');
    tube([V(x, 0.19, 0.0), V(x * 1.02, 0.145, 0.01), V(x * 1.04, 0.09, 0.024), V(x * 1.05, 0.048, 0.043), V(x * 1.05, 0.03, 0.057)],
      t => 0.0205 - t * 0.0035 + Math.sin(t * Math.PI) * 0.0012, leg, legMat, 'Stout scaly tarsometatarsus', 42, 16);
    oval(leg, V(x * 1.05, 0.017, 0.063), V(0.031, 0.017, 0.034), legMat, 'Weight-bearing foot pad');
    for (let toe = -1; toe <= 1; toe++) {
      const spread = toe * 0.037, length = toe === 0 ? 0.1 : 0.077;
      const base = V(x * 1.05 + toe * 0.011, 0.024, 0.068);
      const tip = V(x * 1.05 + spread, 0.011, 0.068 + length);
      tube([base, V(base.x + spread * 0.36, 0.025, 0.094), V(tip.x - spread * 0.16, 0.016, tip.z - 0.024), tip], t => 0.0115 * (1 - t * 0.42), leg, legMat, 'Front toe · articulated phalanges', 24, 10);
      tube([V(tip.x, 0.013, tip.z - 0.003), V(tip.x + spread * 0.09, 0.013, tip.z + 0.011), V(tip.x + spread * 0.14, 0.003, tip.z + 0.023)], t => 0.0068 * (1 - t * 0.95), leg, clawMat, 'Black curved claw', 13, 8);
    }
    const backTip = V(x * 1.05 - side * 0.010, 0.011, -0.024);
    tube([V(x * 1.05 - side * 0.008, 0.027, 0.052), V(x * 1.05 - side * 0.014, 0.018, 0.010), backTip], t => 0.0098 - t * 0.0038, leg, legMat, 'Rear supporting hallux', 22, 10);
    tube([backTip, V(backTip.x, 0.012, -0.036), V(backTip.x, 0.003, -0.048)], t => 0.0058 * (1 - t * 0.95), leg, clawMat, 'Black rear claw', 12, 8);
  }

  const skeleton = new THREE.Group(); skeleton.name = 'Mechanical skeleton overlay'; skeleton.visible = false; root.add(skeleton);
  const skeletonMaterial = material(new THREE.LineBasicMaterial({ color: '#ffbf77', transparent: true, opacity: 0.86, depthTest: false, depthWrite: false }));
  const nodeMaterial = material(new THREE.MeshBasicMaterial({ color: '#ffe5ac', transparent: true, opacity: 0.98, depthTest: false, depthWrite: false }));
  const anchor = (object: THREE.Object3D, point = V()): Anchor => ({ object, point });
  const hip = anchor(bodyPitch), neck = anchor(neckPitch), head = anchor(headPitch), jaw = anchor(beakJoint);
  const wingL = anchor(joints.wing_left), wingR = anchor(joints.wing_right);
  const anchors: Anchor[] = [hip, neck, head, jaw, wingL, wingR,
    anchor(joints.wing_left, V(-0.028, -0.070, -0.086)), anchor(joints.wing_right, V(0.028, -0.070, -0.086)),
    anchor(root, V(-0.067, 0.185, 0.002)), anchor(root, V(-0.070, 0.03, 0.057)),
    anchor(root, V(0.067, 0.185, 0.002)), anchor(root, V(0.070, 0.03, 0.057)),
    anchor(beakJoint, V(0, -0.023, 0.114)), anchor(bodyPitch, V(0, 0.174, -0.164)),
  ];
  const connections = [[0,1],[1,2],[2,3],[3,12],[1,4],[4,6],[1,5],[5,7],[0,8],[8,9],[0,10],[10,11],[0,13]];
  const skeletonGeometry = geometry(new THREE.BufferGeometry());
  skeletonGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(connections.length * 6), 3));
  const bones = new THREE.LineSegments(skeletonGeometry, skeletonMaterial); bones.frustumCulled = false; bones.renderOrder = 50; skeleton.add(bones);
  const nodes = new THREE.InstancedMesh(geometry(new THREE.SphereGeometry(0.0045, 12, 8)), nodeMaterial, anchors.length); nodes.frustumCulled = false; nodes.renderOrder = 51; skeleton.add(nodes);
  const anchorPoints = anchors.map(() => V()), markerMatrix = new THREE.Matrix4(), inverseRoot = new THREE.Matrix4();

  const restTransforms: Record<string, { position: number[]; rotation: number[]; quaternion: number[]; axis: string }> = {};
  for (const [name, object] of Object.entries(joints)) {
    const axis = name.includes('yaw') ? 'Y' : name.startsWith('wing') ? 'Z' : 'X';
    const rest = { position: object.position.toArray(), rotation: [object.rotation.x, object.rotation.y, object.rotation.z], quaternion: object.quaternion.toArray(), axis };
    restTransforms[name] = rest; object.userData.rest = rest; object.userData.axis = axis;
  }
  root.userData.dodo = {
    originalProceduralAsset: true, species: 'Raphus cucullatus', units: 'metres',
    up: '+Y', forward: '+Z', neutralHeight: 0.70, floorY: 0, restTransforms,
    description: 'Museum-style artistic anatomical reconstruction; joint ranges are exhibit controls, not measured dodo biomechanics.',
  };

  function updateVisuals(state: DodoVisualState = {}) {
    const blink = THREE.MathUtils.clamp(state.blink ?? 0, 0, 1);
    const breath = THREE.MathUtils.clamp(state.breath ?? 0.5, 0, 1) - 0.5;
    thorax.scale.set(1 + breath * 0.018, 1 + breath * 0.008, 1 + breath * 0.023);
    for (const lid of eyelids) {
      const attr = lid.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < attr.count; i += 2) {
        const outer = attr.getY(i);
        attr.setY(i + 1, outer * (1 - blink));
      }
      attr.needsUpdate = true;
      lid.geometry.computeVertexNormals();
    }
    for (const eye of eyeGroups) {
      eye.position.x = THREE.MathUtils.clamp(state.gazeX ?? 0, -1, 1) * 0.00125;
      eye.position.y = THREE.MathUtils.clamp(state.gazeY ?? 0, -1, 1) * 0.0010;
    }
    if (skeleton.visible) {
      root.updateMatrixWorld(true); inverseRoot.copy(root.matrixWorld).invert();
      for (let i = 0; i < anchors.length; i++) {
        const a = anchors[i]; anchorPoints[i].copy(a.point).applyMatrix4(a.object.matrixWorld).applyMatrix4(inverseRoot);
        markerMatrix.makeTranslation(anchorPoints[i].x, anchorPoints[i].y, anchorPoints[i].z); nodes.setMatrixAt(i, markerMatrix);
      }
      const p = skeletonGeometry.getAttribute('position') as THREE.BufferAttribute;
      connections.forEach(([a, b], i) => {
        p.setXYZ(i * 2, anchorPoints[a].x, anchorPoints[a].y, anchorPoints[a].z);
        p.setXYZ(i * 2 + 1, anchorPoints[b].x, anchorPoints[b].y, anchorPoints[b].z);
      });
      p.needsUpdate = true; nodes.instanceMatrix.needsUpdate = true;
    }
  }
  updateVisuals({ blink: 0, breath: 0.5 });

  return {
    root, joints, skeleton, updateVisuals,
    dispose() {
      root.traverse(object => { if (object instanceof THREE.InstancedMesh) object.dispose(); });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      root.removeFromParent();
    },
  };
}

export default createDodo;
