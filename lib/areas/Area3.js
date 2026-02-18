import * as THREE from "three";
import { AreaBase } from "./AreaBase";
import { ProceduralTextures } from "../utils/ProceduralTextures";

/**
 * Area 3 - DRAGON TRAINING ARENA
 * Stone arena with detailed shields, weapons, Viking training grounds, iron chains.
 */
export class Area3 extends AreaBase {
  constructor(scene) {
    super(scene, 2);
    this.shields = [];
    this.chains = [];
  }

  populate() {
    const sandTex = ProceduralTextures.sandTexture(128);
    this.addGround(0x8b7355, -2, 160, sandTex);
    this.addLight(0xddaa66, 2.5, 0, 25, -40);
    this.addLight(0xccaa55, 1.2, -15, 15, -80);

    // Dusty atmosphere
    this.addGroundFog(0xaa9966, 0.06, -1, 2);

    const stoneTex = ProceduralTextures.stoneTexture(128, [100, 100, 95]);

    // Arena walls (detailed stone pillars with capitals)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 30;
      const pillar = this._createPillar(stoneTex);
      pillar.position.set(
        Math.cos(angle) * r, -2,
        this.baseZ - 60 + Math.sin(angle) * r
      );
      this.group.add(pillar);
    }

    // Steel chain-link ceiling bars with connecting chains
    for (let i = 0; i < 6; i++) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 60, 8),
        new THREE.MeshStandardMaterial({ color: 0x777788, metalness: 0.85, roughness: 0.2 })
      );
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 11, this.baseZ - 30 - i * 8);
      bar.castShadow = true;
      this.group.add(bar);

      // Vertical chain segments hanging down
      if (i % 3 === 0) {
        for (let j = 0; j < 2; j++) {
          const chain = this._createChainSegment();
          chain.position.set(-20 + j * 20, 9, this.baseZ - 30 - i * 8);
          this.group.add(chain);
          this.chains.push(chain);
        }
      }
    }

    // Training posts with shields — more detailed
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const post = this._createTrainingPost(i);
      post.position.set(side * 14, -2, this.baseZ - 15 - i * 13);
      this.group.add(post);
      this.shields.push(post);
    }

    // Weapon rack with distinct weapons
    const rack = this._createWeaponRack();
    rack.position.set(-20, -2, this.baseZ - 50);
    this.group.add(rack);

    // Second weapon rack
    const rack2 = this._createWeaponRack();
    rack2.position.set(22, -2, this.baseZ - 70);
    rack2.rotation.y = Math.PI;
    this.group.add(rack2);

    // Catapult
    const catapult = this._createCatapult();
    catapult.position.set(18, -2, this.baseZ - 35);
    this.group.add(catapult);

    // Scratched arena floor markings
    for (let i = 0; i < 3; i++) {
      const mark = new THREE.Mesh(
        new THREE.RingGeometry(3 + i * 3, 3.2 + i * 3, 24),
        new THREE.MeshStandardMaterial({
          color: 0x665544, roughness: 0.98, transparent: true, opacity: 0.3, depthWrite: false
        })
      );
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(0, -1.9, this.baseZ - 60);
      this.group.add(mark);
    }

    // Scorching marks (dragon fire damage on ground)
    for (let i = 0; i < 4; i++) {
      const scorch = new THREE.Mesh(
        new THREE.CircleGeometry(1 + Math.random() * 2, 8),
        new THREE.MeshStandardMaterial({
          color: 0x222211, roughness: 0.99, transparent: true, opacity: 0.5, depthWrite: false
        })
      );
      scorch.rotation.x = -Math.PI / 2;
      scorch.position.set((Math.random() - 0.5) * 30, -1.88, this.baseZ - 30 - Math.random() * 60);
      this.group.add(scorch);
    }

    // Barrels and crates
    for (let i = 0; i < 3; i++) {
      const barrel = this._createBarrel();
      barrel.position.set(
        (i % 2 === 0 ? -1 : 1) * (22 + Math.random() * 5),
        -2,
        this.baseZ - 20 - i * 15
      );
      this.group.add(barrel);
    }

    const text = this.createTextSprite("Dragon Training Arena", "#ddaa66", 1.3);
    text.position.set(0, 14, this.baseZ - 35);
    this.group.add(text);
    this.floatText = text;
  }

  _createPillar(stoneTex) {
    const g = new THREE.Group();
    const pillarBump = ProceduralTextures.bumpTexture(64);
    // Column
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.3, 12, 8),
      new THREE.MeshStandardMaterial({
        map: stoneTex, color: 0x777777, roughness: 0.88, metalness: 0.05,
        bumpMap: pillarBump, bumpScale: 0.2,
      })
    );
    pillar.position.y = 6;
    pillar.castShadow = true;
    g.add(pillar);

    // Capital on top
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.0, 1.2, 8),
      new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x888888, roughness: 0.85 })
    );
    cap.position.y = 12.5;
    g.add(cap);

    // Base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.6, 0.8, 8),
      new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x666666, roughness: 0.9 })
    );
    base.position.y = 0.4;
    g.add(base);

    return g;
  }

  _createChainSegment() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const link = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.04, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0x777788, metalness: 0.9, roughness: 0.15 })
      );
      link.position.y = -i * 0.3;
      link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
      g.add(link);
    }
    return g;
  }

  _createTrainingPost(index) {
    const g = new THREE.Group();
    const woodTex = ProceduralTextures.woodTexture(128);

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.4, 7, 8),
      new THREE.MeshStandardMaterial({ map: woodTex, color: 0x6a4020, roughness: 0.9 })
    );
    post.position.y = 3.5;
    post.castShadow = true;
    g.add(post);

    // Cross bar
    const crossbar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 3, 6),
      new THREE.MeshStandardMaterial({ map: woodTex, color: 0x5a3520, roughness: 0.9 })
    );
    crossbar.position.y = 5;
    crossbar.rotation.z = Math.PI / 2;
    g.add(crossbar);

    // Shield on post - Viking style
    const shieldColors = [0xcc3333, 0x3366aa, 0xcc9933, 0x339944, 0xcc6633, 0x8833aa, 0x33aacc, 0xcccc33];
    const shield = new THREE.Mesh(
      new THREE.CircleGeometry(1.3, 12),
      new THREE.MeshStandardMaterial({
        color: shieldColors[index % shieldColors.length],
        metalness: 0.35, roughness: 0.55, side: THREE.DoubleSide
      })
    );
    shield.position.set(0, 4.5, 0.45);
    g.add(shield);

    // Shield boss (center bump)
    const boss = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.85, roughness: 0.15 })
    );
    boss.position.set(0, 4.5, 0.6);
    g.add(boss);

    // Shield rim
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.08, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 })
    );
    rim.position.set(0, 4.5, 0.45);
    g.add(rim);

    return g;
  }

  _createWeaponRack() {
    const g = new THREE.Group();
    const woodTex = ProceduralTextures.woodTexture(128);

    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 5.5, 4.5),
      new THREE.MeshStandardMaterial({ map: woodTex, color: 0x5a3015, roughness: 0.92 })
    );
    frame.position.y = 2.75;
    frame.castShadow = true;
    g.add(frame);

    // Weapons - axe, sword, mace
    const weaponMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.8, roughness: 0.2 });

    // Axe
    const axeHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5, 6), new THREE.MeshStandardMaterial({ color: 0x5a3a1a }));
    axeHandle.position.set(0.3, 3, -1);
    axeHandle.rotation.z = 0.2;
    g.add(axeHandle);
    const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, 0.6), weaponMat);
    axeHead.position.set(0.5, 4.5, -1);
    g.add(axeHead);

    // Sword
    const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3, 0.3), weaponMat);
    swordBlade.position.set(0.3, 3.5, 0);
    swordBlade.rotation.z = 0.15;
    g.add(swordBlade);

    // Mace
    const maceHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), new THREE.MeshStandardMaterial({ color: 0x5a3a1a }));
    maceHandle.position.set(0.3, 2.5, 1);
    maceHandle.rotation.z = 0.25;
    g.add(maceHandle);
    const maceHead = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), weaponMat);
    maceHead.position.set(0.55, 4, 1);
    g.add(maceHead);

    return g;
  }

  _createCatapult() {
    const g = new THREE.Group();
    const woodTex = ProceduralTextures.woodTexture(128);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1.2, 6),
      new THREE.MeshStandardMaterial({ map: woodTex, color: 0x6a4020, roughness: 0.9 })
    );
    base.position.y = 0.6;
    base.castShadow = true;
    g.add(base);

    // Wheels
    for (let i = 0; i < 4; i++) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 0.3, 12),
        new THREE.MeshStandardMaterial({ map: woodTex, color: 0x5a3a1a, roughness: 0.9 })
      );
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set((i % 2) * 4 - 2, 0.5, (Math.floor(i / 2)) * 4 - 2);
      g.add(wheel);
    }

    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 7, 8),
      new THREE.MeshStandardMaterial({ map: woodTex, color: 0x5a3015, roughness: 0.9 })
    );
    arm.position.set(0, 4, 0);
    arm.rotation.z = 0.5;
    arm.castShadow = true;
    g.add(arm);

    // Bucket
    const bucket = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.8, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7, roughness: 0.3 })
    );
    bucket.position.set(-2.5, 6.5, 0);
    g.add(bucket);

    return g;
  }

  _createBarrel() {
    const g = new THREE.Group();
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 1.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x6a4020, roughness: 0.9 })
    );
    barrel.position.y = 0.75;
    barrel.castShadow = true;
    g.add(barrel);

    // Metal bands
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.04, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8, roughness: 0.2 })
    );
    band.position.y = 0.75;
    g.add(band);
    return g;
  }

  update(elapsed) {
    super.update(elapsed);
    // Sway chains
    for (let i = 0; i < this.chains.length; i++) {
      this.chains[i].rotation.z = Math.sin(elapsed * 0.5 + i) * 0.05;
    }
    if (this.floatText) this.floatText.position.y = 14 + Math.sin(elapsed * 0.5) * 0.4;
  }
}
