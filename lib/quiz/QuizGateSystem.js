import * as THREE from "three";

/**
 * Manages the gate hoop system.
 * Creates floating fire hoops at month boundaries that the dragon flies through.
 * Purely visual — no quiz or game logic.
 */
export class GateSystem {
  constructor(scene, ui, particleSystem, trackCurve, monthTrackEnd) {
    this.scene = scene;
    this.ui = ui;
    this.particleSystem = particleSystem;
    this.trackCurve = trackCurve;
    this.monthTrackEnd = monthTrackEnd;

    this.gates = [];
    this._createGates();
  }

  _createGates() {
    for (let i = 0; i < 5; i++) {
      const gate = this._createGatePortal(i);

      // Position gate ON the track curve at the month boundary
      const t = Math.min(((i + 1) / 6) * this.monthTrackEnd, 0.998);
      const pos = this.trackCurve.getPointAt(t);
      const tangent = this.trackCurve.getTangentAt(t);

      gate.position.copy(pos);
      gate.position.y += 2; // slightly above track center

      // Orient gate perpendicular to track (face the incoming cart)
      const lookTarget = pos.clone().sub(tangent.multiplyScalar(10));
      lookTarget.y = gate.position.y;
      gate.lookAt(lookTarget);

      gate.visible = true;
      this.scene.add(gate);
      this.gates.push(gate);
    }
  }

  _createGatePortal(index) {
    const group = new THREE.Group();

    // Outer ring (fire hoop frame)
    const ringGeo = new THREE.TorusGeometry(6, 0.4, 12, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff3300,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Inner glow disc
    const discGeo = new THREE.CircleGeometry(5.5, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    group.add(disc);

    // Orbiting particles
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      particlePositions.push(
        Math.cos(angle) * 6.5,
        Math.sin(angle) * 6.5,
        0
      );
    }
    particleGeo.setAttribute("position", new THREE.Float32BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0xff8844,
        size: 0.3,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      })
    );
    group.add(particles);

    // Light
    const light = new THREE.PointLight(0xff6600, 2, 30);
    light.position.set(0, 0, 2);
    group.add(light);

    group.userData = { ring, disc, particles, light, opened: false };
    return group;
  }

  /** Open a gate visually (shrink & fade) */
  openGate(index) {
    if (index >= 0 && index < this.gates.length) {
      this.gates[index].userData.opened = true;
    }
  }

  /** Get the world position of a gate */
  getGatePosition(index) {
    if (index >= 0 && index < this.gates.length) {
      return this.gates[index].position;
    }
    return new THREE.Vector3();
  }

  update(elapsed, delta) {
    this.gates.forEach((gate, i) => {
      const data = gate.userData;
      if (data.opened) {
        // Shrink and fade out
        gate.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.05);
        data.disc.material.opacity *= 0.95;
        data.light.intensity *= 0.95;
      } else {
        // Rotate and pulse
        data.ring.rotation.z = elapsed * 0.3 + i;
        data.particles.rotation.z = -elapsed * 0.5 + i;
        data.disc.material.opacity = 0.2 + Math.sin(elapsed * 2 + i) * 0.1;
        data.light.intensity = 1.5 + Math.sin(elapsed * 3 + i) * 0.5;
      }
    });
  }
}
