import * as THREE from 'three';

export function createCultivationPreview(scene: THREE.Scene) {
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);

  function mesh(geometry: THREE.BufferGeometry, color: string, opacity = 1) {
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color, transparent: opacity < 1, opacity, depthWrite: opacity === 1, roughness: 0.75,
    }));
  }

  const tray = mesh(new THREE.BoxGeometry(0.31, 0.048, 0.205), '#b4d7ce', 0.32);
  tray.position.set(0.18, 0.055, -0.15);
  tray.renderOrder = 1;
  group.add(tray);
  const substrate = mesh(new THREE.BoxGeometry(0.297, 0.035, 0.192), '#53402e');
  substrate.position.set(0.18, 0.051, -0.15);
  group.add(substrate);

  const strands: number[] = [];
  for (let segment = 0; segment < 28; segment++) {
    const x = 0.18 + (segment - 14) * 0.01;
    const y = 0.048 + Math.sin(segment * 2.4) * 0.009;
    strands.push(x, y, -0.053, x + 0.011, 0.056, -0.053);
    strands.push(x, y, -0.053, x - 0.006, y - 0.006, -0.053);
  }
  const strandGeometry = new THREE.BufferGeometry();
  strandGeometry.setAttribute('position', new THREE.Float32BufferAttribute(strands, 3));
  const mycelium = new THREE.LineSegments(strandGeometry, new THREE.LineBasicMaterial({ color: '#fff1cf' }));
  group.add(mycelium);

  const mushrooms = new THREE.Group();
  group.add(mushrooms);
  const plantingPositions = [
    [0.063, -0.104], [0.108, -0.112], [0.158, -0.101], [0.218, -0.109], [0.278, -0.103],
    [0.079, -0.155], [0.134, -0.166], [0.188, -0.151], [0.245, -0.165], [0.302, -0.155],
    [0.069, -0.215], [0.117, -0.214], [0.168, -0.221], [0.221, -0.218], [0.275, -0.219],
  ];
  for (const [index, [x, z]] of plantingPositions.entries()) {
    const mushroom = new THREE.Group();
    const height = 0.013 + (index % 4) * 0.003;
    const radius = 0.015 + ((index * 3) % 7) * 0.0012;
    const stem = mesh(new THREE.CylinderGeometry(radius * 0.34, radius * 0.43, height, 16), '#ede4d2');
    stem.position.y = height / 2;
    const profile = [
      [0, -0.24], [0.50, -0.23], [0.80, -0.16], [0.96, -0.02],
      [1, 0.22], [0.94, 0.48], [0.77, 0.72], [0.50, 0.89], [0.25, 0.96], [0, 0.98],
    ];
    const cap = mesh(new THREE.LatheGeometry(
      profile.map(([r, y]) => new THREE.Vector2(r * radius, y * radius)), 28,
    ), ['#f7efdf', '#e8dac1', '#fff7e8'][index % 3]);
    cap.position.y = height;
    mushroom.position.set(x, 0.069, z);
    mushroom.add(stem, cap);
    mushrooms.add(mushroom);
  }

  // Soft, overlapping billows replace hard square particles.
  const mistCanvas = document.createElement('canvas');
  mistCanvas.width = mistCanvas.height = 128;
  const context = mistCanvas.getContext('2d')!;
  for (const [x, y, radius, opacity] of [[64, 64, 60, 0.65], [45, 64, 34, 0.5], [76, 47, 35, 0.45], [78, 78, 36, 0.45]]) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(239,249,250,${opacity})`);
    gradient.addColorStop(0.48, `rgba(232,246,248,${opacity * 0.48})`);
    gradient.addColorStop(1, 'rgba(225,242,246,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const mistTexture = new THREE.CanvasTexture(mistCanvas);
  mistTexture.colorSpace = THREE.SRGBColorSpace;
  const mist = new THREE.Group();
  mist.visible = false;
  group.add(mist);
  const billows = Array.from({ length: 52 }, (_, index) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: mistTexture, transparent: true, depthWrite: false, rotation: index * 2.4,
    }));
    mist.add(sprite);
    return sprite;
  });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let phase = 0;
  let progress = 0;
  return {
    setPhase(next: number | null) {
      if (next !== null && !group.visible) progress = 0;
      group.visible = next !== null;
      phase = next ?? 0;
      if (!group.visible) mist.visible = false;
    },
    setMist(enabled: boolean) { mist.visible = enabled; },
    update(time: number, delta: number) {
      if (!group.visible) return;
      progress = reducedMotion.matches ? phase : THREE.MathUtils.lerp(progress, phase, 1 - Math.exp(-delta * 1.8));
      mycelium.geometry.setDrawRange(0, Math.floor(56 * Math.min(progress, 1)) * 2);
      const size = Math.max(0, (progress - 1.15) / 2.85);
      mushrooms.visible = size > 0.01;
      for (const mushroom of mushrooms.children) mushroom.scale.setScalar(size);
      if (!mist.visible) return;
      billows.forEach((sprite, index) => {
        const travel = ((reducedMotion.matches ? 0 : time / 2800) + index / billows.length) % 1;
        const spread = travel * 0.043;
        // The pipe lip is the left edge of object_2 in model coordinates.
        sprite.position.set(
          0.349 - travel * 0.244,
          0.205 - travel * travel * 0.105 + Math.sin(index * 2.8) * spread * 0.45,
          -0.142 + Math.cos(index * 3.7) * spread,
        );
        const width = 0.012 + travel * 0.079;
        sprite.scale.set(width, width * 0.68, 1);
        sprite.material.opacity = 0.24 * (1 - travel) * (0.72 + 0.28 * Math.sin(index * 1.7) ** 2);
      });
    },
    dispose() {
      group.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Points) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
      billows.forEach(sprite => sprite.material.dispose());
      mistTexture.dispose();
      group.removeFromParent();
    },
  };
}
