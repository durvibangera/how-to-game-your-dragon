import * as THREE from "three";

/**
 * Builds the dragon flight path as a continuous spline through 6 HTTYD areas + epilogue.
 * No visible track lines - just the invisible curve and fire hoops.
 */
export class TrackBuilder {
  constructor(scene) {
    this.scene = scene;
    this.trackGroup = new THREE.Group();
    this.hoops = [];
    this.scene.add(this.trackGroup);
  }

  build() {
    const points = this._generateTrackPoints();
    this.curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.1);
    this._createFlightHoops();
    return this.curve;
  }

  _generateTrackPoints() {
    const points = [];
    const areaLength = 120;
    const totalAreas = 6;

    for (let m = 0; m < totalAreas; m++) {
      const baseZ = -m * areaLength;
      const baseX = Math.sin(m * 0.5) * 40;
      const pts = this._getAreaPoints(m, baseX, baseZ, areaLength);
      points.push(...pts);
    }

    // EPILOGUE TRACK
    const epilogueStart = -totalAreas * areaLength;
    const epilogueLength = 300;
    const epilogueSegments = 20;
    const lastAreaBaseX = Math.sin(5 * 0.5) * 40;

    for (let i = 1; i <= epilogueSegments; i++) {
      const t = i / epilogueSegments;
      const easeOut = 1 - Math.pow(1 - t, 3);
      const z = epilogueStart - t * epilogueLength;
      const x = lastAreaBaseX * (1 - easeOut * 0.8) + Math.sin(t * Math.PI * 0.3) * 5;
      const y = 8 + easeOut * 20;
      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }

  _getAreaPoints(areaIndex, baseX, baseZ, len) {
    const pts = [];
    const segments = 16;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const z = baseZ - t * len;
      let x = baseX;
      let y = 8;

      switch (areaIndex) {
        case 0: // Berk Village - gentle weave, low altitude
          x += Math.sin(t * Math.PI) * 15;
          y += Math.sin(t * Math.PI) * 5;
          break;
        case 1: // The Cove - swooping S-curve into the cove
          x += Math.sin(t * Math.PI * 2) * 20;
          y += 3 + Math.sin(t * Math.PI) * 5;
          break;
        case 2: // Training Arena - tighter maneuvers
          x += Math.sin(t * Math.PI * 1.5) * 25;
          y += 5 + Math.sin(t * Math.PI * 2) * 8;
          break;
        case 3: // Cloud Kingdom - high altitude soaring
          x += Math.sin(t * Math.PI * 2) * 30;
          y += 15 + Math.sin(t * Math.PI) * 12;
          break;
        case 4: // Volcanic Nest - dramatic dive and climb
          x += Math.sin(t * Math.PI) * 15;
          y += t < 0.4 ? 12 - t * 25 : 2 + (t - 0.4) * 20;
          break;
        case 5: // Red Death's Lair - intense final approach
          x += Math.sin(t * Math.PI * 2.5) * 35;
          y += 5 + Math.sin(t * Math.PI * 0.8) * 15;
          break;
      }

      pts.push(new THREE.Vector3(x, y, z));
    }

    return pts;
  }

  _createFlightHoops() {
    const totalLength = this.curve.getLength();
    const hoopInterval = 65;
    const numHoops = Math.floor(totalLength / hoopInterval);

    for (let i = 1; i < numHoops; i++) {
      const t = (i * hoopInterval) / totalLength;
      if (t > 0.95) continue;

      const pos = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t);

      const group = new THREE.Group();

      const fireColor = i % 3 === 0 ? 0xff4400 : i % 3 === 1 ? 0xff8800 : 0xffaa00;

      // Main fire ring
      const ringGeo = new THREE.TorusGeometry(7, 0.55, 8, 24);
      const ringMat = new THREE.MeshStandardMaterial({
        color: fireColor,
        emissive: fireColor,
        emissiveIntensity: 0.7,
        metalness: 0.6,
        roughness: 0.25,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.castShadow = true;
      group.add(ring);

      // Structural outer frame
      const outerRingGeo = new THREE.TorusGeometry(8.2, 0.35, 8, 24);
      const outerRingMat = new THREE.MeshStandardMaterial({
        color: 0x3a2a18,
        metalness: 0.85,
        roughness: 0.35,
      });
      const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRing.castShadow = true;
      group.add(outerRing);

      // Inner glow disc
      const glowGeo = new THREE.CircleGeometry(6.5, 12);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      group.add(new THREE.Mesh(glowGeo, glowMat));

      // Halo glow ring (additive, bigger)
      const haloGeo = new THREE.TorusGeometry(7, 1.2, 4, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: fireColor,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      group.add(halo);

      const light = new THREE.PointLight(fireColor, 2, 30, 1.5);
      light.castShadow = false;
      group.add(light);

      group.position.copy(pos);
      group.position.y += 3;

      const lookTarget = pos.clone().sub(tangent.clone().multiplyScalar(10));
      lookTarget.y = group.position.y;
      group.lookAt(lookTarget);

      group.userData = { ring, light, halo, baseY: group.position.y };
      this.hoops.push(group);
      this.trackGroup.add(group);
    }
  }

  updateHoops(elapsed) {
    this.hoops.forEach((hoop, i) => {
      const data = hoop.userData;
      hoop.position.y = data.baseY + Math.sin(elapsed * 1.5 + i * 0.5) * 0.5;
      if (data.light) {
        data.light.intensity = 1.8 + Math.sin(elapsed * 4 + i * 1.3) * 0.7;
      }
      if (data.ring) {
        data.ring.rotation.z = elapsed * 0.3 + i;
        data.ring.material.emissiveIntensity = 0.5 + Math.sin(elapsed * 3 + i * 0.7) * 0.25;
      }
      if (data.halo) {
        data.halo.material.opacity = 0.06 + Math.sin(elapsed * 2.5 + i) * 0.03;
      }
    });
  }
}
