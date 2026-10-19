"""Verify a live scene and a complete first-day loop, not decorative placeholders."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright

url=os.environ.get('CMNH_TEST_URL','http://127.0.0.1:8000/')
artifacts=Path(os.environ.get('CMNH_TEST_ARTIFACTS','/tmp/cmnh-campus-tests'));artifacts.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1280,'height':853});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url,wait_until='domcontentloaded');page.wait_for_function('window.HealthcareEmpireV14?.campus.getState()?.ready')
    assert page.locator('.h17-building').count()==3
    assert page.locator('[data-building-type="hospital"]').count()==0
    assert page.locator('[data-building-type="villa"]').count()==0
    assert page.evaluate('HealthcareEmpireV14.campus.getState().residents.length')==8
    assert page.evaluate('HealthcareEmpireV14.campus.getState().buildings.reduce((n,b)=>n+b.occupants,0)')==8
    assert page.locator('#h14rooms').count()==0
    # Locked care now explains the prerequisite and provides a working route to it.
    page.evaluate("HealthcareEmpireV14.open('care')")
    assert page.locator('[data-command-key="care"]').is_disabled()
    assert 'V5' in page.locator('[data-command-key="care"]').inner_text()
    page.keyboard.press('Escape');page.locator('#h17next').click()
    # A player can complete the first day entirely with visible guide controls.
    for step in ['เพิ่มพยาบาล RN เป็น 3 คน','ขยายศูนย์เป็น 4 อาคาร','รับผู้พักอาศัยคนที่ 9','พัฒนาศูนย์เป็น V5','ดูแลให้คุณภาพชีวิตถึง 85','ปิดรอบบัญชีวันแรก']:
        section=page.locator('.h17-step').filter(has_text=step)
        section.locator('button').click()
    assert page.locator('.h17-step button').count()==0
    state=page.evaluate('HealthcareBridge.getState()')
    assert state['staff']['rn']==3 and state['residents']==9 and len(state['buildings'])==4
    assert state['chapter']==5 and state['wellbeing']>=85 and state['stats']['days']==1
    page.keyboard.press('Escape')
    assert page.locator('.h17-building').count()==4
    assert page.evaluate('HealthcareEmpireV14.campus.getState().residents.length')==9
    page.wait_for_function('HealthcareEmpireV14.campus.getState().ready')
    page.screenshot(path=str(artifacts/'first-day-campus.png'))
    # Reloading must reconstruct the same scene and preserve the original save key.
    page.reload(wait_until='domcontentloaded');page.wait_for_function('window.HealthcareEmpireV14?.campus.getState()?.ready')
    assert page.evaluate('HealthcareBridge.getState()')==state
    assert page.locator('.h17-building').count()==4
    assert page.evaluate('HealthcareEmpireV14.campus.getState().residents.length')==9
    # Select a different actual ward; care must go to a real resident of that ward.
    target=page.evaluate('''()=>{const c=HealthcareEmpireV14.campus.getState();const b=c.buildings.filter(b=>b.occupants>0).at(-1);return {building:b.id,person:c.residents.find(r=>r.buildingId===b.id)}}''')
    page.locator(f'[data-building-id="{target["building"]}"]').click()
    page.locator('.h14-card').filter(has_text='แผนการดูแล').click()
    page.locator('[data-command-key="care"]').click()
    task=page.evaluate('HealthcareEmpireV14.world.getState().agents.find(a=>a.task)?.task')
    assert task and task['destination']==[target['person']['x'],target['person']['y']]
    page.keyboard.press('Escape')
    # The displayed fee and the engine agree at the exact affordability boundary.
    page.evaluate('''()=>{const s=HealthcareBridge.getState();s.cash=Math.round(HealthcareCore.STAFF.pt.wage/4);HealthcareBridge.loadState(s);HealthcareEmpireV14.render()}''')
    page.evaluate("HealthcareEmpireV14.open('staff')")
    assert not page.locator('[data-command-key="pt"]').is_disabled()
    page.locator('[data-command-key="pt"]').click()
    assert page.evaluate('HealthcareBridge.getState().cash')==0
    page.keyboard.press('Escape')
    # Discharging a resident must remove the visible person, not just change a HUD number.
    page.evaluate("HealthcareEmpireV14.open('residents')")
    page.on('dialog',lambda d:d.accept());page.locator('.h14-card').filter(has_text='จำหน่ายผู้พักอาศัย 1 คน').click()
    assert page.evaluate('HealthcareEmpireV14.campus.getState().residents.length')==8
    page.keyboard.press('Escape')
    page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(250)
    page.screenshot(path=str(artifacts/'mobile-campus.png'))
    assert page.evaluate('document.documentElement.scrollWidth')==390
    assert not errors,errors
    print('PASS: actual saved buildings/residents only, disabled locked actions, six-step first-day loop, scene reconstruction after reload, care assigned to a resident in selected ward, exact hiring fee and visual discharge; no JS errors')
    browser.close()
