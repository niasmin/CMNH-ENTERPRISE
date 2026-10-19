"""Exercise animation output and lifecycle in a fresh browser, without cloud writes."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright

url = os.environ.get('CMNH_TEST_URL', 'http://127.0.0.1:8000/')
artifacts = Path(os.environ.get('CMNH_TEST_ARTIFACTS', '/tmp/cmnh-animation-tests'))
artifacts.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--disable-dev-shm-usage','--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width':1280,'height':853})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(url, wait_until='domcontentloaded')
    page.wait_for_function('window.HealthcareEmpireV14?.world.getState().ready')
    page.wait_for_function('!HealthcareEmpireV14.world.getState().running')
    assert page.evaluate('HealthcareEmpireV14.world.getState().paused')
    saved = page.evaluate('HealthcareBridge.getState()')
    page.locator('#h14play').click()
    page.wait_for_timeout(400)
    before = page.evaluate('HealthcareEmpireV14.world.getState()')
    pixels = page.locator('#h14nurses').evaluate('(c)=>c.toDataURL()')
    page.wait_for_timeout(400)
    after = page.evaluate('HealthcareEmpireV14.world.getState()')
    assert before['agents'][0]['x'] != after['agents'][0]['x']
    assert pixels != page.locator('#h14nurses').evaluate('(c)=>c.toDataURL()')
    assert page.evaluate('HealthcareBridge.getState()') == saved
    page.locator('#h14speed').click();page.locator('#h14speed').click()
    page.wait_for_function('HealthcareEmpireV14.world.getState().agents.some(a=>a.action==="run")')
    page.locator('#h14play').click()
    page.wait_for_function('!HealthcareEmpireV14.world.getState().running')
    frozen = page.evaluate('HealthcareEmpireV14.world.getState()')
    page.wait_for_timeout(200)
    assert page.evaluate('HealthcareEmpireV14.world.getState().agents') == frozen['agents']

    def mode(value):
        page.evaluate("HealthcareEmpireV14.open('settings')")
        page.locator(f'button[data-animation-mode="{value}"]').click()
        assert page.locator(f'button[data-animation-mode="{value}"]').get_attribute('aria-pressed') == 'true'
        page.keyboard.press('Escape')

    mode('reduced');page.locator('#h14play').click();page.wait_for_timeout(200)
    reduced = page.evaluate('HealthcareEmpireV14.world.getState()')
    assert all(a['action']=='idle' for a in reduced['agents'])
    assert not reduced['running']
    page.wait_for_timeout(150)
    assert page.evaluate('HealthcareEmpireV14.world.getState().agents') == reduced['agents']
    page.reload(wait_until='domcontentloaded')
    page.wait_for_function('window.HealthcareEmpireV14?.world.getState().ready')
    assert page.evaluate('HealthcareBridge.getState().settings.animationMode') == 'reduced'
    mode('full')
    page.emulate_media(reduced_motion='reduce')
    page.wait_for_function('HealthcareEmpireV14.world.getState().effectiveMode==="reduced"')
    page.locator('#h14play').click();page.wait_for_timeout(150)
    assert all(a['action']=='idle' for a in page.evaluate('HealthcareEmpireV14.world.getState().agents'))
    page.locator('#h14play').click();page.emulate_media(reduced_motion='no-preference')
    page.wait_for_function('HealthcareEmpireV14.world.getState().effectiveMode==="full"')
    # Demo transitions run->care->return->idle, with no changes to the game state.
    saved = page.evaluate('HealthcareBridge.getState()')
    page.evaluate("HealthcareEmpireV14.open('settings')")
    page.locator('.h16-demo').click()
    page.wait_for_function('HealthcareEmpireV14.world.getState().agents.some(a=>a.state==="caring")')
    assert page.evaluate('HealthcareBridge.getState()') == saved
    page.screenshot(path=str(artifacts/'care-animation.png'))
    page.wait_for_function('HealthcareEmpireV14.world.getState().agents.every(a=>a.state==="idle")', timeout=12000)
    page.wait_for_function('!HealthcareEmpireV14.world.getState().running')
    assert page.evaluate('HealthcareBridge.getState()') == saved
    # Accepted construction queues a bounded visual effect. A rejected action does not.
    page.evaluate("HealthcareEmpireV14.open('build')")
    page.locator('.h14-card').filter(has_text='หอพักผู้สูงอายุ').click()
    assert page.evaluate('HealthcareEmpireV14.world.getState().effectCount') == 1
    assert page.locator('.h17-building').count() == 4
    state_before = page.evaluate('HealthcareBridge.getState()')
    effect_count = page.evaluate('HealthcareEmpireV14.world.getState().effectCount')
    assert not page.evaluate("HealthcareEmpireV14.command('build',{building:'hospital'})")
    assert page.evaluate('HealthcareBridge.getState()') == state_before
    assert page.evaluate('HealthcareEmpireV14.world.getState().effectCount') == effect_count
    page.keyboard.press('Escape')
    page.wait_for_function('HealthcareEmpireV14.world.getState().effectCount===0',timeout=8000)
    mode('off')
    page.evaluate("HealthcareEmpireV14.world.effect('build',{x:500,y:500,label:'demo'})")
    assert page.evaluate('HealthcareEmpireV14.world.getState().effectCount') == 0
    # Inactive/legacy views cancel the loop and can resume without a giant time step.
    mode('full');page.locator('#h14play').click();page.wait_for_timeout(150)
    page.evaluate('HealthcareEmpireV14.world.setActive(false)')
    frozen = page.evaluate('HealthcareEmpireV14.world.getState()')
    page.wait_for_timeout(200)
    assert not page.evaluate('HealthcareEmpireV14.world.getState().running')
    assert page.evaluate('HealthcareEmpireV14.world.getState().agents') == frozen['agents']
    page.evaluate('HealthcareEmpireV14.world.setActive(true)')
    page.wait_for_timeout(200)
    assert page.evaluate('HealthcareEmpireV14.world.getState().running')
    page.locator('#h14play').click()
    page.set_viewport_size({'width':390,'height':844})
    page.evaluate("HealthcareEmpireV14.open('settings')")
    page.wait_for_timeout(250);page.locator('#h14toast').wait_for(state='hidden');page.screenshot(path=str(artifacts/'animation-settings-mobile.png'))
    assert page.evaluate('document.documentElement.scrollWidth') == 390
    assert not errors, errors
    print('PASS: changing canvas pixels, walk/run/care state transitions, pause/idle scheduler, no simulation side effects, reduced/off modes and reload persistence, OS Reduce Motion, construction effects, rejected actions, lifecycle resume and mobile controls')
    browser.close()
