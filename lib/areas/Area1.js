import * as THREE from "three";
import { AreaBase } from "./AreaBase";

/**
 * Area 1 - BERK VILLAGE
 * Viking village with wooden huts, torches, docks, green hills.
 */
export class Area1 extends AreaBase {
  constructor(scene) {
    super(scene, 0);
    this.torches = [];
  }

  populate() {
    this.addGround(0x3a6b35, -2, 140);
    this.addLight(0xffaa44, 1.5, 0, 15, -30);
    this.addLight(0xff8833, 1, -20, 10, -80);

    for (let i = 0; i < 8; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const hut = this._createHut();
      hut.position.set(side * (15 + Math.random() * 8), -2, this.baseZ - 10 - i * 14);
      hut.rotation.y = side > 0 ? -0.3 : 0.3;
      this.group.add(hut);
    }

    for (let i = 0; i < 10; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const torch = this._createTorch();
      torch.position.set(side * 10, -2, this.baseZ - 5 - i * 12);
      this.group.add(torch);
      this.torches.push(torch);
    }

    const dock = this._createDock();
    dock.position.set(25, -2.5, this.baseZ - 20);
    this.group.add(dock);

    const ship = this._createShip();
    ship.position.set(30, -1, this.baseZ - 25);
    this.group.add(ship);

    for (let i = 0; i < 4; i++) {
      const hill = new THREE.Mesh(
        new THREE.SphereGeometry(20, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x4a7c3f, roughness: 0.95 })
      );
      hill.scale.set(1.5, 0.5, 1);
      hill.position.set((i - 1.5) * 30, -2, this.baseZ - 30 - i * 20);
      this.group.add(hill);
    }

    const text = this.createTextSprite("Welcome to Berk", "#ffcc88", 1.2);
    text.position.set(0, 12, this.baseZ - 40);
    this.group.add(text);
    this.floatText = text;
  }

  _createHut() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(5, 4, 5),
      new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.9 })
    );
    base.position.set(0, 2, 0);
    g.add(base);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(4.5, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.95 })
    );
    roof.position.y = 5.5;
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    return g;
  }

  _createTorch() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.15, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a3520 })
    );
    pole.position.y = 2;
    g.add(pole);
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff6600 })
    );
    flame.position.y = 4.2;
    g.add(flame);
    const light = new THREE.PointLight(0xff8833, 0.8, 15);
    light.position.y = 4.2;
    g.add(light);
    g.userData = { flame, light };
    return g;
  }

  _createDock() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.3, 15),
      new THREE.MeshStandardMaterial({ color: 0x5a4020, roughness: 0.95 })
    ));
    for (let i = 0; i < 4; i++) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 3, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a3520 })
      );
      post.position.set((i % 2) * 6 - 3, -1.5, (Math.floor(i / 2)) * 12 - 6);
      g.add(post);
    }
    return g;
  }

  _createShip() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(
      new THREE.BoxGeometry(4, 2, 10),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 })
    ));
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a2a10 })
    );
    mast.position.y = 4;
    g.add(mast);
    const sail = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 5),
      new THREE.MeshStandardMaterial({ color: 0xcc4444, side: THREE.DoubleSide })
    );
    sail.position.y = 4.5;
    g.add(sail);
    return g;
  }

  update(elapsed) {
    this.torches.forEach((t, i) => {
      const { flame, light } = t.userData;
      if (flame) flame.scale.setScalar(0.8 + Math.sin(elapsed * 8 + i * 2) * 0.3);
      if (light) light.intensity = 0.6 + Math.sin(elapsed * 6 + i * 3) * 0.3;
    });
    if (this.floatText) this.floatText.position.y = 12 + Math.sin(elapsed * 0.5) * 0.3;
  }
}
