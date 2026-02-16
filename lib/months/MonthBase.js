import * as THREE from "three";

/**
 * Base class for all month environments.
 * Each month overrides populate() and update().
 * Performance optimized — no procedural textures.
 */
export class MonthBase {
  constructor(scene, monthIndex) {
    this.scene = scene;
    this.monthIndex = monthIndex;
    this.group = new THREE.Group();
    this.activated = false;
    this.baseZ = -monthIndex * 120;
  }

  activate() {
    if (this.activated) return;
    this.activated = true;
    this.populate();
    this.scene.add(this.group);
  }

  populate() {}
  update(elapsed, delta, localProgress, isActive) {}

  createTextSprite(text, color = "#ffffff", size = 1) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.font = "bold 40px 'Georgia', serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 64);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85 });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size * 8, size * 2, 1);
    return sprite;
  }

  addGround(color, y = 0, size = 140) {
    const geo = new THREE.PlaneGeometry(size, size);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.05 });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, y - this.monthIndex * 0.05, this.baseZ - 60);
    this.group.add(plane);
    return plane;
  }

  addLight(color, intensity, x, y, z) {
    const light = new THREE.PointLight(color, intensity, 80);
    light.position.set(x, y, this.baseZ + z);
    this.group.add(light);
    return light;
  }

  createSphere(radius, color, emissive = 0x000000) {
    const geo = new THREE.SphereGeometry(radius, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color, emissive, emissiveIntensity: emissive ? 0.5 : 0, roughness: 0.6
    });
    return new THREE.Mesh(geo, mat);
  }

  createBox(w, h, d, color, emissive = 0x000000) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color, emissive, emissiveIntensity: emissive ? 0.3 : 0, roughness: 0.7
    });
    return new THREE.Mesh(geo, mat);
  }
}
