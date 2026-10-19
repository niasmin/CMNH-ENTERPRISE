/* Seven visual milestones over the existing V11 simulation. No saved state or economy is added. */
(() => {
  'use strict';
  const phases = [
    {id: 1, title: 'First Care Home', thai: 'เริ่มต้นด้วยการดูแล', description: 'ศูนย์เล็ก ๆ ที่อบอุ่น พร้อมเตียงพัก สวน และทีมดูแลใกล้ชิด', chapter: 4, buildings: {ward: 1}, spaces: ['ห้องพักผู้สูงอายุ', 'พื้นที่พักผ่อน', 'ห้องรับประทานอาหาร'], art: ['phase-standard', 'phase-garden', 'phase-dining']},
    {id: 2, title: 'Professional Nursing Center', thai: 'ยกระดับสู่ศูนย์พยาบาล', description: 'ขยายพื้นที่พักและเพิ่มพยาบาลวิชาชีพ เพื่อรองรับการดูแลที่มีคุณภาพ', chapter: 5, buildings: {ward: 2}, rn: 3, spaces: ['ห้องพักมาตรฐาน', 'Nurse Station', 'ห้องกายภาพ'], art: ['phase-standard', 'phase-nursing', 'phase-therapy']},
    {id: 3, title: 'Tranquila Senior Living', thai: 'ชีวิตที่สงบและมีคุณภาพ', description: 'พัฒนาวิลล่าสำหรับผู้สูงอายุ พร้อมบรรยากาศสวนและพื้นที่สันทนาการ', chapter: 8, buildings: {villa: 1}, spaces: ['ห้องพัก VIP', 'สวนพักผ่อน', 'ห้องกิจกรรม'], art: ['phase-vip', 'phase-garden', 'phase-activity']},
    {id: 4, title: 'Home Care & Daycare', thai: 'ส่งต่อความใส่ใจสู่ชุมชน', description: 'เปิดศูนย์ Home Care และเชื่อมบริการดูแลผู้สูงอายุถึงบ้าน', chapter: 7, buildings: {homecare: 1}, spaces: ['บริการดูแลที่บ้าน', 'Daycare', 'รถ Home Care'], art: ['phase-opd', 'phase-activity', 'phase-home-van']},
    {id: 5, title: 'Healthcare Workforce', thai: 'ทีมที่พร้อมเติบโตไปด้วยกัน', description: 'พัฒนาขนาดทีมดูแลเป็นรากฐานของเครือข่าย PHC และการฝึกอบรม', chapter: 8, staff: 12, spaces: ['ทีมบุคลากร', 'ห้องฝึกอบรมอ้างอิง', 'พื้นที่ดูแลร่วมกัน'], art: ['phase-nursing', 'phase-therapy', 'phase-activity']},
    {id: 6, title: 'Neuro Hospital', thai: 'ต่อยอดสู่โรงพยาบาล', description: 'ขยายเครือข่ายด้วยโรงพยาบาล และสำรวจแนวทางห้องตรวจและการฟื้นฟู', chapter: 9, buildings: {hospital: 1}, spaces: ['คลินิก OPD', 'ห้องตรวจ MRI อ้างอิง', 'กายภาพฟื้นฟู'], art: ['phase-opd', 'phase-feeding', 'phase-therapy']},
    {id: 7, title: 'Healthcare Empire', thai: 'อาณาจักรแห่งการดูแล', description: 'รวมศูนย์พักอาศัย วิลล่า Home Care และโรงพยาบาล ภายใต้สำนักงานใหญ่ของเครือข่าย', chapter: 10, buildings: {headquarters: 1, ward: 1, villa: 1, homecare: 1, hospital: 1}, spaces: ['ศูนย์บริหาร', 'เครือข่ายบริการ', 'สวนและพื้นที่ส่วนกลาง'], art: ['phase-nursing', 'phase-sign', 'phase-garden']}
  ];

  function requirements(phase, state, core) {
    const result = [{label: `พัฒนาศูนย์ถึง V${phase.chapter}`, value: `V${state.chapter} / V${phase.chapter}`, done: state.chapter >= phase.chapter}];
    for (const [type, target] of Object.entries(phase.buildings || {})) {
      const count = state.buildings.filter(b => b.type === type).length;
      result.push({label: core.BUILDINGS[type].name, value: `${count} / ${target} หลัง`, done: count >= target, building: type});
    }
    if (phase.rn) result.push({label: 'พยาบาล RN', value: `${state.staff.rn} / ${phase.rn} คน`, done: state.staff.rn >= phase.rn, role: 'rn'});
    if (phase.staff) {
      const count = core.metrics(state).staffCount;
      result.push({label: 'บุคลากรในทีม', value: `${count} / ${phase.staff} คน`, done: count >= phase.staff, role: 'caregiver'});
    }
    return result;
  }

  function status(state, core) {
    const stages = phases.map(phase => {
      const goals = requirements(phase, state, core);
      return {phase, goals, complete: goals.every(goal => goal.done)};
    });
    let current = 1;
    for (const stage of stages) {
      if (!stage.complete) break;
      current = stage.phase.id;
    }
    return {stages, current, completed: stages.filter(stage => stage.complete).length, next: stages.find(stage => !stage.complete)?.phase.id || 7};
  }

  function render(parent, selectedId, {state, core, assets, command, go, select}) {
    const snapshot = state(), journey = status(snapshot, core);
    const selected = journey.stages.find(stage => stage.phase.id === Number(selectedId)) || journey.stages[journey.next - 1];
    const phase = selected.phase;
    const container = document.createElement('div');
    container.className = 'h15-journey-content';
    container.innerHTML = `<div class="h15-intro"><div><span>GROW WITH CARE</span><h3>จากบ้านหลังแรก สู่เครือข่ายแห่งการดูแล</h3><p>ค่อย ๆ เติบโตไปด้วยกัน ทีละระยะ</p></div><div class="h15-completion"><strong>${journey.completed}<small> / 7</small></strong><span>เป้าหมายที่สำเร็จ</span></div></div><nav class="h15-rail" aria-label="เลือกดูระยะการพัฒนา"></nav><article id="h15-detail"></article>`;
    parent.append(container);
    const rail = container.querySelector('.h15-rail'), detail = container.querySelector('#h15-detail');
    for (const stage of journey.stages) {
      const tab = document.createElement('button');
      tab.id = 'h15-phase-' + stage.phase.id;
      tab.className = 'h15-stage' + (stage.phase.id === phase.id ? ' active' : '');
      tab.dataset.phase = stage.phase.id;
      tab.setAttribute('aria-pressed', String(stage.phase.id === phase.id));
      tab.innerHTML = `<b>${stage.complete ? '✓' : stage.phase.id}</b><span>PHASE ${stage.phase.id}<strong>${stage.phase.title}</strong></span>`;
      tab.onclick = () => { select(stage.phase.id); document.getElementById(tab.id)?.focus({preventScroll: true}); };
      rail.append(tab);
    }
    const hero = document.createElement('div');hero.className = 'h15-hero';
    const copy = document.createElement('div');copy.className = 'h15-copy';
    const eyebrow = document.createElement('span');eyebrow.className = 'h15-eyebrow';eyebrow.textContent = `PHASE ${phase.id} · ${selected.complete ? 'เงื่อนไขครบแล้ว' : 'เป้าหมายการพัฒนา'}`;
    const title = document.createElement('h3');title.textContent = phase.title;
    const sub = document.createElement('strong');sub.textContent = phase.thai;
    const description = document.createElement('p');description.textContent = phase.description;
    copy.append(eyebrow, title, sub, description);
    const requirementsList = document.createElement('ul');requirementsList.className = 'h15-requirements';
    for (const goal of selected.goals) {
      const item = document.createElement('li');item.classList.toggle('done', goal.done);
      const icon = document.createElement('b');icon.textContent = goal.done ? '✓' : '○';
      const label = document.createElement('span');label.textContent = goal.label;
      const value = document.createElement('small');value.textContent = goal.value;
      item.append(icon, label, value);requirementsList.append(item);
    }
    copy.append(requirementsList);
    function action(title, label, callback, disabled = false) {
      const button = document.createElement('button');button.className = 'h15-action';button.disabled = disabled;
      const strong = document.createElement('strong');strong.textContent = title;
      const small = document.createElement('small');small.textContent = label;
      button.append(strong, small);button.onclick = callback;copy.append(button);
    }
    if (snapshot.chapter < phase.chapter) {
      const chapter = snapshot.chapter + 1, trial = core.perform(snapshot, {type: 'unlock', chapter});
      action(`พัฒนาขั้นถัดไป · V${chapter}`, trial.ok ? `ค่าพัฒนา ฿${(snapshot.cash - trial.state.cash).toLocaleString('th-TH')}` : trial.reason, () => command('unlock', {chapter}), !trial.ok);
    } else {
      const pending = selected.goals.find(goal => !goal.done);
      if (pending?.building) {
        const building = core.BUILDINGS[pending.building];
        const trial = core.perform(snapshot, {type: 'build', building: pending.building});
        action('สร้าง' + building.name, trial.ok ? `฿${building.cost.toLocaleString('th-TH')} · +${building.cap} เตียง` : trial.reason, () => command('build', {building: pending.building}), !trial.ok);
      } else if (pending?.role) {
        const role = pending.role, trial = core.perform(snapshot, {type: 'hire', role});
        action('จ้าง ' + core.STAFF[role].name, trial.ok ? `ค่ารับเข้า ฿${Math.round(core.STAFF[role].wage / 4).toLocaleString('th-TH')}` : trial.reason, () => command('hire', {role}), !trial.ok);
      } else action('บริหารศูนย์ต่อ', 'สร้าง ดูแล และขยายกิจการ', () => go('build'));
    }
    const explore = document.createElement('button');explore.className = 'h15-explore';explore.textContent = 'ดูอาคารและบริการทั้งหมด ↗';explore.onclick = () => go('build');copy.append(explore);
    detail.append(hero, copy);
    assets.thumbnail('phase-' + phase.id).then(canvas => {
      if (!canvas || !hero.isConnected) return;
      canvas.className = 'h15-hero-art';canvas.setAttribute('aria-label', phase.title + ' · ภาพแนวทางการพัฒนา');hero.prepend(canvas);
    }).catch(() => { hero.textContent = 'ไม่สามารถโหลดภาพตัวอย่างได้'; });
    const spaces = document.createElement('div');spaces.className = 'h15-spaces';
    phase.art.forEach((id, index) => {
      const card = document.createElement('div'), caption = document.createElement('span');caption.textContent = phase.spaces[index];card.append(caption);spaces.append(card);
      assets.thumbnail(id).then(canvas => { if (canvas && card.isConnected) {canvas.setAttribute('aria-label', phase.spaces[index]);card.prepend(canvas);} }).catch(() => {});
    });hero.append(spaces);
    const footnote = document.createElement('p');footnote.className = 'h15-footnote';
    footnote.textContent = 'ภาพเป็นแนวทางของแต่ละระยะ ห้องและบริการบางรายการ เช่น MRI และ Daycare แสดงเป็นแนวคิดภาพประกอบ';
    container.append(footnote);
    requestAnimationFrame(() => { if (rail.isConnected) rail.querySelector('.active')?.scrollIntoView({block: 'nearest', inline: 'center'}); });
  }
  window.HealthcarePhases = {phases, requirements, status, render};
})();
