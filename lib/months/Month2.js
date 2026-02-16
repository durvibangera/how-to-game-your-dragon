import * as THREE from "three";
import { MonthBase } from "./MonthBase";

/**
 * Month 2 - THE COVE
 * Hidden lake, rocky cliffs, waterfalls — where Hiccup first met Toothless.
 */
export class Month2 extends MonthBase {
  constructor(scene) {
    super(scene, 1);
    this.waterfall = null;
  }

  populate() {
    this.addGround(0x2a5a30, -2, 140);
    this.addLight(0x88bbdd, 1.5, 0, 20, -40);
    this.addLight(0x66aa88, 1, 15, 10, -80);

    // Rocky cliff walls enclosing the cove
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const cliff = this._createCliff();
      cliff.position.set(side * (25 + Math.random() * 10), -2, this.baseZ - 10 - i * 18);
      cliff.rotation.y = Math.random() * 0.5;
      this.group.add(cliff);
    }

    // Lake water surface
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(18, 16),
      new THREE.MeshStandardMaterial({
        color: 0x2277aa, transparent: true, opacity: 0.7,
        roughness: 0.2, metalness: 0.3
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -1.5, this.baseZ - 50);
    this.group.add(water);
    this.water = water;

    // Trees around the cove
    for (let i = 0; i < 12; i++) {
      const tree = this._createTree();
      const angle = (i / 12) * Math.PI * 2;
      tree.position.set(
        Math.cos(angle) * (22 + Math.random() * 10),
        -2,
        this.baseZ - 50 + Math.sin(angle) * (22 + Math.random() * 10)
      );
      this.group.add(tree);
    }

    // Waterfall
    this.waterfall = this._createWaterfall();
    this.waterfall.position.set(-20, 5, this.baseZ - 40);
    this.group.add(this.waterfall);

    // Fish basket (Hiccup's gift to Toothless)
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x8b7355 })
    );
    basket.position.set(3, -1.3, this.baseZ - 48);
    this.group.add(basket);

    const text = this.createTextSprite("The Cove", "#aaddcc", 1.2);
    text.position.set(0, 12, this.baseZ - 35);
    this.group.add(text);
    this.floatText = text;
  }

  _createCliff() {
    const g = new THREE.Group();
    const h = 8 + Math.random() * 12;
    const rock = new THREE.Mesh(
      new THREE.BoxGeometry(6 + Math.random() * 4, h, 8 + Math.random() * 4),
      new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.95 })
    );
    rock.position.y = h / 2;
    g.add(rock);
    // Moss on top
    const moss = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.5, 7),
      new THREE.MeshStandardMaterial({ color: 0x3a6b35 })
    );
    moss.position.y = h + 0.2;
    g.add(moss);
    return g;
  }

  _createTree() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 5, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a })
    );
    trunk.position.y = 2.5;
    g.add(trunk);
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(2.5, 5, 6),
      new THREE.MeshStandardMaterial({ color: 0x2d5a2a })
    );
    leaves.position.y = 6;
    g.add(leaves);
    return g;
  }

  _createWaterfall() {
    const g = new THREE.Group();
    const fall = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 10),
      new THREE.MeshBasicMaterial({
        color: 0x88ccee, transparent: true, opacity: 0.5,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending
      })
    );
    g.add(fall);
    return g;
  }

  update(elapsed) {
    if (this.water) {
      this.water.position.y = -1.5 + Math.sin(elapsed * 0.8) * 0.1;
    }
    if (this.floatText) this.floatText.position.y = 12 + Math.sin(elapsed * 0.5) * 0.3;
  }
}
