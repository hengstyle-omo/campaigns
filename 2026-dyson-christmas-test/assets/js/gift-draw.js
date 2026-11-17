(() => {
  const start = '2026-12-01';
  const end = '2026-12-25';
  const bonusDate = '2026-12-20';
  const dateKey = 'dyson-christmas-test-v2-date';
  const drawKey = 'dyson-christmas-test-v2-gifts';
  const giftPositions = ['後排左側', '後排右側', '前排左側', '前排中央', '前排右側'];
  const prizes = {
    hd19: { name: 'HD19 隨行吹風機', image: './assets/images/rewards/dyson-HD19.jpg' },
    pencilvac: { name: 'PencilVac 鉛筆吸塵器', image: './assets/images/rewards/dyson-SV50.jpg' },
    hj10: { name: 'HJ10 噴射氣流空氣清淨機', image: './assets/images/rewards/dyson-HJ10.jpg' },
    bonus: { name: 'Dyson 任一商品', image: './assets/images/brand/dyson-logo-black.png' },
  };
  const couponCodes = { hd19: 'FBQCDQQK', pencilvac: '87GBMGJS', hj10: '2PSUJGKX', bonus: '9AVPFVKJ', passport: 'GDCZZD8X' };
  const animals = window.DYSON_GAME_CONFIG.bonusItems.filter(item => window.DYSON_ASSETS.bonusSprites[item.day]);
  const prizeURL = id => 'https://shop.hengstyle.com/V2/ECoupon/MyECoupon?source=linksetmembercoupon&ecouponCode=' + couponCodes[id];
  const blessings = [
    '願你忙碌的日子裡，也有一點時間留給自己。',
    '願你今天收到一句，剛好想聽見的話。',
    '願你回到家時，有一盞暖暖的燈等著你。',
    '願你喜歡的人，剛好也在想你。',
    '願今天有一件小事，讓你忍不住笑出來。',
    '願你有一頓慢慢吃、好好聊的晚餐。',
    '願你想念的人，今年有機會再見一面。',
    '願你期待已久的好消息，早一點到來。',
    '願你在冷冷的早晨，剛好喝到一杯熱咖啡。',
    '願接下來的日子，多一些值得期待的事。',
    '願你有一個安靜的夜晚，睡一場安穩的好覺。',
    '願今年努力過的事，在你沒留意的地方慢慢開花。',
    '願你留一個下午，做一件單純喜歡的事。',
    '願你收到一個擁抱，剛好在你需要的時候。',
    '願你在回家的路上，看到一棵特別漂亮的聖誕樹。',
    '願你和喜歡的人，多拍一張以後會想再看的照片。',
    '願你掛念的事，終於有個讓你安心的答案。',
    '願你把今年最喜歡的那一刻，好好收進回憶裡。',
    '願你想說的謝謝，今天剛好有機會親口說。',
    '願你聽見一首老歌，想起一段很好的時光。',
    '願你在平常的一天，遇到一件想和別人分享的事。',
    '願你今年的最後幾天，有笑聲，也有舒服的留白。',
    '願明年的你，有時間去想去的地方。',
    '願你在平安夜，和惦記的人互道一聲晚安。',
    '聖誕快樂！願這個冬天，有一份剛剛好的溫暖留給你。',
  ];
  const byId = id => document.getElementById(id);
  const dateInput = byId('draw-date');
  const mode = byId('draw-mode');
  const status = byId('draw-status');
  const feedback = byId('draw-feedback');
  const prizeCard = byId('draw-prize');
  const prizeImage = byId('draw-prize-image');
  const wallet = byId('draw-wallet');
  const giftGroup = byId('draw-gifts');
  const passportButton = byId('draw-passport-open');
  const passportTicket = byId('draw-passport-ticket');
  const stage = byId('draw-stage');
  const animalResult = byId('draw-animal-result');
  const animalPreview = byId('draw-animal-preview');
  const simulate = byId('draw-simulate');
  const reset = byId('draw-reset');
  const validDate = value => /^2026-12-\d{2}$/.test(value ?? '') && value >= start && value <= end;
  const randomMember = values => values[Math.floor(Math.random() * values.length)];
  let activityDate = '';
  let simulatedDate = '';
  let activeDate = '';
  let pending = null;
  let actionError = '';
  let wonCount = 0;
  let passport = { count: 0, required: 5 };
  let passportOpening = null;
  const previewOpened = new Set();

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
    const animal = document.createElement('img');
    animal.className = 'draw-box-animal';
    animal.alt = '';
    animal.hidden = true;
    button.append(animal);
    button.addEventListener('click', () => openGift(index));
    giftGroup.append(button);
    return button;
  });

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
  bindCouponClick(prizeCard, () => prizeCard.dataset.coupon);
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

  function renderWallet(days) {
    const wins = new Map(Object.entries(days).map(([day, record]) => [record.result?.prize, day]));
    const visiblePrizes = Object.entries(prizes).filter(([id]) => id !== 'bonus' || activeDate >= bonusDate || wins.has(id));
    wonCount = visiblePrizes.filter(([id]) => wins.has(id)).length;
    byId('draw-count').textContent = '已抽中 ' + wonCount + '／' + visiblePrizes.length + ' 張';
    updateBadge();

    wallet.replaceChildren(...visiblePrizes.map(([id, { name }]) => {
      const coupon = document.createElement('article');
      const day = wins.get(id);
      coupon.className = 'draw-coupon';
      if (day) coupon.dataset.won = '';
      const title = document.createElement('strong');
      title.textContent = name;
      const amount = document.createElement('span');
      amount.textContent = '折 $1,000';
      const note = document.createElement('small');
      note.textContent = day ? '✓ 已抽中 · ' + displayDate(day)
        : id === 'bonus' && activeDate < bonusDate ? '12/20 加入抽獎' : '尚未抽中';
      coupon.append(title, amount, note);
      if (day) {
        const link = document.createElement('a');
        link.href = prizeURL(id);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = '前往領取優惠券 ↗';
        bindCouponClick(link, id);
        coupon.append(link);
      }
      return coupon;
    }));
  }

  function updateBadge() {
    byId('voucher-count').textContent = wonCount + Number(Boolean(passport.key));
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
    const message = opened ? '兌換券已解鎖。' : opening ? '正在拆開 5 日回禮…' : passport.label || '已打卡 0／5 天';
    if (progress.textContent !== message) progress.textContent = message;
    passportButton.hidden = !passport.key || opened;
    passportButton.disabled = opening;
    passportButton.classList.toggle('draw-passport-opening', opening);
    passportTicket.hidden = !opened;
    if (opened && !passport.preview) passportTicket.href = prizeURL('passport');
    else passportTicket.removeAttribute('href');
    byId('draw-passport-cta').textContent = passport.preview ? '管理員模擬 · 領券連結預覽' : '前往領取兌換券 ↗';
    updateBadge();
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
      window.DysonTestDraw.onPassportOpened?.();
      if (!passport.preview) passportTicket.focus({ preventScroll: true });
    }
  });

  function displayDate(day) {
    return day.slice(5).replace('-', '/');
  }

  function dailyBlessing(date, index) {
    const dayOffset = Number(date.slice(-2)) - 1;
    return blessings[(dayOffset + index * gifts.length) % blessings.length];
  }

  function renderPrize(id) {
    prizeCard.hidden = !id;
    if (!id) return;

    const { name, image } = prizes[id];
    prizeCard.href = prizeURL(id);
    prizeCard.dataset.coupon = id;
    if (prizeImage.getAttribute('src') !== image) prizeImage.src = image;
    prizeCard.dataset.bonus = String(id === 'bonus');
    byId('draw-prize-name').textContent = name;
    byId('draw-prize-kind').textContent = id === 'bonus' ? '任一商品現折' : '指定商品現折';
  }

  function render() {
    const { days } = readDraw();
    const pool = availablePrizes(days, activeDate);
    const day = days[activeDate];
    const opening = pending?.date === activeDate;
    const played = Boolean(day?.result);
    // Earlier trials used fifteen gifts. Keep those results visible on the five-gift scene.
    const selected = opening ? pending.index : played ? day.result.selected % gifts.length : undefined;
    const prize = opening ? null : day?.result?.prize;
    const animal = played && !opening && !prize && (animals.find(item => item.day === day.result.animal)
      ?? animals[(Number(activeDate.slice(-2)) + selected) % animals.length]);
    const animalURL = animal && window.DYSON_ASSETS.bonusSprites[animal.day];
    const canOpen = day && !played && !pending;
    const bonusOption = mode.querySelector('option[value="bonus"]');
    const winOption = mode.querySelector('option[value="win"]');
    bonusOption.disabled = !pool.includes('bonus');
    winOption.disabled = !pool.length;
    if (mode.selectedOptions[0]?.disabled) mode.value = 'random';

    for (const [index, gift] of gifts.entries()) {
      gift.disabled = !canOpen;
      const state = index === selected ? opening ? 'opening' : prize ? 'won' : 'blessing' : 'closed';
      if (gift.dataset.state !== state) gift.dataset.state = state;
      const portrait = gift.querySelector('.draw-box-animal');
      portrait.hidden = !animalURL || index !== selected;
      if (!portrait.hidden && portrait.getAttribute('src') !== animalURL) portrait.src = animalURL;
    }
    animalResult.hidden = !animalURL;
    if (animalURL) {
      if (animalPreview.getAttribute('src') !== animalURL) animalPreview.src = animalURL;
      byId('draw-animal-name').textContent = animal.animal || animal.name;
    }
    floatedTicket.hidden = !prize;
    if (prize) {
      floatedTicket.dataset.box = String(selected);
      floatedTicket.dataset.coupon = prize;
      floatedTicket.href = prizeURL(prize);
    }
    stage.classList.toggle('draw-stage-won', Boolean(prize));
    if (!prize) stage.classList.remove('draw-celebrate');
    byId('draw-bonus').hidden = activeDate < bonusDate;
    byId('draw-create').hidden = Boolean(day) || !validDate(activeDate);
    byId('draw-view').hidden = !prize;
    const drawFromCard = byId('draw-from-card');
    drawFromCard.hidden = !day;
    if (played) drawFromCard.textContent = '查看今日聖誕祝福';
    else drawFromCard.textContent = pool.length
      ? '取得今日抽獎資格 · 前往拆禮物'
      : '今日祝福已解鎖 · 前往拆禮物';
    feedback.classList.toggle('draw-is-blessing', played && !opening);
    dateInput.disabled = Boolean(pending);
    reset.disabled = Boolean(pending);
    simulate.disabled = Boolean(pending || day || !validDate(activeDate));
    mode.disabled = Boolean(pending || played);
    renderPrize(prize);

    let message;
    if (actionError) {
      message = actionError;
    } else if (opening) {
      message = '正在拆開你的聖誕禮物…';
    } else if (played) {
      message = dailyBlessing(activeDate, selected);
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
        : '優惠券已集齊，仍可每天拆一份聖誕祝福。';
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
          winningBox: Math.floor(Math.random() * gifts.length),
          hiddenPrize: randomMember(pool) ?? null,
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
    if (!day || day.result) return false;

    // The previous fifteen-box layout had three winning indices. Unopened days get a fresh five-box draw.
    day.winningBox ??= day.winningGift ?? Math.floor(Math.random() * gifts.length);
    const assignedPrize = pool.includes(day.hiddenPrize) ? day.hiddenPrize : randomMember(pool);
    const won = choice === 'win' || (choice === 'random' && day.winningBox === index);
    const prize = choice === 'bonus' && pool.includes('bonus') ? 'bonus' : won ? assignedPrize : null;
    day.result = { selected: index, prize: prize ?? null, animal: prize ? null : randomMember(animals)?.day };
    return saveDraw(draw);
  }

  async function openGift(index) {
    if (pending || gifts[index].disabled) return;
    actionError = '';
    const attempt = { date: activeDate, choice: mode.value, index };
    pending = attempt;
    const restoreFocus = document.activeElement === gifts[index];
    try {
      if (await withDrawLock(() => record(attempt))) {
        render();
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    } catch {
      showError();
    } finally {
      pending = null;
      render();
      if (readDraw().days[attempt.date]?.result?.prize && activeDate === attempt.date) {
        stage.classList.add('draw-celebrate');
      }
      if (restoreFocus) status.focus({ preventScroll: true });
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
      saveDraw(emptyDraw());
      mode.value = 'random';
      render();
    }).catch(showError);
  });
  byId('draw-view').addEventListener('click', () => byId('draw-coupons').focus({ preventScroll: true }));
  window.addEventListener('storage', event => {
    if (event.key === drawKey || event.key === null) render();
    if (event.key === passport.key || event.key === null) {
      renderPassport();
      window.DysonTestDraw.onPassportOpened?.();
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
  window.DysonTestDraw = { date: () => activeDate, complete, syncDate, setPassportReward, hasOpenedPassport };
  renderPassport();
  render();
})();
