/* Healthcare Empire V4-V10: deterministic, fictional economy, browser + Node. */
(function(root){
'use strict';
const CHAPTERS=[
 {v:4,title:'Living Nursing Home',desc:'บริหารศูนย์ดูแลและสภาพแวดล้อม'},
 {v:5,title:'Advanced Care',desc:'วางแผนดูแลและกิจกรรมฟื้นฟู'},
 {v:6,title:'Business Tycoon',desc:'การตลาดและความพึงพอใจ'},
 {v:7,title:'Healthcare Network',desc:'Home Care และขยายสาขา'},
 {v:8,title:'Premium Senior Living',desc:'วิลล่าผู้สูงอายุ'},
 {v:9,title:'Hospital Campus',desc:'โรงพยาบาลและการส่งต่อ'},
 {v:10,title:'Healthcare Empire',desc:'การวิจัยและการขยายเครือข่าย'}
];
const BUILDINGS={
 ward:{name:'หอพักผู้สูงอายุ',cost:95000,cap:6,staff:2,monthly:24000,unlock:4,icon:'🏠',color:'#c7e6dd'},
 therapy:{name:'ศูนย์กายภาพ',cost:65000,cap:0,staff:1,monthly:9000,unlock:5,icon:'🧘',color:'#e9d6bb'},
 activity:{name:'ห้องกิจกรรม',cost:42000,cap:0,staff:0,monthly:5000,unlock:5,icon:'🎨',color:'#eac9b9'},
 garden:{name:'สวนพักผ่อน',cost:18000,cap:0,staff:0,monthly:1500,unlock:4,icon:'🌳',color:'#b7d8b1'},
 homecare:{name:'ศูนย์ Home Care',cost:110000,cap:0,staff:2,monthly:16000,unlock:7,icon:'🚗',color:'#b6d9eb'},
 branch:{name:'ศูนย์สาขา',cost:145000,cap:5,staff:2,monthly:22000,unlock:7,icon:'🏘️',color:'#c2dfd4'},
 villa:{name:'วิลล่าพรีเมียม',cost:190000,cap:4,staff:2,monthly:55000,unlock:8,icon:'🏡',color:'#e9d3b3'},
 hospital:{name:'โรงพยาบาล',cost:390000,cap:8,staff:5,monthly:85000,unlock:9,icon:'🏥',color:'#bfd0ea'},
 lab:{name:'ศูนย์วิจัย',cost:230000,cap:0,staff:1,monthly:24000,unlock:10,icon:'🔬',color:'#d3c8e9'},
 headquarters:{name:'สำนักงานใหญ่',cost:300000,cap:0,staff:2,monthly:29000,unlock:10,icon:'🏢',color:'#bfdad3'}
};
const STAFF={rn:{name:'RN พยาบาล',wage:21000,care:5},pn:{name:'PN ผู้ช่วยพยาบาล',wage:14500,care:3},caregiver:{name:'Caregiver',wage:12500,care:2},pt:{name:'PT นักกายภาพ',wage:19500,care:4},ot:{name:'OT นักกิจกรรมบำบัด',wage:19000,care:3}};
const ACTIONS={care:{name:'ประเมินแผนการดูแล',cost:1000,energy:6,wellbeing:8,rep:1,unlock:5},therapy:{name:'กิจกรรมฟื้นฟู',cost:1500,energy:7,wellbeing:10,rep:1,unlock:5},activity:{name:'กิจกรรมกลุ่ม',cost:700,energy:3,wellbeing:6,rep:1,unlock:5},marketing:{name:'แคมเปญการตลาด',cost:6500,energy:0,wellbeing:0,rep:4,unlock:6},quality:{name:'อบรมคุณภาพ',cost:5500,energy:2,wellbeing:3,rep:5,unlock:6},referral:{name:'พันธมิตรส่งต่อ',cost:8500,energy:0,wellbeing:0,rep:3,unlock:9},research:{name:'วิจัยนวัตกรรม',cost:14000,energy:0,wellbeing:2,rep:6,unlock:10}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const money=x=>Math.round(x);
function create(seed=7126){return {schema:1,seed:seed>>>0,day:1,hour:7,minute:0,chapter:4,cash:480000,rep:51,wellbeing:78,staff:{rn:2,pn:2,caregiver:4,pt:0,ot:0},residents:8,marketing:0,research:0,services:{homecare:0,referrals:0},buildings:[{id:1,type:'ward',x:2,y:2},{id:2,type:'ward',x:7,y:2},{id:3,type:'garden',x:5,y:7}],nextId:4,log:['ยินดีต้อนรับสู่ Healthcare Empire — เริ่มต้นด้วยศูนย์ดูแลผู้สูงอายุ'],events:[],stats:{income:0,expense:0,days:0},settings:{sound:false}};}
function clone(s){return JSON.parse(JSON.stringify(s));}
function rand(s){s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;return s.seed/4294967296;}
function capacity(s){return s.buildings.reduce((n,b)=>n+(BUILDINGS[b.type]?.cap||0),0);}
function workforce(s){return Object.entries(s.staff).reduce((n,[r,v])=>n+v*STAFF[r].care,0);}
function wage(s){return Object.entries(s.staff).reduce((n,[r,v])=>n+v*STAFF[r].wage,0);}
function maintenance(s){return s.buildings.reduce((n,b)=>n+BUILDINGS[b.type].monthly,0);}
function count(s,type){return s.buildings.filter(b=>b.type===type).length;}
function log(s,msg){s.log.unshift(`วันที่ ${s.day} • ${msg}`);s.log=s.log.slice(0,30);}
function upgrade(s,v){if(v<=s.chapter)return {ok:false,reason:'ปลดล็อกไปแล้ว'};if(v!==s.chapter+1||v>10)return {ok:false,reason:'ต้องปลดล็อกตามลำดับ'};const req={5:{cash:90000,rep:45},6:{cash:130000,rep:48},7:{cash:150000,rep:52},8:{cash:200000,rep:55},9:{cash:250000,rep:58},10:{cash:290000,rep:60}}[v];if(s.cash<req.cash||s.rep<req.rep)return {ok:false,reason:`ต้องมีเงิน ${req.cash.toLocaleString()} บาท และชื่อเสียง ${req.rep}`};const fee=Math.round(req.cash*0.3);s.cash-=fee;s.chapter=v;log(s,`ปลดล็อก V${v} ${CHAPTERS.find(c=>c.v===v).title} (ค่าพัฒนา ${fee.toLocaleString()} บาท)`);return {ok:true};}
function perform(state,cmd){const s=clone(state);let ok=false,reason='คำสั่งไม่ถูกต้อง';const t=cmd.type;
 if(t==='unlock'){const r=upgrade(s,Number(cmd.chapter));ok=r.ok;reason=r.reason;}
 else if(t==='build'){const b=BUILDINGS[cmd.building];if(!b)reason='ไม่พบอาคาร';else if(b.unlock>s.chapter)reason=`ต้องปลดล็อก V${b.unlock}`;else if(s.cash<b.cost)reason='เงินทุนไม่เพียงพอ';else if(s.buildings.length>=24)reason='พื้นที่เต็มแล้ว';else{const taken=new Set(s.buildings.map(v=>`${v.x},${v.y}`));const slots=[];for(let y=1;y<=9;y+=2)for(let x=1;x<=11;x+=2)if(!taken.has(`${x},${y}`)&&!s.buildings.some(b=>Math.abs(b.x-x)<2&&Math.abs(b.y-y)<2))slots.push({x,y});const slot=slots[0];if(!slot)reason='พื้นที่เต็มแล้ว';else{s.cash-=b.cost;s.buildings.push({id:s.nextId++,type:cmd.building,...slot});log(s,`ก่อสร้าง${b.name} สำเร็จ`);ok=true;}}}
 else if(t==='hire'){const role=STAFF[cmd.role];if(!role)reason='ตำแหน่งไม่ถูกต้อง';else if(s.cash<Math.round(role.wage/4))reason='เงินทุนไม่เพียงพอสำหรับการจ้าง';else if(Object.values(s.staff).reduce((a,b)=>a+b,0)>=80)reason='บุคลากรเต็ม';else{s.cash-=Math.round(role.wage/4);s.staff[cmd.role]++;log(s,`รับสมัคร ${role.name} 1 คน`);ok=true;}}
 else if(t==='admit'){const free=capacity(s)-s.residents;const capacityStaff=Math.floor(workforce(s)/2);if(free<1)reason='เตียงเต็ม';else if(s.residents>=capacityStaff)reason='บุคลากรไม่เพียงพอ';else if(s.rep<35)reason='ชื่อเสียงต่ำเกินไป';else{s.residents++;s.cash+=6000;log(s,'รับผู้สูงอายุใหม่ 1 คน (รายรับแรกเข้า)');ok=true;}}
 else if(t==='discharge'){if(s.residents<=0)reason='ไม่มีผู้พักอาศัย';else{s.residents--;log(s,'จำหน่ายผู้พักอาศัย 1 คน');ok=true;}}
 else if(t==='action'){const a=ACTIONS[cmd.action];if(!a)reason='กิจกรรมไม่ถูกต้อง';else if(['care','therapy','activity'].includes(cmd.action)&&s.residents<1)reason='ยังไม่มีผู้พักอาศัยให้ดูแล';else if(s.chapter<a.unlock)reason=`ต้องปลดล็อก V${a.unlock}`;else if(s.cash<a.cost)reason='เงินไม่เพียงพอ';else if(['therapy','activity'].includes(cmd.action)&&!count(s,cmd.action))reason='ต้องสร้างห้องกิจกรรมก่อน';else if(cmd.action==='research'&&!count(s,'lab'))reason='ต้องสร้างศูนย์วิจัยก่อน';else if(cmd.action==='care'&&s.staff.rn<1)reason='ต้องมี RN';else if(cmd.action==='therapy'&&s.staff.pt<1)reason='ต้องมี PT';else{s.cash-=a.cost;s.wellbeing=clamp(s.wellbeing+a.wellbeing,0,100);s.rep=clamp(s.rep+a.rep,0,100);if(cmd.action==='marketing')s.marketing=clamp(s.marketing+2,0,20);if(cmd.action==='research')s.research++;if(cmd.action==='referral')s.services.referrals++;log(s,a.name);ok=true;}}
 else if(t==='homecare'){if(s.chapter<7)reason='ต้องปลดล็อก V7';else if(!count(s,'homecare'))reason='ต้องสร้างศูนย์ Home Care';else if(s.staff.rn+s.staff.pn<2)reason='ต้องมีทีมพยาบาล';else{s.cash+=3500;s.services.homecare++;s.wellbeing=clamp(s.wellbeing+1,0,100);log(s,'ให้บริการ Home Care 1 เคส (รายได้สมมติ)');ok=true;}}
 else if(t==='tick'){const n=clamp(Math.floor(Number(cmd.hours)||1),1,24*30);for(let i=0;i<n;i++){s.hour++;if(s.hour>=24){s.hour=0;s.day++;dayEnd(s);}}ok=true;}
 else if(t==='restart'){return {ok:true,state:create(s.seed)};}
 return {ok,state:ok?s:state,reason};}
function dayEnd(s){const beds=count(s,'ward'),villas=count(s,'villa'),hospital=count(s,'hospital');const rev=s.residents*1150+villas*2100+hospital*2200+count(s,'homecare')*550+count(s,'headquarters')*900+s.marketing*170;const exp=Math.round((wage(s)+maintenance(s))/30)+s.residents*240+count(s,'hospital')*750;const net=money(rev-exp);s.cash+=net;s.stats.income+=rev;s.stats.expense+=exp;s.stats.days++;s.marketing=Math.max(0,s.marketing-1);const staffNeed=s.residents*2;const careGap=Math.max(0,staffNeed-workforce(s));const facilities=count(s,'therapy')+count(s,'activity')+count(s,'garden');s.wellbeing=clamp(s.wellbeing+(careGap? -2:0)+(facilities?1:0)-1,0,100);s.rep=clamp(s.rep+(s.wellbeing>=80?1:s.wellbeing<55?-2:0),0,100);if(s.cash<0)s.rep=clamp(s.rep-2,0,100);if(s.day%7===0){const roll=rand(s);if(roll<0.25){s.cash+=9500;log(s,'กิจกรรมครอบครัวเยี่ยมชม: ได้รับเงินสนับสนุน');}else if(roll<0.45){s.cash-=4800;log(s,'ค่าซ่อมบำรุงอุปกรณ์ฉุกเฉิน');}}
 if(s.day%30===0)log(s,`สรุปสิ้นเดือน: รายได้สะสม ${s.stats.income.toLocaleString()} บาท ค่าใช้จ่ายสะสม ${s.stats.expense.toLocaleString()} บาท`);
 if(s.day%5===0)log(s,`สรุปการดำเนินงาน: ${beds} หอพัก • ${s.residents} ผู้พักอาศัย • เงินสด ${s.cash.toLocaleString()} บาท`);
}
function metrics(s){const income=s.residents*1150+count(s,'villa')*2100+count(s,'hospital')*2200+count(s,'homecare')*550+count(s,'headquarters')*900+s.marketing*170;const expense=Math.round((wage(s)+maintenance(s))/30)+s.residents*240+count(s,'hospital')*750;return {capacity:capacity(s),staffCount:Object.values(s.staff).reduce((a,b)=>a+b,0),workforce:workforce(s),income,expense,profit:income-expense,occupancy:capacity(s)?Math.round(s.residents/capacity(s)*100):0};}
function validate(s){if(!s||s.schema!==1||!Number.isFinite(s.cash)||!Number.isInteger(s.chapter)||s.chapter<4||s.chapter>10||!Array.isArray(s.buildings)||!s.staff||!Array.isArray(s.log))return false;if(s.residents<0||s.residents>capacity(s)||s.buildings.length>24||s.day<1||s.hour<0||s.hour>23)return false;if(!s.buildings.every(b=>BUILDINGS[b.type]&&Number.isFinite(b.x)&&Number.isFinite(b.y)))return false;if(!Object.keys(STAFF).every(k=>Number.isInteger(s.staff[k])&&s.staff[k]>=0))return false;return true;}
const api={CHAPTERS,BUILDINGS,STAFF,ACTIONS,create,perform,metrics,validate,capacity,workforce};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.HealthcareCore=api;
})(typeof window!=='undefined'?window:globalThis);

