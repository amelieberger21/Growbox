import { createAdditionalSensors } from './growboxAdditionalSensors';
import { createCultivationPreview } from './growboxCultivation';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { center, displayFrameName, doorAngle, doorParts, hinge, hotspots, modelUrl, overview, referenceNode, type Point } from './growboxModelConfig';

export async function mountGrowboxScene(host: HTMLElement, markers: HTMLElement[], signal: AbortSignal, onSelect: (index: number) => void) {
  const { scene: model } = await new GLTFLoader().loadAsync(modelUrl);
  const disposeModel = () => {
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials: THREE.Material[] = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
        material.dispose();
      }
    });
  };
  if (signal.aborted) {
    disposeModel();
    throw new Error('Ansicht geschlossen');
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (error) {
    disposeModel();
    throw error;
  }
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ffffff');
  const reference = model.getObjectByName(referenceNode);
  const normalized = new THREE.Group();
  if (reference) {
    reference.updateMatrix();
    normalized.applyMatrix4(reference.matrix.clone().invert());
  }
  normalized.add(model);
  scene.add(normalized);
  const door = new THREE.Group();
  door.position.set(...hinge);
  scene.add(door);
  const parts = doorParts.map(name => model.getObjectByName(name));
  const canOpen = parts.every(part => part !== undefined);
  if (canOpen) for (const part of parts) if (part) door.attach(part);
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials: THREE.Material[] = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (material instanceof THREE.MeshStandardMaterial && material.name === 'diffuse_0') {
        material.color.set('#414943');
      }
      if (material.name !== 'Glass') continue;
      material.transparent = true;
      material.opacity = 0.28;
      material.depthWrite = false;
      object.castShadow = false;
    }
  });

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 0.16 * 312 / 468),
    new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
  );
  logo.position.set(0.265, 0.083, 0.011);
  logo.visible = false;
  logo.renderOrder = 2;
  scene.add(logo);
  if (canOpen) door.attach(logo);
  const logoImage = new Image();
  logoImage.onload = () => {
    if (signal.aborted) return;
    const canvas = document.createElement('canvas');
    canvas.width = logoImage.naturalWidth;
    canvas.height = logoImage.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(logoImage, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    // Use the red ink as an opacity mask so the glass stays transparent.
    for (let index = 0; index < pixels.data.length; index += 4) {
      const [red, green, blue, alpha] = pixels.data.subarray(index, index + 4);
      pixels.data[index] = 224;
      pixels.data[index + 1] = 33;
      pixels.data[index + 2] = 23;
      pixels.data[index + 3] = alpha * Math.max(0, Math.min(1, (red - Math.max(green, blue)) / 185));
    }
    context.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    logo.material.map = texture;
    logo.material.needsUpdate = true;
    logo.visible = true;
  };
  if (scene.getObjectByName('object_39')) logoImage.src = import.meta.env.BASE_URL + 'models/hochschule-coburg.png';

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.14 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.006;
  ground.receiveShadow = true;
  scene.add(ground, new THREE.HemisphereLight('#eafff5', '#59685d', 2));
  const light = new THREE.DirectionalLight('#fff3df', 3);
  light.position.set(0.1, 1.3, 0.85);
  light.castShadow = true;
  light.shadow.camera.left = light.shadow.camera.bottom = -0.8;
  light.shadow.camera.right = light.shadow.camera.top = 0.8;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.bias = -0.0004;
  scene.add(light);
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 30);
  camera.position.set(...overview);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...center);
  controls.enableDamping = true;
  controls.minDistance = 0.18;
  controls.maxDistance = 2.4;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.update();

  const displayRenderer = new CSS3DRenderer();
  displayRenderer.domElement.className = 'growbox-display-layer';
  displayRenderer.domElement.hidden = true;
  host.append(displayRenderer.domElement);
  const displayScene = new THREE.Scene();
  const displaySurface = scene.getObjectByName('object_28');
  const displayBounds = displaySurface ? new THREE.Box3().setFromObject(displaySurface) : null;
  const displayCenter = new THREE.Vector3(0.352, 0.395, -0.131);
  let displayObject: CSS3DObject | undefined;
  const displayFacing = new THREE.Vector3();
  const viewDirection = new THREE.Vector3();

  function setDisplay(enabled: boolean) {
    if (enabled && displayBounds && !displayObject) {
      const iframe = document.createElement('iframe');
      iframe.name = displayFrameName;
      iframe.title = 'MycoBox-Prototyp auf dem Bildschirm';
      iframe.className = 'growbox-display-frame';
      iframe.src = import.meta.env.BASE_URL;
      iframe.style.width = '1024px';
      iframe.style.height = '624px';
      // Transform the screen surface, keeping the browsing context in a flat child.
      const surface = document.createElement('div');
      surface.style.width = '1024px';
      surface.style.height = '624px';
      surface.append(iframe);
      displayObject = new CSS3DObject(surface);
      displayObject.position.copy(displayCenter);
      displayObject.scale.setScalar(0.205 / 1024);
      displayScene.add(displayObject);
    } else if (!enabled && displayObject) {
      displayObject.removeFromParent();
      displayObject = undefined;
    }
    displayRenderer.domElement.hidden = !displayObject;
  }

  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(Math.PI / 9) / Math.min(camera.aspect, 1)));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    displayRenderer.setSize(width, height);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let angle = 0;
  let flight: { from: THREE.Vector3; fromTarget: THREE.Vector3; position: THREE.Vector3; target: THREE.Vector3; start: number } | undefined;
  const animateCameraTo = (position: Point, target: Point) => {
    flight = {
      from: camera.position.clone(), fromTarget: controls.target.clone(),
      position: new THREE.Vector3(...position), target: new THREE.Vector3(...target), start: performance.now(),
    };
  };
  controls.addEventListener('start', () => { flight = undefined; });
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: '#9da3a8', transparent: true, opacity: 0.18, depthWrite: false,
  });
  const shell = ['object_6', 'object_16', 'object_39', 'object_40', 'object_46', 'object_47', 'object_48', 'object_80']
    .map(name => scene.getObjectByName(name))
    .filter((object): object is THREE.Mesh => object instanceof THREE.Mesh)
    .map(mesh => ({ mesh, material: mesh.material, castShadow: mesh.castShadow }));

  const housingMaterial = new THREE.MeshStandardMaterial({
    color: '#202322', roughness: 0.55, side: THREE.DoubleSide,
  });
  const housing = shell.filter(({ mesh }) => mesh.name !== 'object_39');
  for (const { mesh } of housing) mesh.material = housingMaterial;

  // Illustrative modules sit at the same positions as their numbered hotspots.
  const modules = new THREE.Group();
  modules.visible = false;
  scene.add(modules);
  function block(color: string, size: Point, position: Point) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshStandardMaterial({ color }));
    mesh.position.set(...position);
    modules.add(mesh);
  }
  block('#673d99', [0.041, 0.031, 0.002], [0.3, 0.144, -0.277]);
  block('#1c2026', [0.012, 0.012, 0.004], [0.3, 0.149, -0.273]);
  for (let pin = 0; pin < 4; pin++) {
    const x = 0.291 + pin * 0.006;
    block('#dcb558', [0.004, 0.004, 0.001], [x, 0.133, -0.275]);
    block('#bdc3c9', [0.0015, 0.011, 0.0015], [x, 0.125, -0.274]);
  }
  const [co2X, co2Y, co2Z] = hotspots[2].point;
  block('#26684a', [0.002, 0.029, 0.048], [co2X - 0.007, co2Y, co2Z]);
  block('#252a30', [0.009, 0.022, 0.036], [co2X - 0.002, co2Y + 0.002, co2Z]);
  for (const offset of [-0.012, 0.01]) {
    block('#a6afb7', [0.002, 0.009, 0.009], [co2X + 0.004, co2Y + 0.003, co2Z + offset]);
  }

  const additionalSensors = createAdditionalSensors(scene);

  const tankWater = new THREE.Mesh(
    new THREE.BoxGeometry(0.072, 0.048, 0.17),
    new THREE.MeshStandardMaterial({
      color: '#169bd5', transparent: true, opacity: 0.78, depthWrite: false, roughness: 0.24,
    }),
  );
  tankWater.position.set(0.433, 0.071, -0.142);
  tankWater.visible = false;
  tankWater.renderOrder = 1;
  scene.add(tankWater);

  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: '#a63cff', transparent: true, opacity: 0.65, depthWrite: false,
  });
  const sensor = scene.getObjectByName('Sensor_Temperatur_Feuchte');
  const exhaust = scene.getObjectByName('object_15');
  const exhaustBounds = exhaust ? new THREE.Box3().setFromObject(exhaust) : null;
  const sensorBounds = sensor ? new THREE.Box3().setFromObject(sensor) : null;
  const highlights = hotspots.map(({ point }, index) => {
    const bounds = index === 0 || index === 3 ? sensorBounds : index === 6 ? exhaustBounds : index === 7 ? displayBounds : additionalSensors.has(index) ? new THREE.Box3().setFromObject(additionalSensors.get(index)!) : null;
    const size = bounds?.getSize(new THREE.Vector3()).multiplyScalar(1.2);
    const geometry = size
      ? new THREE.BoxGeometry(size.x, size.y, size.z)
      : new THREE.SphereGeometry(0.023, 20, 12);
    const mesh = new THREE.Mesh(geometry, highlightMaterial);
    mesh.position.copy(bounds?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3(...point));
    mesh.visible = false;
    mesh.renderOrder = 3;
    scene.add(mesh);
    return mesh;
  });
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let inspectionEnabled = true;
  let press: { x: number; y: number } | undefined;
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', event => {
    press = event.isPrimary && event.button === 0 ? { x: event.clientX, y: event.clientY } : undefined;
  }, { signal });
  canvas.addEventListener('pointercancel', () => { press = undefined; }, { signal });
  canvas.addEventListener('pointerup', event => {
    const start = press;
    press = undefined;
    if (!inspectionEnabled || !start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set(2 * (event.clientX - rect.left) / rect.width - 1, 1 - 2 * (event.clientY - rect.top) / rect.height);
    raycaster.setFromCamera(pointer, camera);
    const sensorHit = raycaster.intersectObjects([...additionalSensors.values()], true)[0];
    if (sensorHit) {
      const selected = [...additionalSensors].find(([, group]) => group === sensorHit.object.parent);
      if (selected) { onSelect(selected[0]); return; }
    }
    const hit = raycaster.intersectObjects(highlights, false)[0];
    if (hit) onSelect(highlights.findIndex(mesh => mesh === hit.object));
  }, { signal });

  const cultivation = createCultivationPreview(scene);
  // The luminous diffuser sits on the underside of the model's ceiling light (hotspot 6).
  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.245, 0.003, 0.018),
    new THREE.MeshStandardMaterial({
      color: '#f5fff4', emissive: '#e3ffe4', emissiveIntensity: 2.5, toneMapped: false,
    }),
  );
  ledStrip.position.set(hotspots[5].point[0], 0.258, hotspots[5].point[2]);
  ledStrip.visible = false;
  const ledLight = new THREE.SpotLight('#f0fff0', 0.32, 0.55, Math.PI * 0.38, 0.65, 2);
  ledLight.position.set(hotspots[5].point[0], 0.253, hotspots[5].point[2]);
  ledLight.target.position.set(0.18, 0.055, -0.15);
  ledLight.visible = false;
  scene.add(ledStrip, ledLight, ledLight.target);

  let previousFrame = 0;
  const projected = new THREE.Vector3();
  renderer.setAnimationLoop(time => {
    if (flight) {
      const progress = reduced.matches ? 1 : Math.min(1, (time - flight.start) / 600);
      const eased = progress * progress * (3 - 2 * progress);
      camera.position.lerpVectors(flight.from, flight.position, eased);
      controls.target.lerpVectors(flight.fromTarget, flight.target, eased);
      if (progress === 1) flight = undefined;
    }
    door.rotation.y += (angle - door.rotation.y) * (reduced.matches ? 1 : 0.13);
    controls.update();
    cultivation.update(time, Math.min(0.05, (time - previousFrame) / 1000));
    previousFrame = time;
    renderer.render(scene, camera);
    if (displayObject) {
      camera.getWorldDirection(viewDirection);
      displayFacing.subVectors(displayCenter, camera.position);
      displayObject.visible = camera.position.z > displayCenter.z && displayFacing.dot(viewDirection) > camera.near;
      displayRenderer.render(displayScene, camera);
    }
    hotspots.forEach(({ point }, index) => {
      projected.set(...(index === 7 ? [0.455, 0.459, -0.131] as Point : point)).project(camera);
      const marker = markers[index];
      if (!marker) return;
      marker.hidden = projected.z < -1 || projected.z > 1 || Math.abs(projected.x) > 0.95 || Math.abs(projected.y) > 0.92;
      marker.style.left = `${(projected.x + 1) * 50}%`;
      marker.style.top = `${(1 - projected.y) * 50}%`;
    });
  });

  return {
    canOpen,
    setInspectionEnabled(enabled: boolean) { inspectionEnabled = enabled; },
    setDisplay,
    setCultivationPhase(phase: number | null) {
      cultivation.setPhase(phase);
      ledStrip.visible = phase !== null;
      ledLight.visible = phase !== null;
    },
    setCultivationMist: cultivation.setMist,
    setTankPreview(filled: boolean) { tankWater.visible = filled; },
    setHousingColor(color: string) { housingMaterial.color.set(color); },
    setSensorMode(enabled: boolean) {
      modules.visible = enabled;
      for (const { mesh, material, castShadow } of shell) {
        mesh.material = enabled ? shellMaterial : mesh.name === 'object_39' ? material : housingMaterial;
        mesh.castShadow = !enabled && castShadow;
      }
      if (sensor) sensor.visible = !enabled;
    },
    highlight(index: number | null) {
      highlights.forEach((mesh, current) => { mesh.visible = current === index && current !== 7; });
    },
    setDoor(open: boolean) { angle = open ? doorAngle : 0; },
    animateCameraTo,
    dispose() {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      cultivation.dispose();
      ledStrip.geometry.dispose();
      ledStrip.material.dispose();
      ledLight.dispose();
      for (const { mesh, material } of shell) mesh.material = material;
      shellMaterial.dispose();
      housingMaterial.dispose();
      for (const object of modules.children) {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      }
      disposeModel();
      // Door meshes were reparented outside the imported scene.
      door.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials: THREE.Material[] = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => material.dispose());
        }
      });
      logoImage.onload = null;
      logo.material.map?.dispose();
      if (!canOpen) {
        logo.geometry.dispose();
        logo.material.dispose();
      }
      additionalSensors.forEach(group => group.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      }));
      highlights.forEach(mesh => mesh.geometry.dispose());
      highlightMaterial.dispose();
      tankWater.geometry.dispose();
      tankWater.material.dispose();
      setDisplay(false);
      displayRenderer.domElement.remove();
      ground.geometry.dispose();
      ground.material.dispose();
      light.shadow.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
