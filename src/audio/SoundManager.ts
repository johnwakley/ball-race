export class SoundManager {
  private context: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      // Defer creation until interaction if possible, but for simplicity we'll try now
      // and handle resumed state later.
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.context && this.context.state === 'suspended' && !muted) {
       this.context.resume();
    }
  }

  public playPing(velocity: number = 1) {
    if (this.isMuted || !this.context) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    // Randomize pitch slightly for realism
    // Base frequency around 800Hz - 1200Hz
    const baseFreq = 800 + Math.random() * 400;
    osc.frequency.value = baseFreq;
    osc.type = 'sine';

    // Velocity affects volume
    // Clamp volume between 0.05 and 0.3
    const vol = Math.max(0.05, Math.min(0.3, velocity * 0.05));
    
    gain.gain.setValueAtTime(vol, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  public playWin() {
    if (this.isMuted || !this.context) return;
    
    // Play a major chord (C Major: C, E, G)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const now = this.context.currentTime;

    notes.forEach((freq, i) => {
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();

      osc.frequency.value = freq;
      osc.type = 'triangle';

      // Stagger start times slightly
      const startTime = now + i * 0.05;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);

      osc.connect(gain);
      gain.connect(this.context.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }
}

export const soundManager = new SoundManager();
