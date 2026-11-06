// Virtual time for frame-by-frame capture. Injected before any page script runs.
// JS clocks, timers, rAF, CSS/WAAPI animations and SVG SMIL all follow window.__vt.now,
// which only moves when the capture driver calls __vt.step(ms).
(() => {
  const W = window;
  const realSetTimeout = W.setTimeout.bind(W);
  const RealDate = W.Date;
  const EPOCH = new RealDate(2026, 10, 6, 6, 58, 0).getTime();
  let now = 0;

  // Seeded randomness, so every take is the same. __forceRand: the next value(s) to hand out.
  let seed = 0x2f6a1c3d;
  const prng = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  W.__forceRand = [];
  Math.random = () => (W.__forceRand.length ? W.__forceRand.shift() : prng());

  class VDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(EPOCH + now); else super(...a); }
    static now() { return EPOCH + now; }
  }
  W.Date = VDate;
  performance.now = () => now;

  // No audio in capture: the soundtrack is mixed afterwards.
  W.AudioContext = undefined;
  W.webkitAudioContext = undefined;

  let seq = 1;
  const timers = new Map();
  const rafs = new Map();
  W.setTimeout = (fn, ms = 0, ...args) => {
    const id = seq++;
    timers.set(id, { id, at: now + Math.max(0, +ms || 0), fn, args, every: 0 });
    return id;
  };
  W.setInterval = (fn, ms = 0, ...args) => {
    const id = seq++;
    const every = Math.max(1, +ms || 0);
    timers.set(id, { id, at: now + every, fn, args, every });
    return id;
  };
  W.clearTimeout = W.clearInterval = (id) => { timers.delete(id); };
  W.requestAnimationFrame = (fn) => { const id = seq++; rafs.set(id, fn); return id; };
  W.cancelAnimationFrame = (id) => { rafs.delete(id); };

  const anims = new WeakMap();
  const svgs = new WeakMap();
  const syncAnimations = () => {
    for (const a of document.getAnimations()) {
      let k = anims.get(a);
      if (!k) {
        k = { start: now, done: false };
        anims.set(a, k);
      }
      if (k.done) continue;
      try { if (a.playState !== 'paused') a.pause(); } catch {}
      const local = (now - k.start) * (a.playbackRate || 1);
      let end = Infinity;
      try { end = a.effect.getComputedTiming().endTime; } catch {}
      try {
        if (local >= end && Number.isFinite(end)) {
          a.currentTime = end;
          k.done = true;
          a.finish();
        } else {
          a.currentTime = Math.max(0, local);
        }
      } catch {}
    }
    for (const s of document.querySelectorAll('svg')) {
      if (s.ownerSVGElement) continue;
      if (!s.querySelector('animate,animateTransform,animateMotion,set')) continue;
      let first = svgs.get(s);
      if (first === undefined) { first = now; svgs.set(s, first); s.pauseAnimations(); }
      try { s.setCurrentTime((now - first) / 1000); } catch {}
    }
  };

  const hooks = [];
  W.__vt = {
    get now() { return now; },
    onFrame(fn) { hooks.push(fn); },
    async step(dt) {
      const target = now + dt;
      for (;;) {
        let next = null;
        for (const t of timers.values()) {
          if (t.at <= target && (!next || t.at < next.at || (t.at === next.at && t.id < next.id))) next = t;
        }
        if (!next) break;
        now = Math.max(now, next.at);
        if (next.every) next.at += next.every; else timers.delete(next.id);
        try { typeof next.fn === 'function' ? next.fn(...next.args) : (0, eval)(String(next.fn)); } catch (e) { console.error(e); }
        await null;
      }
      now = target;
      const due = [...rafs.values()];
      rafs.clear();
      for (const fn of due) { try { fn(now); } catch (e) { console.error(e); } }
      for (const fn of hooks) { try { fn(now); } catch (e) { console.error(e); } }
      // Let React commit whatever the timers and frames scheduled (real macrotasks).
      await new Promise((r) => realSetTimeout(r, 0));
      await new Promise((r) => realSetTimeout(r, 0));
      syncAnimations();
      return now;
    },
    sync: syncAnimations,
    settle: () => new Promise((r) => realSetTimeout(r, 0)),
  };

  // A drawn cursor (headless Chrome has none) with a ripple on each press.
  const cursor = { x: -100, y: -100, visible: false, downs: [] };
  W.__cursor = cursor;
  const ensureCursor = () => {
    let el = document.getElementById('__vcursor');
    if (el || !document.body) return el;
    el = document.createElement('div');
    el.id = '__vcursor';
    el.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
    el.innerHTML = `
      <div class="rip" style="position:absolute;left:0;top:0;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;background:rgba(255,255,255,.55);box-shadow:0 0 0 2px rgba(67,35,68,.35);opacity:0"></div>
      <svg width="34" height="40" viewBox="0 0 34 40" style="position:absolute;left:-5px;top:-3px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))">
        <path d="M5 3 L5 31 L12 24.5 L17 35.5 L22.5 33 L17.5 22.5 L27 22.5 Z" fill="#111" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/>
      </svg>`;
    document.body.appendChild(el);
    return el;
  };
  W.__vt.onFrame((t) => {
    const el = ensureCursor();
    if (!el) return;
    el.style.display = cursor.visible ? 'block' : 'none';
    el.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
    const rip = el.querySelector('.rip');
    const last = cursor.downs.length ? cursor.downs[cursor.downs.length - 1] : -1e9;
    const k = (t - last) / 420;
    if (k >= 0 && k < 1) {
      rip.style.opacity = String(0.9 * (1 - k));
      rip.style.transform = `scale(${0.35 + 0.9 * k})`;
    } else rip.style.opacity = '0';
    const svg = el.querySelector('svg');
    const press = cursor.pressed ? 0.88 : 1;
    svg.style.transform = `scale(${press})`;
  });
})();
