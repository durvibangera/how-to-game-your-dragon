import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TrackBuilder } from "./TrackBuilder";
import { MonthManager } from "../months/MonthManager";
import { ParticleSystem } from "../effects/ParticleSystem";
import { UIOverlay } from "../ui/UIOverlay";
import { AudioManager } from "../audio/AudioManager";
import { CameraController } from "./CameraController";
import { EpilogueSequence } from "../epilogue/EpilogueSequence";
import { GateSystem } from "../quiz/QuizGateSystem";
import { SiegeGame } from "../quiz/games/SiegeGame";

export class RollerCoasterEngine {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.running = false;
    this.currentMonth = 0;
    this.progress = 0; // 0 to 1 along entire track (including epilogue extension)
    this.speed = 0;
    this.targetSpeed = 0.015;
    this.paused = false;
    this.started = false;
    this.inEpilogue = false;
    this.epilogueTriggered = false;

    // Dragon model
    this.dragonModel = null;
    this.dragonMixer = null;
    this.dragonReady = false;

    // Dragon fall state
    this.dragonFalling = false;
    this.dragonFallTimer = 0;
    this.dragonFallStartY = 0;
    this.siegeGame = null;
    this.skipButton = null;

    // 6 months × 120 units = 720, epilogue = 300 units, total = 1020
    // Month portion ends at 720/1020 ≈ 0.7059
    this.monthTrackEnd = 720 / 1020;

    this._initRenderer();
    this._initScene();
    this._initLights();

    this.trackBuilder = new TrackBuilder(this.scene);
    this.track = this.trackBuilder.build();

    this.cameraController = new CameraController(this.camera, this.track);
    this.monthManager = new MonthManager(this.scene);
    this.particleSystem = new ParticleSystem(this.scene);
    this.audioManager = new AudioManager();
    this.ui = new UIOverlay(this.container);
    this.gateSystem = new GateSystem(this.scene, this.ui, this.particleSystem, this.trackBuilder.build ? this.track : this.track, this.monthTrackEnd);

    // Load Toothless dragon GLB model
    this._loadDragonModel();

    this.epilogue = new EpilogueSequence(this.container, this.scene, this.camera, this.renderer, this.ui, {
      onPause: () => { this.paused = true; },
      onResume: () => { this.paused = false; }
    });

    this._onResize = this._onResize.bind(this);
    window.addEventListener("resize", this._onResize);

    this.ui.showStartScreen(() => this._begin());
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, 
      logarithmicDepthBuffer: true,
      powerPreference: "high-performance",
      stencil: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.5,
      2000
    );
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000011, 0.003);
    this.scene.background = new THREE.Color(0x000011);
  }

  _initLights() {
    const ambient = new THREE.AmbientLight(0x505070, 0.8);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xfff5e6, 1.2);
    dir.position.set(50, 80, 50);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    dir.shadow.camera.near = 1;
    dir.shadow.camera.far = 300;
    dir.shadow.camera.left = -60;
    dir.shadow.camera.right = 60;
    dir.shadow.camera.top = 60;
    dir.shadow.camera.bottom = -60;
    this.scene.add(dir);

    const hemiLight = new THREE.HemisphereLight(0x88aacc, 0x443322, 0.4);
    this.scene.add(hemiLight);
  }

  _begin() {
    this.started = true;
    this.speed = 0;
    this.targetSpeed = 0.012;
    this.ui.showMonthTitle(0);
    this.monthManager.activateMonth(0, this.progress);
    this._showSkipButton();
  }

  _showSkipButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Skip to Final Game \u25B6';
    btn.style.cssText = `
      position:fixed;bottom:32px;right:32px;z-index:2500;
      font-family:'Georgia',serif;font-size:clamp(0.8rem,1.6vw,1rem);
      padding:10px 24px;border:1px solid rgba(255,255,255,0.3);
      background:rgba(0,0,0,0.55);color:rgba(255,255,255,0.85);
      border-radius:30px;cursor:pointer;backdrop-filter:blur(6px);
      transition:all 0.3s ease;letter-spacing:0.05em;
    `;
    btn.onmouseenter = () => {
      btn.style.background = 'rgba(255,68,0,0.45)';
      btn.style.borderColor = 'rgba(255,68,0,0.7)';
      btn.style.color = '#fff';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'rgba(0,0,0,0.55)';
      btn.style.borderColor = 'rgba(255,255,255,0.3)';
      btn.style.color = 'rgba(255,255,255,0.85)';
    };
    btn.addEventListener('click', () => {
      this._skipToFinalGame();
    });
    this.container.appendChild(btn);
    this.skipButton = btn;
  }

  _removeSkipButton() {
    if (this.skipButton) {
      this.skipButton.remove();
      this.skipButton = null;
    }
  }

  _skipToFinalGame() {
    this._removeSkipButton();
    this.inEpilogue = true;
    this.epilogueTriggered = true;
    this.targetSpeed = 0;
    this.speed = 0;
    this.ui.hideProgressBar();
    this._launchSiegeGame();
  }

  _showFinale() {
    if (this.inEpilogue) return;
    this.inEpilogue = true;
    this.targetSpeed = 0;
    this.speed = 0;

    // Remove skip button since we're finishing naturally
    this._removeSkipButton();

    // Hide progress bar
    this.ui.hideProgressBar();

    // Start dragon fall animation
    this._startDragonFall();
  }

  _startDragonFall() {
    this.dragonFalling = true;
    this.dragonFallTimer = 0;
    if (this.dragonModel) {
      this.dragonFallStartY = this.dragonModel.position.y;
    }

    // Show "hit" flash overlay
    const flash = document.createElement('div');
    flash.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(255,0,0,0.6);z-index:3000;pointer-events:none;
      transition:opacity 0.8s ease;
    `;
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0'; }, 100);
    setTimeout(() => flash.remove(), 900);

    // After 3s fall, show hurt message then launch siege
    setTimeout(() => {
      this._showHurtOverlayAndLaunchSiege();
    }, 3000);
  }

  _showHurtOverlayAndLaunchSiege() {
    // Hurt message overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:rgba(0,0,0,0.85);z-index:4000;
      font-family:'Georgia',serif;color:#ff4400;
      animation:fadeIn 1s ease;
    `;
    overlay.innerHTML = `
      <h1 style="font-size:clamp(2rem,5vw,3.5rem);text-shadow:0 0 30px rgba(255,68,0,0.5);margin-bottom:0.5em;">
        Toothless is hit!
      </h1>
      <p style="font-size:clamp(1rem,2.5vw,1.3rem);color:#ffaa66;font-style:italic;">
        The Red Death struck him down... Fight to save your dragon!
      </p>
    `;
    document.body.appendChild(overlay);

    // After 2.5s, fade out and launch siege game
    setTimeout(() => {
      overlay.style.transition = 'opacity 1s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        this._launchSiegeGame();
      }, 1000);
    }, 2500);
  }

  _launchSiegeGame() {
    // Stop the 3D rendering
    this.running = false;

    // Hide the Three.js canvas
    if (this.renderer.domElement) {
      this.renderer.domElement.style.display = 'none';
    }

    // Hide any UI overlay
    this.ui.dispose();

    // Create siege game container
    const siegeContainer = document.createElement('div');
    siegeContainer.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      overflow:hidden;background:#000;z-index:5000;
    `;
    this.container.appendChild(siegeContainer);

    // Launch the siege game
    this.siegeGame = new SiegeGame(siegeContainer, (success) => {
      // Game finished callback
      siegeContainer.remove();
      if (success) {
        this._showVictoryScreen();
      } else {
        // Retry — relaunch siege
        this._launchSiegeGame();
      }
    });
  }

  _showVictoryScreen() {
    const screen = document.createElement('div');
    screen.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:radial-gradient(ellipse at center, rgba(10,30,10,0.95), rgba(0,0,0,0.98));
      z-index:6000;font-family:'Georgia',serif;
      animation:fadeIn 2s ease;
    `;
    screen.innerHTML = `
      <h1 style="font-size:clamp(2.5rem,6vw,4rem);color:#44ff88;text-shadow:0 0 40px rgba(68,255,136,0.5);margin-bottom:0.3em;">
        You saved Toothless!
      </h1>
      <p style="font-size:clamp(1rem,3vw,1.5rem);color:rgba(200,255,220,0.8);font-style:italic;letter-spacing:0.1em;margin-bottom:2em;">
        The Night Fury rises again. The bond between dragon and rider is unbreakable.
      </p>
      <button style="
        font-family:'Georgia',serif;font-size:clamp(1rem,2.5vw,1.3rem);
        padding:16px 48px;border:1px solid rgba(68,255,136,0.4);
        background:rgba(68,255,136,0.15);color:#44ff88;
        border-radius:50px;cursor:pointer;
        transition:all 0.3s ease;letter-spacing:0.1em;
      " onmouseover="this.style.background='rgba(68,255,136,0.3)';this.style.boxShadow='0 0 30px rgba(68,255,136,0.3)'"
         onmouseout="this.style.background='rgba(68,255,136,0.15)';this.style.boxShadow='none'"
      >Ride Again</button>
    `;
    document.body.appendChild(screen);
    screen.querySelector('button').addEventListener('click', () => {
      window.location.reload();
    });
  }

  start() {
    this.running = true;
    this._animate();
  }

  _animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this._animate());

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    if (this.started && !this.paused) {
      // Smooth speed interpolation
      this.speed += (this.targetSpeed - this.speed) * 0.02;
      this.progress += this.speed * delta;

      if (this.progress >= 0.999) {
        this.progress = 0.999;
        this.speed = 0;
      }

      if (!this.inEpilogue) {
        // Convert track progress to month progress (only the month portion)
        const monthProgress = (this.progress / this.monthTrackEnd) * 6;
        const nextMonthBoundary = this.currentMonth + 1;

        if (
          monthProgress >= nextMonthBoundary &&
          this.currentMonth < 5
        ) {
          this.currentMonth++;
          this.ui.showMonthTitle(this.currentMonth);
          // Open the gate hoop visually
          this.gateSystem.openGate(this.currentMonth - 1);
          this.particleSystem.burstAt(
            this.gateSystem.getGatePosition(this.currentMonth - 1),
            "celebration"
          );
        }

        // Trigger epilogue when player reaches end of month 12
        if (
          this.currentMonth >= 5 &&
          this.progress >= this.monthTrackEnd * 0.98 &&
          !this.epilogueTriggered
        ) {
          this.epilogueTriggered = true;
          this._showFinale();
        }

        // Update month-specific speed
        this._updateMonthSpeed();
      }
    }

    // Update camera
    this.cameraController.update(this.progress, delta);

    // Update dragon position on track (or fall animation)
    if (this.dragonFalling) {
      this._updateDragonFall(delta, elapsed);
    } else {
      this._updateDragon(this.progress, delta, elapsed);
    }

    if (!this.inEpilogue) {
      // Convert progress to month-space for MonthManager
      const monthProgress = Math.min(this.progress / this.monthTrackEnd, 1);
      this.monthManager.update(elapsed, delta, monthProgress);
      this.particleSystem.update(delta, elapsed);
      this.gateSystem.update(elapsed, delta);
      this.trackBuilder.updateHoops(elapsed);
      this._updateAtmosphere();
    } else {
      // Epilogue mode — update epilogue sequence
      this.epilogue.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _updateMonthSpeed() {
    const speeds = [0.012, 0.013, 0.014, 0.011, 0.013, 0.010];
    const monthProgress = Math.min(this.progress / this.monthTrackEnd, 0.999);
    const monthIndex = Math.min(Math.floor(monthProgress * 6), 5);
    this.targetSpeed = speeds[monthIndex];
  }

  _updateAtmosphere() {
    const monthProgress = Math.min(this.progress / this.monthTrackEnd, 0.999);
    const monthIndex = Math.min(Math.floor(monthProgress * 6), 5);
    const atmospheres = [
      { bg: 0x88bbdd, fog: 0x99ccee, fogDensity: 0.003 },  // Berk Village - overcast sky
      { bg: 0x2a4a3a, fog: 0x1a3a2a, fogDensity: 0.004 },  // The Cove - misty forest
      { bg: 0x8b7355, fog: 0x9a8365, fogDensity: 0.003 },  // Training Arena - dusty
      { bg: 0xaaddff, fog: 0xbbddff, fogDensity: 0.002 },  // Cloud Kingdom - bright sky
      { bg: 0x1a0a00, fog: 0x2a1500, fogDensity: 0.005 },  // Volcanic Nest - dark smoke
      { bg: 0x110000, fog: 0x1a0505, fogDensity: 0.004 },  // Red Death Lair - ominous
    ];

    const atm = atmospheres[monthIndex];
    const localProgress = (monthProgress * 6) - monthIndex;

    // Smooth transition
    const target = new THREE.Color(atm.bg);
    this.scene.background.lerp(target, 0.02);
    this.scene.fog.color.lerp(new THREE.Color(atm.fog), 0.02);
    this.scene.fog.density += (atm.fogDensity - this.scene.fog.density) * 0.02;
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  dispose() {
    this.running = false;
    window.removeEventListener("resize", this._onResize);
    this._removeSkipButton();
    if (this.epilogue) this.epilogue.dispose();
    if (this.dragonModel) {
      this.scene.remove(this.dragonModel);
    }
    if (this.siegeGame && this.siegeGame.dispose) {
      this.siegeGame.dispose();
    }
    this.renderer.dispose();
    this.ui.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }

  async _loadDragonModel() {
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync('/toothless_httyd.glb');
      this.dragonModel = gltf.scene;

      // Auto-scale based on bounding box
      const box = new THREE.Box3().setFromObject(this.dragonModel);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 6;
      const scaleFactor = targetSize / maxDim;
      this.dragonModel.scale.setScalar(scaleFactor);

      // Enable shadows on all meshes
      this.dragonModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.scene.add(this.dragonModel);
      this.dragonReady = true;

      // Setup animations if available
      if (gltf.animations && gltf.animations.length > 0) {
        this.dragonMixer = new THREE.AnimationMixer(this.dragonModel);
        gltf.animations.forEach((clip) => {
          this.dragonMixer.clipAction(clip).play();
        });
      }
    } catch (err) {
      console.warn('Could not load dragon GLB, using fallback:', err);
      this._createFallbackDragon();
    }
  }

  _createFallbackDragon() {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CapsuleGeometry(1, 3, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    group.add(body);

    // Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.quadraticCurveTo(-3, 2, -6, 1);
    wingShape.quadraticCurveTo(-4, -1, 0, 0);
    const wingGeo = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, side: THREE.DoubleSide, roughness: 0.8
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(0, 0.5, -1);
    leftWing.rotation.y = -Math.PI / 2;
    group.add(leftWing);
    const rightWing = leftWing.clone();
    rightWing.position.set(0, 0.5, 1);
    rightWing.rotation.y = Math.PI / 2;
    rightWing.scale.x = -1;
    group.add(rightWing);

    // Head
    const headGeo = new THREE.SphereGeometry(0.7, 8, 8);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(2.5, 0, 0);
    group.add(head);

    // Eyes (green like Toothless)
    const eyeGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x44ff44 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(2.9, 0.2, -0.35);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(2.9, 0.2, 0.35);
    group.add(rightEye);

    this.dragonModel = group;
    this.scene.add(this.dragonModel);
    this.dragonReady = true;
  }

  _updateDragon(progress, delta, elapsed) {
    if (!this.dragonReady || !this.dragonModel) return;

    const t = Math.min(Math.max(progress, 0), 0.998);
    const tAhead = Math.min(t + 0.003, 0.999);

    const pos = this.track.getPointAt(t);
    const ahead = this.track.getPointAt(tAhead);

    // Bobbing motion for natural flight feel
    const bob = Math.sin(elapsed * 2.5) * 0.4;
    this.dragonModel.position.set(pos.x, pos.y + 2 + bob, pos.z);

    // Orient dragon along the flight direction
    const direction = new THREE.Vector3().subVectors(ahead, pos).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4();
    matrix.lookAt(new THREE.Vector3(), direction, up);

    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(matrix);
    // Smooth rotation for fluid turns
    this.dragonModel.quaternion.slerp(targetQuat, 0.08);

    // Subtle banking on turns
    if (t + 0.01 < 0.999) {
      const tangent = this.track.getTangentAt(t);
      const tangentAhead = this.track.getTangentAt(Math.min(t + 0.01, 0.999));
      const cross = new THREE.Vector3().crossVectors(tangent, tangentAhead);
      const bankAngle = cross.y * 8;
      this.dragonModel.rotation.z += bankAngle * 0.05;
    }

    // Update animation mixer if available
    if (this.dragonMixer) {
      this.dragonMixer.update(delta);
    }
  }

  _updateDragonFall(delta, elapsed) {
    if (!this.dragonReady || !this.dragonModel) return;

    this.dragonFallTimer += delta;

    // Tilt the dragon nose-down and spin slightly
    this.dragonModel.rotation.x += delta * 1.5;
    this.dragonModel.rotation.z += delta * 0.8;

    // Fall with acceleration (gravity-like)
    const gravity = 15;
    const fallDist = 0.5 * gravity * this.dragonFallTimer * this.dragonFallTimer;
    this.dragonModel.position.y = this.dragonFallStartY - fallDist;

    // Add some forward drift
    this.dragonModel.position.z -= delta * 5;

    // Smoke trail particles
    if (Math.random() < 0.3) {
      this.particleSystem.burstAt(this.dragonModel.position.clone(), 'celebration');
    }

    // Camera follows the falling dragon
    this.camera.position.lerp(
      new THREE.Vector3(
        this.dragonModel.position.x + 8,
        this.dragonModel.position.y + 5,
        this.dragonModel.position.z + 15
      ),
      0.03
    );
    this.camera.lookAt(this.dragonModel.position);

    if (this.dragonMixer) {
      this.dragonMixer.update(delta);
    }
  }
}
