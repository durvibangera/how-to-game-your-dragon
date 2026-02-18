/**
 * Audio manager using Web Audio API.
 * Generates procedural tones since we don't bundle audio files.
 * Can be extended to load actual audio files later.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
  }

  _init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn("Audio not available:", e);
    }
  }

  /**
   * Play a short celebration sound (correct answer)
   */
  playCorrect() {
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Happy ascending notes
    [440, 554, 659, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
    });
  }

  /**
   * Play a gentle wrong-answer sound
   */
  playWrong() {
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.3);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Play a gentle gate-opening whoosh
   */
  playGateOpen() {
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // White noise burst for whoosh
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(500, now);
    bandpass.frequency.linearRampToValueAtTime(2000, now + 0.3);
    bandpass.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(now);
    source.stop(now + 0.5);
  }

  /**
   * Play a gentle ambient tone for area transition
   */
  playAreaTransition() {
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [262, 330, 392].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 1);
    });
  }
}
