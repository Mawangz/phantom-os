/* ==========================================================================
   PhantomOS Web Audio API Synthesis Engine (Revised)
   ========================================================================== */

let audioCtx = null;
let masterGain = null;
let convolverNode = null;
let droneOsc = null;
let droneLFO = null;
var soundVolume = 0.5;

// Tinnitus Beep elements
let tinnitusOsc = null;
let tinnitusGain = null;
window.isBeeping = false;

/**
 * Initializes the AudioContext and establishes routing nodes on first click.
 */
function initAudio() {
  if (audioCtx) return;

  // Create context
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();

  // Create master nodes
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(soundVolume, audioCtx.currentTime);

  // Compressor to prevent digital clipping
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
  compressor.knee.setValueAtTime(30, audioCtx.currentTime);
  compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
  compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
  compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

  // Manual Makeup Gain Control (using a custom GainNode after compressor)
  const makeupGain = audioCtx.createGain();
  makeupGain.gain.setValueAtTime(1.5, audioCtx.currentTime);

  // Create Reverb Convolver Node dynamically (0 bytes)
  convolverNode = audioCtx.createConvolver();
  convolverNode.buffer = createReverbImpulseResponse(1.8, 2.5);

  makeupGain.connect(masterGain);
  compressor.connect(makeupGain);
  masterGain.connect(audioCtx.destination);

  // Start the background ambient hum
  startAmbientDrone();
}

/**
 * Updates master volume fader.
 */
function setMasterVolume(vol) {
  soundVolume = parseFloat(vol);
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(soundVolume, audioCtx.currentTime);
  }
}

/**
 * Math.random based convolution reverb generator (Zero-Byte Reverb).
 */
function createReverbImpulseResponse(duration, decay) {
  if (!audioCtx) return null;
  const sampleRate = audioCtx.sampleRate;
  const length = sampleRate * duration;
  const impulseBuffer = audioCtx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulseBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      // Exponential noise decay
      const percent = i / length;
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - percent, decay);
    }
  }
  return impulseBuffer;
}

/**
 * Low-frequency background hum (Atmospheric Drone).
 */
function startAmbientDrone() {
  if (!audioCtx) return;

  try {
    // Triangle wave oscillator
    droneOsc = audioCtx.createOscillator();
    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(73.42, audioCtx.currentTime); // Low D (D2)

    // LFO to modulate volume & frequency slightly (breathing effect)
    droneLFO = audioCtx.createOscillator();
    droneLFO.type = 'sine';
    droneLFO.frequency.setValueAtTime(0.08, audioCtx.currentTime); // Very slow 0.08 Hz

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(1.5, audioCtx.currentTime); // +/- 1.5 Hz modulation

    const droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.3, audioCtx.currentTime); // Low baseline volume

    // Route LFO to frequency
    droneLFO.connect(lfoGain);
    lfoGain.connect(droneOsc.frequency);

    // Route drone to Master
    droneOsc.connect(droneGain);
    
    // Connect drone to Reverb for space diffusion
    const wetGain = audioCtx.createGain();
    wetGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    droneGain.connect(wetGain);
    wetGain.connect(convolverNode);
    convolverNode.connect(masterGain);

    const compressor = audioCtx.createDynamicsCompressor();
    droneGain.connect(compressor);
    compressor.connect(masterGain);

    // Start
    droneOsc.start();
    droneLFO.start();
  } catch (e) {
    console.error("Failed to start ambient drone", e);
  }
}

/**
 * Stops or mutes the ambient drone (for focus-loss situations).
 */
function muteAmbientDrone(mute) {
  if (masterGain && audioCtx) {
    if (mute) {
      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    } else {
      masterGain.gain.setTargetAtTime(soundVolume, audioCtx.currentTime, 0.1);
    }
  }
}

/**
 * Procedural Tinnitus Beep (piercing 1.2kHz sine wave)
 */
function startTinnitusBeep() {
  if (!audioCtx || window.isBeeping) return;
  window.isBeeping = true;

  tinnitusOsc = audioCtx.createOscillator();
  tinnitusOsc.type = 'sine';
  tinnitusOsc.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitch

  tinnitusGain = audioCtx.createGain();
  tinnitusGain.gain.setValueAtTime(0.35, audioCtx.currentTime); // Loud volume

  tinnitusOsc.connect(tinnitusGain);
  tinnitusGain.connect(masterGain);

  tinnitusOsc.start();
}

function stopTinnitusBeep() {
  if (!audioCtx || !window.isBeeping) return;
  window.isBeeping = false;

  try {
    if (tinnitusOsc) {
      tinnitusOsc.stop();
      tinnitusOsc.disconnect();
      tinnitusOsc = null;
    }
    if (tinnitusGain) {
      tinnitusGain.disconnect();
      tinnitusGain = null;
    }
  } catch (e) {
    console.error("Error stopping beep", e);
  }
}

/**
 * Procedural Kick Drum
 */
function playProceduralKick() {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, audioCtx.currentTime);

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.25);
}

/**
 * Procedural Snare Drum
 */
function playProceduralSnare() {
  if (!audioCtx) return;

  const bufferSize = audioCtx.sampleRate * 0.2; // 200ms
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
  filter.Q.setValueAtTime(2.0, audioCtx.currentTime);

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

  noiseNode.connect(filter);
  filter.connect(gainNode);

  if (convolverNode) {
    const revGain = audioCtx.createGain();
    revGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gainNode.connect(revGain);
    revGain.connect(convolverNode);
    convolverNode.connect(masterGain);
  }

  gainNode.connect(masterGain);

  noiseNode.start();
  noiseNode.stop(audioCtx.currentTime + 0.25);
}

/**
 * Procedural Hi-Hat (very short white noise with highpass filter)
 */
function playProceduralHihat() {
  if (!audioCtx) return;

  const bufferSize = audioCtx.sampleRate * 0.05; // 50ms
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(8000, audioCtx.currentTime);

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

  noiseNode.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(masterGain);

  noiseNode.start();
  noiseNode.stop(audioCtx.currentTime + 0.06);
}


/**
 * Math.tanh wave-distortion curve builder.
 */
function makeDistortionCurve(amount) {
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = Math.tanh(amount * x) / Math.tanh(amount);
  }
  return curve;
}

/**
 * Plays a creepy digital notes sequence with slides and distortion.
 */
function playGlitchNote(freq, duration = 0.4, isEntity = false) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = isEntity ? 'square' : 'triangle';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  // Slide pitch downwards
  osc.frequency.exponentialRampToValueAtTime(freq * 0.8, audioCtx.currentTime + duration);

  gainNode.gain.setValueAtTime(isEntity ? 0.35 : 0.25, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  if (isEntity) {
    const dist = audioCtx.createWaveShaper();
    dist.curve = makeDistortionCurve(30);
    dist.oversample = '4x';
    osc.connect(dist);
    dist.connect(gainNode);
  } else {
    osc.connect(gainNode);
  }

  if (convolverNode) {
    const revGain = audioCtx.createGain();
    revGain.gain.setValueAtTime(0.6, audioCtx.currentTime);
    gainNode.connect(revGain);
    revGain.connect(convolverNode);
    convolverNode.connect(masterGain);
  }

  gainNode.connect(masterGain);

  osc.start();
  osc.stop(audioCtx.currentTime + duration + 0.1);
}

/**
 * Celeste-style typing bleep generator.
 */
function playTypingSound(charType) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  let baseFreq = 300;
  let duration = 0.04;
  let type = 'sine';

  if (charType === 'entity') {
    baseFreq = 80 + Math.random() * 40;
    type = 'sawtooth';
    duration = 0.08;
  } else if (charType === 'system') {
    baseFreq = 900 + Math.random() * 200;
    type = 'square';
    duration = 0.02;
  } else {
    baseFreq = 400 + Math.random() * 150;
    type = 'triangle';
    duration = 0.03;
  }

  osc.type = type;
  osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, audioCtx.currentTime + duration);

  gainNode.gain.setValueAtTime(charType === 'entity' ? 0.15 : 0.06, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  if (charType === 'entity') {
    const dist = audioCtx.createWaveShaper();
    dist.curve = makeDistortionCurve(15);
    osc.connect(dist);
    dist.connect(gainNode);
  } else {
    osc.connect(gainNode);
  }

  gainNode.connect(masterGain);

  osc.start();
  osc.stop(audioCtx.currentTime + duration + 0.02);
}

/**
 * Procedural Jumpscare Sound effect
 */
function playJumpscareSound() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // Node 1: sub-bass rumble
  const subOsc = audioCtx.createOscillator();
  subOsc.type = 'sawtooth';
  subOsc.frequency.setValueAtTime(60, now);
  subOsc.frequency.linearRampToValueAtTime(30, now + 0.8);
  const subGain = audioCtx.createGain();
  subGain.gain.setValueAtTime(1.0, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  subOsc.connect(subGain);
  subGain.connect(masterGain);

  // Node 2: high-pitch screech
  const screechOsc = audioCtx.createOscillator();
  screechOsc.type = 'square';
  screechOsc.frequency.setValueAtTime(1800, now);
  screechOsc.frequency.exponentialRampToValueAtTime(120, now + 0.8);
  
  const screechDist = audioCtx.createWaveShaper();
  screechDist.curve = makeDistortionCurve(50);
  
  const screechGain = audioCtx.createGain();
  screechGain.gain.setValueAtTime(1.0, now);
  screechGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  
  screechOsc.connect(screechDist);
  screechDist.connect(screechGain);
  screechGain.connect(masterGain);

  // Node 3: white noise blast
  const noiseSize = audioCtx.sampleRate * 1.0;
  const noiseBuffer = audioCtx.createBuffer(1, noiseSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(1.0, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  
  noiseNode.connect(noiseGain);
  noiseGain.connect(masterGain);

  if (convolverNode) {
    const wetGain = audioCtx.createGain();
    wetGain.gain.setValueAtTime(0.8, now);
    screechGain.connect(wetGain);
    noiseGain.connect(wetGain);
    wetGain.connect(convolverNode);
    convolverNode.connect(masterGain);
  }

  subOsc.start();
  screechOsc.start();
  noiseNode.start();

  subOsc.stop(now + 1.3);
  screechOsc.stop(now + 1.3);
  noiseNode.stop(now + 1.3);
}

function intensifyDrone() {
  if (audioCtx && droneOsc && droneLFO) {
    const now = audioCtx.currentTime;
    droneOsc.frequency.exponentialRampToValueAtTime(110.0, now + 2.5);
    droneLFO.frequency.exponentialRampToValueAtTime(0.35, now + 2.5);
  }
}

function playSpeakerBootBeep() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.12);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

  osc.connect(gainNode);
  gainNode.connect(masterGain);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.18);
}

// Export functions to global scope
window.initAudio = initAudio;
window.setMasterVolume = setMasterVolume;
window.playProceduralKick = playProceduralKick;
window.playProceduralSnare = playProceduralSnare;
window.playGlitchNote = playGlitchNote;
window.playTypingSound = playTypingSound;
window.playJumpscareSound = playJumpscareSound;
window.muteAmbientDrone = muteAmbientDrone;
window.startTinnitusBeep = startTinnitusBeep;
window.stopTinnitusBeep = stopTinnitusBeep;
window.intensifyDrone = intensifyDrone;
window.playSpeakerBootBeep = playSpeakerBootBeep;

function playStartupChime() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gainNode.gain.setValueAtTime(0.001, now + idx * 0.08);
    gainNode.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);

    osc.connect(gainNode);
    if (convolverNode) {
      gainNode.connect(convolverNode);
    }
    gainNode.connect(masterGain);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.9);
  });
}

function playShutdownChime() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [1046.50, 880.00, 783.99, 659.25, 523.25];
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gainNode.gain.setValueAtTime(0.001, now + idx * 0.08);
    gainNode.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.7);

    osc.connect(gainNode);
    if (convolverNode) {
      gainNode.connect(convolverNode);
    }
    gainNode.connect(masterGain);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.8);
  });
}

window.playStartupChime = playStartupChime;
window.playShutdownChime = playShutdownChime;
window.playProceduralHihat = playProceduralHihat;

let breathingSource = null;
let breathingFilter = null;
let breathingGain = null;
let breathingLFO = null;
let breathingActive = false;

function startGhostlyBreathing() {
  if (!audioCtx || breathingActive) return;
  breathingActive = true;

  try {
    const bufferSize = audioCtx.sampleRate * 2.0;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    breathingFilter = audioCtx.createBiquadFilter();
    breathingFilter.type = 'bandpass';
    breathingFilter.Q.setValueAtTime(10.0, audioCtx.currentTime);
    breathingFilter.frequency.setValueAtTime(450, audioCtx.currentTime);

    breathingLFO = audioCtx.createOscillator();
    breathingLFO.type = 'sine';
    breathingLFO.frequency.setValueAtTime(0.25, audioCtx.currentTime); // slow breathe (4s cycle)

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(200, audioCtx.currentTime); // sweep 250Hz - 650Hz

    breathingGain = audioCtx.createGain();
    breathingGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

    breathingLFO.connect(lfoGain);
    lfoGain.connect(breathingFilter.frequency);

    noiseNode.connect(breathingFilter);
    breathingFilter.connect(breathingGain);
    
    if (convolverNode) {
      const wetGain = audioCtx.createGain();
      wetGain.gain.setValueAtTime(0.45, audioCtx.currentTime);
      breathingGain.connect(wetGain);
      wetGain.connect(convolverNode);
    }
    
    breathingGain.connect(masterGain);

    noiseNode.start();
    breathingLFO.start();

    let breatheCycle = 0;
    const breatheInterval = setInterval(() => {
      if (!breathingActive || !audioCtx) {
        clearInterval(breatheInterval);
        return;
      }
      const now = audioCtx.currentTime;
      breatheCycle++;
      if (breatheCycle % 2 === 1) {
        // Soft inhalation
        breathingGain.gain.linearRampToValueAtTime(0.09, now + 1.5);
      } else {
        // Hushed exhalation / pause
        breathingGain.gain.linearRampToValueAtTime(0.001, now + 1.5);
      }
    }, 2000);

    breathingSource = noiseNode;
  } catch (e) {
    console.error("Failed to start ghostly breathing", e);
  }
}

function stopGhostlyBreathing() {
  if (!breathingActive) return;
  breathingActive = false;
  try {
    if (breathingSource) {
      breathingSource.stop();
      breathingSource.disconnect();
    }
    if (breathingLFO) {
      breathingLFO.stop();
      breathingLFO.disconnect();
    }
    if (breathingFilter) breathingFilter.disconnect();
    if (breathingGain) breathingGain.disconnect();
  } catch (e) {
    console.error("Error stopping breathing", e);
  }
}

window.startGhostlyBreathing = startGhostlyBreathing;
window.stopGhostlyBreathing = stopGhostlyBreathing;

/* ==========================================================================
   EASTER EGGS AUDIO SYNTHESIZERS
   ========================================================================== */

let backroomsHumOsc = null;
let backroomsBuzzOsc = null;
let backroomsBuzzLFO = null;
let backroomsHumGain = null;

function startBackroomsHum() {
  if (!audioCtx || backroomsHumOsc) return;
  const now = audioCtx.currentTime;
  
  backroomsHumOsc = audioCtx.createOscillator();
  backroomsHumOsc.type = 'sawtooth';
  backroomsHumOsc.frequency.setValueAtTime(60, now);
  
  backroomsBuzzOsc = audioCtx.createOscillator();
  backroomsBuzzOsc.type = 'sine';
  backroomsBuzzOsc.frequency.setValueAtTime(7500, now);
  
  backroomsBuzzLFO = audioCtx.createOscillator();
  backroomsBuzzLFO.type = 'sine';
  backroomsBuzzLFO.frequency.setValueAtTime(8, now);
  
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.setValueAtTime(120, now);
  
  backroomsBuzzLFO.connect(lfoGain);
  lfoGain.connect(backroomsBuzzOsc.frequency);
  
  backroomsHumGain = audioCtx.createGain();
  backroomsHumGain.gain.setValueAtTime(0.24, now);
  
  backroomsHumOsc.connect(backroomsHumGain);
  backroomsBuzzOsc.connect(backroomsHumGain);
  backroomsHumGain.connect(masterGain);
  
  backroomsHumOsc.start();
  backroomsBuzzOsc.start();
  backroomsBuzzLFO.start();
}

function stopBackroomsHum() {
  try {
    if (backroomsHumOsc) {
      backroomsHumOsc.stop();
      backroomsHumOsc.disconnect();
      backroomsHumOsc = null;
    }
    if (backroomsBuzzOsc) {
      backroomsBuzzOsc.stop();
      backroomsBuzzOsc.disconnect();
      backroomsBuzzOsc = null;
    }
    if (backroomsBuzzLFO) {
      backroomsBuzzLFO.stop();
      backroomsBuzzLFO.disconnect();
      backroomsBuzzLFO = null;
    }
    if (backroomsHumGain) {
      backroomsHumGain.disconnect();
      backroomsHumGain = null;
    }
  } catch (e) {
    console.error("Error stopping backrooms hum", e);
  }
}

function playEASWarningTone() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(440, now);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(380, now);
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.setValueAtTime(0.2, now + 1.8);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
  
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(masterGain);
  
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 2.1);
  osc2.stop(now + 2.1);
}

let staticHissSource = null;
let staticHissGain = null;

function playStaticHissSound() {
  if (!audioCtx || staticHissSource) return;
  
  const bufferSize = audioCtx.sampleRate * 2.0;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  staticHissSource = audioCtx.createBufferSource();
  staticHissSource.buffer = noiseBuffer;
  staticHissSource.loop = true;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3800, audioCtx.currentTime);
  filter.Q.setValueAtTime(1.8, audioCtx.currentTime);
  
  staticHissGain = audioCtx.createGain();
  staticHissGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  
  staticHissSource.connect(filter);
  filter.connect(staticHissGain);
  staticHissGain.connect(masterGain);
  
  staticHissSource.start();
}

function stopStaticHissSound() {
  try {
    if (staticHissSource) {
      staticHissSource.stop();
      staticHissSource.disconnect();
      staticHissSource = null;
    }
    if (staticHissGain) {
      staticHissGain.disconnect();
      staticHissGain = null;
    }
  } catch (e) {
    console.error("Error stopping static hiss", e);
  }
}

let mouseMelodyInterval = null;
function playSuicideMouseMelody() {
  if (!audioCtx) return;
  stopSuicideMouseMelody();

  const notes = [164.81, 196.00, 233.08, 277.18, 233.08, 196.00];
  let idx = 0;
  
  mouseMelodyInterval = setInterval(() => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(notes[idx % notes.length], now);
    osc.frequency.linearRampToValueAtTime(notes[idx % notes.length] * 0.94, now + 0.75);
    
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    
    osc.connect(gainNode);
    if (convolverNode) {
      const wet = audioCtx.createGain();
      wet.gain.setValueAtTime(0.65, now);
      gainNode.connect(wet);
      wet.connect(convolverNode);
    }
    gainNode.connect(masterGain);
    
    osc.start(now);
    osc.stop(now + 1.4);
    idx++;
  }, 900);
}

function stopSuicideMouseMelody() {
  if (mouseMelodyInterval) {
    clearInterval(mouseMelodyInterval);
    mouseMelodyInterval = null;
  }
}

function playSadSatanGrowl() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(35, now + 3.0);
  
  gain.gain.setValueAtTime(0.45, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
  
  const dist = audioCtx.createWaveShaper();
  dist.curve = makeDistortionCurve(35);
  
  osc.connect(dist);
  dist.connect(gain);
  gain.connect(masterGain);
  
  osc.start(now);
  osc.stop(now + 3.3);
}

function playPolybiusHypnosis() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [400, 800, 1600, 3200, 2400, 1200, 600];
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);
    
    gain.gain.setValueAtTime(0.001, now + idx * 0.06);
    gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.2);
  });
}

let heartbeatInterval = null;
function playHeartbeatTone(active) {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  
  if (!active) return;
  
  heartbeatInterval = setInterval(() => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    triggerHeartbeatTap(now);
    triggerHeartbeatTap(now + 0.25);
  }, 1200);
}

function triggerHeartbeatTap(time) {
  if (!audioCtx || !masterGain) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.16);
    
    gain.gain.setValueAtTime(0.55, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(time);
    osc.stop(time + 0.2);
  } catch (e) {
    console.warn("Heartbeat synthesis error:", e);
  }
}

let y2kSirenOsc = null;
let y2kSirenLFO = null;
let y2kSirenGain = null;

function playY2KSiren() {
  if (!audioCtx || y2kSirenOsc) return;
  const now = audioCtx.currentTime;
  
  y2kSirenOsc = audioCtx.createOscillator();
  y2kSirenOsc.type = 'square';
  y2kSirenOsc.frequency.setValueAtTime(600, now);
  
  y2kSirenLFO = audioCtx.createOscillator();
  y2kSirenLFO.type = 'sine';
  y2kSirenLFO.frequency.setValueAtTime(1.8, now);
  
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.setValueAtTime(140, now);
  
  y2kSirenLFO.connect(lfoGain);
  lfoGain.connect(y2kSirenOsc.frequency);
  
  y2kSirenGain = audioCtx.createGain();
  y2kSirenGain.gain.setValueAtTime(0.18, now);
  
  y2kSirenOsc.connect(y2kSirenGain);
  y2kSirenGain.connect(masterGain);
  
  y2kSirenOsc.start();
  y2kSirenLFO.start();
}

function stopY2KSiren() {
  try {
    if (y2kSirenOsc) {
      y2kSirenOsc.stop();
      y2kSirenOsc.disconnect();
      y2kSirenOsc = null;
    }
    if (y2kSirenLFO) {
      y2kSirenLFO.stop();
      y2kSirenLFO.disconnect();
      y2kSirenLFO = null;
    }
    if (y2kSirenGain) {
      y2kSirenGain.disconnect();
      y2kSirenGain = null;
    }
  } catch (e) {
    console.error("Error stopping Y2K siren", e);
  }
}

function playDiskWriteScratch() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  
  for (let i = 0; i < 4; i++) {
    const time = now + i * 0.12;
    const bufferSize = audioCtx.sampleRate * 0.06;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < bufferSize; j++) {
      data[j] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    noise.start(time);
    noise.stop(time + 0.08);
  }
}

// Export easter eggs to global scope
window.startBackroomsHum = startBackroomsHum;
window.stopBackroomsHum = stopBackroomsHum;
window.playEASWarningTone = playEASWarningTone;
window.playStaticHissSound = playStaticHissSound;
window.stopStaticHissSound = stopStaticHissSound;
window.playSuicideMouseMelody = playSuicideMouseMelody;
window.stopSuicideMouseMelody = stopSuicideMouseMelody;
window.playSadSatanGrowl = playSadSatanGrowl;
window.playPolybiusHypnosis = playPolybiusHypnosis;
window.playHeartbeatTone = playHeartbeatTone;
window.playY2KSiren = playY2KSiren;
window.stopY2KSiren = stopY2KSiren;
window.playDiskWriteScratch = playDiskWriteScratch;





