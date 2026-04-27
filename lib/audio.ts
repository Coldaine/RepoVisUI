/**
 * Procedural Audio System for RepoVis
 * Generates minimalist, non-intrusive UI sounds using Web Audio API to avoid external asset dependencies.
 */

export type SeverityType = 'healthy' | 'warning' | 'critical' | 'stable';

class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // Ambient Texture State
  private ambientOsc: OscillatorNode | null = null;
  private ambientLFO: OscillatorNode | null = null;
  private ambientLfoGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientRunning = false;

  private init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15; // Global volume throttle
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  private resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play a minimalist "tick" or "hover" sound, reactive to severity
   */
  tick(severity: SeverityType = 'healthy') {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    if (severity === 'critical') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.1);
      
      env.gain.setValueAtTime(0, this.ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.01);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } else if (severity === 'warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);
      
      env.gain.setValueAtTime(0, this.ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.005);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.05);

      env.gain.setValueAtTime(0, this.ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.005);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    osc.connect(env);
    env.connect(this.masterGain);
  }

  /**
   * Play a resonant "blip" or "select" sound
   */
  blip() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);

    env.gain.setValueAtTime(0, this.ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(env);
    env.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  /**
   * Play a spatial "whoosh" for expansions/transitions
   */
  whoosh() {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();
    const noise = this.ctx.createBufferSource();
    
    // Generate white noise buffer
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    noise.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);

    env.gain.setValueAtTime(0, this.ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.1);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.5);
  }

  /**
   * Dynamic Ambient Textures
   */
  startAmbient(severity: SeverityType = 'healthy') {
    this.init();
    this.resume();
    if (!this.ctx || !this.masterGain || this.isAmbientRunning) return;

    this.ambientOsc = this.ctx.createOscillator();
    this.ambientLFO = this.ctx.createOscillator();
    this.ambientLfoGain = this.ctx.createGain();
    this.ambientGain = this.ctx.createGain();

    // Setup LFO for gentle pulsing of volume
    this.ambientLFO.type = 'sine';
    this.ambientLFO.frequency.value = 0.1; // 10 second cycle

    // The amount the LFO affects the master ambient gain
    this.ambientLfoGain.gain.value = 0.5;
    
    // Connect LFO to gain
    this.ambientLFO.connect(this.ambientLfoGain);
    
    this.ambientGain.gain.value = 0; // Start silenced
    
    // Smoothly fade in ambient track
    this.ambientGain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 5);

    this.ambientOsc.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.updateAmbient(severity);

    this.ambientOsc.start();
    this.ambientLFO.start();
    this.isAmbientRunning = true;
  }

  get isAmbientEnabled() {
    return this.isAmbientRunning;
  }

  toggleAmbient(severity: SeverityType = 'healthy') {
    if (this.isAmbientRunning) {
      this.stopAmbient();
    } else {
      this.startAmbient(severity);
    }
  }

  updateAmbient(severity: SeverityType) {
    if (!this.ctx || !this.ambientOsc || !this.ambientLFO) return;
    
    const now = this.ctx.currentTime;
    if (severity === 'critical') {
      this.ambientOsc.type = 'sawtooth';
      this.ambientOsc.frequency.linearRampToValueAtTime(45, now + 2); // Deeper, more rumble
      this.ambientLFO.frequency.linearRampToValueAtTime(0.5, now + 2); // Faster pulse
    } else if (severity === 'warning') {
      this.ambientOsc.type = 'triangle';
      this.ambientOsc.frequency.linearRampToValueAtTime(55, now + 2);
      this.ambientLFO.frequency.linearRampToValueAtTime(0.2, now + 2);
    } else {
      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.linearRampToValueAtTime(65, now + 2); // Calm, low hum
      this.ambientLFO.frequency.linearRampToValueAtTime(0.08, now + 2); // Very slow breathing pulse
    }
  }

  stopAmbient() {
    if (!this.ctx || !this.isAmbientRunning) return;
    if (this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    }
    setTimeout(() => {
      this.ambientOsc?.stop();
      this.ambientLFO?.stop();
      this.ambientOsc?.disconnect();
      this.ambientLFO?.disconnect();
      this.ambientLfoGain?.disconnect();
      this.ambientGain?.disconnect();
      this.ambientOsc = null;
      this.ambientLFO = null;
      this.ambientLfoGain = null;
      this.ambientGain = null;
      this.isAmbientRunning = false;
    }, 2500);
  }
}

export const sounds = new SoundSynth();

