import * as THREE from "three";
import { MonthBase } from "./MonthBase";

/**
 * Month 6 - THE RED DEATH'S LAIR
 * Final dark approach, massive rock formations, ominous sky, foreboding.
 */
export class Month6 extends MonthBase {
  constructor(scene) {
    super(scene, 5);
    this.torches = [];
  }

  populate() {
    this.addGround(0x1a0a0a, -2, 180);
    this.addLight(0xff3300, 1.5, 0, 20, -50);
    this.addLight(0x441100, 1, 10, 10, -80);

    // Massive jagged rock pillars
    for (let i = 0; i < 14; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const h = 10 + Math.random() * 20;
      const rock = new THREE.Mesh(
        new THREE.ConeGeometry(2 + Math.random() * 3, h, 5),
        new THREE.MeshStandardMaterial({ color: 0x221111, roughness: 0.95 })
      );
      rock.position.set(
        side * (15 + Math.random() * 15),
        h / 2 - 2,
        this.baseZ - 5 - i * 8
      );
      this.group.add(rock);
    }

    // Skull decorations (spheres with eye holes)
    for (let i = 0; i < 4; i++) {
      const skull = this._createSkull();
      skull.position.set(
        (i % 2 === 0 ? -1 : 1) * 10,
        3,
        this.baseZ - 15 - i * 25
      );
      skull.scale.setScalar(1.5);
      this.group.add(skull);
    }

    // Flame torches along the path
    for (let i = 0; i < 8; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const torch = this._createTorch();
      torch.position.set(side * 8, -2, this.baseZ - 10 - i * 13);
      this.group.add(torch);
      this.torches.push(torch);
    }

    // Ominous red glow on horizon
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(30, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0xff1100, transparent: true, opacity: 0.2,
        side: THREE.BackSide, depthWrite: false
      })
    );
    glow.position.set(0, -5, this.baseZ - 90);
    this.group.add(glow);

    // Dark fog floor
    const fog = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshBasicMaterial({
        color: 0x110000, transparent: true, opacity: 0.4,
        depthWrite: false
      })
    );
    fog.rotation.x = -Math.PI / 2;
    fog.position.set(0, -1, this.baseZ - 55);
    this.group.add(fog);

    const text = this.createTextSprite("The Dragon's Lair", "#ff3300", 1.3);
    text.position.set(0, 14, this.baseZ - 30);
    this.group.add(text);
    this.floatText = text;
  }

  _createSkull() {
    const g = new THREE.Group();
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xccbb99, roughness: 0.8 })
    );
    g.add(head);
    // Eyes (dark insets)
    for (let s = -1; s <= 1; s += 2) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0x110000 })
      );
      eye.position.set(s * 0.4, 0.2, 1);
      g.add(eye);
    }
    // Jaw
    const jaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.3, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xbbaa88 })
    );
    jaw.position.set(0, -0.7, 0.6);
    g.add(jaw);
    return g;
  }

  _createTorch() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 5, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a2a10 })
    );
    pole.position.y = 2.5;
    g.add(pole);
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 6, 4),
      new THREE.MeshBasicMaterial({ color: 0xff4400 })
    );
    flame.position.y = 5.2;
    flame.name = "flame";
    g.add(flame);
    const light = new THREE.PointLight(0xff3300, 1.5, 15);
    light.position.y = 5.2;
    light.name = "torchLight";
    g.add(light);
    return g;
  }

  update(elapsed) {
    // Flicker torches
    for (let i = 0; i < this.torches.length; i++) {
      const flame = this.torches[i].getObjectByName("flame");
      const light = this.torches[i].getObjectByName("torchLight");
      if (flame) {
        const flicker = 0.3 + Math.random() * 0.15;
        flame.scale.setScalar(0.8 + Math.sin(elapsed * 8 + i * 2) * 0.3);
      }
      if (light) {
        light.intensity = 1.2 + Math.sin(elapsed * 6 + i * 3) * 0.5;
      }
    }
    if (this.floatText) this.floatText.position.y = 14 + Math.sin(elapsed * 0.5) * 0.3;
  }
}
