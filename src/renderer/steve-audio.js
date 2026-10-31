// Web Audio API Sound Synthesizer (Realistic Minecraft sound effects)
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playMinecraftHitSound() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  } catch (_) {}
}

function playShotgunBlastComplete() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(1.35, now);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, now);
    compressor.knee.setValueAtTime(10, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0.001, now);
    compressor.release.setValueAtTime(0.25, now);

    master.connect(compressor);
    compressor.connect(ctx.destination);

    // СЛОЙ 1: Тяжелый саб-басовый удар
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(190, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.14);
    subOsc.frequency.exponentialRampToValueAtTime(16, now + 0.45);
    subGain.gain.setValueAtTime(2.0, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    subOsc.connect(subGain);
    subGain.connect(master);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // СЛОЙ 2: Взрывной шум 12 калибра с волной искажения (дисторшн)
    const bufferSize = Math.floor(ctx.sampleRate * 0.65);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      const env = i < 4000 ? 1.4 : Math.exp(-i / (ctx.sampleRate * 0.18));
      output[i] = (white * 0.65 + (b0 + b1 + b2) * 0.5) * env;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(5200, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.55);

    const shaper = ctx.createWaveShaper();
    const k = 220;
    const curve = new Float32Array(ctx.sampleRate);
    const deg = Math.PI / 180;
    for (let i = 0; i < ctx.sampleRate; ++i) {
      const x = (i * 2) / ctx.sampleRate - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    shaper.curve = curve;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(1.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.60);

    noise.connect(shaper);
    shaper.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(now);

    // СЛОЙ 3: Хруст плоти и костей
    const crunchTime = now + 0.02;
    const crunchBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate);
    const cData = crunchBuf.getChannelData(0);
    for (let i = 0; i < cData.length; i++) {
      const mod = Math.sin(i * 0.15) * Math.cos(i * 0.037);
      cData[i] = (Math.random() * 2 - 1) * mod * Math.exp(-i / (ctx.sampleRate * 0.09));
    }
    const crunchSource = ctx.createBufferSource();
    crunchSource.buffer = crunchBuf;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1350, crunchTime);
    bandpass.Q.setValueAtTime(1.2, crunchTime);

    const crunchGain = ctx.createGain();
    crunchGain.gain.setValueAtTime(1.3, crunchTime);
    crunchGain.gain.exponentialRampToValueAtTime(0.01, crunchTime + 0.34);

    crunchSource.connect(bandpass);
    bandpass.connect(crunchGain);
    crunchGain.connect(master);
    crunchSource.start(crunchTime);

    // СЛОЙ 3.5: Жёсткий треск раскалывающегося черепа и костей
    for (let b = 0; b < 4; b++) {
      const snapT = now + 0.012 + b * 0.018;
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(920 - b * 140, snapT);
      snapOsc.frequency.exponentialRampToValueAtTime(110, snapT + 0.045);
      snapGain.gain.setValueAtTime(0.95, snapT);
      snapGain.gain.exponentialRampToValueAtTime(0.001, snapT + 0.048);
      snapOsc.connect(snapGain);
      snapGain.connect(master);
      snapOsc.start(snapT);
      snapOsc.stop(snapT + 0.05);
    }

    // СЛОЙ 4: Звук помпы (чк-чк)
    setTimeout(() => {
      try {
        const t2 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(540, t2);
        osc.frequency.exponentialRampToValueAtTime(200, t2 + 0.06);
        g.gain.setValueAtTime(0.35, t2);
        g.gain.exponentialRampToValueAtTime(0.001, t2 + 0.07);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t2);
        osc.stop(t2 + 0.075);
      } catch (_) {}
    }, 450);
  } catch (err) {
    console.warn('Shotgun sound error:', err);
  }
}

// Crate smash and splinter crash sound
function playCrateSmashSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // 1. Heavy wooden thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);

    // 2. Wood splintering crack (burst of bandpassed noise)
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.045));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(2.2, now);
    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.8, now);
    cGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    src.connect(filter);
    filter.connect(cGain);
    cGain.connect(ctx.destination);
    src.start(now);
  } catch (_) {}
}

// Comic bonk sound when choosing "НЕТ, Я МАЛЕНЬКИЙ"
function playBonkSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch (_) {}
}

function playMinecraftLandingSound() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.16);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  } catch (_) {}
}

// Trigger dynamic, unpredictable random reaction depending on which limb was clicked
