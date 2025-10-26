// Audio utility for character voice sounds

// ============================================
// AUDIO SETTINGS - Change these to customize voices
// ============================================

export const audioSettings = {
  MASUMOTO: {
    // Option 1: Use audio file (recommended for custom voices)
    audioFile: '/sounds/MASUMOTO.wav',
    useAudioFile: true, // Set to false to use synthesized sound
    
    // Option 2: Synthesized sound settings (fallback)
    pitch: 0.8,
    duration: 0.06,
    volume: 0.1
  },
  PLAYER: {
    audioFile: '/sounds/PLAYER.wav',
    useAudioFile: false,
    pitch: 1.2,
    duration: 0.05,
    volume: 0.1
  },
  NARRATOR: {
    audioFile: '/sounds/NARRATOR.wav',
    useAudioFile: false,
    pitch: 1.0,
    duration: 0.05,
    volume: 0.1
  }
};

// ============================================
// AUDIO IMPLEMENTATION (Don't modify below)
// ============================================

let audioContext: AudioContext | null = null;
const audioCache: { [key: string]: HTMLAudioElement } = {};
let audioInitialized = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Play sound from audio file
function playAudioFile(filePath: string, volume: number = 0.15) {
  try {
    // Use cached audio or create new one
    if (!audioCache[filePath]) {
      audioCache[filePath] = new Audio(filePath);
      audioCache[filePath].volume = volume;
      audioCache[filePath].preload = 'auto';
      
      // Add error handling for file loading
      audioCache[filePath].addEventListener('error', (e) => {
        console.warn(`Failed to load audio file: ${filePath}`, e);
        // Remove from cache so it tries again next time
        delete audioCache[filePath];
      });
      
      // Add load event listener
      audioCache[filePath].addEventListener('canplaythrough', () => {
        console.log(`Audio file loaded successfully: ${filePath}`);
      });
    }
    
    const audio = audioCache[filePath].cloneNode() as HTMLAudioElement;
    audio.volume = volume;
    
    // Try to play the audio
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log(`Audio played successfully: ${filePath}`);
      }).catch(err => {
        console.warn('Audio playback failed:', err);
        // Fallback to synthesized sound
        playSynthesizedSound(0.8, 0.06, volume);
      });
    }
  } catch (error) {
    console.warn('Audio file playback failed:', error);
    // Fallback to synthesized sound
    playSynthesizedSound(0.8, 0.06, volume);
  }
}

// Synthesize sound using Web Audio API (fallback)
function playSynthesizedSound(pitch: number = 1.0, duration: number = 0.05, volume: number = 0.15) {
  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (required by some browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 180 * pitch;
    oscillator.type = 'square';
    
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (error) {
    console.warn('Synthesized audio playback failed:', error);
  }
}

// Main function to play character sound
export function playCharacterSound(character: keyof typeof audioSettings = 'MASUMOTO') {
  // Initialize audio context on first user interaction
  if (!audioInitialized) {
    getAudioContext();
    audioInitialized = true;
  }
  
  const settings = audioSettings[character];
  
  if (settings.useAudioFile && settings.audioFile) {
    playAudioFile(settings.audioFile, settings.volume);
  } else {
    playSynthesizedSound(settings.pitch, settings.duration, settings.volume);
  }
}

// Preload audio files for better performance
export function preloadAudio() {
  Object.values(audioSettings).forEach(settings => {
    if (settings.useAudioFile && settings.audioFile) {
      const audio = new Audio();
      audio.src = settings.audioFile;
      audio.volume = settings.volume;
      audio.preload = 'auto';
      
      // Add event listeners for better debugging
      audio.addEventListener('loadstart', () => {
        console.log(`Starting to load: ${settings.audioFile}`);
      });
      
      audio.addEventListener('canplay', () => {
        console.log(`Can play: ${settings.audioFile}`);
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`Fully loaded: ${settings.audioFile}`);
      });
      
      audio.addEventListener('error', (e) => {
        console.warn(`Failed to preload: ${settings.audioFile}`, e);
      });
      
      audioCache[settings.audioFile] = audio;
    }
  });
}