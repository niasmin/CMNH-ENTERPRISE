/* A live campus drawn from saved buildings and resident/staff counts. */
(() => {
  'use strict';
  const WIDTH = 1536, HEIGHT = 1024;
  const project = (x, y) => ({x: 768 + (x - y) * 48, y: 240 + (x + y) * 28});
  const files = {ward:'building-ward-clean.png', therapy:'building-lab-clean.png', activity:'building-ward-clean.png', homecare:'building-homecare-clean.png', branch:'building-branch-clean.png', villa:'building-villa-clean.png', hospital:'building-hospital-clean.png', lab:'building-lab-clean.png', headquarters:'building-branch-clean.png'};
  function mount(parent, core, onSelect) {
    const canvas = document.createElement('canvas');canvas.id = 'h17campus';canvas.width = WIDTH;canvas.height = HEIGHT;
    canvas.setAttribute('aria-label', 'วิทยาเขตจากอาคารที่สร้างจริง');parent.prepend(canvas);
    const buildings = document.getElementById('h14built'), ctx = canvas.getContext('2d'), images = new Map();
    let snapshot = null, key = '', state = null, revision = 0;
    function image(file) {
      if (!images.has(file)) {
        const i = new Image();i.onload = () => {if (state) draw(state);};i.src = 'assets/' + file;images.set(file, i);
      }
      const i = images.get(file);return i.complete && i.naturalWidth ? i : null;
    }
    function polygon(points, fill, stroke) {
      ctx.beginPath();points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));ctx.closePath();
      if (fill) {ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
    }
    function tile(x, y, color) {const p=project(x,y);polygon([[p.x,p.y-28],[p.x+48,p.y],[p.x,p.y+28],[p.x-48,p.y]],color,'#6a96532b');}
    function tree(x,y,size=1) {
      ctx.fillStyle='#795838';ctx.fillRect(x-3*size,y-20*size,6*size,25*size);
      for (const [dx,dy,r,color] of [[0,-34,22,'#4d8050'],[-12,-29,15,'#64934d'],[10,-35,17,'#7ba953'],[0,-48,15,'#82ae5d']]){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x+dx*size,y+dy*size,r*size,0,Math.PI*2);ctx.fill();}
    }
    function park(p) {
      polygon([[p.x,p.y-42],[p.x+66,p.y-4],[p.x,p.y+34],[p.x-66,p.y-4]],'#83b66d','#608e5c');
      ctx.fillStyle='#e5d5ac';ctx.beginPath();ctx.ellipse(p.x,p.y,33,16,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#7cbcca';ctx.beginPath();ctx.ellipse(p.x,p.y,23,11,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#f4ebd0';ctx.fillRect(p.x-3,p.y-21,6,22);ctx.beginPath();ctx.ellipse(p.x,p.y-20,12,5,0,0,Math.PI*2);ctx.fill();
      tree(p.x-46,p.y-12,.65);tree(p.x+43,p.y-8,.65);
    }
    function draw(s) {
      const gradient=ctx.createLinearGradient(0,0,0,HEIGHT);gradient.addColorStop(0,'#c8dfc0');gradient.addColorStop(1,'#8fba84');ctx.fillStyle=gradient;ctx.fillRect(0,0,WIDTH,HEIGHT);
      // A single shared parcel: construction changes its contents, rather than adding labels to a photograph.
      polygon([[768,155],[1450,553],[865,918],[180,520]],'#64935f');
      for(let y=0;y<=10;y++)for(let x=0;x<=12;x++)tile(x,y,(x===0||x===12||y===0||y===10||x===6||y===5)?'#e4dbc3':((x+y)%2?'#91bc75':'#9bc780'));
      polygon([[1450,553],[1450,575],[865,940],[865,918]],'#66875c');polygon([[180,520],[180,540],[865,940],[865,918]],'#729b63');
      for(let i=0;i<12;i++){const p=project(i,0);if(i%2===0)tree(p.x,p.y-35,.8);const q=project(0,i*.8);if(i%2===0)tree(q.x-30,q.y,.75);}
      for(const b of [...snapshot.buildings].sort((a,b)=>a.y-b.y)) {
        const p=b.point;
        ctx.fillStyle='#2c573c24';ctx.beginPath();ctx.ellipse(p.x,p.y+5,78,28,0,0,Math.PI*2);ctx.fill();
        if(b.type==='garden')park(p);
        else {
          const art=image(files[b.type]);
          if(art)ctx.drawImage(art,p.x-102,p.y-138,204,146);
          else{polygon([[p.x-60,p.y-28],[p.x,p.y+7],[p.x,p.y-68],[p.x-60,p.y-103]],'#f0dec0');polygon([[p.x,p.y+7],[p.x+60,p.y-28],[p.x+60,p.y-103],[p.x,p.y-68]],'#e4cda9');polygon([[p.x-60,p.y-103],[p.x,p.y-138],[p.x+60,p.y-103],[p.x,p.y-68]],'#d4e0bc');}
        }
      }
      const residentArt=image('avatar-resident_man.png'),wheelchair=image('avatar-resident_wheelchair.png');
      for(const resident of snapshot.residents){const art=resident.id%3===0?wheelchair:residentArt;if(art)ctx.drawImage(art,resident.x-11,resident.y-39,22,44);}
      for(const staff of snapshot.staff){const art=image(staff.role==='rn'||staff.role==='pn'?'avatar-nurse_blue_01.png':staff.role==='pt'||staff.role==='ot'?'avatar-therapist.png':'avatar-care_staff_01.png');if(art)ctx.drawImage(art,staff.x-10,staff.y-38,20,40);}
      ctx.fillStyle='#3f6952';ctx.textAlign='center';ctx.font='bold 17px system-ui';ctx.fillText('CMNH · CARE CAMPUS',768,902);
    }
    function update(s) {
      state=s;const next=JSON.stringify([s.buildings,s.staff,s.residents]);if(next===key)return snapshot;
      key=next;revision++;
      const list=s.buildings.map(b=>({...b,point:project(b.x,b.y),capacity:core.BUILDINGS[b.type].cap,occupants:0}));
      let remaining=s.residents;
      for(const b of list){b.occupants=Math.min(remaining,b.capacity);remaining-=b.occupants;}
      const residents=[];
      for(const b of list)for(let i=0;i<b.occupants;i++)residents.push({id:residents.length+1,buildingId:b.id,x:b.point.x-35+(i%4)*22,y:b.point.y+24+Math.floor(i/4)*17});
      const staff=[],wards=list.filter(b=>b.capacity>0),anchors=wards.length?wards:list;
      for(const [role,count]of Object.entries(s.staff))for(let i=role==='rn'?Math.min(12,count):0;i<count;i++){
        const n=staff.length,b=anchors[n%anchors.length],anchor=b?.point||project(5,5),slot=Math.floor(n/Math.max(1,anchors.length));staff.push({role,buildingId:b?.id,x:anchor.x-45+(slot%6)*18,y:anchor.y+72+Math.floor(slot/6)*18});
      }
      snapshot={revision,buildings:list,residents,staff};
      buildings.replaceChildren();
      for(const b of list){
        const button=document.createElement('button');button.className='h14-building-pin h17-building';button.dataset.buildingId=b.id;button.dataset.buildingType=b.type;
        button.style.cssText=`left:${b.point.x}px;top:${b.point.y-170}px;--building-color:${core.BUILDINGS[b.type].color}`;
        const name=document.createElement('strong');name.textContent=core.BUILDINGS[b.type].name;
        const status=document.createElement('small');status.textContent=b.capacity?`${b.occupants}/${b.capacity} เตียง`:'พร้อมใช้งาน';button.append(name,status);
        button.setAttribute('aria-label',`${name.textContent} #${b.id} · ${status.textContent}`);button.onclick=()=>onSelect(b.id);buildings.append(button);
      }
      draw(s);return snapshot;
    }
    function layout() {
      const list=snapshot?.buildings||[],wards=list.filter(b=>b.capacity>0),all=wards.length?wards:list;
      const route=all.flatMap(b=>[[b.point.x-55,b.point.y+53],[b.point.x+55,b.point.y+53]]);
      if(route.length<2)route.push([650,500],[800,560]);
      const target=type=>{const b=list.find(b=>b.type===type)||wards[0];return b?[b.point.x,b.point.y+42]:route[0];};
      const garden=list.find(b=>b.type==='garden');
      return {route,targets:{care:target('ward'),therapy:target('therapy'),activity:target('activity')},fountain:garden?[garden.point.x,garden.point.y]:null};
    }
    return {update,layout,point:project,getState:()=>snapshot?({...snapshot,ready:[...images.values()].every(i=>i.complete&&i.naturalWidth>0)}):null};
  }
  window.HealthcareCampus={mount,project};
})();
