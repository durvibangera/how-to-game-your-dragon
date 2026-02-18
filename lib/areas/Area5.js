import * as THREE from "three";
import { AreaBase } from "./AreaBase";

/**
 * Area 5 - VOLCANIC NEST
 * Dark volcanic island, lava rivers, dragon nests, smoke.
 */
export class Area5 extends AreaBase {
  constructor(scene) {
    super(scene, 4);
    this.lavaPlanes = [];
  }

  populate() {
    this.addGround(0x2a1a0a, -2, 160);
    this.addLight(0xff6622, 2, 0, 15, -40);
    this.addLight(0xff4400, 1.5, -10, 10, -80);

    // Volcanic rock formations
    for (let i = 0; i < 10; i++) {
      const rock = new THREE.Mesh(
        new THREE.ConeGeometry(2 + Math.random() * 3, 6 + Math.random() * 8, 5),
        new THREE.MeshStandardMaterial({ color: 0x333322, roughness: 0.95 })
      );
      rock.position.set(
        (Math.random() - 0.5) * 50,
        -2,
        this.baseZ - Math.random() * 110
      );
      this.group.add(rock);
    }

    // Lava rivers (emissive orange planes)
    for (let i = 0; i < 4; i++) {
      const lava = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 20),
        new THREE.MeshStandardMaterial({
          color: 0xff4400, emissive: 0xff2200, emissiveIntensity: 1.5,
          roughness: 0.3
        })
      );
      lava.rotation.x = -Math.PI / 2;
      lava.position.set(
        (i % 2 === 0 ? -1 : 1) * (5 + i * 4),
        -1.8,
        this.baseZ - 25 - i * 20
      );
      this.group.add(lava);
      this.lavaPlanes.push(lava);
    }

    // Lava glow point lights
    for (let i = 0; i < 3; i++) {
      const glow = new THREE.PointLight(0xff4400, 2, 25);
      glow.position.set(
        (i - 1) * 10, 0,
        this.baseZ - 30 - i * 25
      );
      this.group.add(glow);
    }

    // Dragon nests (bowl shapes)
    for (let i = 0; i < 3; i++) {
      const nest = this._createDragonNest();
      nest.position.set(
        (i - 1) * 18,
        -2,
        this.baseZ - 20 - i * 30
      );
      this.group.add(nest);
    }

    // Volcano in background
    const volcano = new THREE.Mesh(
      new THREE.ConeGeometry(15, 25, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })
    );
    volcano.position.set(30, -2, this.baseZ - 90);
    this.group.add(volcano);

    // Lava top on volcano
    const lavaTop = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 5, 2, 6),
      new THREE.MeshStandardMaterial({
        color: 0xff3300, emissive: 0xff2200, emissiveIntensity: 2
      })
    );
    lavaTop.position.set(30, 22, this.baseZ - 90);
    this.group.add(lavaTop);

    const text = this.createTextSprite("Volcanic Nest", "#ff6633", 1.2);
    text.position.set(0, 12, this.baseZ - 35);
    this.group.add(text);
    this.floatText = text;
  }

  _createDragonNest() {
    const g = new THREE.Group();
    // Nest bowl (torus)
    const nest = new THREE.Mesh(
      new THREE.TorusGeometry(2, 0.6, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x5a4020 })
    );
    nest.rotation.x = -Math.PI / 2;
    g.add(nest);
    // Eggs
    for (let i = 0; i < 3; i++) {
      const egg = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 6, 6),
        new THREE.MeshStandardMaterial({
          color: [0x44cc66, 0x4488cc, 0xcc4444][i],
          roughness: 0.3, metalness: 0.3
        })
      );
      egg.scale.y = 1.3;
      egg.position.set(
        Math.cos(i * 2.1) * 0.8, 0.4,
        Math.sin(i * 2.1) * 0.8
      );
      g.add(egg);
    }
    return g;
  }

  update(elapsed) {
    // Pulse lava emissive
    for (let i = 0; i < this.lavaPlanes.length; i++) {
      this.lavaPlanes[i].material.emissiveIntensity = 1.2 + Math.sin(elapsed * 2 + i) * 0.5;
    }
    if (this.floatText) this.floatText.position.y = 12 + Math.sin(elapsed * 0.5) * 0.3;
  }
}
