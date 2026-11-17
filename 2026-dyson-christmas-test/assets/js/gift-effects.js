window.createDysonDrawEffects = (stage, canvas, gifts) => {
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, idleStart = 0, ready = false;
  let visible = true, selected = null, targets = [];
  const snow = Array.from({ length: 64 }, (_, i) => ({
    x: Math.random(), y: Math.random(), phase: Math.random() * 6.28,
    size: i < 48 ? 0.7 + Math.random() : 1.8 + Math.random() * 1.5,
  }));
  const color = (alpha, gold) => gold ? `rgba(255,206,122,${alpha})` : `rgba(236,249,255,${alpha})`;
  function dot(x, y, radius, alpha, gold = false) {
    if (alpha <= 0) return;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color(alpha, gold);
    ctx.fill();
  }
  function locateGifts() {
    const scene = stage.getBoundingClientRect();
    targets = gifts.map(gift => {
      const box = gift.getBoundingClientRect();
      return [box.left + box.width / 2 - scene.left, box.top + box.height * .2 - scene.top];
    });
  }
  function resize() {
    if (!ctx) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    locateGifts();
  }
  function tail(now, elapsed, end, point) {
    for (let i = 11; i >= 0; i--) {
      const p = elapsed - i * .025;
      if (p < 0 || p > 1) continue;
      const [x, y] = point(p);
      dot(x, y + Math.sin(now / 85 + i) * i * .35, i ? 1.2 : 3.3, (1 - i / 12) * end, true);
    }
  }
  function drawIdle(now) {
    if (!idleStart) idleStart = now;
    const time = ((now - idleStart) % 9300) / 1000;
    const top = [width * .51, height * .19];
    tail(now, time / .95, .9, p => [
      width * (.51 + Math.sin(p * 11) * .10 * (1 - p)),
      height * (.75 - p * .56),
    ]);
    if (time > .7 && time < 2) dot(...top, 4 + 3 * Math.sin(time * 4) ** 2, .8, true);
    if (time >= 1 && time < 2.45) {
      for (const [i, [x, y]] of targets.entries()) {
        tail(now, (time - 1 - i * .035) / .9, .86, p => [
          top[0] + (x - top[0]) * p,
          top[1] + (y - top[1]) * p - Math.sin(p * Math.PI) * height * .18,
        ]);
      }
    }
    stage.classList.toggle('draw-idle-pulse', time > 1.9 && time < 2.42);
  }
  function drawWin(now) {
    const time = (now - selected.start) / 1000;
    const [x, y] = selected.point;
    const top = [width * .51, height * .19];
    tail(now, time / .95, 1, p => [
      x + (top[0] - x) * p + Math.sin(p * 16) * width * .13 * Math.sin(p * Math.PI),
      y + (top[1] - y) * p,
    ]);
    const burst = (time - .78) / .62;
    if (burst > 0 && burst < 1) {
      for (let i = 0; i < 22; i++) {
        const angle = i * 2.4, radius = width * .15 * burst * (.35 + (i % 5) * .16);
        dot(top[0] + Math.cos(angle) * radius, top[1] + Math.sin(angle) * radius + burst ** 2 * 40, 2.2, 1 - burst, true);
      }
    }
    if (time >= 1.4) selected = null;
  }
  function paint(now) {
    frame = 0;
    if (!visible || document.hidden || motion.matches) return;
    ctx.clearRect(0, 0, width, height);
    for (const { x, y, phase, size } of snow) {
      const breeze = Math.sin(now / 1100 + phase) * .026;
      dot(((x + now * size / 200000 + breeze) % 1 + 1) % 1 * width,
        ((y + now * size / 38000) % 1) * height, size, size > 1.8 ? .53 : .33);
    }
    if (ready) drawIdle(now);
    if (selected) drawWin(now);
    frame = requestAnimationFrame(paint);
  }
  function update() {
    const running = visible && !document.hidden && !motion.matches;
    if (running && !frame && ctx) frame = requestAnimationFrame(paint);
    if (!running && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      ctx.clearRect(0, 0, width, height);
    }
  }
  if (ctx) {
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }).observe(stage);
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
  }
  return {
    setReady(value) {
      if (ready === value) return;
      ready = value;
      stage.classList.toggle('draw-idle-ready', ready);
      stage.classList.remove('draw-idle-pulse');
      if (ready) {
        idleStart = 0;
        locateGifts();
      }
    },
    celebrate(index) {
      locateGifts();
      selected = { start: performance.now(), point: targets[index] };
    },
  };
};
