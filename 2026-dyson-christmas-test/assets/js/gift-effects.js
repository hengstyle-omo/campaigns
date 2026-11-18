window.createDysonDrawEffects = (stage, canvas, gifts) => {
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, idleStart = 0, ready = false;
  let visible = true, selected = null, targets = [], hovered = null, consolation = null;
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
    if (!nextVisitor) nextVisitor = now + 6000 + Math.random()*4000;
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
    nextVisitor = visitorUntil + 30000 + Math.random()*15000;
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
  function locateGifts() {
    const scene = stage.getBoundingClientRect();
    targets = gifts.map(gift => {
      const box = gift.getBoundingClientRect();
      return [box.left + box.width / 2 - scene.left, box.top + box.height * .2 - scene.top];
    });
  }
  // Keep the sign fixed. Fit gift hit areas around both the board and its post.
  function fitGiftPositions(scene, sign, boxes, tree) {
    const gap=Math.max(8,scene.width*.02);
    const zones=[
      {left:sign.left,top:sign.top+sign.height*.11,right:sign.right,bottom:sign.top+sign.height*.54},
      {left:sign.left+sign.width*.39,top:sign.top,right:sign.left+sign.width*.56,bottom:sign.bottom}
    ];
    const intersects=(a,b,pad=gap)=>a.left<b.right+pad && a.right>b.left-pad && a.top<b.bottom+pad && a.bottom>b.top-pad;
    const touchesTree=rect=>{
      if(!tree || rect.bottom<tree.top-gap || rect.top>tree.bottom+gap)return false;
      const depth=Math.max(0,Math.min(1,(Math.min(rect.bottom+gap,tree.bottom)-tree.top)/tree.height));
      const half=tree.width*(.07+.43*depth)+gap;
      const centre=(tree.left+tree.right)/2;
      return rect.left<centre+half && rect.right>centre-half;
    };
    const options=boxes.map((box,index)=>{
      const original={x:(box.left+box.right)/2,y:(box.top+box.bottom)/2};
      const anchors=[[.12,.92],[.90,.63],[.36,.94],[.64,.92],[.90,.86]];
      const target={x:scene.left+scene.width*anchors[index][0],y:scene.top+scene.height*anchors[index][1]};
      const points=[target];
      for(let y=.56;y<=.97;y+=.02)for(let x=.06;x<=.95;x+=.02)points.push({x:scene.left+scene.width*x,y:scene.top+scene.height*y});
      const choices=points.map(point=>({rect:{left:point.x-box.width/2,right:point.x+box.width/2,top:point.y-box.height/2,bottom:point.y+box.height/2},x:point.x-original.x,y:point.y-original.y}))
        .filter(({rect})=>rect.bottom>=scene.top+scene.height*.65 && rect.top>=scene.top+scene.height*.48 && rect.left>=scene.left+gap && rect.right<=scene.right-gap && rect.bottom<=scene.bottom-gap && !touchesTree(rect) && !zones.some(zone=>intersects(rect,zone)))
        .sort((a,b)=>(a.rect.left+box.width/2-target.x)**2+(a.rect.top+box.height/2-target.y)**2-((b.rect.left+box.width/2-target.x)**2+(b.rect.top+box.height/2-target.y)**2)).slice(0,600);
      return {index,choices};
    }).sort((a,b)=>a.choices.length-b.choices.length);
    const placements=[],occupied=[];let attempts=0;
    function search(depth){
      if(depth===options.length)return true;
      if(++attempts>100000)return false;
      const {index,choices}=options[depth];
      for(const choice of choices){
        if(occupied.some(other=>intersects(choice.rect,other,gap*.5)))continue;
        occupied.push(choice.rect);placements[index]=choice;
        if(search(depth+1))return true;
        occupied.pop();
      }
      return false;
    }
    return search(0)?placements:null;
  }
  function avoidWoodSign() {
    const sign=stage.querySelector('.draw-wood-sign');
    if(!sign)return;
    const tree=stage.querySelector('.draw-tree');
    let placements=null;
    for(const scale of [1,.92,.84,.76,.68,.60,.52]) {
      for(const gift of gifts){gift.style.setProperty('--gift-layout-scale',scale);gift.style.setProperty('--gift-x-offset','0px');gift.style.setProperty('--gift-y-offset','0px');}
      placements=fitGiftPositions(stage.getBoundingClientRect(),sign.getBoundingClientRect(),gifts.map(gift=>gift.getBoundingClientRect()),tree?.getBoundingClientRect());
      if(placements)break;
    }
    if(!placements)return;
    placements.forEach((point,index)=>{gifts[index].style.setProperty('--gift-x-offset',point.x+'px');gifts[index].style.setProperty('--gift-y-offset',point.y+'px');});
  }
  function resize() {
    if (!ctx) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    avoidWoodSign();
    locateGifts();
  }
  const giftCues = gifts.map((gift,index)=>({ gift, next: 0, until: 0, index }));
  let spotlightIndex = -1, spotlightStart = 0;
  function clearGiftCues() {
    for (const cue of giftCues) { cue.gift.classList.remove('draw-wobble','draw-spotlit'); cue.next=0; cue.until=0; }
    spotlightIndex=-1; spotlightStart=0;
    stage.classList.remove('draw-idle-pulse');
  }
  function drawIdle(now) {
    if (!ready || gifts.some(gift=>gift.dataset.state==='opening')) { clearGiftCues(); return; }
    for (const cue of giftCues) {
      const eligible=cue.gift.dataset.state==='closed' && !cue.gift.disabled;
      if (!eligible) { cue.gift.classList.remove('draw-wobble','draw-spotlit'); continue; }
      if (!cue.next) cue.next=now+900+cue.index*850+Math.random()*2000;
      if (cue.until && now>=cue.until) { cue.gift.classList.remove('draw-wobble'); cue.until=0; }
      if (now>=cue.next) {
        cue.gift.classList.add('draw-wobble'); cue.until=now+950;
        cue.next=now+6500+Math.random()*7000;
      }
    }
    if (spotlightIndex<0 || now-spotlightStart>=4800) {
      if (spotlightIndex>=0) gifts[spotlightIndex].classList.remove('draw-spotlit');
      let next=spotlightIndex;
      for(let count=0;count<gifts.length;count++) {
        next=(next+1)%gifts.length;
        if(gifts[next].dataset.state==='closed' && !gifts[next].disabled) { spotlightIndex=next; spotlightStart=now; break; }
      }
    }
    const gift=gifts[spotlightIndex];
    if (!gift || gift.disabled || gift.dataset.state!=='closed') return;
    gift.classList.add('draw-spotlit');
    const progress=(now-spotlightStart)/4800;
    const strength=Math.min(1,progress/.18,(1-progress)/.18);
    const scene=stage.getBoundingClientRect(),box=gift.getBoundingClientRect();
    const x=box.left+box.width/2-scene.left,y=box.bottom-scene.top;
    const sourceX=x-width*.08,sourceY=-height*.08,radius=Math.max(box.width*.85,width*.055);
    ctx.save();
    const beam=ctx.createLinearGradient(sourceX,sourceY,x,y);
    beam.addColorStop(0,`rgba(255,245,221,${strength*.035})`);
    beam.addColorStop(.5,`rgba(255,245,221,${strength*.085})`);
    beam.addColorStop(1,`rgba(255,245,221,${strength*.26})`);
    ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(sourceX,sourceY);
    ctx.lineTo(x-radius,y);ctx.quadraticCurveTo(x,y+radius*.24,x+radius,y);ctx.closePath();ctx.fill();
    ctx.translate(x,y);ctx.scale(1,.28);
    const pool=ctx.createRadialGradient(0,0,0,0,0,radius);
    pool.addColorStop(0,`rgba(255,247,222,${strength*.5})`);
    pool.addColorStop(1,'rgba(255,247,222,0)');ctx.fillStyle=pool;
    ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.restore();
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
    updateVisitor(now);
    if (ready) drawIdle(now);
    if (selected) drawWin(now);
    if (hovered !== null && ready) { locateGifts(); drawGather(now); }
    if (consolation) drawConsolation(now);
    frame = requestAnimationFrame(paint);
  }
  function update() {
    const running = visible && !document.hidden && !motion.matches;
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
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    else window.addEventListener('resize', resize);
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
    update();
  }
  return {
    setAnimals(value) {
      const incoming = Array.isArray(value) ? value.filter(animal=>animal && animal.image) : [];
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
