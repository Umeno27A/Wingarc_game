// BGM management system for SOCCER TALE

// ============================================
// BGM SETTINGS - Change these to customize music
// ============================================

export const bgmSettings = {
  title: {
    file: '/sounds/bgm_title.mp3',
    volume: 0.3,
    loop: true,
    enabled: false, // Set to false to disable this BGM
  },
  battle: {
    file: '/sounds/bgm_battle.mp3',
    volume: 0.25,
    loop: true,
    enabled: true,
  },
  victory: {
    file: '/sounds/bgm_victory.mp3',
    volume: 0.3,
    loop: true,
    enabled: false,
  },
  defeat: {
    file: '/sounds/bgm_defeat.mp3',
    volume: 0.3,
    loop: false, // Play once
    enabled: true,
  },
};

// ============================================
// BGM MANAGER (Don't modify below)
// ============================================

export type BGMType = keyof typeof bgmSettings;

class BGMManager {
  private currentBGM: HTMLAudioElement | null = null;
  private currentType: BGMType | null = null;
  private audioCache: Map<BGMType, HTMLAudioElement> = new Map();
  private fadeInterval: NodeJS.Timeout | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Preload all BGM files
    this.preloadAll();
  }

  // Preload all BGM files for smooth playback
  preloadAll() {
    (Object.keys(bgmSettings) as BGMType[]).forEach((type) => {
      const settings = bgmSettings[type];
      if (settings.enabled) {
        try {
          const audio = new Audio(settings.file);
          audio.volume = settings.volume;
          audio.loop = settings.loop;
          audio.preload = 'auto';
          this.audioCache.set(type, audio);
        } catch (error) {
          console.warn(`Failed to preload BGM: ${type}`, error);
        }
      }
    });
  }

  // Play specific BGM with fade in
  play(type: BGMType, fadeInDuration: number = 1000) {
    if (!this.isEnabled) return;

    const settings = bgmSettings[type];
    if (!settings.enabled) return;

    // If same BGM is already playing, do nothing
    if (this.currentType === type && this.currentBGM && !this.currentBGM.paused) {
      return;
    }

    // Stop current BGM with fade out
    if (this.currentBGM) {
      this.fadeOut(() => {
        this.startNewBGM(type, fadeInDuration);
      });
    } else {
      this.startNewBGM(type, fadeInDuration);
    }
  }

  // Start new BGM with fade in
  private startNewBGM(type: BGMType, fadeInDuration: number) {
    const audio = this.audioCache.get(type);
    if (!audio) {
      console.warn(`BGM not found: ${type}`);
      return;
    }

    this.currentBGM = audio;
    this.currentType = type;
    
    const settings = bgmSettings[type];
    const targetVolume = settings.volume;

    // Start from volume 0
    audio.volume = 0;
    
    // Play audio
    audio.play().catch((error) => {
      console.warn(`Failed to play BGM: ${type}`, error);
    });

    // Fade in
    this.fadeIn(targetVolume, fadeInDuration);
  }

  // Fade in effect
  private fadeIn(targetVolume: number, duration: number) {
    if (!this.currentBGM) return;

    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    this.fadeInterval = setInterval(() => {
      if (!this.currentBGM) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        return;
      }

      currentStep++;
      this.currentBGM.volume = Math.min(volumeStep * currentStep, targetVolume);

      if (currentStep >= steps) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
      }
    }, stepDuration);
  }

  // Fade out effect
  private fadeOut(onComplete?: () => void, duration: number = 800) {
    if (!this.currentBGM) {
      if (onComplete) onComplete();
      return;
    }

    const steps = 20;
    const stepDuration = duration / steps;
    const startVolume = this.currentBGM.volume;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    this.fadeInterval = setInterval(() => {
      if (!this.currentBGM) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        if (onComplete) onComplete();
        return;
      }

      currentStep++;
      this.currentBGM.volume = Math.max(startVolume - volumeStep * currentStep, 0);

      if (currentStep >= steps) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        this.currentBGM.pause();
        this.currentBGM.currentTime = 0;
        if (onComplete) onComplete();
      }
    }, stepDuration);
  }

  // Stop current BGM
  stop(fadeOutDuration: number = 800) {
    this.fadeOut(() => {
      this.currentBGM = null;
      this.currentType = null;
    }, fadeOutDuration);
  }

  // Pause current BGM
  pause() {
    if (this.currentBGM) {
      this.currentBGM.pause();
    }
  }

  // Resume current BGM
  resume() {
    if (this.currentBGM && this.currentBGM.paused) {
      this.currentBGM.play().catch((error) => {
        console.warn('Failed to resume BGM', error);
      });
    }
  }

  // Set master volume for all BGM
  setMasterVolume(volume: number) {
    // Update volume for cached audio
    this.audioCache.forEach((audio, type) => {
      const settings = bgmSettings[type];
      audio.volume = settings.volume * volume;
    });

    // Update current playing BGM
    if (this.currentBGM && this.currentType) {
      const settings = bgmSettings[this.currentType];
      this.currentBGM.volume = settings.volume * volume;
    }
  }

  // Enable/disable BGM
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop(500);
    }
  }

  // Get current playing BGM type
  getCurrentBGM(): BGMType | null {
    return this.currentType;
  }
}

// Export singleton instance
export const bgmManager = new BGMManager();

// Utility functions
export function playBGM(type: BGMType, fadeInDuration?: number) {
  bgmManager.play(type, fadeInDuration);
}

export function stopBGM(fadeOutDuration?: number) {
  bgmManager.stop(fadeOutDuration);
}

export function pauseBGM() {
  bgmManager.pause();
}

export function resumeBGM() {
  bgmManager.resume();
}

export function setBGMEnabled(enabled: boolean) {
  bgmManager.setEnabled(enabled);
}

export function setBGMMasterVolume(volume: number) {
  bgmManager.setMasterVolume(volume);
}
