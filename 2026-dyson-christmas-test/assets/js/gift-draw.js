(() => {
  const start = '2026-12-01';
  const end = '2026-12-25';
  const bonusDate = '2026-12-20';
  const dateKey = 'dyson-christmas-test-v2-date';
  const drawKey = 'dyson-christmas-test-v2-gifts';
  const giftOpeningDuration = 800;
  const giftFlightDuration = 1400;
  const touchPreviewDuration = 160;
  const giftPositions = ['後排左側', '後排右側', '前排左側', '前排中央', '前排右側'];
  const prizes = {
    hd19: { rewardId: 'product-hd19', name: 'HD19 隨行吹風機', image: './assets/images/rewards/dyson-HD19.jpg' },
    pencilvac: { rewardId: 'product-sv50', name: 'Dyson PencilVac 筆形吸塵器', image: './assets/images/rewards/dyson-SV50.jpg' },
    hj10: { rewardId: 'product-hj10', name: 'HJ10 噴射氣流空氣清淨機', image: './assets/images/rewards/dyson-HJ10.jpg' },
    bonus: { rewardId: 'product-bp10', name: 'Dyson 任一主機', image: './assets/images/brand/dyson-logo-white.png' },
  };
  const couponCodes = { hd19: 'FBQCDQQK', pencilvac: '87GBMGJS', hj10: '2PSUJGKX', bonus: '9AVPFVKJ', passport: 'GDCZZD8X' };
  const prizeURL = id => 'https://shop.hengstyle.com/V2/ECoupon/MyECoupon?source=linksetmembercoupon&ecouponCode=' + couponCodes[id];
  const missMessages = [
    '差一點點！明天再來挑一份禮物，試試手氣。',
    '今天先收下一句聖誕快樂，明天再來拆禮物吧！',
    '謝謝你來拆禮物。明天再挑一盒，看看會遇見什麼驚喜。',
    '今天的手氣差了一點。明天換一盒，再試一次吧！',
    '謝謝你陪我們拆到最後一天，祝你聖誕快樂！',
  ];
  const catalog = window.DYSON_GAME_CONFIG;
  const prizeDetailsById = Object.fromEntries(Object.entries(prizes).map(([id, { rewardId }]) => {
    const reward = catalog.rewards.find(reward => reward.id === rewardId);
    const day = reward?.productDay;
    const product = id === 'bonus' ? { intro: reward?.conditions } : catalog.items.find(item => item.day === day)?.product;
    return [id, { day, product }];
  }));

  const byId = id => document.getElementById(id);
  const dateInput = byId('draw-date');
  const mode = byId('draw-mode');
  const status = byId('draw-status');
  const feedback = byId('draw-feedback');
  const prizeCard = byId('draw-prize');
  const discovery = byId('draw-discovery');
  const productDialog = byId('draw-product');
  const prizeClaim = byId('draw-prize-claim');
  const wallet = byId('draw-wallet');
  const giftGroup = byId('draw-gifts');
  const passportButton = byId('draw-passport-open');
  const passportTicket = byId('draw-passport-ticket');
  const stage = byId('draw-stage');
  stage.style.setProperty('--draw-touch-preview', touchPreviewDuration + 'ms');
  stage.style.setProperty('--draw-flight-duration', giftFlightDuration + 'ms');
  const simulate = byId('draw-simulate');
  const reset = byId('draw-reset');
  const validDate = value => /^2026-12-\d{2}$/.test(value ?? '') && value >= start && value <= end;
  const randomMember = values => values[Math.floor(Math.random() * values.length)];
  let activityDate = '';
  let simulatedDate = '';
  let activeDate = '';
  let pending = null;
  let actionError = '';
  let passport = {};
  let passportOpening = null;
  const previewOpened = new Set();
  let layoutDate;
  let previewLayout;
  let appliedLayout;

  try {
    const storedDate = localStorage.getItem(dateKey);
    if (validDate(storedDate)) simulatedDate = storedDate;
  } catch {
    actionError = '瀏覽器無法儲存測試紀錄。';
  }
  activeDate = simulatedDate;
  dateInput.value = activeDate;

  const gifts = giftPositions.map((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'draw-gift';
    button.setAttribute('aria-label', '選擇' + name + '禮物');
    button.innerHTML = '<span class="draw-shadow" aria-hidden="true"></span><span class="draw-box" aria-hidden="true"><span class="draw-body"></span><span class="draw-mouth"></span><span class="draw-lid"></span></span><span class="draw-glow" aria-hidden="true"></span><span class="draw-snow" aria-hidden="true"></span>';
    button.addEventListener('click', event => openGift(index, event?.pointerType));
    giftGroup.append(button);
    return button;
  });

  const effects = window.createDysonDrawEffects?.(stage, byId('draw-effects'), gifts);

  const floatedTicket = document.createElement('a');
  floatedTicket.className = 'draw-ticket draw-floated-ticket';
  floatedTicket.target = '_blank';
  floatedTicket.rel = 'noopener noreferrer';
  floatedTicket.textContent = '$1,000';
  floatedTicket.setAttribute('aria-label', '前往領取千元優惠券（另開視窗）');
  floatedTicket.hidden = true;
  giftGroup.append(floatedTicket);
  byId('draw-passport-image').src = window.DYSON_ASSETS.rewardImages.passport;

  function bindCouponClick(link, id) {
    const track = () => window.DysonTestDraw?.trackCoupon?.(typeof id === 'function' ? id() : id);
    link.addEventListener('click', track);
    link.addEventListener('auxclick', event => { if (event.button === 1) track(); });
  }
  bindCouponClick(floatedTicket, () => floatedTicket.dataset.coupon);
  bindCouponClick(prizeClaim, () => prizeClaim.dataset.coupon);
  bindCouponClick(passportTicket, 'passport');

  function emptyDraw() {
    return { days: {} };
  }

  function readDraw() {
    try {
      const saved = JSON.parse(localStorage.getItem(drawKey));
      if (saved?.days) return saved;
    } catch {
      // Ignore an unreadable record so the page can still render.
    }
    return emptyDraw();
  }

  function saveDraw(draw) {
    try {
      localStorage.setItem(drawKey, JSON.stringify(draw));
      return true;
    } catch {
      actionError = '瀏覽器無法儲存測試紀錄。';
      return false;
    }
  }

  function availablePrizes(days, date) {
    const won = new Set(Object.values(days).map(day => day.result?.prize));
    return Object.keys(prizes).filter(id => (id !== 'bonus' || date >= bonusDate) && !won.has(id));
  }

  function chooseWinningBoxes(previousBox) {
    const first = Number.isInteger(previousBox) && previousBox >= 0 && previousBox < gifts.length
      ? previousBox : Math.floor(Math.random() * gifts.length);
    const other = Math.floor(Math.random() * (gifts.length - 1));
    return [first, other >= first ? other + 1 : other];
  }

  function assignPrizes(pool, preferred = []) {
    if (!pool.length) return [null, null];
    const first = pool.includes(preferred[0]) ? preferred[0] : randomMember(pool);
    const remaining = pool.length > 1 ? pool.filter(prize => prize !== first) : pool;
    const second = remaining.includes(preferred[1]) ? preferred[1] : randomMember(remaining);
    return [first, second];
  }

  function prizeArt(id) {
    const { day, product } = prizeDetailsById[id];
    const sprite = id !== 'bonus' && product && window.DYSON_ASSETS.sprites?.[day];
    return sprite || prizes[id].image;
  }

  function renderWallet(days) {
    const wins = new Map(Object.entries(days).map(([day, record]) => [record.result?.prize, day]));
    const coupons = Object.entries(prizes);
    const wonCount = coupons.filter(([id]) => wins.has(id)).length;
    byId('draw-count').textContent = '已抽中 ' + wonCount + '／' + coupons.length + ' 張';

    wallet.replaceChildren(...coupons.map(([id, { name }]) => {
      const coupon = document.createElement('article');
      const day = wins.get(id);
      coupon.className = 'draw-coupon';
      coupon.dataset.coupon = id;
      if (day) coupon.dataset.won = '';
      const copy = document.createElement('div');
      copy.className = 'draw-coupon-copy';
      const title = document.createElement('strong');
      title.className = 'draw-coupon-title';
      title.textContent = name + ' $1,000 折價券';
      const note = document.createElement('small');
      note.textContent = day ? '✓ 已抽中 · ' + displayDate(day)
        : id === 'bonus' && activeDate < bonusDate ? '12/20 加入抽獎' : '尚未抽中';
      const details = document.createElement('button');
      details.type = 'button';
      details.className = 'draw-coupon-details';
      details.textContent = '了解產品';
      details.setAttribute('aria-label', '了解產品：' + name);
      details.addEventListener('click', () => openProduct(id));
      copy.append(note, details);
      if (day) {
        const link = document.createElement('a');
        link.href = prizeURL(id);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = '立即領取優惠券 ↗';
        bindCouponClick(link, id);
        copy.append(link);
      }
      const imageButton = document.createElement('button');
      imageButton.type = 'button';
      imageButton.className = 'draw-coupon-image-button';
      imageButton.setAttribute('aria-label', '查看產品介紹：' + name);
      imageButton.addEventListener('click', () => openProduct(id));
      const image = document.createElement('img');
      image.className = 'draw-coupon-image';
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.src = prizeArt(id);
      imageButton.append(image);
      coupon.append(title, copy, imageButton);
      return coupon;
    }));
  }

  function hasOpenedPassport() {
    if (!passport.key) return false;
    if (passport.preview) return previewOpened.has(passport.key);
    try { return localStorage.getItem(passport.key) === 'true'; } catch { return passport.opened === true; }
  }

  function renderPassport() {
    const opening = Boolean(passportOpening && passportOpening === passport.key);
    const opened = hasOpenedPassport() && !opening;
    const progress = byId('draw-passport-progress');
    const attendance = passport.label || (passport.key ? '已打卡 5／5 天' : '已打卡 0／5 天');
    const message = opened ? attendance + ' · 兌換券已解鎖' : opening ? '正在拆開 5 日回禮…' : attendance;
    if (progress.textContent !== message) progress.textContent = message;
    passportButton.hidden = !passport.key || opened;
    passportButton.disabled = opening;
    passportButton.classList.toggle('draw-passport-opening', opening);
    passportTicket.hidden = !opened;
    if (opened && !passport.preview) passportTicket.href = prizeURL('passport');
    else passportTicket.removeAttribute('href');
    byId('draw-passport-cta').textContent = passport.preview ? '管理員模擬 · 領券連結預覽' : '領取兌換券 ↗';
  }

  function setPassportReward(state) {
    passport = { ...state, opened: passport.key === state.key && passport.opened };
    renderPassport();
  }

  passportButton.addEventListener('click', async () => {
    if (!passport.key || passportOpening || hasOpenedPassport()) return;
    const { key, preview } = passport;
    passportOpening = key;
    renderPassport();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise(resolve => setTimeout(resolve, 550));
    }
    if (preview) previewOpened.add(key);
    else {
      if (passport.key === key) passport.opened = true;
      try { localStorage.setItem(key, 'true'); } catch { /* Keep the result available for this session. */ }
    }
    passportOpening = null;
    renderPassport();
    if (passport.key === key) {
      if (!passport.preview) passportTicket.focus({ preventScroll: true });
    }
  });

  function displayDate(day) {
    return day.slice(5).replace('-', '/');
  }

  function missMessage(date, days) {
    if (date === end) return missMessages[missMessages.length - 1];
    const earlierMisses = Object.entries(days).filter(([key, record]) => key < date && record.result && !record.result.prize).length;
    return missMessages[earlierMisses % (missMessages.length - 1)];
  }

  function productURL(value) {
    if (!value) return '';
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }

  function fillProductInfo(prefix, product) {
    const intro = byId(prefix + '-intro');
    intro.textContent = product?.intro?.split('點選放進雪境')[0].trim() || '';
    intro.hidden = !intro.textContent;
    const features = (product?.features || []).map(feature => {
      const item = document.createElement('li');
      item.textContent = feature;
      return item;
    });
    const list = byId(prefix + '-features');
    list.replaceChildren(...features);
    list.hidden = !features.length;
    byId(prefix + '-features-title').hidden = list.hidden;
    const link = byId(prefix + '-product-link');
    const url = productURL(product?.url);
    link.hidden = !url;
    if (url) link.href = url;
    else link.removeAttribute('href');
    return !intro.hidden || !list.hidden || !link.hidden;
  }

  function openProduct(id) {
    if (pending || prizeCard.open || discovery.open || productDialog.open) return;
    byId('draw-product-name').textContent = prizes[id].name;
    byId('draw-product-image').src = prizeArt(id);
    fillProductInfo('draw-product', prizeDetailsById[id].product);
    productDialog.showModal();
  }

  function openPrize(id) {
    if (!prizes[id] || prizeCard.open || discovery.open || productDialog.open) return;
    byId('draw-prize-kind').textContent = '適用商品｜' + prizes[id].name;
    byId('draw-prize-product-name').textContent = prizes[id].name;
    const image = byId('draw-prize-image');
    image.hidden = id === 'bonus';
    if (image.hidden) image.removeAttribute('src');
    else image.src = prizeArt(id);
    const hasInfo = fillProductInfo('draw-prize', id === 'bonus' ? null : prizeDetailsById[id].product);
    byId('draw-prize-info').hidden = !hasInfo;
    prizeCard.classList.toggle('draw-with-product-info', hasInfo);

    byId('draw-prize-won-label').hidden = false;
    prizeClaim.hidden = false;
    prizeClaim.href = prizeURL(id);
    prizeClaim.dataset.coupon = id;
    prizeCard.showModal();
  }

  function createGiftLayout(random = Math.random) {
    return giftPositions.map(() => ({ x: random() * 4 - 2, y: random() * 3 - 1.5 }));
  }

  function currentGiftLayout(date, day) {
    if (day?.layout) return day.layout;
    if (layoutDate !== date) {
      layoutDate = date;
      if (day) {
        // The original saved draws only have a box index. Give those dates a stable layout.
        let seed = Number(date.replaceAll('-', ''));
        previewLayout = createGiftLayout(() => {
          seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
          return seed / 4294967296;
        });
      } else {
        previewLayout = createGiftLayout();
      }
    }
    return previewLayout;
  }

  function placeGift(element, { x, y }) {
    element.style.setProperty('--gift-x-offset', x + '%');
    element.style.setProperty('--gift-y-offset', y + '%');
  }

  function renderGiftLayout(layout) {
    const key = JSON.stringify(layout);
    if (appliedLayout === key) return;
    for (const [index, box] of layout.entries()) placeGift(gifts[index], box);
    appliedLayout = key;
  }

  function render() {
    const { days } = readDraw();
    const pool = availablePrizes(days, activeDate);
    const day = days[activeDate];
    const layout = currentGiftLayout(activeDate, day);
    renderGiftLayout(layout);
    const opening = pending?.date === activeDate;
    const played = Boolean(day?.result);
    // Earlier trials used fifteen gifts. Keep those results visible on the five-gift scene.
    const selected = opening ? pending.index : played ? day.result.selected % gifts.length : undefined;
    const prize = opening ? null : day?.result?.prize;
    const canOpen = Boolean(day && !played && !pending);
    const bonusOption = mode.querySelector('option[value="bonus"]');
    const winOption = mode.querySelector('option[value="win"]');
    bonusOption.disabled = !pool.includes('bonus');
    winOption.disabled = !pool.length;
    if (mode.selectedOptions[0]?.disabled) mode.value = 'random';

    for (const [index, gift] of gifts.entries()) {
      gift.disabled = !canOpen;
      const state = index === selected ? opening ? 'opening' : prize ? 'won' : 'miss' : 'closed';
      if (gift.dataset.state !== state) gift.dataset.state = state;
      gift.classList.toggle('draw-touch-opening', state === 'opening' && pending.touch);
    }
    giftGroup.classList.toggle('draw-ready', canOpen);
    effects?.setReady(canOpen);
    stage.classList.toggle('draw-opening', opening);
    floatedTicket.hidden = !prize;
    if (prize) {
      floatedTicket.dataset.box = String(selected);
      placeGift(floatedTicket, layout[selected]);
      floatedTicket.dataset.coupon = prize;
      floatedTicket.href = prizeURL(prize);
    }
    stage.classList.toggle('draw-stage-won', Boolean(prize));
    if (!prize) stage.classList.remove('draw-celebrate');
    byId('draw-bonus').hidden = activeDate < bonusDate;
    byId('draw-create').hidden = Boolean(day) || !validDate(activeDate);
    byId('draw-result-open').hidden = !played || opening;
    const drawFromCard = byId('draw-from-card');
    drawFromCard.hidden = !day;
    drawFromCard.textContent = played ? '查看今日拆盒結果' : '挑選今日禮物';
    feedback.classList.toggle('draw-has-result', played && !opening);
    dateInput.disabled = Boolean(pending);
    reset.disabled = Boolean(pending);
    simulate.disabled = Boolean(pending || day || !validDate(activeDate));
    mode.disabled = Boolean(pending || played);
    let message;
    if (actionError) {
      message = actionError;
    } else if (opening) {
      message = '正在拆開你的聖誕禮物…';
    } else if (played) {
      message = prize ? '抽中優惠券！' : '今天未抽中優惠券。';
    } else if (day) {
      message = '今日禮物已解鎖，挑一盒拆開吧。';
    } else if (!validDate(activeDate)) {
      message = '每日拆禮物於 12/01 至 12/25 開放。';
    } else {
      message = '今天製作卡片並下載或分享圖片後，即可拆開今日禮物。';
    }
    if (status.textContent !== message) status.textContent = message;

    const note = byId('draw-pool-note');
    note.hidden = !validDate(activeDate) || Boolean(opening || prize || pool.length);
    if (!note.hidden) {
      note.textContent = activeDate < bonusDate
        ? '前三張優惠券已集齊，12/20 再來抽加碼券。'
        : '本次活動的優惠券已集齊，可到票夾查看。';
    }
    if (!opening) renderWallet(days);
  }

  function withDrawLock(update) {
    return navigator.locks ? navigator.locks.request(drawKey, update) : Promise.resolve().then(update);
  }

  function showError() {
    actionError = '暫時無法儲存抽獎紀錄，請重新整理後再試。';
    render();
  }

  function complete(generatedOn) {
    if (generatedOn !== activeDate || !validDate(generatedOn)) return;
    actionError = '';
    void withDrawLock(() => {
      const draw = readDraw();
      const pool = availablePrizes(draw.days, generatedOn);
      if (!draw.days[generatedOn]) {
        draw.days[generatedOn] = {
          layout: currentGiftLayout(generatedOn),
          winningBoxes: chooseWinningBoxes(),
          hiddenPrizes: assignPrizes(pool),
        };
        saveDraw(draw);
      }
      render();
    }).catch(showError);
  }

  function record({ date, choice, index }) {
    const draw = readDraw();
    const day = draw.days[date];
    const pool = availablePrizes(draw.days, date);
    if (!day || day.result) return null;

    // Keep the original position on unopened days saved before two boxes could win.
    day.winningBoxes ??= chooseWinningBoxes(day.winningBox ?? day.winningGift);
    day.hiddenPrizes = assignPrizes(pool, day.hiddenPrizes ?? [day.hiddenPrize]);
    const slot = day.winningBoxes.indexOf(index);
    let prize = null;
    if (choice === 'bonus' && pool.includes('bonus')) prize = 'bonus';
    if (choice === 'win') prize = day.hiddenPrizes[slot === -1 ? 0 : slot];
    if (choice === 'random' && slot !== -1) prize = day.hiddenPrizes[slot];
    day.layout ??= currentGiftLayout(date, day);
    day.result = { selected: index, prize: prize ?? null };
    return saveDraw(draw) ? day.result : null;
  }

  async function openGift(index, pointerType) {
    if (pending || gifts[index].disabled) return;
    actionError = '';
    const touch = pointerType === 'touch' || (!pointerType && matchMedia('(hover: none)').matches);
    const attempt = { date: activeDate, choice: mode.value, index, touch };
    pending = attempt;
    const restoreFocus = document.activeElement === gifts[index];
    let recorded = null;
    try {
      recorded = await withDrawLock(() => record(attempt));
      if (recorded) {
        render();
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          const duration = giftOpeningDuration + (touch ? touchPreviewDuration : 0);
          await new Promise(resolve => setTimeout(resolve, duration));
          if (recorded.prize && activeDate === attempt.date && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
            effects?.celebrate(index);
            await new Promise(resolve => setTimeout(resolve, giftFlightDuration));
          } else if (!recorded.prize && activeDate === attempt.date) {
            effects?.showConsolation(index);
            await new Promise(resolve => setTimeout(resolve, 950));
          }
        }
      }
    } catch {
      showError();
    } finally {
      stage.classList.remove('draw-flying');
      pending = null;
      render();
      const result = recorded && activeDate === attempt.date && readDraw().days[attempt.date]?.result;
      if (result) {
        if (result.prize) stage.classList.add('draw-celebrate');
        byId('draw-result-open').focus({ preventScroll: true });
        openResult();
      } else if (restoreFocus) {
        status.focus({ preventScroll: true });
      }
    }
  }

  dateInput.addEventListener('change', () => {
    if (!validDate(dateInput.value)) {
      dateInput.value = activeDate;
      return;
    }
    simulatedDate = dateInput.value;
    activeDate = simulatedDate;
    actionError = '';
    try {
      localStorage.setItem(dateKey, activeDate);
    } catch {
      actionError = '瀏覽器無法儲存測試日期。';
    }
    render();
  });
  simulate.addEventListener('click', () => {
    const heading = byId('draw-heading');
    heading.focus({ preventScroll: true });
    byId('draw-card').scrollIntoView({ block: 'start' });
    complete(activeDate);
  });
  reset.addEventListener('click', () => {
    actionError = '';
    void withDrawLock(() => {
      if (saveDraw(emptyDraw())) layoutDate = undefined;
      mode.value = 'random';
      render();
    }).catch(showError);
  });
  function openResult() {
    const { days } = readDraw();
    const result = days[activeDate]?.result;
    if (!result || pending || prizeCard.open || discovery.open || productDialog.open) return;
    if (result.prize) {
      openPrize(result.prize);
    } else {
      byId('draw-miss-copy').textContent = missMessage(activeDate, days);
      discovery.showModal();
    }
  }

  byId('draw-result-open').addEventListener('click', openResult);
  byId('draw-view').addEventListener('click', () => byId('draw-coupons').focus({ preventScroll: true }));
  window.addEventListener('storage', event => {
    if (event.key === drawKey || event.key === null) render();
    if (event.key === passport.key || event.key === null) {
      renderPassport();
    }
  });
  function syncDate(date) {
    activityDate = date;
    const nextDate = simulatedDate || activityDate;
    if (activeDate === nextDate) return;
    activeDate = nextDate;
    dateInput.value = validDate(activeDate) ? activeDate : '';
    render();
  }
  byId('draw-use-activity-date').addEventListener('click', () => {
    try {
      localStorage.removeItem(dateKey);
      simulatedDate = '';
      syncDate(activityDate);
    } catch {
      showError();
    }
  });
  window.DysonTestDraw = { date: () => activeDate, complete, syncDate, setPassportReward, hasOpenedPassport, openResult };
  renderPassport();
  render();
})();
