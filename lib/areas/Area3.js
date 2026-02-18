import * as THREE from "three";
import { AreaBase } from "./AreaBase";

/**
 * Area 3 - DRAGON TRAINING ARENA
 * Stone arena, shields and weapons, Viking training grounds.
 */
export class Area3 extends AreaBase {
  constructor(scene) {
    super(scene, 2);
    this.shields = [];
  }

  populate() {
    this.addGround(0x8b7355, -2, 140);
    this.addLight(0xddaa66, 2, 0, 20, -40);
    this.addLight(0xccaa55, 1, -15, 15, -80);

    // Arena walls (circular stone pillars)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 28;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.5, 10, 6),
        new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 })
      );
      pillar.position.set(
        Math.cos(angle) * r, 3,
        this.baseZ - 60 + Math.sin(angle) * r
      );
      this.group.add(pillar);
    }

    // Chain-link ceiling bars (simplified as cylinders)
    for (let i = 0; i < 6; i++) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 56, 6),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7 })
      );
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 10, this.baseZ - 35 - i * 10);
      this.group.add(bar);
    }

    // Training posts with shields
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const post = this._createTrainingPost();
      post.position.set(side * 12, -2, this.baseZ - 20 - i * 16);
      this.group.add(post);
      this.shields.push(post);
    }

    // Weapon rack
    const rack = this._createWeaponRack();
    rack.position.set(-18, -2, this.baseZ - 50);
    this.group.add(rack);

    // Catapult
    const catapult = this._createCatapult();
    catapult.position.set(18, -2, this.baseZ - 70);
    this.group.add(catapult);

    const text = this.createTextSprite("Dragon Training Arena", "#ddaa66", 1.2);
    text.position.set(0, 12, this.baseZ - 35);
    this.group.add(text);
    this.floatText = text;
  }

  _createTrainingPost() {
    const g = new THREE.Group();
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a })
    );
    post.position.y = 3;
    g.add(post);
    // Shield on post
    const shield = new THREE.Mesh(
      new THREE.CircleGeometry(1.2, 8),
      new THREE.MeshStandardMaterial({
        color: 0xcc3333, metalness: 0.3, roughness: 0.6, side: THREE.DoubleSide
      })
    );
    shield.position.set(0, 4, 0.4);
    g.add(shield);
    // Shield boss (center bump)
    const boss = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8 })
    );
    boss.position.set(0, 4, 0.55);
    g.add(boss);
    return g;
  }

  _createWeaponRack() {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 5, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a2a10 })
    );
    frame.position.y = 2.5;
    g.add(frame);
    // Axes/swords (simple cylinders)
    for (let i = 0; i < 3; i++) {
      const weapon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 4, 6),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7 })
      );
      weapon.position.set(0.3, 2 + i * 0.8, -1 + i);
      weapon.rotation.z = 0.3;
      g.add(weapon);
    }
    return g;
  }

  _createCatapult() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(4, 1, 5),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a })
    );
    base.position.y = 0.5;
    g.add(base);
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a2a10 })
    );
    arm.position.set(0, 3, 0);
    arm.rotation.z = 0.5;
    g.add(arm);
    return g;
  }

  update(elapsed) {
    if (this.floatText) this.floatText.position.y = 12 + Math.sin(elapsed * 0.5) * 0.3;
  }
}
