window.createDysonDrawEffects = (stage, canvas, gifts) => {
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, idleStart = 0, ready = false;
  let visible = true, selected = null, targets = [], feetTargets = [], hovered = null, consolation = null;
  let lastParallaxX=NaN,lastParallaxY=NaN,lastPaint=0,resizeFrame=0;
  const compactScreen=matchMedia('(max-width: 760px)');
  let animals = [], visitorUntil = 0, nextVisitor = 0;
  let animalBag = [], lastAnimalDay = null;
  function nextAmbientAnimal() {
    if (!animals.length) return null;
    if (!animalBag.length) {
      animalBag = [...animals];
      for (let i = animalBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [animalBag[i], animalBag[j]] = [animalBag[j], animalBag[i]];
      }
      if (animalBag.length > 1 && animalBag[0].day === lastAnimalDay) {
        [animalBag[0], animalBag[1]] = [animalBag[1], animalBag[0]];
      }
    }
    const animal = animalBag.shift();
    lastAnimalDay = animal.day;
    return animal;
  }
  const visitor = document.getElementById('draw-visitor');
  const visitorImage = document.getElementById('draw-visitor-image');
  const visitorRoutes = [
    { id: 'near-slope', feet: [53, 49, 45, 47, 53], size: 12.6 },
    { id: 'middle-ridge', feet: [49, 46, 43, 45, 50], size: 10.56 },
    { id: 'far-ridge', feet: [46, 43, 41, 44, 48], size: 8.76 },
  ];
  let visitorTrip = null, lastVisitorRoute = -1;
  function visitorProfile(day) {
    if (day === 106) return { kind: 'slide', duration: 8200, bob: .35, tilt: 1.1, pace: 1.8 };
    if (day === 107) return { kind: 'amble', duration: 12500, bob: .6, tilt: .6, pace: 2.2 };
    if (day === 109) return { kind: 'amble', duration: 11200, bob: .65, tilt: .8, pace: 2.5 };
    return { kind: 'trot', duration: day === 101 ? 9500 : 10800, bob: 1.65, tilt: 1.3, pace: 4.2 };
  }
  function paintVisitor(now) {
    const { start, duration, route, direction, profile, phase } = visitorTrip;
    const p = Math.max(0, Math.min(1, (now - start) / duration));
    const travel = direction === 1 ? p : 1 - p;
    const position = travel * (route.feet.length - 1);
    const segment = Math.min(route.feet.length - 2, Math.floor(position));
    const blend = (1 - Math.cos((position - segment) * Math.PI)) / 2;
    const feet = route.feet[segment] * (1 - blend) + route.feet[segment + 1] * blend;
    const stride = Math.sin((now - start) / 1000 * profile.pace * Math.PI + phase);
    const bob = stride * profile.bob * Math.min(width / 700, 1.3);
    visitor.style.left = (-18 + travel * 136) + '%';
    visitor.style.top = feet + '%';
    visitor.style.width = (route.size * (1 + Math.sin(p * Math.PI) * .035)) + '%';
    visitor.style.opacity = String(Math.max(0, Math.min(1, p / .1, (1 - p) / .1)));
    visitorImage.style.transform = `scaleX(${direction}) translateY(${bob.toFixed(2)}px) rotate(${(stride * profile.tilt).toFixed(2)}deg)`;
  }
  function updateVisitor(now) {
    if (visitorTrip && now >= visitorUntil) {
      visitor.hidden = true; visitorUntil = 0; visitorTrip = null;
    }
    if (visitorTrip) { paintVisitor(now); return; }
    if (!animals.length || document.querySelector('dialog[open]')) return;
    if (!nextVisitor) nextVisitor = now + 10000 + Math.random()*5000;
    if (now < nextVisitor) return;
    const animal = nextAmbientAnimal();
    const routeIndex = lastVisitorRoute < 0 ? Math.floor(Math.random()*visitorRoutes.length)
      : (lastVisitorRoute + 1 + Math.floor(Math.random()*(visitorRoutes.length - 1))) % visitorRoutes.length;
    lastVisitorRoute = routeIndex;
    const profile = visitorProfile(animal.day);
    const duration = profile.duration * (.95 + Math.random() * .1);
    const direction = Math.random() < .5 ? 1 : -1;
    visitorTrip = { start: now, duration, route: visitorRoutes[routeIndex], direction, profile, phase: Math.random()*Math.PI*2 };
    visitor.dataset.route = visitorTrip.route.id;
    visitor.dataset.direction = direction === 1 ? 'left-to-right' : 'right-to-left';
    visitor.dataset.motion = profile.kind;
    visitorImage.src = animal.image;
    visitor.hidden = false;
    paintVisitor(now);
    visitorUntil = now + duration;
    nextVisitor = visitorUntil + 45000 + Math.random()*20000;
  }
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
  const GIFT_ART_BOUNDS=[{"x":0.12440191387559808,"y":0.12280701754385964,"w":0.7743221690590112,"h":0.7974481658692185},{"x":0.11481481481481481,"y":0.07343857240905971,"w":0.7694444444444445,"h":0.8641043239533288},{"x":0.03995433789954338,"y":0.0713489409141583,"w":0.9178082191780822,"h":0.8439241917502787},{"x":0.21371610845295055,"y":0.21770334928229665,"w":0.5629984051036683,"h":0.5566188197767146},{"x":0.10027347310847767,"y":0.03138075313807531,"w":0.8003646308113036,"h":0.9218967921896792}];
  function locateGifts() {
    const scene=stage.getBoundingClientRect();feetTargets=[];
    targets=gifts.map((gift,index)=>{
      const box=gift.getBoundingClientRect(),b=GIFT_ART_BOUNDS[index];
      const x=box.left+box.width*(b.x+b.w/2)-scene.left;
      const y=box.top+box.height*(b.y+b.h)-scene.top;
      const visibleWidth=box.width*b.w,visibleHeight=box.height*b.h;
      feetTargets.push({x:x-pointer.currentX*7,y:y-pointer.currentY*7,width:visibleWidth,height:visibleHeight});
      return [x,y-visibleHeight*.8];
    });
  }

  // Foreground composition: the tree is scenery, never a gift obstacle.
  function layoutForegroundGifts() {
    for(const gift of gifts){gift.style.setProperty('--gift-layout-scale','1');gift.style.setProperty('--gift-clear-x','0px');gift.style.setProperty('--gift-clear-y','0px');}
    const scene=stage.getBoundingClientRect();
    if(!scene.width||!scene.height||gifts.length!==5)return;
    const boxes=gifts.map(gift=>gift.getBoundingClientRect());
    const margin=Math.max(14,scene.width*.035),gap=Math.max(12,scene.width*.025);
    const floor=scene.height-margin;
    const points=[];
    points[0]={x:margin+boxes[0].width/2,y:floor-boxes[0].height/2};
    points[2]={x:scene.width*.40,y:floor-boxes[2].height/2};
    points[3]={x:scene.width-margin-boxes[3].width/2,y:floor-boxes[3].height/2};
    const leftBackFloor=Math.min(points[0].y-boxes[0].height/2,points[2].y-boxes[2].height/2)-gap*2;
    const rightBackFloor=points[3].y-boxes[3].height/2-gap*2;
    points[1]={x:scene.width*.28,y:leftBackFloor-boxes[1].height/2};
    points[4]={x:scene.width*.74,y:rightBackFloor-boxes[4].height/2};
    points.forEach((point,index)=>{
      const box=boxes[index];
      gifts[index].style.setProperty('--gift-clear-x',(scene.left+point.x-(box.left+box.right)/2)+'px');
      gifts[index].style.setProperty('--gift-clear-y',(scene.top+point.y-(box.top+box.bottom)/2)+'px');
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
    layoutForegroundGifts();
    locateGifts();
  }
  let spotlightIndex=-1,spotlightStart=0;
  const SPOTLIGHT_DURATION=3600;
  function clearGiftCues(){
    for(const gift of gifts)gift.classList.remove('draw-spotlit','draw-wobble');
    spotlightIndex=-1;spotlightStart=0;stage.classList.remove('draw-idle-pulse');
  }
  function drawIdle(now){
    if(!ready||gifts.some(gift=>gift.dataset.state==='opening')){clearGiftCues();return;}
    const eligible=gifts.map((gift,index)=>!gift.disabled&&gift.dataset.state==='closed'?index:-1).filter(index=>index>=0);
    if(!eligible.length){clearGiftCues();return;}
    if(spotlightIndex<0||now-spotlightStart>=SPOTLIGHT_DURATION||!eligible.includes(spotlightIndex)){
      for(const gift of gifts)gift.classList.remove('draw-spotlit');
      if(spotlightIndex<0)spotlightIndex=eligible[Math.floor(Math.random()*eligible.length)];
      else{const at=eligible.indexOf(spotlightIndex);spotlightIndex=eligible[(at+1)%eligible.length];}
      spotlightStart=now;gifts[spotlightIndex].classList.add('draw-spotlit');
    }
    // The cue's soft light follows the artwork alpha via CSS drop-shadows.
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
    if (!visible || document.hidden || motion.matches || document.querySelector('dialog[open]')) return;
    if(compactScreen.matches && !selected && !consolation && now-lastPaint<32){frame=requestAnimationFrame(paint);return;}
    lastPaint=now;
    ctx.clearRect(0, 0, width, height);
    pointer.currentX += (pointer.x - pointer.currentX) * .065;
    pointer.currentY += (pointer.y - pointer.currentY) * .065;
    if(!Number.isFinite(lastParallaxX)||Math.abs(pointer.currentX-lastParallaxX)>.001||Math.abs(pointer.currentY-lastParallaxY)>.001){
    lastParallaxX=pointer.currentX;lastParallaxY=pointer.currentY;
    for (const [layer, depth] of [['land', 2], ['tree', 4], ['gift', 7]]) {
      stage.style.setProperty('--' + layer + '-x', pointer.currentX * depth + 'px');
      stage.style.setProperty('--' + layer + '-y', pointer.currentY * depth + 'px');
    }
    }
    for (const { x, y, phase, size } of snow) {
      const breeze = Math.sin(now / 1100 + phase) * .026;
      dot(((x + now * size / 200000 + breeze) % 1 + 1) % 1 * width,
        ((y + now * size / 38000) % 1) * height, size, size > 1.8 ? .53 : .33);
    }
    updateVisitor(now);
    if (ready) drawIdle(now);
    if (selected) drawWin(now);
    if (hovered !== null && ready) drawGather(now);
    if (consolation) drawConsolation(now);
    frame = requestAnimationFrame(paint);
  }
  function update() {
    const running = visible && !document.hidden && !motion.matches && !document.querySelector('dialog[open]');
    if (running && !frame && ctx) frame = requestAnimationFrame(paint);
    if (!running) clearGiftCues();
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
    const scheduleResize=()=>{if(!resizeFrame)resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;resize();});};
    if ('ResizeObserver' in window) new ResizeObserver(scheduleResize).observe(stage);
    else window.addEventListener('resize', scheduleResize);
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting && entry.intersectionRatio >= .2;
      if (!visible || !wasVisible) {
        visitor.hidden = true; visitorUntil = 0; visitorTrip = null; nextVisitor = 0;
      }
      update();
    }, { threshold: [0, .2] }).observe(stage);
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    document.addEventListener('dyson-dialog-change',update);
    document.addEventListener('toggle',event=>{if(event.target.tagName==='DIALOG')update();},true);
    update();
  }
  return {
    relayout() { layoutForegroundGifts(); locateGifts(); },
    setAnimals(value) {
      const incoming = Array.isArray(value) ? value.filter(animal=>animal && animal.image && ![102,110].includes(Number(animal.day))) : [];
      const key = list=>list.map(animal=>`${animal.day}:${animal.image}`).join('|');
      if (key(incoming) !== key(animals)) animalBag = [];
      animals = incoming;
      if (!animals.length || !animals.some(animal=>animal.image===visitorImage.getAttribute('src'))) {
        visitor.hidden=true;visitorUntil=0;visitorTrip=null;
        if (!animals.length) nextVisitor=0;
      }
    },
    setReady(value) {
      if (ready === value) return;
      ready = value;
      if (!ready) { hovered = null; clearGiftCues(); }
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
