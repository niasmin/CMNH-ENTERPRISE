import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {createCharacter} from "../rooms/characters-3d.js";
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xc9e8f3);
const frustum=31,aspect=innerWidth/innerHeight;const camera=new THREE.OrthographicCamera(-frustum*aspect/2,frustum*aspect/2,frustum/2,-frustum/2,.1,180);camera.position.set(20,21,27);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;$("scene").append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.minDistance=7;controls.maxDistance=75;controls.maxPolarAngle=Math.PI/2.03;
const hemi=new THREE.HemisphereLight(0xffffff,0x6f8d86,2.3);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffe5b4,2.7);sun.position.set(-15,25,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;scene.add(sun);
const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.84});
function cube(x,y,z,w,h,d,c,group=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
function circle(x,z,r,c){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.11,20),material(c));m.position.set(x,.06,z);m.receiveShadow=true;scene.add(m);return m}
cube(0,-.23,0,43,.46,36,0xa7caa0);
cube(0,.025,0,4,.06,34,0xe5d8c1);cube(0,.03,0,40,.06,3.5,0xe5d8c1);
for(let x=-19;x<20;x+=5){for(let z of [-15,15]){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,1.3,7),material(0x997454));trunk.position.set(x,.65,z);scene.add(trunk);const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(.9,1),material(0x5b9e6b));leaf.position.set(x,1.72,z);scene.add(leaf)}}
const definitions=[
 {type:"ward",name:"CMNH Nursing Home",x:-12,z:-8,w:8,d:6,h:4.6,color:0x80b8d0},
 {type:"villa",name:"Tranquila Senior Living",x:11,z:-8,w:7,d:7,h:3.6,color:0xe4bd8f},
 {type:"hospital",name:"Neuro Hospital",x:-12,z:8,w:8,d:7,h:7,color:0x91a6d1},
 {type:"homecare",name:"Home Care",x:11,z:8,w:7,d:6,h:3.9,color:0xa7cbb2},
 {type:"branch",name:"Payap Health Care",x:0,z:-11,w:6,d:5,h:4.1,color:0xc9adcf},
 {type:"lab",name:"CM.Derma+",x:0,z:11,w:6,d:5,h:3.7,color:0xe7b4aa}
];
const layoutKey="he13-layout-v1";let layout={};try{layout=JSON.parse(localStorage.getItem(layoutKey)||"{}")}catch{};const occupied=[];
let inventory=null;try{const bridge=parent!==window?parent.HealthcareBridge:null;const s=bridge?.getState?.();if(Array.isArray(s?.buildings))inventory=s.buildings.map(b=>b.type)}catch{}
const sample=inventory===null;const built=sample?definitions:inventory.map((type,i)=>{const d=definitions.find(x=>x.type===type);if(!d)return null;const p=layout[String(i)];return {...d,x:Number.isFinite(p?.x)?p.x:d.x,z:Number.isFinite(p?.z)?p.z:d.z,index:i}}).filter(Boolean);$("mode").textContent=sample?"โหมดตัวอย่าง — ยังไม่เชื่อมสถานะเกม":built.length?"แสดงอาคารที่สร้างแล้วในเกม":"ยังไม่มีอาคารที่สร้าง · สร้างอาคารจากเมนูเกม";$("count").textContent=built.length+" อาคาร · แตะอาคารเพื่อดูรายละเอียด";
const clickable=[];const anchors=[];const pins=$("pins");let selected=null;
function building(d){const g=new THREE.Group();g.position.set(d.x,0,d.z);scene.add(g);cube(0,d.h/2,0,d.w,d.h,d.d,d.color,g);cube(0,d.h+.22,0,d.w+.6,.45,d.d+.6,0xe9f2f1,g);
for(let level=1;level<Math.max(2,Math.floor(d.h/1.7)+1);level++){for(let x=-d.w/2+1.1;x<d.w/2-.5;x+=1.45){cube(x,level*1.45, d.d/2+.035,.82,.86,.08,0x9cd1df,g)}}
cube(0,.7,d.d/2+.1,1.2,1.4,.12,0x3e788e,g);
for(let x of [-d.w/2+.3,d.w/2-.3]){cube(x,d.h/2,d.d/2+.06,.2,d.h,.15,0xf2e7d4,g)}
g.traverse(obj=>{if(obj.isMesh){obj.userData.building=d;clickable.push(obj)}});
const label=document.createElement("button");label.textContent=d.name;label.setAttribute("aria-label","เลือกอาคาร "+d.name);label.onclick=()=>select(d);pins.append(label);anchors.push({label,pos:new THREE.Vector3(d.x,d.h+1,d.z),d})}
for(const d of built){building(d);occupied.push(d)}
const ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);let placing=null,ghost=null;const grid=2;
function validSpot(x,z,d){return Math.abs(x)<18&&Math.abs(z)<14&&occupied.every(b=>Math.abs(b.x-x)>(b.w+d.w)/2+1||Math.abs(b.z-z)>(b.d+d.d)/2+1)}
function startPlacement(type){const d=definitions.find(x=>x.type===type);if(!d)return;placing=d;selected=null;if(ghost)scene.remove(ghost);ghost=new THREE.Group();cube(0,d.h/2,0,d.w,d.h,d.d,0x42c6a3,ghost);ghost.traverse(o=>{if(o.isMesh){o.material.transparent=true;o.material.opacity=.42;o.raycast=()=>{}}});scene.add(ghost);$("mode").textContent="แตะพื้นที่ว่างเพื่อวาง "+d.name+" · จากนั้นกดยืนยัน";$("place-confirm").hidden=false;$("place-cancel").hidden=false;$("place-confirm").disabled=true;}
function cancelPlacement(){placing=null;if(ghost)scene.remove(ghost);ghost=null;$("place-confirm").hidden=true;$("place-cancel").hidden=true;$("mode").textContent="แตะอาคารเพื่อดูรายละเอียด"}
$("place-cancel").onclick=cancelPlacement;
$("place-confirm").onclick=()=>{if(!placing||!ghost||!validSpot(ghost.position.x,ghost.position.z,placing))return;parent.postMessage({type:"healthcare:place-building",building:placing.type,x:ghost.position.x,z:ghost.position.z},location.origin);cancelPlacement()};
addEventListener("message",e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==="healthcare:start-placement")startPlacement(e.data.building);if(e.data?.type==="healthcare:placement-failed")$("mode").textContent=e.data.reason||"สร้างอาคารไม่สำเร็จ"});

function select(d){selected=d;$("selection").hidden=false;$("selection").textContent="🏥 "+d.name;$("enter-room").hidden=false;controls.target.set(d.x,1.5,d.z);controls.update()}
$("enter-room").onclick=()=>{if(parent!==window){parent.postMessage({type:"healthcare:open-rooms",building:selected?.type},location.origin)}else alert("เปิดจากหน้าเกมเพื่อเข้าดูห้อง 3D")};
$("reset").onclick=()=>{camera.position.set(20,21,27);controls.target.set(0,0,0);controls.update();selected=null;$("selection").hidden=true;$("enter-room").hidden=true};
let night=false;$("day").onclick=()=>{night=!night;scene.background.set(night?0x1d344e:0xc9e8f3);hemi.intensity=night?.75:2.3;sun.intensity=night?.35:2.7;$("day").textContent=night?"🌙 กลางคืน":"☀️ กลางวัน"};
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),groundPoint=new THREE.Vector3();let down=null;renderer.domElement.addEventListener("pointerdown",e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener("pointerup",e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(clickable)[0];if(placing){ray.ray.intersectPlane(ground,groundPoint);if(groundPoint){const x=Math.round(groundPoint.x/grid)*grid,z=Math.round(groundPoint.z/grid)*grid;ghost.position.set(x,0,z);const ok=validSpot(x,z,placing);ghost.traverse(o=>{if(o.isMesh)o.material.color.setHex(ok?0x42c6a3:0xee7777)});$("place-confirm").disabled=!ok}return}if(hit?.object.userData.building)select(hit.object.userData.building)});
let staffCount=2,residentCount=1;try{const s=parent.HealthcareBridge?.getState?.();staffCount=Math.min(8,Object.values(s.staff||{}).reduce((a,b)=>a+(Number(b)||0),0));residentCount=Math.min(6,Number(s.residents)||0)}catch{}const npcs=[];const npcTotal=Math.min(12,1+staffCount+residentCount);for(let i=0;i<npcTotal;i++){const role=i===0?"male":i<=staffCount?(i%2?"nurse":"caregiver"):"resident";const npc=createCharacter(role,i===0?"male":"female");npc.scale.setScalar(1.2);scene.add(npc);npcs.push(npc)}
const clock=new THREE.Clock();function render(){requestAnimationFrame(render);const t=clock.getElapsedTime();npcs.forEach((npc,i)=>{const p=t*(i<=staffCount?.22:.12)+i*1.5;const target=built[i%Math.max(1,built.length)];const bx=target?.x||0,bz=target?.z||0;npc.position.set(bx+Math.cos(p)*(i<=staffCount?3.5:2.3),0,bz+Math.sin(p)*(i<=staffCount?3.5:2.3));npc.rotation.y=-p+Math.PI/2;npc.userData.animate(t+i,"walk")});controls.update();for(const a of anchors){const pos=a.pos.clone().project(camera);const visible=pos.z<1&&pos.z>-1;a.label.style.display=visible?"block":"none";a.label.style.left=((pos.x+1)*50)+"%";a.label.style.top=((1-pos.y)*50)+"%"}renderer.render(scene,camera)}render();
addEventListener("resize",()=>{const a=innerWidth/innerHeight;camera.left=-frustum*a/2;camera.right=frustum*a/2;camera.top=frustum/2;camera.bottom=-frustum/2;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
