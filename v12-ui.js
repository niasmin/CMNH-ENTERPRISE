/* Healthcare Empire V12: playable mobile-first skin over the V11 simulation. */
(()=>{"use strict";
const B=window.HealthcareBridge,G=window.HealthcareCore,M=window.HealthcareMobile;
if(!B||!G)return;
const $=id=>document.getElementById(id);
const types=[
["ward","CMNH Nursing Home","building-ward-clean.png",24,54],
["villa","Tranquila Senior Living","building-villa-clean.png",24,23],
["hospital","Neuro Hospital","building-hospital-clean.png",73,22],
["homecare","Home Care","building-homecare-clean.png",72,58],
["branch","Payap Health Care","building-branch-clean.png",44,78],
["lab","CM.Derma+","building-lab-clean.png",79,82]
];
const root=document.createElement("div");root.id="he12-app";
root.innerHTML=`<header class="he12-top"><div class="he12-avatar"><img src="assets/avatar-nurse_blue_01.png" alt="ตัวละครหลัก"></div><div class="he12-brand"><strong>Healthcare Empire</strong><small>CMNH · Senior Care Tycoon</small></div><div class="he12-top-right"><span id="he12-money">💰 0</span><span id="he12-gems">💎 0</span></div></header>
<div class="he12-subbar"><span id="he12-day">☀️ วันที่ 1</span><span id="he12-beds">🛏️ 0/0</span><span id="he12-well">💗 0%</span><button id="he12-cloud" title="บันทึกออนไลน์">☁️</button></div>
<div class="he12-stage" id="he12-stage"><img class="he12-campus" src="assets/campus-master.webp" alt="เมือง Healthcare Empire"><div class="he12-houses" id="he12-houses"></div><div class="he12-mission" id="he12-mission"><b>⭐ ภารกิจปัจจุบัน</b><span id="he12-mission-text">สร้างอาคารและรับผู้พักอาศัย</span><button id="he12-mission-go">ไปเลย ❯</button></div></div>
<div class="he12-sheet" id="he12-sheet" hidden><div class="he12-sheet-header"><button id="he12-back">❮</button><strong id="he12-sheet-title">อาคาร</strong><button id="he12-close">✕</button></div><div id="he12-sheet-content"></div></div>
<nav class="he12-nav"><button data-v12-tab="map" class="active"><span>🗺️</span>แผนที่</button><button data-v12-tab="build"><span>🔨</span>สร้าง</button><button data-v12-tab="staff"><span>👩‍⚕️</span>บุคลากร</button><button data-v12-tab="care"><span>🧓</span>ผู้รับบริการ</button><button data-v12-tab="more"><span>☰</span>เพิ่มเติม</button></nav>
<div class="he12-toast" id="he12-toast" role="status" hidden></div>`;
document.body.append(root);
let selected=null;
const money=n=>"฿ "+Math.round(Number(n)||0).toLocaleString("th-TH");
function state(){return B.getState()}
function toast(s){const t=$("he12-toast");t.textContent=s;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,3000)}
function openSheet(title,content){$("he12-sheet-title").textContent=title;$("he12-sheet-content").replaceChildren(content);$("he12-sheet").hidden=false;$("he12-stage").classList.add("he12-stage-dim");}
function closeSheet(){$("he12-sheet").hidden=true;$("he12-stage").classList.remove("he12-stage-dim");}
$("he12-close").onclick=closeSheet;$("he12-back").onclick=closeSheet;
function btn(label,action,extra=""){const b=document.createElement("button");b.className="he12-action "+extra;b.textContent=label;b.onclick=action;return b}
function card(title,img,detail,action){const el=document.createElement("button");el.className="he12-card";el.innerHTML='<img src="assets/'+img+'" alt=""><span><strong>'+title+'</strong><small>'+detail+'</small></span><b>❯</b>';el.onclick=action;return el}
function action(type,args={}){const before=state();const out=G.perform(before,{type,...args});if(!out.ok){toast(out.reason||"ยังทำรายการไม่ได้");return false}B.loadState(out.state);window.dispatchEvent(new Event("healthcare:changed"));toast("✓ ทำรายการสำเร็จ");render();return true}
function openBuilding(building){selected=building;const type=building.type;const name=types.find(t=>t[0]===type)?.[1]||G.BUILDINGS[type]?.name||type;const el=document.createElement("div");el.className="he12-building-panel";const info=document.createElement("div");info.className="he12-building-photo";info.innerHTML='<img src="assets/'+(types.find(t=>t[0]===type)?.[2]||"building-ward-clean.png")+'" alt=""><p>อาคาร #'+building.id+' · '+name+'</p>';el.append(info);
const actions=document.createElement("div");actions.className="he12-grid-actions";
actions.append(btn("🏠 เข้าดูห้องพัก",()=>{closeSheet();window.HealthcareRooms?.open(building.id)}),btn("💗 ห้องฟื้นฟู 3D",()=>{window.open("rooms/rehabilitation-room-3d.html","_blank","noopener")}),btn("👩‍⚕️ จัดบุคลากร",()=>openTab("staff")),btn("🧓 รับผู้พักอาศัย",()=>openTab("care")),btn("🛋️ ตกแต่งห้อง",()=>{closeSheet();window.HealthcareRooms?.open(building.id)}));el.append(actions);openSheet(name,el)}
function openBuild(){const s=state(),el=document.createElement("div");el.className="he12-list";const h=document.createElement("p");h.textContent="เลือกอาคารที่ต้องการสร้าง · ใช้เงินในเกมจริง";el.append(h);
for(const [id,info] of Object.entries(G.BUILDINGS)){if(!info||typeof info!=="object")continue;const a=types.find(t=>t[0]===id);const name=a?.[1]||info.name||id;const image=a?.[2]||"building-ward-clean.png";const cost=info.cost??info.price??0;el.append(card(name,image,"ค่าก่อสร้าง "+money(cost),()=>{if(action("build",{building:id})){openBuild()}}))}openSheet("🔨 ก่อสร้าง",el)}
function openStaff(){const s=state(),el=document.createElement("div");el.className="he12-list";const p=document.createElement("p");p.textContent="จ้างบุคลากรเพื่อดูแลผู้รับบริการ";el.append(p);const imgs={rn:"avatar-nurse_blue_01.png",pn:"avatar-care_staff_01.png",caregiver:"avatar-care_staff_01.png",pt:"avatar-therapist.png",ot:"avatar-therapist.png"};for(const [role,info] of Object.entries(G.STAFF)){if(!info||typeof info!=="object")continue;el.append(card(info.name||role,imgs[role]||"avatar-care_staff_01.png","มีแล้ว "+(s.staff?.[role]||0)+" คน · ค่าจ้าง "+money(info.wage??info.cost??info.salary??0),()=>{if(action("hire",{role}))openStaff()}))}openSheet("👩‍⚕️ บุคลากร",el)}
function openCare(){const s=state(),el=document.createElement("div");el.className="he12-care";el.innerHTML='<img src="assets/room-standard-clean.webp" alt="ห้องพักผู้สูงอายุ"><h3>ผู้รับบริการ '+s.residents+' คน</h3><p>จำนวนเตียงที่รองรับ '+G.capacity(s)+' เตียง</p><p>ความสุข '+s.wellbeing+'% · คุณภาพการดูแล</p>';el.append(btn("💗 รับผู้พักอาศัยใหม่",()=>{if(action("admit"))openCare()}));el.append(btn("🕒 เดินเวลา 1 ชั่วโมง",()=>{if(action("tick",{hours:1}))openCare()},"secondary"));openSheet("🧓 ผู้รับบริการ",el)}
function openMore(){const el=document.createElement("div");el.className="he12-grid-actions";el.append(btn("🕒 เดินเวลา 8 ชั่วโมง",()=>{action("tick",{hours:8});closeSheet()}),btn("☁️ Cloud Save",()=>{closeSheet();$("he-cloud-panel")?.querySelector("summary")?.click()}),btn("🏠 สำรวจอาคาร",()=>{closeSheet();window.HealthcareRooms?.open()}),btn("📊 แดชบอร์ดเดิม",()=>{closeSheet();document.body.classList.toggle("he12-show-legacy");toast("สลับมุมมองแดชบอร์ด")}));openSheet("☰ เพิ่มเติม",el)}
function openTab(tab){if(tab==="map"){closeSheet();return}({build:openBuild,staff:openStaff,care:openCare,more:openMore})[tab]?.()}
root.querySelectorAll("[data-v12-tab]").forEach(b=>b.onclick=()=>{root.querySelectorAll("[data-v12-tab]").forEach(x=>x.classList.toggle("active",x===b));openTab(b.dataset.v12Tab)});
$("he12-cloud").onclick=()=>{const p=$("he-cloud-panel");if(p){p.querySelector("details").open=true;toast("เปิด Cloud Save แล้ว")}else toast("Cloud Save ยังไม่พร้อมใช้งาน")};
$("he12-mission-go").onclick=()=>openBuild();
function render(){const s=state();$("he12-money").textContent="💰 "+Math.round(s.cash??s.money??0).toLocaleString("th-TH");$("he12-gems").textContent="💎 "+Math.round(s.gems??0).toLocaleString("th-TH");$("he12-day").textContent="☀️ วันที่ "+s.day+" · "+String(s.hour).padStart(2,"0")+":00";$("he12-beds").textContent="🛏️ "+s.residents+"/"+G.capacity(s);$("he12-well").textContent="💗 "+s.wellbeing+"%";
const houses=$("he12-houses");houses.replaceChildren();const built=s.buildings||[];
built.forEach((b,i)=>{const t=types.find(x=>x[0]===b.type)||types[0];const node=document.createElement("button");node.className="he12-house";const loc=types.find(x=>x[0]===b.type)||types[i%types.length];node.style.left=(loc[3]+(Math.floor(i/6)*6))+"%";node.style.top=(loc[4]+(Math.floor(i/6)*8))+"%";node.innerHTML='<img src="assets/'+t[2]+'" alt=""><b>'+t[1]+'</b>';node.onclick=()=>openBuilding(b);houses.append(node)});
if(!built.length){const start=btn("🏥 สร้างศูนย์ดูแลแห่งแรก",openBuild,"he12-start");houses.append(start)}
$("he12-mission-text").textContent=built.length?"รับผู้พักอาศัย · "+s.residents+"/"+G.capacity(s)+" เตียง":"สร้างอาคารแรกเพื่อเริ่มธุรกิจ";
}
window.addEventListener("healthcare:changed",render);window.addEventListener("healthcare:action",render);
render();window.HealthcareV12={openTab,render};
})();