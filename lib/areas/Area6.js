import * as THREE from "three";
import { AreaBase } from "./AreaBase";
import { ProceduralTextures } from "../utils/ProceduralTextures";

/**
 * Area 6 - THE RED DEATH'S LAIR
 * Final dark approach: massive jagged rock pillars, ominous red sky, skulls, foreboding fog.
 */
export class Area6 extends AreaBase {
  constructor(scene) {
    super(scene, 5);
    this.torches = [];
    this.lightningTimer = 0;
    this.lightningFlash = null;
  }

  populate() {
    const darkTex = ProceduralTextures.darkRockTexture(128);
    this.addGround(0x1a0a0a, -2, 200, darkTex);
    this.addLight(0xff3300, 2, 0, 20, -50);
    this.addLight(0x441100, 1.5, 10, 10, -80);

    // Ominous ground fog - thick
    this.addGroundFog(0x220505, 0.12, -1, 3);

    const stoneTex = ProceduralTextures.stoneTexture(128, [35, 18, 15]);

    // Massive jagged rock pillars - taller and more dramatic
    for (let i = 0; i < 10; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const rock = this._createJaggedRock(stoneTex, i);
      rock.position.set(
        side * (12 + Math.random() * 18),
        -2,
        this.baseZ - 3 - i * 6.5
      );
      this.group.add(rock);
    }

    // Skull decorations - more detailed
    for (let i = 0; i < 4; i++) {
      const skull = this._createSkull();
      skull.position.set(
        (i % 2 === 0 ? -1 : 1) * (8 + Math.random() * 4),
        2 + Math.random() * 2,
        this.baseZ - 12 - i * 18
      );
      skull.scale.setScalar(1.2 + Math.random() * 0.8);
      skull.rotation.y = Math.random() * 0.5;
      this.group.add(skull);
    }

    // Flame torches along the path
    for (let i = 0; i < 6; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const torch = this._createTorch();
      torch.position.set(side * 7, -2, this.baseZ - 8 - i * 11);
      this.group.add(torch);
      this.torches.push(torch);
    }

    // Ominous red glow on horizon - multi-layered
    for (let i = 0; i < 2; i++) {
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(25 + i * 10, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0xff1100, transparent: true, opacity: 0.12 - i * 0.03,
          side: THREE.BackSide, depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      glow.position.set(0, -5, this.baseZ - 95);
      this.group.add(glow);
    }

    // Dark fog floor layers
    for (let i = 0; i < 2; i++) {
      const fog = new THREE.Mesh(
        new THREE.PlaneGeometry(140, 140),
        new THREE.MeshBasicMaterial({
          color: 0x110000, transparent: true, opacity: 0.25 - i * 0.05,
          depthWrite: false,
        })
      );
      fog.rotation.x = -Math.PI / 2;
      fog.position.set(0, -1 + i * 0.3, this.baseZ - 55);
      this.group.add(fog);
    }

    // Bone piles
    for (let i = 0; i < 4; i++) {
      const bones = this._createBonePile();
      bones.position.set(
        (Math.random() - 0.5) * 30,
        -1.8,
        this.baseZ - 10 - Math.random() * 100
      );
      this.group.add(bones);
    }

    // Red Death silhouette hint in the distance
    const silhouette = this._createRedDeathHint();
    silhouette.position.set(0, 8, this.baseZ - 110);
    this.group.add(silhouette);

    // Lightning flash plane
    this.lightningFlash = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 100),
      new THREE.MeshBasicMaterial({
        color: 0xff4422, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
      })
    );
    this.lightningFlash.position.set(0, 30, this.baseZ - 60);
    this.group.add(this.lightningFlash);

    // Dark energy particles
    for (let i = 0; i < 12; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 4, 4),
        new THREE.MeshBasicMaterial({
          color: 0xff2200, transparent: true, opacity: 0.5,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      particle.position.set(
        (Math.random() - 0.5) * 40,
        Math.random() * 12,
        this.baseZ - Math.random() * 110
      );
      this.group.add(particle);
      this.registerFloat(particle, 0.3 + Math.random() * 0.4, 0.8, Math.random() * Math.PI * 2);
    }

    const text = this.createTextSprite("The Dragon's Lair", "#ff3300", 1.4);
    text.position.set(0, 15, this.baseZ - 30);
    this.group.add(text);
    this.floatText = text;
  }

  _createJaggedRock(stoneTex, index) {
    const g = new THREE.Group();
    const h = 10 + Math.random() * 22;
    const rock = new THREE.Mesh(
      new THREE.ConeGeometry(2 + Math.random() * 3, h, 5),
      new THREE.MeshStandardMaterial({
        map: stoneTex, color: 0x221111, roughness: 0.93,
        bumpMap: ProceduralTextures.bumpTexture(64), bumpScale: 0.4,
      })
    );
    rock.position.y = h / 2;
    rock.castShadow = true;
    g.add(rock);

    // Smaller spikes around base
    if (Math.random() > 0.4) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(1 + Math.random() * 1.5, h * 0.4 + Math.random() * 3, 4),
        new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x1a0808, roughness: 0.95 })
      );
      spike.position.set(
        (Math.random() - 0.5) * 4,
        spike.geometry.parameters.height / 2,
        (Math.random() - 0.5) * 4
      );
      g.add(spike);
    }
    return g;
  }

  _createSkull() {
    const g = new THREE.Group();
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xccbb99, roughness: 0.8, metalness: 0.05 });

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), boneMat);
    g.add(head);

    // Brow ridge
    const brow = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 0.6), boneMat);
    brow.position.set(0, 0.6, 0.8);
    g.add(brow);

    // Eyes (glowing red — no PointLight, emissive only)
    for (let s = -1; s <= 1; s += 2) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 6, 6),
        new THREE.MeshBasicMaterial({
          color: 0xff1100, transparent: true, opacity: 0.8,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      eye.position.set(s * 0.4, 0.2, 1);
      g.add(eye);
    }

    // Jaw
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(1, 0.35, 0.7), boneMat);
    jaw.position.set(0, -0.75, 0.6);
    g.add(jaw);

    // Teeth
    for (let i = 0; i < 4; i++) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.3, 4),
        boneMat
      );
      tooth.position.set(-0.3 + i * 0.2, -0.5, 0.9);
      tooth.rotation.x = Math.PI;
      g.add(tooth);
    }

    return g;
  }

  _createTorch() {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.25, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a2a10, roughness: 0.92 })
    );
    pole.position.y = 3;
    pole.castShadow = true;
    g.add(pole);

    // Iron bracket
    const bracket = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.06, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.85, roughness: 0.2 })
    );
    bracket.position.y = 5.8;
    bracket.rotation.x = Math.PI / 2;
    g.add(bracket);

    // Multi-layer flame
    const flame = this.createFlame(0.5);
    flame.position.y = 6.2;
    flame.name = "flame";
    g.add(flame);

    const light = new THREE.PointLight(0xff3300, 2, 12);
    light.position.y = 6.2;
    light.name = "torchLight";
    g.add(light);
    return g;
  }

  _createBonePile() {
    const g = new THREE.Group();
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xbbaa88, roughness: 0.9 });
    for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
      const bone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 0.8 + Math.random() * 0.6, 5),
        boneMat
      );
      bone.position.set(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 0.3,
        (Math.random() - 0.5) * 1.5
      );
      bone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      g.add(bone);
    }
    return g;
  }

  _createRedDeathHint() {
    const g = new THREE.Group();
    // Giant dark silhouette shape
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(12, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0x110000, transparent: true, opacity: 0.3, depthWrite: false,
      })
    );
    body.scale.set(1.5, 1, 2);
    g.add(body);

    // Wings
    for (let s = -1; s <= 1; s += 2) {
      const wing = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 10),
        new THREE.MeshBasicMaterial({
          color: 0x110000, transparent: true, opacity: 0.2,
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      wing.position.set(s * 15, 2, 0);
      wing.rotation.z = s * 0.2;
      g.add(wing);
    }

    // Glowing eyes — no PointLight
    for (let s = -1; s <= 1; s += 2) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 6, 6),
        new THREE.MeshBasicMaterial({
          color: 0xff2200, transparent: true, opacity: 0.6,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      eye.position.set(s * 3, 4, 10);
      g.add(eye);
    }

    return g;
  }

  update(elapsed) {
    super.update(elapsed);
    // Flicker torches
    for (let i = 0; i < this.torches.length; i++) {
      const flame = this.torches[i].getObjectByName("flame");
      const light = this.torches[i].getObjectByName("torchLight");
      if (flame) {
        const s = 0.7 + Math.sin(elapsed * 10 + i * 2.5) * 0.25 + Math.sin(elapsed * 7 + i * 1.3) * 0.15;
        flame.scale.setScalar(s);
        flame.rotation.y = elapsed * 2 + i;
      }
      if (light) {
        light.intensity = 1.5 + Math.sin(elapsed * 8 + i * 3) * 0.6;
      }
    }

    // Occasional lightning flash
    this.lightningTimer += 0.016;
    if (this.lightningFlash) {
      if (this.lightningTimer > 4 + Math.random() * 6) {
        this.lightningFlash.material.opacity = 0.15;
        this.lightningTimer = 0;
      } else {
        this.lightningFlash.material.opacity *= 0.9;
      }
    }

    if (this.floatText) this.floatText.position.y = 15 + Math.sin(elapsed * 0.5) * 0.4;
  }
}
