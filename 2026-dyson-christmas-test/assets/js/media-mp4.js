/* v48: bounded ISO BMFF inspection, AAC extraction and complete-video checks.
 * Used only for locally generated card files, never participant information. */
(()=>{'use strict';
function inspect(buffer){
 const bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer),v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 const u32=o=>v.getUint32(o),i32=o=>v.getInt32(o),u64=o=>u32(o)*4294967296+u32(o+4),type=o=>String.fromCharCode(...bytes.subarray(o,o+4));
 function boxes(start,end){const out=[];for(let p=start;p+8<=end;){let size=u32(p),header=8;if(size===1){if(p+16>end)throw Error('MP4 box header');size=u64(p+8);header=16;}if(size===0)size=end-p;if(!Number.isSafeInteger(size)||size<header||p+size>end)throw Error('MP4 box length');out.push({type:type(p+4),start:p,data:p+header,end:p+size});p+=size;}return out;}
 const children=b=>b?boxes(b.data,b.end):[],one=(b,t)=>children(b).find(x=>x.type===t),root=boxes(0,bytes.length),moov=root.find(b=>b.type==='moov');if(!moov)throw Error('MP4 metadata');
 const tracks=[];
 for(const trak of children(moov).filter(b=>b.type==='trak')){
  const tk=one(trak,'tkhd'),mdia=one(trak,'mdia'),md=one(mdia,'mdhd'),hd=one(mdia,'hdlr'),stbl=one(one(mdia,'minf'),'stbl');if(!tk||!md||!hd||!stbl)continue;
  const id=u32(tk.data+(bytes[tk.data]===1?20:12)),scale=u32(md.data+(bytes[md.data]===1?20:12)),handler=type(hd.data+8);if(!scale)throw Error('MP4 timescale');
  const track={id,handler,scale,samples:[],description:null,channels:0,rate:0,edit:0};
  const elst=one(one(trak,'edts'),'elst');if(elst&&u32(elst.data+4)){const p=elst.data+8;track.edit=bytes[elst.data]===1?u64(p+8):i32(p+4);if(track.edit<0)track.edit=0;}
  const sd=one(stbl,'stsd');if(sd){const entry=boxes(sd.data+8,sd.end)[0];if(entry&&entry.type==='mp4a'){
   track.channels=v.getUint16(entry.data+16);track.rate=u32(entry.data+24)/65536;
   const esds=boxes(entry.data+28,entry.end).find(b=>b.type==='esds');
   if(esds){
    function descriptor(p,end){while(p+2<=end){const tag=bytes[p++];let len=0,n=0,part;do{if(p>=end||n++>=4)return;part=bytes[p++];len=(len<<7)|(part&127);}while(part&128);const stop=p+len;if(stop>end)return;if(tag===5){track.description=bytes.slice(p,stop);return;}let child=p;
     if(tag===3){if(p+3>stop)return;const flags=bytes[p+2];child=p+3;if(flags&128)child+=2;if(flags&64){if(child>=stop)return;child+=1+bytes[child];}if(flags&32)child+=2;}else if(tag===4)child=p+13;else{p=stop;continue;}
     descriptor(child,stop);if(track.description)return;p=stop;
    }}descriptor(esds.data+4,esds.end);
   }
  }}
  const sz=one(stbl,'stsz'),ts=one(stbl,'stts'),sc=one(stbl,'stsc'),co=one(stbl,'stco')||one(stbl,'co64');
  if(sz&&ts&&sc&&co){
   const fixed=u32(sz.data+4),count=u32(sz.data+8);if(count>100000)throw Error('MP4 sample count');
   const sizes=Array.from({length:count},(_,i)=>fixed||u32(sz.data+12+i*4)),timings=[];for(let n=0,p=ts.data+8;n<u32(ts.data+4);n++,p+=8){const repeat=u32(p),duration=u32(p+4);if(timings.length+repeat>count)throw Error('MP4 timing count');for(let k=0;k<repeat;k++)timings.push(duration);}
   const chunks=[];for(let n=0,p=sc.data+8;n<u32(sc.data+4);n++,p+=12)chunks.push({first:u32(p),count:u32(p+4)});
   let sample=0,decode=0,rule=0;for(let n=0;n<u32(co.data+4)&&sample<count;n++){const p=co.data+8+n*(co.type==='co64'?8:4);let offset=co.type==='co64'?u64(p):u32(p);while(rule+1<chunks.length&&chunks[rule+1].first<=n+1)rule++;
    for(let k=0;k<(chunks[rule]?.count||0)&&sample<count;k++,sample++){const duration=timings[sample]||0,size=sizes[sample];if(offset+size>bytes.length)throw Error('MP4 sample bounds');track.samples.push({timestamp:(decode-track.edit)/scale,duration:duration/scale,offset,size});decode+=duration;offset+=size;}
   }
   if(sample!==count)throw Error('MP4 missing samples');
  }
  tracks.push(track);
 }
 const defaults=new Map();for(const trex of children(one(moov,'mvex')).filter(b=>b.type==='trex'))defaults.set(u32(trex.data+4),{duration:u32(trex.data+12),size:u32(trex.data+16)});
 for(const moof of root.filter(b=>b.type==='moof'))for(const traf of children(moof).filter(b=>b.type==='traf')){
  const tfhd=one(traf,'tfhd'),tfdt=one(traf,'tfdt');if(!tfhd)continue;const flags=u32(tfhd.data)&0xffffff,id=u32(tfhd.data+4),track=tracks.find(t=>t.id===id);if(!track)continue;
  let p=tfhd.data+8,base=moof.start;if(flags&1){base=u64(p);p+=8;}if(flags&2)p+=4;let duration=defaults.get(id)?.duration||0,size=defaults.get(id)?.size||0;if(flags&8){duration=u32(p);p+=4;}if(flags&16){size=u32(p);p+=4;}
  let decode=tfdt?(bytes[tfdt.data]===1?u64(tfdt.data+4):u32(tfdt.data+4)):0,offset=0;
  for(const trun of children(traf).filter(b=>b.type==='trun')){const f=u32(trun.data)&0xffffff,count=u32(trun.data+4);if(count>100000)throw Error('MP4 fragment samples');let q=trun.data+8;if(f&1){offset=base+i32(q);q+=4;}if(f&4)q+=4;
   for(let n=0;n<count;n++){let d=duration,z=size,composition=0;if(f&256){d=u32(q);q+=4;}if(f&512){z=u32(q);q+=4;}if(f&1024)q+=4;if(f&2048){composition=bytes[trun.data]===1?i32(q):u32(q);q+=4;}if(q>trun.end)throw Error('MP4 fragment bounds');track.samples.push({timestamp:(decode+composition-track.edit)/track.scale,duration:d/track.scale,offset,size:z});decode+=d;offset+=z;}
  }
 }
 for(const t of tracks){t.samples.sort((a,b)=>a.timestamp-b.timestamp);t.duration=t.samples.reduce((max,s)=>Math.max(max,s.timestamp+s.duration),0);}
 return {bytes,tracks};
}
function readAAC(buffer){const file=inspect(buffer),track=file.tracks.find(t=>t.handler==='soun');if(!track||!track.description||!track.rate||track.channels!==1)throw Error('卡片配樂格式不完整。');
 const samples=track.samples.filter(s=>s.timestamp+s.duration>0&&s.timestamp<5).map(s=>({data:file.bytes.slice(s.offset,s.offset+s.size),timestamp:Math.round(Math.max(0,s.timestamp)*1e6),duration:Math.round((Math.min(5,s.timestamp+s.duration)-Math.max(0,s.timestamp))*1e6)}));if(!samples.length||track.duration<4.9)throw Error('卡片配樂長度不足。');
 return {samples,rate:track.rate,channels:track.channels,description:track.description};
}
function validate(buffer,{duration=5,minFrames=40}={}){const file=inspect(buffer),video=file.tracks.find(t=>t.handler==='vide');if(!video||video.samples.length<minFrames||video.duration<duration-.2||video.duration>duration+.8)throw Error('影片畫面未完整錄製，請重新製作。');
 let previous=0;for(const sample of video.samples){if(sample.timestamp-previous>.5)throw Error('影片畫面中斷，請重新製作。');previous=sample.timestamp;}if(duration-previous>.3)throw Error('影片結尾未完成，請重新製作。');
 return {duration:video.duration,frames:video.samples.length};}
window.DysonMP4Support={inspect,readAAC,validate};
})();
