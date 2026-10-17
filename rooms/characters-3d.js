/* Healthcare Empire procedural low-poly 3D characters (Three.js, no paid assets). */
(function(){'use strict';
const T=window.THREE;if(!T)return;
const COLORS={male:0x508fba,female:0xc88fae,nurse:0x70b8b2,caregiver:0x86a8ce,resident:0xc5b38f};
const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.87});
function part(parent,geo,color,x,y,z){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
function character(role='nurse',gender='female'){const root=new T.Group();root.name='Healthcare 3D '+role;const uniform=COLORS[role]||COLORS[gender]||COLORS.nurse,skin=gender==='male'?0xd5a27e:0xe0b18c,hair=gender==='male'?0x4e3b32:0x493b36;
const torso=part(root,new T.CapsuleGeometry(.23,.42,4,8),uniform,0,1.12,0);torso.scale.set(1.08,1,0.7);
const head=part(root,new T.SphereGeometry(.23,12,9),skin,0,1.77,0);
part(root,new T.SphereGeometry(.235,12,9),hair,0,1.91,-.035).scale.set(1,.57,.96);
for(const x of [-.09,.09])part(root,new T.SphereGeometry(.018,8,6),0x252c32,x,1.8,.215);
if(role==='nurse'||role==='caregiver'){part(root,new T.BoxGeometry(.11,.09,.03),0xffffff,0,1.31,.18);part(root,new T.BoxGeometry(.03,.09,.034),0xd46d7e,0,1.31,.203);part(root,new T.BoxGeometry(.09,.025,.034),0xd46d7e,0,1.31,.203)}
const arms=[],legs=[];
for(const sign of [-1,1]){const a=new T.Group();a.position.set(sign*.27,1.42,0);root.add(a);part(a,new T.CapsuleGeometry(.085,.35,4,8),uniform,sign*.035,-.27,0);part(a,new T.SphereGeometry(.088,8,6),skin,sign*.045,-.53,0);arms.push(a);
const leg=new T.Group();leg.position.set(sign*.13,.83,0);root.add(leg);part(leg,new T.CapsuleGeometry(.10,.42,4,8),role==='resident'?0x797b88:0x526c82,0,-.31,0);part(leg,new T.BoxGeometry(.19,.12,.31),0x576271,0,-.68,.075);legs.push(leg)}
root.userData.animate=(t,mode='walk')=>{const moving=mode==='walk'||mode==='run';const speed=mode==='run'?8:5;const amount=moving?(mode==='run'?.68:.42):.045;arms.forEach((a,i)=>a.rotation.x=Math.sin(t*speed+i*Math.PI)*amount);legs.forEach((l,i)=>l.rotation.x=Math.sin(t*speed+i*Math.PI+Math.PI)*amount);torso.rotation.z=Math.sin(t*2)*.015;root.position.y=moving?Math.abs(Math.sin(t*speed))*.025:Math.sin(t*2)*.008};
return root}
window.HealthcareCharacters3D={create:character,roles:Object.keys(COLORS),version:'procedural-0.1'};
})();