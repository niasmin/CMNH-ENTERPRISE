/* Original low-poly geometry. Shared mesh library for world, portraits, rooms and gallery. */
(() => {
  'use strict';
  const T=THREE, P={ivory:0xf8f0dd,wall:0xf5e8cc,sage:0x77997d,pine:0x285c52,mint:0xbcd6af,teal:0x318e8a,coral:0xd9937c,gold:0xd9b96f,wood:0xaf805a,glass:0x9dcbd0,floor:0xe3cfae,white:0xfffcf1,navy:0x3c5867};
  const materials=new Map();
  function material(color,extra={}){const key=String(color)+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.82,metalness:0,flatShading:true,...extra}));return materials.get(key)}
  const geometry={box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(1,10,7),ico:new T.IcosahedronGeometry(1,0),cylinder:new T.CylinderGeometry(1,1,1,10),cone:new T.ConeGeometry(1,1,7),disc:new T.CylinderGeometry(1,1,1,24),torus:new T.TorusGeometry(1,.12,5,14)};
  function mesh(parent,type,color,x,y,z,sx=1,sy=1,sz=1,extra){const m=new T.Mesh(geometry[type],material(color,extra));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function box(p,c,x,y,z,w,h,d){return mesh(p,'box',c,x,y,z,w,h,d)}
  function sphere(p,c,x,y,z,r,squash=1){return mesh(p,'sphere',c,x,y,z,r,r*squash,r)}
  function cylinder(p,c,x,y,z,r,h){return mesh(p,'cylinder',c,x,y,z,r,h,r)}
  function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);if(parent)parent.add(g);return g}
  function cross(p,c,x,y,z,size=.32){box(p,c,x,y,z,size,.09,.025);box(p,c,x,y,z,.09,size,.027)}
  function plant(p,x,z,scale=1,flowers=false){const g=group(p,x,0,z);cylinder(g,0xd2ac86,0,.19,0,.19,.38);cylinder(g,0xe4c5a2,0,.37,0,.21,.07);for(let i=0;i<5;i++){const a=i*2.4;const leaf=mesh(g,'ico',flowers?0xe3a3a1:0x69a278,Math.cos(a)*.12,.53+(i%2)*.13,Math.sin(a)*.12,.13,.28,.12);leaf.rotation.z=Math.cos(a)*.5}g.scale.setScalar(scale);return g}
  function tree(p,x=0,z=0,size=1,pink=false){const g=group(p,x,0,z);cylinder(g,0x946c4c,0,.72,0,.12,1.45);for(const [dx,dy,dz,r]of [[0,1.75,0,.75],[-.42,1.48,.05,.55],[.4,1.62,.1,.57],[0,1.48,-.4,.55]])mesh(g,'ico',pink?0xdba3ac:(dy>1.7?0x89af7b:0x6a956a),dx,dy,dz,r,r*.9,r);g.scale.setScalar(size);g.userData.wind=true;return g}
  function bed(p,x=0,z=0,color=0x8fbbb6,double=false){const g=group(p,x,0,z),w=double?1.35:.78;g.userData.patientBed=true;
    for(const dx of [-w*.42,w*.42])for(const dz of [-.48,.48])box(g,P.wood,dx,.23,dz,.07,.46,.07);
    box(g,P.wood,0,.44,0,w+.08,.13,1.2);box(g,P.white,0,.57,0,w,.2,1.13);box(g,color,0,.69,.18,w+.01,.04,.69);box(g,0xfdf9ef,0,.73,-.37,w*.76,.12,.28);box(g,P.wood,0,.75,-.61,w+.12,.6,.09);
    if(!double){for(const side of [-1,1]){box(g,P.ivory,side*(w/2+.02),.82,.12,.035,.04,.62);for(const dz of [-.15,.4])box(g,P.ivory,side*(w/2+.02),.73,dz,.035,.18,.035)}}return g}
  function chair(p,x=0,z=0,color=P.teal,rotation=0){const g=group(p,x,0,z);box(g,color,0,.47,0,.46,.12,.44);box(g,color,0,.77,-.19,.46,.58,.08);for(const dx of [-.17,.17])for(const dz of [-.15,.15])box(g,P.wood,dx,.22,dz,.045,.45,.045);g.rotation.y=rotation;return g}
  function table(p,x=0,z=0,w=1.2,d=.8){const g=group(p,x,0,z);box(g,P.wood,0,.78,0,w,.1,d);for(const dx of [-w*.38,w*.38])for(const dz of [-d*.35,d*.35])box(g,P.ivory,dx,.38,dz,.065,.76,.065);return g}
  function monitor(p,x=0,z=0){const g=group(p,x,0,z);box(g,P.ivory,0,.39,0,.47,.09,.38);for(const dx of [-.17,.17])for(const dz of [-.13,.13])sphere(g,P.navy,dx,.1,dz,.055);box(g,P.ivory,0,.63,0,.08,.46,.08);box(g,P.navy,0,.99,0,.45,.35,.09);box(g,0x82c2af,0,1,.052,.36,.25,.014);box(g,0xf0e9a2,0,.99,.063,.2,.018,.012);return g}
  function iv(p,x=0,z=0){const g=group(p,x,0,z);cylinder(g,P.ivory,0,.7,0,.025,1.4);box(g,P.ivory,.13,1.39,0,.29,.025,.025);box(g,0xb6d5d9,.18,1.2,0,.15,.3,.09);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(g,P.navy,Math.cos(a)*.11,.07,Math.sin(a)*.11,.26,.035,.035).rotation.y=-a}return g}
  function wheelchair(p,x=0,z=0){const g=group(p,x,0,z);box(g,P.navy,0,.48,0,.52,.1,.46);box(g,P.teal,0,.77,-.22,.5,.55,.08);for(const side of [-1,1]){const wheel=group(g,side*.36,.35,-.04);mesh(wheel,'torus',0x334c50,0,0,0,.3,.3,.3).rotation.y=Math.PI/2;mesh(wheel,'cylinder',0xc4d3c8,0,0,0,.26,.045,.26).rotation.z=Math.PI/2;box(g,P.ivory,side*.27,.71,0,.04,.05,.53);box(g,P.ivory,side*.27,.56,-.2,.035,.32,.035)}box(g,P.navy,0,.18,.39,.45,.05,.18);return g}
  function person(role='rn',variant=0){const g=group(),skin=[0xe2b18a,0xc98f6c,0xf1c9a5][variant%3],elder=role.startsWith('resident'),female=['rn','caregiver','ot','manager','resident-female'].includes(role),seated=role==='resident-wheelchair';
    const colors={rn:0x3a9d9a,pn:0x77acae,caregiver:0xd8958e,pt:0x7d9b75,ot:0xd1ad64,doctor:P.ivory,manager:0x687d68,ceo:0x345a53,kitchen:0xf4eedf,admin:0xb79a7a,'resident-male':0xd4ba86,'resident-female':0xd5a3a5,'resident-wheelchair':0xc5bda3};const shirt=colors[role]||P.teal;
    const body=group(g,0,.68,0);box(body,shirt,0,0,0,.39,.47,.24);sphere(body,shirt,0,.23,0,.2,.45);
    const head=group(g,0,1.18,0);sphere(head,skin,0,.035,0,.245,1.03);
    const hair=elder?0xd6d4ca:0x604534;const cap=mesh(head,'sphere',hair,0,.14,-.065,.24,.17,.22);if(female&&!elder)sphere(head,hair,0,.1,-.24,.105);
    for(const dx of [-.083,.083]){sphere(head,0x3c3730,dx,.05,.214,.022);if(elder)mesh(head,'torus',0x6f7161,dx,.049,.233,.066,.066,.055)}if(elder)box(head,0x6f7161,0,.049,.237,.05,.009,.015);
    box(head,0xbb806f,0,-.066,.23,.061,.013,.012);sphere(head,skin,0,-.001,.244,.032,.75);
    if(role==='ceo'){box(body,P.coral,0,.05,.135,.05,.27,.025)}
    if(role==='pt')sphere(body,0x7cb7b5,.24,-.19,.2,.17);
    if(role==='kitchen'){cylinder(head,P.white,0,.35,0,.22,.22);for(const x of [-.12,0,.12])sphere(head,P.white,x,.49,0,.14)}
    const legs=[];for(const side of [-1,1]){const leg=group(g,side*.105,.48,0);box(leg,elder?0x75817c:P.navy,0,-.19,0,.14,.38,.15);box(leg,0xf5efdf,0,-.41,.04,.16,.1,.25);legs.push(leg)}
    const arms=[];for(const side of [-1,1]){const arm=group(body,side*.25,.15,0);box(arm,shirt,0,-.12,0,.14,.25,.17);box(arm,skin,0,-.32,0,.1,.23,.12);sphere(arm,skin,0,-.45,.01,.067);arms.push(arm)}
    if(!elder&&role!=='manager'){box(body,P.white,.11,.08,.13,.085,.1,.015);cross(body,P.teal,.11,.08,.145,.06)}
    if(role==='doctor'||role==='rn'){mesh(body,'torus',0x425b57,0,.05,.145,.105,.15,.035);sphere(body,P.ivory,.05,-.13,.16,.033)}
    const clipboard=group(body,.25,-.25,.2);box(clipboard,0x647e70,0,0,0,.23,.3,.035);box(clipboard,P.ivory,0,0,.022,.18,.23,.01);clipboard.visible=false;
    if(seated){wheelchair(g);body.position.y=.72;head.position.y=1.22;legs.forEach(leg=>{leg.position.y=.5;leg.rotation.x=-Math.PI/2;});}
    if(elder&&!seated){g.scale.setScalar(.94);body.rotation.x=.035;}
    g.userData.rig={body,head,legs,arms,clipboard,seated};g.userData.role=role;return g;
  }
  function pose(g,action='idle',time=0,phase=0,reduced=false){const r=g.userData.rig;if(!r)return;const walking=!reduced&&(action==='walk'||action==='run'),care=!reduced&&action==='use',swing=walking?Math.sin(time*(action==='run'?12:7)+phase):0;
    r.body.position.y=(r.seated ? .72 : .68)+(walking?Math.abs(swing)*.025:reduced?0:Math.sin(time*2+phase)*.008);r.body.rotation.x=action==='run'&&!reduced ? .11 : 0;
    if(!r.seated){r.legs[0].rotation.x=swing*.55;r.legs[1].rotation.x=-swing*.55;}
    r.arms[0].rotation.x=care?(-1.05+Math.sin(time*3)*.1):-swing*.5;r.arms[1].rotation.x=care?-.85:swing*.5;r.arms[0].rotation.z=care?-.12:0;r.arms[1].rotation.z=care?.15:0;r.clipboard.visible=care;
  }
  function shell(p,{w=4.5,d=3.8,height=1.55,color=P.wall,accent=P.teal}={}){
    box(p,0xd4bea0,0,.12,0,w+.25,.24,d+.25);box(p,P.floor,0,.27,0,w,.09,d);
    box(p,color,0,height/2+.3,-d/2,w,height,.13);box(p,color,-w/2,height/2+.3,0,.13,height,d);
    box(p,color,w/2,.58,0,.13,.65,d);box(p,color,-w*.31,.48,d/2,w*.38,.38,.13);box(p,color,w*.31,.48,d/2,w*.38,.38,.13);
    box(p,accent,0,height+.33,-d/2,w+.13,.12,.19);box(p,accent,-w/2,height+.33,0,.19,.12,d);
    for(const x of [-w*.27,w*.27]){box(p,P.ivory,x,1.25,-d/2+.09,1.04,.91,.08);box(p,P.glass,x,1.25,-d/2+.14,.85,.71,.025);box(p,P.ivory,x,1.25,-d/2+.16,.035,.72,.026)}
    for(let i=0;i<5;i++)box(p,0xd6bf9c,-w/2+(i+1)*w/6,.324,0,.012,.006,d);
    plant(p,-w/2+.3,d/2-.4,.8);plant(p,w/2-.35,-d/2+.35,.75);return p;
  }
  function fountain(p,x=0,z=0){const g=group(p,x,.02,z);cylinder(g,0xdbc7a2,0,.15,0,.88,.22);cylinder(g,0x81b8be,0,.28,0,.74,.06);cylinder(g,P.ivory,0,.54,0,.095,.52);cylinder(g,P.ivory,0,.72,0,.35,.08);cylinder(g,0xb9d6cb,0,.79,0,.28,.025);for(let i=0;i<6;i++){const drop=sphere(g,0xbfe4d9,0,.9,0,.035);drop.castShadow=false;drop.userData.waterPhase=i;}g.userData.fountain=true;return g}
  function bench(p,x=0,z=0,r=0){const g=group(p,x,0,z);for(let i=0;i<3;i++){box(g,P.wood,0,.5,(i-1)*.15,1.2,.09,.12);box(g,P.wood,0,.78+i*.1,-.22,1.2,.07,.065)}for(const dx of [-.44,.44])box(g,P.pine,dx,.25,0,.08,.5,.4);g.rotation.y=r;return g}
  function lamp(p,x=0,z=0){const g=group(p,x,0,z);cylinder(g,P.pine,0,.9,0,.035,1.8);box(g,P.pine,0,1.82,0,.24,.28,.24);box(g,0xf3dba3,0,1.82,0,.19,.2,.19);mesh(g,'cone',P.pine,0,2.02,0,.2,.18,.2);return g}
  function vehicle(kind='ambulance'){const g=group();box(g,P.ivory,0,.65,0,1.1,.8,2.05);box(g,P.ivory,0,.64,1.1,1.1,.65,.55);box(g,P.glass,0,.89,1.36,.9,.32,.02);box(g,P.teal,0,.46,1.39,1.05,.13,.025);
    for(const side of [-1,1]){box(g,P.glass,side*.56,.89,.85,.02,.32,.55);for(const z of [-.65,.88]){const w=mesh(g,'cylinder',0x38504a,side*.54,.28,z,.25,.12,.25);w.rotation.z=Math.PI/2;sphere(g,0xc9d3c5,side*.61,.28,z,.12)}box(g,0xf3dda3,side*.36,.55,1.4,.2,.13,.04)}if(kind==='ambulance'){box(g,0xd99580,0,1.11,.7,.6,.12,.19);const c=group(g,.57,.75,-.4);cross(c,P.teal,0,0,0,.38);c.rotation.y=Math.PI/2;}return g;
  }
  function prop(type){const g=group();
    if(type==='oxygen'){cylinder(g,P.teal,0,.6,0,.18,1);sphere(g,P.teal,0,1.1,0,.18,.6);cylinder(g,P.gold,0,1.26,0,.045,.18);box(g,P.navy,0,.09,0,.5,.12,.5);mesh(g,'torus',0x6e8a76,.2,.9,.05,.21,.34,.13);return g;}
    if(type==='walker'||type==='parallel-bars'){for(const side of [-1,1]){box(g,P.wood,side*.4,.95,0,.05,.07,1.2);for(const z of [-.5,.5])box(g,P.ivory,side*.4,.48,z,.04,.95,.04)}return g;}
    if(type==='dumbbells'){const bar=cylinder(g,P.navy,0,.3,0,.045,.7);bar.rotation.z=Math.PI/2;for(const x of [-.28,.28]){const weight=cylinder(g,P.teal,x,.3,0,.16,.16);weight.rotation.z=Math.PI/2;}return g;}
    if(type==='therapy-table'){bed(g,0,0,P.teal);return g;}
    if(type==='patient-lift'){box(g,P.ivory,0,.1,0,.8,.12,.9);box(g,P.ivory,-.25,.85,-.3,.08,1.6,.08);box(g,P.teal,.12,1.55,-.3,.8,.08,.09);box(g,P.navy,.48,1.21,-.3,.025,.7,.025);box(g,P.coral,.4,.8,-.3,.4,.08,.3);return g;}
    if(type==='medicine-cabinet'){box(g,P.ivory,0,.8,0,1,1.6,.4);for(const y of [.4,.8,1.2]){box(g,P.wood,0,y,.05,.9,.035,.35);for(let i=0;i<4;i++){cylinder(g,[P.coral,P.teal,P.gold][i%3],-.3+i*.2,y+.12,.12,.06,.2)}}return g;}
    if(type==='sign'){for(const x of [-.8,.8])box(g,P.wood,x,.7,0,.12,1.4,.15);box(g,P.ivory,0,1.3,0,1.9,.8,.18);cross(g,P.teal,0,1.3,.1,.5);plant(g,-.9,.3,.8,true);plant(g,.9,.3,.8,true);return g;}
    if(type==='parking'){box(g,0xa5b2a6,0,.02,0,3,.05,3);for(const x of [-1.1,0,1.1])box(g,P.ivory,x,.06,0,.025,.01,2.7);const car=vehicle('home-van');car.scale.setScalar(.7);g.add(car);return g;}
    if(type==='tree')tree(g);else if(type==='flowers'){for(let i=0;i<4;i++)plant(g,(i%2-.5)*.44,(Math.floor(i/2)-.5)*.44,1,true)}else if(type==='fountain')fountain(g);else if(type==='bench')bench(g);else if(type==='lamp')lamp(g);else if(type==='bed')bed(g);else if(type==='wheelchair')wheelchair(g);else if(type==='monitor')monitor(g);else if(type==='iv-stand')iv(g);else if(type==='ambulance'||type==='home-van')return vehicle(type);else if(type==='gazebo'){box(g,P.floor,0,.1,0,1.9,.2,1.9);for(const x of [-.8,.8])for(const z of [-.8,.8])box(g,P.wood,x,.9,z,.09,1.8,.09);mesh(g,'cone',P.coral,0,2,0,1.55,.8,1.55).rotation.y=Math.PI/4;bench(g,0,.1)}else if(type==='therapy-ball'){sphere(g,P.teal,0,.4,0,.4);box(g,0x9db6a9,0,.04,.6,1.1,.08,.6)}else if(type==='reception'){box(g,P.wood,0,.5,0,1.7,1,.6);box(g,P.ivory,0,1.04,0,1.8,.1,.7);cross(g,P.teal,0,.65,.31,.3)}else plant(g,0,0,1,true);return g;
  }
  function bedSlots(type){const count={ward:6,villa:4,branch:5,hospital:8}[type]||0,columns=type==='hospital'?4:type==='villa'?2:3;return Array.from({length:count},(_,i)=>({x:columns===4?-1.55+(i%4)*1.033:columns===2?-1.15+(i%2)*2.3:-1.4+(i%3)*1.4,z:-.9+Math.floor(i/columns)*1.6}));}
  function building(type='ward'){
    const g=group();g.userData.kind=type;
    if(type==='garden'){box(g,0xb1c69d,0,.08,0,4.5,.16,3.8);fountain(g);tree(g,-1.5,-1.1,.68);tree(g,1.5,-1.1,.65,true);bench(g,-1.45,1,Math.PI/2);bench(g,1.45,1,-Math.PI/2);plant(g,-.7,1.5,.8,true);plant(g,.7,1.5,.8,true);return g;}
    const accents={ward:P.teal,therapy:0x8aaa7a,activity:0xd2ad67,homecare:0x77a6a0,branch:0x6b8d74,villa:P.coral,hospital:0x468f9e,lab:0x879ba8,headquarters:P.pine};shell(g,{accent:accents[type]});
    if(type==='ward'){for(let i=0;i<6;i++)bed(g,-1.4+(i%3)*1.4,-.9+Math.floor(i/3)*1.6,i%2?0xc0b498:0x8bb8b1);for(const x of [-.7,.7])box(g,P.ivory,x,.78,-.05,.035,.9,3);iv(g,1.9,.5);monitor(g,-1.9,-.8)}
    if(type==='therapy'){for(const x of [-.55,.55]){box(g,P.wood,x,1.05,.6,.06,.07,1.7);for(const z of [-.15,1.3])box(g,P.ivory,x,.65,z,.05,.8,.05)}box(g,0xa5c7bb,0,.37,.5,1.6,.08,2);sphere(g,0x80afa5,1.25,.65,-.6,.43);sphere(g,P.gold,1.65,.5,.1,.28);const couch=bed(g,-1.55,-.5,0xd7bd91);couch.userData.patientBed=false;couch.userData.treatmentCouch=true;chair(g,1.1,1.2);box(g,P.wood,.8,.6,-1.5,1.4,.6,.25)}
    if(type==='activity'){table(g,0,.25,2.1,1.1);for(const x of [-1.5,1.5])for(const z of [-.3,.65])chair(g,x,z,x<0?Math.PI/2:-Math.PI/2);for(let i=0;i<6;i++)box(g,[P.coral,P.gold,P.teal][i%3],(i%3-.9)*.4,.87,-.05+Math.floor(i/3)*.4,.24,.035,.24);box(g,P.wood,1.55,.9,-1.55,.9,1.2,.3);for(let i=0;i<6;i++)box(g,[P.teal,P.ivory,P.coral][i%3],1.23+i*.12,1.12,-1.36,.08,.35,.06)}
    if(type==='homecare'){const desk=prop('reception');desk.position.set(-.8,.32,.7);g.add(desk);chair(g,-.8,-.1);bench(g,1.15,-.7);box(g,P.ivory,-1.55,1.02,-1.55,.8,1.4,.4);cross(g,P.teal,-1.55,1.3,-1.33,.35);const van=vehicle('home-van');van.position.set(2.7,0,1.4);van.rotation.y=Math.PI/2;van.scale.setScalar(.7);g.add(van)}
    if(type==='branch'){for(const slot of bedSlots('branch'))bed(g,slot.x,slot.z,0xa7bdaa);monitor(g,1.85,1.2);box(g,P.wood,0,1.15,-1.65,.5,.7,.1)}
    if(type==='villa'){for(const slot of bedSlots('villa'))bed(g,slot.x,slot.z,0xd5afa0);plant(g,-1.95,1.4,.8,true);box(g,P.wood,0,1.88,-1.75,4.8,.22,.7);box(g,P.gold,0,.37,1.88,1.5,.1,.1)}
    if(type==='hospital'){for(const slot of bedSlots('hospital'))bed(g,slot.x,slot.z,0x99c3c4);monitor(g,-1.95,1.2);box(g,P.ivory,1.6,1.95,-.9,1.25,1.15,1.4);box(g,P.glass,1.6,2,-.17,1.05,.75,.035);box(g,0x78aaa4,1.6,2.57,-.9,1.5,.12,1.6);cross(g,P.ivory,1.6,2.65,-.9,.55);g.children.at(-1).rotation.x=-Math.PI/2;cross(g,P.coral,-2.34,1.5,.4,.44);chair(g,-1.5,1.25)}
    if(type==='lab'){for(const x of [-1.3,1.3]){table(g,x,-.5,1.1,1.8);for(let i=0;i<3;i++){cylinder(g,[P.coral,P.teal,P.gold][i],x,.98,-1+i*.45,.075,.3);cylinder(g,P.ivory,x,1.15,-1+i*.45,.09,.04)}chair(g,x,1.1)}box(g,P.ivory,0,1.1,-1.55,.7,1.55,.42);box(g,P.glass,0,1.25,-1.32,.54,1.02,.025)}
    if(type==='headquarters'){table(g,0,.15,2.6,1.15);for(const x of [-1.65,1.65])for(const z of [-.4,.65])chair(g,x,z,P.pine,x<0?Math.PI/2:-Math.PI/2);box(g,P.pine,0,1.25,-1.65,2.7,.8,.08);for(let i=0;i<4;i++)box(g,P.gold,-.8+i*.55,1.05+i*.09,-1.58,.23,.25+i*.18,.025);plant(g,1.8,1.4,1.4)}
    for(const x of [-.25,.25])box(g,P.ivory,x,1.09,1.94,.045,1.1,.045);const sign=group(g,0,1.68,1.94);box(sign,accents[type],0,0,0,.62,.5,.08);cross(sign,P.ivory,0,0,.052,.28);return g;
  }
  function room(type='standard'){
    if(type==='training'){const g=group();shell(g,{accent:0x7c9b7a});for(let z=0;z<2;z++)for(let x=0;x<3;x++)chair(g,-1.1+x*1.1,-.35+z*1.2,0x8ba98c);box(g,P.pine,0,1.25,-1.65,2.7,1,.08);box(g,P.ivory,0,1.25,-1.59,2.4,.78,.025);cross(g,P.teal,0,1.25,-1.55,.38);return g;}
    if(type==='vip'){const g=group();shell(g,{accent:P.coral});bed(g,-.85,-.25,0xcea797,true);table(g,1.3,-.65,.65,.6);chair(g,1.35,.8,P.coral);plant(g,-1.8,1.4,1,true);return g;}

    if(type==='dining'){const g=group();shell(g,{accent:P.gold});for(const x of [-1.1,1.1]){table(g,x,0,1.2,1);for(const z of [-.75,.75])chair(g,x,z,P.wood,z<0?Math.PI:0);for(const dx of [-.25,.25]){cylinder(g,P.white,x+dx,.86,0,.16,.025);cylinder(g,0x9fc2bc,x+dx,.94,.2,.055,.18)}}return g;}
    if(type==='nursing'){const g=group();shell(g,{accent:P.teal});const desk=prop('reception');desk.position.set(0,.32,.8);g.add(desk);chair(g,0,-.15);monitor(g,-1.5,-.8);const cabinet=prop('medicine-cabinet');cabinet.position.set(1.5,.32,-1.4);cabinet.scale.setScalar(.8);g.add(cabinet);return g;}
    if(type==='clinic'){const g=group();shell(g,{accent:0x8da9b0});bed(g,-1.1,-.3,0x92b9b9);table(g,1,.1,.85,1.2);chair(g,1,-.8);chair(g,1,1,0xb6b18c,Math.PI);monitor(g,-.5,1);cross(g,P.teal,-2.15,1.3,0,.4);return g;}
    const map={standard:'ward',vip:'villa',feeding:'ward',therapy:'therapy',activity:'activity'};const g=building(map[type]||'ward');if(type==='feeding'){monitor(g,.7,1.3);iv(g,-.7,1.3)}return g;
  }
  function scenery(){const g=group();box(g,0xb1c79c,0,-.24,0,35,.4,30);box(g,0xa1b991,0,-.5,0,35,.35,30);
    box(g,0x84958a,0,-.015,13.5,37,.09,3.3);box(g,0xd7d1ba,0,.04,11.6,35,.1,.55);for(let i=0;i<18;i++)box(g,0xf0e8ca,-16+i*1.9,.04,13.5,.85,.012,.07);
    box(g,0xdfd6bf,0,.015,0,34,.07,1.7);box(g,0xdfd6bf,0,.02,0,1.7,.07,28);
    box(g,0x8ab9b5,21,-.5,0,6,.08,45);for(let i=0;i<15;i++){const stone=mesh(g,'ico',i%2?0xc4c9b1:0xadb6a1,17.6+(i%2)*.4,-.08,-15+i*2.2,.65,.38,.8);stone.rotation.y=i;}
    for(let i=0;i<24;i++){const x=i<12?-16+(i%12)*2.9:(i%2?-16:16),z=i<12?-13.7:-12+(i-12)*2.15;tree(g,x,z,.7+(i%3)*.12,i%7===0)}
    for(const x of [-13,-7,6,13])lamp(g,x,11.1);const van=vehicle('ambulance');van.position.set(-10,0,13.4);van.rotation.y=Math.PI/2;g.add(van);return g;
  }
  function light(scene){scene.add(new T.HemisphereLight(0xfff5dd,0x799179,2.1));const sun=new T.DirectionalLight(0xffebc7,3.2);sun.position.set(-12,24,14);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:70});sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;scene.add(sun);return sun}
  function renderer(canvas,alpha=false){const r=new T.WebGLRenderer({canvas,antialias:true,alpha,powerPreference:'high-performance',preserveDrawingBuffer:true});r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.1;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;return r}
  window.HealthcareGraphics={T,P,bedSlots,mesh,box,sphere,cylinder,group,tree,plant,bed,chair,table,monitor,iv,wheelchair,person,pose,building,room,prop,scenery,light,renderer};
})();
