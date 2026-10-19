/* Map interaction and bounded canvas animation; simulation state stays in HealthcareBridge. */
(() => {
  'use strict';
  function mount(view, world, canvas, onPlace) {
    let scale = 1, tx = 0, ty = 0, base = 1, drag = null, moved = false, pinch = null;
    let frames = null, disposed = false, active = true, dirty = true, previous = 0, raf = null;
    const pointers = new Map(), ctx = canvas.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const scene = new HealthcareAnimation.Scene();
    scene.reduced = reduced.matches;
    const frameInterval = 1000 / (matchMedia('(max-width: 700px)').matches ? 24 : 30);

    function apply() {
      const width = 1536 * base * scale, height = 1024 * base * scale;
      const limitX = Math.max(0, (width - view.clientWidth) / 2), limitY = Math.max(0, (height - view.clientHeight) / 2);
      tx = Math.max(-limitX, Math.min(limitX, tx));ty = Math.max(-limitY, Math.min(limitY, ty));
      world.style.transform = `translate(-50%,-50%) translate(${tx}px,${ty}px) scale(${base * scale})`;
      view.dataset.zoom = String(scale);
    }
    function resize() { base = Math.max(view.clientWidth / 1536, view.clientHeight / 1024);apply(); }
    function zoom(amount) { scale = Math.max(1, Math.min(2.6, scale + amount));apply(); }
    function reset() { scale = 1;tx = ty = 0;apply(); }
    function distance() { const [a, b] = [...pointers.values()];return Math.hypot(a.x - b.x, a.y - b.y); }
    function down(event) {
      if (event.target.closest('button')) return;
      pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});view.setPointerCapture(event.pointerId);
      drag = {x: event.clientX, y: event.clientY, tx, ty};moved = false;
      if (pointers.size === 2) pinch = {distance: distance(), scale};
    }
    function move(event) {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
      if (pointers.size === 2 && pinch) {
        scale = Math.max(1, Math.min(2.6, pinch.scale * distance() / Math.max(1, pinch.distance)));moved = true;apply();
      } else if (drag) {
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (Math.hypot(dx, dy) > 5) moved = true;
        tx = drag.tx + dx;ty = drag.ty + dy;apply();
      }
    }
    function end(event) {
      if (!pointers.has(event.pointerId)) return;
      const tap = !moved && pointers.size === 1;
      pointers.delete(event.pointerId);pinch = null;drag = null;
      if (pointers.size === 1) {
        const [remaining] = pointers.values();drag = {x: remaining.x, y: remaining.y, tx, ty};moved = true;
      }
      if (tap && onPlace) {
        const rect = world.getBoundingClientRect();
        onPlace((event.clientX - rect.left) / rect.width * 1536, (event.clientY - rect.top) / rect.height * 1024);
      }
    }
    function cancel() { pointers.clear();drag = null;pinch = null;moved = true; }
    function wheel(event) { if (event.target.closest('button')) return;event.preventDefault();zoom(event.deltaY < 0 ? .12 : -.12); }
    view.addEventListener('pointerdown', down);view.addEventListener('pointermove', move);
    view.addEventListener('pointerup', end);view.addEventListener('pointercancel', cancel);view.addEventListener('wheel', wheel, {passive: false});
    const observer = new ResizeObserver(resize);observer.observe(view);resize();

    function needsAnimation() {
      return scene.effectiveMode === 'full' && !scene.suspended && (!scene.paused || scene.effects.length || scene.actors.some(actor => actor.task));
    }
    function schedule() { if (!disposed && active && !document.hidden && raf === null) raf = requestAnimationFrame(draw); }
    function invalidate() { dirty = true;schedule(); }
    function draw(now) {
      raf = null;
      if (disposed || !active || document.hidden) { previous = 0;return; }
      if (previous && now - previous < frameInterval && !dirty) { schedule();return; }
      const dt = previous ? Math.min((now - previous) / 1000, .1) : 0;previous = now;
      scene.update(dt);
      ctx.clearRect(0, 0, 1536, 1024);scene.draw(ctx, frames);dirty = false;
      if (needsAnimation()) schedule();else previous = 0;
    }
    function updateMotionClass() {
      view.closest('#he14')?.classList.toggle('h16-motion-reduced', scene.effectiveMode !== 'full');
      view.dataset.animationMode = scene.effectiveMode;
    }
    function mediaChanged() { scene.reduced = reduced.matches;updateMotionClass();invalidate(); }
    function visibilityChanged() {
      if (raf !== null) cancelAnimationFrame(raf);raf = null;previous = 0;
      if (!document.hidden) invalidate();
    }
    reduced.addEventListener('change', mediaChanged);document.addEventListener('visibilitychange', visibilityChanged);
    HealthcareAssets.nurseFrames().then(result => { if (!disposed) { frames = result;invalidate(); } }).catch(() => view.dataset.animationError = 'true');
    updateMotionClass();invalidate();
    return {
      zoom, reset,
      setPaused(value) { if (scene.paused !== value) { scene.paused = value;invalidate(); } },
      setCount(value) { const count = Math.min(12, Math.max(0, Math.floor(Number(value) || 0)));if (scene.actors.length !== count) { scene.setCount(count);invalidate(); } },
      setSpeed(value) { scene.speed = [1, 2, 4].includes(value) ? value : 1;invalidate(); },
      setMode(value) { const old = scene.mode;scene.setMode(value);if (old !== scene.mode) { updateMotionClass();invalidate(); } },
      setSuspended(value) { if (scene.suspended !== value) { scene.suspended = value;previous = 0;invalidate(); } },
      setActive(value) { active = value;if (!value && raf !== null) { cancelAnimationFrame(raf);raf = null;previous = 0; }else invalidate(); },
      setLayout(layout) { const old=scene.layoutKey;scene.setLayout(layout);if(old!==scene.layoutKey)invalidate(); },
      care(kind,destination) { scene.care(kind,destination);invalidate(); },
      effect(kind, options) { scene.effect(kind, options);invalidate(); },
      getState: () => ({scale, tx, ty, ready: !!frames, active, running: raf !== null, ...scene.snapshot()}),
      destroy() {
        disposed = true;if (raf !== null) cancelAnimationFrame(raf);observer.disconnect();
        reduced.removeEventListener('change', mediaChanged);document.removeEventListener('visibilitychange', visibilityChanged);
        view.removeEventListener('pointerdown', down);view.removeEventListener('pointermove', move);view.removeEventListener('pointerup', end);
        view.removeEventListener('pointercancel', cancel);view.removeEventListener('wheel', wheel);
      }
    };
  }
  window.HealthcareMapV14 = {mount};
})();
