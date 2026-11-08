"use client";

const STORAGE_KEY = "sfx-enabled";
const CHANGE_EVENT = "sfx-enabled-change";

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let activeVoices = 0;
let enabled = false;
let initializedPref = false;
const cooldownMap = new Map<string, number>();

function isSfxEnabled(): boolean {
  if (!initializedPref && typeof window !== "undefined") {
    initializedPref = true;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    enabled =
      stored === "on" ||
      (stored !== "off" &&
        (typeof window.matchMedia !== "function" ||
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  }
  return enabled;
}

function initAudio() {
  if (audioCtx || typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;

  audioCtx = new AudioCtx();
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.value = -6;
  compressor.knee.value = 4;
  compressor.ratio.value = 12;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.12;
  compressor.connect(audioCtx.destination);

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.85 * (isSfxEnabled() ? 1 : 0);
  masterGain.connect(compressor);

  noiseBuffer = audioCtx.createBuffer(
    1,
    audioCtx.sampleRate,
    audioCtx.sampleRate
  );
  const channelData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < channelData.length; i++) {
    channelData[i] = 2 * Math.random() - 1;
  }
}

if (typeof window !== "undefined") {
  const unlock = () => {
    initAudio();
    audioCtx?.resume().catch(() => {});
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    window.removeEventListener("touchstart", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
  window.addEventListener("touchstart", unlock, true);
}

function getContextAndMaster(): { ctx: AudioContext; master: GainNode } | null {
  if (!audioCtx || !masterGain) {
    initAudio();
  }
  if (!audioCtx || !masterGain || !isSfxEnabled()) return null;
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  if (typeof document !== "undefined" && document.hidden) return null;
  return { ctx: audioCtx, master: masterGain };
}

function acquireVoice(): boolean {
  if (activeVoices >= 14) return false;
  activeVoices++;
  return true;
}

function releaseVoice() {
  activeVoices = Math.max(0, activeVoices - 1);
}

function isThrottled(key: string, ms: number): boolean {
  const now = performance.now();
  const last = cooldownMap.get(key);
  if (last !== undefined && now - last < ms) return true;
  cooldownMap.set(key, now);
  return false;
}

function jitterFreq(freq: number, cents = 30): number {
  return freq * Math.pow(2, ((2 * Math.random() - 1) * cents) / 1200);
}

function normToPan(nx: number): number {
  return (Math.max(0, Math.min(1, nx)) - 0.5) * 0.7;
}

function connectAndSchedule(
  node: AudioNode,
  source: AudioScheduledSourceNode,
  pan: number | undefined,
  ctx: AudioContext,
  master: GainNode,
  stopTime: number,
  startFn: () => void
) {
  let out: AudioNode = node;
  if (pan !== undefined && ctx.createStereoPanner) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    node.connect(panner);
    out = panner;
  }
  out.connect(master);

  let released = false;
  const cleanup = () => {
    if (!released) {
      released = true;
      releaseVoice();
    }
  };
  source.onended = cleanup;
  setTimeout(cleanup, (stopTime - ctx.currentTime) * 1000 + 250);
  startFn();
  source.stop(stopTime);
}

interface NoiseOpts {
  filter?: BiquadFilterType;
  freq?: number;
  to?: number;
  dur?: number;
  gain?: number;
  q?: number;
  delay?: number;
  pan?: number;
}

function playNoise(opts: NoiseOpts) {
  const state = getContextAndMaster();
  if (!state || !noiseBuffer || !acquireVoice()) return;
  const { ctx, master } = state;

  const startTime = ctx.currentTime + (opts.delay ?? 0);
  const dur = opts.dur ?? 0.05;
  const gainVal = opts.gain ?? 0.08;

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  const offset = Math.random() * Math.max(0, noiseBuffer.duration - dur - 0.05);

  const filter = ctx.createBiquadFilter();
  filter.type = opts.filter ?? "bandpass";
  filter.frequency.setValueAtTime(opts.freq ?? 1200, startTime);
  if (opts.to !== undefined) {
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(20, opts.to),
      startTime + dur
    );
  }
  filter.Q.value = opts.q ?? 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

  source.connect(filter);
  filter.connect(gain);

  connectAndSchedule(
    gain,
    source,
    opts.pan,
    ctx,
    master,
    startTime + dur + 0.02,
    () => source.start(startTime, offset, dur + 0.02)
  );
}

interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  to?: number;
  dur?: number;
  attack?: number;
  gain?: number;
  delay?: number;
  cutoff?: number;
  filter?: BiquadFilterType;
  q?: number;
  pan?: number;
}

function playTone(opts: ToneOpts) {
  const state = getContextAndMaster();
  if (!state || !acquireVoice()) return;
  const { ctx, master } = state;

  const startTime = ctx.currentTime + (opts.delay ?? 0);
  const dur = opts.dur ?? 0.12;
  const attack = opts.attack ?? 0.004;
  const gainVal = opts.gain ?? 0.1;

  const osc = ctx.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, startTime);
  if (opts.to !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, opts.to),
      startTime + dur
    );
  }

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainVal, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
  osc.connect(gain);

  let out: AudioNode = gain;
  if (opts.cutoff !== undefined) {
    const filter = ctx.createBiquadFilter();
    filter.type = opts.filter ?? "lowpass";
    filter.frequency.value = opts.cutoff;
    filter.Q.value = opts.q ?? 0.7;
    gain.connect(filter);
    out = filter;
  }

  connectAndSchedule(
    out,
    osc,
    opts.pan,
    ctx,
    master,
    startTime + dur + 0.02,
    () => osc.start(startTime)
  );
}

const PENTATONIC = [392, 440, 523.25, 587.33, 698.46];
function scaleNote(index: number): number {
  const len = PENTATONIC.length;
  const octave = Math.floor(index / len);
  return PENTATONIC[((index % len) + len) % len] * Math.pow(2, octave);
}

function tap(scale = 1) {
  playNoise({
    filter: "lowpass",
    freq: 1500,
    dur: 0.022,
    gain: 0.295 * scale,
    q: 0.5,
  });
  playTone({
    freq: jitterFreq(196),
    to: 120,
    dur: 0.07,
    gain: 0.1023 * scale,
    cutoff: 900,
  });
}

export const sfx = {
  tap,

  toggle(active: boolean) {
    tap(0.7);
    const f1 = active ? scaleNote(1) : scaleNote(3);
    const f2 = active ? scaleNote(3) : scaleNote(1);
    playTone({
      freq: f1,
      dur: 0.06,
      gain: 0.057,
      cutoff: 2400,
    });
    playTone({
      freq: f2,
      dur: 0.14,
      gain: 0.0665,
      delay: 0.045,
      attack: 0.006,
      cutoff: 2400,
    });
  },

  plop(nx: number, scale = 1) {
    const pan = normToPan(nx);
    playNoise({
      filter: "lowpass",
      freq: 1400,
      to: 260,
      dur: 0.09,
      gain: 1.177 * scale,
      q: 0.7,
      pan,
    });
    const f1 = jitterFreq(760, 140);
    playTone({
      freq: f1,
      to: 1.5 * f1,
      dur: 0.028,
      gain: 0.18 * scale,
      cutoff: 3000,
      pan,
    });
    const f2 = jitterFreq(1150, 200);
    playTone({
      freq: f2,
      to: 1.4 * f2,
      dur: 0.018,
      gain: 0.09 * scale,
      cutoff: 4000,
      delay: 0.035 + 0.03 * Math.random(),
      pan: pan + 0.06,
    });
  },

  pellets(nx: number) {
    if (isThrottled("pellets", 130)) return;
    const pan = normToPan(nx);
    const count = 3 + Math.floor(3 * Math.random());
    for (let i = 0; i < count; i++) {
      playNoise({
        filter: "bandpass",
        freq: 1800 + 2200 * Math.random(),
        dur: 0.01,
        gain: 0.306,
        q: 1.4,
        delay: 0.12 * Math.random(),
        pan: pan + (Math.random() - 0.5) * 0.3,
      });
    }
    const f = jitterFreq(1300, 220);
    playTone({
      freq: f,
      to: 1.4 * f,
      dur: 0.02,
      gain: 0.0884,
      cutoff: 4000,
      delay: 0.045,
      pan,
    });
  },

  surface(nx: number) {
    const pan = normToPan(nx);
    playNoise({
      filter: "lowpass",
      freq: 260,
      to: 2000,
      dur: 0.11,
      gain: 1.896,
      q: 0.6,
      pan,
    });
    playNoise({
      filter: "lowpass",
      freq: 1600,
      to: 400,
      dur: 0.13,
      gain: 1.138,
      q: 0.6,
      delay: 0.1,
      pan,
    });
    const f = jitterFreq(680, 160);
    playTone({
      freq: f,
      to: 1.5 * f,
      dur: 0.025,
      gain: 0.2,
      cutoff: 3000,
      delay: 0.12,
      pan,
    });
  },

  nibble(nx: number) {
    if (isThrottled("nibble", 240)) return;
    const pan = normToPan(nx);
    let delay = 0;
    for (let i = 0; i < 3; i++) {
      playNoise({
        filter: "bandpass",
        freq: 900 + 700 * Math.random(),
        dur: 0.014,
        gain: 0.3936,
        q: 1.1,
        delay,
        pan,
      });
      delay += 0.03 + 0.03 * Math.random();
    }
  },

  chomp(nx: number) {
    const pan = normToPan(nx);
    playNoise({
      filter: "lowpass",
      freq: 2600,
      to: 500,
      dur: 0.06,
      gain: 0.774,
      q: 0.7,
      pan,
    });
    playNoise({
      filter: "bandpass",
      freq: 700,
      dur: 0.02,
      gain: 0.3612,
      q: 1.2,
      delay: 0.03,
      pan,
    });
    const f = jitterFreq(520, 120);
    playTone({
      freq: f,
      to: 1.35 * f,
      dur: 0.02,
      gain: 0.1836,
      cutoff: 2600,
      delay: 0.045,
      pan,
    });
  },

  chirp(duckIndex: number, nx: number) {
    const pan = normToPan(nx);
    const baseFreq = 300 * Math.pow(1.14, ((duckIndex % 5) + 5) % 5);
    playTone({
      freq: 1.12 * baseFreq,
      to: 0.86 * baseFreq,
      dur: 0.09,
      gain: 0.61,
      type: "sawtooth",
      filter: "bandpass",
      cutoff: 3.4 * baseFreq,
      q: 3.2,
      attack: 0.006,
      pan,
    });
    playNoise({
      filter: "bandpass",
      freq: 3.4 * baseFreq,
      dur: 0.05,
      gain: 0.2916,
      q: 2.5,
      pan,
    });
  },
};

export function setSfxEnabled(next: boolean) {
  initializedPref = true;
  enabled = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    // Ignore
  }
  if (masterGain && audioCtx) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(
      0.85 * (next ? 1 : 0),
      audioCtx.currentTime
    );
  }
  if (next) {
    initAudio();
    audioCtx?.resume().catch(() => {});
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  }
}
