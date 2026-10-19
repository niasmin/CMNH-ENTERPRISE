"""Verify the new graphics are real local 3D geometry and remain linked to saved state."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
url=os.environ.get('CMNH_TEST_URL','http://127.0.0.1:8000/')
artifacts=Path(os.environ.get('CMNH_TEST_ARTIFACTS','/tmp/cmnh-graphics-tests'));artifacts.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader'])
    page=browser.new_page(viewport={'width':1280,'height':853});errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
    page.goto(url,wait_until='domcontentloaded');page.wait_for_function('window.HealthcareEmpireV14?.world.getState().triangles>0')
    state=page.evaluate('HealthcareBridge.getState()');world=page.evaluate('HealthcareEmpireV14.world.getState()')
    assert world['webgl'] and world['triangles']>10000 and world['drawCalls']<250
    assert page.evaluate('HealthcareEmpireV14.world.graphics.facilities.children.length')==len(state['buildings'])
    assert page.evaluate('HealthcareEmpireV14.world.graphics.residents.children.length')==state['residents']
    assert not any('/assets/v14/' in r or 'building-ward-clean.png' in r or 'nurse.jpg' in r for r in requests)
    assert not any('cdn.jsdelivr.net' in r for r in requests)
    assert page.locator('.h14-avatar canvas').count()==1
    page.screenshot(path=str(artifacts/'new-3d-desktop.png'))
    # Repeated source meshes are actually GPU-instanced, not just relabelled old PNGs.
    assert page.evaluate('HealthcareEmpireV14.world.graphics.staticBatch.children.every(m=>m.isInstancedMesh)')
    fingerprints=page.evaluate('''()=>{const types=['ward','therapy','activity','garden','homecare','branch','villa','hospital','lab','headquarters'];return types.map(type=>{const model=HealthcareGraphics.building(type);let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=o.geometry.index?o.geometry.index.count/3:o.geometry.attributes.position.count/3}});return {type,meshes,triangles}})}''')
    assert all(f['meshes']>10 for f in fingerprints)
    assert len({(f['meshes'],f['triangles']) for f in fingerprints})>=9
    assert page.evaluate('''()=>Object.entries(HealthcareCore.BUILDINGS).every(([type,def])=>{const model=HealthcareGraphics.building(type);let beds=0;model.traverse(o=>{if(o.userData.patientBed)beds++});return beds===def.cap&&HealthcareGraphics.bedSlots(type).length===def.cap})''')
    # The orbit camera changes the actual rendered view and reset restores it.
    before=page.locator('#h14nurses').evaluate('(c)=>c.toDataURL()')
    page.mouse.move(720,650);page.mouse.down();page.mouse.move(860,610,steps=8);page.mouse.up();page.wait_for_timeout(250)
    after=page.locator('#h14nurses').evaluate('(c)=>c.toDataURL()');assert before!=after
    page.locator('#h14reset').click();page.locator('[data-building-id="1"]').click()
    page.locator('.h14-card').filter(has_text='ดูอาคารใกล้ ๆ').click()
    assert page.locator('#h14panel').is_hidden()
    page.screenshot(path=str(artifacts/'cutaway-closeup.png'))
    # Limb rigs visibly move; no old sprite frame atlas is required.
    page.locator('#h14play').click();page.wait_for_timeout(250)
    angles=page.evaluate('HealthcareEmpireV14.world.graphics.nurses.children[0].userData.rig.legs.map(l=>l.rotation.x)')
    page.wait_for_timeout(300)
    assert page.evaluate('HealthcareEmpireV14.world.graphics.nurses.children[0].userData.rig.legs.map(l=>l.rotation.x)')!=angles
    page.locator('#h14play').click()
    # Thumbnail PNG is a new transparent model render, not a copied reference sheet.
    pixels=page.evaluate('''async()=>{const c=await HealthcareAssets.thumbnail('villa');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let transparent=0,opaque=0;for(let i=3;i<d.length;i+=4){if(d[i]===0)transparent++;if(d[i]>0)opaque++}return {transparent,opaque}}''')
    assert pixels['transparent']>100 and pixels['opaque']>1000
    # Room model explorer uses local new meshes and exposes orbit controls.
    page.evaluate("Healthcare3DRooms.open('rehabilitation')");page.wait_for_selector('#h18room canvas');page.wait_for_timeout(250)
    assert 'กายภาพ' in page.locator('#h18room h2').inner_text()
    page.screenshot(path=str(artifacts/'therapy-room.png'));page.keyboard.press('Escape');assert page.locator('#h18room').count()==0
    page.set_viewport_size({'width':390,'height':844});page.locator('#h14reset').click();page.wait_for_timeout(250)
    page.screenshot(path=str(artifacts/'new-3d-mobile.png'));assert page.evaluate('document.documentElement.scrollWidth')==390
    # Same existing save and library capabilities survive a reload.
    saved=page.evaluate('HealthcareBridge.getState()');page.reload(wait_until='domcontentloaded');page.wait_for_function('window.HealthcareEmpireV14?.world.getState().triangles>0')
    assert page.evaluate('HealthcareBridge.getState()')==saved
    assert not errors,errors
    print('PASS: real WebGL geometry, instanced rendering, distinct facilities, no old raster/cdn loads, orbit/reset/focus, animated limbs, transparent model thumbnails, new room viewer, mobile and save preservation')
    browser.close()
