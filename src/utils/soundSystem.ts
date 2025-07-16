// Optimized sound system for combat
export class SoundSystem {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.3;
  private soundEnabled = true;
  private bufferCache = new Map<string, AudioBuffer>();
  private maxCacheSize = 10; // Limit cache size

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  // Simplified sound generation with caching
  private generateSound(type: 'swing' | 'clang' | 'impact' | 'critical' | 'parry' | 'miss', frequency = 200, duration = 0.3): AudioBuffer | null {
    if (!this.audioContext) return null;

    const cacheKey = `${type}-${frequency}-${duration}`;
    if (this.bufferCache.has(cacheKey)) {
      return this.bufferCache.get(cacheKey)!;
    }

    // Clear cache if too large
    if (this.bufferCache.size >= this.maxCacheSize) {
      const firstKey = this.bufferCache.keys().next().value;
      this.bufferCache.delete(firstKey);
    }

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'swing':
          // Whoosh sound
          const envelope = Math.exp(-t * 6) * Math.sin(t * 15);
          const sweep = Math.sin(2 * Math.PI * frequency * t * (1 - t * 0.3));
          sample = envelope * sweep * 0.3;
          break;

        case 'clang':
          // Metal clang
          const ringEnv = Math.exp(-t * 12);
          const ring = Math.sin(2 * Math.PI * frequency * t) + 
                      Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.5;
          sample = ringEnv * ring * 0.4;
          break;

        case 'impact':
          // Flesh impact
          const thudEnv = Math.exp(-t * 10);
          const thud = Math.sin(2 * Math.PI * frequency * t) * 0.7;
          sample = thudEnv * thud * 0.5;
          break;

        case 'critical':
          // Dramatic impact
          const critEnv = Math.exp(-t * 5) * (1 + Math.sin(t * 25) * 0.1);
          const critImpact = Math.sin(2 * Math.PI * frequency * t) +
                            Math.sin(2 * Math.PI * frequency * 0.75 * t) * 0.6;
          sample = critEnv * critImpact * 0.6;
          break;

        case 'parry':
          // Sharp deflection
          const parryEnv = Math.exp(-t * 15) * (1 + Math.cos(t * 30) * 0.3);
          const deflect = Math.sin(2 * Math.PI * frequency * t) +
                         Math.sin(2 * Math.PI * frequency * 1.3 * t) * 0.7;
          sample = parryEnv * deflect * 0.5;
          break;

        case 'miss':
          // Subtle whoosh
          const missEnv = Math.exp(-t * 8);
          const missSwing = Math.sin(2 * Math.PI * frequency * t * (1 - t * 0.4));
          sample = missEnv * missSwing * 0.2;
          break;
      }

      // Add slight noise for realism
      const noise = (Math.random() - 0.5) * 0.05;
      data[i] = Math.max(-1, Math.min(1, sample + noise));
    }

    this.bufferCache.set(cacheKey, buffer);
    return buffer;
  }

  private playBuffer(buffer: AudioBuffer | null, volume = 1) {
    if (!this.audioContext || !buffer || !this.soundEnabled) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.masterVolume * volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      
      // Clean up after playing
      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
      };
    } catch (e) {
      console.warn('Failed to play sound:', e);
    }
  }

  // Simplified public methods
  playAttackSound(weaponType: string, isCritical = false) {
    if (isCritical) {
      const buffer = this.generateSound('critical', 400, 0.4);
      this.playBuffer(buffer, 0.8);
      return;
    }

    let frequency = 200;
    let duration = 0.3;

    switch (weaponType) {
      case 'dagger':
      case 'rapier':
        frequency = 280;
        duration = 0.2;
        break;
      case 'longsword':
      case 'greatsword':
        frequency = 160;
        duration = 0.4;
        break;
      case 'mace':
      case 'warhammer':
        frequency = 120;
        duration = 0.25;
        break;
      case 'battleaxe':
        frequency = 140;
        duration = 0.35;
        break;
      case 'flail':
        frequency = 150;
        duration = 0.3;
        break;
    }

    const buffer = this.generateSound('swing', frequency, duration);
    this.playBuffer(buffer, 0.6);
  }

  playBlockSound() {
    const buffer = this.generateSound('clang', 800, 0.2);
    this.playBuffer(buffer, 0.7);
  }

  playParrySound() {
    const buffer = this.generateSound('parry', 1200, 0.25);
    this.playBuffer(buffer, 0.8);
  }

  playHitSound(isCritical = false) {
    if (isCritical) {
      const buffer = this.generateSound('critical', 300, 0.3);
      this.playBuffer(buffer, 0.9);
    } else {
      const buffer = this.generateSound('impact', 150, 0.15);
      this.playBuffer(buffer, 0.5);
    }
  }

  playMissSound() {
    const buffer = this.generateSound('miss', 250, 0.2);
    this.playBuffer(buffer, 0.3);
  }

  // Initialize audio context on user interaction
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('Failed to resume audio context:', e);
      }
    }
  }

  // Cleanup method
  dispose() {
    this.bufferCache.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
export const soundSystem = new SoundSystem();