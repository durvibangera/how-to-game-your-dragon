import * as THREE from "three";
import { MonthBase } from "./MonthBase";

/**
 * Month 4 - CLOUD KINGDOM
 * High altitude soaring above the clouds, sun rays, freedom.
 */
export class Month4 extends MonthBase {
  constructor(scene) {
    super(scene, 3);
    this.clouds = [];
  }

  populate() {
    // No ground — we're above the clouds! Use a cloud floor
    this.addGround(0xddddee, -10, 180);
    this.addLight(0xffeedd, 2.5, 0, 30, -60);
    this.addLight(0xaaccff, 1, 10, 20, -40);

    // Cloud clusters (groups of white half-spheres)
    for (let i = 0; i < 20; i++) {
      const cloud = this._createCloud();
      cloud.position.set(
        (Math.random() - 0.5) * 60,
        -5 + Math.random() * 8,
        this.baseZ - Math.random() * 110
      );
      cloud.scale.setScalar(0.8 + Math.random() * 1.5);
      this.group.add(cloud);
      this.clouds.push(cloud);
    }

    // Sun (bright sphere high up)
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(5, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffee88 })
    );
    sun.position.set(20, 35, this.baseZ - 50);
    this.group.add(sun);

    // Sun rays (simple stretched planes with additive blend)
    for (let i = 0; i < 5; i++) {
      const ray = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 30),
        new THREE.MeshBasicMaterial({
          color: 0xffee66, transparent: true, opacity: 0.15,
          blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      ray.position.set(20 + (i - 2) * 3, 20, this.baseZ - 50);
      ray.rotation.z = (i - 2) * 0.15;
      this.group.add(ray);
    }

    // Floating rock islands (small)
    for (let i = 0; i < 4; i++) {
      const island = this._createFloatingIsland();
      island.position.set(
        (i % 2 === 0 ? -1 : 1) * (15 + Math.random() * 10),
        Math.random() * 5,
        this.baseZ - 20 - i * 25
      );
      this.group.add(island);
    }

    const text = this.createTextSprite("Cloud Kingdom", "#ffeedd", 1.2);
    text.position.set(0, 15, this.baseZ - 30);
    this.group.add(text);
    this.floatText = text;
  }

  _createCloud() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 1, emissive: 0x222233, emissiveIntensity: 0.1
    });
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < puffs; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(2 + Math.random() * 2, 6, 4),
        mat
      );
      puff.position.set(
        (Math.random() - 0.5) * 4,
        Math.random() * 1.5,
        (Math.random() - 0.5) * 3
      );
      puff.scale.y = 0.5;
      g.add(puff);
    }
    return g;
  }

  _createFloatingIsland() {
    const g = new THREE.Group();
    // Rock base
    const rock = new THREE.Mesh(
      new THREE.ConeGeometry(3, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0x665544, roughness: 0.9 })
    );
    rock.rotation.x = Math.PI;
    g.add(rock);
    // Grass top
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x44aa44 })
    );
    top.position.y = 0.25;
    g.add(top);
    return g;
  }

  update(elapsed) {
    // Gently float clouds
    for (let i = 0; i < this.clouds.length; i++) {
      this.clouds[i].position.y += Math.sin(elapsed * 0.3 + i) * 0.003;
    }
    if (this.floatText) this.floatText.position.y = 15 + Math.sin(elapsed * 0.5) * 0.3;
  }
}
