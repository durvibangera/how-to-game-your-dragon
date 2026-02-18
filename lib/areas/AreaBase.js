import * as THREE from "three";
import { ProceduralTextures } from "../utils/ProceduralTextures";

/**
 * Base class for all area environments.
 * Each area overrides populate() and update().
 * Enhanced with procedural textures and better materials.
 */
export class AreaBase {
  constructor(scene, areaIndex) {
    this.scene = scene;
    this.areaIndex = areaIndex;
    this.group = new THREE.Group();
    this.activated = false;
    this.baseZ = -areaIndex * 120;
    this._animatedObjects = [];
  }

  activate() {
    if (this.activated) return;
    this.activated = true;
    this.populate();
    this.scene.add(this.group);
  }

  populate() {}
  update(elapsed, delta, localProgress, isActive) {
    for (const obj of this._animatedObjects) {
      if (obj.type === 'float') {
        obj.mesh.position.y = obj.baseY + Math.sin(elapsed * obj.speed + obj.phase) * obj.amplitude;
      } else if (obj.type === 'rotate') {
        obj.mesh.rotation.y = elapsed * obj.speed;
      }
    }
  }

  createTextSprite(text, color = "#ffffff", size = 1) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.font = "bold 72px 'Georgia', serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 128);
    ctx.fillText(text, 512, 128);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size * 10, size * 2.5, 1);
    return sprite;
  }

  addGround(color, y = 0, size = 140, texture = null) {
    const geo = new THREE.PlaneGeometry(size, size, 20, 20);
    // Add terrain undulation
    const posAttr = geo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getY(i);
      const height = ProceduralTextures._fbm(x * 0.5 + 100, z * 0.5 + 100, 3, 2, 0.5) * 1.5;
      posAttr.setZ(i, height);
    }
    geo.computeVertexNormals();

    const bumpMap = ProceduralTextures.bumpTexture(256, 15);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      metalness: 0.05,
      map: texture || null,
      bumpMap: bumpMap,
      bumpScale: 0.3,
      envMapIntensity: 0.2,
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, y - this.areaIndex * 0.05, this.baseZ - 60);
    plane.receiveShadow = true;
    this.group.add(plane);
    return plane;
  }

  addLight(color, intensity, x, y, z) {
    const light = new THREE.PointLight(color, intensity, 50);
    light.position.set(x, y, this.baseZ + z);
    this.group.add(light);
    return light;
  }

  createSphere(radius, color, emissive = 0x000000) {
    const geo = new THREE.SphereGeometry(radius, 8, 8);
    const mat = new THREE.MeshStandardMaterial({
      color, emissive, emissiveIntensity: emissive ? 0.5 : 0, roughness: 0.6
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  createBox(w, h, d, color, emissive = 0x000000) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
      color, emissive, emissiveIntensity: emissive ? 0.3 : 0, roughness: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  createFlame(size = 0.4) {
    const g = new THREE.Group();
    const outerGeo = new THREE.SphereGeometry(size, 6, 6);
    outerGeo.scale(1, 1.6, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    g.add(new THREE.Mesh(outerGeo, outerMat));
    const innerGeo = new THREE.SphereGeometry(size * 0.5, 6, 6);
    innerGeo.scale(1, 1.4, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffdd44,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    g.add(new THREE.Mesh(innerGeo, innerMat));
    return g;
  }

  registerFloat(mesh, speed = 0.5, amplitude = 0.3, phase = 0) {
    this._animatedObjects.push({ type: 'float', mesh, baseY: mesh.position.y, speed, amplitude, phase });
  }

  registerRotate(mesh, speed = 0.3) {
    this._animatedObjects.push({ type: 'rotate', mesh, speed });
  }

  addGroundFog(color = 0x888888, opacity = 0.15, y = 0, count = 2) {
    for (let i = 0; i < count; i++) {
      const fogPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(60 + i * 20, 60 + i * 20),
        new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: opacity * (1 - i * 0.3),
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      fogPlane.rotation.x = -Math.PI / 2;
      fogPlane.position.set((Math.random() - 0.5) * 10, y + 0.1 + i * 0.5, this.baseZ - 50 - i * 10);
      this.group.add(fogPlane);
      this.registerFloat(fogPlane, 0.15 + i * 0.05, 0.2, i * 1.5);
    }
  }
}
