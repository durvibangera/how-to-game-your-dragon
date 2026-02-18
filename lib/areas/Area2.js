import * as THREE from "three";
import { AreaBase } from "./AreaBase";
import { ProceduralTextures } from "../utils/ProceduralTextures";

/**
 * Area 2 - THE COVE
 * Hidden lake, rocky cliffs, waterfalls, bioluminescent plants — where Hiccup first met Toothless.
 */
export class Area2 extends AreaBase {
  constructor(scene) {
    super(scene, 1);
    this.waterfall = null;
    this.glowPlants = [];
  }

  populate() {
    const grassTex = ProceduralTextures.grassTexture(256);
    this.addGround(0x2a5a30, -2, 160, grassTex);
    this.addLight(0x88bbdd, 1.8, 0, 20, -40);
    this.addLight(0x66aa88, 1.2, 15, 10, -80);

    // Ground fog - mystical cove
    this.addGroundFog(0x66aa88, 0.1, -1, 3);

    const stoneTex = ProceduralTextures.stoneTexture(128, [85, 85, 80]);

    // Rocky cliff walls enclosing the cove - more detailed
    for (let i = 0; i < 5; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const cliff = this._createCliff(stoneTex);
      cliff.position.set(side * (22 + Math.random() * 12), -2, this.baseZ - 8 - i * 14);
      cliff.rotation.y = Math.random() * 0.5;
      this.group.add(cliff);
    }

    // Lake water surface - reflective
    const waterTex = ProceduralTextures.waterTexture(128);
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(22, 20),
      new THREE.MeshStandardMaterial({
        map: waterTex, color: 0x2288bb,
        transparent: true, opacity: 0.65,
        roughness: 0.1, metalness: 0.5,
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -1.5, this.baseZ - 50);
    this.group.add(water);
    this.water = water;

    // Underwater caustic glow
    const caustic = new THREE.Mesh(
      new THREE.CircleGeometry(20, 16),
      new THREE.MeshBasicMaterial({
        color: 0x44bbcc, transparent: true, opacity: 0.08,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    caustic.rotation.x = -Math.PI / 2;
    caustic.position.set(0, -1.3, this.baseZ - 50);
    this.group.add(caustic);

    // Trees around the cove - improved with varied foliage
    for (let i = 0; i < 10; i++) {
      const tree = this._createTree(i);
      const angle = (i / 10) * Math.PI * 2;
      const r = 22 + Math.random() * 12;
      tree.position.set(Math.cos(angle) * r, -2, this.baseZ - 50 + Math.sin(angle) * r);
      this.group.add(tree);
    }

    // Waterfall - multi-layered
    this.waterfall = this._createWaterfall();
    this.waterfall.position.set(-20, 5, this.baseZ - 40);
    this.group.add(this.waterfall);

    // Bioluminescent plants / mushrooms
    for (let i = 0; i < 8; i++) {
      const glow = this._createGlowPlant();
      const angle = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 16;
      glow.position.set(Math.cos(angle) * r, -1.8, this.baseZ - 50 + Math.sin(angle) * r);
      this.group.add(glow);
      this.glowPlants.push(glow);
    }

    // Fish basket (Hiccup's gift to Toothless)
    const basket = this._createBasket();
    basket.position.set(3, -1.3, this.baseZ - 48);
    this.group.add(basket);

    // Lily pads on water
    for (let i = 0; i < 5; i++) {
      const pad = new THREE.Mesh(
        new THREE.CircleGeometry(0.6 + Math.random() * 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x338833, roughness: 0.9, side: THREE.DoubleSide })
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set((Math.random() - 0.5) * 15, -1.35, this.baseZ - 45 + Math.random() * 15);
      this.group.add(pad);
      this.registerFloat(pad, 0.3, 0.05, i);
    }

    // Flat pebble shore
    for (let i = 0; i < 10; i++) {
      const pebble = new THREE.Mesh(
        new THREE.SphereGeometry(0.15 + Math.random() * 0.25, 6, 5),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.08, 0.1, 0.3 + Math.random() * 0.3),
          roughness: 0.9
        })
      );
      pebble.scale.y = 0.4;
      const angle = Math.random() * Math.PI * 2;
      const r = 18 + Math.random() * 4;
      pebble.position.set(Math.cos(angle) * r, -1.9, this.baseZ - 50 + Math.sin(angle) * r);
      this.group.add(pebble);
    }

    const text = this.createTextSprite("The Cove", "#aaddcc", 1.3);
    text.position.set(0, 13, this.baseZ - 35);
    this.group.add(text);
    this.floatText = text;
  }

  _createCliff(stoneTex) {
    const g = new THREE.Group();
    const h = 8 + Math.random() * 14;
    // Main rock body
    const rockGeo = new THREE.BoxGeometry(5 + Math.random() * 5, h, 7 + Math.random() * 5);
    const rock = new THREE.Mesh(rockGeo, new THREE.MeshStandardMaterial({
      map: stoneTex, color: 0x606060, roughness: 0.92,
      bumpMap: ProceduralTextures.bumpTexture(64), bumpScale: 0.3,
    }));
    rock.position.y = h / 2;
    rock.castShadow = true;
    g.add(rock);

    // Smaller rock accents
    const accent = new THREE.Mesh(
      new THREE.DodecahedronGeometry(2 + Math.random() * 2, 0),
      new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x555555, roughness: 0.93 })
    );
    accent.position.set((Math.random() - 0.5) * 3, h * 0.4, (Math.random() - 0.5) * 3);
    g.add(accent);

    // Moss and vegetation on top
    const moss = new THREE.Mesh(
      new THREE.BoxGeometry(4 + Math.random() * 2, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a7b35, roughness: 0.95 })
    );
    moss.position.y = h + 0.2;
    g.add(moss);

    // Hanging vines
    for (let i = 0; i < 2; i++) {
      const vine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.03, 3 + Math.random() * 3, 4),
        new THREE.MeshStandardMaterial({ color: 0x2a5a20, roughness: 0.9 })
      );
      vine.position.set((Math.random() - 0.5) * 3, h * 0.6, (Math.random() - 0.5) * 3);
      g.add(vine);
    }
    return g;
  }

  _createTree(index) {
    const g = new THREE.Group();
    const trunkH = 4 + Math.random() * 3;
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.45, trunkH, 8),
      new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.92 })
    );
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    g.add(trunk);

    // Multi-layered foliage
    const foliageColor = new THREE.Color().setHSL(0.28 + Math.random() * 0.06, 0.6, 0.22 + Math.random() * 0.1);
    for (let i = 0; i < 2; i++) {
      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(2.5 - i * 0.5, 3 - i * 0.5, 8),
        new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.9 })
      );
      leaves.position.y = trunkH + 1 + i * 1.5;
      leaves.castShadow = true;
      g.add(leaves);
    }
    return g;
  }

  _createWaterfall() {
    const g = new THREE.Group();

    // Multiple cascading layers
    for (let i = 0; i < 3; i++) {
      const fall = new THREE.Mesh(
        new THREE.PlaneGeometry(2 + i * 0.5, 12),
        new THREE.MeshBasicMaterial({
          color: i === 0 ? 0xaaddee : 0x88ccee,
          transparent: true,
          opacity: 0.35 - i * 0.1,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      fall.position.x = i * 0.3;
      g.add(fall);
    }

    // Mist at base
    const mist = new THREE.Mesh(
      new THREE.SphereGeometry(3, 8, 6),
      new THREE.MeshBasicMaterial({
        color: 0xaaccdd, transparent: true, opacity: 0.1,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    mist.position.y = -5;
    mist.scale.set(2, 0.5, 1);
    g.add(mist);

    // Waterfall light
    const wfLight = new THREE.PointLight(0x88ccee, 0.8, 15);
    wfLight.position.y = -3;
    g.add(wfLight);

    return g;
  }

  _createGlowPlant() {
    const g = new THREE.Group();
    const hue = 0.45 + Math.random() * 0.2; // cyan to blue-green
    const color = new THREE.Color().setHSL(hue, 0.8, 0.5);

    // Stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.05, 0.5 + Math.random() * 0.3, 4),
      new THREE.MeshStandardMaterial({ color: 0x225522, roughness: 0.9 })
    );
    stem.position.y = 0.3;
    g.add(stem);

    // Glowing cap/mushroom
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    cap.position.y = 0.55;
    g.add(cap);

    // Point light — only on every other plant
    if (this.glowPlants.length < 3) {
      const light = new THREE.PointLight(color, 0.3, 5);
      light.position.y = 0.5;
      g.add(light);
      g.userData.light = light;
    }
    g.userData.cap = cap;
    return g;
  }

  _createBasket() {
    const g = new THREE.Group();
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.92 })
    );
    g.add(basket);

    // Fish sticking out
    for (let i = 0; i < 2; i++) {
      const fish = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.6, 5),
        new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.3, roughness: 0.5 })
      );
      fish.position.set((i - 0.5) * 0.3, 0.7, 0);
      fish.rotation.z = (i - 0.5) * 0.4;
      g.add(fish);
    }
    return g;
  }

  update(elapsed) {
    super.update(elapsed);
    if (this.water) {
      this.water.position.y = -1.5 + Math.sin(elapsed * 0.8) * 0.08;
      this.water.material.opacity = 0.6 + Math.sin(elapsed * 0.5) * 0.05;
    }

    // Pulse bioluminescent plants
    for (let i = 0; i < this.glowPlants.length; i++) {
      const gp = this.glowPlants[i];
      const { light, cap } = gp.userData;
      const pulse = 0.5 + Math.sin(elapsed * 1.5 + i * 0.8) * 0.5;
      if (light) light.intensity = 0.15 + pulse * 0.25;
      if (cap) cap.material.opacity = 0.4 + pulse * 0.4;
    }

    if (this.floatText) this.floatText.position.y = 13 + Math.sin(elapsed * 0.5) * 0.4;
  }
}
