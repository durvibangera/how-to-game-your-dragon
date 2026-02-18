import * as THREE from "three";

/**
 * Generates procedural canvas-based textures for realistic surfaces.
 * All textures are created on the CPU via Canvas2D — no external assets needed.
 */
export class ProceduralTextures {

  static _cache = new Map();

  static _getCached(key, generator) {
    if (ProceduralTextures._cache.has(key)) return ProceduralTextures._cache.get(key);
    const tex = generator();
    ProceduralTextures._cache.set(key, tex);
    return tex;
  }

  /**
   * Perlin-like value noise for natural variation.
   */
  static _noise2D(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  static _smoothNoise(x, y, scale) {
    const sx = x / scale;
    const sy = y / scale;
    const ix = Math.floor(sx);
    const iy = Math.floor(sy);
    const fx = sx - ix;
    const fy = sy - iy;
    const a = ProceduralTextures._noise2D(ix, iy);
    const b = ProceduralTextures._noise2D(ix + 1, iy);
    const c = ProceduralTextures._noise2D(ix, iy + 1);
    const d = ProceduralTextures._noise2D(ix + 1, iy + 1);
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
  }

  static _fbm(x, y, octaves = 4, lacunarity = 2, gain = 0.5) {
    let value = 0, amplitude = 1, frequency = 1, max = 0;
    for (let i = 0; i < octaves; i++) {
      value += ProceduralTextures._smoothNoise(x * frequency, y * frequency, 1) * amplitude;
      max += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }
    return value / max;
  }

  /**
   * Grass ground texture — variation of greens with dirt patches.
   */
  static grassTexture(size = 256) {
    return ProceduralTextures._getCached(`grass_${size}`, () => ProceduralTextures._grassTextureImpl(size));
  }
  static _grassTextureImpl(size) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n1 = ProceduralTextures._fbm(x, y, 5, 2.2, 0.5);
        const n2 = ProceduralTextures._fbm(x + 500, y + 300, 3, 3, 0.4);
        const dirt = n2 > 0.62 ? 1 : 0;
        const r = dirt ? Math.floor(90 + n1 * 40) : Math.floor(40 + n1 * 30);
        const g = dirt ? Math.floor(70 + n1 * 30) : Math.floor(90 + n1 * 60);
        const b = dirt ? Math.floor(30 + n1 * 20) : Math.floor(25 + n1 * 15);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  /**
   * Rocky / stone texture with cracks and crevices.
   */
  static stoneTexture(size = 256, baseColor = [100, 100, 100]) {
    return ProceduralTextures._getCached(`stone_${size}_${baseColor.join(',')}`, () => ProceduralTextures._stoneTextureImpl(size, baseColor));
  }
  static _stoneTextureImpl(size, baseColor) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = ProceduralTextures._fbm(x, y, 6, 2.5, 0.45);
        const crack = ProceduralTextures._smoothNoise(x * 3, y * 3, 8);
        const darkCrack = crack > 0.48 && crack < 0.52 ? 0.5 : 1;
        const v = n * darkCrack;
        const r = Math.floor(baseColor[0] * v + Math.random() * 8);
        const g = Math.floor(baseColor[1] * v + Math.random() * 8);
        const b = Math.floor(baseColor[2] * v + Math.random() * 8);
        ctx.fillStyle = `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }

  /**
   * Bump/normal-like grayscale map for added depth illusion.
   */
  static bumpTexture(size = 128, scale = 15) {
    return ProceduralTextures._getCached(`bump_${size}_${scale}`, () => ProceduralTextures._bumpTextureImpl(size, scale));
  }
  static _bumpTextureImpl(size, scale) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = ProceduralTextures._fbm(x, y, 5, 2, 0.5);
        const v = Math.floor(n * 255);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }

  /**
   * Wood plank texture — brown with grain lines.
   */
  static woodTexture(size = 256) {
    return ProceduralTextures._getCached(`wood_${size}`, () => ProceduralTextures._woodTextureImpl(size));
  }
  static _woodTextureImpl(size) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const grain = Math.sin(y * 0.3 + ProceduralTextures._smoothNoise(x, y, 20) * 8) * 0.5 + 0.5;
        const n = ProceduralTextures._fbm(x, y, 3, 2, 0.4);
        const r = Math.floor(80 + grain * 50 + n * 20);
        const g = Math.floor(50 + grain * 30 + n * 15);
        const b = Math.floor(20 + grain * 15 + n * 10);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Water surface texture — blue/teal with caustic-like patterns.
   */
  static waterTexture(size = 128) {
    return ProceduralTextures._getCached(`water_${size}`, () => ProceduralTextures._waterTextureImpl(size));
  }
  static _waterTextureImpl(size) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n1 = ProceduralTextures._fbm(x, y, 4, 2, 0.5);
        const n2 = ProceduralTextures._fbm(x + 200, y + 200, 3, 3, 0.6);
        const caustic = Math.sin(n1 * 12) * 0.5 + 0.5;
        const r = Math.floor(20 + caustic * 40 + n2 * 30);
        const g = Math.floor(80 + caustic * 60 + n2 * 40);
        const b = Math.floor(130 + caustic * 70 + n2 * 30);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  /**
   * Lava texture — glowing orange/red with dark crust patches.
   */
  static lavaTexture(size = 128) {
    return ProceduralTextures._getCached(`lava_${size}`, () => ProceduralTextures._lavaTextureImpl(size));
  }
  static _lavaTextureImpl(size) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = ProceduralTextures._fbm(x, y, 5, 2.2, 0.5);
        const crust = n > 0.55 ? 1 : 0;
        const glow = ProceduralTextures._smoothNoise(x, y, 30);
        const r = crust ? Math.floor(40 + glow * 30) : Math.floor(200 + glow * 55);
        const g = crust ? Math.floor(15 + glow * 15) : Math.floor(80 + glow * 80);
        const b = crust ? Math.floor(5) : Math.floor(10 + glow * 20);
        ctx.fillStyle = `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  /**
   * Sand / dirt texture.
   */
  static sandTexture(size = 128) {
    return ProceduralTextures._getCached(`sand_${size}`, () => ProceduralTextures._sandTextureImpl(size));
  }
  static _sandTextureImpl(size) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = ProceduralTextures._fbm(x, y, 4, 2, 0.45);
        const speck = Math.random() * 0.05;
        const r = Math.floor(140 + n * 50 + speck * 255);
        const g = Math.floor(110 + n * 40 + speck * 200);
        const b = Math.floor(70 + n * 30 + speck * 100);
        ctx.fillStyle = `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }

  /**
   * Dark volcanic ground texture.
   */
  static volcanicTexture(size = 128) {
    return ProceduralTextures._getCached(`volcanic_${size}`, () => ProceduralTextures._volcanicTextureImpl(size));
  }
  static _volcanicTextureImpl(size) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = ProceduralTextures._fbm(x, y, 5, 2.3, 0.5);
        const hot = ProceduralTextures._smoothNoise(x + 100, y + 100, 40);
        const isHot = hot > 0.6;
        const r = isHot ? Math.floor(100 + n * 80) : Math.floor(30 + n * 30);
        const g = isHot ? Math.floor(30 + n * 30) : Math.floor(20 + n * 15);
        const b = isHot ? Math.floor(5) : Math.floor(10 + n * 10);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  /**
   * Cloud-like soft white texture.
   */
  static cloudTexture(size = 128) {
    return ProceduralTextures._getCached(`cloud_${size}`, () => ProceduralTextures._cloudTextureImpl(size));
  }
  static _cloudTextureImpl(size) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = ProceduralTextures._fbm(x, y, 6, 2, 0.55);
        const v = Math.floor(200 + n * 55);
        ctx.fillStyle = `rgb(${v},${v},${Math.min(255, v + 10)})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /**
   * Dark ominous ground for Area 6.
   */
  static darkRockTexture(size = 128) {
    return ProceduralTextures._getCached(`darkrock_${size}`, () => ProceduralTextures._darkRockTextureImpl(size));
  }
  static _darkRockTextureImpl(size) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const n = ProceduralTextures._fbm(x, y, 5, 2.5, 0.48);
        const redTint = ProceduralTextures._smoothNoise(x + 50, y + 50, 60);
        const r = Math.floor(25 + n * 25 + redTint * 15);
        const g = Math.floor(8 + n * 12);
        const b = Math.floor(8 + n * 10);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }

  /**
   * Creates an environment map (cube texture) from a gradient for reflections.
   */
  static createEnvMap(renderer, topColor = 0x88aacc, bottomColor = 0x222233) {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    const top = new THREE.Color(topColor);
    const bottom = new THREE.Color(bottomColor);
    gradient.addColorStop(0, `rgb(${Math.floor(top.r * 255)},${Math.floor(top.g * 255)},${Math.floor(top.b * 255)})`);
    gradient.addColorStop(1, `rgb(${Math.floor(bottom.r * 255)},${Math.floor(bottom.g * 255)},${Math.floor(bottom.b * 255)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
  }
}
