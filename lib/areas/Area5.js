import * as THREE from "three";
import { AreaBase } from "./AreaBase";
import { ProceduralTextures } from "../utils/ProceduralTextures";

/**
 * Area 5 - VOLCANIC NEST
 * Dark volcanic island, glowing lava rivers, dragon nests, smoke plumes, ember particles.
 */
export class Area5 extends AreaBase {
  constructor(scene) {
    super(scene, 4);
    this.lavaPlanes = [];
    this.embers = [];
    this.smokePlumes = [];
  }

  populate() {
    const volcanicTex = ProceduralTextures.volcanicTexture(128);
    this.addGround(0x2a1a0a, -2, 180, volcanicTex);
    this.addLight(0xff6622, 2.5, 0, 15, -40);
    this.addLight(0xff4400, 1.8, -10, 10, -80);

    // Volcanic rock formations - varied shapes
    const stoneTex = ProceduralTextures.stoneTexture(128, [50, 40, 30]);
    for (let i = 0; i < 8; i++) {
      const rock = this._createVolcanicRock(stoneTex);
      rock.position.set(
        (Math.random() - 0.5) * 60,
        -2,
        this.baseZ - 5 - Math.random() * 110
      );
      this.group.add(rock);
    }

    // Lava rivers with glow
    const lavaTex = ProceduralTextures.lavaTexture(128);
    for (let i = 0; i < 4; i++) {
      const lava = new THREE.Mesh(
        new THREE.PlaneGeometry(3 + Math.random() * 2, 25 + Math.random() * 15, 4, 4),
        new THREE.MeshStandardMaterial({
          map: lavaTex, color: 0xff5500,
          emissive: 0xff2200, emissiveIntensity: 1.8,
          roughness: 0.2, metalness: 0.1,
        })
      );
      lava.rotation.x = -Math.PI / 2;
      lava.rotation.z = Math.random() * 0.3 - 0.15;
      lava.position.set(
        (i % 2 === 0 ? -1 : 1) * (4 + i * 4),
        -1.7,
        this.baseZ - 20 - i * 18
      );
      this.group.add(lava);
      this.lavaPlanes.push(lava);

      // Lava glow light — only every other river
      if (i % 2 === 0) {
        const glow = new THREE.PointLight(0xff4400, 2, 15);
        glow.position.set(lava.position.x, 0, lava.position.z);
        this.group.add(glow);
      }
    }

    // Underground lava glow (from below)
    for (let i = 0; i < 2; i++) {
      const underGlow = new THREE.Mesh(
        new THREE.CircleGeometry(4 + Math.random() * 3, 8),
        new THREE.MeshBasicMaterial({
          color: 0xff3300, transparent: true, opacity: 0.15,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      underGlow.rotation.x = -Math.PI / 2;
      underGlow.position.set((Math.random() - 0.5) * 30, -1.5, this.baseZ - 20 - i * 25);
      this.group.add(underGlow);
    }

    // Dragon nests with eggs
    for (let i = 0; i < 3; i++) {
      const nest = this._createDragonNest(i);
      nest.position.set((i - 1.5) * 16, -2, this.baseZ - 15 - i * 25);
      this.group.add(nest);
    }

    // Volcano in background - detailed
    this._createVolcano();

    // Smoke plumes
    for (let i = 0; i < 4; i++) {
      const smoke = this._createSmokePlume();
      smoke.position.set(
        (Math.random() - 0.5) * 40,
        2 + Math.random() * 5,
        this.baseZ - 10 - Math.random() * 100
      );
      this.group.add(smoke);
      this.smokePlumes.push(smoke);
    }

    // Ember particles floating upward
    for (let i = 0; i < 20; i++) {
      const ember = new THREE.Mesh(
        new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 4, 4),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.05 + Math.random() * 0.05, 1, 0.5 + Math.random() * 0.3),
          transparent: true, opacity: 0.8,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      ember.position.set(
        (Math.random() - 0.5) * 50,
        Math.random() * 15,
        this.baseZ - Math.random() * 110
      );
      this.group.add(ember);
      this.embers.push({
        mesh: ember,
        baseY: ember.position.y,
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.02,
      });
    }

    // Heat distortion planes (subtle shimmer)
    for (let i = 0; i < 2; i++) {
      const heat = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 8),
        new THREE.MeshBasicMaterial({
          color: 0xff4400, transparent: true, opacity: 0.02,
          blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
        })
      );
      heat.position.set(0, 3 + i * 2, this.baseZ - 30 - i * 25);
      this.group.add(heat);
      this.registerFloat(heat, 0.3, 0.3, i);
    }

    const text = this.createTextSprite("Volcanic Nest", "#ff6633", 1.3);
    text.position.set(0, 13, this.baseZ - 35);
    this.group.add(text);
    this.floatText = text;
  }

  _createVolcanicRock(stoneTex) {
    const g = new THREE.Group();
    const h = 5 + Math.random() * 10;

    // Main rock spike
    const rock = new THREE.Mesh(
      new THREE.ConeGeometry(1.5 + Math.random() * 2.5, h, 5),
      new THREE.MeshStandardMaterial({
        map: stoneTex, color: 0x3a3322, roughness: 0.93,
        bumpMap: ProceduralTextures.bumpTexture(64), bumpScale: 0.4,
      })
    );
    rock.position.y = h / 2;
    rock.castShadow = true;
    g.add(rock);

    // Additional rock chunks
    if (Math.random() > 0.6) {
      const chunk = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1 + Math.random() * 1.5, 0),
        new THREE.MeshStandardMaterial({ map: stoneTex, color: 0x332211, roughness: 0.95 })
      );
      chunk.position.set((Math.random() - 0.5) * 3, h * 0.3, (Math.random() - 0.5) * 3);
      g.add(chunk);
    }
    return g;
  }

  _createDragonNest(index) {
    const g = new THREE.Group();
    // Nest bowl (weathered)
    const nest = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.8, 6, 10),
      new THREE.MeshStandardMaterial({ color: 0x5a4020, roughness: 0.95 })
    );
    nest.rotation.x = -Math.PI / 2;
    g.add(nest);

    // Nest bedding
    const bedding = new THREE.Mesh(
      new THREE.CircleGeometry(2, 10),
      new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.98 })
    );
    bedding.rotation.x = -Math.PI / 2;
    bedding.position.y = 0.1;
    g.add(bedding);

    // Glowing eggs
    const eggColors = [
      [0x44cc66, 0x22aa44],
      [0x4488cc, 0x2266aa],
      [0xcc4444, 0xaa2222],
      [0xccaa44, 0xaa8822],
    ];
    for (let i = 0; i < 3; i++) {
      const colors = eggColors[(index + i) % eggColors.length];
      const egg = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 6, 6),
        new THREE.MeshStandardMaterial({
          color: colors[0], emissive: colors[1], emissiveIntensity: 0.3,
          roughness: 0.25, metalness: 0.35,
        })
      );
      egg.scale.y = 1.35;
      const a = i * 2.1;
      egg.position.set(Math.cos(a) * 0.9, 0.5, Math.sin(a) * 0.9);
      egg.castShadow = true;
      g.add(egg);
    }

    // Warm glow from nest
    const nestLight = new THREE.PointLight(0xff6633, 0.5, 6);
    nestLight.position.y = 1;
    g.add(nestLight);

    return g;
  }

  _createVolcano() {
    // Main volcano cone
    const stoneTex = ProceduralTextures.stoneTexture(128, [55, 35, 20]);
    const volcano = new THREE.Mesh(
      new THREE.ConeGeometry(18, 30, 8),
      new THREE.MeshStandardMaterial({
        map: stoneTex, color: 0x3a2a1a, roughness: 0.92,
        bumpMap: ProceduralTextures.bumpTexture(64), bumpScale: 0.5,
      })
    );
    volcano.position.set(35, -2, this.baseZ - 90);
    volcano.castShadow = true;
    this.group.add(volcano);

    // Lava caldera on top
    const caldera = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 6, 3, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff3300, emissive: 0xff2200, emissiveIntensity: 2.5,
        roughness: 0.15,
      })
    );
    caldera.position.set(35, 26, this.baseZ - 90);
    this.group.add(caldera);

    // Glow above caldera
    const volcGlow = new THREE.PointLight(0xff4400, 4, 30);
    volcGlow.position.set(35, 30, this.baseZ - 90);
    this.group.add(volcGlow);

    // Lava overflow streaks down the side
    for (let i = 0; i < 2; i++) {
      const streak = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 15),
        new THREE.MeshBasicMaterial({
          color: 0xff4400, transparent: true, opacity: 0.4,
          blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
        })
      );
      const angle = (i / 3) * Math.PI * 0.5 + 0.2;
      streak.position.set(
        35 + Math.cos(angle) * 8, 12,
        this.baseZ - 90 + Math.sin(angle) * 8
      );
      streak.rotation.z = 0.3 + Math.random() * 0.4;
      this.group.add(streak);
    }
  }

  _createSmokePlume() {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(1 + Math.random() * 1.5, 4, 4),
        new THREE.MeshBasicMaterial({
          color: 0x444444, transparent: true, opacity: 0.1 - i * 0.02,
          depthWrite: false,
        })
      );
      puff.position.y = i * 2;
      puff.scale.setScalar(1 + i * 0.4);
      g.add(puff);
    }
    return g;
  }

  update(elapsed) {
    super.update(elapsed);
    // Pulse lava emissive
    for (let i = 0; i < this.lavaPlanes.length; i++) {
      this.lavaPlanes[i].material.emissiveIntensity = 1.5 + Math.sin(elapsed * 2.5 + i * 1.3) * 0.6;
    }

    // Float embers upward
    for (const e of this.embers) {
      e.mesh.position.y = e.baseY + ((elapsed * e.speed + e.phase) % 15);
      e.mesh.position.x += e.drift;
      e.mesh.material.opacity = Math.max(0, 0.8 - ((elapsed * e.speed + e.phase) % 15) * 0.06);
      if (e.mesh.position.y > e.baseY + 14) {
        e.mesh.position.y = e.baseY;
      }
    }

    // Drift smoke plumes
    for (let i = 0; i < this.smokePlumes.length; i++) {
      this.smokePlumes[i].position.y += Math.sin(elapsed * 0.3 + i) * 0.005;
      this.smokePlumes[i].position.x += Math.sin(elapsed * 0.2 + i * 0.7) * 0.003;
    }

    if (this.floatText) this.floatText.position.y = 13 + Math.sin(elapsed * 0.5) * 0.4;
  }
}
