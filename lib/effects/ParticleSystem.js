import * as THREE from "three";

/**
 * Enhanced particle system: sparkles, fireworks, ambient stars, trail effects.
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.activeBursts = [];
    this.ambientStars = this._createAmbientStars();
    this.trailParticles = this._createTrailParticles();
  }

  _createAmbientStars() {
    const count = 100;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 80,
        3 + Math.random() * 25,
        -Math.random() * 750
      );
      const hue = 0.08 + Math.random() * 0.15;
      const c = new THREE.Color().setHSL(hue, 0.6 + Math.random() * 0.3, 0.6 + Math.random() * 0.3);
      colors.push(c.r, c.g, c.b);
      sizes.push(0.3 + Math.random() * 0.5);
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false,
      })
    );

    this.scene.add(points);
    return points;
  }

  _createTrailParticles() {
    const count = 30;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100;
      positions[i * 3 + 2] = 0;
      const c = new THREE.Color().setHSL(0.55, 0.8, 0.6);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const trail = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false,
      })
    );
    trail.userData.index = 0;
    this.scene.add(trail);
    return trail;
  }

  /**
   * Update trail with dragon position.
   */
  updateTrail(dragonPos) {
    if (!this.trailParticles || !dragonPos) return;
    const posArr = this.trailParticles.geometry.attributes.position.array;
    const idx = this.trailParticles.userData.index;
    posArr[idx * 3] = dragonPos.x + (Math.random() - 0.5) * 0.5;
    posArr[idx * 3 + 1] = dragonPos.y - 1 + (Math.random() - 0.5) * 0.3;
    posArr[idx * 3 + 2] = dragonPos.z + (Math.random() - 0.5) * 0.5;
    this.trailParticles.userData.index = (idx + 1) % (posArr.length / 3);
    this.trailParticles.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Burst a celebration effect at a world position.
   */
  burstAt(position, type = "celebration") {
    const count = 60;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];

    for (let i = 0; i < count; i++) {
      positions.push(0, 0, 0);
      const speed = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      velocities.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 3,
        Math.cos(phi) * speed
      );

      let c;
      switch (type) {
        case "golden":
          c = new THREE.Color().setHSL(0.1 + Math.random() * 0.1, 0.95, 0.65 + Math.random() * 0.2);
          break;
        case "sparkle":
          c = new THREE.Color().setHSL(0.1 + Math.random() * 0.06, 0.95, 0.75 + Math.random() * 0.15);
          break;
        case "fire":
          c = new THREE.Color().setHSL(0.02 + Math.random() * 0.06, 1, 0.5 + Math.random() * 0.3);
          break;
        default: // celebration
          c = new THREE.Color().setHSL(Math.random(), 0.85, 0.65 + Math.random() * 0.15);
      }
      colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false,
      })
    );

    points.position.copy(position);
    this.scene.add(points);

    this.activeBursts.push({
      points,
      velocities,
      life: 3.5,
      maxLife: 3.5,
    });
  }

  update(delta, elapsed) {
    // Animate ambient stars — opacity only, no per-vertex position update
    if (this.ambientStars) {
      this.ambientStars.material.opacity = 0.35 + Math.sin(elapsed * 0.6) * 0.1;
    }

    // Fade trail over time
    if (this.trailParticles) {
      this.trailParticles.material.opacity = 0.3 + Math.sin(elapsed * 2) * 0.1;
    }

    // Animate bursts
    for (let b = this.activeBursts.length - 1; b >= 0; b--) {
      const burst = this.activeBursts[b];
      burst.life -= delta;

      if (burst.life <= 0) {
        this.scene.remove(burst.points);
        burst.points.geometry.dispose();
        burst.points.material.dispose();
        this.activeBursts.splice(b, 1);
        continue;
      }

      const posArr = burst.points.geometry.attributes.position.array;
      const lifeRatio = burst.life / burst.maxLife;

      for (let i = 0; i < burst.velocities.length / 3; i++) {
        posArr[i * 3] += burst.velocities[i * 3] * delta;
        posArr[i * 3 + 1] += burst.velocities[i * 3 + 1] * delta;
        posArr[i * 3 + 2] += burst.velocities[i * 3 + 2] * delta;
        burst.velocities[i * 3 + 1] -= delta * 4; // gravity
        // Air drag
        burst.velocities[i * 3] *= 0.995;
        burst.velocities[i * 3 + 2] *= 0.995;
      }
      burst.points.geometry.attributes.position.needsUpdate = true;
      burst.points.material.opacity = lifeRatio * lifeRatio; // Smooth fade-out
      burst.points.material.size = 0.5 * (0.3 + lifeRatio * 0.7);
    }
  }
}
