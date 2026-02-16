import * as THREE from "three";

/**
 * Controls the camera to follow behind the dragon in a cinematic third-person flight view.
 * The camera stays behind and above the dragon, looking ahead at its position.
 */
export class CameraController {
  constructor(camera, curve) {
    this.camera = camera;
    this.curve = curve;
    this.heightOffset = 6;
    this.followDistance = 0.012; // how far behind on the curve (0-1 fraction)
    this.smoothPosition = new THREE.Vector3();
    this.smoothLookAt = new THREE.Vector3();
    this.initialized = false;
    this.shake = 0;
  }

  update(progress, delta) {
    const t = Math.min(Math.max(progress, 0), 0.999);
    const tBehind = Math.max(t - this.followDistance, 0);
    const tLook = Math.min(t + 0.002, 0.999);

    const dragonPos = this.curve.getPointAt(t);
    const behindPos = this.curve.getPointAt(tBehind);
    const lookTarget = this.curve.getPointAt(tLook);

    // Camera position: behind and above the dragon
    const cameraTarget = behindPos.clone();
    cameraTarget.y = dragonPos.y + this.heightOffset;

    // Subtle cinematic sway
    const sway = Math.sin(Date.now() * 0.0008) * 0.3;
    cameraTarget.y += sway;

    // Look at point slightly ahead of dragon center
    const lookAtTarget = dragonPos.clone();
    lookAtTarget.y += 2.5; // look at the dragon's center

    // Add subtle shake based on speed
    const shakeAmount = this.shake * 0.08;
    if (shakeAmount > 0.01) {
      cameraTarget.x += Math.sin(Date.now() * 0.01) * shakeAmount;
      cameraTarget.y += Math.cos(Date.now() * 0.013) * shakeAmount * 0.5;
    }

    if (!this.initialized) {
      this.smoothPosition.copy(cameraTarget);
      this.smoothLookAt.copy(lookAtTarget);
      this.initialized = true;
    }

    // Smooth interpolation for cinematic camera feel
    this.smoothPosition.lerp(cameraTarget, 0.06);
    this.smoothLookAt.lerp(lookAtTarget, 0.08);

    this.camera.position.copy(this.smoothPosition);
    this.camera.lookAt(this.smoothLookAt);
  }

  setShake(amount) {
    this.shake = amount;
  }
}
