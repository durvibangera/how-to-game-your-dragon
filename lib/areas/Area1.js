import * as THREE from "three";
import { AreaBase } from "./AreaBase";
import { ProceduralTextures } from "../utils/ProceduralTextures";

/**
 * Area 1 - BERK VILLAGE
 * Viking village with detailed wooden huts, glowing torches, docks, green hills, and ocean.
 */
export class Area1 extends AreaBase {
  constructor(scene) {
    super(scene, 0);
    this.torches = [];
    this.fireflies = [];
  }

  populate() {
    const grassTex = ProceduralTextures.grassTexture(256);
    this.addGround(0x3a6b35, -2, 160, grassTex);
    this.addLight(0xffaa44, 2, 0, 15, -30);
    this.addLight(0xff8833, 1.2, -20, 10, -80);

    // Ground fog
    this.addGroundFog(0x889977, 0.08, -1);

    const woodTex = ProceduralTextures.woodTexture(128);

    // Viking huts with more detail
    for (let i = 0; i < 8; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const hut = this._createHut(woodTex);
      hut.position.set(side * (15 + Math.random() * 8), -2, this.baseZ - 10 - i * 14);
      hut.rotation.y = side > 0 ? -0.3 : 0.3;
      this.group.add(hut);
    }

    // Torches with flame particles
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const torch = this._createTorch();
      torch.position.set(side * 10, -2, this.baseZ - 5 - i * 10);
      this.group.add(torch);
      this.torches.push(torch);
    }

    // Dock and ship
    const dock = this._createDock(woodTex);
    dock.position.set(25, -2.5, this.baseZ - 20);
    this.group.add(dock);

    const ship = this._createShip(woodTex);
    ship.position.set(30, -1, this.baseZ - 25);
    this.group.add(ship);

    // Ocean plane
    const waterTex = ProceduralTextures.waterTexture(128);
    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 120, 12, 12),
      new THREE.MeshStandardMaterial({
        map: waterTex, color: 0x2266aa,
        transparent: true, opacity: 0.75,
        roughness: 0.15, metalness: 0.4,
      })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(40, -2.8, this.baseZ - 60);
    this.group.add(ocean);
    this.ocean = ocean;

    // Rolling green hills with varied geometry
    const hillBump = ProceduralTextures.bumpTexture(128);
    for (let i = 0; i < 6; i++) {
      const hillGeo = new THREE.SphereGeometry(18 + Math.random() * 10, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      const hillMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.28 + Math.random() * 0.05, 0.5, 0.3 + Math.random() * 0.1),
        roughness: 0.92, map: grassTex, bumpMap: hillBump, bumpScale: 0.2,
      });
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.scale.set(1.5 + Math.random() * 0.5, 0.3 + Math.random() * 0.3, 1 + Math.random() * 0.3);
      hill.position.set((i - 2.5) * 25 + Math.random() * 10, -2, this.baseZ - 25 - i * 18);
      hill.receiveShadow = true;
      this.group.add(hill);
    }

    // Scattered rocks
    const stoneTex = ProceduralTextures.stoneTexture(128, [80, 80, 75]);
    const rockMat = new THREE.MeshStandardMaterial({
      map: stoneTex, color: 0x888888, roughness: 0.95, metalness: 0.02,
    });
    for (let i = 0; i < 8; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(0.5 + Math.random() * 1.2, 0);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set((Math.random() - 0.5) * 50, -1.8, this.baseZ - Math.random() * 110);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.group.add(rock);
    }

    // Fireflies (small emissive points)
    for (let i = 0; i < 12; i++) {
      const ff = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 4, 4),
        new THREE.MeshBasicMaterial({ color: 0xffee55, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ff.position.set(
        (Math.random() - 0.5) * 40,
        1 + Math.random() * 6,
        this.baseZ - Math.random() * 100
      );
      this.group.add(ff);
      this.fireflies.push({ mesh: ff, baseY: ff.position.y, phase: Math.random() * Math.PI * 2 });
    }

    // Smoke wisps from chimneys
    for (let i = 0; i < 3; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const smoke = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.12, depthWrite: false })
      );
      smoke.position.set(side * (15 + Math.random() * 5), 7, this.baseZ - 10 - i * 25);
      smoke.scale.set(2, 1.5, 2);
      this.group.add(smoke);
      this.registerFloat(smoke, 0.2, 0.5, i);
    }

    const text = this.createTextSprite("Welcome to Berk", "#ffcc88", 1.3);
    text.position.set(0, 13, this.baseZ - 40);
    this.group.add(text);
    this.floatText = text;
  }

  _createHut(woodTex) {
    const g = new THREE.Group();
    // Base with wood texture
    const bmp = ProceduralTextures.bumpTexture(64);
    const baseMat = new THREE.MeshStandardMaterial({
      map: woodTex, color: 0x7b5433, roughness: 0.88, bumpMap: bmp, bumpScale: 0.15,
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 5), baseMat);
    base.position.set(0, 2, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    g.add(base);

    // Roof with thatch look
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(4.5, 3, 4),
      new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.98, bumpMap: bmp, bumpScale: 0.2 })
    );
    roof.position.y = 5.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);

    // Door
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.95 })
    );
    door.position.set(0, 1.3, 2.51);
    g.add(door);

    // Window glow
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    win.position.set(1.5, 2.8, 2.51);
    g.add(win);

    return g;
  }

  _createTorch() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.18, 4.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 })
    );
    pole.position.y = 2.25;
    pole.castShadow = true;
    g.add(pole);

    // Metal bracket
    const bracket = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.05, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.3 })
    );
    bracket.position.y = 4.3;
    bracket.rotation.x = Math.PI / 2;
    g.add(bracket);

    const flame = this.createFlame(0.35);
    flame.position.y = 4.5;
    g.add(flame);

    const light = new THREE.PointLight(0xff8833, 1.2, 12);
    light.position.y = 4.5;
    g.add(light);
    g.userData = { flame, light };
    return g;
  }

  _createDock(woodTex) {
    const g = new THREE.Group();
    const planks = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.3, 15),
      new THREE.MeshStandardMaterial({ map: woodTex, color: 0x6a5030, roughness: 0.92 })
    );
    planks.receiveShadow = true;
    g.add(planks);
    for (let i = 0; i < 6; i++) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 3.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9, map: woodTex })
      );
      post.position.set((i % 3) * 3 - 3, -1.5, (Math.floor(i / 3)) * 12 - 6);
      post.castShadow = true;
      g.add(post);
    }
    // Rope details
    for (let i = 0; i < 2; i++) {
      const rope = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.04, 6, 12),
        new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.95 })
      );
      rope.position.set(i * 6 - 3, -0.5, -6);
      rope.rotation.x = Math.PI / 3;
      g.add(rope);
    }
    return g;
  }

  _createShip(woodTex) {
    const g = new THREE.Group();
    // Hull - more boat-shaped
    const hullGeo = new THREE.BoxGeometry(4, 2.5, 12);
    const hull = new THREE.Mesh(hullGeo, new THREE.MeshStandardMaterial({
      map: woodTex, color: 0x6a3a1a, roughness: 0.88
    }));
    hull.castShadow = true;
    g.add(hull);

    // Viking prow (dragon head)
    const prow = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 3, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 })
    );
    prow.position.set(0, 1.5, 7);
    prow.rotation.x = -0.4;
    g.add(prow);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 9, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a2a10, roughness: 0.9 })
    );
    mast.position.y = 5;
    mast.castShadow = true;
    g.add(mast);

    const sail = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 6),
      new THREE.MeshStandardMaterial({ color: 0xcc3333, side: THREE.DoubleSide, roughness: 0.8 })
    );
    sail.position.y = 5.5;
    g.add(sail);

    // Shield row on hull
    for (let i = 0; i < 5; i++) {
      const shield = new THREE.Mesh(
        new THREE.CircleGeometry(0.45, 8),
        new THREE.MeshStandardMaterial({
          color: [0xcc3333, 0x3366cc, 0xcc9933, 0x339933, 0xcc6633][i],
          metalness: 0.3, roughness: 0.6, side: THREE.DoubleSide
        })
      );
      shield.position.set(2.05, 0.5, -3 + i * 1.8);
      shield.rotation.y = Math.PI / 2;
      g.add(shield);
    }
    return g;
  }

  update(elapsed) {
    super.update(elapsed);
    this.torches.forEach((t, i) => {
      const { flame, light } = t.userData;
      if (flame) {
        const s = 0.8 + Math.sin(elapsed * 10 + i * 2.5) * 0.25 + Math.sin(elapsed * 7 + i * 1.7) * 0.15;
        flame.scale.setScalar(s);
        flame.rotation.y = elapsed * 2 + i;
      }
      if (light) light.intensity = 0.9 + Math.sin(elapsed * 8 + i * 3) * 0.4;
    });

    // Fireflies
    for (const ff of this.fireflies) {
      ff.mesh.position.y = ff.baseY + Math.sin(elapsed * 0.7 + ff.phase) * 0.5;
      ff.mesh.position.x += Math.sin(elapsed * 0.3 + ff.phase) * 0.003;
      ff.mesh.material.opacity = 0.4 + Math.sin(elapsed * 3 + ff.phase) * 0.4;
    }

    // Ocean wave — simple Y bob instead of per-vertex
    if (this.ocean) {
      this.ocean.position.y = -2.8 + Math.sin(elapsed * 0.8) * 0.15;
    }

    if (this.floatText) this.floatText.position.y = 13 + Math.sin(elapsed * 0.5) * 0.4;
  }
}
