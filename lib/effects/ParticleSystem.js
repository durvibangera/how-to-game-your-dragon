import * as THREE from "three";

/**
 * Manages celebration particles: sparkles, fireworks bursts.
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.activeBursts = [];
    this.ambientStars = this._createAmbientStars();
  }

  _createAmbientStars() {
    // Subtle floating stars along the entire track
    const count = 100;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];

    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 60,
        5 + Math.random() * 20,
        -Math.random() * 720 // span all 6 areas
      );
      const c = new THREE.Color().setHSL(0.12 + Math.random() * 0.08, 0.7, 0.7);
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
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      })
    );

    this.scene.add(points);
    return points;
  }

  /**
   * Burst a celebration effect at a world position.
   * @param {THREE.Vector3} position
   * @param {"celebration"|"sparkle"|"golden"} type
   */
  burstAt(position, type = "celebration") {
    const count = 80;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];

    for (let i = 0; i < count; i++) {
      positions.push(0, 0, 0);
      const speed = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      velocities.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 2,
        Math.cos(phi) * speed
      );

      let c;
      switch (type) {
        case "golden":
          c = new THREE.Color().setHSL(0.12 + Math.random() * 0.08, 0.9, 0.7);
          break;
        case "sparkle":
          c = new THREE.Color().setHSL(0.12 + Math.random() * 0.05, 0.9, 0.8);
          break;
        default: // celebration
          c = new THREE.Color().setHSL(Math.random(), 0.8, 0.7);
      }
      colors.push(c.r, c.g, c.b);
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
      })
    );

    points.position.copy(position);
    this.scene.add(points);

    this.activeBursts.push({
      points,
      velocities,
      life: 3,
      maxLife: 3,
    });
  }

  update(delta, elapsed) {
    // Animate ambient stars
    if (this.ambientStars) {
      const posArr = this.ambientStars.geometry.attributes.position.array;
      for (let i = 0; i < posArr.length / 3; i++) {
        posArr[i * 3 + 1] += Math.sin(elapsed * 0.5 + i) * 0.005;
      }
      this.ambientStars.geometry.attributes.position.needsUpdate = true;
      this.ambientStars.material.opacity = 0.3 + Math.sin(elapsed * 0.8) * 0.1;
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
      for (let i = 0; i < burst.velocities.length / 3; i++) {
        posArr[i * 3] += burst.velocities[i * 3] * delta;
        posArr[i * 3 + 1] += burst.velocities[i * 3 + 1] * delta;
        posArr[i * 3 + 2] += burst.velocities[i * 3 + 2] * delta;
        burst.velocities[i * 3 + 1] -= delta * 3; // gravity
      }
      burst.points.geometry.attributes.position.needsUpdate = true;
      burst.points.material.opacity = burst.life / burst.maxLife;
    }
  }
}
