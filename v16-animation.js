/* Presentation-only animation state. No economy, timers or saves are mutated here. */
(() => {
  'use strict';
  const DIRECTIONS = ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'];
  const ROUTE = [[535, 545], [680, 478], [814, 416], [940, 478], [830, 553], [702, 625]];
  const TARGETS = {care: [680, 478], therapy: [940, 478], activity: [814, 416]};
  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));

  class Scene {
    constructor() {
      this.actors = [];
      this.effects = [];
      this.clock = 0;
      this.mode = 'full';
      this.reduced = false;
      this.paused = true;
      this.suspended = false;
      this.speed = 1;
      this.serial = 0;
    }
    get effectiveMode() { return this.reduced && this.mode === 'full' ? 'reduced' : this.mode; }
    setMode(mode) {
      this.mode = ['full', 'reduced', 'off'].includes(mode) ? mode : 'full';
      if (this.effectiveMode !== 'full') this.effects = [];
    }
    setCount(count) {
      count = clamp(Math.floor(Number(count) || 0), 0, 12);
      this.actors.length = Math.min(this.actors.length, count);
      while (this.actors.length < count) {
        const id = this.actors.length, segment = id % ROUTE.length, origin = ROUTE[segment];
        this.actors.push({id, x: origin[0], y: origin[1], target: (segment + 1) % ROUTE.length, direction: 'southeast', state: 'idle', action: 'idle', frame: 0, frameClock: 0, wait: id * .3, task: null});
      }
    }
    effect(kind, {x = 768, y = 500, label = ''} = {}) {
      if (this.effectiveMode !== 'full') return;
      this.effects.push({id: ++this.serial, kind, x, y, label, age: 0, lifetime: kind === 'build' ? 2.4 : 1.8});
      // Bound transient work, including rapid clicks in management panels.
      if (this.effects.length > 24) this.effects.splice(0, this.effects.length - 24);
    }
    care(kind = 'care') {
      if (this.effectiveMode !== 'full') return;
      const target = TARGETS[kind] || TARGETS.care;
      const available = this.actors.filter(actor => !actor.task);
      available.sort((a, b) => Math.hypot(a.x - target[0], a.y - target[1]) - Math.hypot(b.x - target[0], b.y - target[1]));
      const actor = available[0];
      if (!actor) return;
      actor.task = {kind, destination: target, duration: 2.6, origin: [actor.x, actor.y]};
      actor.state = 'responding';
      actor.wait = 0;
    }
    move(actor, target, distance) {
      const dx = target[0] - actor.x, dy = target[1] - actor.y, length = Math.hypot(dx, dy);
      if (length <= distance || length < .01) { actor.x = target[0]; actor.y = target[1]; return true; }
      actor.direction = DIRECTIONS[Math.round((Math.atan2(dy, dx) + Math.PI * 2) / (Math.PI / 4)) % 8];
      actor.x += dx / length * distance;
      actor.y += dy / length * distance;
      return false;
    }
    update(dt) {
      dt = clamp(Number(dt) || 0, 0, .1);
      if (this.suspended) return;
      const motion = this.effectiveMode === 'full';
      if (motion) {
        // Presentation speed is capped separately from the game's financial clock.
        this.clock += dt * (this.paused ? 0 : this.speed);
        for (const effect of this.effects) effect.age += dt;
        this.effects = this.effects.filter(effect => effect.age < effect.lifetime);
      } else this.effects = [];
      for (const actor of this.actors) {
        actor.action = 'idle';actor.frame = 0;
        if (!motion) continue;
        if (actor.task) {
          const task = actor.task;
          if (actor.state === 'responding') {
            actor.action = 'run';
            if (this.move(actor, task.destination, dt * 110)) {
              actor.state = 'caring';
              this.effect('care', {x: actor.x, y: actor.y - 70, label: task.kind === 'therapy' ? 'ฟื้นฟู' : task.kind === 'activity' ? 'กิจกรรม' : 'ดูแล'});
            }
          } else if (actor.state === 'caring') {
            actor.action = 'use';task.duration -= dt;
            if (task.duration <= 0) actor.state = 'returning';
          } else if (actor.state === 'returning') {
            actor.action = 'walk';
            if (this.move(actor, task.origin, dt * 55)) { actor.task = null;actor.state = 'idle';actor.wait = .8; }
          }
        } else if (!this.paused) {
          actor.wait = Math.max(0, actor.wait - dt * this.speed);
          if (!actor.wait) {
            actor.state = 'walking';actor.action = this.speed >= 4 ? 'run' : 'walk';
            if (this.move(actor, ROUTE[actor.target], dt * 42 * this.speed)) {
              actor.target = (actor.target + 1) % ROUTE.length;actor.wait = 1.3 + actor.id * .12;actor.state = 'idle';actor.action = 'idle';
            }
          }
        } else actor.state = 'idle';
        if (actor.action !== 'idle') {
          actor.frameClock += dt * (actor.action === 'run' ? 10 : actor.action === 'use' ? 3 : 6);
          actor.frame = Math.floor(actor.frameClock) % 2;
        }
      }
    }
    draw(ctx, frames) {
      if (this.effectiveMode === 'full' && !this.paused) this.drawAmbient(ctx);
      // Draw far actors first, keeping the nearest actor in front.
      if (frames) for (const actor of [...this.actors].sort((a, b) => a.y - b.y)) {
        const moving = actor.action === 'walk' || actor.action === 'run';
        const bob = moving && this.effectiveMode === 'full' ? Math.sin(actor.frameClock * Math.PI) * (actor.action === 'run' ? 2.1 : .9) : 0;
        const sprite = frames[actor.direction]?.[actor.action]?.[actor.frame] || frames.south.idle[0];
        ctx.save();ctx.fillStyle = '#173d3540';ctx.beginPath();ctx.ellipse(actor.x, actor.y + 3, 12, 4, 0, 0, Math.PI * 2);ctx.fill();
        ctx.drawImage(sprite, actor.x - 17, actor.y - 65 + bob, 34, 72);
        if (actor.task && actor.state === 'caring' && this.effectiveMode === 'full') {
          const rise = Math.sin(this.clock * 2 + actor.frameClock) * 2;
          ctx.fillStyle = '#fffaf1';ctx.beginPath();ctx.roundRect(actor.x - 21, actor.y - 92 + rise, 42, 24, 9);ctx.fill();
          ctx.fillStyle = '#e68b91';ctx.font = 'bold 16px sans-serif';ctx.textAlign = 'center';ctx.fillText('♥', actor.x, actor.y - 74 + rise);
        }
        ctx.restore();
      }
      if (this.effectiveMode === 'full') for (const effect of this.effects) this.drawEffect(ctx, effect);
    }
    drawAmbient(ctx) {
      const t = this.clock;
      ctx.save();
      // The fountain is an overlay on the illustrated background, not fluid simulation.
      ctx.strokeStyle = '#c5f5ff99';ctx.lineWidth = 1.8;
      for (let i = 0; i < 3; i++) {
        const phase = (t * .45 + i / 3) % 1;
        ctx.globalAlpha = (1 - phase) * .65;ctx.beginPath();ctx.ellipse(297, 584, 5 + phase * 20, 2 + phase * 7, 0, 0, Math.PI * 2);ctx.stroke();
      }
      ctx.globalAlpha = .8;ctx.fillStyle = '#dcfaff';
      for (let i = 0; i < 6; i++) {
        const phase = (t * .8 + i / 6) % 1, x = 297 + Math.sin(i * 2.4) * phase * 15, y = 576 - Math.sin(phase * Math.PI) * 23;
        ctx.beginPath();ctx.ellipse(x, y, 1.3, 2, 0, 0, Math.PI * 2);ctx.fill();
      }
      ctx.fillStyle = '#eddf9a';
      for (let i = 0; i < 8; i++) {
        const phase = (t * .04 + i * .137) % 1;
        ctx.globalAlpha = Math.sin(phase * Math.PI) * .55;
        const x = 90 + i * 175 + Math.sin(t * .45 + i) * 12, y = 120 + phase * 230 + (i % 3) * 80;
        ctx.beginPath();ctx.ellipse(x, y, 2.5, 1.2, t * .5, 0, Math.PI * 2);ctx.fill();
      }
      ctx.restore();
    }
    drawEffect(ctx, effect) {
      const progress = effect.age / effect.lifetime, fade = Math.min(1, (1 - progress) * 3);
      ctx.save();ctx.globalAlpha = fade;
      ctx.strokeStyle = effect.kind === 'build' ? '#ffdc7c' : '#8de2c4';ctx.lineWidth = 3 * (1 - progress);
      ctx.beginPath();ctx.ellipse(effect.x, effect.y, 18 + progress * 52, 7 + progress * 19, 0, 0, Math.PI * 2);ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3, radius = 15 + progress * 47;
        ctx.fillStyle = i % 2 ? '#ffdb8e' : '#b5ebd9';
        ctx.beginPath();ctx.arc(effect.x + Math.cos(angle) * radius, effect.y - 20 - progress * 20 + Math.sin(angle) * radius * .5, 2 * (1 - progress), 0, Math.PI * 2);ctx.fill();
      }
      if (effect.label) {
        ctx.font = 'bold 16px system-ui, sans-serif';ctx.textAlign = 'center';ctx.lineWidth = 4;ctx.strokeStyle = '#204d42';ctx.fillStyle = '#fff5d7';
        ctx.strokeText(effect.label, effect.x, effect.y - 45 - progress * 30);ctx.fillText(effect.label, effect.x, effect.y - 45 - progress * 30);
      }
      ctx.restore();
    }
    snapshot() {
      return {mode: this.mode, effectiveMode: this.effectiveMode, paused: this.paused, suspended: this.suspended, clock: this.clock, speed: this.speed, effectCount: this.effects.length, agents: this.actors.map(({id, x, y, direction, state, action, frame}) => ({id, x, y, direction, state, action, frame}))};
    }
  }
  window.HealthcareAnimation = {Scene};
})();
