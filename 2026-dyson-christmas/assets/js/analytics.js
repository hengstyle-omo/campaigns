/* GA4: campaign metadata and bounded interaction events. No participant content. */
(()=>{
  'use strict';
  if(window.DysonAnalytics)return;
  const config={enabled:true,measurementId:'G-QF125DEKNR',page_type:'campaign',activity_id:'dyson_2026_christmas',activity_name:'dyson 2026 聖誕收藏',brand_name:'dyson',...window.DYSON_ANALYTICS_CONFIG};
  const test=window.__DYSON_ANALYTICS_TEST__===true;
  const local=location.protocol==='file:'||['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const active=config.enabled===true&&/^G-[A-Z0-9]+$/.test(config.measurementId)&&(test||!local);
  const events=new Set(['campaign_start','progress_save','gift_view','gift_collect','globe_item_change','starlight_show','card_open','card_generate','card_download','card_share','coupon_open','coupon_copy','product_click','globe_control']);
  const allowed=new Set(['gift_day','gift_name','gift_type','product_model','action','card_format','status','method','coupon_id','link_url','collected_count','placed_count','unlocked_count','has_voice','has_bgm']);
  const common={page_type:config.page_type,activity_id:config.activity_id,activity_name:config.activity_name,brand_name:config.brand_name};
  function safeURL(value,attribution=false){
    try{const url=new URL(value,location.href);if(!/^https?:$/.test(url.protocol))return '';if(/@|%40/i.test(url.pathname))url.pathname='/';
      const keep=new URLSearchParams();if(attribution)for(const key of ['utm_source','utm_medium','utm_campaign','utm_id','utm_term','utm_content','gclid','gbraid','wbraid']){const v=url.searchParams.get(key);if(v&&!/@|%40|[\r\n]/i.test(v))keep.set(key,v.slice(0,100));}
      return url.origin+url.pathname+(keep.size?'?'+keep.toString():'');
    }catch{return '';}
  }
  function track(name,params={}){
    if(!active||!events.has(name)||window.__DYSON_GAME__?.analyticsAllowed?.()===false)return false;
    const clean={...common,send_to:config.measurementId};
    for(const [key,value] of Object.entries(params)){
      if(!allowed.has(key))continue;
      if(key==='link_url'){const url=safeURL(value);if(url)clean[key]=url;}
      else if(typeof value==='number'&&Number.isFinite(value))clean[key]=value;
      else if(typeof value==='boolean')clean[key]=value?1:0;
      else if(typeof value==='string'&&!/@|%40|[\r\n]/i.test(value))clean[key]=value.slice(0,100);
    }
    try{window.gtag('event',name,clean);return true;}catch{return false;}
  }
  window.DysonAnalytics={track,enabled:active};
  if(!active)return;
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  const page={page_location:safeURL(location.href,true),page_referrer:(()=>{try{return document.referrer?new URL(document.referrer).origin:'';}catch{return '';}})(),page_title:'Dyson 璀璨雪境｜25 日聖誕收藏'};
  window.gtag('js',new Date());
  window.gtag('set',{...common,...page});
  window.gtag('config',config.measurementId,{send_page_view:false,...page});
  window.gtag('event','page_view',{...common,...page,send_to:config.measurementId});
  if(!test){const script=document.createElement('script');script.id='dyson-google-tag';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.measurementId);document.head.appendChild(script);}
})();
