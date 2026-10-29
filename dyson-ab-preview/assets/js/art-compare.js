/* A/B artwork review. Edit labels and folders here; image filenames stay stable. */
(()=>{
 'use strict';
 const params=new URLSearchParams(location.search),enabled=params.get('artCompare')==='1';
 const files={2:'day-02-fir-tree.webp',3:'day-03-ribbon-gift.webp',4:'day-04-santa-hat.webp',6:'day-06-snowman.webp',7:'day-07-christmas-bauble.webp',8:'day-08-leaping-reindeer.webp',9:'day-09-street-lamp.webp',11:'day-11-shooting-star.webp',12:'day-12-christmas-tree.webp',14:'day-14-christmas-wreath.webp',16:'day-16-red-green-stocking-row.webp',17:'day-17-gingerbread.webp',18:'day-18-clock-tower.webp',19:'day-19-candy-cane.webp',21:'day-21-department-store.webp',22:'day-22-golden-sleigh.webp',23:'day-23-cat-santa.webp',24:'day-24-christmas-star.webp'};
 const versions={
  a:{label:'A · 原版北歐紋理',folder:'./assets/images/scene/a/'},
  b:{label:'B · 簡潔色塊插畫',folder:'./assets/images/scene/b/'}
 };
 const revision='20261029-ab'; // Change this value after replacing artwork to refresh browser cache.
 for(const version of Object.values(versions))version.sources=Object.fromEntries(Object.entries(files).map(([day,file])=>[day,version.folder+file+'?art='+encodeURIComponent(revision)]));
 const initialStyle=Object.hasOwn(versions,params.get('artStyle'))?params.get('artStyle'):'a';
 window.DYSON_ART_COMPARE={enabled,days:Object.keys(files).map(Number),versions,initialStyle};
 if(!enabled)return;
 window.DYSON_ANALYTICS_CONFIG={...window.DYSON_ANALYTICS_CONFIG,enabled:false};
 document.documentElement.classList.add('art-comparing');
 document.addEventListener('DOMContentLoaded',()=>{
  const api=window.__DYSON_GAME__?.artCompare;if(!api?.enabled)return;
  const panel=document.createElement('section');panel.className='art-compare-panel';panel.setAttribute('aria-label','圖片版本比較');
  const heading=document.createElement('h2');heading.textContent='A/B 圖片比較';
  const note=document.createElement('p');note.textContent='切換整組造景，保留球內的物件與位置。';
  const choices=document.createElement('div');choices.className='art-compare-choices';choices.setAttribute('role','group');choices.setAttribute('aria-label','圖片版本');
  const status=document.createElement('p');status.className='art-compare-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const buttons=new Map();let request=0;
  function refresh(){const key=api.style();for(const [id,button] of buttons)button.setAttribute('aria-pressed',String(key===id));}
  for(const [key,version] of Object.entries(versions)){
   const button=document.createElement('button');button.type='button';button.dataset.artStyle=key;button.textContent=version.label;button.setAttribute('aria-pressed','false');
   button.addEventListener('click',async()=>{
    const token=++request;panel.setAttribute('aria-busy','true');status.textContent='正在載入 '+version.label+'…';
    try{const result=await api.setStyle(key);if(token!==request)return;if(result.applied){const url=new URL(location.href);url.searchParams.set('artStyle',key);history.replaceState(null,'',url);status.textContent='目前顯示：'+version.label;}}
    catch(error){if(token===request)status.textContent='切換未完成，保留原畫面。請確認圖片檔案後再試。';}
    finally{if(token===request){panel.removeAttribute('aria-busy');refresh();}}
   });buttons.set(key,button);choices.append(button);
  }
  const presets=document.createElement('div');presets.className='art-compare-presets';
  for(const [key,label] of [['eight','八件示範'],['all','放入全部造景'],['none','清空球內造景']]){
   const button=document.createElement('button');button.type='button';button.dataset.artPreset=key;button.textContent=label;
   button.addEventListener('click',()=>api.preset(key));presets.append(button);
  }
  const exit=document.createElement('a');exit.className='art-compare-exit';exit.href='./index.html';exit.textContent='回活動頁';
  panel.append(heading,note,choices,presets,status,exit);document.querySelector('.globe-section').prepend(panel);
  document.addEventListener('dyson-art-compare-change',()=>{refresh();status.textContent='目前顯示：'+versions[api.style()].label;});
  refresh();status.textContent=api.style()?'目前顯示：'+versions[api.style()].label:'正在準備比較圖片…';
 });
})();
