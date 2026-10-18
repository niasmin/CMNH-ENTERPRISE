/* In-game 3D rooms: embedded room viewer, never leaves the tycoon game. */
(()=>{"use strict";
const ROOMS=[
 {id:"rehabilitation",title:"ห้องฟื้นฟู",icon:"💗",file:"rehabilitation-room-3d.html",description:"ฝึกเดินและกายภาพบำบัด"},
 {id:"special-care",title:"ห้องผู้ป่วยพิเศษ",icon:"🩺",file:"special-care-room-3d.html",description:"ดูแลและเฝ้าระวังใกล้ชิด"},
 {id:"alzheimer-care",title:"ห้องอัลไซเมอร์",icon:"🧩",file:"alzheimer-care-room-3d.html",description:"มุมกิจกรรมและพื้นที่ปลอดภัย"}
];
const css=document.createElement("style");css.textContent=`
#he3d-root{position:fixed;inset:0;z-index:100050;background:#e9f4f8;color:#173c51;display:none;flex-direction:column;font-family:system-ui,-apple-system,"Noto Sans Thai",sans-serif}
#he3d-root.he3d-open{display:flex}
#he3d-root *{box-sizing:border-box}
#he3d-root button{font:inherit;cursor:pointer;touch-action:manipulation}
.he3d-head{flex:none;min-height:65px;display:flex;align-items:center;gap:9px;padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top));background:linear-gradient(120deg,#116c8d,#15988b);color:white}
.he3d-head strong{flex:1;font-size:15px;min-width:0}
.he3d-head button{border:2px solid #fff9;background:#fff;color:#195e72;padding:8px 12px;border-radius:12px;font-weight:800}
.he3d-list{flex:1;overflow:auto;padding:15px;display:grid;align-content:start;gap:12px;background:linear-gradient(#d4f4ef,#eaf5fb)}
.he3d-room{display:flex;align-items:center;gap:14px;text-align:left;border:2px solid #fff;border-radius:18px;padding:18px;background:white;box-shadow:0 4px 0 #c4d9e2;color:#16485f}
.he3d-room .he3d-emoji{font-size:36px}.he3d-room span:nth-child(2){flex:1}.he3d-room strong{display:block;font-size:16px}.he3d-room small{display:block;font-size:12px;color:#68818b;margin-top:4px}
#he3d-frame{width:100%;flex:1;min-height:0;border:0;background:#c3e8f4;display:none}
.he3d-loading{position:absolute;top:80px;left:50%;transform:translateX(-50%);background:#fff;border-radius:14px;padding:12px;box-shadow:0 2px 12px #225a5a50}
.he3d-foot{flex:none;padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:white;font-size:11px;text-align:center;color:#647d8c}
`;
document.head.append(css);
const root=document.createElement("section");root.id="he3d-root";root.setAttribute("role","dialog");root.setAttribute("aria-label","ห้องพัก 3D");root.setAttribute("aria-modal","true");
root.innerHTML='<div class="he3d-head"><button id="he3d-back" aria-label="ย้อนกลับ">❮</button><strong id="he3d-title">🏠 ห้องพัก 3D</strong><button id="he3d-close" aria-label="ปิด">✕</button></div><div id="he3d-list" class="he3d-list"></div><iframe id="he3d-frame" title="ห้องพัก 3D" loading="lazy" allow="fullscreen"></iframe><div class="he3d-foot">Healthcare Empire · 3D Room Preview</div>';
document.body.append(root);
const list=root.querySelector("#he3d-list"),frame=root.querySelector("#he3d-frame"),title=root.querySelector("#he3d-title");
let active=null,previousFocus=null;
for(const room of ROOMS){const button=document.createElement("button");button.className="he3d-room";button.innerHTML='<span class="he3d-emoji">'+room.icon+'</span><span><strong>'+room.title+'</strong><small>'+room.description+'</small></span><b>❯</b>';button.addEventListener("click",()=>open(room.id));list.append(button)}
function open(id){previousFocus=document.activeElement;root.classList.add("he3d-open");document.body.style.overflow="hidden";const room=ROOMS.find(r=>r.id===id);active=room?.id||null;if(room){list.style.display="none";frame.style.display="block";title.textContent=room.icon+" "+room.title;const src="rooms/"+room.file;if(frame.getAttribute("src")!==src)frame.setAttribute("src",src)}else{frame.style.display="none";frame.removeAttribute("src");list.style.display="grid";title.textContent="🏠 ห้องพัก 3D"}root.querySelector("#he3d-back").focus()}
function close(){root.classList.remove("he3d-open");document.body.style.overflow="";frame.removeAttribute("src");frame.style.display="none";active=null;previousFocus?.focus?.()}
root.querySelector("#he3d-close").addEventListener("click",close);
root.querySelector("#he3d-back").addEventListener("click",()=>active?open():close());
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&root.classList.contains("he3d-open")){e.preventDefault();active?open():close()}});
function openCampus(){previousFocus=document.activeElement;root.classList.add("he3d-open");document.body.style.overflow="hidden";active="campus";list.style.display="none";frame.style.display="block";title.textContent="🏥 Healthcare Empire · 3D Campus";frame.setAttribute("src","campus/index.html");root.querySelector("#he3d-back").focus()}
window.addEventListener("message",e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;if(e.data?.type==="healthcare:open-rooms")open()});
root.querySelector("#he3d-back").addEventListener("click",()=>{if(active==="campus")close()});
window.Healthcare3DRooms={open,close,openCampus,rooms:ROOMS.map(({id,title})=>({id,title}))};
})();