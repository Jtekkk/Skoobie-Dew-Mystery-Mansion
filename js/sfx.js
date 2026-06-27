/* ===== Skoobie-Dew & the Mystery Mansion — sound FX =====
   All sounds are synthesized with the Web Audio API, so there are no audio
   files to ship and everything works offline. A single AudioContext is
   created lazily on the first user gesture (browsers require this). */
const Sfx = (function () {
  "use strict";
  const MUTE_KEY = "skoobie-dew-muted";
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (_) {}

  function ensure() {
    if (muted) return null;
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (_) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // A single tone with an ADSR-ish envelope.
  function tone(freq, start, dur, type, peak) {
    const c = ctx;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak || 0.18, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
    return osc;
  }

  // A burst of filtered noise — good for creaks, scares and whooshes.
  function noise(start, dur, freq, q, peak) {
    const c = ctx;
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = freq || 800;
    filt.Q.value = q || 1;
    const gain = c.createGain();
    gain.gain.setValueAtTime(peak || 0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filt).connect(gain).connect(c.destination);
    src.start(start);
    src.stop(start + dur);
  }

  function seq(notes, type, gap) {
    const c = ensure(); if (!c) return;
    let t = c.currentTime;
    notes.forEach((n) => {
      tone(n[0], t, n[1], type, n[2]);
      t += (gap != null ? gap : n[1] * 0.8);
    });
  }

  const api = {
    blip() { const c = ensure(); if (!c) return; tone(420, c.currentTime, 0.07, "square", 0.06); },
    door() {
      const c = ensure(); if (!c) return;
      const o = tone(220, c.currentTime, 0.5, "sawtooth", 0.05);
      o.frequency.exponentialRampToValueAtTime(90, c.currentTime + 0.45);
      noise(c.currentTime, 0.5, 500, 4, 0.04);
    },
    clue() { seq([[660, 0.12], [880, 0.18, 0.18]], "sine"); },
    item() { seq([[523, 0.08], [659, 0.08], [784, 0.14]], "triangle"); },
    snack() { seq([[700, 0.05], [900, 0.07]], "square", 0.05); },
    puzzle() { seq([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.26]], "triangle"); },
    scare() {
      const c = ensure(); if (!c) return;
      const o = tone(180, c.currentTime, 0.6, "sawtooth", 0.22);
      o.frequency.exponentialRampToValueAtTime(50, c.currentTime + 0.55);
      noise(c.currentTime, 0.6, 300, 0.7, 0.2);
      tone(190, c.currentTime, 0.6, "square", 0.06);
    },
    win() { seq([[523, 0.14], [659, 0.14], [784, 0.14], [1047, 0.16], [784, 0.12], [1047, 0.4]], "triangle"); },
    lose() { seq([[440, 0.2], [392, 0.2], [330, 0.2], [262, 0.5]], "sawtooth"); },
    hint() { seq([[988, 0.1], [1319, 0.22, 0.12]], "sine"); },
    error() { const c = ensure(); if (!c) return; tone(160, c.currentTime, 0.18, "square", 0.12); },

    isMuted() { return muted; },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? "1" : "0"); } catch (_) {}
      if (!muted) this.blip();
      return muted;
    },
  };
  return api;
})();
