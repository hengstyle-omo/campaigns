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
  const tapHint=document.createElement('span');
  tapHint.className='draw-tap-hint';tapHint.textContent='☝︎';tapHint.hidden=true;tapHint.setAttribute('aria-hidden','true');stage.append(tapHint);
  let tapShown=false,tapUntil=0,tapSeen=false;
  try{tapSeen=localStorage.getItem('dyson-v130-gift-tap-seen')==='1';}catch{}
  const hideTap=()=>{tapHint.hidden=true;tapUntil=0;};
  stage.addEventListener('pointerdown',hideTap,{passive:true});
  stage.addEventListener('keydown',hideTap);
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
    const scene=stage.getBoundingClientRect();feetTargets=[];
    targets=gifts.map(gift=>{
      const box=gift.getBoundingClientRect();
      feetTargets.push({x:box.left+box.width/2-scene.left-pointer.currentX*7,y:box.bottom-scene.top-pointer.currentY*7,width:box.width});
      return [box.left+box.width/2-scene.left,box.top+box.height*.2-scene.top];
    });
  }
  const GIFT_LAYOUT_PLANS=[{"ratio":1.0716981132075472,"points":[[0.18,0.9],[0.12,0.76],[0.3,0.89],[0.88,0.9],[0.88,0.74]]},{"ratio":1.0694864048338368,"points":[[0.16,0.92],[0.12,0.76],[0.3,0.89],[0.9,0.9],[0.88,0.72]]},{"ratio":1.0693877551020408,"points":[[0.16,0.92],[0.12,0.76],[0.3,0.89],[0.86,0.66],[0.88,0.84]]},{"ratio":1.6581632653061225,"points":[[0.24,0.74],[0.76,0.64],[0.24,0.9],[0.78,0.86],[0.9,0.84]]},{"ratio":2.721311475409836,"points":[[0.66,0.58],[0.77,0.66],[0.3,0.88],[0.68,0.82],[0.86,0.8]]},{"ratio":1.5809523809523809,"points":[[0.9,0.62],[0.78,0.84],[0.22,0.9],[0.76,0.6],[0.92,0.84]]},{"ratio":1.2,"points":[[0.92,0.72],[0.8,0.6],[0.3,0.89],[0.86,0.88],[0.16,0.84]]},{"ratio":0.8,"points":[[0.08,0.68],[0.9,0.6],[0.3,0.89],[0.64,0.9],[0.86,0.9]]},{"ratio":1,"points":[[0.1,0.86],[0.1,0.72],[0.3,0.89],[0.9,0.9],[0.9,0.74]]},{"ratio":1.07,"points":[[0.18,0.9],[0.12,0.76],[0.3,0.89],[0.88,0.9],[0.88,0.74]]},{"ratio":1.2,"points":[[0.92,0.68],[0.8,0.6],[0.3,0.9],[0.14,0.88],[0.87,0.84]]},{"ratio":1.4,"points":[[0.1,0.84],[0.2,0.86],[0.32,0.9],[0.82,0.88],[0.86,0.7]]},{"ratio":1.66,"points":[[0.92,0.76],[0.92,0.58],[0.9,0.9],[0.78,0.86],[0.8,0.64]]},{"ratio":1.9,"points":[[0.26,0.76],[0.76,0.6],[0.88,0.62],[0.76,0.84],[0.88,0.82]]},{"ratio":2.2,"points":[[0.86,0.6],[0.76,0.66],[0.72,0.88],[0.28,0.84],[0.86,0.82]]},{"ratio":2.5,"points":[[0.8,0.84],[0.8,0.6],[0.3,0.86],[0.7,0.8],[0.9,0.8]]},{"ratio":0.8,"points":[[0.08,0.68],[0.9,0.62],[0.3,0.89],[0.64,0.9],[0.86,0.9]]},{"ratio":1,"points":[[0.16,0.9],[0.1,0.74],[0.3,0.89],[0.9,0.7],[0.9,0.88]]},{"ratio":1.07,"points":[[0.16,0.92],[0.12,0.76],[0.3,0.89],[0.9,0.88],[0.88,0.68]]},{"ratio":1.2,"points":[[0.92,0.72],[0.8,0.6],[0.3,0.89],[0.86,0.88],[0.16,0.84]]},{"ratio":1.4,"points":[[0.2,0.84],[0.92,0.62],[0.34,0.9],[0.78,0.6],[0.87,0.84]]},{"ratio":1.66,"points":[[0.24,0.74],[0.76,0.64],[0.88,0.66],[0.78,0.86],[0.9,0.84]]},{"ratio":1.9,"points":[[0.72,0.58],[0.26,0.8],[0.9,0.88],[0.76,0.82],[0.9,0.64]]},{"ratio":2.2,"points":[[0.06,0.82],[0.74,0.66],[0.72,0.88],[0.28,0.84],[0.86,0.82]]},{"ratio":2.5,"points":[[0.06,0.86],[0.68,0.62],[0.3,0.88],[0.78,0.82],[0.88,0.8]]},{"ratio":2.8,"points":[[0.94,0.74],[0.77,0.66],[0.66,0.6],[0.68,0.82],[0.86,0.8]]},{"ratio":3.2,"points":[[0.36,0.62],[0.76,0.62],[0.76,0.86],[0.66,0.8],[0.86,0.78]]}];
  const GIFT_LARGER_PLANS = [{"ratio":1.0716981132075472,"mobile":true,"scale":0.9659999999999999,"points":[[0.66,0.88],[0.86,0.86],[0.36,0.9],[0.14,0.86],[0.88,0.6]]},{"ratio":1.0694864048338368,"mobile":true,"scale":0.9659999999999999,"points":[[0.36,0.88],[0.86,0.86],[0.54,0.9],[0.16,0.86],[0.86,0.6]]},{"ratio":1.0693877551020408,"mobile":true,"scale":0.9659999999999999,"points":[[0.34,0.88],[0.16,0.78],[0.52,0.9],[0.88,0.86],[0.86,0.62]]},{"ratio":1.6581632653061225,"mobile":false,"scale":0.782,"points":[[0.26,0.74],[0.76,0.62],[0.3,0.9],[0.76,0.86],[0.9,0.84]]},{"ratio":2.721311475409836,"mobile":false,"scale":0.8739999999999999,"points":[[0.36,0.7],[0.77,0.66],[0.3,0.88],[0.66,0.82],[0.86,0.8]]},{"ratio":1.5809523809523809,"mobile":false,"scale":0.782,"points":[[0.26,0.72],[0.76,0.62],[0.3,0.89],[0.76,0.86],[0.9,0.84]]},{"ratio":1.2,"mobile":false,"scale":1.058,"points":[[0.36,0.88],[0.82,0.6],[0.54,0.9],[0.84,0.86],[0.18,0.84]]}];
  const TREE_CLEARANCE_BANDS = [{"left":0.5032948929159803,"right":0.5378912685337727,"top":0.03166023166023166,"bottom":0.06332046332046332},{"left":0.48352553542009885,"right":0.556836902800659,"top":0.06332046332046332,"bottom":0.09498069498069497},{"left":0.46210873146622733,"right":0.5774299835255354,"top":0.09498069498069497,"bottom":0.12664092664092663},{"left":0.43986820428336076,"right":0.5988467874794069,"top":0.12664092664092663,"bottom":0.1583011583011583},{"left":0.4159802306425041,"right":0.6219110378912686,"top":0.1583011583011583,"bottom":0.18996138996138995},{"left":0.4011532125205931,"right":0.6367380560131796,"top":0.18996138996138995,"bottom":0.22162162162162163},{"left":0.4085667215815486,"right":0.6301482701812191,"top":0.22162162162162163,"bottom":0.25328185328185326},{"left":0.38632619439868204,"right":0.6532125205930808,"top":0.25328185328185326,"bottom":0.28494208494208495},{"left":0.3624382207578254,"right":0.6771004942339374,"top":0.28494208494208495,"bottom":0.3166023166023166},{"left":0.3369028006589786,"right":0.7034596375617792,"top":0.3166023166023166,"bottom":0.34826254826254827},{"left":0.3113673805601318,"right":0.729818780889621,"top":0.34826254826254827,"bottom":0.3799227799227799},{"left":0.3171334431630972,"right":0.7248764415156508,"top":0.3799227799227799,"bottom":0.4115830115830116},{"left":0.3418451400329489,"right":0.700164744645799,"top":0.4115830115830116,"bottom":0.44324324324324327},{"left":0.3154859967051071,"right":0.7257001647446458,"top":0.44324324324324327,"bottom":0.4749034749034749},{"left":0.2883031301482702,"right":0.7528830313014827,"top":0.4749034749034749,"bottom":0.5065637065637065},{"left":0.26112026359143325,"right":0.7792421746293245,"top":0.5065637065637065,"bottom":0.5382239382239382},{"left":0.27100494233937394,"right":0.7685337726523888,"top":0.5382239382239382,"bottom":0.5698841698841699},{"left":0.2833607907742998,"right":0.757001647446458,"top":0.5698841698841699,"bottom":0.6015444015444016},{"left":0.25617792421746294,"right":0.7841845140032949,"top":0.6015444015444016,"bottom":0.6332046332046332},{"left":0.22652388797364087,"right":0.8138385502471169,"top":0.6332046332046332,"bottom":0.6648648648648648},{"left":0.19439868204283361,"right":0.8451400329489291,"top":0.6648648648648648,"bottom":0.6965250965250965},{"left":0.18698517298187808,"right":0.8525535420098846,"top":0.6965250965250965,"bottom":0.7281853281853282},{"left":0.22240527182866557,"right":0.8171334431630972,"top":0.7281853281853282,"bottom":0.7598455598455598},{"left":0.19686985172981877,"right":0.842668863261944,"top":0.7598455598455598,"bottom":0.7915057915057915},{"left":0.17051070840197693,"right":0.8682042833607908,"top":0.7915057915057915,"bottom":0.8231660231660232},{"left":0.14250411861614498,"right":0.8970345963756178,"top":0.8231660231660232,"bottom":0.8548262548262548},{"left":0.12026359143327842,"right":0.9200988467874794,"top":0.8548262548262548,"bottom":0.8864864864864865},{"left":0.14250411861614498,"right":0.9019769357495881,"top":0.8864864864864865,"bottom":0.9181467181467181},{"left":0.46622734761120266,"right":0.57166392092257,"top":0.9181467181467181,"bottom":0.9498069498069498},{"left":0.46622734761120266,"right":0.5724876441515651,"top":0.9498069498069498,"bottom":0.9814671814671815}];
  function fitGiftPositions(scene, sign, boxes, tree, precise=false) {
    const gap=Math.max(8,scene.width*.02);
    const zones=[
      {left:sign.left,top:sign.top+sign.height*.11,right:sign.right,bottom:sign.top+sign.height*.54},
      {left:sign.left+sign.width*.39,top:sign.top,right:sign.left+sign.width*.56,bottom:sign.bottom}
    ];
    const intersects=(a,b,pad=gap)=>a.left<b.right+pad && a.right>b.left-pad && a.top<b.bottom+pad && a.bottom>b.top-pad;
    const touchesTree=rect=>{
      if(precise&&tree)return TREE_CLEARANCE_BANDS.some(b=>intersects(rect,{left:tree.left+b.left*tree.width,right:tree.left+b.right*tree.width,top:tree.top+b.top*tree.height,bottom:tree.top+b.bottom*tree.height}));
      if(!tree || rect.bottom<tree.top-gap || rect.top>tree.bottom+gap)return false;
      const depth=Math.max(0,Math.min(1,(Math.min(rect.bottom+gap,tree.bottom)-tree.top)/tree.height));
      const half=tree.width*(.07+.43*depth)+gap;
      const centre=(tree.left+tree.right)/2;
      return rect.left<centre+half && rect.right>centre-half;
    };
    // Bounded work: validate precomputed layouts, with no recursive search.
    const profiles=[...GIFT_LAYOUT_PLANS,...(precise?GIFT_LARGER_PLANS:[])].sort((a,b)=>Math.abs(a.ratio-scene.width/scene.height)-Math.abs(b.ratio-scene.width/scene.height));
    for(const profile of profiles){
      const placements=[],occupied=[];let valid=true;
      for(let index=0;index<boxes.length;index++){
        const box=boxes[index],point=profile.points[index];
        const x=scene.left+scene.width*point[0],y=scene.top+scene.height*point[1];
        const rect={left:x-box.width/2,right:x+box.width/2,top:y-box.height/2,bottom:y+box.height/2};
        if(rect.bottom<scene.top+scene.height*.65 || rect.top<scene.top+scene.height*.48 || rect.left<scene.left+gap || rect.right>scene.right-gap || rect.bottom>scene.bottom-gap || touchesTree(rect) || zones.some(zone=>intersects(rect,zone)) || occupied.some(other=>intersects(rect,other,gap*.5))){valid=false;break;}
        occupied.push(rect);placements[index]={rect,x:x-(box.left+box.right)/2,y:y-(box.top+box.bottom)/2};
      }
      if(valid)return placements;
    }
    return null;
  }
  function avoidWoodSign() {
    const sign=stage.querySelector('.draw-wood-sign');
    if(!sign)return;
    const tree=stage.querySelector('.draw-tree');
    for(const gift of gifts){gift.style.setProperty('--gift-layout-scale',1);gift.style.setProperty('--gift-clear-x','0px');gift.style.setProperty('--gift-clear-y','0px');}
    // Read geometry once, then evaluate smaller sizes without reflowing the DOM.
    const scene=stage.getBoundingClientRect(),signRect=sign.getBoundingClientRect(),treeRect=tree?.getBoundingClientRect();
    if(!scene.width || !scene.height)return;
    const base=gifts.map(gift=>({rect:gift.getBoundingClientRect(),width:gift.offsetWidth,height:gift.offsetHeight}));
    let placements=null,chosenScale=1;
    for(const scale of [1,.92,.84,.76,.68,.60,.52,.44,.36]){
      const boxes=base.map(({rect,width,height})=>{
        const x=(rect.left+rect.right)/2+(1-scale)*width/2,y=(rect.top+rect.bottom)/2+(1-scale)*height/2;
        const w=rect.width*scale,h=rect.height*scale;
        return {left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2,width:w,height:h};
      });
      placements=fitGiftPositions(scene,signRect,boxes,treeRect);
      if(placements){chosenScale=scale;break;}
    }
    if(!placements)return;
    // Enlarge relative to the previous safe size; use the actual tree silhouette.
    const previousScale=chosenScale;
    for(const factor of [1.15,1.12,1.09,1.06,1.03]){
      const scale=previousScale*factor;
      const boxes=base.map(({rect,width,height})=>{
        const x=(rect.left+rect.right)/2+(1-scale)*width/2,y=(rect.top+rect.bottom)/2+(1-scale)*height/2;
        const w=rect.width*scale,h=rect.height*scale;
        return {left:x-w/2,right:x+w/2,top:y-h/2,bottom:y+h/2,width:w,height:h};
      });
      const enlarged=fitGiftPositions(scene,signRect,boxes,treeRect,true);
      if(enlarged){placements=enlarged;chosenScale=scale;break;}
    }
    placements.forEach((point,index)=>{
      gifts[index].style.setProperty('--gift-layout-scale',chosenScale);
      gifts[index].style.setProperty('--gift-clear-x',point.x+'px');gifts[index].style.setProperty('--gift-clear-y',point.y+'px');
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
    avoidWoodSign();
    locateGifts();
  }
  const giftCues = gifts.map((gift,index)=>({ gift, next: 0, until: 0, index }));
  let spotlightIndex = -1, spotlightStart = 0;
  function clearGiftCues() {
    for (const cue of giftCues) { cue.gift.classList.remove('draw-wobble','draw-spotlit'); cue.next=0; cue.until=0; }
    spotlightIndex=-1; spotlightStart=0; hideTap();
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
      let next=spotlightIndex<0?Math.floor(Math.random()*gifts.length)-1:spotlightIndex;
      for(let count=0;count<gifts.length;count++) {
        next=(next+1)%gifts.length;
        if(gifts[next].dataset.state==='closed' && !gifts[next].disabled) { spotlightIndex=next; spotlightStart=now; break; }
      }
    }
    const gift=gifts[spotlightIndex];
    if (!gift || gift.disabled || gift.dataset.state!=='closed') return;
    gift.classList.add('draw-spotlit');
    if(!tapSeen&&!tapShown){
      tapShown=true;tapSeen=true;tapUntil=now+3600;tapHint.hidden=false;
      const point=targets[spotlightIndex];if(point){tapHint.style.left=point[0]+'px';tapHint.style.top=point[1]+'px';}
      try{localStorage.setItem('dyson-v130-gift-tap-seen','1');}catch{}
    }
    if(tapUntil&&now>=tapUntil)hideTap();
    const progress=(now-spotlightStart)/4800;
    const strength=Math.min(1,progress/.18,(1-progress)/.18);
    const foot=feetTargets[spotlightIndex];if(!foot)return;
    const x=foot.x+pointer.currentX*7,y=foot.y+pointer.currentY*7;
    const sourceX=x-width*.08,sourceY=-height*.08,radius=Math.max(foot.width*.85,width*.055);
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
    relayout() { avoidWoodSign(); locateGifts(); },
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
