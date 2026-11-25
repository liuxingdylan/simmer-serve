// All sound is synthesized with WebAudio — no audio files, no network.
// One clear job: effects (chop, sizzle, ding, buzz) and a small music loop.

export function createAudio() {
  let ctx = null;
  let master = null;
  let musicTimer = null;
  let sizzleNodes = null;
  let muted = false;
  let step = 0;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') void ctx.resume();
      return true;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      return true;
    } catch {
      return false;
    }
  }

  function tone(freq, seconds, type, volume, when = 0, slideTo = null) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + seconds);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(volume, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  function noise(seconds, filterFreq, volume, when = 0) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + when;
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(t0);
    source.stop(t0 + seconds);
  }

  // A cheerful 8-step loop: walking bass plus a soft hat tick.
  const BASS = [130.8, 0, 164.8, 0, 196.0, 0, 164.8, 146.8];
  function musicStep() {
    if (!ctx || muted) return;
    const note = BASS[step % BASS.length];
    if (note) tone(note, 0.22, 'triangle', 0.16);
    noise(0.03, 6000, 0.05);
    step += 1;
  }

  return {
    unlock() { ensure(); },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.5;
      return muted;
    },
    startMusic() {
      if (!ensure() || musicTimer) return;
      musicTimer = window.setInterval(musicStep, 214); // ~140 bpm eighth notes
    },
    stopMusic() {
      if (musicTimer) window.clearInterval(musicTimer);
      musicTimer = null;
    },
    pickup() { tone(520, 0.08, 'sine', 0.25, 0, 780); },
    place() { tone(220, 0.1, 'sine', 0.3, 0, 140); noise(0.05, 900, 0.15); },
    chop() { noise(0.07, 2400, 0.5); tone(180, 0.05, 'square', 0.12); },
    chopDone() { tone(660, 0.09, 'sine', 0.3); tone(880, 0.12, 'sine', 0.3, 0.08); },
    grillDone() { tone(740, 0.1, 'sine', 0.3); tone(988, 0.14, 'sine', 0.3, 0.09); },
    serve() {
      tone(523, 0.12, 'sine', 0.35);
      tone(659, 0.12, 'sine', 0.35, 0.1);
      tone(784, 0.2, 'sine', 0.35, 0.2);
      tone(1047, 0.28, 'sine', 0.3, 0.3);
    },
    error() { tone(160, 0.18, 'sawtooth', 0.2, 0, 110); },
    expire() { tone(330, 0.15, 'square', 0.2, 0, 220); tone(220, 0.25, 'square', 0.2, 0.15, 165); },
    tick() { tone(980, 0.05, 'sine', 0.18); },
    startSizzle() {
      if (!ensure() || muted || sizzleNodes) return;
      const length = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2800;
      const gain = ctx.createGain();
      gain.gain.value = 0.0;
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.3);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start();
      sizzleNodes = { source, gain };
    },
    stopSizzle() {
      if (!sizzleNodes) return;
      const { source, gain } = sizzleNodes;
      sizzleNodes = null;
      gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.2);
      window.setTimeout(() => { try { source.stop(); } catch { /* already stopped */ } }, 300);
    },
  };
}
