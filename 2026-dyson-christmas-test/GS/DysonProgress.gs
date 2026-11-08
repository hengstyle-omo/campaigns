/** v84 campaign: supports ten-column participant tables; November Sheet headers and stored attendance dates; session-only scene. Production v66 behavior preserved. */
/** Admin code + Email identity / schema v10 / service v8 (independent admin and exclusive-collection permissions). Ordinary participants use an unverified Email identifier. Admin rows additionally require a server-verified code/session. */
const DYSON_CONFIG={YEAR:2026,TIME_ZONE:'Asia/Taipei',ALLOWED_ORIGINS:['https://hengstyle-omo.github.io'],SHEET_NAME:'Participants_2026',LEGACY_PREVIEW:'Preview_2026',LEGACY_BONUS:'Bonus_Access_2026',CONSENT_VERSION:'dyson-christmas-2026-v1',CATALOG_REVISION:'20261021-four-products-v2'};
const DYSON_COL={visits:36,visitCount:37,catalog:38,admin:39,task:40,taskAt:41,taskFormat:42,taskMethod:43,previewDate:44,preview:45,exclusive:46};
const DYSON_STARTER_KEYS=[201,202,203];
const DYSON_BONUS_KEYS=Array.from({length:10},(_,i)=>101+i);
// Production requests remain on Participants_2026. November testing is an
// explicit, isolated environment; client dates never decide claim eligibility.
const DYSON_NOV_TEST={ID:'november-test-2026',SHEET_NAME:'Participants_Test_2026',REAL_MONTH:'2026-11',CAMPAIGN_MONTH:'2026-12'};
let DYSON_REQUEST_ENV='production';
function dysonSelectEnvironment_(value){
 if(value===undefined||value===null||value===''||value==='production')return DYSON_REQUEST_ENV='production';
 if(value===DYSON_NOV_TEST.ID)return DYSON_REQUEST_ENV=DYSON_NOV_TEST.ID;
 throw new Error('不支援此活動環境。');
}
function dysonIsNovemberTest_(){return DYSON_REQUEST_ENV===DYSON_NOV_TEST.ID;}
function dysonSchemaProperties_(){
 const props=PropertiesService.getScriptProperties(),key=k=>dysonIsNovemberTest_()?k.replace(/^DYSON_SCHEMA_/,'DYSON_NOV_TEST_SCHEMA_'):k;
 return {getProperty:k=>props.getProperty(key(k)),setProperty:(k,v)=>props.setProperty(key(k),v)};
}
function dysonActivityDate_(now){
 const date=Utilities.formatDate(now,DYSON_CONFIG.TIME_ZONE,'yyyy-MM-dd');
 if(!dysonIsNovemberTest_())return date;
 if(date.startsWith(DYSON_NOV_TEST.REAL_MONTH+'-'))return DYSON_NOV_TEST.CAMPAIGN_MONTH+date.slice(7);
 return date<DYSON_NOV_TEST.REAL_MONTH+'-01'?'2026-11-30':'2026-12-26';
}
function dysonEnvironmentInfo_(now){
 const realDate=Utilities.formatDate(now,DYSON_CONFIG.TIME_ZONE,'yyyy-MM-dd');
 return {environment:DYSON_REQUEST_ENV,environmentVersion:1,campaignUpdateVersion:84,...(dysonIsNovemberTest_()?{starterSceneVersion:1,scenePersistence:'session',attendanceVersion:1,rewardRulesVersion:2,simpleParticipantVersion:1,testCalendarVersion:2,sheetDateMonth:'2026-11',calendarReady:PropertiesService.getScriptProperties().getProperty('DYSON_NOV_TEST_CALENDAR_VERSION')==='2'}:{}),realDate,date:dysonActivityDate_(now),clockMode:dysonIsNovemberTest_()?'november-to-december':'real',testWindowActive:dysonIsNovemberTest_()&&realDate.startsWith('2026-11-')};
}
// Run this once from the existing bound Sheet. It never copies or clears
// production participants, roles, progress, or production schema properties.
function setupNovemberTest(){
 const previous=DYSON_REQUEST_ENV;dysonSelectEnvironment_(DYSON_NOV_TEST.ID);
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const book=dysonBook_();let sheet=book.getSheetByName(DYSON_NOV_TEST.SHEET_NAME);
  if(!sheet)sheet=book.insertSheet(DYSON_NOV_TEST.SHEET_NAME);
  if(sheet.getLastRow()&&sheet.getRange(1,1,1,Math.max(1,sheet.getLastColumn())).getValues()[0].includes('參與日期')){dysonSimpleSetup_(book,sheet);return;}
  const headers=dysonHeaders_();
  if(sheet.getLastRow()===0){if(sheet.getMaxColumns()<headers.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),headers.length-sheet.getMaxColumns());sheet.getRange(1,1,1,headers.length).setNumberFormat('@').setValues([headers]).setFontWeight('bold');sheet.setFrozenRows(1);sheet.setFrozenColumns(2);}
  // Preflight every column and attendance value before any migration write.
  dysonMigrateNovemberDates_(sheet);
  PropertiesService.getScriptProperties().setProperty('DYSON_NOV_TEST_CALENDAR_VERSION','2');
  const props=dysonSchemaProperties_();props.setProperty('DYSON_SCHEMA_GENERATION',String(Number(props.getProperty('DYSON_SCHEMA_GENERATION')||0)+1));props.setProperty('DYSON_SCHEMA_VERSION','10');
  const schema=dysonSchema_(sheet);dysonCheckboxes_(sheet,2,sheet.getMaxRows()-1,schema);SpreadsheetApp.flush();
  console.log('v73 測試已啟用：Participants_Test_2026，日期欄為11/01～11/25，參與日期_JSON記錄實際11月。既有資料已保留，正式分頁未改動。請將原有效部署更新成新版本。');
 }finally{lock.releaseLock();DYSON_REQUEST_ENV=previous;}
}
let DYSON_BOOK=null;
function dysonBook_(){if(DYSON_BOOK)return DYSON_BOOK;const id=PropertiesService.getScriptProperties().getProperty('DYSON_SPREADSHEET_ID');if(!id)throw new Error('請先在試算表內執行 setupV10。');return DYSON_BOOK=SpreadsheetApp.openById(id);}
// Sheet columns are resolved by header. The canonical array below is an internal
// record shape only; none of its indexes are physical spreadsheet column indexes.
function dysonFields_(){return ['Email','首次參加_台灣時間','最近參加_台灣時間','同意行銷','行銷意願更新_台灣時間','同意文字版本'].concat(Array.from({length:25},(_,i)=>(dysonIsNovemberTest_()?'11/':'12/')+String(i+1).padStart(2,'0'))).concat(['已領取數','已解鎖禮遇數','球內擺放_JSON','物件位置_JSON','資料版本','參與日期_JSON','參與天數','產品日程版本','是否管理者','卡片任務完成','卡片任務時間_台灣時間','卡片任務格式','卡片任務方式','模擬日期','模擬進度_JSON','是否有專屬收藏']);}
function dysonHeaders_(){return ['Email','是否管理者','是否有專屬收藏','同意行銷','已領取數','參與天數','已解鎖禮遇數','卡片任務完成','首次參加_台灣時間','最近參加_台灣時間'].concat(Array.from({length:25},(_,i)=>(dysonIsNovemberTest_()?'11/':'12/')+String(i+1).padStart(2,'0'))).concat(['卡片任務時間_台灣時間','卡片任務格式','卡片任務方式','行銷意願更新_台灣時間','同意文字版本','參與日期_JSON','球內擺放_JSON','物件位置_JSON','模擬日期','模擬進度_JSON','資料版本','產品日程版本']);}
function dysonHeaderName_(value,timeZone){
 if(Object.prototype.toString.call(value)==='[object Date]'&&Number.isFinite(value.getTime()))return Utilities.formatDate(value,timeZone,'MM/dd');
 const text=String(value==null?'':value).replace(/[\u200B-\u200D\uFEFF]/g,'').trim(),day=text.match(/^(11|12)\/(\d{1,2})$/);
 return day?day[1]+'/'+day[2].padStart(2,'0'):text;
}
function dysonHeaderMap_(labels){
 const map=Object.create(null),known=new Set(dysonFields_());
 labels.forEach((label,i)=>{if(dysonIsNovemberTest_()&&/^12\/(?:0[1-9]|1[0-9]|2[0-5])$/.test(label))label=label.replace(/^12\//,'11/');if(!known.has(label))return;if(map[label]!==undefined)throw new Error('欄名重複：'+label+'。請先修正標題，不要刪除資料。');map[label]=i;});return map;
}
function dysonSchema_(sheet){
 const props=dysonSchemaProperties_(),version=props.getProperty('DYSON_SCHEMA_VERSION'),generation=props.getProperty('DYSON_SCHEMA_GENERATION')||'0';
 const timeZone=dysonBook_().getSpreadsheetTimeZone(),width=Math.max(1,sheet.getLastColumn()),labels=sheet.getRange(1,1,1,width).getValues()[0].map(v=>dysonHeaderName_(v,timeZone)),map=dysonHeaderMap_(labels),fields=dysonFields_(),missing=fields.filter(f=>map[f]===undefined);
 if(dysonIsNovemberTest_()&&labels.includes('參與日期'))return dysonSimpleSchema_(sheet,labels,version,generation);
 const requiredMissing=missing.filter(f=>!(f==='是否有專屬收藏'&&['7','8'].includes(version)));
 if(requiredMissing.length)throw new Error('缺少欄位：'+missing.join('、')+'。請保留欄名，並執行 setupV10。');
 return {width,map,labels,fields,version,generation};
}
function dysonAssertSchema_(schema){
 const props=dysonSchemaProperties_();if(!['7','8','9','10'].includes(props.getProperty('DYSON_SCHEMA_VERSION'))||props.getProperty('DYSON_SCHEMA_VERSION')!==schema.version||(props.getProperty('DYSON_SCHEMA_GENERATION')||'0')!==schema.generation)throw new Error('正在調整資料欄位，請稍後重試同步。');
}
function dysonDecodeRow_(values,schema,n){return schema.simple?dysonSimpleDecode_(values,schema,n):schema.fields.map(f=>values[schema.map[f]]??'');}
function dysonReadRow_(sheet,n,schema){return dysonDecodeRow_(sheet.getRange(n,1,1,schema.width).getValues()[0],schema,n);}
function dysonEnsureRow_(sheet,n){if(n>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),n-sheet.getMaxRows());}
function dysonCheckboxes_(sheet,start,count,schema){
 if(count<1)return;const rule=SpreadsheetApp.newDataValidation().requireCheckbox().build();
 for(const field of ['是否管理者','是否有專屬收藏','同意行銷','卡片任務完成'].filter(f=>schema.map[f]!==undefined))sheet.getRange(start,schema.map[field]+1,count,1).setDataValidation(rule);
}
function dysonWriteRow_(sheet,n,row,schema){
 if(schema.simple)return dysonSimpleWrite_(sheet,n,row,schema);
 const isNew=n>sheet.getLastRow();dysonEnsureRow_(sheet,n);
 // Write only recognized columns. Custom note/formula columns remain untouched.
 const cells=schema.fields.map((f,i)=>({column:schema.map[f]+1,value:row[i]??''})).filter(c=>Number.isFinite(c.column)).sort((a,b)=>a.column-b.column);
 for(let i=0;i<cells.length;){const start=i;while(i+1<cells.length&&cells[i+1].column===cells[i].column+1)i++;sheet.getRange(n,cells[start].column,1,i-start+1).setValues([cells.slice(start,i+1).map(c=>c.value)]);i++;}
 if(isNew)dysonCheckboxes_(sheet,n,1,schema);
}
function setup(){return setupV10();}
// Previous setup names remain usable after replacing the source with v66.
function setupV7(){return setupV10();}
function setupV8(){return setupV10();}
function setupV9(){return setupV10();}
function setupV10(){
 dysonSelectEnvironment_('production');
 const book=SpreadsheetApp.getActiveSpreadsheet();if(!book)throw new Error('請從 Google Sheet 的擴充功能 → Apps Script 執行。');
 const props=PropertiesService.getScriptProperties();props.setProperty('DYSON_SPREADSHEET_ID',book.getId());DYSON_BOOK=book;
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  let sheet=book.getSheetByName(DYSON_CONFIG.SHEET_NAME);if(!sheet)sheet=book.insertSheet(DYSON_CONFIG.SHEET_NAME);
  const timeZone=book.getSpreadsheetTimeZone(),width=sheet.getLastColumn(),labels=width?sheet.getRange(1,1,1,width).getValues()[0].map(v=>dysonHeaderName_(v,timeZone)):[],map=dysonHeaderMap_(labels),fields=dysonFields_(),missing=fields.filter(f=>map[f]===undefined);
  // A missing revision counter can be recreated as 0: it stores no claims,
  // permissions, layouts, or participation dates. All activity fields still
  // fail preflight when missing. Do not repair before that full preflight.
  const repairingVersion=missing.includes('資料版本');
  if(sheet.getLastRow()>1&&missing.length){const version=props.getProperty('DYSON_SCHEMA_VERSION'),expected=['9','10'].includes(version)?fields:['7','8'].includes(version)?fields.slice(0,46):fields.slice(0,39),unknown=labels.some(f=>f&&!fields.includes(f));if(expected.some(f=>f!=='資料版本'&&map[f]===undefined)||(unknown&&missing.some(f=>!['資料版本','是否有專屬收藏'].includes(f))))throw new Error('缺少或已改名的欄位：'+missing.join('、')+'。請先還原原欄名，再執行 setupV10；資料尚未移動。');}
  if(sheet.getLastRow()>1&&(repairingVersion||!props.getProperty('DYSON_V45_BACKUP'))){
   const stem=DYSON_CONFIG.SHEET_NAME+(repairingVersion?'_backup_metadata_':'_backup_v45_')+Utilities.formatDate(new Date(),DYSON_CONFIG.TIME_ZONE,'yyyyMMdd_HHmmss');let name=stem,serial=1;while(book.getSheetByName(name))name=stem+'_'+serial++;
   const backup=sheet.copyTo(book).setName(name);backup.hideSheet();props.setProperty(repairingVersion?'DYSON_SCHEMA10_METADATA_BACKUP':'DYSON_V45_BACKUP',name);
  }
  props.setProperty('DYSON_SCHEMA_VERSION','10_migrating');props.setProperty('DYSON_SCHEMA_GENERATION',String(Number(props.getProperty('DYSON_SCHEMA_GENERATION')||0)+1));
  let all=labels.slice();
  for(const field of missing){const column=all.length+1;if(column>sheet.getMaxColumns())sheet.insertColumnsAfter(sheet.getMaxColumns(),column-sheet.getMaxColumns());sheet.getRange(1,column).setNumberFormat('@').setValues([[field]]);if(['是否有專屬收藏','資料版本'].includes(field)&&sheet.getLastRow()>1)sheet.getRange(2,column,sheet.getLastRow()-1,1).setValues(Array.from({length:sheet.getLastRow()-1},()=>[field==='資料版本'?0:false]));all.push(field);}
  const desired=dysonHeaders_();
  desired.forEach((field,i)=>{const at=all.indexOf(field);if(at!==i){sheet.moveColumns(sheet.getRange(1,at+1),i+1);all.splice(i,0,all.splice(at,1)[0]);}});
  sheet.getRange(1,1,1,desired.length).setNumberFormat('@').setValues([desired]).setFontWeight('bold');sheet.setFrozenRows(1);sheet.setFrozenColumns(2);// Preserve visibility settings on existing technical columns.
  dysonEnsureRow_(sheet,2);dysonMigrateLegacy_(sheet);
  const schema=dysonSchema_(sheet);dysonCheckboxes_(sheet,2,sheet.getMaxRows()-1,schema);
  SpreadsheetApp.flush();props.setProperty('DYSON_SCHEMA_VERSION','10');
  console.log('v66 / schema v10 已完成。A 欄 Email、B 欄是否管理者、C 欄是否有專屬收藏；管理與動物權限分開控制。'+(props.getProperty('DYSON_V45_BACKUP')?' 備份分頁：'+props.getProperty('DYSON_V45_BACKUP'):''));
  if(repairingVersion)console.log('已補回「資料版本」欄，缺少的計數由 0 重新開始；既有收藏、擺放、參與紀錄與權限保留。修復前備份：'+(props.getProperty('DYSON_SCHEMA10_METADATA_BACKUP')||'無既有資料列'));
 }finally{lock.releaseLock();}
}
function dysonMigrateLegacy_(sheet){
 const props=PropertiesService.getScriptProperties();if(props.getProperty('DYSON_V7_MIGRATED')==='yes')return;
 const book=dysonBook_(),old=book.getSheetByName(DYSON_CONFIG.LEGACY_PREVIEW),schema=dysonSchema_(sheet);
 if(old&&old.getLastRow()>1){
  const legacy=old.getRange(2,1,old.getLastRow()-1,42).getValues();
  for(const prior of legacy){
   let email;try{email=dysonEmail_(String(prior[1]||''));}catch(_){continue;}
   const found=dysonFind_(sheet,email,schema),n=found?found.n:sheet.getLastRow()+1,row=found?found.row:new Array(schema.fields.length).fill('');
   if(!row[0]){row[0]=dysonEmailCell_(email);row[1]=prior[2]||dysonStamp_(new Date());row[2]=row[1];row[33]='{}';row[34]='{}';row[35]=0;row[36]='{}';}
   row[DYSON_COL.admin]=true;
   if(!row[DYSON_COL.preview]){const state=dysonState_(prior.slice(1));state.visits=dysonVisits_(prior[39]);row[DYSON_COL.previewDate]=dysonDateValue_(prior[37]);row[DYSON_COL.preview]=JSON.stringify({state,cardTask:null});}
   dysonWriteRow_(sheet,n,row,schema);
  }
 }
 const bonus=book.getSheetByName(DYSON_CONFIG.LEGACY_BONUS);
 if(bonus&&bonus.getLastRow()){const h=bonus.getRange(1,1,1,11).getValues()[0];let changed=false;if(h[4]==='橘貓'){h[4]='貓';changed=true;}if(h[7]==='海豹'){h[7]='小海獅';changed=true;}if(changed)bonus.getRange(1,1,1,11).setValues([h]);}
 props.setProperty('DYSON_V7_MIGRATED','yes');
}
function dysonSheet_(){
 if(dysonIsNovemberTest_()&&PropertiesService.getScriptProperties().getProperty('DYSON_NOV_TEST_CALENDAR_VERSION')!=='2')throw new Error('請先執行 setupNovemberTest，將測試日期欄更新為11/01～11/25，再更新原部署。');
 if(!['7','8','9','10'].includes(dysonSchemaProperties_().getProperty('DYSON_SCHEMA_VERSION')))throw new Error(dysonIsNovemberTest_()?'請先執行 setupNovemberTest 並更新原部署。':'請先執行 setupV10；若正在調整欄位，請稍後重試。');
 const sheet=dysonBook_().getSheetByName(dysonIsNovemberTest_()?DYSON_NOV_TEST.SHEET_NAME:DYSON_CONFIG.SHEET_NAME);if(!sheet)throw new Error(dysonIsNovemberTest_()?'找不到測試分頁，請先執行 setupNovemberTest。':'找不到參加者分頁，請執行 setupV10。');return sheet;
}
// Email is the only persisted identity. A leftover legacy key column is ignored.
function dysonStoredEmail_(value){
 let email=String(value==null?'':value).trim();if(/^'[=+\-@]/.test(email))email=email.slice(1);return email.toLowerCase();
}
function dysonEmailCell_(email){return /^[=+\-@]/.test(email)?"'"+email:email;}
function dysonPermissionOnlyRow_(row){
 const emptyJSON=v=>v==null||String(v).trim()===''||String(v).trim()==='{}';
 return !row[1]&&!row[2]&&row.slice(6,31).every(v=>!v)&&
  [31,32,35,37].every(i=>!Number(row[i]||0))&&[33,34,36,DYSON_COL.preview].every(i=>emptyJSON(row[i]))&&
  !dysonConsent_(row[DYSON_COL.task])&&[DYSON_COL.taskAt,DYSON_COL.taskFormat,DYSON_COL.taskMethod,DYSON_COL.previewDate].every(i=>!row[i]);
}
function dysonFind_(sheet,email,schema){
 schema=schema||dysonSchema_(sheet);email=dysonEmail_(email);
 const last=sheet.getLastRow();if(last<2)return null;
 const emails=sheet.getRange(2,schema.map.Email+1,last-1,1).getValues(),matches=[];
 for(let i=0;i<emails.length;i++)if(dysonStoredEmail_(emails[i][0])===email){const n=i+2,row=dysonReadRow_(sheet,n,schema);matches.push({n,row,needsIdentity:!row[1]||row[0]!==dysonEmailCell_(email)||row.simpleDerivedDirty===true});}
 if(!matches.length)return null;if(matches.length===1)return matches[0];
 const manual=matches.filter(r=>dysonPermissionOnlyRow_(r.row)),active=matches.filter(r=>!dysonPermissionOnlyRow_(r.row));
 // Preserve one earlier duplicate's progress and one manual role source. Never
 // delete or merge activity. Any other duplicate combination needs human review.
 if(matches.length!==2||manual.length!==1||active.length!==1)throw new Error('同一 Email 有多筆重複資料，請先確認單一權限來源；原進度未變更。');
 const result=active[0],permission=manual[0];result.permissionRow=permission.n;result.permissionsChanged=false;
 for(const column of [DYSON_COL.admin,DYSON_COL.exclusive]){const value=dysonConsent_(permission.row[column]);if(result.row[column]!==value)result.permissionsChanged=true;result.row[column]=value;}
 return result;
}

// Configure DYSON_ADMIN_CODE only in Apps Script > Project settings > Script
// properties. Never include the real code in source, Sheet cells, or web assets.
const DYSON_AUTH={SESSION_MS:4*60*60*1000,WINDOW_MS:15*60*1000,MAX_FAILURES:5};
function dysonHash_(value){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');}
function dysonEqual_(a,b){a=String(a);b=String(b);let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
function dysonAdminCode_(){const code=PropertiesService.getScriptProperties().getProperty('DYSON_ADMIN_CODE');return typeof code==='string'&&code.length>=16&&code.length<=128?code:null;}
function dysonSign_(body,code){return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature('dyson-admin-v1.'+body,code,Utilities.Charset.UTF_8)).replace(/=+$/,'');}
function dysonIssueSession_(email,code,now){
 const expires=now.getTime()+DYSON_AUTH.SESSION_MS,body=Utilities.base64EncodeWebSafe(JSON.stringify({email,environment:DYSON_REQUEST_ENV,iat:now.getTime(),exp:expires,nonce:Utilities.getUuid()}),Utilities.Charset.UTF_8).replace(/=+$/,'');
 return {adminToken:body+'.'+dysonSign_(body,code),adminSessionExpiresAt:expires,adminAuthenticated:true};
}
function dysonVerifySession_(token,email,code,now){
 if(typeof token!=='string'||token.length>1500)return null;const parts=token.split('.');
 if(parts.length!==2||!parts.every(p=>/^[A-Za-z0-9_-]+$/.test(p))||!dysonEqual_(parts[1],dysonSign_(parts[0],code)))return null;
 try{const data=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString('UTF-8'));
  if((data.environment||'production')!==DYSON_REQUEST_ENV||data.email!==email||!Number.isFinite(data.iat)||!Number.isFinite(data.exp)||data.iat>now.getTime()||data.exp<=now.getTime()||data.exp-data.iat!==DYSON_AUTH.SESSION_MS||typeof data.nonce!=='string')return null;
  return {adminAuthenticated:true,adminSessionExpiresAt:data.exp};
 }catch(_){return null;}
}
function dysonAdminLogin_(email,value,code,now){
 const lock=LockService.getScriptLock();if(!lock.tryLock(8000))throw new Error('正在驗證，請稍後重試。');
 try{
  const props=PropertiesService.getScriptProperties(),name=(dysonIsNovemberTest_()?'DYSON_TEST_AUTH_FAIL_':'DYSON_AUTH_FAIL_')+dysonHash_(email).slice(0,32);let attempts;
  try{attempts=JSON.parse(props.getProperty(name)||'null');}catch(_){}
  if(!attempts||!Number.isFinite(attempts.start)||now.getTime()-attempts.start>=DYSON_AUTH.WINDOW_MS)attempts={start:now.getTime(),count:0};
  if(attempts.count>=DYSON_AUTH.MAX_FAILURES)throw new Error('驗證嘗試次數過多，請於 15 分鐘後再試。');
  if(typeof value!=='string'||value.length>128||!dysonEqual_(dysonHash_(value),dysonHash_(code))){attempts.count++;props.setProperty(name,JSON.stringify(attempts));throw new Error('管理員驗證碼不正確。');}
  props.deleteProperty(name);return dysonIssueSession_(email,code,now);
 }finally{lock.releaseLock();}
}
function dysonAuthorize_(request,row,email,now){
 const admin=row&&dysonConsent_(row[DYSON_COL.admin]);
 if(!admin){if(request.action==='adminLogin')throw new Error('無法驗證管理員，請確認 Email 與驗證碼。');return {fields:{}};}
 const code=dysonAdminCode_();if(!code)return {required:true,message:'管理員驗證尚未設定，請聯絡活動管理者。'};
 if(request.action==='adminLogin')return {fields:dysonAdminLogin_(email,request.adminCode,code,now)};
 const fields=dysonVerifySession_(request.adminToken,email,code,now);return fields?{fields}:{required:true,message:'請輸入管理員驗證碼，才能載入此帳號的進度與日期模擬。'};
}
function dysonAuthRequired_(now,message){return {...dysonEnvironmentInfo_(now),serviceVersion:8,permissionsVersion:3,authVersion:1,rulesVersion:3,year:DYSON_CONFIG.YEAR,serverTime:now.toISOString(),adminAuthRequired:true,isAdmin:false,canPreview:false,hasExclusiveCollection:false,message};}

function dysonStamp_(date){return Utilities.formatDate(date,DYSON_CONFIG.TIME_ZONE,'yyyy-MM-dd HH:mm:ss');}
function dysonDateValue_(value){return value instanceof Date?Utilities.formatDate(value,DYSON_CONFIG.TIME_ZONE,'yyyy-MM-dd'):String(value||'');}
function dysonConsent_(value){return value===true||(typeof value==='string'&&value.trim().toUpperCase()==='TRUE');}
function dysonTask_(value){if(!value||typeof value!=='object'||!['png','gif','mp4'].includes(value.format)||!['download','share'].includes(value.method))return null;return {completed:true,format:value.format,method:value.method};}
function dysonTaskFromRow_(row){return dysonConsent_(row[DYSON_COL.task])?{completed:true,at:String(row[DYSON_COL.taskAt]||''),format:String(row[DYSON_COL.taskFormat]||''),method:String(row[DYSON_COL.taskMethod]||'')}:null;}
function dysonGuest_(state,guest,row,now){
 if(!guest||typeof guest!=='object')return false;let changed=false;
 for(const [key,claim] of Object.entries(guest.claimed||{})){
  const d=Number(key),at=new Date(claim?.at);if(!Number.isInteger(d)||d<1||d>25||!Number.isFinite(at.getTime())||at>now)continue;
  const visited=dysonActivityDate_(at),gift=DYSON_CONFIG.YEAR+'-12-'+String(d).padStart(2,'0');
  if(!dysonCampaignDate_(visited)||gift>visited||state.claimed[d])continue;
  state.claimed[d]={at:at.toISOString()};row[5+d]=dysonStamp_(at);if(!dysonIsNovemberTest_())state.placement[d]=guest.placement?.[d]===true;
  const l=guest.layouts?.[d];if(!dysonIsNovemberTest_()&&l&&[l.x,l.y,l.scale].every(Number.isFinite))state.layouts[d]=dysonLayout_(l);changed=true;
 }

 return changed;
}
function dysonLayout_(l){if(!l||![l.x,l.y,l.scale].every(Number.isFinite))throw new Error('物件位置不正確。');return {x:Math.max(0,Math.min(1168,l.x)),y:Math.max(0,Math.min(1346,l.y)),scale:Math.max(.65,Math.min(1.35,l.scale))};}
function dysonApplyPlacement_(state,changes,hasExclusive){
 if(dysonIsNovemberTest_())throw new Error('v70 的球內擺放只在當次頁面有效，不再保存至帳號。');
 if(!changes||typeof changes!=='object'||Array.isArray(changes)||Object.keys(changes).length>(dysonIsNovemberTest_()?38:35))throw new Error('擺放資料不正確。');
 for(const [raw,patch] of Object.entries(changes)){
  const day=Number(raw);if(!Number.isInteger(day)||!((day>=1&&day<=25&&state.claimed[day])||(hasExclusive&&DYSON_BONUS_KEYS.includes(day))||(dysonIsNovemberTest_()&&DYSON_STARTER_KEYS.includes(day))))throw new Error('只能擺放已收藏或有權限的物件。');
  if(!patch||typeof patch!=='object'||Array.isArray(patch))throw new Error('擺放資料不正確。');
  if(Object.prototype.hasOwnProperty.call(patch,'placement')){if(typeof patch.placement!=='boolean')throw new Error('擺放狀態不正確。');state.placement[day]=patch.placement;}
  if(Object.prototype.hasOwnProperty.call(patch,'layout')){if(patch.layout===null)delete state.layouts[day];else state.layouts[day]=dysonLayout_(patch.layout);}
 }
}
function dysonPreviewV7_(row,changes,hasExclusive=false){
 const stored=dysonJSON_(row[DYSON_COL.preview]),snapshot={state:stored.state||{claimed:{},placement:{},layouts:{},visits:{}},date:dysonDateValue_(row[DYSON_COL.previewDate])||null,days:null,cardTask:stored.cardTask||null};
 const state=snapshot.state;state.claimed=state.claimed||{};state.placement=state.placement||{};state.layouts=state.layouts||{};state.visits=state.visits||{};if(dysonIsNovemberTest_()){state.placement={};state.layouts={};}
 if(changes===undefined)return snapshot;
 if(!changes||typeof changes!=='object'||Array.isArray(changes)||Object.keys(changes).some(k=>!['items','view','visits','bonus','cardTask'].includes(k)))throw new Error('模擬資料不正確。');
 const entries=changes.items||{};if(typeof entries!=='object'||Array.isArray(entries)||Object.keys(entries).length>25)throw new Error('模擬收藏不正確。');
 for(const [raw,v] of Object.entries(entries)){
  const d=Number(raw);if(!Number.isInteger(d)||d<1||d>25)throw new Error('模擬日期不正確。');
  if(v===null){delete state.claimed[d];delete state.placement[d];delete state.layouts[d];continue;}
  if(!v||typeof v.at!=='string'||!Number.isFinite(Date.parse(v.at))||typeof v.placement!=='boolean')throw new Error('模擬收藏不正確。');
  state.claimed[d]={at:new Date(v.at).toISOString()};if(!dysonIsNovemberTest_()){state.placement[d]=v.placement;if(v.layout)state.layouts[d]=dysonLayout_(v.layout);else delete state.layouts[d];}
 }
 if(changes.view){const date=changes.view.date;if(date!==null&&(typeof date!=='string'||!new RegExp('^'+DYSON_CONFIG.YEAR+'-(?:11-30|12-(?:0[1-9]|1[0-9]|2[0-6]))$').test(date)))throw new Error('模擬日期不正確。');snapshot.date=date;}
 if(changes.visits){if(typeof changes.visits!=='object'||Array.isArray(changes.visits)||Object.keys(changes.visits).length>25||Object.keys(changes.visits).some(d=>!dysonCampaignDate_(d)||changes.visits[d]!==true))throw new Error('模擬參與日期不正確。');state.visits={...changes.visits};}
 if(changes.bonus)dysonApplyPlacement_(state,changes.bonus,hasExclusive);
 if(changes.cardTask){const task=dysonTask_(changes.cardTask);if(!task)throw new Error('模擬卡片任務不正確。');snapshot.cardTask=snapshot.cardTask||task;}
 row[DYSON_COL.previewDate]=snapshot.date||'';row[DYSON_COL.preview]=JSON.stringify({state:dysonIsNovemberTest_()?{claimed:state.claimed,visits:state.visits}:state,cardTask:snapshot.cardTask});return snapshot;
}
function dysonPublicState_(state,hasExclusive){const result=JSON.parse(JSON.stringify(state));if(dysonIsNovemberTest_()){result.placement={};result.layouts={};}if(!hasExclusive)for(const d of DYSON_BONUS_KEYS){delete result.placement[d];delete result.layouts[d];}return result;}
const DYSON_PRODUCT_REWARDS=[[5,'product-hd19'],[10,'product-sv50'],[15,'product-hj10'],[20,'product-bp10']];
function dysonRewards_(state,now){
 const date=dysonActivityDate_(now),ids=[];
 for(const [day,id] of DYSON_PRODUCT_REWARDS)if(date>=DYSON_CONFIG.YEAR+'-12-'+String(day).padStart(2,'0'))ids.push(id);
 if(dysonAttendance_(state,now).eligible)ids.push('visits-10');
 return ids;
}
function dysonRewardLinks_(ids){
 if(dysonIsNovemberTest_()||!ids.length)return {};
 const links=dysonJSON_(PropertiesService.getScriptProperties().getProperty('DYSON_COUPON_LINKS'));
 return Object.fromEntries(ids.filter(id=>typeof links[id]==='string'&&/^https:\/\//i.test(links[id].trim())).map(id=>[id,links[id].trim()]));
}
function dysonAttendance_(state,now){const campaignDates=Object.keys(state.visits||{}).filter(d=>state.visits[d]===true&&dysonCampaignDate_(d)&&d<=dysonActivityDate_(now)).sort();return {dates:campaignDates.map(d=>dysonIsNovemberTest_()?d.replace('2026-12-','2026-11-'):d),campaignDates,count:campaignDates.length,required:10,eligible:campaignDates.length>=10};}
function dysonResult_(row,now){
 const state=dysonState_(row);state.visits=dysonVisits_(row[36]);const admin=dysonConsent_(row[DYSON_COL.admin]),hasExclusive=dysonConsent_(row[DYSON_COL.exclusive]),task=dysonTaskFromRow_(row),unlocked=dysonRewards_(state,now);
 const preview=admin?dysonPreviewV7_(row):null;if(preview)preview.state=dysonPublicState_(preview.state,hasExclusive);
 return {serviceVersion:8,serviceRevision:'20261109-v84-campaign',permissionsVersion:3,authVersion:1,year:DYSON_CONFIG.YEAR,rulesVersion:3,...dysonEnvironmentInfo_(now),attendance:dysonAttendance_(state,now),rewardLinks:dysonRewardLinks_(unlocked),serverTime:now.toISOString(),state:dysonPublicState_(state,hasExclusive),hasExclusiveCollection:hasExclusive,bonusIds:hasExclusive?DYSON_BONUS_KEYS:[],canPreview:admin,isAdmin:admin,cardTask:task,count:Object.keys(state.claimed).length,participationCount:Object.keys(state.visits).length,unlockedRewardIds:unlocked,unlockedCount:unlocked.length,marketingConsent:dysonConsent_(row[3]),version:Number(row[35]||0),...(admin?{previewSync:true,preview}:{})};
}
function dysonRequest_(request){
 dysonSelectEnvironment_(request.environment);
 if(dysonIsNovemberTest_()&&PropertiesService.getScriptProperties().getProperty('DYSON_NOV_TEST_ENABLED')==='false')throw new Error('測試環境已關閉。');
 if(request.action==='environmentCheck')return {serviceVersion:8,permissionsVersion:3,authVersion:1,rulesVersion:3,year:2026,serverTime:new Date().toISOString(),...dysonEnvironmentInfo_(new Date())};
 // Reserved actions fail on every older GS before any participant access, even
 // if the endpoint is rolled back after the initial read-only handshake.
 if(typeof request.action==='string'&&request.action.startsWith('test:')){
  if(!dysonIsNovemberTest_())throw new Error('測試操作必須使用測試環境。');
  request={...request,action:request.action.slice(5)};
 }else if(dysonIsNovemberTest_())throw new Error('測試環境需要專用操作，請更新測試前端。');
 else if(typeof request.action==='string'&&request.action.startsWith('prod:'))request={...request,action:request.action.slice(5)};
 const started=Date.now();let action=request.action;if(!['connect','adminLogin','claim','save','consent','previewSave','cardComplete'].includes(action))throw new Error('不支援此操作。');
 const email=dysonEmail_(request.email),now=new Date(),date=dysonActivityDate_(now),stamp=dysonStamp_(now),sheet=dysonSheet_(),size=dysonFields_().length;
 let schema=dysonSchema_(sheet);
 let found=dysonFind_(sheet,email,schema);dysonAssertSchema_(schema);
 if(!found&&action!=='connect'&&action!=='adminLogin')throw new Error('請先填寫 Email 載入進度。');
 let authorization=dysonAuthorize_(request,found&&found.row,email,now);
 if(authorization.required)return dysonAuthRequired_(now,authorization.message);
 if(action==='adminLogin')action='connect';
 // Returning visitors without changes re-read identity/roles without a write lock.
 if(action==='connect'&&found){
  const row=found.row,state=dysonState_(row);state.visits=dysonVisits_(row[36]);
  const taskNeeded=request.cardTask&&!dysonConsent_(row[DYSON_COL.task]),consentNeeded=typeof request.marketingConsent==='boolean'&&(!row[4]||dysonConsent_(row[3])!==request.marketingConsent);
  const guestNeeded=request.guestState&&Object.keys(request.guestState.claimed||{}).some(d=>!state.claimed[d]);
  const visitNeeded=dysonCampaignDate_(date)&&!state.visits[date],countsNeeded=Number(row[32]||0)!==dysonRewards_(state,now).length;
  if(!found.needsIdentity&&!found.permissionsChanged&&!taskNeeded&&!consentNeeded&&!guestNeeded&&!visitNeeded&&!countsNeeded&&row[38]===DYSON_CONFIG.CATALOG_REVISION){return {...dysonResult_(row,now),...authorization.fields,consentSaved:typeof request.marketingConsent==='boolean',durationMs:Date.now()-started,readOnly:true};}
 }
 const lock=LockService.getScriptLock();if(!lock.tryLock(8000))throw new Error('正在保存其他進度，內容已保留，請稍後重試。');
 try{
  // Re-read under the short write lock so concurrent edits cannot overwrite one another.
  schema=dysonSchema_(sheet);dysonAssertSchema_(schema);found=dysonFind_(sheet,email,schema);let n=found?found.n:sheet.getLastRow()+1,row=found?found.row:new Array(size).fill('');
  if(!found&&action!=='connect')throw new Error('請先填寫 Email 載入進度。');
  // Revalidate current Sheet roles and the current code under the write lock.
  // Login was checked once before locking; use its signed session on this pass.
  const recheck=dysonAuthorize_({...request,action,adminToken:authorization.fields.adminToken||request.adminToken},found&&found.row,email,now);
  if(recheck.required)return dysonAuthRequired_(now,recheck.message);
  if(!found){row[0]=/^[=+\-@]/.test(email)?"'"+email:email;row[1]=stamp;row[3]=false;row[33]='{}';row[34]='{}';row[35]=0;row[36]='{}';row[DYSON_COL.admin]=false;row[DYSON_COL.exclusive]=false;row[DYSON_COL.task]=false;}
  if(found&&found.needsIdentity){row[0]=/^[=+\-@]/.test(email)?"'"+email:email;if(!row[1])row[1]=stamp;for(const i of [33,34,36])if(!row[i])row[i]='{}';if(!row[35])row[35]=0;}
  const admin=dysonConsent_(row[DYSON_COL.admin]),hasExclusive=dysonConsent_(row[DYSON_COL.exclusive]);let state=dysonState_(row);state.visits=dysonVisits_(row[36]);
  if(action==='previewSave'){
   if(!admin)throw new Error('此 Email 未開啟管理者權限。');dysonPreviewV7_(row,request.changes,hasExclusive);
  }else{
   dysonCatalog_(state,row,38);
   if(action==='connect')dysonGuest_(state,request.guestState,row,now);
   if((action==='connect'||action==='consent')&&typeof request.marketingConsent==='boolean'){if(dysonConsent_(row[3])!==request.marketingConsent||!row[4]){row[3]=request.marketingConsent;row[4]=stamp;row[5]=DYSON_CONFIG.CONSENT_VERSION;}}
   if(action==='consent'&&typeof request.marketingConsent!=='boolean')throw new Error('行銷意願格式不正確。');
   if(action==='claim'){
    const d=request.day;if(!Number.isInteger(d)||d<1||d>25)throw new Error('禮物日期不正確。');
    if(!state.claimed[d]){const gift=DYSON_CONFIG.YEAR+'-12-'+String(d).padStart(2,'0');if(!dysonCampaignDate_(date)||gift>date)throw new Error('活動期間可領取台灣時間今天以前的禮物。');state.claimed[d]={at:now.toISOString()};state.placement[d]=false;row[5+d]=stamp;}
   }
   if(action==='save')dysonApplyPlacement_(state,request.changes,hasExclusive);
   if(action==='cardComplete'||(action==='connect'&&request.cardTask)){
    const task=dysonTask_(request.cardTask);if(!task)throw new Error('請先製作卡片並下載或分享。');
    if(!dysonConsent_(row[DYSON_COL.task])){row[DYSON_COL.task]=true;row[DYSON_COL.taskAt]=stamp;row[DYSON_COL.taskFormat]=task.format;row[DYSON_COL.taskMethod]=task.method;}
   }
   if(dysonCampaignDate_(date))state.visits[date]=true;
   row[31]=Object.keys(state.claimed).length;row[32]=dysonRewards_(state,now).length;
   if(!dysonIsNovemberTest_()){row[33]=JSON.stringify(state.placement);row[34]=JSON.stringify(state.layouts);}row[36]=JSON.stringify(dysonStoredVisits_(state.visits));row[37]=Object.keys(state.visits).length;
  }
  row[2]=stamp;row[35]=Number(row[35]||0)+1;
  dysonWriteRow_(sheet,n,row,schema);SpreadsheetApp.flush();
  return {...dysonResult_(row,now),...authorization.fields,consentSaved:(action==='connect'||action==='consent')&&typeof request.marketingConsent==='boolean',durationMs:Date.now()-started};
 }finally{lock.releaseLock();}
}


function doGet() {
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><p>Dyson 收藏進度服務已啟用。請由活動頁填寫 Email 保存進度。</p>');
}


function doPost(e) {
  let request = {}, origin = '';
  try {
    const raw = e && e.parameter && e.parameter.payload;
    if (typeof raw !== 'string' || raw.length > 24000) throw new Error('請求內容不正確。');
    request = JSON.parse(raw);
    origin = dysonOrigin_(request.clientOrigin);
    if (!/^[a-zA-Z0-9_-]{16,160}$/.test(String(request.requestId || ''))) throw new Error('請求編號不正確。');
    const result = dysonRequest_(request);
    return dysonReply_(origin, request.requestId, {ok: true, ...result});
  } catch (error) {
    // An unapproved origin never receives participant data or an executable reply.
    if (!origin) return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><p>活動網址尚未允許，請檢查 ALLOWED_ORIGINS 與部署版本。</p>');
    return dysonReply_(origin, request.requestId, {ok: false, error: String(error.message || '目前無法保存，請稍後重試。').slice(0, 220)});
  }
}


function dysonOrigin_(value) {
  const origin = String(value || '');
  if (!/^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?$/.test(origin) || DYSON_CONFIG.ALLOWED_ORIGINS.indexOf(origin) < 0) {
    throw new Error('活動網址尚未允許。');
  }
  return origin;
}


function dysonEmail_(value) {
  if (typeof value !== 'string') throw new Error('請填寫 Email。');
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@\x00-\x1f]+@[^\s@\x00-\x1f]+\.[^\s@\x00-\x1f]+$/.test(email)) throw new Error('請填寫有效的 Email。');
  return email;
}


function dysonJSON_(value) {
  try { const parsed = JSON.parse(String(value || '{}')); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}; }
  catch (_) { return {}; }
}


function dysonState_(row) {
  const state = {claimed: {}, placement: {}, layouts: {}, visits: {}}, placement = dysonJSON_(row[33]), layouts = dysonJSON_(row[34]);
  for (let d = 1; d <= 25; d++) {
    const stamp = row[5+d];
    if (!stamp) continue;
    const at = stamp instanceof Date ? stamp.toISOString() : String(stamp).replace(' ', 'T') + '+08:00';
    state.claimed[d] = {at}; state.placement[d] = placement[d] === true;
    const l = layouts[d];
    if (l && Number.isFinite(l.x) && Number.isFinite(l.y) && Number.isFinite(l.scale)) state.layouts[d] = {x: l.x, y: l.y, scale: l.scale};
  }
  for (const day of [...DYSON_BONUS_KEYS,...(dysonIsNovemberTest_()?DYSON_STARTER_KEYS:[])]) {
    if (Object.prototype.hasOwnProperty.call(placement, day)) state.placement[day] = placement[day] === true;
    const l = layouts[day];
    if (l && [l.x,l.y,l.scale].every(Number.isFinite)) state.layouts[day] = {x:l.x,y:l.y,scale:l.scale};
  }
  return dysonStarterDefaults_(state);
}

function dysonStarterDefaults_(state){if(dysonIsNovemberTest_())for(const d of DYSON_STARTER_KEYS)if(!Object.prototype.hasOwnProperty.call(state.placement,d))state.placement[d]=true;return state;}

function dysonCampaignDate_(date) {
  return typeof date === 'string' && new RegExp('^' + DYSON_CONFIG.YEAR + '-12-(?:0[1-9]|1[0-9]|2[0-5])$').test(date);
}

function dysonVisits_(value) {
  const raw = dysonJSON_(value), visits = {};
  for (const storedDate of Object.keys(raw)){const date=dysonIsNovemberTest_()?storedDate.replace(/^2026-11-/,'2026-12-'):storedDate;if(dysonCampaignDate_(date)&&raw[storedDate]===true)visits[date]=true;}
  return visits;
}


// Only the test Sheet uses real November attendance dates on disk. The game
// still addresses logical December days internally; production is unchanged.
function dysonStoredVisits_(visits){if(!dysonIsNovemberTest_())return visits;const stored={};for(const date of Object.keys(visits||{}))if(dysonCampaignDate_(date)&&visits[date]===true)stored[date.replace(/^2026-12-/,'2026-11-')]=true;return stored;}
function dysonMigrateNovemberDates_(sheet){
 if(!dysonIsNovemberTest_())throw new Error('日期轉換僅適用11月測試分頁。');
 const schema=dysonSchema_(sheet),changes=[],headerChanges=[];
 schema.labels.forEach((label,i)=>{if(/^12\/(?:0[1-9]|1[0-9]|2[0-5])$/.test(label))headerChanges.push({column:i+1,label:label.replace(/^12\//,'11/')});});
 const count=sheet.getLastRow()-1,rows=count>0?sheet.getRange(2,1,count,schema.width).getValues():[];
 rows.forEach((values,i)=>{
  const value=values[schema.map['參與日期_JSON']];if(value===null||value===undefined||value==='')return;
  let raw;try{raw=JSON.parse(String(value));}catch(_){throw new Error('測試分頁第'+(i+2)+'列參與日期_JSON無法解析；尚未轉換任何欄位或資料。');}
  if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(d=>!/^2026-(?:11|12)-(?:0[1-9]|1[0-9]|2[0-5])$/.test(d)||raw[d]!==true))throw new Error('測試分頁第'+(i+2)+'列參與日期_JSON含有非活動日期；尚未轉換任何欄位或資料。');
  const dates=dysonStoredVisits_(dysonVisits_(value)),json=JSON.stringify(dates),days=Object.keys(dates).length;
  if(json!==String(value)||Number(values[schema.map['參與天數']]||0)!==days)changes.push({row:i+2,json,days});
 });
 if(!headerChanges.length&&!changes.length)return;
 const book=dysonBook_();
 if(sheet.getLastRow()>1){const stem=DYSON_NOV_TEST.SHEET_NAME+'_backup_v73_'+Utilities.formatDate(new Date(),DYSON_CONFIG.TIME_ZONE,'yyyyMMdd_HHmmss');let name=stem,serial=1;while(book.getSheetByName(name))name=stem+'_'+serial++;sheet.copyTo(book).setName(name).hideSheet();PropertiesService.getScriptProperties().setProperty('DYSON_NOV_TEST_V73_BACKUP',name);}
 for(const c of headerChanges)sheet.getRange(1,c.column).setNumberFormat('@').setValues([[c.label]]);
 for(const c of changes){sheet.getRange(c.row,schema.map['參與日期_JSON']+1).setValues([[c.json]]);sheet.getRange(c.row,schema.map['參與天數']+1).setValues([[c.days]]);}
}

function dysonCatalog_(state, row, index) {
  if (row[index] === DYSON_CONFIG.CATALOG_REVISION) return false;
  // A changed gift keeps its calendar claim but requires explicit placement again.
  for (const day of [10,16,20]) { if (state.claimed[day]) state.placement[day] = false; delete state.layouts[day]; }
  row[index] = DYSON_CONFIG.CATALOG_REVISION;
  return true;
}

// This function runs under the request lock. Preview changes never reach Participants.

function dysonReply_(origin, requestId, result) {
  const message = JSON.stringify({channel: 'dyson-progress-v1', requestId, result}).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const target = JSON.stringify(origin);
  return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><script>window.top.postMessage(' + message + ',' + target + ');</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


// v78: ten visible participant fields. Technical metadata is isolated in a
// hidden test-only sheet; formal Participants_2026 and its schema are unchanged.
const DYSON_SIMPLE_HEADERS=['Email','是否管理者','是否有專屬收藏','同意行銷','參與日期','參與天數','卡片任務完成','護照夾資格','首次參加_台灣時間','最近參加_台灣時間'];
const DYSON_SIMPLE_SYSTEM='_Dyson_Test_System_2026';
const DYSON_SIMPLE_META_COLUMNS=[4,5,35,38,41,42,43,44,45];
function dysonSimpleSchema_(sheet,labels,version,generation){
 const map=Object.create(null);labels.forEach((h,i)=>{if(!DYSON_SIMPLE_HEADERS.includes(h))return;if(map[h]!==undefined)throw new Error('欄名重複：'+h+'。原資料未變更。');map[h]=i;});
 const missing=DYSON_SIMPLE_HEADERS.filter(h=>map[h]===undefined);if(missing.length)throw new Error('10欄參與表缺少欄位：'+missing.join('、')+'。請還原表頭。');
 return {simple:true,width:labels.length,labels,map,fields:dysonFields_(),version,generation};
}
function dysonSimpleDateCell_(schema,n){
 let index=schema.map['參與日期']+1,column='';while(index>0){index--;column=String.fromCharCode(65+index%26)+column;index=Math.floor(index/26);}
 return DYSON_NOV_TEST.SHEET_NAME+'!'+column+(n||'')+'「參與日期」';
}
function dysonSimpleDates_(value,location='參與日期'){
 const clean=v=>String(v).normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/[‐‑‒–—−]/g,'-').trim();
 const fail=(detail,v)=>{throw new Error(location+'：'+detail+(v===undefined?'':' 問題值：'+JSON.stringify(String(v).slice(0,160)))+'；原參與資料未變更。');};
 if(value===null||value===undefined||clean(value)==='')return [];
 let values;
 if(Object.prototype.toString.call(value)==='[object Date]'){
  if(!Number.isFinite(value.getTime()))fail('日期無法辨識',value);
  values=[Utilities.formatDate(value,DYSON_CONFIG.TIME_ZONE,'yyyy-MM-dd')];
 }else{
  const text=clean(value);
  if(text[0]==='['||text[0]==='{'){
   let parsed;try{parsed=JSON.parse(text);}catch(_){fail('日期清單無法解析，請使用 YYYY-MM-DD 並以頓號分隔',text);}
   values=Array.isArray(parsed)?parsed:Object.keys(parsed).filter(k=>parsed[k]===true);
  }else values=text.split(/[、,，;；\s]+/).filter(Boolean);
 }
 const normalized=values.map(v=>{
  if(typeof v!=='string')fail('日期必須為文字 YYYY-MM-DD',v);
  const text=clean(v),match=text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if(!match)fail('日期格式不正確，請使用例如 2026-11-01',v);
  const date=match[1]+'-'+match[2].padStart(2,'0')+'-'+match[3].padStart(2,'0');
  if(!/^2026-11-(?:0[1-9]|1[0-9]|2[0-5])$/.test(date))fail('測試版參與日期須在2026-11-01～2026-11-25，不會自動把12月轉為實際登入日',v);
  return date;
 });
 const dates=[...new Set(normalized)].sort(),today=Utilities.formatDate(new Date(),DYSON_CONFIG.TIME_ZONE,'yyyy-MM-dd');
 const future=dates.find(d=>d>today);if(future)fail('參與日期含有尚未到來的日期，請移除未來範例日期',future);
 return dates;
}
function dysonSimpleSystem_(create=false){
 const book=dysonBook_();let sheet=book.getSheetByName(DYSON_SIMPLE_SYSTEM);
 if(!sheet&&create){sheet=book.insertSheet(DYSON_SIMPLE_SYSTEM);sheet.getRange(1,1,1,2).setValues([['Email','系統資料_JSON']]);sheet.hideSheet();}
 if(sheet&&sheet.getLastRow()){const h=sheet.getRange(1,1,1,2).getValues()[0];if(h[0]!=='Email'||h[1]!=='系統資料_JSON')throw new Error('測試系統資料分頁表頭不相容，原資料未變更。');}
 return sheet;
}
function dysonSimpleMetaRead_(email){
 const sheet=dysonSimpleSystem_();if(!sheet||sheet.getLastRow()<2)return {};
 const rows=sheet.getRange(2,1,sheet.getLastRow()-1,2).getValues(),matches=rows.filter(r=>dysonStoredEmail_(r[0])===email);
 if(matches.length>1)throw new Error('測試系統資料有重複Email，請先確認；原資料未變更。');
 if(!matches.length||!matches[0][1])return {};let data;try{data=JSON.parse(String(matches[0][1]));}catch(_){throw new Error('測試系統資料無法解析，原資料未變更。');}
 if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('測試系統資料格式不正確，原資料未變更。');return data;
}
function dysonSimpleMetaWrite_(email,row){
 const sheet=dysonSimpleSystem_(true),count=sheet.getLastRow(),matches=[];
 if(count>1){const emails=sheet.getRange(2,1,count-1,1).getValues();for(let i=0;i<emails.length;i++)if(dysonStoredEmail_(emails[i][0])===email)matches.push(i+2);}
 if(matches.length>1)throw new Error('測試系統資料有重複Email，原資料未變更。');
 const data={schema:1};for(const i of DYSON_SIMPLE_META_COLUMNS)data[i]=row[i]??'';
 const n=matches[0]||count+1;dysonEnsureRow_(sheet,n);sheet.getRange(n,1,1,2).setValues([[dysonEmailCell_(email),JSON.stringify(data)]]);
}
function dysonSimpleDecode_(values,schema,n){
 const row=new Array(dysonFields_().length).fill(''),get=h=>values[schema.map[h]]??'',email=dysonStoredEmail_(get('Email'));
 if(!email)return row;const data=dysonSimpleMetaRead_(email);
 for(const i of DYSON_SIMPLE_META_COLUMNS)row[i]=data[i]??'';
 for(const h of ['Email','是否管理者','是否有專屬收藏','同意行銷','卡片任務完成','首次參加_台灣時間','最近參加_台灣時間'])row[dysonFields_().indexOf(h)]=get(h);
 const dates=dysonSimpleDates_(get('參與日期'),dysonSimpleDateCell_(schema,n));row[33]='{}';row[34]='{}';row[36]=JSON.stringify(Object.fromEntries(dates.map(d=>[d,true])));row[37]=dates.length;
 row[31]=0;row[35]=Number(row[35]||0);row[38]=row[38]||DYSON_CONFIG.CATALOG_REVISION;
 // A manually retained TRUE is authoritative in the private Sheet. Legacy
 // ten-column rows may not have task format/method metadata yet.
 if(dysonConsent_(row[DYSON_COL.task])){row[DYSON_COL.taskFormat]=row[DYSON_COL.taskFormat]||'png';row[DYSON_COL.taskMethod]=row[DYSON_COL.taskMethod]||'download';}
 const state={claimed:{},visits:dysonVisits_(row[36])};row[32]=dysonRewards_(state,new Date()).length;
 row.simpleDerivedDirty=Number(get('參與天數')||0)!==dates.length||String(get('護照夾資格'))!==(dates.length>=10?'已滿10天':'未達成');return row;
}
function dysonSimpleWrite_(sheet,n,row,schema){
 const email=dysonStoredEmail_(row[0]),dates=dysonSimpleDates_(row[36],dysonSimpleDateCell_(schema,n)),values={Email:dysonEmailCell_(email),'是否管理者':dysonConsent_(row[DYSON_COL.admin]),'是否有專屬收藏':dysonConsent_(row[DYSON_COL.exclusive]),'同意行銷':dysonConsent_(row[3]),'參與日期':dates.join('、'),'參與天數':dates.length,'卡片任務完成':dysonConsent_(row[DYSON_COL.task]),'護照夾資格':dates.length>=10?'已滿10天':'未達成','首次參加_台灣時間':row[1],'最近參加_台灣時間':row[2]};
 // Metadata first: a failed auxiliary write must not pretend the main row saved.
 dysonSimpleMetaWrite_(email,row);const isNew=n>sheet.getLastRow();dysonEnsureRow_(sheet,n);
 const cells=DYSON_SIMPLE_HEADERS.map(h=>({column:schema.map[h]+1,value:values[h]})).sort((a,b)=>a.column-b.column);
 for(let i=0;i<cells.length;){const start=i;while(i+1<cells.length&&cells[i+1].column===cells[i].column+1)i++;sheet.getRange(n,cells[start].column,1,i-start+1).setValues([cells.slice(start,i+1).map(c=>c.value)]);i++;}
 if(isNew)dysonCheckboxes_(sheet,n,1,schema);
}
function dysonSimpleSetup_(book,sheet){
 const props=PropertiesService.getScriptProperties(),labels=sheet.getRange(1,1,1,Math.max(1,sheet.getLastColumn())).getValues()[0].map(v=>dysonHeaderName_(v,book.getSpreadsheetTimeZone()));
 const schema=dysonSimpleSchema_(sheet,labels,'10','0'),emails=new Set();
 const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,schema.width).getValues():[];
 for(const [index,values] of rows.entries()){
  const email=dysonStoredEmail_(values[schema.map.Email]);if(!email)continue;dysonEmail_(email);if(emails.has(email))throw new Error('同一Email有多筆資料，請先保留單一資料列；尚未變更資料。');emails.add(email);dysonSimpleDates_(values[schema.map['參與日期']],dysonSimpleDateCell_(schema,index+2));
 }
 if(!props.getProperty('DYSON_SIMPLE_TEST_BACKUP')){const name='Participants_Test_Backup_v78_'+Utilities.getUuid().replace(/-/g,'').slice(0,10),backup=sheet.copyTo(book).setName(name);backup.hideSheet();props.setProperty('DYSON_SIMPLE_TEST_BACKUP',name);}
 dysonSimpleSystem_(true);props.setProperty('DYSON_NOV_TEST_CALENDAR_VERSION','2');const p=dysonSchemaProperties_();p.setProperty('DYSON_SCHEMA_VERSION','10');p.setProperty('DYSON_SCHEMA_GENERATION',String(Number(p.getProperty('DYSON_SCHEMA_GENERATION')||0)+1));dysonCheckboxes_(sheet,2,sheet.getMaxRows()-1,schema);SpreadsheetApp.flush();
}
function setupSimpleNovemberTest(){
 const previous=DYSON_REQUEST_ENV;dysonSelectEnvironment_(DYSON_NOV_TEST.ID);const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{const props=PropertiesService.getScriptProperties();let book;if(props.getProperty('DYSON_SPREADSHEET_ID'))book=dysonBook_();else{book=SpreadsheetApp.getActiveSpreadsheet();if(!book)throw new Error('請從活動Google Sheet的Apps Script執行。');props.setProperty('DYSON_SPREADSHEET_ID',book.getId());DYSON_BOOK=book;}
  let sheet=book.getSheetByName(DYSON_NOV_TEST.SHEET_NAME);if(!sheet)sheet=book.insertSheet(DYSON_NOV_TEST.SHEET_NAME);
  if(sheet.getLastRow()===0)sheet.getRange(1,1,1,DYSON_SIMPLE_HEADERS.length).setNumberFormat('@').setValues([DYSON_SIMPLE_HEADERS]);
  dysonSimpleSetup_(book,sheet);console.log('v79：10欄測試參與表已就緒。原資料已備份、正式分頁未變更。請更新原有效部署。');
 }finally{lock.releaseLock();DYSON_REQUEST_ENV=previous;}
}
