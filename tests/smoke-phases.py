"""Seven-phase roadmap: use disposable browser state, never Supabase writes."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright

url = os.environ.get('CMNH_TEST_URL', 'http://127.0.0.1:8000/')
artifacts = Path(os.environ.get('CMNH_TEST_ARTIFACTS', '/tmp/cmnh-phase-tests'))
artifacts.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--disable-dev-shm-usage','--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width':1280,'height':853})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(url, wait_until='domcontentloaded')
    page.wait_for_function('!!window.HealthcareEmpireV14 && !!window.HealthcarePhases')
    original = page.evaluate('HealthcareBridge.getState()')
    page.locator('#h15journey').click()
    assert page.locator('.h15-stage').count() == 7
    assert page.locator('#h15-detail h3').inner_text() == 'Professional Nursing Center'
    # Browsing all future phases must never unlock them or charge the player.
    for phase in range(1,8):
        page.locator(f'.h15-stage[data-phase="{phase}"]').click()
        page.wait_for_selector('.h15-hero-art')
        assert page.evaluate('HealthcareBridge.getState()') == original
    assert page.evaluate('HealthcarePhases.status(HealthcareBridge.getState(),HealthcareCore).completed') == 1
    page.screenshot(path=str(artifacts/'roadmap-desktop.png'))
    page.locator('.h15-stage[data-phase="2"]').click()
    page.locator('.h15-action').click()
    assert page.evaluate('HealthcareBridge.getState().chapter') == 5
    page.locator('.h15-action').click()
    assert page.evaluate('HealthcareBridge.getState().staff.rn') == 3
    assert page.evaluate('HealthcarePhases.status(HealthcareBridge.getState(),HealthcareCore).current') == 2
    # Reopening and reloading must preserve both the upgrade and hire.
    upgraded = page.evaluate('HealthcareBridge.getState()')
    page.reload(wait_until='domcontentloaded')
    page.wait_for_function('!!window.HealthcareEmpireV14')
    assert page.evaluate('HealthcareBridge.getState()') == upgraded
    page.locator('#h15journey').click()
    assert page.locator('#h15-detail h3').inner_text() == 'Tranquila Senior Living'
    assert 'V8' in page.locator('.h15-requirements').inner_text()
    # Roadmap actions must preserve the engine's reputation lock (V7 needs rep52).
    page.locator('.h15-action').click()
    assert page.evaluate('HealthcareBridge.getState().chapter') == 6
    assert page.locator('.h15-action').is_disabled()
    state_before = page.evaluate('HealthcareBridge.getState()')
    page.evaluate("HealthcareEmpireV14.command('unlock',{chapter:7})")
    assert page.evaluate('HealthcareBridge.getState()') == state_before
    # Exercise all seven milestones with genuine engine actions and earned funds.
    result = page.evaluate('''() => {
      const G=HealthcareCore;let s=HealthcareBridge.getState();
      const apply=(type,args={})=>{const r=G.perform(s,{type,...args});if(!r.ok)throw Error(r.reason);s=r.state};
      apply('action',{action:'quality'});
      apply('unlock',{chapter:7});apply('unlock',{chapter:8});
      // Earn a reserve before hospital operations increase daily costs.
      for(let i=0;i<42;i++)apply('tick',{hours:720});
      apply('build',{building:'villa'});apply('build',{building:'homecare'});
      while(G.metrics(s).staffCount<12)apply('hire',{role:'caregiver'});
      apply('unlock',{chapter:9});apply('build',{building:'hospital'});
      apply('unlock',{chapter:10});apply('build',{building:'headquarters'});
      HealthcareBridge.loadState(s);return {valid:G.validate(s),status:HealthcarePhases.status(s,G)};
    }''')
    assert result['valid']
    assert result['status']['current'] == 7 and result['status']['completed'] == 7
    page.keyboard.press('Escape');page.locator('#h15journey').click()
    assert page.locator('#h15-detail h3').inner_text() == 'Healthcare Empire'
    assert page.locator('.h15-requirements li.done').count() == 6
    page.set_viewport_size({'width':390,'height':844})
    page.locator('.h15-stage[data-phase="3"]').click();page.wait_for_selector('.h15-hero-art')
    page.locator('#h14toast').wait_for(state='hidden');page.screenshot(path=str(artifacts/'roadmap-mobile.png'))
    assert page.evaluate('document.documentElement.scrollWidth') == 390
    page.keyboard.press('Escape');page.evaluate("HealthcareEmpireV14.open('assets')")
    page.locator('.h15-asset-filter').select_option('phase')
    page.wait_for_function('document.querySelectorAll(".h14-gallery canvas").length===7')
    with page.expect_download() as download:
        page.locator('.h14-gallery .h14-card').last.click()
    assert download.value.suggested_filename == 'phase-7.png'
    page.locator('.h15-asset-filter').select_option('vehicle')
    page.wait_for_function('document.querySelectorAll(".h14-gallery canvas").length===2')
    assert not errors, errors
    print('PASS: seven phase previews, no-cost browsing, original unlock locks/prices, earned progression to phase7, reload persistence, mobile, category filters and PNG export; no JavaScript errors')
    browser.close()
