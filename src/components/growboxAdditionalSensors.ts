import * as THREE from 'three';
import { hotspots } from './growboxModelConfig';

// Hardware-shaped examples. Actual dimensions depend on the selected hardware.
export function createAdditionalSensors(scene: THREE.Scene) {
  const sensors = new Map<number, THREE.Group>();
  function sensor(index: number, name: string) {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(...hotspots[index].point);
    scene.add(group);
    sensors.set(index, group);
    return group;
  }
  function part(group: THREE.Group, geometry: THREE.BufferGeometry, color: string, position: [number, number, number]) {
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.45 }));
    mesh.position.set(...position);
    group.add(mesh);
    return mesh;
  }

  const probe = sensor(8, 'Kapazitive Substratsonde');
  // A wall-mounted bracket carries the probe even when the cultivation tray is hidden.
  part(probe, new THREE.BoxGeometry(0.004, 0.027, 0.022), '#737e75', [-0.023, 0.016, -0.002]);
  part(probe, new THREE.BoxGeometry(0.025, 0.004, 0.022), '#737e75', [-0.012, 0.005, -0.002]);
  part(probe, new THREE.BoxGeometry(0.020, 0.007, 0.006), '#444f46', [0, 0.008, -0.002]);
  for (const y of [0.009, 0.024]) {
    const screw = part(probe, new THREE.CylinderGeometry(0.002, 0.002, 0.002, 12), '#c4cbc6', [-0.020, y, -0.002]);
    screw.rotation.z = Math.PI / 2;
  }
  const outline = new THREE.Shape();
  outline.moveTo(-0.008, 0.028);
  outline.lineTo(0.008, 0.028);
  outline.lineTo(0.008, -0.017);
  outline.lineTo(0, -0.03);
  outline.lineTo(-0.008, -0.017);
  outline.closePath();
  part(probe, new THREE.ExtrudeGeometry(outline, { depth: 0.002, bevelEnabled: false }), '#253b2d', [0, 0, 0]);
  // Coated sensing area, electronics above the substrate, and a three-pin socket.
  part(probe, new THREE.BoxGeometry(0.011, 0.027, 0.0005), '#b59d50', [0, -0.003, 0.0024]);
  part(probe, new THREE.BoxGeometry(0.007, 0.006, 0.003), '#22252a', [0, 0.019, 0.003]);
  part(probe, new THREE.BoxGeometry(0.013, 0.005, 0.005), '#eee8da', [0, 0.028, 0.002]);
  for (const x of [-0.004, 0, 0.004]) {
    part(probe, new THREE.BoxGeometry(0.001, 0.004, 0.001), '#c8ab56', [x, 0.032, 0.002]);
  }

  const level = sensor(9, 'Wasserstand Schwimmschalter');
  part(level, new THREE.CylinderGeometry(0.0025, 0.0025, 0.041, 16), '#e5e3d6', [0, 0.007, 0]);
  part(level, new THREE.CylinderGeometry(0.011, 0.011, 0.014, 24), '#faf6e9', [0, 0, 0]);
  part(level, new THREE.CylinderGeometry(0.008, 0.008, 0.004, 6), '#b4b9b3', [0, 0.028, 0]);
  part(level, new THREE.BoxGeometry(0.002, 0.024, 0.002), '#323532', [0.003, 0.042, 0]);

  const particles = sensor(10, 'PMS5003 Beispielmodul');
  // The mounting plate meets the module's underside; standoffs reach into the roof.
  part(particles, new THREE.BoxGeometry(0.058, 0.004, 0.046), '#566259', [0, -0.0125, 0]);
  for (const x of [-0.021, 0.021]) {
    part(particles, new THREE.CylinderGeometry(0.003, 0.003, 0.024, 16), '#89958c', [x, -0.0265, 0]);
    part(particles, new THREE.CylinderGeometry(0.0025, 0.0025, 0.002, 12), '#c6cec7', [x, -0.0095, 0.019]);
  }

  part(particles, new THREE.BoxGeometry(0.05, 0.021, 0.038), '#286c9a', [0, 0, 0]);
  part(particles, new THREE.BoxGeometry(0.047, 0.001, 0.035), '#bdc7cd', [0, 0.011, 0]);
  part(particles, new THREE.BoxGeometry(0.019, 0.012, 0.001), '#171f26', [-0.012, 0, 0.0195]);
  const inlet = part(particles, new THREE.CylinderGeometry(0.006, 0.006, 0.002, 24), '#111a21', [0.013, 0, 0.020]);
  inlet.rotation.x = Math.PI / 2;
  part(particles, new THREE.BoxGeometry(0.014, 0.006, 0.005), '#f0e9d8', [0.025, 0, 0.008]);

  return sensors;
}
