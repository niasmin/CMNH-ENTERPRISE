from playwright.sync_api import sync_playwright
import os
from pathlib import Path
BASE_URL = os.environ.get("CMNH_TEST_URL", "http://127.0.0.1:8000/")
ARTIFACTS = Path(os.environ.get("CMNH_TEST_ARTIFACTS", "/tmp/cmnh-v14-tests"))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader'])
 page=browser.new_page(viewport={'width':1280,'height':853},device_scale_factor=1)
 errors=[];missing=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:missing.append(r.url) if r.status>=400 and r.url.startswith('http://127.0.0.1:8000') else None)
 page.goto(BASE_URL,wait_until='domcontentloaded');page.wait_for_function('window.HealthcareEmpireV14?.world.getState().ready')
 print('initial',page.evaluate('({valid:HealthcareCore.validate(HealthcareBridge.getState()),cash:HealthcareBridge.getState().cash})'))
 page.wait_for_function('HealthcareEmpireV14.campus.getState().ready');page.screenshot(path=str(ARTIFACTS / 'desktop.png'))
 # Existing player commands must change the authoritative state.
 before=page.evaluate('HealthcareBridge.getState()');page.locator('.h14-left [data-panel="staff"]').click();page.locator('.h14-card').filter(has_text='RN พยาบาล').click()
 assert page.evaluate('HealthcareBridge.getState().staff.rn')==before['staff']['rn']+1
 page.locator('#h14close').click();page.locator('.h14-left [data-panel="build"]').click();page.locator('.h14-card').filter(has_text='หอพักผู้สูงอายุ').click();assert page.evaluate('HealthcareBridge.getState().buildings.length')==len(before['buildings'])+1
 page.locator('#h14close').click();page.locator('.h14-bottom [data-panel="residents"]').click();page.locator('.h14-card').filter(has_text='รับผู้พักอาศัยใหม่').click();assert page.evaluate('HealthcareBridge.getState().residents')==before['residents']+1
 page.locator('#h14close').click();page.locator('#h14zoomIn').click();assert float(page.locator('#h14view').get_attribute('data-zoom'))>1;page.locator('#h14reset').click()
 page.locator('.h14-left [data-panel="decorate"]').click();page.locator('.h14-card').filter(has_text='ต้นไม้').click();page.mouse.click(770,580);page.wait_for_function('HealthcareEmpireV14.world.getState().decorationCount===1');assert page.evaluate('HealthcareBridge.getState().settings.decorations.length')==1
 page.locator('#h14play').click();page.wait_for_timeout(400);a=page.evaluate('HealthcareEmpireV14.world.getState().agents');page.wait_for_timeout(500);b=page.evaluate('HealthcareEmpireV14.world.getState().agents');assert a!=b
 page.locator('#h14play').click();h=page.evaluate('HealthcareBridge.getState().hour');page.locator('#h14step').click();assert page.evaluate('HealthcareBridge.getState().hour')==(h+1)%24
 # Persistence and tab/dialog behaviors.
 saved=page.evaluate('HealthcareBridge.getState()');page.reload(wait_until='domcontentloaded');page.wait_for_function('!!window.HealthcareEmpireV14');assert page.evaluate('HealthcareBridge.getState()')==saved
 page.evaluate("HealthcareEmpireV14.open('cloud')");page.evaluate("HealthcareEmpireV14.open('finance')");assert page.locator('#he-cloud-panel').count()==1
 page.keyboard.press('Escape');assert page.locator('#h14panel').is_hidden()
 page.locator('[data-building-id="1"]').click();assert 'หอพักผู้สูงอายุ' in page.locator('#h14title').inner_text();page.keyboard.press('Escape')
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(ARTIFACTS / 'mobile.png'));assert page.evaluate('document.documentElement.scrollWidth')==390
 page.locator('.h14-left [data-panel="staff"]').click();page.screenshot(path=str(ARTIFACTS / 'mobile-panel.png'));page.keyboard.press('Escape')
 page.evaluate("HealthcareEmpireV14.open('assets')");page.wait_for_function('document.querySelectorAll(".h14-gallery canvas").length>20');print('asset thumbnails',page.locator('.h14-gallery canvas').count())
 page.locator('.h14-nurse-preview select').first.select_option('northwest');page.locator('.h14-nurse-preview select').last.select_option('run')
 with page.expect_download() as download:
  page.locator('.h14-gallery .h14-card').first.click()
 assert download.value.suggested_filename.endswith('.png')
 page.keyboard.press('Escape')
 # Locked/rejected actions must leave player state untouched.
 unchanged=page.evaluate('HealthcareBridge.getState()')
 assert not page.evaluate("HealthcareEmpireV14.command('build',{building:'hospital'})")
 assert page.evaluate('HealthcareBridge.getState()')==unchanged
 # Cloud/identity-driven bridge updates must refresh the HUD too.
 page.evaluate('''()=>{const s=HealthcareBridge.getState();s.cash+=123;HealthcareBridge.loadState(s)}''')
 page.wait_for_timeout(1200)
 assert str(page.evaluate('HealthcareBridge.getState().cash')).replace(',','') in page.locator('#h14cash').inner_text().replace(',','')
 # Reduced motion must stop walking even when game time runs.
 page.emulate_media(reduced_motion='reduce');page.locator('#h14play').click();page.wait_for_timeout(200)
 assert all(a['action']=='idle' for a in page.evaluate('HealthcareEmpireV14.world.getState().agents'))
 page.locator('#h14play').click()
 print('errors',errors);print('local HTTP failures',missing);assert errors==[], errors; assert missing==[], missing; print('all gameplay, animation, persistence, export, reduced-motion, desktop/mobile checks passed');browser.close()
