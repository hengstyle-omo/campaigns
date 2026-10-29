/* CORE START */
const Core = {
  dateFormatter:new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}),
  taipeiDate(date = new Date()) {
    const p = Object.fromEntries(this.dateFormatter.formatToParts(date).filter(v=>v.type!=='literal').map(v=>[v.type,v.value]));
    return `${p.year}-${p.month}-${p.day}`;
  },
  campaignDay(iso,year=2026) {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return 0;
    const start=`${year}-12-01`,end=`${year}-12-25`;
    if(iso<start)return 0;if(iso>end)return 26;
    return Number(iso.slice(-2));
  },
  dayState(day,today,claimed) {
    if(day>today)return 'future';
    if(Object.hasOwn(claimed,String(day)))return 'owned';
    return today>=1&&today<=25&&day<=today?'current':'missed';
  },
  taipeiTimestamp(date=new Date()){
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).filter(v=>v.type!=='literal').map(v=>[v.type,v.value]));
    return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}`;
  },
  participationDates(visits,throughDate,year=2026){
    const valid=new RegExp('^'+year+'-12-(?:0[1-9]|1[0-9]|2[0-5])$');
    return Object.keys(visits||{}).filter(date=>valid.test(date)&&visits[date]===true&&date<=throughDate).sort();
  },
  freshState(){return {claimed:{},placement:{},layouts:{},visits:{}};},
  normaliseState(raw){
    const state=this.freshState();if(!raw||typeof raw!=='object')return state;
    for(let d=1;d<=25;d++){
      if(!Object.hasOwn(raw.claimed||{},String(d)))continue;
      const claim=raw.claimed[d];if(!claim||typeof claim.at!=='string')continue;
      state.claimed[d]={at:claim.at};state.placement[d]=raw.placement?.[d]===true;
      const l=raw.layouts?.[d];if(l&&Number.isFinite(l.x)&&Number.isFinite(l.y)&&Number.isFinite(l.scale))state.layouts[d]={x:l.x,y:l.y,scale:Math.max(.65,Math.min(1.35,l.scale))};
    }
    for(const d of [101,102,103,104,105,106,107,108,109,110]){
      if(Object.hasOwn(raw.placement||{},d))state.placement[d]=raw.placement[d]===true;
      const l=raw.layouts?.[d];if(l&&[l.x,l.y,l.scale].every(Number.isFinite))state.layouts[d]={x:l.x,y:l.y,scale:Math.max(.65,Math.min(1.35,l.scale))};
    }
    for(const [date,value] of Object.entries(raw.visits||{}))if(/^2026-12-(?:0[1-9]|1[0-9]|2[0-5])$/.test(date)&&value===true)state.visits[date]=true;
    return state;
  },
  claim(state,day,today,at){
    if(this.dayState(day,today,state.claimed)!=='current')return false;
    state.claimed[day]={at};state.placement[day]=false;return true;
  }
};
/* CORE END */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
const BASE_CONFIG=window.DYSON_GAME_CONFIG;
const ASSETS=window.DYSON_ASSETS;
const FINAL_ARTWORK_DAYS=BASE_CONFIG.finalArtworkDays||[];
const brandLogo=$('brand-logo'),logoVariant=BASE_CONFIG.logoVariant==='black'?'black':'white';
if(brandLogo)brandLogo.src=ASSETS.brandLogos?.[logoVariant]||ASSETS.brandLogos?.white||brandLogo.getAttribute('src');
const YEAR=BASE_CONFIG.year,STORAGE_PREFIX=`dyson-advent-${YEAR}-v3-`;
const safeRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const safeWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
// Ordinary participants use an unverified Email. Admin accounts require a server-verified code and an in-memory, expiring session.
const BONUS_IDS=[101,102,103,104,105,106,107,108,109,110],bonusCatalog=BASE_CONFIG.bonusItems||[];
const CLOUD_CONFIG=window.DYSON_CLOUD_CONFIG;
const cloudEmail=v=>String(v||'').trim().toLowerCase();
const isCloudEmail=v=>v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const cardTaskNormalise=v=>v?.completed===true&&['png','gif','mp4'].includes(v.format)&&['download','share'].includes(v.method)?{completed:true,format:v.format,method:v.method,at:String(v.at||'')}:null;
let guestCardTask=cardTaskNormalise(safeRead(STORAGE_PREFIX+'guest-card-task',null)),previewCardTask=null;
const savedCloudProfile=safeRead(STORAGE_PREFIX+'cloud-profile',{}),rememberedEmail=cloudEmail(savedCloudProfile.email);
const cloud={endpoint:CLOUD_CONFIG.endpoint||safeRead(STORAGE_PREFIX+'cloud-endpoint',''),email:isCloudEmail(rememberedEmail)?rememberedEmail:'',ready:false,cachedView:false,loading:false,adminToken:'',adminSessionExpiresAt:0,adminAuthRequired:false,canPreview:false,isAdmin:false,hasExclusive:false,bonusIds:[],consent:savedCloudProfile.consent===true,marketingDirty:false,marketingDraft:null,marketingSaving:null,consentStatus:'',synced:Core.freshState(),cardTask:null,pendingCardTask:null,offset:0,hasClock:false,pendingDay:null,pendingReward:false,timer:null,saving:null,error:'',queue:Promise.resolve(),requests:new Map(),previewLoaded:false,previewSynced:{state:Core.freshState(),date:null,days:null,cardTask:null}};
const timing={started:performance.now(),sceneReadyMs:null,progressReadMs:null,lastSaveMs:null};
const cloudEnabled=()=>location.protocol==='https:'&&/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(cloud.endpoint);
const canPreview=()=>cloud.ready&&cloud.isAdmin&&cloud.canPreview&&!!cloud.adminToken&&Date.now()+cloud.offset<cloud.adminSessionExpiresAt;
const cloudCacheKey=email=>STORAGE_PREFIX+'cloud-state:'+cloud.endpoint+':'+email;
function cloudDiff(current,previous){const changes={};for(const raw of [...Object.keys(current.claimed),...BONUS_IDS]){const d=Number(raw),patch={};if(BONUS_IDS.includes(d)&&!cloud.bonusIds.includes(d))continue;if((current.placement[d]===true)!==(previous.placement[d]===true))patch.placement=current.placement[d]===true;const a=current.layouts[d]||null,b=previous.layouts[d]||null;if(JSON.stringify(a)!==JSON.stringify(b))patch.layout=a;if(Object.keys(patch).length)changes[d]=patch;}return changes;}
function cloudApply(state,changes){for(const [raw,patch] of Object.entries(changes||{})){const d=Number(raw);if((BONUS_IDS.includes(d)&&!cloud.bonusIds.includes(d))||(!state.claimed[d]&&!BONUS_IDS.includes(d)))continue;if(typeof patch.placement==='boolean')state.placement[d]=patch.placement;if(Object.hasOwn(patch,'layout')){if(patch.layout===null)delete state.layouts[d];else state.layouts[d]=patch.layout;}}return Core.normaliseState(state);}
const previewCacheKey=email=>STORAGE_PREFIX+'cloud-preview:'+cloud.endpoint+':'+email;
function previewNormalise(raw){const state=Core.normaliseState(raw?.state);for(const claim of Object.values(state.claimed))if(Number.isFinite(Date.parse(claim.at)))claim.at=new Date(claim.at).toISOString();return {state,date:typeof raw?.date==='string'?raw.date:null,days:null,cardTask:cardTaskNormalise(raw?.cardTask)};}
function previewSnapshot(){return previewNormalise({state:preview,date:previewDate,cardTask:previewCardTask});}
function previewDiff(current,previous){const items={},entry=(s,d)=>s.claimed[d]?{at:s.claimed[d].at,placement:s.placement[d]===true,layout:s.layouts[d]||null}:null;for(let d=1;d<=25;d++){const a=entry(current.state,d),b=entry(previous.state,d);if(JSON.stringify(a)!==JSON.stringify(b))items[d]=a;}const changes={};if(Object.keys(items).length)changes.items=items;if(current.date!==previous.date)changes.view={date:current.date,days:null};const bonus=Object.fromEntries(Object.entries(cloudDiff(current.state,previous.state)).filter(([d])=>BONUS_IDS.includes(Number(d))));if(Object.keys(bonus).length)changes.bonus=bonus;if(JSON.stringify(current.state.visits)!==JSON.stringify(previous.state.visits))changes.visits=current.state.visits;if(current.cardTask&&!previous.cardTask)changes.cardTask=current.cardTask;return changes;}
function previewApply(snapshot,changes){const next=previewNormalise(snapshot);for(const [d,value] of Object.entries(changes?.items||{})){if(value===null){delete next.state.claimed[d];delete next.state.placement[d];delete next.state.layouts[d];}else{next.state.claimed[d]={at:value.at};next.state.placement[d]=value.placement===true;if(value.layout)next.state.layouts[d]=value.layout;else delete next.state.layouts[d];}}if(changes?.bonus)next.state=cloudApply(next.state,changes.bonus);if(changes?.visits)next.state.visits={...changes.visits};if(changes?.view)next.date=changes.view.date;if(changes?.cardTask)next.cardTask=cardTaskNormalise(changes.cardTask);return next;}
function previewRestore(snapshot){const next=previewNormalise(snapshot);preview=next.state;previewDate=next.date;previewCardTask=next.cardTask;if(previewDate){$('preview-date').value=previewDate;$('sim-date').value=previewDate;}safeWrite(STORAGE_PREFIX+'preview',preview);}
function previewPending(){return canPreview()&&cloud.previewLoaded?previewDiff(previewSnapshot(),cloud.previewSynced):{};}
function cloudCache(){
 if(!cloud.email){safeWrite(STORAGE_PREFIX+'guest-state',live);return;}
 if(!cloud.ready&&!cloud.cachedView)return;
 safeWrite(cloudCacheKey(cloud.email),{adminProtected:cloud.isAdmin,catalogRevision:BASE_CONFIG.scheduleRevision,state:live,synced:cloud.synced,pending:cloudDiff(live,cloud.synced),cardTask:cloud.cardTask,pendingCardTask:cloud.pendingCardTask,consent:cloud.consent});
 if(canPreview()&&cloud.previewLoaded)safeWrite(previewCacheKey(cloud.email),{catalogRevision:BASE_CONFIG.scheduleRevision,pending:previewPending()});
}
function previewPersist(){safeWrite(STORAGE_PREFIX+'preview',preview);cloudScheduleSave();}
function localCardTask(){return previewDate?previewCardTask:cloud.pendingCardTask||cloud.cardTask||(!cloud.email?guestCardTask:null);}
function cardTaskConfirmed(){return previewDate?!!previewCardTask:cloud.ready&&!!cloud.cardTask;}
function renderCloud(){
 const active=cloudEnabled(),admin=canPreview(),busy=cloud.loading||!!cloud.marketingSaving,pending=!!cloud.pendingCardTask||Object.keys(cloudDiff(live,cloud.synced)).length>0||Object.keys(previewPending()).length>0,saving=!!cloud.saving||cloud.ready&&pending;
 $('progress-open').textContent=cloud.loading?'背景同步中…':cloud.ready?(cloud.error?'進度待同步':saving?'保存中…':'保存進度'):'讀取進度';
 $('progress-open').classList.toggle('is-busy',busy||saving&&!cloud.error);$('progress-open').setAttribute('aria-busy',String(busy||saving&&!cloud.error));
 $('progress-open').setAttribute('aria-label',cloud.ready?'查看與保存收藏進度':'輸入 Email 保存或找回進度');
 $('admin-auth-email').textContent=cloud.email;$('admin-auth-submit').disabled=busy;$('admin-auth-cancel').disabled=busy;$('admin-auth-code').disabled=busy;$('admin-auth-form').setAttribute('aria-busy',String(busy));if($('admin-auth-dialog').open)$('admin-auth-message').textContent=cloud.loading?'正在驗證…':cloud.error||'請輸入管理員驗證碼。';
 $('progress-submit').textContent='保存';$('progress-submit').disabled=busy;$('progress-form').setAttribute('aria-busy',String(busy));
 $('progress-current').hidden=!cloud.email;$('progress-email-label').textContent=cloud.email;$('progress-switch').disabled=busy;
 $('progress-email').disabled=busy;$('progress-marketing').disabled=busy;$('progress-marketing').checked=cloud.marketingDirty?cloud.marketingDraft===true:cloud.consent;
 $('progress-retry').hidden=!cloud.error||!active;
 const message=cloud.error||(cloud.loading?'正在背景同步進度，你可以先瀏覽與製作卡片。':cloud.marketingSaving?'正在保存行銷意願…':cloud.consentStatus|| (cloud.saving?'正在背景保存進度…':cloud.ready?'已保存，可在相同 Email 接續收藏。':''));
 $('progress-message').textContent=message;$('progress-message').classList.toggle('is-busy',busy||saving&&!cloud.error);
 for(const id of ['quick-sim-toggle','studio-open'])$(id).hidden=!admin;
 if(!admin){$('quick-sim-panel').hidden=true;$('preview-banner').hidden=true;}
 $('cloud-settings').hidden=!admin;$('cloud-endpoint').value=cloud.endpoint;$('cloud-summary').textContent=active?'進度服務已設定。':'請先設定進度服務網址。';
 const returning=cloud.ready||cloud.email;$('welcome-progress-title').textContent=returning?'接續你的聖誕進度':'留住你的聖誕進度';
}
function openProgress(){for(const id of ['card-dialog','vouchers-dialog','item-dialog'])closeDialog(id);$('progress-email').value=cloud.email;$('progress-marketing').checked=cloud.marketingDirty?cloud.marketingDraft===true:cloud.consent;openWelcome({progressOnly:true});renderCloud();$('progress-email').focus();}
function cloudTransport(payload){
 if(!cloudEnabled())return Promise.reject(new Error('請從已設定進度服務的 HTTPS 活動網址保存。'));
 return new Promise((resolve,reject)=>{
  const id=Array.from(crypto.getRandomValues(new Uint8Array(20)),b=>b.toString(16).padStart(2,'0')).join(''),frame=el('iframe');frame.name='dyson-progress-'+id;frame.hidden=true;frame.dataset.cloudTransport='true';frame.title='背景保存收藏進度';
  const form=el('form');form.method='POST';form.action=cloud.endpoint;form.target=frame.name;form.hidden=true;form.dataset.cloudTransport='true';const field=el('input');field.type='hidden';field.name='payload';field.value=JSON.stringify({...payload,requestId:id,clientOrigin:location.origin});form.append(field);
  let finished=false;const finish=(error,result)=>{if(finished)return;finished=true;clearTimeout(timer);cloud.requests.delete(id);frame.remove();form.remove();error?reject(error):resolve(result);};
  const timer=setTimeout(()=>finish(new Error('雲端尚未回覆，內容已留在此裝置，請稍後重試同步。')),30000);
  cloud.requests.set(id,result=>{field.value='';result?.ok?finish(null,result):finish(new Error(result?.error||'暫時無法同步，請稍後重試。'));});document.body.append(frame,form);form.submit();
 });
}
window.addEventListener('message',event=>{let origin;try{origin=new URL(event.origin);}catch{return;}if(origin.protocol!=='https:'||!(origin.hostname==='script.google.com'||origin.hostname==='script.googleusercontent.com'||origin.hostname.endsWith('.googleusercontent.com')))return;const m=event.data;if(m?.channel==='dyson-progress-v1'&&typeof m.requestId==='string')cloud.requests.get(m.requestId)?.(m.result);});
function cloudRequireAdminAuth(result){
 cloudCache();clearTimeout(cloud.timer);cloud.adminToken='';cloud.adminSessionExpiresAt=0;cloud.adminAuthRequired=true;cloud.ready=false;cloud.cachedView=false;cloud.isAdmin=false;cloud.canPreview=false;cloud.hasExclusive=false;cloud.bonusIds=[];cloud.previewLoaded=false;previewRestore(null);cloud.cardTask=null;live=Core.freshState();cloud.synced=Core.freshState();
 cloud.error=result.message||'請重新輸入管理員驗證碼。';
 for(const id of ['studio-dialog','item-dialog','vouchers-dialog','card-dialog'])closeDialog(id);
 stopShow(false);pauseMusic(true);renderUI();$('admin-auth-code').value='';showDialog('admin-auth-dialog');$('admin-auth-message').textContent=cloud.error;setTimeout(()=>$('admin-auth-code').focus(),0);
}
function cloudSend(payload){
 const request=cloud.queue.then(async()=>{
  const token=payload.email===cloud.email?cloud.adminToken:'';
  const result=await cloudTransport({...payload,...(token?{adminToken:token}:{})});
  // A backend challenge must never be interpreted as an empty participant state.
  if(result.adminAuthRequired===true){cloudRequireAdminAuth(result);const error=new Error(cloud.error);error.code='ADMIN_AUTH_REQUIRED';throw error;}
  if(result.authVersion!==1||result.serviceVersion!==8||result.permissionsVersion!==3)throw new Error('請先更新管理員驗證版 GS，並將原部署更新為新版本。');
  if(result.isAdmin===true&&result.adminAuthenticated!==true)throw new Error('管理員驗證尚未完成，請重新載入進度。');
  if(payload.email===cloud.email){
   if(result.adminAuthenticated===true){if(result.adminToken)cloud.adminToken=result.adminToken;cloud.adminSessionExpiresAt=Number(result.adminSessionExpiresAt)||0;cloud.adminAuthRequired=false;}
   else{cloud.adminToken='';cloud.adminSessionExpiresAt=0;cloud.adminAuthRequired=false;}
  }
  return result;
 });cloud.queue=request.catch(()=>{});return request;
}
function cloudAcceptClock(result){
 if(result.serviceVersion!==8||result.rulesVersion!==3||result.permissionsVersion!==3||result.authVersion!==1)throw new Error('請更新管理員驗證版 GS 與原部署。');if(result.year!==YEAR)throw new Error('活動年度與進度服務不同。');
 cloud.isAdmin=result.isAdmin===true&&result.adminAuthenticated===true&&!!cloud.adminToken;cloud.canPreview=cloud.isAdmin&&result.canPreview===true;cloud.hasExclusive=result.hasExclusiveCollection===true;cloud.bonusIds=cloud.hasExclusive&&Array.isArray(result.bonusIds)?result.bonusIds.filter(d=>BONUS_IDS.includes(d)):[];
 if(!cloud.isAdmin){cloud.previewLoaded=false;previewRestore(null);}
 if(Number.isFinite(Date.parse(result.serverTime))){cloud.offset=Date.parse(result.serverTime)-Date.now();cloud.hasClock=true;}
}
function acceptFormalResult(result){const pending=cloudDiff(live,cloud.synced);cloudAcceptClock(result);cloud.synced=Core.normaliseState(result.state);live=cloudApply(Core.normaliseState(result.state),pending);cloud.cardTask=cardTaskNormalise(result.cardTask);if(cloud.cardTask)cloud.pendingCardTask=null;cloudCache();}
async function cloudConnect(email,consent,{userInitiated=false,adminCode}={}){
 email=cloudEmail(email);if(!isCloudEmail(email))throw new Error('請填寫有效的 Email。');if(cloud.loading)return false;
 if(cloud.ready&&email!==cloud.email&&!(await cloudFlush()))throw new Error('原進度尚未同步，請先重試。');
 const started=performance.now(),same=email===cloud.email,guestState=Core.normaliseState(safeRead(STORAGE_PREFIX+'guest-state',{})),guestTask=guestCardTask;
 const preserveDraft=same&&cloud.marketingDirty&&typeof consent!=='boolean';
 if(!same){cloud.adminToken='';cloud.adminSessionExpiresAt=0;cloud.adminAuthRequired=false;cloud.ready=false;cloud.cachedView=false;cloud.cardTask=null;cloud.pendingCardTask=null;cloud.synced=Core.freshState();live=Core.normaliseState(guestState);previewRestore(null);}
 cloud.email=email;cloud.loading=true;cloud.error='';cloud.isAdmin=false;cloud.canPreview=false;cloud.hasExclusive=false;cloud.bonusIds=[];safeWrite(STORAGE_PREFIX+'cloud-profile',{email,consent:cloud.consent});renderCloud();
 try{
  let cached=safeRead(cloudCacheKey(email),{});const payload={action:typeof adminCode==='string'?'adminLogin':'connect',email};if(typeof adminCode==='string')payload.adminCode=adminCode;
  if(Object.keys(guestState.claimed).length||Object.keys(guestState.visits).length)payload.guestState=guestState;
  const task=cardTaskNormalise(cached.pendingCardTask)||guestTask;if(task)payload.cardTask=task;
  if(typeof consent==='boolean')payload.marketingConsent=consent;
  const result=await cloudSend(payload);delete payload.adminCode;adminCode=undefined;cloudAcceptClock(result);cached=safeRead(cloudCacheKey(email),cached);
  if(typeof consent==='boolean'&&result.marketingConsent!==consent)throw new Error('行銷意願尚未確認保存，請重試。');
  cloud.synced=Core.normaliseState(result.state);const pending=cached.pending||{};for(const d of BONUS_IDS)if(!cloud.bonusIds.includes(d))delete pending[d];
  if(cached.catalogRevision&&cached.catalogRevision!==BASE_CONFIG.scheduleRevision)for(const d of [10,16,20])delete pending[d];
  live=cloudApply(Core.normaliseState(result.state),pending);cloud.ready=true;cloud.cachedView=true;cloud.cardTask=cardTaskNormalise(result.cardTask);cloud.pendingCardTask=cloud.cardTask?null:cardTaskNormalise(cached.pendingCardTask)||cloud.pendingCardTask;cloud.consent=result.marketingConsent===true;
  if(!preserveDraft){cloud.marketingDirty=false;cloud.marketingDraft=null;}
  cloud.previewLoaded=canPreview()&&result.previewSync===true;
  if(cloud.previewLoaded){cloud.previewSynced=previewNormalise(result.preview);const saved=safeRead(previewCacheKey(email),{});previewRestore(previewApply(cloud.previewSynced,saved.pending));}else previewRestore(null);
  safeWrite(STORAGE_PREFIX+'guest-state',Core.freshState());guestCardTask=null;safeWrite(STORAGE_PREFIX+'guest-card-task',null);safeWrite(STORAGE_PREFIX+'cloud-profile',{email,consent:cloud.consent});
  timing.progressReadMs=Math.round(performance.now()-started);cloud.consentStatus=preserveDraft?'行銷意願尚未保存，請重試。':'進度已保存。';
  cloudCache();renderUI();drawFrame(0,performance.now());ensureItemAssets(ownedDays()).then(()=>{renderUI();drawFrame(0,performance.now());}).catch(()=>{});cloudScheduleSave();
  closeDialog('admin-auth-dialog');$('admin-auth-code').value='';if(payload.action==='adminLogin')status('管理員驗證完成，可使用日期模擬。');if(userInitiated)trackActivity('progress_save',{method:'email'});if(cloud.pendingReward){cloud.pendingReward=false;renderVouchers();showDialog('vouchers-dialog');}return true;
 }catch(error){cloud.error=error.message;status(error.message,{persistent:true});throw error;}
 finally{cloud.loading=false;renderCloud();}
}
function cloudScheduleSave(){cloudCache();if(!cloud.ready||!cloudEnabled())return;clearTimeout(cloud.timer);if(!cloud.pendingCardTask&&!Object.keys(cloudDiff(live,cloud.synced)).length&&!Object.keys(previewPending()).length)return;cloud.timer=setTimeout(()=>cloudFlush(),1500);}
async function cloudFlush(){
 clearTimeout(cloud.timer);if(!cloud.ready||!cloudEnabled())return true;if(cloud.saving)return cloud.saving;
 cloud.saving=(async()=>{await Promise.resolve();const started=performance.now();try{
  if(cloud.pendingCardTask){const result=await cloudSend({action:'cardComplete',email:cloud.email,cardTask:cloud.pendingCardTask});acceptFormalResult(result);}
  while(true){const before=Core.normaliseState(live),changes=cloudDiff(before,cloud.synced);if(!Object.keys(changes).length)break;const result=await cloudSend({action:'save',email:cloud.email,changes});const later=cloudDiff(live,before);cloudAcceptClock(result);cloud.synced=Core.normaliseState(result.state);live=cloudApply(Core.normaliseState(result.state),later);cloud.cardTask=cardTaskNormalise(result.cardTask);cloudCache();}
  while(canPreview()&&cloud.previewLoaded){const before=previewSnapshot(),changes=previewDiff(before,cloud.previewSynced);if(!Object.keys(changes).length)break;const result=await cloudSend({action:'previewSave',email:cloud.email,changes});cloudAcceptClock(result);const later=previewDiff(previewSnapshot(),before);cloud.previewSynced=previewNormalise(result.preview);previewRestore(previewApply(cloud.previewSynced,later));cloudCache();}
  cloud.error='';timing.lastSaveMs=Math.round(performance.now()-started);return true;
 }catch(error){cloud.error=error.message;cloudCache();return false;}finally{cloud.saving=null;if(!cloud.error)cloudScheduleSave();renderCloud();renderBenefits();}})();renderCloud();return cloud.saving;
}
async function claimCloud(d){
 if(!cloud.ready){status('進度正在同步，請稍候再領取；仍可先製作卡片。');return false;}
 if(cloud.loading)return false;if(!(await cloudFlush())){openProgress();return false;}cloud.loading=true;renderCloud();
 try{const result=await cloudSend({action:'claim',email:cloud.email,day:Number(d)});const wasClaimed=!!live.claimed[Number(d)];acceptFormalResult(result);if(!wasClaimed&&live.claimed[Number(d)])trackActivity('gift_collect',{...giftAnalytics(d),collected_count:Object.keys(live.claimed).length});renderUI();chime();status(`已收藏「${item(d).name}」，按「放入水晶球內」才會加入場景。`);return true;}
 catch(error){cloud.error=error.message;status(error.message,{persistent:true});return false;}finally{cloud.loading=false;renderCloud();}
}
async function saveMarketingConsent(){
 if(!cloud.ready||cloudEmail($('progress-email').value)!==cloud.email||!cloud.marketingDirty)return false;if(cloud.marketingSaving)return cloud.marketingSaving;
 const email=cloud.email,desired=cloud.marketingDraft===true;
 cloud.marketingSaving=(async()=>{try{const result=await cloudSend({action:'consent',email,marketingConsent:desired});if(result.consentSaved!==true||result.marketingConsent!==desired)throw new Error('行銷意願尚未確認保存。');if(cloud.email!==email)return false;acceptFormalResult(result);cloud.consent=desired;cloud.marketingDirty=false;cloud.marketingDraft=null;cloud.consentStatus='行銷意願已保存。';cloud.error='';safeWrite(STORAGE_PREFIX+'cloud-profile',{email,consent:desired});return true;}catch(error){cloud.error='行銷意願尚未保存：'+error.message;return false;}finally{cloud.marketingSaving=null;renderCloud();}})();renderCloud();return cloud.marketingSaving;
}
async function startWelcomeCollection(){
 const email=cloudEmail($('progress-email').value);if(!email){if(welcomeProgressOnly){$('progress-message').textContent='請填寫 Email 保存或找回進度。';return;}trackCampaignStart();finishWelcome();return;}
 if(!isCloudEmail(email)){$('progress-message').textContent='請確認 Email 格式。';$('progress-email').focus();return;}
 const consent=cloud.marketingDirty?cloud.marketingDraft:undefined;if(!welcomeProgressOnly)trackCampaignStart();finishWelcome();cloudConnect(email,consent,{userInitiated:true}).catch(()=>{});
}
function markCardTask(format,method){
 const task=cardTaskNormalise({completed:true,format,method,at:new Date().toISOString()});if(!task)return;
 if(previewDate){if(!previewCardTask){previewCardTask=task;previewPersist();}}
 else if(cloud.ready){if(!cloud.cardTask&&!cloud.pendingCardTask){cloud.pendingCardTask=task;cloudCache();cloudFlush();}}
 else if(!cloud.email){guestCardTask=guestCardTask||task;safeWrite(STORAGE_PREFIX+'guest-card-task',guestCardTask);}
 else{cloud.pendingCardTask=cloud.pendingCardTask||task;const cached=safeRead(cloudCacheKey(cloud.email),{});safeWrite(cloudCacheKey(cloud.email),{...cached,pendingCardTask:cloud.pendingCardTask});}
 renderBenefits();
}
function startRewardTask(){if(localCardTask()){cloud.pendingReward=true;openProgress();}else{closeDialog('vouchers-dialog');openChristmasCard();}}
$('progress-open').addEventListener('click',openProgress);
$('progress-marketing').addEventListener('change',()=>{cloud.marketingDirty=true;cloud.marketingDraft=$('progress-marketing').checked;cloud.consentStatus='';if(cloud.ready&&cloudEmail($('progress-email').value)===cloud.email)saveMarketingConsent();});
$('progress-form').addEventListener('submit',event=>{event.preventDefault();startWelcomeCollection();});
$('progress-retry').addEventListener('click',async()=>{if(!cloud.ready){try{await cloudConnect($('progress-email').value||cloud.email,cloud.marketingDirty?cloud.marketingDraft:undefined);}catch{}}else if(cloud.marketingDirty)await saveMarketingConsent();else await cloudFlush();});
$('admin-auth-form').addEventListener('submit',async event=>{
 event.preventDefault();if(cloud.loading)return;const code=$('admin-auth-code').value;$('admin-auth-code').value='';
 try{await cloudConnect(cloud.email,cloud.marketingDirty?cloud.marketingDraft:undefined,{userInitiated:true,adminCode:code});}
 catch(error){$('admin-auth-message').textContent=error.message;$('admin-auth-code').focus();}
});
$('admin-auth-cancel').addEventListener('click',()=>{$('admin-auth-code').value='';closeDialog('admin-auth-dialog');openProgress();});
$('admin-auth-dialog').addEventListener('close',()=>{$('admin-auth-code').value='';});
$('progress-switch').addEventListener('click',async()=>{
 if(cloud.marketingSaving&&!(await cloud.marketingSaving))return;if(!(await cloudFlush()))return;
 clearTimeout(cloud.timer);cloud.adminToken='';cloud.adminSessionExpiresAt=0;cloud.adminAuthRequired=false;$('admin-auth-code').value='';closeDialog('admin-auth-dialog');cloud.ready=false;cloud.cachedView=false;cloud.canPreview=false;cloud.isAdmin=false;cloud.hasExclusive=false;cloud.bonusIds=[];cloud.previewLoaded=false;previewRestore(null);cloud.email='';cloud.consent=false;cloud.cardTask=null;cloud.pendingCardTask=null;cloud.marketingDirty=false;cloud.marketingDraft=null;cloud.consentStatus='';cloud.error='';cloud.hasClock=false;live=Core.freshState();cloud.synced=Core.freshState();safeWrite(STORAGE_PREFIX+'cloud-profile',{});for(const id of ['studio-dialog','item-dialog'])closeDialog(id);renderUI();$('progress-email').value='';renderCloud();$('progress-email').focus();
});
$('cloud-save-export').addEventListener('click',async()=>{if(!canPreview())return;const value=$('cloud-endpoint').value.trim();if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(value)){$('cloud-settings-status').textContent='請填入有效 /exec 網址。';return;}if(!(await cloudFlush()))return;cloud.endpoint=value;safeWrite(STORAGE_PREFIX+'cloud-endpoint',value);await exportConfig();});
window.addEventListener('online',()=>{if(cloud.ready)cloudFlush();else if(cloud.email)cloudConnect(cloud.email).catch(()=>{});});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cloudFlush();else if(cloud.ready&&!previewDate&&today()>=1&&today()<=25&&!live.visits[dateISO()])cloudConnect(cloud.email).catch(()=>{});});


const SCHEDULE_MOVES={4:5,5:4,10:20,20:10,18:16,16:18};
const scheduleKey=STORAGE_PREFIX+'schedule-20261021-products';
const scheduleNeedsMigration=!safeRead(scheduleKey,false);

let settings=safeRead(STORAGE_PREFIX+'config',{});
// Retire editor-only atlas metadata while preserving every participant state.
const standaloneMetadataKey=STORAGE_PREFIX+'standalone-metadata-v55';
if(!safeRead(standaloneMetadataKey,false)){
  for(const value of Object.values(settings)){if(value&&typeof value==='object'){delete value.atlas;delete value.sourceDay;}}
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(standaloneMetadataKey,true);
}
// Refresh replaced draft products while retaining claims, layouts and other content edits.
const previousCatalog={4:'Supersonic',10:'V12',15:'Purifier',18:'Airwrap',20:'Airstrait'};
let refreshedCatalog=false;
for(const [day,model] of Object.entries(previousCatalog)){
  if(settings[day]?.product?.model!==model)continue;
  delete settings[day];refreshedCatalog=true;
}
if(refreshedCatalog)safeWrite(STORAGE_PREFIX+'config',settings);
const productLinkUpdateKey=STORAGE_PREFIX+'product-links-bp10-20261020';
if(!safeRead(productLinkUpdateKey,false)){
  const oldURLs={4:'https://shop.hengstyle.com/SalePage/Index/12221252',10:'https://shop.hengstyle.com/SalePage/Index/11191634',20:''};
  for(const [day,oldURL] of Object.entries(oldURLs)){
    if(settings[day]?.product?.url===oldURL)settings[day].product.url=BASE_CONFIG.items.find(i=>i.day===(SCHEDULE_MOVES[day]||Number(day))).product.url;
  }
  if(settings[18]?.name==='聖誕驚喜禮盒')delete settings[18];
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(productLinkUpdateKey,true);
}
for(const [day,oldName,newName] of [[4,'HD19 隨行吹風機','HD19 旅行吹風機'],[20,'PF01 迷你風扇','PF01 隨身風扇']])if(settings[day]?.name===oldName){settings[day].name=newName;safeWrite(STORAGE_PREFIX+'config',settings);}
// Replace retired HP12 copy once, without changing attendance or saved layouts.
const productRevisionKey=STORAGE_PREFIX+'products-miniature-relief-hj10-20261021';
if(!safeRead(productRevisionKey,false)){
  if(settings[15]){delete settings[15];safeWrite(STORAGE_PREFIX+'config',settings);}
  safeWrite(productRevisionKey,true);
}
let rewardSettings=safeRead(STORAGE_PREFIX+'rewards-v2',{});
const rewardPresentationKey=STORAGE_PREFIX+'reward-presentation-'+BASE_CONFIG.rewardPresentationRevision;
if(!safeRead(rewardPresentationKey,false)){
  const oldRewards=[{"id": "product-hd19", "unlock": "product", "productDay": 5, "title": "髮品折抵 $1,000", "preview": "髮品專屬優惠", "conditions": "適用商品、使用門檻及期限以活動與結帳頁面說明為準。", "code": "HC999999", "approved": true, "validUntil": ""}, {"id": "product-sv50", "unlock": "product", "productDay": 10, "title": "吸塵器折抵 $1,000", "preview": "吸塵器專屬優惠", "conditions": "適用商品、使用門檻及期限以活動與結帳頁面說明為準。", "code": "FC999999", "approved": true, "validUntil": ""}, {"id": "product-hj10", "unlock": "product", "productDay": 15, "title": "清淨機折抵 $1,000", "preview": "清淨機專屬優惠", "conditions": "適用商品、使用門檻及期限以活動與結帳頁面說明為準。", "code": "EC999999", "approved": true, "validUntil": ""}, {"id": "product-bp10", "unlock": "product", "productDay": 20, "title": "BP10 專屬優惠券", "preview": "BP10 專屬優惠", "conditions": "BP10 專屬優惠，折抵金額、序號與使用條件待公布。", "code": "", "approved": false, "validUntil": ""}, {"id": "visits-10", "unlock": "visits", "required": 10, "title": "Dyson 全品項折抵 $1,000", "preview": "Dyson 全品項折抵 $1,000", "conditions": "活動期間累積參與 10 個不同台灣日期即可解鎖，不需連續。適用商品、使用門檻及期限以活動與結帳頁面說明為準。", "code": "All999999", "approved": true, "validUntil": ""}];
  for(const base of BASE_CONFIG.rewards){const saved=rewardSettings[base.id],old=oldRewards.find(r=>r.id===base.id);if(!saved||!old)continue;
    for(const key of ['title','preview','conditions'])if(saved[key]===old[key])delete saved[key];
    if(base.id==='visits-10')for(const key of ['title','preview','conditions','code','approved','validUntil'])delete saved[key];
  }
  safeWrite(STORAGE_PREFIX+'rewards-v2',rewardSettings);safeWrite(rewardPresentationKey,true);
}

let live=Core.normaliseState(safeRead(STORAGE_PREFIX+'guest-state',null));
if(cloud.email){const cached=safeRead(cloudCacheKey(cloud.email),{});if(cached.state&&cached.adminProtected!==true){live=Core.normaliseState(cached.state);cloud.synced=Core.normaliseState(cached.synced||cached.state);cloud.cachedView=true;cloud.cardTask=cardTaskNormalise(cached.cardTask);cloud.pendingCardTask=cardTaskNormalise(cached.pendingCardTask);cloud.consent=cached.consent===true;}}
let preview=Core.normaliseState(safeRead(STORAGE_PREFIX+'preview',null));
if(scheduleNeedsMigration){
  settings=Object.fromEntries(Object.entries(settings).map(([d,value])=>[SCHEDULE_MOVES[d]||d,value]));
  safeWrite(STORAGE_PREFIX+'config',settings);
  // Attendance belongs to a calendar date. Keep claims; changed gifts require explicit placement again.
  for(const [key,progress] of [['live',live],['preview',preview]]){
    const oldLayouts={...progress.layouts};
    for(const d of Object.keys(SCHEDULE_MOVES)){delete progress.layouts[d];if(progress.claimed[d])progress.placement[d]=false;}
    for(const [oldDay,newDay] of Object.entries(SCHEDULE_MOVES))if(oldLayouts[oldDay]&&progress.claimed[newDay])progress.layouts[newDay]=oldLayouts[oldDay];
    safeWrite(STORAGE_PREFIX+key,progress);
  }
  safeWrite(scheduleKey,true);
}

const catalogRulesKey=STORAGE_PREFIX+'four-products-visits-v2';
if(!safeRead(catalogRulesKey,false)){
  for(const d of [10,16,20]){delete settings[d];delete preview.layouts[d];if(preview.claimed[d])preview.placement[d]=false;}
  rewardSettings=Object.fromEntries(Object.entries(rewardSettings).filter(([id])=>BASE_CONFIG.rewards.some(b=>b.id===id)));
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(STORAGE_PREFIX+'preview',preview);safeWrite(STORAGE_PREFIX+'rewards-v2',rewardSettings);safeWrite(catalogRulesKey,true);
}

// Refresh the approved product copy while retaining participant state and layouts.
const productCopyKey=STORAGE_PREFIX+'product-copy-20261022-v25';
if(!safeRead(productCopyKey,false)){
  for(const d of [5,10,15,20]){
    if(!settings[d])continue;
    for(const key of ['name','description','calendarName'])delete settings[d][key];
    if(settings[d].product){for(const key of ['model','color','intro','features','tagline'])delete settings[d].product[key];if(d===20)delete settings[d].product.url;}
  }
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(productCopyKey,true);
}


// Migrate only the known old copy. Custom URLs, product copy and saved layouts stay intact.
const conciseProductCopyKey=STORAGE_PREFIX+'product-copy-concise-v41';
if(!safeRead(conciseProductCopyKey,false)){
  if(settings[20]?.name==='DYSON BP10 航空噴射空氣清淨機 星曜紫')delete settings[20].name;
  if(settings[10]?.description==="輕巧・靈活・極纖細\nDyson PencilVac™ Fluffycones SV50 鉛筆吸塵器\n\n搭載創新四錐全向吸頭，360° 靈活轉向，輕鬆穿梭居家角落，讓清潔更自由、更俐落。")delete settings[10].description;
  if(settings[10]?.product?.intro==="纖細的筆型吸塵器搭配 Fluffycones™ 四錐全向吸頭，靈活穿梭居家空間，整理日常地面。")delete settings[10].product.intro;
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(conciseProductCopyKey,true);
}


// Refresh only known v41 narrative fields. Custom copy, links, artwork and layouts remain.
const snowProductCopyKey=STORAGE_PREFIX+'product-snow-narrative-v42';
if(!safeRead(snowProductCopyKey,false)){
  const oldCopy={"5":{"intro":"輕巧的隨行吹風機，搭配自動電壓調節設計，讓旅行途中也能輕鬆吹整秀髮。","description":"把普魯士藍的 Supersonic™ Travel HD19 放進雪境，收藏一份輕巧的旅行靈感。","color":"普魯士藍"},"10":{"intro":"纖細筆型機身搭配創新 Fluffycones™ 四錐全向吸頭，實現 360° 無死角靈活轉向，讓日常地面清潔更俐落、更自由。","description":"纖細筆型機身搭配創新 Fluffycones™ 四錐全向吸頭，實現 360° 無死角靈活轉向，讓日常地面清潔更俐落、更自由。","color":""},"15":{"intro":"靈感源自航空噴射引擎，以獨特星形噴嘴吹送集中的淨化氣流，每秒輸出空氣380升強勁氣流。","description":"冰川藍的 HushJet™ HJ10，精巧設計，節省空間卻不減性能，為雪境添上一件清新科技收藏。","color":"冰川藍"},"20":{"intro":"融合航空科技與 Dyson 創新氣流技術，打造新一代高效能空氣清淨機，結合強勁送風與高效空氣淨化，為居家空間帶來清新舒適的空氣體驗。","description":"運用航空聲學原理搭配獨創星形噴嘴90秒淨化。","color":""}};
  for(const [day,copy] of Object.entries(oldCopy)){
    const saved=settings[day];if(!saved)continue;
    if(saved.description===copy.description)delete saved.description;
    if(saved.product?.intro===copy.intro)delete saved.product.intro;
    if(Number(day)===20&&saved.product?.color===copy.color)delete saved.product.color;
  }
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(snowProductCopyKey,true);
}


const productCopyV43=STORAGE_PREFIX+'product-copy-v43';
if(!safeRead(productCopyV43,false)){
 const oldCopy={"5":{"intro":"把普魯士藍的 Supersonic™ Travel HD19 放進雪境，收藏一份輕巧的旅行靈感。輕巧機身搭配自動電壓調節與智慧溫控，讓旅行途中也能輕鬆吹整秀髮。","description":"把普魯士藍的 Supersonic™ Travel HD19 放進雪境，收藏一份輕巧的旅行靈感。輕巧機身搭配自動電壓調節與智慧溫控，讓旅行途中也能輕鬆吹整秀髮。"},"10":{"intro":"把 PencilVac™ Fluffycones SV50 放進雪境，收藏一份輕巧、靈活、極纖細的清潔靈感。纖細筆型機身搭配創新 Fluffycones™ 四錐全向吸頭，實現 360° 無死角靈活轉向，讓日常地面清潔更俐落、更自由。","description":"把 PencilVac™ Fluffycones SV50 放進雪境，收藏一份輕巧、靈活、極纖細的清潔靈感。纖細筆型機身搭配創新 Fluffycones™ 四錐全向吸頭，實現 360° 無死角靈活轉向，讓日常地面清潔更俐落、更自由。"},"15":{"intro":"把冰川藍的 HushJet™ HJ10 放進雪境，為聖誕小天地添上一件清新科技收藏。精巧設計節省空間，搭配靈感源自航空噴射引擎的星形噴嘴，每秒輸出 380 升強勁氣流。","description":"把冰川藍的 HushJet™ HJ10 放進雪境，為聖誕小天地添上一件清新科技收藏。精巧設計節省空間，搭配靈感源自航空噴射引擎的星形噴嘴，每秒輸出 380 升強勁氣流。"},"20":{"intro":"把星曜紫的 BP10 放進雪境，收藏一份來自航空科技的清新靈感。運用航空聲學原理與 Dyson 創新氣流技術，搭配獨創星形噴嘴，90 秒淨化，為居家空間帶來清新舒適的空氣體驗。","description":"把星曜紫的 BP10 放進雪境，收藏一份來自航空科技的清新靈感。運用航空聲學原理與 Dyson 創新氣流技術，搭配獨創星形噴嘴，90 秒淨化，為居家空間帶來清新舒適的空氣體驗。"}};
 for(const [day,copy] of Object.entries(oldCopy)){const saved=settings[day];if(!saved)continue;if(saved.description===copy.description)delete saved.description;if(saved.product?.intro===copy.intro)delete saved.product.intro;}
 if(settings[10]){if(['PencilVac鉛筆吸塵器','PencilVac 鉛筆吸塵器'].includes(settings[10].name))delete settings[10].name;if(['Dyson PencilVac™ Fluffycones SV50 鉛筆吸塵器','PencilVac™ Fluffycones SV50 鉛筆吸塵器'].includes(settings[10].product?.detailTitle))delete settings[10].product.detailTitle;}
 safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(productCopyV43,true);
}

// Refresh the two replaced collectibles without changing participant progress or layouts.
// Restore only the uploaded artwork; retain claims, placements and participant layouts.
const SEASONAL_ARTWORK_DAYS=[12,19];
const seasonalArtworkCopyKey=STORAGE_PREFIX+'seasonal-artwork-'+BASE_CONFIG.seasonalArtworkRevision;
if(!safeRead(seasonalArtworkCopyKey,false)){
  if(settings[19])delete settings[19].description;
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(seasonalArtworkCopyKey,true);
}
const RESTORED_ARTWORK_DAYS=[3,6,7,8];
const restoredCopyKey=STORAGE_PREFIX+'restored-artwork-'+BASE_CONFIG.restoredArtworkRevision;
if(!safeRead(restoredCopyKey,false)){
  if(settings[8])for(const k of ['description','assetNeed'])delete settings[8][k];
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(restoredCopyKey,true);
}
const CONTENT_REPLACED_DAYS=[4,11];
const contentCopyKey=STORAGE_PREFIX+'collection-content-'+BASE_CONFIG.collectionContentRevision;
if(!safeRead(contentCopyKey,false)){
  const formerLayouts={4:{x:874,y:800,h:210},11:{x:862,y:850,h:154}};
  for(const d of CONTENT_REPLACED_DAYS){
    if(!settings[d])continue;
    for(const k of ['name','calendarName','type','description','hint','assetNeed','sourceDay','atlas'])delete settings[d][k];
    const old=formerLayouts[d],layout=settings[d].layout;
    if(layout&&layout.x===old.x&&layout.y===old.y&&layout.h===old.h)delete settings[d].layout;
  }
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(contentCopyKey,true);
}
const DEER_PAPER_DAYS=[8,11];
const deerPaperCopyKey=STORAGE_PREFIX+'deer-paper-copy-'+BASE_CONFIG.deerPaperRevision;
if(!safeRead(deerPaperCopyKey,false)){
  for(const d of DEER_PAPER_DAYS){if(settings[d])for(const k of ['description','assetNeed'])delete settings[d][k];}
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(deerPaperCopyKey,true);
}
// Refresh only regenerated scene artwork; preserve participant claims, layouts and other assets.
const HOLIDAY_ACCENT_DAYS=[2,12,14];
const FRONT_FACING_ARTWORK_DAYS=[18,21];
const PAPER_SCENERY_DAYS=[2, 3, 4, 6, 7, 8, 9, 11, 12, 14, 16, 17, 18, 19, 21, 22, 24];
const SCENE_REPLACED_DAYS=[8,16,19];
const sceneCopyKey=STORAGE_PREFIX+'scene-copy-'+BASE_CONFIG.sceneRevision;
if(!safeRead(sceneCopyKey,false)){
  for(const d of [...SCENE_REPLACED_DAYS,13])delete settings[d];
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(sceneCopyKey,true);
}

const stockingCopyKey=STORAGE_PREFIX+'stocking-row-v27';
if(!safeRead(stockingCopyKey,false)){delete settings[16];safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(stockingCopyKey,true);}
// Refresh only collection copy and obsolete uploaded art, retaining claims and layouts.
const PAPER_COLLECTION_DAYS=[8,21,23,...BONUS_IDS];
const paperCollectionCopyKey=STORAGE_PREFIX+'paper-collection-'+BASE_CONFIG.paperCollectionRevision;
if(!safeRead(paperCollectionCopyKey,false)){
  for(const d of PAPER_COLLECTION_DAYS){if(settings[d])for(const k of ['name','calendarName','description','animal','assetNeed'])delete settings[d][k];}
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(paperCollectionCopyKey,true);
}
const CAT_COLLECTION_DAYS=[23,104];
const catCopyKey=STORAGE_PREFIX+'cat-copy-'+BASE_CONFIG.catRevision;
if(!safeRead(catCopyKey,false)){
  for(const d of CAT_COLLECTION_DAYS){if(settings[d])for(const k of ['name','calendarName','description','animal'])delete settings[d][k];}
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(catCopyKey,true);
}
const CHARACTER_REVISED_DAYS=[23,101,106];
const characterCopyKey=STORAGE_PREFIX+'character-copy-'+BASE_CONFIG.characterRevision;
if(!safeRead(characterCopyKey,false)){
  for(const d of CHARACTER_REVISED_DAYS){if(settings[d])for(const k of ['name','calendarName','description','animal'])delete settings[d][k];}
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(characterCopyKey,true);
}
const PLAIN_COAT_DAYS=[102,109];
const plainCoatCopyKey=STORAGE_PREFIX+'plain-coat-'+BASE_CONFIG.plainCoatRevision;
if(!safeRead(plainCoatCopyKey,false)){
  for(const d of [...PLAIN_COAT_DAYS,107]){if(settings[d])for(const k of ['name','calendarName','description','animal'])delete settings[d][k];}
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(plainCoatCopyKey,true);
}
// Replace only previously published sea lion names, preserving custom copy and state.
if(settings[107]){
  let renamed=false;
  for(const key of ['name','animal'])if(['雪白小海獅','白色小海獅','不想上班小海獅'].includes(settings[107][key])){delete settings[107][key];renamed=true;}
  if(renamed)safeWrite(STORAGE_PREFIX+'config',settings);
}
// Short category names only; playful collection titles and permissions stay intact.
for(const [d,oldLabel] of [[104,'灰色英短'],[107,'又想回家小海獅']]){
  if(settings[d]?.animal===oldLabel){delete settings[d].animal;safeWrite(STORAGE_PREFIX+'config',settings);}
}
// Refresh the published penguin description without touching layout or custom text.
if(settings[106]?.description==='灰白紙雕的小皇帝企鵝幼鳥，沒有裝飾花紋與上勾眼角，張開翅膀開心滑行。'){
  delete settings[106].description;safeWrite(STORAGE_PREFIX+'config',settings);
}
const animalSizeCopyKey=STORAGE_PREFIX+'animal-size-'+BASE_CONFIG.animalSizeRevision;
if(!safeRead(animalSizeCopyKey,false)){
  const oldHeights={"8":205,"11":140,"23":200,"101":205,"102":155,"103":220,"104":155,"105":175,"106":135,"108":210,"109":170,"110":185};
  for(const [d,h] of Object.entries(oldHeights))if(settings[d]?.layout?.h===h)settings[d].layout.h=BASE_CONFIG.items.concat(bonusCatalog).find(i=>i.day===Number(d)).layout.h;
  if(settings[23])for(const key of ['name','calendarName'])if(settings[23][key]==='橘貓版聖誕老公公')delete settings[23][key];
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(animalSizeCopyKey,true);
}
// Refresh only the former default store size; preserve participant positions and scale.
const departmentStoreSizeKey=STORAGE_PREFIX+'department-store-'+BASE_CONFIG.departmentStoreRevision;
if(!safeRead(departmentStoreSizeKey,false)){
  if(settings[21]?.layout?.h===178){settings[21].layout.h=BASE_CONFIG.items.find(i=>i.day===21).layout.h;safeWrite(STORAGE_PREFIX+'config',settings);}
  safeWrite(departmentStoreSizeKey,true);
}
// Refresh formerly exported defaults; participant positions remain untouched.
const treeDefaultsKey=STORAGE_PREFIX+'tree-star-centred-v38';
if(!safeRead(treeDefaultsKey,false)){
  for(const [day,x,y] of [[12,646,793],[24,646,327]]){
    const layout=settings[day]?.layout,base=BASE_CONFIG.items.find(i=>i.day===day).layout;
    if(layout&&layout.x===x&&layout.y===y){layout.x=base.x;layout.y=base.y;}
  }
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(treeDefaultsKey,true);
}
// Refresh only former published defaults; retain custom positions and scale.
const treeMusicUpdateKey=STORAGE_PREFIX+'tree-music-'+BASE_CONFIG.treeArtworkRevision;
if(!safeRead(treeMusicUpdateKey,false)){
  for(const [d,oldHeight] of [[12,455],[17,110]])if(settings[d]?.layout?.h===oldHeight)settings[d].layout.h=BASE_CONFIG.items.find(i=>i.day===d).layout.h;
  if(settings[24]?.description=== '加入獨立懸掛金星，可吸附至已收藏的樹頂，另解鎖慢版《Jingle Bells》旋律。')delete settings[24].description;
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(treeMusicUpdateKey,true);
}
const starCopyKey=STORAGE_PREFIX+'star-copy-'+BASE_CONFIG.starArtworkRevision;
if(!safeRead(starCopyKey,false)){
  const oldDescriptions=['加入獨立懸掛金星，可吸附至已收藏的樹頂，為雪境點上一顆平安夜金星。','加入獨立懸掛金星，可吸附至已收藏的樹頂，另解鎖慢版《Jingle Bells》旋律。'];
  if(oldDescriptions.includes(settings[24]?.description))delete settings[24].description;
  safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(starCopyKey,true);
}
let previewDate=null,selectedDay=null,currentModalDay=null,editMode=false;
let campaignStarted=false;
function analyticsAllowed(){return !previewDate&&!$('studio-dialog')?.open;}
function trackActivity(name,params={}){if(!analyticsAllowed())return false;try{return window.DysonAnalytics?.track(name,params)===true;}catch{return false;}}
function giftAnalytics(d){const i=itemByDay(Number(d));return i?{gift_day:Number(d),gift_name:i.name,gift_type:i.product?'product':Number(d)>25?'animal':i.effect?'effect':'scenery',...(i.product?{product_model:i.product.model}:{})}:{};}
function trackCampaignStart(){if(!campaignStarted&&trackActivity('campaign_start'))campaignStarted=true;}

let motion=!window.matchMedia('(prefers-reduced-motion: reduce)').matches,sound=false,wind=false;
let sceneReady=false,width=0,height=0,lastFrame=0,turbulence=0,showUntil=0;
let assetDb=null,assetStorage='memory',assetUploadDay=null,drag=null;
const builtinAssets=new Map(),customAssets=new Map(),sprites=new Map(),spriteErrors=new Set();
const canvas=$('snow-canvas'),ctx=canvas.getContext('2d');
const SCENE_W=1168,SCENE_H=1346;
const imageLoad=src=>new Promise((resolve,reject)=>{const i=new Image();if(/^https?:/i.test(src))i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('圖片無法讀取，請改用本機上傳或可跨來源讀取的圖片網址。'));i.src=src;});
const state=()=>previewDate?preview:live;
const dateISO=()=>previewDate||Core.taipeiDate(new Date(Date.now()+(cloud.hasClock?cloud.offset:0)));
const today=()=>Core.campaignDay(dateISO(),YEAR);
const itemByDay=d=>BASE_CONFIG.items.find(i=>i.day===Number(d))||bonusCatalog.find(i=>i.day===Number(d));
const bonusDays=()=>cloud.ready?cloud.bonusIds.filter(d=>bonusCatalog.some(i=>i.day===d)):[];
const calendarName=d=>{const i=item(d);return i.teaser?i.name:i.calendarName||i.name;};
const calendarMusic=d=>({7:'Jingle Bells · 輕快版',25:'聖誕祝福旋律'})[d]||'';
function configuredItem(d){const source=itemByDay(d);return {...source,...settings[d],day:source.day,benefit:null,product:source.product?{...source.product,...settings[d]?.product}:null};}
function item(d){
  const value=configuredItem(d);
  if(Number(d)===20&&dateISO()<(BASE_CONFIG.bp10RevealDate||`${YEAR}-12-16`))return {...value,teaser:true,name:'清淨機新品',description:'全新清淨科技，即將揭曉。',hint:'12/16 揭曉清淨機新品，12/20 開放收藏。',product:{...value.product,model:'清淨機新品',color:'',intro:'清淨機新品將於 12/16 揭曉，12/20 開放收藏並解鎖專屬優惠券。',tagline:'清淨新科技，即將揭曉。',features:[],url:''}};
  return value;
}
const configuredRewards=()=>BASE_CONFIG.rewards.map(b=>({...b,...rewardSettings[b.id],id:b.id,unlock:b.unlock,productDay:b.productDay,required:b.required,redemption:b.redemption,...(b.redemption==='counter'?{code:'',approved:true}:{} )}));
const rewards=()=>configuredRewards().map(b=>b.productDay===20&&item(20).teaser?{...b,title:'清淨機新品專屬優惠券',preview:'清淨機新品專屬優惠',conditions:'新品專屬優惠將於 12/16 揭曉。'}:b);
const rewardQualified=(b,p)=>b.unlock==='product'?p.claimedDays.includes(b.productDay):p.visits>=b.required;
const rewardUnlocked=(b,p)=>rewardQualified(b,p)&&(b.redemption==='counter'?(!!previewDate||cloud.ready):cardTaskConfirmed());
function rewardProgress(){
  const t=today(),claimedDays=Object.keys(state().claimed).map(Number).filter(d=>d<=t),count=claimedDays.length,visits=participationDates().length;
  const list=rewards(),progress={count,claimedDays,visits},unlockedCount=list.filter(b=>rewardUnlocked(b,progress)).length,next=list.find(b=>!rewardUnlocked(b,progress))||null;
  return {...progress,unlockedCount,total:list.length,next,unlocked:unlockedCount>0};
}
function rewardProgressLabel(p=rewardProgress()){return `已收藏 ${p.count}／25 · 已參與 ${p.visits}${p.visits<10?'／10':''} 天 · 已解鎖 ${p.unlockedCount}／${p.total} 份禮遇`;}
function nextRewardLabel(p=rewardProgress()){
  if(!cardTaskConfirmed()&&rewards().some(b=>b.unlock==='product'&&rewardQualified(b,p)))return localCardTask()?'優惠已保留，填寫 Email 或完成同步即可領取。':'優惠已保留，製作卡片並下載或分享一次即可領取。';
  if(!p.next)return '五份節慶禮遇已全部解鎖。';
  return p.next.unlock==='product'?`收藏「${item(p.next.productDay).name}」，保留對應優惠，完成一次卡片下載或分享即可領取。`:`再參與 ${Math.max(0,p.next.required-p.visits)} 天，解鎖 Dyson 護照兌換禮。`;
}
const items=()=>BASE_CONFIG.items.map(i=>item(i.day));
const participationDates=()=>Core.participationDates(state().visits,dateISO(),YEAR);
// Only admin preview can test all remaining gifts after the campaign closes.
const claimableToday=()=>previewDate?Math.min(25,today()):today();
const dayState=d=>BONUS_IDS.includes(Number(d))?(bonusDays().includes(Number(d))?'owned':'future'):Core.dayState(d,claimableToday(),state().claimed);
const ownedDays=()=>{const t=today();return Object.keys(state().claimed).map(Number).filter(d=>d<=t).sort((a,b)=>a-b).concat(bonusDays());};
const isPlaced=d=>BONUS_IDS.includes(Number(d))?(bonusDays().includes(Number(d))&&state().placement[d]===true):state().placement[d]===true&&Object.hasOwn(state().claimed,String(d))&&Number(d)<=today();
function persist(){if(previewDate)previewPersist();else{cloudCache();cloudScheduleSave();}}
let statusTimer=null;
function status(message,{persistent=false}={}){
  clearTimeout(statusTimer);$('status').textContent=message;
  if(message&&!persistent)statusTimer=setTimeout(()=>{$('status').textContent='';},5000);
}
function closeDialog(id){const d=$(id);if(d.open)d.close();}
function showDialog(id){const d=$(id);if(!d.open){d.showModal();if(id==='vouchers-dialog')trackActivity('coupon_open',{unlocked_count:rewardProgress().unlockedCount});}}

// Intro media is requested only on the first visit or an explicit replay.
const welcomeSeenKey=STORAGE_PREFIX+'welcome-seen-'+YEAR;
let welcomeTimer=null,welcomeAttempt=0,welcomeCleaned=true,welcomeProgressOnly=false;
function welcomeMessage(message){$('welcome-status').textContent=message;}
async function playWelcome(){
  const video=$('welcome-video'),attempt=++welcomeAttempt;
  if(!video.getAttribute('src')){video.src='./assets/video/welcome.mp4?rev=20261027-5';video.currentTime=0;}
  $('welcome-play').hidden=true;welcomeMessage('正在準備你的聖誕旅程…');
  try{await video.play();if(attempt!==welcomeAttempt||!$('welcome-dialog').open){if(!$('welcome-dialog').open)video.pause();return;}welcomeMessage('靜音播放中 · 可隨時開始收藏');}
  catch{if(attempt!==welcomeAttempt||!$('welcome-dialog').open)return;$('welcome-play').hidden=false;welcomeMessage(video.error?'介紹影片暫時無法播放，可以直接開始收藏。':'點一下播放介紹，或直接開始收藏。');}
}
function openWelcome({progressOnly=false}={}){
  welcomeProgressOnly=progressOnly;$('welcome-dialog').classList.toggle('progress-only',progressOnly);$('welcome-title').textContent=progressOnly?'留住你的聖誕進度':'活動介紹';$('welcome-start').textContent=progressOnly?'保存':'開始收藏';if(!$('progress-email').value)$('progress-email').value=cloud.email;renderCloud();
  $('welcome-dialog').scrollTop=0;if($('welcome-dialog').open)return;
  welcomeCleaned=false;$('welcome-play').textContent='播放介紹';const video=$('welcome-video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=false;
  video.poster='./assets/video/welcome-poster.webp?rev=20261027-5';if(!progressOnly){video.src='./assets/video/welcome.mp4?rev=20261027-5';video.currentTime=0;}else{video.pause();video.removeAttribute('src');video.load();}
  document.body.classList.add('welcome-visible');showDialog('welcome-dialog');
  if(progressOnly)return;
  welcomeTimer=setTimeout(()=>{if($('welcome-dialog').open&&video.readyState<3){$('welcome-play').hidden=false;welcomeMessage('影片載入較慢，可以直接開始收藏。');}},8000);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){$('welcome-play').hidden=false;welcomeMessage('點一下觀看介紹，或直接開始收藏。');}
  else playWelcome();
}
function cleanupWelcome(){if(welcomeCleaned)return;welcomeCleaned=true;++welcomeAttempt;clearTimeout(welcomeTimer);const video=$('welcome-video');video.pause();video.removeAttribute('src');video.load();document.body.classList.remove('welcome-visible');safeWrite(welcomeSeenKey,true);}
function finishWelcome(){cleanupWelcome();closeDialog('welcome-dialog');}
$('welcome-open').addEventListener('click',()=>{openWelcome();$('welcome-dialog').scrollTop=0;});
$('welcome-skip').addEventListener('click',finishWelcome);
$('welcome-start').addEventListener('click',startWelcomeCollection);
$('welcome-play').addEventListener('click',playWelcome);
$('welcome-video').addEventListener('playing',()=>{clearTimeout(welcomeTimer);$('welcome-play').hidden=true;welcomeMessage('靜音播放中 · 可隨時開始收藏');});
$('welcome-video').addEventListener('ended',()=>{const video=$('welcome-video');video.pause();video.removeAttribute('src');video.poster='./assets/video/welcome-poster.webp?rev=20261027-5';video.load();$('welcome-play').textContent='再看一次';$('welcome-play').hidden=false;welcomeMessage('布置屬於你的聖誕雪境。');});
$('welcome-video').addEventListener('error',()=>{if(!$('welcome-dialog').open)return;clearTimeout(welcomeTimer);$('welcome-play').hidden=false;welcomeMessage('介紹影片暫時無法播放，可以直接開始收藏。');});
$('welcome-dialog').addEventListener('cancel',event=>{event.preventDefault();finishWelcome();});
$('welcome-dialog').addEventListener('close',cleanupWelcome);

function chime(){if(!sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ac=chime.context??=new AC();if(ac.state==='suspended')ac.resume();[659.25,830.61,987.77].forEach((hz,k)=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,ac.currentTime+k*.08);g.gain.linearRampToValueAtTime(.035,ac.currentTime+k*.08+.015);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+k*.08+.8);o.connect(g);g.connect(ac.destination);o.start(ac.currentTime+k*.08);o.stop(ac.currentTime+k*.08+.85);});}catch{}}
function describeState(d){return {future:'尚未開啟',current:'可領取',missed:'已錯過',owned:'已收藏'}[dayState(d)];}
function starAboveTreeLayout(star,tree){return {...star,x:tree.x,y:tree.y-tree.h*tree.scale+star.h*star.scale*.48};}
function getLayout(d){
  const def=item(d).layout,saved=state().layouts[d],layout=saved?{...def,...saved}:{...def,scale:1};
  if(Number(d)===24&&!saved&&isPlaced(12))Object.assign(layout,starAboveTreeLayout(layout,getLayout(12)));
  return SCENE_REPLACED_DAYS.includes(Number(d))?constrain(d,layout):layout;
}
function claimDay(d){
  if(!previewDate){
    if(cloud.email)return claimCloud(d);
    if(!Core.claim(live,Number(d),today(),new Date(Date.now()+(cloud.hasClock?cloud.offset:0)).toISOString()))return false;
    if(today()>=1&&today()<=25)live.visits[dateISO()]=true;cloudCache();renderUI();chime();trackActivity('gift_collect',{...giftAnalytics(d),collected_count:Object.keys(live.claimed).length});return true;
  }
  const alreadyUnlocked=rewardProgress().unlockedCount;
  // Re-evaluate the date at the actual click, including clicks across midnight.
  if(dayState(d)!=='current'||!Core.claim(state(),Number(d),claimableToday(),new Date().toISOString())){renderUI();return false;}
  persist();chime();renderUI();const progress=rewardProgress();status(`已收藏「${item(d).name}」。按「放入水晶球內」才會加入場景。${progress.unlockedCount>alreadyUnlocked?`第 ${progress.unlockedCount} 份節慶禮遇已解鎖！可至「我的禮遇」查看。`:''}`);return true;
}
async function openDay(d){
  if(BONUS_IDS.includes(Number(d))&&!bonusDays().includes(Number(d))){status('此 Email 尚未解鎖這份限定收藏。');return;}
  const s=dayState(d);
  if(s==='future'){status(`12/${d} 的驚喜尚未開啟，請在當天回來。`);return;}
  if(s==='missed'){status('活動領取已結束，已收藏的禮物仍可回看與擺放。');return;}
  if(s==='current'&&!(await claimDay(d)))return;
  await ensureItemAssets([Number(d)]);openItem(d);
}
function togglePlacement(d,{fromCollection=false}={}){
  if(!previewDate&&cloud.email&&!cloud.ready&&!cloud.cachedView){status('正在背景找回進度，請稍後再調整。');return;}
  if(dayState(d)!=='owned')return;
  const placed=!isPlaced(d);state().placement[d]=placed;trackActivity('globe_item_change',{...giftAnalytics(d),action:placed?'add':'remove',placed_count:ownedDays().filter(isPlaced).length});
  if(placed&&(Number(d)===24||(Number(d)===12&&isPlaced(24))))state().layouts[24]=starAboveTreeLayout(getLayout(24),getLayout(12));
  if(!placed&&selectedDay===d)selectItem(null);
  if(Number(d)===25&&!placed)stopShow(false);
  persist();renderUI({placementDay:d});if($('item-dialog').open){if(placed&&Number(currentModalDay)===Number(d))closeDialog('item-dialog');else renderItemDialog();}drawFrame(0,performance.now());
  status(`「${item(d).name}」已${placed?'放入':'移出'}水晶球。`);
  if(Number(d)===25&&placed)startShow({scrollToGlobe:!fromCollection});
}
function setPreview(iso){
  if(!canPreview()){status('日期模擬僅供管理測試帳號使用。');return false;}
  if(!new RegExp('^'+YEAR+'-(?:11-30|12-(?:0[1-9]|1[0-9]|2[0-6]))$').test(iso))throw new Error('請選擇活動前一天至活動後一天的日期。');
  previewDate=iso;
  // Visiting one simulated date counts once, independently of available gifts.
  if(Core.campaignDay(iso,YEAR)>=1&&Core.campaignDay(iso,YEAR)<=25)preview.visits[iso]=true;
  previewPersist();$('preview-date').value=iso;$('sim-date').value=iso;selectedDay=null;wind=false;stopShow(false);pauseMusic(true);closeDialog('item-dialog');closeDialog('studio-dialog');renderUI();
  status(Core.campaignDay(iso,YEAR)>25?'正在模擬 12/26：管理測試可領取 1～25 號未收藏禮物，不增加簽到天數；正式活動仍於 12/25 結束。':Core.campaignDay(iso,YEAR)<1?'正在模擬活動開始前，所有禮物尚未開放。':`正在模擬 ${iso.slice(5).replace('-','/')}（台灣時間）。當日及之前的禮物可逐件領取；測試簽到與正式紀錄分開保存。`);
  return true;
}
function exitPreview(){previewDate=null;previewPersist();selectedDay=null;wind=false;stopShow(false);pauseMusic(true);closeDialog('item-dialog');$('quick-sim-panel').hidden=true;renderUI();status('已回到正式日期。正式收藏與測試紀錄分開保存。');}
function fillPreviewTo(iso){
  if(!setPreview(iso))return false;
  const n=claimableToday();if(n<1||n>25){status('請選擇活動期間的日期，才能準備測試收藏。');return false;}
  for(let d=1;d<=n;d++){if(!preview.claimed[d]){preview.claimed[d]={at:`${iso}T04:00:00.000Z`};preview.placement[d]=false;}}
  persist();renderUI();status(`已準備至 12/${n} 的測試收藏，簽到只計目前模擬的日期。請逐件按「放入水晶球內」。`);
}
function clearPreview(){if(!canPreview()){status('日期模擬僅供管理測試帳號使用。');return false;}closeDialog('item-dialog');selectedDay=null;stopShow(false);pauseMusic(true);preview=Core.freshState();previewPersist();renderUI();$('config-status').textContent='已清空測試收藏。正式紀錄與素材保留。';if(previewDate)status('模擬收藏已清空，可重新開啟模擬日期的禮盒。');}
function renderQuickSimulation(){
  const active=!!previewDate;
  $('quick-sim-toggle').textContent=active?`模擬：${previewDate.slice(5).replace('-','/')}`:'模擬日期';
  $('quick-sim-toggle').setAttribute('aria-expanded',String(!$('quick-sim-panel').hidden));
  $('quick-sim-exit').disabled=!active;
  if(active)$('sim-date').value=previewDate;
  $('quick-sim-note').textContent=active&&today()>25?'12/26 管理測試可領取 1～25 號未收藏禮物，不增加簽到天數；正式活動仍於 12/25 結束。':active&&today()<1?'活動尚未開始，所有禮物保持鎖定。':active?'當日及之前的禮物可逐件領取，收藏後再自行放入。每個模擬日期只計一次測試簽到，不影響正式進度。':'選擇日期即開始模擬，依台灣時間開放當日及之前的禮物。';
}
function calendarStateIcon(state){
  const icon=el('span',`calendar-state-icon ${state}`);
  icon.setAttribute('aria-hidden','true');return icon;
}
function renderCalendar(){
  const count=rewardProgress().count,t=today();
  $('today-label').textContent=`${dateISO().slice(5).replace('-','/')} · 台灣${previewDate?' · 模擬':''}`;
  $('progress-count').textContent=`${count} / 25`;$('progress-fill').style.width=`${count/25*100}%`;
  const root=$('calendar-grid');root.replaceChildren();
  for(const i of items()){
    const s=dayState(i.day),b=el('button',`day-cell ${s}${i.product?' product-day':''}`);b.type='button';b.dataset.day=String(i.day);
    const name=calendarName(i.day),music=calendarMusic(i.day);
    const displayState=s==='owned'?(isPlaced(i.day)?'placed':'stored'):s;
    const stateLabel=s==='owned'?(displayState==='placed'?'已領取，已放入水晶球':'已領取，尚未放入水晶球'):describeState(i.day);
    if(s==='owned')b.classList.add(displayState);
    b.setAttribute('aria-label',`12月${i.day}日，${name}${music?`，另有 ${music}`:''}，${stateLabel}，依台灣時間開啟`);
    b.append(el('span','day-number',String(i.day)),el('span','day-name',name));
    if(music){const preview=el('span','day-music');preview.append(el('span','day-music-full',`＋ ${music}`),el('span','day-music-short','＋聖誕旋律'));b.append(preview);}
    b.setAttribute('title',stateLabel);
    if(['future','stored','placed'].includes(displayState))b.append(calendarStateIcon(displayState));
    b.addEventListener('click',()=>openDay(i.day));root.append(b);
  }
  const open=$('today-open');open.disabled=false;
  if(t===0){$('today-kicker').textContent='12/01 開始';$('today-title').textContent='第一場雪';open.textContent='尚未開始';open.disabled=true;}
  else if(t===26){$('today-kicker').textContent='12/01 — 12/25';$('today-title').textContent=previewDate?'全日收藏測試 · 1～25 號可領取':'聖誕倒數已結束';open.textContent='查看收藏';}
  else {const i=item(t),s=dayState(t);$('today-kicker').textContent=`12/${String(t).padStart(2,'0')} 今日驚喜`;$('today-title').textContent=i.name;open.textContent=s==='owned'?'回看收藏':'開啟禮盒';}
  const key=$('calendar-key');key.replaceChildren();
  for(const [s,label] of [['future','日期未到'],['current','可領取'],['stored','已領取・未放入'],['placed','已放入']]){
    const entry=el('span');entry.append(calendarStateIcon(s),el('span','',label));key.append(entry);
  }
}
function renderCollection(){
  const normalRoot=$('collection-grid'),bonusRoot=$('bonus-grid');normalRoot.replaceChildren();bonusRoot.replaceChildren();const days=ownedDays();$('collection-empty').hidden=days.some(d=>d<=25);$('bonus-section').hidden=!bonusDays().length;
  for(const d of days){const root=BONUS_IDS.includes(d)?bonusRoot:normalRoot,i=item(d),card=el('article',`collection-card${i.product?' product-card':''}`),visual=el('button');card.dataset.day=String(d);visual.type='button';visual.setAttribute('aria-label',`查看${i.name}`);const thumb=el('canvas');thumb.width=360;thumb.height=270;drawThumbnail(thumb,d);visual.append(thumb);visual.addEventListener('click',()=>openItem(d));
    const info=el('div','card-info'),date=el('p','card-day',i.bonus?`限定趣味收藏 · ${i.animal||''}`:`DEC ${String(d).padStart(2,'0')}`),heading=el('h3');
    if(i.product){date.append(el('span','product-badge','Dyson 精選'));const open=el('button','card-open',i.name);open.type='button';open.setAttribute('aria-label',`查看${i.name}介紹`);open.addEventListener('click',()=>openItem(d));heading.append(open);}else heading.textContent=i.name;
    info.append(date,heading);
    if(i.product){const tagline=el('p','product-tagline',i.product.tagline||(i.product.features||[]).slice(0,2).join(' · '));tagline.addEventListener('click',()=>openItem(d));info.append(tagline);}
    const btn=el('button','place-button',isPlaced(d)?'移除水晶球內':'放入水晶球內');btn.type='button';btn.setAttribute('aria-pressed',String(isPlaced(d)));btn.addEventListener('click',()=>togglePlacement(d,{fromCollection:true}));info.append(btn);
    card.append(visual,info);root.append(card);
  }
}
function renderBenefits(){
  const progress=rewardProgress(),root=$('benefit-grid');root.replaceChildren();
  for(const b of rewards())root.append(renderRewardCard(b,progress,false));
  $('voucher-count').textContent=String(progress.unlockedCount);
  if($('vouchers-dialog').open)renderVouchers();
}
function updatePlacementUI(d){
  // Keep the clicked button and the list height intact: replacing the collection
  // loses keyboard focus and can invalidate the browser's scroll anchor.
  const placed=isPlaced(d),label=placed?'移除水晶球內':'放入水晶球內';
  const button=$(BONUS_IDS.includes(Number(d))?'bonus-grid':'collection-grid').querySelector(`[data-day="${Number(d)}"] .place-button`);
  if(button){button.textContent=label;button.setAttribute('aria-pressed',String(placed));}
  refreshItemThumbnails(d);
  const cell=$('calendar-grid').querySelector(`[data-day="${Number(d)}"]`);
  if(cell&&dayState(d)==='owned'){
    const stateLabel=placed?'已領取，已放入水晶球':'已領取，尚未放入水晶球',displayState=placed?'placed':'stored',music=calendarMusic(d);
    cell.classList.toggle('placed',placed);cell.classList.toggle('stored',!placed);cell.title=stateLabel;
    cell.setAttribute('aria-label',`12月${d}日，${calendarName(d)}${music?`，另有 ${music}`:''}，${stateLabel}，依台灣時間開啟`);
    const icon=cell.querySelector('.calendar-state-icon');if(icon)icon.className=`calendar-state-icon ${displayState}`;else cell.append(calendarStateIcon(displayState));
  }
}
function renderUI({placementDay=null}={}){
  $('preview-banner').hidden=!previewDate;
  if(placementDay!==null)updatePlacementUI(placementDay);else{renderCalendar();renderCollection();renderBenefits();}
  updateSelection();renderQuickSimulation();renderShowControls();renderMusic();
  $('edit-toggle').setAttribute('aria-pressed',String(editMode));canvas.classList.toggle('editing',editMode);
  $('motion-toggle').setAttribute('aria-pressed',String(motion));$('motion-toggle').textContent=motion?'暫停動態':'開啟動態';
  $('wind-button').setAttribute('aria-pressed',String(wind));$('wind-button').textContent=wind?'暴風雪中':'dyson 氣流';$('wind-button').title=wind?'關閉暴風雪':'開啟暴風雪';$('wind-button').setAttribute('aria-label',`dyson 氣流，暴風雪${wind?'已開啟':'已關閉'}`);
  $('card-open').disabled=!sceneReady||cardCapturing;renderCloud();
}
function collapseSimulation(){$('quick-sim-panel').hidden=true;$('quick-sim-toggle').setAttribute('aria-expanded','false');}
function openItem(d){if(dayState(d)!=='owned')return;collapseSimulation();currentModalDay=d;renderItemDialog();showDialog('item-dialog');trackActivity('gift_view',giftAnalytics(d));}
function renderItemDialog(){
  if(!currentModalDay)return;const i=item(currentModalDay);$('item-day').textContent=i.bonus?'EXCLUSIVE COLLECTION':`DECEMBER ${String(i.day).padStart(2,'0')}`;$('item-kind').textContent=i.product?[i.product.model,i.product.color].filter(Boolean).join(' · '):i.bonus?`限定趣味收藏 · ${i.animal||''}`:i.effect?'雪境效果收藏':'聖誕造景收藏';$('item-title').textContent=(!i.teaser&&i.product?.detailTitle)||i.name;$('item-description').textContent=i.product?i.product.intro:i.description;
  const c=el('canvas');c.width=600;c.height=440;drawThumbnail(c,i.day);$('item-visual').replaceChildren(c);
  renderProduct(i);
  $('item-placement').textContent=isPlaced(i.day)?'移除水晶球內':'放入水晶球內';$('item-placement').setAttribute('aria-pressed',String(isPlaced(i.day)));$('item-position').hidden=!isPlaced(i.day)||((!!i.effect||!!i.fixed)&&i.day!==25);$('item-position').textContent=i.day===25?'重播星光秀':'調整擺放位置';renderMusic();
}
function renderProduct(i){
  const product=i.product;$('item-product').hidden=!product;if(!product)return;
  $('product-features-title').hidden=!product.features?.length;
  const features=$('product-features');features.replaceChildren();for(const f of product.features||[])features.append(el('li','',f));features.hidden=!product.features?.length;
  const link=$('product-link'),url=validatedProductURL(product.url);link.hidden=!url;$('product-link-pending').hidden=!!url;
  if(url)link.href=url;else link.removeAttribute('href');
}
function renderVouchers(){
  const root=$('vouchers-list'),progress=rewardProgress();root.replaceChildren();
  $('vouchers-progress').textContent=rewardProgressLabel(progress);$('vouchers-next').textContent=nextRewardLabel(progress);
  for(const b of rewards()){
    if(b.unlock==='visits')root.append(renderParticipation(progress));
    root.append(renderRewardCard(b,progress,true));
  }
}
function renderParticipation(progress=rewardProgress()){
  const dates=participationDates(),earned=dates.slice(0,10),complete=dates.length>=10;
  const section=el('section',`participation${complete?' complete':''}`);
  section.setAttribute('aria-label','聖誕足跡，累積參與 10 天');
  const heading=el('div','participation-heading');
  heading.append(el('h3','','聖誕足跡'),el('span','participation-count',`${Math.min(10,dates.length)}／10 天`));
  const message=el('p','participation-message',complete?'已集滿 10 天，可至 Dyson 櫃位兌換護照。':`再來 ${10-dates.length} 天，即可至 Dyson 櫃位兌換護照。`);
  const grid=el('ol','participation-grid');grid.setAttribute('aria-label','前 10 次參加日期');
  for(let index=0;index<10;index++){
    const date=earned[index],cell=el('li',`participation-cell${date?' signed':''}`);
    cell.append(el('span','participation-check',date?'✓':String(index+1)),el('span','participation-date',date?date.slice(5).replace('-','/'):`第 ${index+1} 次`));
    cell.setAttribute('aria-label',date?`第 ${index+1} 次，${date} 已簽到`:`第 ${index+1} 次，尚未簽到`);grid.append(cell);
  }
  const note=el('p','participation-note',previewDate?'目前顯示測試簽到，與正式紀錄分開保存。每個模擬日期只計一次。':cloud.ready?'成功載入 Email 進度即自動簽到；同一台灣日期只算一次，不需連續。':'請先輸入 Email 並成功載入進度，即可自動簽到。');
  section.append(heading,message,grid,note);
  if(dates.length>10){
    const extra=el('p','participation-extra',`持續收藏中 · 已參與 ${dates.length} 天`);section.append(extra);
    const details=el('details','participation-history');details.append(el('summary','','查看全部參加日期'),el('p','',dates.map(d=>d.slice(5).replace('-','/')).join('、')));section.append(details);
  }
  return section;
}
function renderRewardCard(b,progress,full){
  if(b.redemption==='counter')return renderCounterReward(b,progress,full);
  const qualified=rewardQualified(b,progress),unlocked=rewardUnlocked(b,progress),waiting=qualified&&!unlocked,isNext=progress.next?.id===b.id,product=b.unlock==='product'?item(b.productDay):null;
  const card=el('article',`${full?'voucher-card':'benefit-card'}${unlocked?' claimed':' locked'}${isNext?' next-reward':''}`);card.dataset.rewardId=b.id;
  const condition=product?`收藏 12/${b.productDay} 產品`:`累積參與 ${b.required} 天`;
  card.setAttribute('aria-label',`${condition}，${unlocked?'已解鎖':'尚未解鎖'}，${unlocked?b.title:b.preview}`);
  if(!full){
    card.classList.add('compact-reward');
    card.append(el('p','reward-coupon-summary',unlocked?b.title:b.preview));
    card.append(el('h3','reward-product-name',product?product.name:condition));
    if(!product)card.append(el('p','reward-participation',`已參與 ${progress.visits}／${b.required} 天`));
    if(waiting)card.append(el('p','reward-task-hint',localCardTask()?'優惠已保留，填寫 Email 或同步後領取':'優惠已保留，製作聖誕卡片即可領取'));
    const button=el('button','',waiting?(localCardTask()?(cloud.ready?'重試同步領優惠':'填寫 Email 領優惠'):'製作卡片領優惠'):'查看我的禮遇');button.type='button';button.addEventListener('click',()=>{if(waiting){if(cloud.ready&&localCardTask())cloudFlush();else startRewardTask();}else{renderVouchers();showDialog('vouchers-dialog');}});card.append(button);
    return card;
  }
  const meta=el('div','reward-meta');meta.append(el('p','benefit-date',condition),el('span','reward-state',unlocked?'已解鎖':waiting?'優惠已保留':isNext?'下一份禮遇':'尚未解鎖'));card.append(meta);
  if(product){
    card.append(el('h3','reward-product-name',product.name));
    if(full){
      const detail=el('div','reward-product');
      if(product.teaser)detail.append(el('div','reward-product-teaser','新品預告'));
      else{const c=el('canvas');c.width=240;c.height=240;c.setAttribute('aria-label',product.name);drawThumbnail(c,b.productDay);detail.append(c);}
      const copy=el('div');copy.append(el('p','reward-product-intro',product.product.intro));
      const url=validatedProductURL(product.product.url);if(url){const a=el('a','product-link','了解產品詳情 ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';copy.append(a);}
      detail.append(copy);card.append(detail);
    }
    card.append(el('h4','reward-coupon-title',unlocked?b.title:b.preview));
  }else{card.append(el('h3','',unlocked?b.title:b.preview),el('p','reward-hint',`已參與 ${progress.visits}／${b.required} 天 · 不需連續`));}
  if(waiting){card.append(el('p','reward-hint',localCardTask()?'卡片任務已完成，填寫 Email 並同步即可領取。':'製作卡片並下載或分享一次，即可領取已達成條件的優惠。'));const button=el('button','gold-button',localCardTask()?'保存進度領優惠':'製作卡片領優惠');button.type='button';button.addEventListener('click',()=>{if(cloud.ready&&localCardTask())cloudFlush();else startRewardTask();});card.append(button);}
  else if(!unlocked)card.append(el('p','reward-hint',product?`收藏「${product.name}」即可保留優惠，完成卡片任務後領取，無須放入水晶球。`:`再參與 ${Math.max(0,b.required-progress.visits)} 個不同台灣日期，即可解鎖。`));
  else if(full){
    card.append(el('p','reward-conditions',b.conditions));
    if(!b.approved||!b.code)card.append(el('p','reward-pending','已解鎖，序號準備中。'));
    else{
      const expired=b.validUntil&&Core.taipeiDate()>b.validUntil;
      if(b.validUntil)card.append(el('p','reward-expiry',`有效至 ${b.validUntil}${expired?' · 已到期':''}`));
      const row=el('div','voucher-code'),code=el('code','',b.code),copy=el('button','','複製序號');copy.type='button';copy.disabled=!!expired;copy.setAttribute('aria-label',`複製${b.title}序號`);copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(b.code);trackActivity('coupon_copy',{coupon_id:b.id});copy.textContent='已複製';}catch{copy.textContent='請選取序號複製';}});row.append(code,copy);card.append(row);
    }
  }else card.append(el('p','reward-hint',b.approved&&b.code?'產品禮遇已揭曉，前往查看序號。':'禮遇已解鎖，序號準備中。'));
  if(!full){const button=el('button','',unlocked?'查看我的禮遇':'查看產品與進度');button.type='button';button.addEventListener('click',()=>{renderVouchers();showDialog('vouchers-dialog');});card.append(button);}
  return card;
}
function renderCounterReward(b,progress,full){
  const qualified=rewardQualified(b,progress),unlocked=rewardUnlocked(b,progress),card=el('article',`${full?'voucher-card':'benefit-card compact-reward'} passport-reward${unlocked?' claimed':' locked'}`);
  card.dataset.rewardId=b.id;card.setAttribute('aria-label',`累積參與 ${b.required} 天，${unlocked?'兌換資格已解鎖':'尚未解鎖'}，${b.title}`);
  const meta=el('div','reward-meta');meta.append(el('p','benefit-date',`累積參與 ${b.required} 天`),el('span','reward-state',unlocked?'可至櫃位兌換':'集滿10天解鎖'));card.append(meta);
  const visual=el('div','passport-visual'),image=el('img');image.src=ASSETS.rewardImages.passport;image.alt='Dyson 護照，封面印有吹風機與飛機圖案';image.loading='lazy';image.width=1080;image.height=1080;visual.append(image);card.append(visual,el('h3','reward-product-name',b.title),el('p','reward-participation',`已參與 ${progress.visits}／${b.required} 天 · 不需連續`));
  if(full){card.append(el('p','reward-conditions',b.conditions));
    if(unlocked)card.append(el('p','passport-eligible','兌換資格已解鎖，請至 Dyson 櫃位出示此畫面兌換護照。'));
    else if(qualified){const button=el('button','gold-button','保存進度查看兌換資格');button.type='button';button.addEventListener('click',openProgress);card.append(button);}
    else card.append(el('p','reward-hint',`再參與 ${Math.max(0,b.required-progress.visits)} 個不同台灣日期，即可取得護照兌換資格。`));
  }else{const button=el('button','','查看護照禮與集點進度');button.type='button';button.addEventListener('click',()=>{renderVouchers();showDialog('vouchers-dialog');});card.append(button);}
  return card;
}
function validatedProductURL(value){
  const text=String(value||'').trim();if(!text)return '';try{const url=new URL(text);if(url.protocol!=='https:')return '';return url.href;}catch{return '';}
}
function loadSprite(d){
  d=Number(d);
  const i=item(d);if(i.effect)return null;
  const image=customAssets.get(d)?.image||builtinAssets.get(d);
  if(!image&&(ASSETS.sprites?.[d]||ASSETS.bonusSprites?.[d])){if(!itemAssetLoads.has(Number(d))&&!spriteErrors.has('asset-'+d))ensureItemAssets([Number(d)]).then(()=>{if(sceneReady&&builtinAssets.has(Number(d))){renderUI();if($('item-dialog').open)renderItemDialog();drawFrame(0,performance.now());}});return null;}
  if(i.bonus&&!image)return null;
  // A cached raster belongs to its actual source, not just a calendar day.
  if(!image){spriteErrors.add('missing-source-'+d);return null;}
  const cached=sprites.get(d);
  if(cached&&cached.sourceImage===image)return cached;
  sprites.delete(d);
  const out=el('canvas'),oc=out.getContext('2d');
  out.width=image.naturalWidth;out.height=image.naturalHeight;oc.drawImage(image,0,0);
  let bounds={x:0,y:0,w:out.width,h:out.height};
  try{const pixels=oc.getImageData(0,0,out.width,out.height).data;let minX=out.width,minY=out.height,maxX=-1,maxY=-1;
    for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++){if(pixels[(y*out.width+x)*4+3]>48){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
    if(maxX>=minX)bounds={x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};
  }catch(error){spriteErrors.add(`${d}: ${error.message}`);}
  const sprite={image:out,bounds,sourceImage:image};sprites.set(d,sprite);return sprite;
}
const itemAssetLoads=new Map();
async function ensureItemAssets(days){
 await Promise.all([...new Set(days.map(Number))].map(d=>{
  if(builtinAssets.has(d)||spriteErrors.has('asset-'+d))return;if(itemAssetLoads.has(d))return itemAssetLoads.get(d);
  if(BONUS_IDS.includes(d)&&!bonusDays().includes(d))return;
  const src=ASSETS.sprites?.[d]||ASSETS.bonusSprites?.[d]||ASSETS.effectThumbnails?.[d];if(!src)return;
  const promise=imageLoad(src).then(image=>{builtinAssets.set(d,image);sprites.delete(d);refreshItemThumbnails(d);}).catch(error=>{spriteErrors.add('asset-'+d);spriteErrors.add(`item-${d}: ${error.message}`);}).finally(()=>itemAssetLoads.delete(d));itemAssetLoads.set(d,promise);return promise;
 }));
}
async function loadBonusAssets(){return ensureItemAssets(bonusDays());}
function drawSprite(target,d,x,bottom,h){const sprite=loadSprite(d);if(!sprite)return null;const b=sprite.bounds,w=h*b.w/b.h;target.drawImage(sprite.image,b.x,b.y,b.w,b.h,x-w/2,bottom-h,w,h);return {x:x-w/2,y:bottom-h,w,h};}
function refreshItemThumbnails(d){
  for(const target of document.querySelectorAll(`canvas[data-thumbnail-day="${Number(d)}"]`))drawThumbnail(target,Number(d));
}
function drawThumbnail(target,d){
  d=Number(d);target.dataset.thumbnailDay=String(d);
  const c=target.getContext('2d');c.clearRect(0,0,target.width,target.height);const i=item(d);
  if(i.effect){const image=builtinAssets.get(Number(d));if(image&&ASSETS.effectThumbnails?.[d]){const scale=Math.min(target.width*.86/image.naturalWidth,target.height*.86/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;c.drawImage(image,(target.width-w)/2,(target.height-h)/2,w,h);return;}if(!image&&ASSETS.effectThumbnails?.[d]&&!itemAssetLoads.has(Number(d))&&!spriteErrors.has('asset-'+d))ensureItemAssets([Number(d)]).then(()=>{if(sceneReady&&builtinAssets.has(Number(d))){renderUI();if($('item-dialog').open)renderItemDialog();}});c.save();c.fillStyle='#e2c48e';c.textAlign='center';c.textBaseline='middle';c.font=`${Math.round(target.height*.35)}px Georgia,serif`;c.fillText(i.effect==='snow'?'❄':i.effect==='goldSnow'?'✧':i.effect==='warmth'?'✺':'✦',target.width/2,target.height/2);c.restore();return;}
  const s=loadSprite(d);if(!s)return;const b=s.bounds;let h=target.height*.84;if(h*b.w/b.h>target.width*.86)h=target.width*.86*b.h/b.w;drawSprite(c,d,target.width/2,target.height*.92,h);
}
function globePath(c){c.beginPath();c.moveTo(322,890);c.bezierCurveTo(193,774,153,538,248,355);c.bezierCurveTo(332,197,486,157,622,158);c.bezierCurveTo(833,155,1000,304,1046,504);c.bezierCurveTo(1076,659,1014,824,941,891);c.bezierCurveTo(796,936,464,938,322,890);c.closePath();}
const SCENE_VIEW={zoom:1.08,shiftX:-.038};
const SHOW_SECONDS=9.5;
const SHOW_LIVE={duration:9.5,introEnd:2.5,drawEnd:5,holdEnd:6};
const SHOW_CARD={duration:5,introEnd:1,drawEnd:2.8,holdEnd:3.4};
function showState(elapsed,timeline=SHOW_LIVE){
  const clamp=n=>Math.max(0,Math.min(1,n));
  return {fade:clamp(elapsed/.45)*clamp((timeline.duration-elapsed)/.55),
    signature:clamp((elapsed-timeline.introEnd)/(timeline.drawEnd-timeline.introEnd)),
    signatureAlpha:clamp((elapsed-timeline.introEnd)/.2)*clamp((timeline.holdEnd+.25-elapsed)/.25),
    greeting:clamp((elapsed-timeline.holdEnd)/.4),
    phase:elapsed<timeline.introEnd?'暖光與星光':elapsed<timeline.drawEnd?'dyson 星光描繪':elapsed<timeline.holdEnd?'品牌星光':'聖誕祝福'};
}
const brandLetters=(ASSETS.brandMark?.letters||[]).map(letter=>{
  let length=0;
  const contours=letter.paths.map(points=>({points,segments:points.slice(1).map((b,k)=>{const a=points[k],size=Math.hypot(b[0]-a[0],b[1]-a[1]),start=length;length+=size;return {a,b,size,start,end:length};})}));
  return {...letter,contours,length};
});
const makeFlake=gold=>({x:245+Math.random()*770,y:195+Math.random()*700,vx:0,vy:.35+Math.random()*.8,size:gold?1+Math.random()*2.2:(Math.random()<.8?.7+Math.random()*1.4:2.1+Math.random()*1.3),phase:Math.random()*Math.PI*2,depth:.45+Math.random()*.8,gold});
const snow=Array.from({length:420},()=>makeFlake(false));
const goldFlakes=Array.from({length:460},()=>makeFlake(true));
const stars=Array.from({length:36},(_,k)=>({x:295+Math.random()*665,y:255+Math.random()*565,phase:Math.random()*Math.PI*2,size:k%5===0?8:3+Math.random()*3}));
let hitRegions=[],showStarted=0,showPausedAt=null;
let frameEffects={white:0,gold:0,warmth:false,show:false,phase:''};
function showActive(now=performance.now()){return isPlaced(25)&&showUntil>now;}
function stopShow(resume=false){
  showUntil=0;showStarted=0;showPausedAt=null;$('show-banner').hidden=true;$('show-greeting').hidden=true;
  finishShowMusic(resume);renderShowControls();
}
function startShow({scrollToGlobe=true}={}){
  if(!isPlaced(25))return false;
  closeDialog('item-dialog');collapseSimulation();editMode=false;selectItem(null);
  showStarted=performance.now();showUntil=showStarted+SHOW_SECONDS*1000;showPausedAt=null;
  startShowMusic();renderUI({placementDay:25});drawFrame(0,showStarted);trackActivity('starlight_show',{action:'play'});
  if(scrollToGlobe)$('globe-wrapper').scrollIntoView({behavior:motion?'smooth':'auto',block:'center'});
  status(motion?'聖誕星光秀開始，9.5 秒後緩緩收尾。可隨時停止或重播。':'動態已暫停，顯示靜態聖誕星光畫面。');return true;
}
function renderShowControls(){
  const placed=isPlaced(25),active=showActive();
  $('show-controls').hidden=!placed;$('show-replay').textContent=active?'重新播放星光秀':'播放星光秀';$('show-stop').hidden=!active;
  if(!active){$('show-banner').hidden=true;$('show-greeting').hidden=true;}
}
function starShape(c,x,y,r,alpha=1,rotation=0){
  c.save();c.translate(x,y);c.rotate(rotation);c.globalAlpha*=alpha;
  const points=[[0,-r],[r*.2,-r*.2],[r,0],[r*.2,r*.2],[0,r],[-r*.2,r*.2],[-r,0],[-r*.2,-r*.2]];
  for(let k=0;k<points.length;k++){c.fillStyle=k%2===0?'#efdfbb':'#bc955f';c.beginPath();c.moveTo(0,0);c.lineTo(...points[k]);c.lineTo(...points[(k+1)%points.length]);c.closePath();c.fill();}
  c.restore();
}
let glowStamp=null;
function softGlow(x,y,r,opacity,target=ctx){
  const ctx=target;
  if(!glowStamp){glowStamp=el('canvas');glowStamp.width=glowStamp.height=160;const c=glowStamp.getContext('2d'),g=c.createRadialGradient(80,80,0,80,80,80);g.addColorStop(0,'rgba(255,218,143,1)');g.addColorStop(.28,'rgba(255,177,74,.48)');g.addColorStop(1,'rgba(255,162,56,0)');c.fillStyle=g;c.fillRect(0,0,160,160);}
  ctx.save();ctx.globalAlpha*=opacity;ctx.drawImage(glowStamp,x-r,y-r,r*2,r*2);ctx.restore();
}
function drawWarmth(time,strength=1,target=ctx,animate=motion){
  const ctx=target;
  ctx.save();ctx.globalCompositeOperation='screen';
  const breath=animate ? .9+Math.sin(time*1.3)*.1:1;
  softGlow(625,680,410,.32*strength*breath,ctx);softGlow(430,735,160,.22*strength,ctx);softGlow(835,690,190,.20*strength,ctx);
  ctx.restore();
}
function drawSnowLayer(pool,count,dt,time,show=false,target=ctx,environment=null){
  const ctx=target,airflow=environment?environment.wind:wind,shakePower=environment?environment.turbulence:turbulence,activeSnow=environment?environment.activeSnow:isPlaced(1),random=environment?.random||Math.random;
  for(let k=0;k<count;k++){
    const p=pool[k];
    if(dt){
      p.phase+=.014*dt;p.x+=(p.vx+Math.sin(p.phase)*(.2+shakePower*.35)+(airflow?(10.5+Math.sin(time*1.8+p.phase)*3)*p.depth:0))*dt;
      p.y+=p.vy*p.depth*dt;
      if(airflow)p.vy=Math.min(8,p.vy+.16*dt);else if(shakePower>.1)p.vy=Math.min(3.6,p.vy+.025*dt);else p.vy=.45+p.depth*.45;
      p.vx*=Math.pow(.992,dt);
      if(airflow&&p.x>1025){p.x=235;p.y=205+random()*680;p.vx=0;}else if(p.x<225||p.x>1025){p.vx*=-.5;p.x=Math.max(225,Math.min(1025,p.x));}
      if(p.y>(!p.gold&&activeSnow?snowSurface(p.x,environment?environment.snowDepth:snowPack.depth):902)){p.y=205+random()*60;p.x=300+random()*650;p.vy=.5+random()*.7;p.vx=0;}
      if(p.y<185){p.y=185;p.vy=Math.abs(p.vy)*.5;}
    }
    if(environment?.advanceOnly)continue;
    const alpha=p.gold?.6+Math.sin(time*2+p.phase)*.23:.44+p.depth*.29;
    ctx.fillStyle=p.gold?`rgba(230,199,143,${alpha})`:`rgba(247,239,221,${Math.min(.94,alpha)})`;
    const flakeSize=p.size*(airflow&&!p.gold?(k%11===0?1.85:1.4):1);
    ctx.beginPath();
    if(!p.gold&&k%7===0){const size=flakeSize*p.depth,dx=Math.cos(p.phase)*size,dy=Math.sin(p.phase)*size;ctx.moveTo(p.x-dx,p.y-dy);ctx.lineTo(p.x-dy,p.y+dx);ctx.lineTo(p.x+dx,p.y+dy);ctx.lineTo(p.x+dy,p.y-dx);ctx.closePath();}
    else ctx.ellipse(p.x,p.y,flakeSize*p.depth,flakeSize*p.depth*(p.gold?.9:.7),p.phase,0,Math.PI*2);
    ctx.fill();
    if(airflow&&!p.gold&&k%3===0){
      const length=5+p.depth*8;ctx.save();ctx.strokeStyle='rgba(250,251,255,.46)';ctx.lineWidth=Math.max(.8,flakeSize*.6);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x-length,p.y-length*.45);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();
    }
    if(p.gold&&k%13===0)starShape(ctx,p.x,p.y,p.size*2.8,alpha*.85,p.phase*.12);
    if(!p.gold&&k%27===0){ctx.save();ctx.strokeStyle='rgba(255,255,255,.72)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p.x-3,p.y);ctx.lineTo(p.x+3,p.y);ctx.moveTo(p.x,p.y-3);ctx.lineTo(p.x,p.y+3);ctx.stroke();ctx.restore();}
  }
}
function drawChristmasTree(progress,time,target=ctx,opacity=1){
  if(progress<=0||opacity<=0)return;
  const points=[[625,355],[590,425],[607,425],[558,492],[580,492],[518,564],[549,564],[478,642],[523,642],[438,730],[600,730],[600,779],[650,779],[650,730],[812,730],[727,642],[772,642],[701,564],[732,564],[670,492],[692,492],[643,425],[660,425],[625,355]];
  const segments=points.slice(1).map((p,i)=>({a:points[i],b:p,length:Math.hypot(p[0]-points[i][0],p[1]-points[i][1])}));
  let remaining=segments.reduce((n,p)=>n+p.length,0)*Math.min(1,progress),head=points[0];
  target.save();target.globalAlpha*=opacity;target.strokeStyle='#ffe5aa';target.lineWidth=4;target.lineCap='round';target.lineJoin='round';target.shadowColor='#ffc66c';target.shadowBlur=15;
  target.beginPath();target.moveTo(...points[0]);
  for(const segment of segments){const f=Math.max(0,Math.min(1,remaining/segment.length));if(!f)break;head=[segment.a[0]+(segment.b[0]-segment.a[0])*f,segment.a[1]+(segment.b[1]-segment.a[1])*f];target.lineTo(...head);remaining-=segment.length;if(f<1)break;}
  target.stroke();starShape(target,...head,8,.96,time*.2);
  if(progress>.7){target.globalAlpha*=Math.min(1,(progress-.7)/.3);for(let k=0;k<13;k++){const y=445+k*21,spread=(y-355)*.35,x=625+Math.sin(k*2.4)*spread;starShape(target,x,y,k%3===0?8:5,.85+.12*Math.sin(time*3+k),time*.12);}starShape(target,625,345,30,.98);}
  target.restore();
}
// Geometric, round-ended lettering shares the brand animation's gold glow.
// Custom paths avoid depending on an unavailable proprietary logo typeface.
const FESTIVE_GLYPHS={
 M:'M 0 48 L 0 0 L 17 25 L 34 0 L 34 48',
 E:'M 32 0 L 0 0 L 0 48 L 32 48 M 0 24 L 27 24',
 R:'M 0 48 L 0 0 L 17 0 C 39 0 39 24 17 24 L 0 24 M 17 24 L 34 48',
 Y:'M 0 0 L 17 24 L 34 0 M 17 24 L 17 48',
 C:'M 34 6 C 23 -5 0 -2 0 24 C 0 50 23 53 34 42',
 H:'M 0 0 L 0 48 M 34 0 L 34 48 M 0 24 L 34 24',
 I:'M 17 0 L 17 48',
 S:'M 32 5 C 15 -6 -3 2 1 15 C 5 27 33 20 33 35 C 33 50 12 53 0 43',
 T:'M 0 0 L 34 0 M 17 0 L 17 48',
 A:'M 0 48 L 17 0 L 34 48 M 7 30 L 27 30'
};
const festivePaths=Object.fromEntries(Object.entries(FESTIVE_GLYPHS).map(([letter,path])=>[letter,new Path2D(path)]));
let festiveStamp=null;
function drawMerryChristmas(target,alpha=1,time=0){
  if(alpha<=0)return;
  target.save();target.globalAlpha*=Math.min(1,alpha);
  const glow=target.createRadialGradient(625,505,30,625,505,330);glow.addColorStop(0,'rgba(9,17,31,.85)');glow.addColorStop(1,'rgba(9,17,31,0)');target.fillStyle=glow;target.fillRect(295,175,660,660);
  if(!festiveStamp){
    festiveStamp=el('canvas');festiveStamp.width=750;festiveStamp.height=140;const lettering=festiveStamp.getContext('2d');
    const text='MERRY CHRISTMAS',advance=letter=>letter===' '?30:letter==='I'?22:47,total=[...text].reduce((sum,letter)=>sum+advance(letter),0)-13,scale=630/(total+8);
    lettering.translate(375-total*scale/2,70-24*scale);lettering.scale(scale,scale);lettering.strokeStyle='#eac58a';lettering.lineWidth=7.5;lettering.lineCap='round';lettering.lineJoin='round';lettering.shadowColor='#f8ce88';lettering.shadowBlur=8;
    for(const letter of text){if(festivePaths[letter]){lettering.save();if(letter==='I')lettering.translate(-12.5,0);lettering.stroke(festivePaths[letter]);lettering.restore();}lettering.translate(advance(letter),0);}
  }
  target.drawImage(festiveStamp,250,435);
  for(let k=0;k<8;k++){const a=k*Math.PI/4;starShape(target,625+Math.cos(a)*350,505+Math.sin(a)*95,k%2?5:8,.6+.3*Math.sin(time*2+k)**2,a);}
  target.restore();
}
// One ribbon and a few cached glows keep the introduction light.
function drawStarShow(elapsed,time,target=ctx,animate=motion,timeline=SHOW_LIVE){
  const phase=showState(elapsed,timeline),rise=animate?Math.min(1,elapsed/timeline.introEnd):1;
  target.save();target.globalAlpha*=animate?phase.fade:1;
  softGlow(625,350,125,.5,target);starShape(target,625,350,animate?22+rise*13:35,.9);
  const ribbonAlpha=animate?Math.max(0,1-(elapsed-timeline.introEnd)/.6):.3;
  if(ribbonAlpha>0){
    target.save();target.globalAlpha*=ribbonAlpha;target.strokeStyle='#f1d294';target.lineWidth=3;target.lineCap='round';target.beginPath();
    let first=true;for(let k=0;k<=48;k++){const u=k/48;if(u>rise)break;const angle=u*Math.PI*3.4+elapsed*.4,radius=245*(1-u*.66),x=625+Math.cos(angle)*radius,y=855-u*505;
      if(first){target.moveTo(x,y);first=false;}else target.lineTo(x,y);
    }target.stroke();
    for(let k=0;k<8;k++){const u=k/8;if(u>rise)continue;const angle=u*Math.PI*3.4+elapsed*.4,radius=245*(1-u*.66);starShape(target,625+Math.cos(angle)*radius,855-u*505,4,.75);}
    target.restore();
  }
  target.restore();
}
function signatureProgress(elapsed){return motion?showState(elapsed).signature:1;}
const signatureStamps=new Map();
function signatureStamp(index){
  if(signatureStamps.has(index))return signatureStamps.get(index);
  const letter=brandLetters[index],c=el('canvas');c.width=420;c.height=240;const x=c.getContext('2d');x.scale(5,5);x.translate(5,5);x.fillStyle='#eac58a';x.strokeStyle='#ffe8b7';x.lineWidth=.34;x.beginPath();
  for(const contour of letter.contours){x.moveTo(...contour.points[0]);for(const pt of contour.points.slice(1))x.lineTo(...pt);x.closePath();}x.fill('evenodd');x.stroke();signatureStamps.set(index,c);return c;
}
function drawDysonSignature(elapsed,target=ctx,animate=motion,timeline=SHOW_LIVE){
  const phase=showState(elapsed,timeline),progress=animate?phase.signature:1,opacity=animate?phase.signatureAlpha*phase.fade:1;
  if(progress<=0||opacity<=0||!brandLetters.length)return;
  target.save();target.globalAlpha*=opacity;softGlow(625,470,235,.16,target);
  const scale=animate?5.4:4.4;target.translate(625-74*scale/2,animate?404:375);target.scale(scale,scale);target.lineCap='round';target.lineJoin='round';
  for(let index=0;index<brandLetters.length;index++){
    const letter=brandLetters[index],p=Math.max(0,Math.min(1,progress*brandLetters.length-index));if(!p)continue;
    if(p>=1){target.drawImage(signatureStamp(index),-5,-5,84,48);continue;}
    const limit=p*letter.length;let head=null;target.strokeStyle='#ffe8b7';target.lineWidth=.5;
    for(const contour of letter.contours){if(!contour.segments.length||limit<=contour.segments[0].start)continue;target.beginPath();target.moveTo(...contour.points[0]);
      for(const seg of contour.segments){if(limit<=seg.start)break;const fraction=seg.size?Math.min(1,(limit-seg.start)/seg.size):1,point=[seg.a[0]+(seg.b[0]-seg.a[0])*fraction,seg.a[1]+(seg.b[1]-seg.a[1])*fraction];target.lineTo(...point);head=point;if(fraction<1)break;}target.stroke();
    }
    if(head)starShape(target,...head,1.05,1);
  }
  target.restore();
}
function placedObjects(){
  const layer=p=>item(p.day).product?2:1;
  // Shared by the live globe, hit testing and card capture: products stay in
  // front of scenery, while user-selected positions remain fully editable.
  return ownedDays().filter(d=>isPlaced(d)&&!item(d).effect).map(d=>({day:d,...getLayout(d)})).sort((a,b)=>layer(a)-layer(b)||a.y-b.y||a.day-b.day);
}
// Bounded visual snow, independent of participation and Sheet records.
const SNOW_PACK_LIMIT=125,SNOW_PACK_RATE=125/540,SNOW_WIND_MULTIPLIER=3.6;
let snowPack={key:'',depth:0};
const snowPackContexts=new Map();
function snowSurface(x,depth=snowPack.depth){
  const edge=(x-625)/350,taper=Math.max(0,1-edge**4);
  const hill=(centre,width,height)=>height*Math.exp(-.5*((x-centre)/width)**2);
  const profile=.2+hill(410,66,.68)+hill(650,78,.9)+hill(840,60,.72);
  return 873-11*edge*edge-Math.min(SNOW_PACK_LIMIT,Math.max(0,depth))*profile*taper;
}
function advanceSnowPack(pack,seconds,active,airflow=false){
  if(active&&seconds>0){
    const key=Object.prototype.hasOwnProperty.call(pack,'snowDepth')?'snowDepth':'depth';
    pack[key]=Math.min(SNOW_PACK_LIMIT,Math.max(0,pack[key])+seconds*SNOW_PACK_RATE*(airflow?SNOW_WIND_MULTIPLIER:1));
  }
}
function syncSnowPack(active){
  const key=cloud.email+'|'+(previewDate?'preview':'live');
  if(snowPack.key!==key){if(snowPack.key)snowPackContexts.set(snowPack.key,snowPack.depth);snowPack={key,depth:snowPackContexts.get(key)||0};}
  if(!active){snowPack.depth=0;snowPackContexts.set(key,0);}
}
function drawSnowBase(target){
  target.save();
  const base=target.createLinearGradient(0,823,0,938);base.addColorStop(0,'#f9fcff');base.addColorStop(.45,'#ffffff');base.addColorStop(.82,'#edf5fc');base.addColorStop(1,'#d3e3ef');
  target.fillStyle=base;target.beginPath();target.ellipse(625,883,342,48,0,0,Math.PI*2);target.fill();
  target.strokeStyle='#ffffffcc';target.lineWidth=2;target.beginPath();target.ellipse(625,879,330,41,0,Math.PI,Math.PI*2);target.stroke();
  for(let k=0;k<65;k++){target.fillStyle=k%3?'#ffffffa0':'#afc6da25';target.beginPath();target.ellipse(310+k*109%625,857+k*23%59,.7+k%3*.35,.45,0,0,Math.PI*2);target.fill();}
  target.restore();
}
function drawSnowPack(target,depth){
  if(depth<.05)return;
  target.save();target.globalAlpha=Math.min(1,depth/18);
  const bank=target.createLinearGradient(0,780,0,922);bank.addColorStop(0,'#ffffff');bank.addColorStop(.55,'#f6fbff');bank.addColorStop(.84,'#dce6ee');bank.addColorStop(1,'#dce6ee00');
  target.fillStyle=bank;target.beginPath();target.moveTo(285,916);target.quadraticCurveTo(275,890,295,snowSurface(295,depth));
  for(let x=300;x<=955;x+=5)target.lineTo(x,snowSurface(x,depth));
  target.quadraticCurveTo(980,890,965,916);target.closePath();target.fill();
  target.save();target.clip();for(let k=0;k<70;k++){const x=292+k*113%672,y=snowSurface(x,depth)+4+(k*17%48);target.fillStyle=k%3?'#ffffffa6':'#b5c8da38';target.beginPath();target.ellipse(x,y,.7+k%3*.3,.5+k%2*.3,0,0,Math.PI*2);target.fill();}target.restore();
  target.strokeStyle='#ffffffd9';target.lineWidth=2.4;target.beginPath();
  for(let x=295;x<=955;x+=5)x===295?target.moveTo(x,snowSurface(x,depth)+1):target.lineTo(x,snowSurface(x,depth)+1);
  target.stroke();target.restore();
}
function drawObjectSnow(target,object,depth){
  if(depth<2||object.y<775||object.day===24)return;
  const sprite=loadSprite(object.day);if(!sprite)return;
  const h=object.h*object.scale,w=h*sprite.bounds.w/sprite.bounds.h,cover=Math.min(24,h*.10,depth*.19),r=Math.max(9,Math.min(w*.35,64)),x=object.x,y=object.y+2;
  target.save();target.globalAlpha=Math.min(1,depth/20);
  target.fillStyle='#7c9bb42b';target.beginPath();target.ellipse(x,y+2,r*1.1,3+cover*.12,0,0,Math.PI*2);target.fill();
  const cap=target.createLinearGradient(0,y-cover,0,y+5);cap.addColorStop(0,'#ffffff');cap.addColorStop(.65,'#f3f9ff');cap.addColorStop(1,'#cfdfec');target.fillStyle=cap;
  target.beginPath();target.moveTo(x-r,y+3);target.bezierCurveTo(x-r*.9,y-cover*.1,x-r*.6,y-cover*.95,x-r*.25,y-cover*.7);target.bezierCurveTo(x+r*.12,y-cover*1.25,x+r*.58,y-cover*.48,x+r,y+3);target.quadraticCurveTo(x,y+8,x-r,y+3);target.fill();
  target.restore();
}
function drawSnowForeground(target,depth){
  if(depth<1)return;
  target.save();target.globalAlpha=Math.min(1,depth/24);
  const top=904-Math.min(39,depth*.34),fullness=Math.min(1,depth/SNOW_PACK_LIMIT),bank=target.createLinearGradient(0,top-24,0,932);bank.addColorStop(0,'#ffffff');bank.addColorStop(.5,'#f5faff');bank.addColorStop(.82,'#d7e5f1');bank.addColorStop(1,'#c0d3e600');target.fillStyle=bank;
  target.beginPath();target.moveTo(310,925);target.bezierCurveTo(345,top+10,367,top-18*fullness,430,top-6*fullness);target.bezierCurveTo(490,top+10,527,top+9,580,top-5*fullness);target.bezierCurveTo(630,top-24*fullness,680,top-21*fullness,735,top-7*fullness);target.bezierCurveTo(800,top+9,865,top-12*fullness,954,top+10);target.lineTo(947,932);target.closePath();target.fill();target.restore();
}

function drawLooseSnow(target,depth,time,airflow=0,shakePower=0){
  if(depth<.5||(!airflow&&shakePower<.1))return;
  target.save();target.fillStyle='#fff8e8';
  const lift=airflow?125:Math.min(145,shakePower*32),count=airflow?80:42;
  for(let k=0;k<count;k++){
    const phase=(time*(airflow?.72:.48)+k*.618)%1,px=330+((k*83+phase*(airflow?200:65))%590),py=snowSurface(px,depth)-Math.sin(phase*Math.PI)*lift;
    target.globalAlpha=.65*Math.sin(phase*Math.PI);target.beginPath();target.arc(px,py,1.1+(k%3)*.6,0,Math.PI*2);target.fill();
  }
  target.restore();
}
const CANDY_COLORS=[['#cf414b','#ffaaa3','#962b46'],['#269769','#a2e0a4','#13573b'],['#56a9d1','#b9ebff','#2b658f'],['#a976cc','#e1c2f1','#67468f'],['#e8ae44','#fff0a1','#b77728']];
function drawCandy(target,px,py,size,angle,kind,colorIndex=0){
  target.save();target.translate(px,py);target.rotate(angle);target.scale(size/24,size/24);
  const cream='#fff4db',gold='#ecc781',[accent,light,dark]=CANDY_COLORS[colorIndex%CANDY_COLORS.length];
  if(kind===1){
    target.lineCap='round';target.lineJoin='round';target.strokeStyle=gold;target.lineWidth=7;target.beginPath();target.moveTo(-3,13);target.lineTo(-3,-5);target.arc(3,-5,6,Math.PI,0);target.stroke();
    target.strokeStyle=cream;target.lineWidth=5;target.stroke();target.strokeStyle=accent;target.lineWidth=2;
    for(const y of [-5,2,9]){target.beginPath();target.moveTo(-5,y-1);target.lineTo(-1,y+1);target.stroke();}
    target.beginPath();target.moveTo(1,-11);target.lineTo(5,-9);target.stroke();
  }else if(kind===0){
    target.fillStyle=gold;for(const side of [-1,1]){target.beginPath();target.moveTo(side*6,0);target.lineTo(side*14,-6);target.lineTo(side*12,6);target.closePath();target.fill();}
    const g=target.createLinearGradient(-8,-7,8,7);g.addColorStop(0,light);g.addColorStop(.4,accent);g.addColorStop(1,dark);target.fillStyle=g;target.beginPath();target.ellipse(0,0,9,7,0,0,Math.PI*2);target.fill();target.strokeStyle=cream;target.lineWidth=2;target.beginPath();target.moveTo(-3,-5);target.lineTo(3,5);target.stroke();
  }else{
    target.fillStyle=cream;target.beginPath();target.arc(0,0,9,0,Math.PI*2);target.fill();target.strokeStyle=accent;target.lineWidth=2;
    for(let k=0;k<5;k++){target.rotate(Math.PI*2/5);target.beginPath();target.moveTo(0,0);target.quadraticCurveTo(6,-2,8,1);target.stroke();}
    target.fillStyle=gold;target.beginPath();target.arc(0,0,2,0,Math.PI*2);target.fill();
  }
  target.restore();
}
function drawCandyRain(target,time){
  for(let k=0;k<38;k++){
    const phase=(time/5+k*.6180339)%1,px=275+(k*137%690)+Math.sin(time*Math.PI*2/5+k)*17,py=195+phase*720;
    target.save();target.globalAlpha=.88*Math.min(1,(915-py)/65,phase*15);
    drawCandy(target,px,py,21+k%4*4,time*Math.PI*2/5*(k%2?1:-1)+k,k%3,k%5);target.restore();
  }
}


function sceneParticleCounts({elapsed=0,finalShow=false,animate=true,airflow=false,shakePower=0,activeSnow=false,goldSnow=false,timeline=SHOW_LIVE}){
  const showFade=finalShow&&animate?showState(elapsed,timeline).fade:1;
  const flow=animate&&(airflow||shakePower>.1),baseWhite=animate&&airflow?420:flow?340:activeSnow?240:0,baseGold=goldSnow?310:0;
  const whiteCount=finalShow?Math.max(baseWhite,Math.round(100*showFade)):baseWhite,goldCount=finalShow?Math.max(baseGold,Math.round(90*showFade)):baseGold;
  return {showFade,whiteCount,goldCount};
}
function paintGlobeContents(ctx,{time,dt=0,elapsed=0,finalShow=false,animate=motion,activeSnow=false,goldSnow=false,warmth=false,candyRain=false,airflow=false,shakePower=0,objects=placedObjects(),whitePool=snow,goldPool=goldFlakes,environment=null,trackHits=false,timeline=SHOW_LIVE}){
  const {showFade,whiteCount,goldCount}=sceneParticleCounts({elapsed,finalShow,animate,airflow,shakePower,activeSnow,goldSnow,timeline});
  ctx.save();globePath(ctx);ctx.clip();
  if(finalShow){const dim=ctx.createRadialGradient(625,560,150,625,560,465);dim.addColorStop(0,`rgba(7,12,27,${.53*showFade})`);dim.addColorStop(.65,`rgba(7,12,27,${.44*showFade})`);dim.addColorStop(1,'rgba(7,12,27,0)');ctx.fillStyle=dim;ctx.fillRect(180,150,900,790);}
  if(warmth||finalShow)drawWarmth(time,finalShow ? .52*showFade : 1,ctx,animate);
  drawSnowBase(ctx);
  drawSnowPack(ctx,environment?environment.snowDepth:snowPack.depth);
  for(const p of objects){
    const h=p.h*p.scale,s=loadSprite(p.day);if(!s)continue;const w=h*s.bounds.w/s.bounds.h;
    if(p.day!==24&&p.y>=775){ctx.save();ctx.translate(p.x,p.y+3);ctx.scale(1,.19);const r=Math.max(12,w*.38),g=ctx.createRadialGradient(0,0,1,0,0,r);g.addColorStop(0,'rgba(15,35,53,.24)');g.addColorStop(1,'rgba(15,35,53,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.restore();}
    const rect=drawSprite(ctx,p.day,p.x,p.y,h);if(activeSnow)drawObjectSnow(ctx,p,environment?environment.snowDepth:snowPack.depth);if(rect&&trackHits)hitRegions.push({day:p.day,rect,sprite:s});
    if(trackHits&&editMode&&selectedDay===p.day&&rect){ctx.save();ctx.strokeStyle='#f2cb83';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.strokeRect(rect.x-7,rect.y-7,rect.w+14,rect.h+14);ctx.restore();}
  }
  if(activeSnow)drawSnowForeground(ctx,environment?environment.snowDepth:snowPack.depth);
  drawSnowLayer(whitePool,whiteCount,animate?dt:0,time,finalShow,ctx,environment);drawSnowLayer(goldPool,goldCount,animate?dt:0,time,finalShow,ctx,environment);
  if(activeSnow)drawLooseSnow(ctx,environment?environment.snowDepth:snowPack.depth,time,animate&&airflow?1:0,animate?shakePower:0);
  if(candyRain)drawCandyRain(ctx,time);
  if(warmth||finalShow){
    ctx.save();ctx.globalCompositeOperation='screen';
    for(const s of stars){const a=animate ? .42+(Math.sin(time*1.8+s.phase)+1)*.25:.8;softGlow(s.x,s.y,s.size*5,a*.36,ctx);starShape(ctx,s.x,s.y,s.size*(animate ? .85+Math.sin(time+s.phase)*.15:1),a);}
    ctx.restore();
  }
  if(finalShow){drawStarShow(elapsed,time,ctx,animate,timeline);drawDysonSignature(elapsed,ctx,animate,timeline);if(!animate||elapsed>=timeline.holdEnd)drawMerryChristmas(ctx,animate?showFade*showState(elapsed,timeline).greeting:1,time);}
  const rim=ctx.createRadialGradient(625,560,280,625,560,430);rim.addColorStop(0,'rgba(255,223,157,0)');rim.addColorStop(.9,'rgba(255,223,157,.015)');rim.addColorStop(1,'rgba(255,223,157,.12)');ctx.fillStyle=rim;ctx.fillRect(180,150,900,790);ctx.restore();
}

function drawFrame(dt=0,now=0){
  if(!canvas.width)return;ctx.setTransform(canvas.width/SCENE_W,0,0,canvas.height/SCENE_H,0,0);ctx.clearRect(0,0,SCENE_W,SCENE_H);hitRegions=[];
  if(!sceneReady)return;
  if(showUntil&&now>=showUntil){stopShow(true);}
  const time=motion?now/1000:0,finalShow=showActive(now),elapsed=finalShow?(now-showStarted)/1000:0;
  const activeSnow=isPlaced(1),goldSnow=isPlaced(13),warmth=isPlaced(13),candyRain=isPlaced(19),flow=motion&&(wind||turbulence>.1);
  syncSnowPack(activeSnow);if(activeSnow&&!motion)snowPack.depth=Math.max(28,snowPack.depth);advanceSnowPack(snowPack,motion?dt/60:0,activeSnow,wind);
  const {showFade,whiteCount,goldCount}=sceneParticleCounts({elapsed,finalShow,animate:motion,airflow:wind,shakePower:turbulence,activeSnow,goldSnow});
  frameEffects={white:whiteCount,gold:goldCount,warmth,candyRain,accumulation:snowPack.depth,airborneSnow:activeSnow&&snowPack.depth>.5&&flow,show:finalShow,signature:finalShow?signatureProgress(elapsed):0,phase:finalShow?(!motion?'靜態星光':showState(elapsed).phase):''};
  if(finalShow){$('show-banner').hidden=false;$('show-phase').textContent=frameEffects.phase;$('show-progress').style.width=`${Math.max(0,Math.min(100,elapsed/SHOW_SECONDS*100))}%`;}
  const greetingVisible=finalShow&&(!motion||elapsed>=SHOW_LIVE.holdEnd);$('show-greeting').hidden=!greetingVisible;
  if(greetingVisible){$('show-greeting').style.opacity=String(motion?showFade*showState(elapsed).greeting:1);$('show-greeting').style.top=motion?'37.7%':'41%';}
  paintGlobeContents(ctx,{time,dt,elapsed,finalShow,animate:motion,activeSnow,goldSnow,warmth,candyRain,airflow:wind,shakePower:turbulence,trackHits:true});
  frameEffects.accumulation=snowPack.depth;
  if(motion)turbulence*=Math.pow(.984,dt);
}
function loop(now){const dt=lastFrame?Math.min((now-lastFrame)/16.667,2):0;lastFrame=now;if(!document.hidden&&!cardExportBusy)drawFrame(dt,now);requestAnimationFrame(loop);}
function resize(){const r=$('globe-wrapper').getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);width=r.width;height=r.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);drawFrame(0,performance.now());}
function shake(power=4){turbulence=power;[...snow,...goldFlakes].forEach(p=>{p.vx=(Math.random()-.5)*5;p.vy=-(2+Math.random()*5);});if(motion){const wrapper=$('globe-wrapper');wrapper.classList.remove('shake');void wrapper.offsetWidth;wrapper.classList.add('shake');}chime();}
function pointerPoint(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*SCENE_W/r.width,y:(e.clientY-r.top)*SCENE_H/r.height};}
function hitTest(p){for(const hit of [...hitRegions].reverse()){const r=hit.rect;if(p.x<r.x||p.x>r.x+r.w||p.y<r.y||p.y>r.y+r.h)continue;const b=hit.sprite.bounds;const sx=Math.floor(b.x+(p.x-r.x)/r.w*b.w),sy=Math.floor(b.y+(p.y-r.y)/r.h*b.h);try{if(hit.sprite.image.getContext('2d').getImageData(sx,sy,1,1).data[3]<32)continue;}catch{}return hit.day;}return null;}
const placementGlass=el('canvas').getContext('2d'),placementAnchors=new Map();globePath(placementGlass);
function freePlacement(i){return !!i.layout&&!i.product&&!i.effect&&!i.fixed;}
function constrain(d,l){
  const i=item(d),s=loadSprite(d);l.scale=Math.max(.65,Math.min(1.35,l.scale));
  const h=i.layout.h*l.scale,w=s?h*s.bounds.w/s.bounds.h:100;
  if(!freePlacement(i)){
    l.x=Math.max(320+w*.25,Math.min(950-w*.25,l.x));
    l.y=Math.max(775,Math.min(887,l.y));return l;
  }
  // x is the sprite centre and y its bottom edge. Keep the complete sprite
  // inside the same curved glass path used for rendering and card capture.
  const fits=(x,y)=>[x-w/2-12,x+w/2+12].every(px=>[y-h-12,y+12].every(py=>placementGlass.isPointInPath(px,py)));
  const sizeKey=`${w.toFixed(2)}:${h.toFixed(2)}`;
  let anchor=placementAnchors.get(sizeKey);
  if(!anchor){
    anchor={x:622,y:Math.min(900,Math.max(180+h,542+h/2))};
    if(!fits(anchor.x,anchor.y)){
      for(let y=180+h;y<=900;y+=2)if(fits(622,y)){anchor.y=y;break;}
    }
    placementAnchors.set(sizeKey,anchor);
  }
  const wanted={x:Math.max(190,Math.min(1050,l.x)),y:Math.max(180+h,Math.min(900,l.y))};
  if(fits(wanted.x,wanted.y)){l.x=wanted.x;l.y=wanted.y;return l;}
  // Project an edge drag towards a safe central position instead of trapping
  // the object in a narrow horizontal strip near the snow.
  if(fits(anchor.x,anchor.y)){
    let low=0,high=1;for(let n=0;n<16;n++){const t=(low+high)/2;fits(anchor.x+(wanted.x-anchor.x)*t,anchor.y+(wanted.y-anchor.y)*t)?low=t:high=t;}
    l.x=anchor.x+(wanted.x-anchor.x)*low;l.y=anchor.y+(wanted.y-anchor.y)*low;
  }else{l.x=anchor.x;l.y=anchor.y;}
  return l;
}
function selectItem(d){selectedDay=d&&!item(d).fixed?d:null;updateSelection();}
function updateSelection(){
  $('scene-tools').hidden=!editMode;$('edit-toggle').setAttribute('aria-expanded',String(editMode));
  const show=!!(editMode&&selectedDay&&isPlaced(selectedDay)&&!item(selectedDay).effect&&!item(selectedDay).fixed);
  $('position-editor').hidden=!show;$('scene-edit-hint').hidden=show;
  if(show){$('selected-name').textContent=item(selectedDay).name;$('scale-control').value=String(getLayout(selectedDay).scale);}
}
function moveSelected(dx,dy){if(!editMode||!selectedDay||!isPlaced(selectedDay)||item(selectedDay).fixed)return;const l=getLayout(selectedDay);l.x+=dx;l.y+=dy;state().layouts[selectedDay]=constrain(selectedDay,l);persist();updateSelection();drawFrame(0,performance.now());}
canvas.addEventListener('pointerdown',e=>{const pt=pointerPoint(e),d=hitTest(pt);if(editMode&&d&&!item(d).fixed){selectItem(d);const l=getLayout(d);drag={id:e.pointerId,day:d,start:pt,offset:{x:pt.x-l.x,y:pt.y-l.y},moved:false};canvas.setPointerCapture(e.pointerId);}else drag={id:e.pointerId,day:d,start:pt,moved:false,viewOnly:true};});
canvas.addEventListener('pointermove',e=>{const pt=pointerPoint(e);if(drag&&drag.id===e.pointerId){if(Math.hypot(pt.x-drag.start.x,pt.y-drag.start.y)>10)drag.moved=true;if(!drag.viewOnly&&drag.moved){const l=getLayout(drag.day);l.x=pt.x-drag.offset.x;l.y=pt.y-drag.offset.y;state().layouts[drag.day]=constrain(drag.day,l);drawFrame(0,performance.now());}return;}
  const d=hitTest(pt);$('scene-tip').hidden=!d;if(d){$('scene-tip').textContent=item(d).name;$('scene-tip').style.left=`${Math.max(18,Math.min(82,((pt.x/SCENE_W-.5)*SCENE_VIEW.zoom+.5+SCENE_VIEW.shiftX)*100))}%`;$('scene-tip').style.top=`${((pt.y/SCENE_H-.5)*SCENE_VIEW.zoom+.5)*100}%`;}
});
canvas.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const saved=drag;drag=null;if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(saved.moved){if(saved.day===24&&!saved.viewOnly){const star=getLayout(24),near=[2,12].filter(d=>isPlaced(d)).map(d=>getLayout(d)).map(t=>starAboveTreeLayout(star,t)).sort((a,b)=>Math.hypot(star.x-a.x,star.y-a.y)-Math.hypot(star.x-b.x,star.y-b.y))[0];if(near&&Math.hypot(star.x-near.x,star.y-near.y)<85){state().layouts[24]={...star,x:near.x,y:near.y};status('金星已放在聖誕樹頂。');}}persist();return;}if(saved.day){if(editMode)selectItem(saved.day);else openItem(saved.day);}});
canvas.addEventListener('pointercancel',()=>{drag=null;persist();});canvas.addEventListener('pointerleave',()=>{$('scene-tip').hidden=true;});
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;const moves={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4]};if(editMode&&selectedDay&&moves[e.key]){e.preventDefault();moveSelected(...moves[e.key].map(v=>e.shiftKey?v*3:v));}});
function assetLabel(d){if(customAssets.has(d))return '已使用自訂圖片';if(ASSETS.sprites?.[d])return item(d).product?'已內嵌產品透明圖':'獨立透明造景素材';return item(d).effect?'程式動態效果':'已內嵌節慶素材';}
function renderStudio(){
  const root=$('studio-table-body');root.replaceChildren();
  for(const i of items()){const tr=el('tr');tr.append(el('td','',`12/${i.day}`));const visual=el('td'),c=el('canvas');c.width=130;c.height=140;drawThumbnail(c,i.day);visual.append(c);tr.append(visual);
    const title=el('td');title.append(el('span','studio-type',i.type),el('strong','',i.name));tr.append(title,el('td','',i.description),el('td','',i.product?i.product.intro:'—'));
    const asset=el('td');asset.append(el('span','asset-status',assetLabel(i.day)));
    if(!i.effect){const upload=el('button','','替換圖片');upload.addEventListener('click',()=>{assetUploadDay=i.day;$('asset-input').value='';$('asset-input').click();});asset.append(upload);if(customAssets.has(i.day)){const reset=el('button','','還原素材');reset.addEventListener('click',()=>removeCustomAsset(i.day));asset.append(reset);}}tr.append(asset);
    const action=el('td'),button=el('button','','預覽當日');button.addEventListener('click',()=>{$('preview-date').value=`${YEAR}-12-${String(i.day).padStart(2,'0')}`;setPreview($('preview-date').value);});action.append(button);tr.append(action);root.append(tr);
  }
  $('config-json').value=JSON.stringify(BASE_CONFIG.items.map(i=>configuredItem(i.day)).map(i=>({day:i.day,name:i.name,description:i.description,hint:i.hint,product:i.product})),null,2);
  $('reward-json').value=JSON.stringify(configuredRewards(),null,2);
  $('asset-persistence').textContent=assetStorage==='indexedDB'?'上傳素材會保存在此瀏覽器。完成後按「下載活動設定 config.js」，可將素材一起帶到其他裝置。':'目前瀏覽器未提供可用的圖片儲存空間。上傳後請按「下載活動設定 config.js」保留圖片。';
}
async function openDatabase(){
  if(!window.indexedDB)return;
  try{assetDb=await new Promise((resolve,reject)=>{const req=indexedDB.open('dyson-advent-photo-assets-v3',1);req.onupgradeneeded=()=>req.result.createObjectStore('images');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});assetStorage='indexedDB';
    let records=await new Promise((resolve,reject)=>{const req=assetDb.transaction('images','readonly').objectStore('images').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
    if(!safeRead(scheduleKey+'-assets',false)){
      const moved=records.filter(r=>SCHEDULE_MOVES[r.day]).map(r=>({...r,day:SCHEDULE_MOVES[r.day]}));
      if(moved.length)await new Promise((resolve,reject)=>{const tx=assetDb.transaction('images','readwrite'),store=tx.objectStore('images');for(const d of Object.keys(SCHEDULE_MOVES))store.delete(Number(d));for(const r of moved)store.put(r,r.day);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('素材日期更新未完成'));});
      records=records.filter(r=>!SCHEDULE_MOVES[r.day]).concat(moved);safeWrite(scheduleKey+'-assets',true);
    }
    for(const r of records||[]){if(Number(r.day)===24&&r.starArtworkRevision!==BASE_CONFIG.starArtworkRevision)continue;if(Number(r.day)===12&&r.treeArtworkRevision!==BASE_CONFIG.treeArtworkRevision)continue;if(FINAL_ARTWORK_DAYS.includes(Number(r.day))&&r.finalArtworkRevision!==BASE_CONFIG.finalArtworkRevision)continue;if(HOLIDAY_ACCENT_DAYS.includes(Number(r.day))&&r.holidayAccentRevision!==BASE_CONFIG.holidayAccentRevision)continue;if(FRONT_FACING_ARTWORK_DAYS.includes(Number(r.day))&&r.frontFacingArtworkRevision!==BASE_CONFIG.frontFacingArtworkRevision)continue;if(SEASONAL_ARTWORK_DAYS.includes(Number(r.day))&&r.seasonalArtworkRevision!==BASE_CONFIG.seasonalArtworkRevision)continue;if(RESTORED_ARTWORK_DAYS.includes(Number(r.day))&&r.restoredArtworkRevision!==BASE_CONFIG.restoredArtworkRevision)continue;if(CONTENT_REPLACED_DAYS.includes(Number(r.day))&&r.collectionContentRevision!==BASE_CONFIG.collectionContentRevision)continue;if(DEER_PAPER_DAYS.includes(Number(r.day))&&r.deerPaperRevision!==BASE_CONFIG.deerPaperRevision)continue;if(PAPER_SCENERY_DAYS.includes(Number(r.day))&&r.paperSceneryRevision!==BASE_CONFIG.paperSceneryRevision)continue;if(Number(r.day)===21&&r.departmentStoreRevision!==BASE_CONFIG.departmentStoreRevision)continue;if([107,109].includes(Number(r.day))&&r.softAnimalsRevision!==BASE_CONFIG.softAnimalsRevision)continue;if(Number(r.day)===106&&r.penguinRevision!==BASE_CONFIG.penguinRevision)continue;if(Number(r.day)===23&&r.santaTailRevision!==BASE_CONFIG.santaTailRevision)continue;if(PLAIN_COAT_DAYS.includes(Number(r.day))&&r.plainCoatRevision!==BASE_CONFIG.plainCoatRevision)continue;if(CHARACTER_REVISED_DAYS.includes(Number(r.day))&&r.characterRevision!==BASE_CONFIG.characterRevision)continue;if(CAT_COLLECTION_DAYS.includes(Number(r.day))&&r.catRevision!==BASE_CONFIG.catRevision)continue;if(PAPER_COLLECTION_DAYS.includes(Number(r.day))&&r.paperCollectionRevision!==BASE_CONFIG.paperCollectionRevision)continue;if(Number(r.day)===16&&r.stockingRevision!==BASE_CONFIG.stockingRevision)continue;if(SCENE_REPLACED_DAYS.includes(Number(r.day))&&r.sceneRevision!==BASE_CONFIG.sceneRevision)continue;if(!itemByDay(r.day)?.product&&r.productModel)continue;if(itemByDay(r.day)?.product&&ASSETS.productStyle&&(r.productStyle!==ASSETS.productStyle||r.productModel!==itemByDay(r.day).product.model))continue;if(ASSETS.visualStyle==='paper-relief-v1'&&!item(r.day)?.product&&r.visualStyle!=='paper-relief-v1')continue;if(r.removed)customAssets.delete(r.day);else try{customAssets.set(r.day,{src:r.src,image:await imageLoad(r.src)});}catch{}}
  }catch{assetDb=null;assetStorage='memory';}
}
function dbWrite(day,src){return new Promise((resolve,reject)=>{if(!assetDb){resolve();return;}const tx=assetDb.transaction('images','readwrite');tx.objectStore('images').put(src?{day,src,starArtworkRevision:BASE_CONFIG.starArtworkRevision,treeArtworkRevision:BASE_CONFIG.treeArtworkRevision,finalArtworkRevision:BASE_CONFIG.finalArtworkRevision,holidayAccentRevision:BASE_CONFIG.holidayAccentRevision,frontFacingArtworkRevision:BASE_CONFIG.frontFacingArtworkRevision,seasonalArtworkRevision:BASE_CONFIG.seasonalArtworkRevision,restoredArtworkRevision:BASE_CONFIG.restoredArtworkRevision,collectionContentRevision:BASE_CONFIG.collectionContentRevision,deerPaperRevision:BASE_CONFIG.deerPaperRevision,paperSceneryRevision:BASE_CONFIG.paperSceneryRevision,departmentStoreRevision:BASE_CONFIG.departmentStoreRevision,softAnimalsRevision:BASE_CONFIG.softAnimalsRevision,penguinRevision:BASE_CONFIG.penguinRevision,santaTailRevision:BASE_CONFIG.santaTailRevision,plainCoatRevision:BASE_CONFIG.plainCoatRevision,characterRevision:BASE_CONFIG.characterRevision,catRevision:BASE_CONFIG.catRevision,paperCollectionRevision:BASE_CONFIG.paperCollectionRevision,sceneRevision:BASE_CONFIG.sceneRevision,stockingRevision:BASE_CONFIG.stockingRevision,visualStyle:ASSETS.visualStyle,productStyle:item(day).product?ASSETS.productStyle:null,productModel:configuredItem(day).product?.model||null}:{day,removed:true,visualStyle:ASSETS.visualStyle},day);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
async function removeCustomAsset(d){customAssets.delete(d);sprites.delete(d);await dbWrite(d,null).catch(()=>{});renderUI();renderStudio();}
$('asset-input').addEventListener('change',async e=>{const file=e.target.files?.[0],d=assetUploadDay;if(!file||!d)return;if(file.size>12*1024*1024){$('config-status').textContent='單張圖片請控制在 12 MB 內。';return;}
  try{const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(file);});const image=await imageLoad(src);customAssets.set(d,{src,image});sprites.delete(d);try{await dbWrite(d,src);}catch{assetStorage='memory';}$('config-status').textContent=`12/${d} 圖片已替換。可下載新版 config.js 保留素材。`;renderUI();renderStudio();}catch(err){$('config-status').textContent=err.message;}
});
function applyConfig(value,rewardValue=configuredRewards()){
  if(!Array.isArray(value)||value.length!==25)throw new Error('設定必須包含 25 天。');
  const next={},ids=new Set();for(const r of value){
    if(!Number.isInteger(r.day)||r.day<1||r.day>25||ids.has(r.day))throw new Error('日期必須是 1–25 且不可重複。');ids.add(r.day);
    if(typeof r.name!=='string'||!r.name.trim()||typeof r.description!=='string'||typeof r.hint!=='string')throw new Error(`第 ${r.day} 天缺少名稱、說明或預告。`);
    next[r.day]={name:r.name.trim().slice(0,100),description:r.description.slice(0,1000),hint:r.hint.slice(0,300)};
    if(itemByDay(r.day).product){
      const p=r.product??item(r.day).product;
      if(!p||typeof p.intro!=='string'||!p.intro.trim()||!Array.isArray(p.features)||p.features.length>3||p.features.some(f=>typeof f!=='string'||!f.trim()))throw new Error(`第 ${r.day} 天請填入產品介紹，特色最多三項。`);
      const url=validatedProductURL(p.url);if(p.url&&!url)throw new Error(`第 ${r.day} 天產品連結須為完整 HTTPS 網址。`);
      next[r.day].product={model:String(p.model||'').slice(0,100),color:String(p.color||'').slice(0,80),intro:p.intro.trim().slice(0,1000),tagline:String(p.tagline||'').trim().slice(0,120),features:p.features.map(f=>f.trim().slice(0,150)),url,...(typeof p.detailTitle==='string'?{detailTitle:p.detailTitle.trim().slice(0,160)}:{})};
    }
  }
  if(!Array.isArray(rewardValue)||rewardValue.length!==5)throw new Error('禮遇設定必須包含四張商品優惠券與一份護照禮。');
  const nextReward={},rewardIDs=new Set();
  for(const b of rewardValue){
    const base=BASE_CONFIG.rewards.find(v=>v.id===b?.id);
    if(!base||rewardIDs.has(b.id)||b.required!==base.required||b.productDay!==base.productDay||b.unlock!==base.unlock)throw new Error('請保留四款產品與累積參與 10 天的禮遇識別及解鎖條件。');
    rewardIDs.add(b.id);
    if(typeof b.title!=='string'||!b.title.trim()||typeof b.preview!=='string'||!b.preview.trim()||typeof b.conditions!=='string')throw new Error('請填入優惠券標題、未解鎖預告與使用條件。');
    if(b.validUntil&&(!/^\d{4}-\d{2}-\d{2}$/.test(b.validUntil)||!Number.isFinite(Date.parse(b.validUntil+'T00:00:00Z'))||new Date(b.validUntil+'T00:00:00Z').toISOString().slice(0,10)!==b.validUntil))throw new Error('使用期限須為有效的 YYYY-MM-DD 日期。');
    if(base.redemption!=='counter'&&b.approved===true&&!String(b.code||'').trim())throw new Error('啟用優惠券前請填入序號。');
    nextReward[b.id]={title:b.title.trim().slice(0,120),preview:b.preview.trim().slice(0,120),conditions:b.conditions.slice(0,1000),code:String(b.code||'').trim().slice(0,120),validUntil:String(b.validUntil||''),approved:b.approved===true};if(base.redemption==='counter'){nextReward[b.id].code='';nextReward[b.id].approved=true;nextReward[b.id].validUntil='';}
  }
  settings=next;rewardSettings=nextReward;safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(STORAGE_PREFIX+'rewards-v2',rewardSettings);renderUI();renderStudio();if(currentModalDay&&dayState(currentModalDay)==='owned')renderItemDialog();
}
// Cards use a frozen copy of the rendered globe, without controls or edit outlines.
// One geometry map keeps PNG, GIF's protected text palette and MP4 in sync.
const CARD_LAYOUT=Object.freeze({width:1200,height:2000,photo:{x:80,y:190,width:1040,height:1198,radius:16},message:{x:110,y:1530,width:980,height:306},recipientY:1480,signatureY:1870,footerY:1950});
const CARD_FONT='"Source Han Sans TC","Microsoft JhengHei",sans-serif';
const cardSegmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh-Hant',{granularity:'grapheme'}):null;
const cardGraphemes=text=>cardSegmenter?[...cardSegmenter.segment(text)].map(s=>s.segment):Array.from(text);
const cardCount=text=>cardGraphemes(text.replace(/\r\n?/g,'\n').replace(/\n/g,'')).length;
let cardCapturedAt=null,cardSnapshot=null,cardBackground=null,cardCapturing=false,cardBlob=null,cardFile=null,cardRenderToken=0,cardSaving=false,cardTouched=false;
let cardDraftKey='',cardSceneKey='',cardSceneRevision=0,cardFailedFormat=null;
function wrapCardText(context,text,maxWidth){
  const lines=[];
  for(const paragraph of text.replace(/\r\n?/g,'\n').split('\n')){
    let line='';
    for(const token of paragraph.match(/\S+\s*|\s+/gu)||['']){
      if(context.measureText(line+token).width<=maxWidth){line+=token;continue;}
      if(context.measureText(token.trim()).width<=maxWidth){if(line)lines.push(line.trimEnd());line=token.trimStart();continue;}
      for(const character of cardGraphemes(token)){
        if(line&&context.measureText(line+character).width>maxWidth){lines.push(line.trimEnd());line=character;}else line+=character;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}
function cardTextLayout(text){
  const context=$('card-preview').getContext('2d');
  for(const size of [56,52,48,44,40,36]){
    context.font=`400 ${size}px ${CARD_FONT}`;const lines=wrapCardText(context,text,CARD_LAYOUT.message.width);
    const lineHeight=Math.round(size*1.42);if(lines.length<=6&&lines.length*lineHeight<=CARD_LAYOUT.message.height)return {lines,size,lineHeight,fits:true};
  }
  return {lines:[],size:40,lineHeight:57,fits:false};
}
function validateCard(){
  const recipient=$('card-recipient').value,message=$('card-message').value.replace(/\r\n?/g,'\n'),signature=$('card-signature').value;
  const counts={recipient:cardCount(recipient),message:cardCount(message),signature:cardCount(signature)},layout=cardTextLayout(message);
  const errors={recipient:!recipient.trim()?'請填寫收件人的名字或暱稱。':counts.recipient>12?'收件人最多 12 字，請調整後再製作。':'',message:!message.trim()?'寫幾句想送給對方的話吧。':counts.message>100?'祝福最多 100 字，原文已保留，請稍微精簡。':!layout.fits?'排版後超過 6 行，請減少換行或精簡內容。':'',signature:!signature.trim()?'請留下你的署名。':counts.signature>12?'署名最多 12 字，請調整後再製作。':''};
  return {recipient,message,signature,counts,layout,errors,valid:Object.values(errors).every(e=>!e)};
}
function cardRoundedRect(context,x,y,w,h,r){context.beginPath();context.moveTo(x+r,y);context.arcTo(x+w,y,x+w,y+h,r);context.arcTo(x+w,y+h,x,y+h,r);context.arcTo(x,y+h,x,y,r);context.arcTo(x,y,x+w,y,r);context.closePath();}
function paintChristmasCard(data,c=$('card-preview'),photo=cardSnapshot,dimensions={width:1200,height:2000}){
  c.width=dimensions.width;c.height=dimensions.height;const cx=c.getContext('2d');cx.scale(c.width/1200,c.height/2000);
  const bg=cx.createLinearGradient(0,0,1200,2000);bg.addColorStop(0,'#1d2532');bg.addColorStop(.55,'#101824');bg.addColorStop(1,'#1e232b');cx.fillStyle=bg;cx.fillRect(0,0,1200,2000);
  cx.strokeStyle='#b8945b';cx.lineWidth=2;cardRoundedRect(cx,28,28,1144,1944,18);cx.stroke();
  cx.strokeStyle='#e5bd7e36';cx.lineWidth=1;cardRoundedRect(cx,40,40,1120,1920,12);cx.stroke();
  for(const [x,y,r] of [[87,90,8],[1113,90,8],[78,1918,6],[1120,1918,6]])starShape(cx,x,y,r,.8);
  cx.textAlign='center';cx.textBaseline='alphabetic';cx.fillStyle='#edcf9f';cx.font='400 66px Georgia,serif';const headingMetrics=cx.measureText('MERRY CHRISTMAS');cx.fillText('MERRY CHRISTMAS',600,82+headingMetrics.actualBoundingBoxAscent,980);cx.textBaseline='middle';
  cx.strokeStyle='#b8945b66';cx.beginPath();cx.moveTo(455,155);cx.lineTo(745,155);cx.stroke();
  const p=CARD_LAYOUT.photo;
  if(photo){cx.save();cardRoundedRect(cx,p.x,p.y,p.width,p.height,p.radius);cx.clip();cx.drawImage(photo,p.x,p.y,p.width,p.height);cx.restore();cx.strokeStyle='#e5bd7e66';cardRoundedRect(cx,p.x,p.y,p.width,p.height,p.radius);cx.stroke();}
  cx.textAlign='left';cx.fillStyle='#e8c58f';cx.font=`500 42px ${CARD_FONT}`;
  cx.fillText(data.errors.recipient?'給，特別的你':`給 ${data.recipient}`,110,CARD_LAYOUT.recipientY);
  const messageValid=!data.errors.message;
  cx.fillStyle=messageValid?'#f4eee4':'#a6a8ae';cx.font=`400 ${messageValid?data.layout.size:40}px ${CARD_FONT}`;cx.textBaseline='middle';
  const lines=messageValid?data.layout.lines:[data.message.trim()?'內容超出卡片範圍，請調整後再製作。':'把想說的話，留在這片聖誕雪境裡。'];
  const lineHeight=messageValid?data.layout.lineHeight:52,messageCenter=CARD_LAYOUT.message.y+CARD_LAYOUT.message.height/2;
  lines.forEach((line,k)=>cx.fillText(line,CARD_LAYOUT.message.x,messageCenter+(k-(lines.length-1)/2)*lineHeight));
  if(data.signature.trim()&&!data.errors.signature){cx.textAlign='right';cx.textBaseline='middle';cx.font=`400 40px ${CARD_FONT}`;cx.fillStyle='#e8c58f';cx.fillText(`— ${data.signature}`,1090,CARD_LAYOUT.signatureY);}
  cx.textAlign='center';cx.textBaseline='middle';
  cx.fillStyle='#b9a488';cx.font=`400 22px ${CARD_FONT}`;cx.fillText(cardCapturedAt?`dyson · ${cardCapturedAt} · UTC+8`:'dyson',600,CARD_LAYOUT.footerY);
  c.setAttribute('aria-label',data.valid?`聖誕卡片預覽，送給 ${data.recipient}。${data.message}${data.signature.trim()?`，署名 ${data.signature}`:''}`:'聖誕卡片預覽，請完成欄位或調整超出限制的內容。');
}
function updateCardButtons(){
  const disabled=!currentCardBlob()||!validateCard().valid||cardCapturing||cardSaving||cardExportBusy||cardRecordingBusy();
  $('card-download').disabled=disabled;$('card-share').disabled=disabled;
  updateCardMediaControls();
}
function renderChristmasCard(){
  if(cardExportBusy)return;
  const data=validateCard(),key=JSON.stringify([cardSceneRevision,data.recipient,data.message,data.signature]);
  if(key!==cardDraftKey){cardDraftKey=key;++cardRenderToken;invalidateCardMedia();}
  for(const name of ['recipient','message','signature']){
    $(`card-${name}-count`).textContent=`${data.counts[name]}／${name==='message'?100:12}`;
    const error=data.errors[name],show=cardTouched||$(`card-${name}`).value.length>0;
    $(`card-${name}-error`).textContent=show?error:'';$(`card-${name}`).setAttribute('aria-invalid',String(!!error&&show));
  }
  paintChristmasCard(data);renderCardMediaResult();updateCardButtons();
  $('card-status').textContent=!data.valid?'':currentCardBlob()?cardReadyMessage():cardFormat()==='png'?'按下製作圖片卡片，完成後即可下載或分享。':'按下製作，產生這個格式的 5 秒卡片。';
}
// A frozen scene and its completed formats survive reopening unless the arrangement changes.
function cardSceneSignature(){
  return JSON.stringify([cloud.email,placedObjects().map(p=>({...p,source:customAssets.get(p.day)?.src||ASSETS.sprites?.[p.day]})),[1,13,19,25].map(isPlaced),wind,SCENE_VIEW,$('empty-globe').src]);
}
async function captureCardScene(){
  if(!sceneReady||cardCapturing||cardSaving||cardExportBusy||cardRecordingBusy())return false;
  const sceneKey=cardSceneSignature();
  if(cardSnapshot&&sceneKey===cardSceneKey){renderChristmasCard();return true;}
  cardCapturing=true;updateCardButtons();$('card-open').disabled=true;$('card-status').textContent='正在拍下你的聖誕雪境…';
  try{
    await ensureItemAssets(placedObjects().map(p=>p.day));
    if(!cardBackground)cardBackground=await imageLoad($('empty-globe').src);
    const snapshot=el('canvas');snapshot.width=SCENE_W;snapshot.height=SCENE_H;const cx=snapshot.getContext('2d'),editing=editMode;
    try{
      editMode=false;drawFrame(0,performance.now());
      cx.save();cx.translate(SCENE_W*(.5+SCENE_VIEW.shiftX),SCENE_H*.5);cx.scale(SCENE_VIEW.zoom,SCENE_VIEW.zoom);cx.translate(-SCENE_W*.5,-SCENE_H*.5);
      cx.drawImage(cardBackground,0,0,SCENE_W,SCENE_H);cx.drawImage(canvas,0,0,SCENE_W,SCENE_H);cx.restore();
      if(cardSnapshot){cardSnapshot.width=1;cardSnapshot.height=1;}cardSnapshot=snapshot;cardCapturedAt=Core.taipeiTimestamp(new Date(Date.now()+(cloud.hasClock?cloud.offset:0)));captureCardMotionBase();cardSceneKey=sceneKey;++cardSceneRevision;
    }finally{editMode=editing;drawFrame(0,performance.now());}
    cardCapturing=false;renderChristmasCard();return true;
  }catch(err){$('card-status').textContent='暫時無法拍下水晶球，請重新開啟檔案後再試。';status('聖誕卡片照片製作失敗，請稍後再試。',{persistent:true});return false;}
  finally{cardCapturing=false;$('card-open').disabled=!sceneReady;updateCardButtons();}
}
async function openChristmasCard(){
  if(!sceneReady||cardCapturing)return;
  collapseSimulation();showDialog('card-dialog');cardDetectMP4().then(()=>updateCardButtons());trackActivity('card_open',{placed_count:ownedDays().filter(isPlaced).length});await captureCardScene();
}
function downloadChristmasCard(){
  const blob=currentCardBlob();if(!blob||!validateCard().valid||cardExportBusy)return false;
  const url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=`dyson-christmas-card.${cardFormat()}`;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  markCardTask(cardFormat(),'download');trackActivity('card_download',{card_format:cardFormat()});
  $('card-status').textContent='已準備下載卡片檔案。可將檔案傳給想祝福的人。';return true;
}
function cardShareMetadata(){
  return {title:'把一點星光，送到你身邊',text:`${BASE_CONFIG.cardShareText||'我把一點雪、一點星光，還有想你的心意，都裝進這顆水晶球了。'}\n${BASE_CONFIG.cardShareUrl||'https://hlh.tw/2026-dyson-christmas'}`};
}
async function shareChristmasCard(){
  const blob=currentCardBlob();if(!blob||!validateCard().valid||cardSaving||cardExportBusy)return;
  const file=typeof File==='function'?new File([blob],`dyson-christmas-card.${cardFormat()}`,{type:blob.type}):null;
  let supported=false;try{supported=!!(file&&navigator.share&&navigator.canShare?.({files:[file]}));}catch{}
  if(!supported){downloadChristmasCard();$('card-status').textContent='此裝置未提供此格式的檔案分享，已準備下載。儲存後即可透過 LINE 等應用程式傳送。';return;}
  cardSaving=true;updateCardButtons();
  try{await navigator.share({files:[file],...cardShareMetadata()});markCardTask(cardFormat(),'share');trackActivity('card_share',{card_format:cardFormat(),method:'native'});$('card-status').textContent='已交由裝置的分享功能處理。';}
  catch(err){if(err.name==='AbortError')$('card-status').textContent='已取消分享，卡片仍可下載或再次分享。';else {downloadChristmasCard();$('card-status').textContent='目前無法開啟分享，已準備下載卡片檔案。';}}
  finally{cardSaving=false;updateCardButtons();}
}
$('card-open').addEventListener('click',openChristmasCard);
$('card-form').addEventListener('submit',e=>e.preventDefault());
for(const name of ['recipient','message','signature']){
  $(`card-${name}`).addEventListener('input',e=>{if(!e.isComposing)renderChristmasCard();});
  $(`card-${name}`).addEventListener('compositionend',renderChristmasCard);
  $(`card-${name}`).addEventListener('blur',()=>{cardTouched=true;renderChristmasCard();});
}
$('card-download').addEventListener('click',downloadChristmasCard);$('card-share').addEventListener('click',shareChristmasCard);
// Five-second, readability-first card exports. All encoding stays on this device.
const CARD_SECONDS=5,CARD_LIMITS={gif:4*1024*1024,mp4:4*1024*1024};
let cardMotionBase=null,cardMotionFlags=null,cardExportBusy=false,cardExportToken=0,cardExportStop=null;
let cardMediaOutputs=new Map(),cardMediaURL=null,cardVoiceURL=null,cardVoiceBuffer=null,cardVoiceBlob=null;
let cardRecorder=null,cardMicStream=null,cardRecordPending=false,cardRecordTimer=null,cardRecordClock=null,cardRecordToken=0,cardRecordStarted=0;
let cardMusicBuffer=null,cardMusicLoading=null,cardSupportPromise=null,cardMP4Support=null;
const cardFormat=()=>['gif','mp4','png'].includes($('card-format').value)?$('card-format').value:'gif';
const cardRecordingBusy=()=>cardRecordPending||!!cardRecorder;
const currentCardBlob=()=>cardMediaOutputs.get(cardFormat())?.blob||null;
const cardBytesLabel=bytes=>bytes<1024*1024?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1024/1024).toFixed(2)} MB`;
const cardYield=()=>new Promise(resolve=>setTimeout(resolve,0));
function cardAbort(){const e=new Error('已取消製作');e.name='AbortError';return e;}
function checkCardJob(token){if(token!==cardExportToken||!cardExportBusy)throw cardAbort();}
function clearCardMediaPreview(){
  $('card-video-preview').pause();$('card-video-preview').removeAttribute('src');$('card-video-preview').load();$('card-video-preview').hidden=true;
  $('card-gif-preview').removeAttribute('src');$('card-gif-preview').hidden=true;$('card-preview').hidden=false;
  if(cardMediaURL){URL.revokeObjectURL(cardMediaURL);cardMediaURL=null;}
}
function invalidateCardMedia(format){
  if(format)cardMediaOutputs.delete(format);else cardMediaOutputs.clear();
  if(!format||format==='png'){cardBlob=null;cardFile=null;}
  if(!format||cardFailedFormat===format)cardFailedFormat=null;
  clearCardMediaPreview();$('card-file-size').textContent='';
}
function updateCardMediaControls(){
  const busy=cardExportBusy||cardRecordingBusy()||cardSaving||cardCapturing,format=cardFormat(),valid=validateCard().valid&&!!cardSnapshot;
  $('card-generate').hidden=false;$('card-generate').disabled=busy||!valid||(format==='mp4'&&cardMP4Support===false);
  $('card-generate').textContent=cardExportBusy?'正在製作…':cardFailedFormat===format?'再試一次':format==='png'?'製作圖片卡片':'製作 5 秒卡片';$('card-generate').classList.toggle('is-busy',cardExportBusy);$('card-generate').setAttribute('aria-busy',String(cardExportBusy));
  $('card-audio-options').hidden=format!=='mp4';$('card-record').disabled=busy||!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder!=='function';
  $('card-record').textContent=cardVoiceBuffer?'重新錄音':'開始錄音';$('card-record').hidden=!!cardRecorder;
  $('card-record-stop').hidden=!cardRecorder;$('card-record-delete').disabled=busy||!cardVoiceBuffer;
  for(const id of ['card-recipient','card-message','card-signature','card-format','card-bgm'])$(id).disabled=busy;
  $('card-export-progress').hidden=!cardExportBusy;
  $('card-making').hidden=!cardExportBusy;$('card-making').parentElement.setAttribute('aria-busy',String(cardExportBusy));
  $('card-making-title').textContent=format==='png'?'正在製作圖片卡片…':'正在製作 5 秒卡片…';
  $('card-format-note').textContent=format==='gif'?'會動的祝福，無聲。':format==='png'?'靜態圖片。':cardMP4Support===false?'此瀏覽器暫時無法製作 MP4，請選擇 GIF 或 PNG。':'有配樂，也能錄下祝福。';
  $('card-format-note').classList.toggle('card-format-error',format==='mp4'&&cardMP4Support===false);
  if(!navigator.mediaDevices?.getUserMedia)$('card-record-status').textContent='目前環境未提供麥克風；仍可使用預設聖誕配樂。錄音請使用允許麥克風的安全網頁環境。';
}
function cardReadyMessage(){
  const blob=currentCardBlob();return blob?`卡片完成了 · ${cardFormat().toUpperCase()} · ${cardBytesLabel(blob.size)}，可以預覽、下載或分享。`:'';
}
function renderCardMediaResult(){
  const format=cardFormat(),result=cardMediaOutputs.get(format),blob=currentCardBlob();
  $('card-download').textContent=`下載${format==='png'?'圖片':format==='gif'?'動態圖片':'有聲影片'}`;
  $('card-preview-state').textContent=blob?'卡片完成了':'圖片預覽';
  $('card-file-size').textContent=blob?`${format.toUpperCase()} · ${cardBytesLabel(blob.size)}${format==='png'?'':' · 5 秒'}`:'';
  clearCardMediaPreview();
  $('card-preview-note').textContent=blob?`${format.toUpperCase()} · ${cardBytesLabel(blob.size)} · ${format==='gif'?'5 秒循環預覽，無聲':format==='mp4'?'按播放試看並試聽':'靜態圖片'}`:'';
  if(result&&format!=='png'){
    cardMediaURL=URL.createObjectURL(result.blob);const preview=$(format==='gif'?'card-gif-preview':'card-video-preview');preview.src=cardMediaURL;preview.hidden=false;$('card-preview').hidden=true;
  }
  updateCardMediaControls();
}
function revealCardResult(){
  if($('card-dialog').open&&matchMedia('(max-width:760px)').matches){
    $('card-preview-state').closest('.card-preview-area').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
}
function encodeCardPNG(token){
  return new Promise((resolve,reject)=>{
    const output=el('canvas');let timer,settled=false;
    const finish=(error,blob)=>{if(settled)return;settled=true;clearTimeout(timer);if(cardExportStop===stop)cardExportStop=null;output.width=1;output.height=1;error?reject(error):resolve(blob);};
    const stop=()=>finish(cardAbort());cardExportStop=stop;
    timer=setTimeout(()=>finish(new Error('圖片製作暫時沒有回應，請再試一次。')),20000);
    try{
      checkCardJob(token);cardMaking('整理圖片');paintChristmasCard(validateCard(),output);
      output.toBlob(blob=>{
        try{checkCardJob(token);if(!blob)throw new Error('圖片未能完成，請再試一次。');finish(null,blob);}catch(error){finish(error);}
      },'image/png');
    }catch(error){finish(error);}
  });
}
function captureCardMotionBase(){
  const c=el('canvas');c.width=SCENE_W;c.height=SCENE_H;const x=c.getContext('2d');
  x.save();x.translate(SCENE_W*(.5+SCENE_VIEW.shiftX),SCENE_H*.5);x.scale(SCENE_VIEW.zoom,SCENE_VIEW.zoom);x.translate(-SCENE_W*.5,-SCENE_H*.5);x.drawImage(cardBackground,0,0,SCENE_W,SCENE_H);
  x.save();globePath(x);x.clip();
  drawSnowBase(x);
  drawSnowPack(x,snowPack.depth);
  for(const p of placedObjects()){
    const h=p.h*p.scale,s=loadSprite(p.day);if(!s)continue;const w=h*s.bounds.w/s.bounds.h;
    if(p.day!==24&&p.y>=775){x.save();x.translate(p.x,p.y+3);x.scale(1,.19);const r=Math.max(12,w*.38),g=x.createRadialGradient(0,0,1,0,0,r);g.addColorStop(0,'rgba(15,35,53,.24)');g.addColorStop(1,'rgba(15,35,53,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,r,0,Math.PI*2);x.fill();x.restore();}
    drawSprite(x,p.day,p.x,p.y,h);if(isPlaced(1))drawObjectSnow(x,p,snowPack.depth);
  }
  if(isPlaced(1))drawSnowForeground(x,snowPack.depth);
  x.restore();x.restore();if(cardMotionBase){cardMotionBase.width=1;cardMotionBase.height=1;}cardMotionBase=c;
  cardMotionFlags={white:isPlaced(1),gold:isPlaced(13),warmth:isPlaced(13),candyRain:isPlaced(19),snowDepth:snowPack.depth,airflow:wind,show:isPlaced(25),objects:placedObjects().map(p=>({...p})),whitePool:snow.map(p=>({...p})),goldPool:goldFlakes.map(p=>({...p})),showTimeOrigin:(showStarted||performance.now())/1000};
}
function createCardMovieRenderer(width,height,withMusicCredit=false,imageWidth=600){
  const poster=el('canvas');paintChristmasCard(validateCard(),poster,cardMotionBase,{width,height});
  if(withMusicCredit){const c=poster.getContext('2d');c.font='16px sans-serif';c.textAlign='center';c.fillStyle='#c3b195';c.fillText('Jingle Bells — Kevin MacLeod / incompetech.com · CC BY 4.0: creativecommons.org/licenses/by/4.0 · 5s excerpt',600,1980);}
  const frame=el('canvas');frame.width=width;frame.height=height;const output=frame.getContext('2d',{willReadFrequently:true}),flags={...cardMotionFlags,whitePool:cardMotionFlags.whitePool.map(p=>({...p})),goldPool:cardMotionFlags.goldPool.map(p=>({...p}))};
  const scene=el('canvas');scene.width=Math.min(imageWidth,Math.round(width*.9));scene.height=Math.round(scene.width*SCENE_H/SCENE_W);const x=scene.getContext('2d',{willReadFrequently:true});
  let lastReplayTime=0,replaySeed=0x20261225;
  const replay={wind:flags.airflow,turbulence:0,activeSnow:flags.white,snowDepth:flags.snowDepth,random:()=>((replaySeed=(Math.imul(replaySeed,1664525)+1013904223)>>>0)/4294967296)};
  const resetReplay=()=>{flags.whitePool=cardMotionFlags.whitePool.map(p=>({...p}));flags.goldPool=cardMotionFlags.goldPool.map(p=>({...p}));replay.snowDepth=flags.snowDepth;lastReplayTime=0;replaySeed=0x20261225;};
  return {canvas:frame,sourceTimeline:flags.show?{start:0,end:5,duration:5}:null,dispose(){for(const c of [poster,frame,scene]){c.width=1;c.height=1;}},draw(t){
    x.setTransform(1,0,0,1,0,0);x.drawImage(cardMotionBase,0,0,scene.width,scene.height);x.save();x.scale(scene.width/SCENE_W,scene.height/SCENE_H);
    x.translate(SCENE_W*(.5+SCENE_VIEW.shiftX),SCENE_H*.5);x.scale(SCENE_VIEW.zoom,SCENE_VIEW.zoom);x.translate(-SCENE_W*.5,-SCENE_H*.5);globePath(x);x.clip();
    if(flags.show||flags.airflow||flags.white){
      const elapsed=Math.max(0,Math.min(5,t)),time=flags.showTimeOrigin+elapsed;
      x.drawImage(cardBackground,0,0,SCENE_W,SCENE_H);
      if(elapsed<lastReplayTime)resetReplay();
      replay.advanceOnly=true;
      while(lastReplayTime+1/60<=elapsed){
        lastReplayTime+=1/60;advanceSnowPack(replay,1/60,flags.white,flags.airflow);
        const counts=sceneParticleCounts({elapsed:lastReplayTime,finalShow:flags.show,animate:true,airflow:flags.airflow,activeSnow:flags.white,goldSnow:flags.gold,timeline:SHOW_CARD});
        drawSnowLayer(flags.whitePool,counts.whiteCount,1,flags.showTimeOrigin+lastReplayTime,true,x,replay);
        drawSnowLayer(flags.goldPool,counts.goldCount,1,flags.showTimeOrigin+lastReplayTime,true,x,replay);
      }
      replay.advanceOnly=false;
      paintGlobeContents(x,{time,elapsed,finalShow:flags.show,animate:true,activeSnow:flags.white,goldSnow:flags.gold,warmth:flags.warmth,candyRain:flags.candyRain,airflow:flags.airflow,objects:flags.objects,whitePool:flags.whitePool,goldPool:flags.goldPool,environment:replay,timeline:SHOW_CARD});
    }else{
    if(flags.warmth||flags.show){
      const g=x.createRadialGradient(625,680,30,625,680,410);g.addColorStop(0,`rgba(255,214,137,${.24+.07*Math.sin(t*Math.PI*2/5)})`);g.addColorStop(1,'rgba(255,179,74,0)');x.fillStyle=g;x.fillRect(215,270,820,820);
      for(let k=0;k<22;k++)starShape(x,300+k*137%640,255+k*83%560,k%5===0?7:3,.4+.4*(1+Math.sin(t*Math.PI*2/5+k))/2);
    }
    for(const [enabled,count,gold] of [[flags.white||flags.show,flags.show?160:110,false],[flags.gold||flags.show,120,true]])if(enabled){
      for(let k=0;k<count;k++){
        const phase=k*1.618,depth=k%3+1,px=270+k*137%730+Math.sin(t*Math.PI*2/5+phase)*9,py=210+((k*71+t*130*(depth===3?2:1))%650);
        x.fillStyle=gold?'#ffe0a4cc':'#fffdf4c9';x.beginPath();x.arc(px,py,1.6+k%3,0,Math.PI*2);x.fill();if(gold&&k%14===0)starShape(x,px,py,6,.8,phase);
      }
    }
    if(flags.white)drawLooseSnow(x,flags.snowDepth,t,flags.airflow?1:0,0);
    if(flags.candyRain)drawCandyRain(x,t);
    }
    x.restore();output.setTransform(1,0,0,1,0,0);output.drawImage(poster,0,0);output.save();output.scale(width/1200,height/2000);const p=CARD_LAYOUT.photo;cardRoundedRect(output,p.x,p.y,p.width,p.height,p.radius);output.clip();output.drawImage(scene,p.x,p.y,p.width,p.height);output.restore();return frame;
  }};
}
function cardMaking(stage,percent=null){
  $('card-making-stage').textContent=stage;
  $('card-making-percent').textContent=percent===null?'':`${Math.round(percent)}%`;
  if(percent===null)$('card-progress').removeAttribute('value');else $('card-progress').value=Math.round(percent);
}
function cardProgress(token,percent,message){
  checkCardJob(token);$('card-status').textContent=message;
  cardMaking(percent<5?'準備畫面與聲音':percent>=97?'整理檔案':'製作動畫',percent);
}
async function encodeCardGIF(options,token){
  const {GIFEncoder,quantize,applyPalette}=window.DysonMediaCodecs;
  const renderer=createCardMovieRenderer(options.width,options.height,false,options.imageWidth),gif=GIFEncoder(),frames=40;
  try{
  const w=options.width,h=options.height,p=CARD_LAYOUT.photo,photo={x:Math.floor(w*p.x/CARD_LAYOUT.width),y:Math.floor(h*p.y/CARD_LAYOUT.height),right:Math.ceil(w*(p.x+p.width)/CARD_LAYOUT.width),bottom:Math.ceil(h*(p.y+p.height)/CARD_LAYOUT.height)};
  photo.w=photo.right-photo.x;photo.h=photo.bottom-photo.y;
  const first=renderer.draw(0).getContext('2d'),all=new Uint8Array(first.getImageData(0,0,w,h).data);
  // A separate UI palette protects text, its antialiasing and the card background.
  const uiPixels=new Uint8Array((w*h-photo.w*photo.h)*4);let cursor=0;
  for(let y=0;y<h;y++){
    const start=y*w*4;
    if(y<photo.y||y>=photo.bottom){uiPixels.set(all.subarray(start,start+w*4),cursor);cursor+=w*4;}
    else{const left=photo.x*4,right=(w-photo.right)*4;uiPixels.set(all.subarray(start,start+left),cursor);cursor+=left;uiPixels.set(all.subarray(start+photo.right*4,start+w*4),cursor);cursor+=right;}
  }
  const fixed=[[244,238,228],[232,197,143],[237,207,159],[184,148,91],[185,164,136],[255,255,255],[20,29,41],[16,24,36]];
  const imagePalette=[...quantize(new Uint8Array(first.getImageData(photo.x,photo.y,photo.w,photo.h).data),options.colors,{format:'rgb565'}),...fixed];
  const uiPalette=[...quantize(uiPixels,64,{format:'rgb565'}),...fixed],uiOffset=imagePalette.length;
  const palette=[...imagePalette,...uiPalette],transparentIndex=palette.length;palette.push([0,0,0]);
  const protectedCard=applyPalette(all,uiPalette,'rgb565');for(let k=0;k<protectedCard.length;k++)protectedCard[k]+=uiOffset;
  let previousPhoto=null;
  for(let n=0;n<frames;n++){
    checkCardJob(token);const context=renderer.draw(n/8).getContext('2d'),pixels=new Uint8Array(context.getImageData(photo.x,photo.y,photo.w,photo.h).data),index=applyPalette(pixels,imagePalette,'rgb565');
    // The UI is written once. Later frames update only the photograph area.
    const delta=n===0?protectedCard.slice():new Uint8Array(w*h).fill(transparentIndex);
    for(let y=0;y<photo.h;y++)for(let x=0;x<photo.w;x++){
      const source=y*photo.w+x;if(!previousPhoto||index[source]!==previousPhoto[source])delta[(photo.y+y)*w+photo.x+x]=index[source];
    }
    gif.writeFrame(delta,w,h,{palette:n===0?palette:undefined,delay:n%2?130:120,repeat:0,dispose:1,transparent:n>0,transparentIndex});previousPhoto=index;
    cardProgress(token,(n+1)/frames*95,`正在製作 GIF · ${Math.round((n+1)/frames*100)}%`);await cardYield();
  }
  gif.finish();return new Blob([gif.bytesView()],{type:'image/gif'});
  }finally{renderer.dispose();}
}
// Card music prefers a short PCM WAV, independent of compressed AAC decoders.
async function cardDataBytes(src){
  if(typeof src!=='string'||!src)throw new Error('配樂檔案路徑未設定。');
  if(src.startsWith('data:')){const b=atob(src.slice(src.indexOf(',')+1));return Uint8Array.from(b,c=>c.charCodeAt(0)).buffer;}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(new URL(src,document.baseURI),{signal:controller.signal});
    if(!response.ok||/^(?:text\/|application\/json)/i.test(response.headers.get('content-type')||''))throw new Error('配樂檔案未完整上傳。');
    const bytes=await response.arrayBuffer();if(!bytes.byteLength)throw new Error('配樂檔案內容為空。');return bytes;
  }finally{clearTimeout(timer);}
}
async function cardDecodeAudio(bytes){
  const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Offline)throw new Error('此瀏覽器無法準備卡片聲音，請改用 GIF 或 PNG。');
  const ac=new Offline(1,44100,44100);return ac.decodeAudioData(bytes.slice(0));
}
async function loadCardMusic(){
  if(cardMusicBuffer)return cardMusicBuffer;
  if(!cardMusicLoading)cardMusicLoading=(async()=>{
    const sources=[...new Set([ASSETS.cardMusic?.src,ASSETS.cardMusic?.fallbackSrc,'./assets/audio/card-jingle-bells-5s-pcm-v38.wav'].filter(Boolean))];
    for(const src of sources){
      try{
        const buffer=await cardDecodeAudio(await cardDataBytes(src));
        if(!buffer.length||!buffer.numberOfChannels)continue;
        cardMusicBuffer=buffer;return buffer;
      }catch{/* Try the next complete source; never silently remove requested music. */}
    }
    throw new Error('卡片配樂無法讀取。請確認新版配樂檔已完整上傳，或先關閉「聖誕背景音樂」再製作。');
  })().finally(()=>{cardMusicLoading=null;});
  return cardMusicLoading;
}
async function mixCardAudio(){
  const rate=44100,count=rate*CARD_SECONDS,samples=new Float32Array(count),music=$('card-bgm').checked,voice=cardVoiceBuffer;
  if(music)await loadCardMusic();
  const read=(buffer,t)=>{if(!buffer||t>=buffer.duration)return 0;const pos=Math.min(buffer.length-1,Math.floor(t*buffer.sampleRate));let v=0;for(let c=0;c<buffer.numberOfChannels;c++)v+=buffer.getChannelData(c)[pos];return v/buffer.numberOfChannels;};
  for(let n=0;n<count;n++){
    const t=n/rate,fade=Math.min(1,t/.25,(5-t)/.45),bg=music?read(cardMusicBuffer,t)*(voice?.14:.43):0;
    const spoken=voice?read(voice,t)*Math.min(1,t/.035,Math.max(0,(Math.min(5,voice.duration)-t)/.08)):0;
    samples[n]=Math.max(-.95,Math.min(.95,bg*fade+spoken));
  }
  return {samples,rate};
}
// Keep probe and encoder configuration identical. Prefer CPU encoding; browsers
// may ignore the hint, so frames also enter as CPU RGBA with one frame in flight.
function cardVideoConfig(options,hardwareAcceleration='prefer-software'){
  return {codec:'avc1.42001f',width:options.width,height:options.height,bitrate:options.bitrate,framerate:options.fps,latencyMode:'realtime',hardwareAcceleration,avc:{format:'avc'}};
}
async function cardDetectMP4(){
  if(cardSupportPromise)return cardSupportPromise;
  cardSupportPromise=(async()=>{
    let web=false,videoConfig=null,audioWeb=false;
    try{
      if(typeof VideoEncoder==='function'&&typeof VideoFrame==='function'){
        for(const preference of ['prefer-software','no-preference']){const config=cardVideoConfig({width:720,height:1200,bitrate:2400000,fps:12},preference);if((await VideoEncoder.isConfigSupported(config)).supported){videoConfig=config;break;}}
        web=!!videoConfig;
      }
      if(typeof AudioEncoder==='function'&&typeof AudioData==='function')audioWeb=(await AudioEncoder.isConfigSupported({codec:'mp4a.40.2',sampleRate:44100,numberOfChannels:1,bitrate:64000})).supported;
    }catch{}
    let mime=null;try{if(typeof MediaRecorder==='function')mime=['video/mp4;codecs=avc1.42001f,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2'].find(m=>MediaRecorder.isTypeSupported(m))||null;}catch{}
    cardMP4Support=!!(web||mime);return {web,audioWeb,mime,videoConfig};
  })();return cardSupportPromise;
}
function cardEncodingWait(promise,token,timeout=15000,message='影片編碼暫時沒有回應，請稍後再試，或先下載 GIF／PNG。'){
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),timeout);})]).then(value=>{checkCardJob(token);return value;}).finally(()=>clearTimeout(timer));
}
async function validateCardMP4(blob,token){
  checkCardJob(token);const info=window.DysonMP4Support.validate(await blob.arrayBuffer(),{duration:CARD_SECONDS,minFrames:40});checkCardJob(token);return info;
}
async function encodeCardMP4WebCodecs(options,audio,token,support){
  // Video timestamps come from frame number, not how long rendering takes.
  const prepared=!support.audioWeb&&$('card-bgm').checked?window.DysonMP4Support.readAAC(await cardDataBytes('./assets/audio/card-jingle-bells-5s-aac-v48.m4a')):null;
  if(!support.audioWeb&&cardVoiceBuffer)throw new Error('此裝置需使用相容模式製作錄音影片。');
  checkCardJob(token);
  const withAudio=!!(support.audioWeb||prepared),{Muxer,ArrayBufferTarget}=window.DysonMediaCodecs,target=new ArrayBufferTarget(),muxer=new Muxer({target,video:{codec:'avc',width:options.width,height:options.height,frameRate:options.fps},...(withAudio?{audio:{codec:'aac',sampleRate:prepared?.rate||audio.rate,numberOfChannels:1}}:{}),fastStart:'in-memory',firstTimestampBehavior:'offset'});
  let failure=null,video=null,sound=null,renderer=null,videoFrames=0;
  const close=()=>{for(const encoder of [video,sound])if(encoder&&encoder.state!=='closed')try{encoder.close();}catch{}};cardExportStop=close;
  try{
    const fail=e=>{failure=e;};video=new VideoEncoder({output:(chunk,meta)=>{try{muxer.addVideoChunk(chunk,meta);videoFrames++;}catch(e){fail(e);}},error:fail});
    video.configure({...support.videoConfig,width:options.width,height:options.height,bitrate:options.bitrate,framerate:options.fps});
    if(prepared){
      for(let n=0;n<prepared.samples.length;n++){const sample=prepared.samples[n];muxer.addAudioChunkRaw(sample.data,'key',sample.timestamp,sample.duration,n===0?{decoderConfig:{codec:'mp4a.40.2',sampleRate:prepared.rate,numberOfChannels:1,description:prepared.description}}:undefined);}
    }else if(support.audioWeb){
      sound=new AudioEncoder({output:(chunk,meta)=>{try{muxer.addAudioChunk(chunk,meta);}catch(e){fail(e);}},error:fail});sound.configure({codec:'mp4a.40.2',sampleRate:audio.rate,numberOfChannels:1,bitrate:64000});
      for(let offset=0;offset<audio.samples.length;offset+=1024){checkCardJob(token);const data=audio.samples.subarray(offset,offset+1024),frame=new AudioData({format:'f32',sampleRate:audio.rate,numberOfChannels:1,numberOfFrames:data.length,timestamp:Math.round(offset/audio.rate*1e6),data});try{sound.encode(frame);}finally{frame.close();}if(sound.encodeQueueSize>=8)await cardEncodingWait(sound.flush(),token);if(failure)throw failure;}
      await cardEncodingWait(sound.flush(),token);if(failure)throw failure;sound.close();
    }
    renderer=createCardMovieRenderer(options.width,options.height,$('card-bgm').checked);
    const frames=options.fps*CARD_SECONDS;
    for(let n=0;n<frames;n++){
      checkCardJob(token);const pixels=renderer.draw(n/options.fps).getContext('2d').getImageData(0,0,options.width,options.height),timestamp=Math.round(n/options.fps*1e6),end=Math.round((n+1)/options.fps*1e6);
      const frame=new VideoFrame(pixels.data,{format:'RGBA',codedWidth:options.width,codedHeight:options.height,timestamp,duration:end-timestamp});
      try{video.encode(frame,{keyFrame:n%options.fps===0});}finally{frame.close();}
      if(video.encodeQueueSize>=3)await cardEncodingWait(video.flush(),token);if(failure)throw failure;
      cardProgress(token,(n+1)/frames*94,`正在製作 MP4 · ${Math.round((n+1)/frames*100)}%`);await cardYield();
    }
    await cardEncodingWait(video.flush(),token);if(failure)throw failure;if(videoFrames!==frames)throw new Error('影片影格未完整編碼，請重新製作。');
    checkCardJob(token);cardMaking('檢查影片完整性');muxer.finalize();const blob=new Blob([target.buffer],{type:'video/mp4'});await validateCardMP4(blob,token);return blob;
  }catch(e){if(token!==cardExportToken)throw cardAbort();throw e;}
  finally{close();renderer?.dispose();if(cardExportStop===close)cardExportStop=null;}
}
async function encodeCardMP4Recorder(options,audio,mime,token){
  // Compatibility path: prepare lightweight frames before starting the clock.
  let ac=null,source=null,stream=null,renderer=null,recorder=null,capture=null,current=null,next=null,timer=null;
  const stop=()=>{if(recorder&&recorder.state!=='inactive')recorder.stop();};cardExportStop=stop;const frames=[];
  try{
    renderer=createCardMovieRenderer(options.width,options.height,$('card-bgm').checked,480);
    const total=options.fps*CARD_SECONDS;
    for(let n=0;n<total;n++){
      checkCardJob(token);const c=renderer.draw(n/options.fps),blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('影片畫面準備失敗。')),'image/jpeg',.95));frames.push(blob);
      cardProgress(token,(n+1)/total*55,`正在準備影片 · ${Math.round((n+1)/total*100)}%`);await cardYield();
    }
    renderer.dispose();renderer=null;
    capture=el('canvas','card-recording-preview');capture.width=options.width;capture.height=options.height;capture.setAttribute('aria-hidden','true');$('card-making').append(capture);const x=capture.getContext('2d');
    const AC=window.AudioContext||window.webkitAudioContext;ac=new AC({sampleRate:audio.rate});const destination=ac.createMediaStreamDestination(),buffer=ac.createBuffer(1,audio.samples.length,audio.rate);buffer.getChannelData(0).set(audio.samples);source=ac.createBufferSource();source.buffer=buffer;source.connect(destination);
    stream=capture.captureStream(0);const track=stream.getVideoTracks()[0];if(typeof track.requestFrame!=='function'){stream.getTracks().forEach(t=>t.stop());stream=capture.captureStream(options.fps);}destination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
    recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:options.bitrate,audioBitsPerSecond:64000});const parts=[];
    const stopped=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};recorder.onstop=resolve;recorder.onerror=e=>reject(e.error||new Error('影片錄製失敗。'));});
    current=await createImageBitmap(frames[0]);x.drawImage(current,0,0);await cardEncodingWait(ac.resume(),token);checkCardJob(token);recorder.start();source.start();const started=performance.now();
    for(let n=0;n<total;n++){
      checkCardJob(token);if(n){current?.close();current=await next;}next=n+1<total?createImageBitmap(frames[n+1]):null;
      const delay=started+n/options.fps*1000-performance.now();if(delay>0)await new Promise(resolve=>{timer=setTimeout(resolve,delay);});checkCardJob(token);x.drawImage(current,0,0);track.requestFrame?.();
      await new Promise(resolve=>requestAnimationFrame(resolve));cardProgress(token,55+(n+1)/total*40,`正在錄製影片 · ${Math.round((n+1)/total*100)}%`);
    }
    const remaining=started+CARD_SECONDS*1000-performance.now();if(remaining>0)await new Promise(resolve=>{timer=setTimeout(resolve,remaining);});checkCardJob(token);stop();await cardEncodingWait(stopped,token);const blob=new Blob(parts,{type:'video/mp4'});cardMaking('檢查影片完整性');await validateCardMP4(blob,token);return blob;
  }catch(e){if(token!==cardExportToken)throw cardAbort();throw e;}
  finally{
    clearTimeout(timer);try{stop();}catch{}try{source?.stop();}catch{}source?.disconnect();stream?.getTracks().forEach(t=>t.stop());if(ac&&ac.state!=='closed')await ac.close().catch(()=>{});current?.close();if(next)next.then(b=>b.close()).catch(()=>{});capture?.remove();renderer?.dispose();frames.length=0;if(cardExportStop===stop)cardExportStop=null;
  }
}
async function generateCardMedia(){
  if(cardExportBusy||cardCapturing||cardSaving||cardRecordingBusy()||!validateCard().valid||!cardMotionBase)return false;
  const format=cardFormat();
  if(currentCardBlob()){renderCardMediaResult();updateCardButtons();$('card-status').textContent=cardReadyMessage();revealCardResult();return true;}
  const token=++cardExportToken;let completed=false;
  cardExportBusy=true;cardFailedFormat=null;clearCardMediaPreview();updateCardButtons();
  cardMaking('準備畫面');$('card-status').textContent=format==='png'?'正在製作圖片卡片…':'正在製作 5 秒卡片…';
  try{
    await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));checkCardJob(token);
    if(document.fonts?.ready){await cardEncodingWait(document.fonts.ready,token,30000,'字型載入較慢，內容已保留，請稍後再試一次。');checkCardJob(token);}
    let blob=null,chosen=null;
    if(format==='png'){
      blob=await encodeCardPNG(token);chosen={width:1200,height:2000};
    }else if(format==='gif'){
      for(const options of [{width:720,height:1200,colors:175,imageWidth:600},{width:720,height:1200,colors:127,imageWidth:540}]){
        blob=await encodeCardGIF(options,token);chosen=options;if(blob.size<=CARD_LIMITS.gif)break;cardMaking('調整圖片細節');
      }
    }else{
      const support=await cardDetectMP4();if(!support.web&&!support.mime)throw new Error('此瀏覽器未提供可用的 MP4 編碼，請改用 GIF 或 PNG。');
      cardMaking('準備配樂與祝福聲音');const audio=await mixCardAudio();checkCardJob(token);
      const options={width:720,height:1200,fps:12,bitrate:2400000};
      if(support.web&&(!cardVoiceBuffer||support.audioWeb)){
        try{blob=await encodeCardMP4WebCodecs(options,audio,token,support);}catch(e){checkCardJob(token);if(!support.mime)throw e;blob=await encodeCardMP4Recorder(options,audio,support.mime,token);}
      }else if(support.mime)blob=await encodeCardMP4Recorder(options,audio,support.mime,token);
      else throw new Error('此裝置暫時無法製作含錄音的 MP4，請改用 GIF／PNG，或刪除錄音後重試。');
      chosen=options;
    }
    checkCardJob(token);
    cardMediaOutputs.set(format,{blob,...chosen,duration:format==='png'?0:5});
    if(format==='png'){cardBlob=blob;if(typeof File==='function')cardFile=new File([blob],'dyson-christmas-card.png',{type:'image/png'});}
    completed=true;trackActivity('card_generate',{card_format:format,status:'success',has_voice:!!cardVoiceBuffer,has_bgm:$('card-bgm').checked});$('card-status').textContent=cardReadyMessage()+(blob.size>CARD_LIMITS[format]?' 此場景檔案較大，已優先保留文字清晰度。':'');return true;
  }catch(e){
    if(e.name!=='AbortError'){cardFailedFormat=format;trackActivity('card_generate',{card_format:format,status:'failure'});}
    $('card-status').textContent=e.name==='AbortError'?'已取消製作，文字、錄音與擺設已保留。':`製作未完成：${e.message} 文字、錄音與擺設已保留，可按「再試一次」。`;return false;
  }finally{
    cardExportBusy=false;cardExportStop=null;lastFrame=0;renderCardMediaResult();updateCardButtons();if(completed)revealCardResult();
  }
}
function cancelCardExport(){if(!cardExportBusy)return;++cardExportToken;cardExportStop?.();}
function stopCardRecording(){if(cardRecorder&&cardRecorder.state!=='inactive')cardRecorder.stop();}
async function startCardRecording(){
  if(cardExportBusy||cardRecordingBusy()||!navigator.mediaDevices?.getUserMedia)return;
  const token=++cardRecordToken;cardRecordPending=true;pauseMusic(true);renderMusic();$('card-video-preview').pause();$('card-voice-preview').pause();updateCardButtons();$('card-record-status').textContent='請允許麥克風，準備好後會開始最多 5 秒的錄音。';
  let stream=null;
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
    if(token!==cardRecordToken||!$('card-dialog').open){stream.getTracks().forEach(t=>t.stop());return;}
    cardMicStream=stream;
    const mime=typeof MediaRecorder==='function'?['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m)):null;
    const recorder=new MediaRecorder(stream,mime?{mimeType:mime,audioBitsPerSecond:32000}:{}),chunks=[];cardRecorder=recorder;cardRecordPending=false;
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    recorder.onstop=async()=>{
      clearTimeout(cardRecordTimer);clearInterval(cardRecordClock);stream.getTracks().forEach(t=>t.stop());cardMicStream=null;cardRecorder=null;
      if(token!==cardRecordToken){updateCardButtons();return;}
      cardRecordPending=true;updateCardButtons();
      try{
        const blob=new Blob(chunks,{type:recorder.mimeType}),buffer=await cardDecodeAudio(await blob.arrayBuffer());if(token!==cardRecordToken)return;
        if(!buffer.length)throw new Error('未錄到聲音。');cardVoiceBuffer=buffer;cardVoiceBlob=blob;
        if(cardVoiceURL)URL.revokeObjectURL(cardVoiceURL);cardVoiceURL=URL.createObjectURL(blob);$('card-voice-preview').src=cardVoiceURL;$('card-voice-preview').hidden=false;
        invalidateCardMedia('mp4');$('card-record-time').textContent=`${Math.min(5,buffer.duration).toFixed(1)}／5 秒`;$('card-record-status').textContent='錄音已保留，可以試聽或重新錄製。製作 MP4 時會自動降低配樂音量。';
      }catch{if(token===cardRecordToken)$('card-record-status').textContent='錄音無法讀取，請再錄一次；原有錄音若有則保留。';}
      finally{if(token===cardRecordToken){cardRecordPending=false;updateCardButtons();renderCardMediaResult();}}
    };
    recorder.onerror=()=>{$('card-record-status').textContent='錄音中斷，請重新錄製。';stopCardRecording();};
    recorder.start();cardRecordStarted=performance.now();$('card-record-time').textContent='0.0／5 秒';$('card-record-status').textContent='正在錄音，說一句想送給對方的祝福吧。';
    cardRecordClock=setInterval(()=>{$('card-record-time').textContent=`${Math.min(5,(performance.now()-cardRecordStarted)/1000).toFixed(1)}／5 秒`;},100);
    cardRecordTimer=setTimeout(stopCardRecording,5000);updateCardButtons();
  }catch(e){stream?.getTracks().forEach(t=>t.stop());if(token!==cardRecordToken)return;cardMicStream=null;cardRecorder=null;cardRecordPending=false;$('card-record-status').textContent=e.name==='NotAllowedError'?'未取得麥克風權限，仍可只使用聖誕配樂。':'目前無法錄音，仍可只使用聖誕配樂。';updateCardButtons();}
  finally{if(token===cardRecordToken&&!cardRecorder){cardRecordPending=false;updateCardButtons();}}
}
function abortCardMicrophone(){
  ++cardRecordToken;clearTimeout(cardRecordTimer);clearInterval(cardRecordClock);stopCardRecording();cardMicStream?.getTracks().forEach(t=>t.stop());cardMicStream=null;cardRecordPending=false;
}
function deleteCardRecording(){
  if(cardRecordingBusy()||cardExportBusy)return;cardVoiceBuffer=null;cardVoiceBlob=null;
  $('card-voice-preview').pause();$('card-voice-preview').removeAttribute('src');$('card-voice-preview').hidden=true;if(cardVoiceURL)URL.revokeObjectURL(cardVoiceURL);cardVoiceURL=null;
  $('card-record-time').textContent='0.0／5 秒';$('card-record-status').textContent='已刪除錄音，MP4 會使用目前的背景音樂設定。';invalidateCardMedia('mp4');updateCardButtons();renderCardMediaResult();
}
$('card-format').value='gif';
$('card-format').addEventListener('change',()=>{renderCardMediaResult();updateCardButtons();$('card-status').textContent=currentCardBlob()?cardReadyMessage():cardFailedFormat===cardFormat()?'製作未完成，內容已保留，可按「再試一次」。':cardFormat()==='png'?'按下製作圖片卡片，完成後即可下載或分享。':'按下製作，產生這個格式的 5 秒卡片。';});
$('card-bgm').addEventListener('change',()=>{invalidateCardMedia('mp4');updateCardButtons();renderCardMediaResult();$('card-status').textContent='聲音設定已更新，按下製作即可產生新的影片。';});
$('card-generate').addEventListener('click',generateCardMedia);$('card-cancel-export').addEventListener('click',cancelCardExport);$('card-making-cancel').addEventListener('click',cancelCardExport);
$('card-record').addEventListener('click',startCardRecording);$('card-record-stop').addEventListener('click',stopCardRecording);$('card-record-delete').addEventListener('click',deleteCardRecording);
$('card-dialog').addEventListener('close',()=>{cancelCardExport();abortCardMicrophone();$('card-voice-preview').pause();$('card-video-preview').pause();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)return;if(cardRecordPending&&!cardRecorder){abortCardMicrophone();updateCardButtons();}else if(cardRecorder)stopCardRecording();if(cardExportBusy)cancelCardExport();});
window.addEventListener('pagehide',()=>{cancelCardExport();abortCardMicrophone();});

async function exportConfig(){
  const button=$('studio-export');button.disabled=true;
  try{
    const config={...BASE_CONFIG,items:BASE_CONFIG.items.map(i=>configuredItem(i.day)),rewards:configuredRewards()},assetData={...ASSETS,custom:Object.fromEntries([...customAssets].map(([d,v])=>[d,v.src]))};
    const serialize=value=>JSON.stringify(value,null,2).replace(/</g,'\\u003c');
    const code='/* Dyson 活動設定。以本檔取代網站 assets/js/config.js。僅包含活動設定與素材，不包含參加者 Email、收藏、模擬進度、卡片留言或錄音。 */\n'+
      'window.DYSON_CLOUD_CONFIG = '+serialize({endpoint:cloud.endpoint})+';\n\n'+
      'window.DYSON_GAME_CONFIG = '+serialize(config)+';\n\n'+
      'window.DYSON_ASSETS = '+serialize(assetData)+';\n';
    const blob=new Blob([code],{type:'text/javascript;charset=utf-8'}),url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download='config.js';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
    $('config-status').textContent='已下載活動設定與自訂素材。請取代網站 assets/js/config.js；參加者資料與模擬進度不會匯出。';return true;
  }catch(err){$('config-status').textContent=`匯出失敗：${err.message}`;return false;}finally{button.disabled=false;}
}
$('today-open').addEventListener('click',()=>{if(today()===26)$('collection-section').scrollIntoView({behavior:'smooth'});else if(today()>=1)openDay(today());});
$('show-replay').addEventListener('click',startShow);$('show-stop').addEventListener('click',()=>{stopShow(true);drawFrame(0,performance.now());status('已停止星光秀。收藏與擺放保留。');});
$('shake-button').addEventListener('click',()=>shake());$('wind-button').addEventListener('click',()=>{wind=!wind;if(wind)chime();renderUI();});
$('edit-toggle').addEventListener('click',()=>{editMode=!editMode;if(!editMode)selectItem(null);else status('選取球內物件後拖曳。動物與一般造景可往球內上方移動，產品與雪丘保持靠近球底。');renderUI();});
$('motion-toggle').addEventListener('click',()=>{motion=!motion;if(!motion)wind=false;renderUI();drawFrame(0,performance.now());});
$('reset-layout').addEventListener('click',()=>{state().layouts={};persist();updateSelection();status('已還原預設位置，收藏與領取紀錄保留。');});
$('scale-control').addEventListener('input',e=>{if(!selectedDay)return;const l=getLayout(selectedDay);l.scale=Number(e.target.value);state().layouts[selectedDay]=constrain(selectedDay,l);persist();drawFrame(0,performance.now());});
$('selected-reset').addEventListener('click',()=>{if(!selectedDay)return;delete state().layouts[selectedDay];persist();updateSelection();});
$('selected-detail').addEventListener('click',()=>{if(selectedDay)openItem(selectedDay);});
$('item-placement').addEventListener('click',()=>{if(currentModalDay)togglePlacement(currentModalDay);});
$('item-position').addEventListener('click',()=>{if(!currentModalDay||!isPlaced(currentModalDay))return;const d=currentModalDay;if(d===25){startShow();return;}editMode=true;selectItem(d);closeDialog('item-dialog');renderUI();$('globe-wrapper').scrollIntoView({behavior:'smooth',block:'center'});});
function renderAudioEntry(){
  $('sound-toggle').textContent=sound?'開啟':'關閉';$('sound-toggle').setAttribute('aria-pressed',String(sound));
  $('audio-open').classList.toggle('audio-active',sound||musicPlaying);
  $('audio-open').setAttribute('aria-label',`音訊，音樂${musicPlaying?'播放中':'關閉'}，操作音效${sound?'開啟':'關閉'}`);
}
function closeAudioPanel(restoreFocus=false){
  const panel=$('audio-panel'),hadFocus=panel.contains(document.activeElement);
  panel.hidden=true;$('audio-open').setAttribute('aria-expanded','false');
  if(restoreFocus&&hadFocus)$('audio-open').focus({preventScroll:true});
}
$('audio-open').addEventListener('click',()=>{
  const opening=$('audio-panel').hidden;$('audio-panel').hidden=!opening;$('audio-open').setAttribute('aria-expanded',String(opening));
  if(opening)$('audio-close').focus({preventScroll:true});
});
$('audio-close').addEventListener('click',()=>closeAudioPanel(true));
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.audio-menu'))closeAudioPanel();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('audio-panel').hidden){e.preventDefault();closeAudioPanel(true);}});
document.addEventListener('focusin',e=>{if(!e.target.closest('.audio-menu'))closeAudioPanel();});
$('sound-toggle').addEventListener('click',()=>{sound=!sound;renderAudioEntry();if(sound)chime();});
$('vouchers-open').addEventListener('click',()=>{renderVouchers();showDialog('vouchers-dialog');});
$('studio-open').addEventListener('click',()=>{if(!canPreview())return;renderStudio();renderCloud();showDialog('studio-dialog');});$('preview-start').addEventListener('click',()=>{try{setPreview($('preview-date').value);}catch(e){$('config-status').textContent=e.message;}});
$('preview-exit').addEventListener('click',exitPreview);
$('preview-fill').addEventListener('click',()=>fillPreviewTo($('preview-date').value));
$('preview-clear').addEventListener('click',clearPreview);
$('sim-date').addEventListener('change',()=>{try{setPreview($('sim-date').value);}catch(error){status(error.message);$('quick-sim-note').textContent=error.message;}});
$('quick-sim-toggle').addEventListener('click',()=>{
  if(!canPreview())return;
  if(!$('quick-sim-panel').hidden){collapseSimulation();return;}
  $('quick-sim-panel').hidden=false;
  if(!previewDate){const iso=dateISO();$('sim-date').value=iso>=`${YEAR}-11-30`&&iso<=`${YEAR}-12-26`?iso:`${YEAR}-12-01`;}
  renderQuickSimulation();$('sim-date').focus();
});
$('quick-sim-done').addEventListener('click',()=>{try{if(!previewDate||$('sim-date').value!==previewDate)setPreview($('sim-date').value);collapseSimulation();}catch(error){$('quick-sim-note').textContent=error.message;}});
$('quick-sim-exit').addEventListener('click',exitPreview);
$('config-save').addEventListener('click',()=>{try{applyConfig(JSON.parse($('config-json').value),JSON.parse($('reward-json').value));$('config-status').textContent='設定已套用。';}catch(e){$('config-status').textContent=e.message;}});
$('config-reset').addEventListener('click',()=>{settings={};rewardSettings={};safeWrite(STORAGE_PREFIX+'config',settings);safeWrite(STORAGE_PREFIX+'rewards-v2',rewardSettings);renderUI();renderStudio();$('config-status').textContent='已還原內容草案，收藏紀錄與圖片保留。';});
$('studio-export').addEventListener('click',exportConfig);
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.dataset.close)));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
window.addEventListener('resize',resize);if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe($('globe-wrapper'));
let lastDay=dateISO();setInterval(()=>{if(cloud.isAdmin&&cloud.adminToken&&Date.now()+cloud.offset>=cloud.adminSessionExpiresAt){cloudRequireAdminAuth({message:'管理員驗證已到期，請重新輸入驗證碼。'});return;}if(previewDate||document.hidden)return;const next=dateISO();if(next!==lastDay){lastDay=next;renderUI();if($('item-dialog').open&&currentModalDay&&dayState(currentModalDay)!=='owned')closeDialog('item-dialog');status('新的一天開始了，可領取今天以前的禮物。');if(cloud.ready)cloudConnect(cloud.email).catch(()=>{});}},10000);
async function initialise(){
 $('scene-loading').hidden=true;renderUI();resize();
 if(cloud.email)cloudConnect(cloud.email).catch(()=>{});
 // Fonts are fetched concurrently and awaited only when exporting a text card.
 if(document.fonts?.load)Promise.all([document.fonts.load('400 14px "Source Han Sans TC"'),document.fonts.load('700 14px "Source Han Sans TC"')]).catch(()=>{});
 try{
  const background=$('empty-globe');
  if(!background.complete||!background.naturalWidth)await background.decode();
  if(!background.naturalWidth)throw new Error('雪境背景暫時無法載入，請重新整理。');
  sprites.clear();
  for(const [d,src] of Object.entries(ASSETS.custom||{}))if(ownedDays().includes(Number(d)))try{customAssets.set(Number(d),{src,image:await imageLoad(src)});}catch{}
  sceneReady=true;timing.sceneReadyMs=Math.round(performance.now()-timing.started);renderUI();resize();requestAnimationFrame(loop);
  ensureItemAssets(ownedDays()).then(()=>{renderUI();drawFrame(0,performance.now());});
  openDatabase().then(()=>{sprites.clear();renderUI();drawFrame(0,performance.now());}).catch(()=>{});
 }catch(error){$('scene-loading').hidden=false;$('scene-loading').classList.remove('is-busy');$('scene-loading').textContent='素材尚未載入，請重新整理。';status(error.message,{persistent:true});}
}
let currentTrackId=null,musicEnabled=false,musicPlaying=false,musicPlayToken=0,showMusic=false,showResumeTrack=null;
const TRACKS=ASSETS.music||[],audio=$('music-player');audio.volume=.28;
const trackAvailable=t=>dayState(t.day)==='owned';
function pauseMusic(disable=true){
  musicPlayToken++;audio.pause();musicPlaying=false;
  if(disable){musicEnabled=false;showMusic=false;showResumeTrack=null;}
}
async function playMusic(id,{show=false,restart=false}={}){
  const track=TRACKS.find(t=>t.id===id);if(!track||!trackAvailable(track))return false;
  const token=++musicPlayToken;audio.pause();
  const changed=currentTrackId!==id||!audio.src;
  if(changed)audio.src=track.src;
  if(changed||restart||show)audio.currentTime=show?(track.showOffset||0):0;
  audio.loop=!show;currentTrackId=id;musicEnabled=true;musicPlaying=true;showMusic=show;
  if(!show)showResumeTrack=null;renderMusic();
  try{await audio.play();if(token!==musicPlayToken)return false;return true;}
  catch(error){if(token===musicPlayToken){musicPlaying=false;musicEnabled=false;showMusic=false;showResumeTrack=null;renderMusic();status('音樂尚未播放，請再按一次播放音樂。');}return false;}
}
function startShowMusic(){
  if(!musicEnabled)return;
  const track=TRACKS.find(t=>t.day===25);if(!track||!trackAvailable(track))return;
  if(!showMusic)showResumeTrack=musicPlaying?currentTrackId:null;
  playMusic(track.id,{show:true,restart:true});
}
function finishShowMusic(resume){
  if(!showMusic){showResumeTrack=null;return;}
  const restore=showResumeTrack;showResumeTrack=null;showMusic=false;pauseMusic(false);
  if(resume&&musicEnabled&&restore&&TRACKS.some(t=>t.id===restore&&trackAvailable(t)))playMusic(restore);
  else {musicEnabled=false;renderMusic();}
}
function renderMusic(){
  renderAudioEntry();
  const unlocked=TRACKS.filter(trackAvailable);
  if(currentTrackId&&!unlocked.some(t=>t.id===currentTrackId)){pauseMusic(true);currentTrackId=null;}
  if(!currentTrackId&&unlocked.length)currentTrackId=unlocked[0].id;
  const select=$('music-track');select.replaceChildren();
  if(!unlocked.length){const option=el('option','','等待解鎖聖誕旋律');option.value='';select.append(option);}
  for(const t of TRACKS){const available=trackAvailable(t),option=el('option','',available?`♫ ${t.label}`:`12/${t.day} · 音樂尚未解鎖`);option.value=t.id;option.disabled=!available;select.append(option);}
  select.value=currentTrackId||'';select.disabled=!unlocked.length;
  $('music-play').disabled=!unlocked.length;$('music-play').textContent=musicPlaying?'暫停音樂':'播放音樂';$('music-play').setAttribute('aria-pressed',String(musicPlaying));
  $('music-now').textContent=musicPlaying?`${showMusic?'演出配樂':'正在播放'} · ${TRACKS.find(t=>t.id===currentTrackId)?.label}`:`已解鎖 ${unlocked.length} / ${TRACKS.length} 首 · 音樂預設關閉`;
  renderAudioEntry();$('item-music').hidden=true;
  if(currentModalDay){const t=TRACKS.find(t=>t.day===Number(currentModalDay));if(t&&trackAvailable(t)){$('item-music').hidden=false;$('item-music').textContent=`另已解鎖「${t.label}」。可在頂部「音訊」選擇播放。`;}}
}
function renderMusicCredits(){
  const root=$('music-credits-list');root.replaceChildren();
  for(const t of TRACKS){
    const card=el('article','music-credit-card');card.append(el('h3','',t.title),el('p','','Kevin MacLeod · incompetech.com'));
    const source=el('a','','原始曲目與下載');source.href=t.source;source.target='_blank';source.rel='noopener noreferrer';
    const license=el('a','','Creative Commons Attribution 4.0');license.href='https://creativecommons.org/licenses/by/4.0/';license.target='_blank';license.rel='noopener noreferrer';
    const links=el('div','credit-links');links.append(source,license);card.append(links,el('p','',`ISRC：${t.isrc}`),el('p','','本遊戲將原錄音轉為 AAC；星光秀使用節錄並控制播放音量。原作者未為本活動或品牌背書。'));root.append(card);
  }
}
$('music-play').addEventListener('click',()=>{if(musicPlaying){pauseMusic(true);renderMusic();}else if(currentTrackId)playMusic(currentTrackId);});
$('music-track').addEventListener('change',()=>{const id=$('music-track').value;if(!TRACKS.some(t=>t.id===id&&trackAvailable(t)))return;if(musicPlaying)playMusic(id,{restart:true});else {currentTrackId=id;showResumeTrack=null;renderMusic();}});
$('music-volume').addEventListener('input',()=>{audio.volume=Math.max(0,Math.min(1,Number($('music-volume').value)));});
$('music-credits-open').addEventListener('click',()=>{closeAudioPanel();renderMusicCredits();showDialog('music-credits-dialog');});
audio.addEventListener('ended',()=>{if(showMusic)finishShowMusic(true);else {musicPlaying=false;musicEnabled=false;renderMusic();}});
audio.addEventListener('error',()=>{pauseMusic(true);renderMusic();status('音樂無法讀取，請重新整理活動頁面。',{persistent:true});});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(showActive())showPausedAt=performance.now();if(musicPlaying){pauseMusic(true);renderMusic();}}
  else if(showPausedAt!==null){const delay=performance.now()-showPausedAt;showStarted+=delay;showUntil+=delay;showPausedAt=null;}
});


document.addEventListener('click',event=>{
  const a=event.target.closest?.('a.product-link,#product-link');
  if(a){const found=BASE_CONFIG.items.find(i=>i.product&&validatedProductURL(i.product.url)===a.href);trackActivity('product_click',{...(found?giftAnalytics(found.day):{}),link_url:a.href});}
  const control=event.target.closest?.('#shake-button,#wind-button,#motion-toggle,#reset-layout');
  if(control&&!control.disabled)trackActivity('globe_control',{action:control.id});
});

window.__DYSON_GAME__={analyticsAllowed,cloud:{enabled:cloudEnabled,connect:cloudConnect,flush:cloudFlush,canPreview,status:()=>({ready:cloud.ready,email:cloud.email,error:cloud.error,saving:!!cloud.saving,marketingSaving:!!cloud.marketingSaving,previewLoaded:cloud.previewLoaded,previewPending:Object.keys(previewPending()).length>0,hasExclusive:cloud.hasExclusive})},Core,claimDay,openDay,setPreview,exitPreview,participationDates,dayState,rewardProgress,rewards,state:()=>state(),live:()=>live,preview:()=>preview,items,applyConfig,constrain,getLayout,selected:()=>selectedDay,selectItem,moveSelected,renderUI,ready:()=>sceneReady,snapshotSprite:d=>loadSprite(d)?.image,cards:{count:cardCount,validate:validateCard,capture:captureCardScene,open:openChristmasCard,render:renderChristmasCard,download:downloadChristmasCard,share:shareChristmasCard,snapshot:()=>cardSnapshot,capturedAt:()=>cardCapturedAt,shareMetadata:cardShareMetadata,blob:()=>cardBlob,format:cardFormat,generate:generateCardMedia,outputs:()=>cardMediaOutputs,renderer:createCardMovieRenderer,limits:CARD_LIMITS,cancel:cancelCardExport,record:startCardRecording,stopRecord:stopCardRecording,deleteRecord:deleteCardRecording,mixAudio:mixCardAudio,voice:()=>cardVoiceBuffer,exporting:()=>cardExportBusy},diagnostics:()=>({timing:{...timing},errors:[...spriteErrors],assetSources:{builtin:builtinAssets.size,custom:customAssets.size},objects:placedObjects(),effects:frameEffects,showUntil,showStarted,view:SCENE_VIEW,music:{currentTrackId,musicEnabled,musicPlaying,showMusic},sprites:[...sprites].map(([day,s])=>({day,bounds:s.bounds})),regions:hitRegions.map(r=>r.rect)})};
if(!safeRead(welcomeSeenKey,false))openWelcome();
initialise();
})();
