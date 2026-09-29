/**
 * Web Audio API procedural sound synthesizer
 * Zero external audio files required, runs 100% in-browser!
 * Includes authentic Nakime Biwa (Infinity Castle Guitar) synthesis!
 */

class SoundEffectsManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isSoundtrackPlaying = false;
    this.activeSoundtrack = 'none';
    this.soundtrackInterval = null;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.isSoundtrackPlaying) {
      this.stopNakimeSoundtrack();
    }
    return this.enabled;
  }

  // Katana Slash Sound
  playSlash() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {
      // Audio might be blocked before user gesture
    }
  }

  // Cinematic Nichirin Katana Draw and Godspeed Slash
  playSwordDrawAndSlash() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // 1. Steel Blade Sheath Ring (Metallic unsheathing scraper)
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ringOsc.type = "sine";
      ringOsc.frequency.setValueAtTime(2400, t);
      ringOsc.frequency.exponentialRampToValueAtTime(3200, t + 0.18);
      ringGain.gain.setValueAtTime(0.01, t);
      ringGain.gain.linearRampToValueAtTime(0.2, t + 0.05);
      ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      ringOsc.connect(ringGain);
      ringGain.connect(this.ctx.destination);
      ringOsc.start(t);
      ringOsc.stop(t + 0.46);

      // 2. High-speed air displacement whoosh
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(3500, t + 0.12);
      filter.frequency.exponentialRampToValueAtTime(250, t + 0.45);
      filter.Q.value = 3.0;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, t + 0.12);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.48);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t + 0.12);

      // 3. Lightning / Nichirin Blade Impact Crack
      const strikeOsc = this.ctx.createOscillator();
      const strikeGain = this.ctx.createGain();
      strikeOsc.type = "sawtooth";
      strikeOsc.frequency.setValueAtTime(1500, t + 0.25);
      strikeOsc.frequency.exponentialRampToValueAtTime(70, t + 0.6);
      strikeGain.gain.setValueAtTime(0.38, t + 0.25);
      strikeGain.gain.exponentialRampToValueAtTime(0.005, t + 0.65);
      strikeOsc.connect(strikeGain);
      strikeGain.connect(this.ctx.destination);
      strikeOsc.start(t + 0.25);
      strikeOsc.stop(t + 0.66);

      // 4. Sub-bass shockwave boom
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(160, t + 0.28);
      subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.75);
      subGain.gain.setValueAtTime(0.45, t + 0.28);
      subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(t + 0.28);
      subOsc.stop(t + 0.82);

      // 5. Nakime's Iconic Biwa Dimensional Strike & Reverb (鳴女 琵琶 鳴響)
      setTimeout(() => {
        this.playNakimeBiwa(1.0);
      }, 240);
      setTimeout(() => {
        this.playNakimeBiwa(1.33); // Dimensional fourth interval echo
      }, 460);
    } catch (e) {
      // Audio might be blocked before user gesture
    }
  }

  // Kasugai Crow Dispatch Chirp
  playCrow() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(850, this.ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(500, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.27);
    } catch (e) {
      // Ignore
    }
  }

  // Chime / Gong for Deployment
  playChime() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C E G C chord
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8 + idx * 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + 0.9 + idx * 0.05);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Nakime's Biwa Guitar Pluck (Infinity Castle Dimensional Shift Sound)
  playNakimeBiwa(pitchMultiplier = 1.0) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // Traditional Japanese Biwa tuning: D3 (~146.8 Hz)
      const baseFreq = 146.83 * pitchMultiplier;

      // 1. Sharp plectrum strike transient (Sawari click)
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = "sawtooth";
      snapOsc.frequency.setValueAtTime(1400, t);
      snapOsc.frequency.exponentialRampToValueAtTime(100, t + 0.035);
      snapGain.gain.setValueAtTime(0.38, t);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapOsc.start(t);
      snapOsc.stop(t + 0.045);

      // 2. Silk String Resonance with Yuri Pitch-Bend
      const stringOsc = this.ctx.createOscillator();
      const stringGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      stringOsc.type = "sawtooth";
      // Microtonal pitch bend slide
      stringOsc.frequency.setValueAtTime(baseFreq * 1.04, t);
      stringOsc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.07);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(320, t + 1.2);
      filter.Q.setValueAtTime(4.8, t);

      stringGain.gain.setValueAtTime(0.38, t);
      stringGain.gain.exponentialRampToValueAtTime(0.001, t + 1.9);

      stringOsc.connect(filter);
      filter.connect(stringGain);

      // 3. Infinity Castle Cavernous Echo Delay
      const delay = this.ctx.createDelay();
      const delayGain = this.ctx.createGain();
      delay.delayTime.setValueAtTime(0.24, t);
      delayGain.gain.setValueAtTime(0.35, t);

      stringGain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(delay);
      delayGain.connect(this.ctx.destination);

      stringGain.connect(this.ctx.destination);

      stringOsc.start(t);
      stringOsc.stop(t + 2.0);
    } catch (e) {
      // Audio policy
    }
  }

  // Nakime Double Strike (Dimensional Room Shifting)
  playNakimeShift() {
    this.playNakimeBiwa(1.0);
    setTimeout(() => {
      this.playNakimeBiwa(1.33); // Fourth interval
    }, 180);
  }

  // Nakime Biwa Soundtrack Loop
  toggleNakimeSoundtrack(onStateChange) {
    return this.toggleSoundtrack('nakime', onStateChange);
  }

  // Unified soundtrack toggle ('nakime' | 'tanjiro')
  toggleSoundtrack(trackName, onStateChange) {
    if (this.activeSoundtrack === trackName) {
      this.stopSoundtrack();
      if (onStateChange) onStateChange('none');
      return 'none';
    } else {
      this.stopSoundtrack();
      if (trackName === 'nakime') {
        this.startNakimeSoundtrack();
      } else if (trackName === 'tanjiro') {
        this.startTanjiroSoundtrack();
      }
      if (onStateChange) onStateChange(trackName);
      return trackName;
    }
  }

  startNakimeSoundtrack() {
    if (!this.enabled) return;
    this.init();
    this.activeSoundtrack = 'nakime';
    this.isSoundtrackPlaying = true;

    // Initial strike
    this.playNakimeShift();

    // Recurring haunting Biwa strikes
    this.soundtrackInterval = setInterval(() => {
      if (this.activeSoundtrack !== 'nakime' || !this.enabled) {
        this.stopSoundtrack();
        return;
      }
      const intervals = [1.0, 1.33, 1.5, 0.75, 1.12];
      const randomPitch = intervals[Math.floor(Math.random() * intervals.length)];
      this.playNakimeBiwa(randomPitch);

      if (Math.random() < 0.45) {
        setTimeout(() => this.playNakimeBiwa(randomPitch * 1.33), 220);
      }
    }, 3600);
  }

  // Shakuhachi Flute Note for Tanjiro Theme
  playShakuhachi(freq, duration = 0.8, offset = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Flute tone: sine with mild harmonic overtones
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);

      // Breath vibrato LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, t);
      lfoGain.gain.setValueAtTime(freq * 0.015, t);
      lfo.connect(osc.frequency);
      lfo.start(t + 0.15);
      lfo.stop(t + duration);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, t);
      filter.Q.setValueAtTime(2.5, t);

      // Soft breath attack & lyrical release
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch (e) {
      // Audio policy
    }
  }

  // Koto Harp Pluck
  playKoto(freq, offset = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(freq * 1.8, t);
      filter.Q.setValueAtTime(3, t);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.7);
    } catch (e) {
      // Ignore
    }
  }

  // Taiko Drum Pulse
  playTaiko(offset = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.35);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.55);
    } catch (e) {
      // Ignore
    }
  }

  // Kamado Tanjiro no Uta / Hinokami Kagura Melody Loop
  startTanjiroSoundtrack() {
    if (!this.enabled) return;
    this.init();
    this.activeSoundtrack = 'tanjiro';
    this.isSoundtrackPlaying = true;

    // Pentatonic frequencies (E minor Insen / Japanese folk scale)
    const notes = {
      E4: 329.63,
      G4: 392.00,
      A4: 440.00,
      B4: 493.88,
      C5: 523.25,
      D5: 587.33,
      E5: 659.25
    };

    // Iconic emotional phrase from Kamado Tanjiro no Uta
    const melody = [
      { note: notes.E4, dur: 0.6, time: 0.0 },
      { note: notes.G4, dur: 0.5, time: 0.6 },
      { note: notes.A4, dur: 0.8, time: 1.1 },
      { note: notes.B4, dur: 0.5, time: 2.0 },
      { note: notes.C5, dur: 0.9, time: 2.5 },
      { note: notes.B4, dur: 0.5, time: 3.5 },
      { note: notes.A4, dur: 0.8, time: 4.0 },
      { note: notes.G4, dur: 0.6, time: 4.9 },
      { note: notes.E4, dur: 1.2, time: 5.5 }
    ];

    const playMelodyCycle = () => {
      if (this.activeSoundtrack !== 'tanjiro' || !this.enabled) return;

      // Taiko heartbeats
      this.playTaiko(0.0);
      this.playTaiko(2.5);
      this.playTaiko(4.5);

      // Koto accompaniment
      this.playKoto(notes.E4 * 2, 0.2);
      this.playKoto(notes.B4, 1.4);
      this.playKoto(notes.E5, 2.7);
      this.playKoto(notes.A4, 4.2);

      // Shakuhachi lyrical flute melody
      melody.forEach(m => {
        this.playShakuhachi(m.note, m.dur, m.time);
      });
    };

    // First cycle immediately
    playMelodyCycle();

    // Loop cycle every 7.5 seconds
    this.soundtrackInterval = setInterval(() => {
      if (this.activeSoundtrack !== 'tanjiro' || !this.enabled) {
        this.stopSoundtrack();
        return;
      }
      playMelodyCycle();
    }, 7500);
  }

  stopSoundtrack() {
    this.isSoundtrackPlaying = false;
    this.activeSoundtrack = 'none';
    if (this.soundtrackInterval) {
      clearInterval(this.soundtrackInterval);
      this.soundtrackInterval = null;
    }
  }

  stopNakimeSoundtrack() {
    this.stopSoundtrack();
  }
}

export const sfx = new SoundEffectsManager();
