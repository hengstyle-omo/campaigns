window.createDysonDrawEffects = (stage, canvas, gifts) => {
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, idleStart = 0, ready = false;
  let visible = true, selected = null, targets = [], hovered = null, consolation = null;
  const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 };
  const snow = Array.from({ length: 64 }, (_, i) => ({
    x: Math.random(), y: Math.random(), phase: Math.random() * 6.28,
    size: i < 48 ? 0.7 + Math.random() : 1.8 + Math.random() * 1.5,
  }));
  const color = (alpha, gold) => gold ? `rgba(255,206,122,${alpha})` : `rgba(236,249,255,${alpha})`;
  function dot(x, y, radius, alpha, gold = false) {
    if (alpha <= 0) return;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (!gold && radius > 1.8) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color(alpha, false));
      gradient.addColorStop(1, color(0, false));
      ctx.fillStyle = gradient;
    } else ctx.fillStyle = color(alpha, gold);
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
  function drawIdle(now) {
    if (!idleStart) idleStart = now;
    const time = (now - idleStart) % 10000;
    stage.classList.toggle('draw-idle-pulse', time > 1200 && time < 3000);
  }
  function drawWin(now) {
    const progress = (now - selected.start) / 1400;
    if (progress >= 1) { selected = null; return; }
    const [x, y] = selected.point;
    for (let i = 0; i < 18; i++) {
      const angle = i * 2.4;
      const radius = width * .045 * progress * (1 + i % 3 * .25);
      dot(x + Math.cos(angle) * radius,
        y - height * .09 * progress + Math.sin(angle) * radius * .5,
        1.3 + i % 2 * .4, Math.sin(progress * Math.PI) * .65, true);
    }
  }
  function drawGather(now) {
    const point = targets[hovered];
    if (!point) return;
    for (let i = 0; i < 20; i++) {
      const progress = ((now / 1300 + i / 20) % 1);
      const angle = i * 2.4 + progress * .6;
      const radius = (1 - progress) * width * .105;
      dot(point[0] + Math.cos(angle) * radius,
        point[1] + Math.sin(angle) * radius * .65,
        1 + i % 3 * .4, Math.sin(progress * Math.PI) * .75);
    }
  }
  function drawConsolation(now) {
    const progress = (now - consolation.start) / 950;
    if (progress >= 1) { consolation = null; return; }
    const [x, y] = consolation.point;
    for (let i = 0; i < 9; i++) {
      const offset = Math.sin(i * 2.4) * width * .035 * progress;
      const lift = progress * height * (.06 + i % 3 * .025);
      const alpha = Math.sin(progress * Math.PI) * .7;
      dot(x + offset, y - lift, 1.7, alpha, true);
      dot(x + offset - 3, y - lift, .8, alpha * .65, true);
      dot(x + offset + 3, y - lift, .8, alpha * .65, true);
      dot(x + offset, y - lift - 3, .8, alpha * .65, true);
      dot(x + offset, y - lift + 3, .8, alpha * .65, true);
    }
  }
  function paint(now) {
    frame = 0;
    if (!visible || document.hidden || motion.matches) return;
    ctx.clearRect(0, 0, width, height);
    pointer.currentX += (pointer.x - pointer.currentX) * .065;
    pointer.currentY += (pointer.y - pointer.currentY) * .065;
    for (const [layer, depth] of [['land', 2], ['tree', 4], ['gift', 7]]) {
      stage.style.setProperty('--' + layer + '-x', pointer.currentX * depth + 'px');
      stage.style.setProperty('--' + layer + '-y', pointer.currentY * depth + 'px');
    }
    for (const { x, y, phase, size } of snow) {
      const breeze = Math.sin(now / 1100 + phase) * .026;
      dot(((x + now * size / 200000 + breeze) % 1 + 1) % 1 * width,
        ((y + now * size / 38000) % 1) * height, size, size > 1.8 ? .53 : .33);
    }
    if (ready) drawIdle(now);
    if (selected) drawWin(now);
    if (hovered !== null && ready) { locateGifts(); drawGather(now); }
    if (consolation) drawConsolation(now);
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
  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || motion.matches) return;
    const rect = stage.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointer.y = (event.clientY - rect.top) / rect.height * 2 - 1;
  });
  stage.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
  for (const [index, gift] of gifts.entries()) {
    const gather = () => {
      if (gift.disabled || !ready) return;
      locateGifts();
      hovered = index;
    };
    const release = () => { if (hovered === index) hovered = null; };
    gift.addEventListener('pointerenter', gather);
    gift.addEventListener('focus', gather);
    gift.addEventListener('pointerleave', release);
    gift.addEventListener('blur', release);
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
      if (!ready) hovered = null;
      stage.classList.toggle('draw-idle-ready', ready);
      stage.classList.remove('draw-idle-pulse');
      if (ready) {
        idleStart = 0;
        locateGifts();
      }
    },
    showConsolation(index) {
      locateGifts();
      consolation = { start: performance.now(), point: targets[index] };
    },
    celebrate(index) {
      locateGifts();
      selected = { start: performance.now(), point: targets[index] };
    },
  };
};
