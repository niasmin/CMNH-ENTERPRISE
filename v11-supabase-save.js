/* Healthcare Empire V11 — Supabase Auth and cloud saves (public key only). */
(() => {
"use strict";
const cfg = window.HE_CLOUD_CONFIG || {};
const bridge = window.HealthcareBridge;
if (!bridge) { console.error("HealthcareBridge unavailable"); return; }
const panel = document.createElement("section");
panel.id = "he-cloud-panel";
panel.style.cssText = "position:fixed;z-index:99999;bottom:82px;right:12px;max-width:min(92vw,320px);padding:12px;border:2px solid #7acac1;border-radius:18px;background:#fffffff5;box-shadow:0 6px 20px #2347;color:#163b48;font:14px system-ui,sans-serif";
panel.innerHTML = '<details><summary style="cursor:pointer;font-weight:800">☁️ Supabase · Cloud Save</summary><div style="margin-top:10px"><input id="he-cloud-email" type="email" placeholder="อีเมลผู้เล่น" autocomplete="email" style="width:100%;padding:9px;border-radius:9px;border:1px solid #aaa"><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:9px"><button id="he-cloud-login">✉️ ส่งลิงก์เข้าสู่ระบบ</button><button id="he-cloud-save" disabled>💾 Save</button><button id="he-cloud-load" disabled>📥 Load</button><button id="he-cloud-logout" hidden>ออกจากระบบ</button></div><p id="he-cloud-status" role="status" style="font-size:12px;margin:9px 0 0">กำลังเชื่อมต่อ…</p></div></details>';
document.body.appendChild(panel);
panel.querySelectorAll("button").forEach(b => b.style.cssText = "border:0;border-radius:9px;background:#008e83;color:white;padding:8px;font-weight:700;cursor:pointer");
const el = id => document.getElementById(id);
let client, user, busy = false;
const status = msg => { el("he-cloud-status").textContent = msg; };
function controls() {
  el("he-cloud-email").hidden = !!user;
  el("he-cloud-login").hidden = !!user;
  el("he-cloud-logout").hidden = !user;
  el("he-cloud-save").disabled = !user || busy;
  el("he-cloud-load").disabled = !user || busy;
}
async function login() {
  if (!client) return;
  const email = el("he-cloud-email").value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return status("กรุณากรอกอีเมลที่ถูกต้อง");
  try {
    const { error } = await client.auth.signInWithOtp({
      email, options: { emailRedirectTo: location.origin + location.pathname }
    });
    if (error) throw error;
    status("ส่งลิงก์แล้ว กรุณาตรวจอีเมล และกลับมาเปิดเกม");
  } catch (e) { status("เข้าสู่ระบบไม่สำเร็จ: " + e.message); }
}
async function save() {
  if (!user || busy) return;
  busy = true; controls();
  try {
    const state = bridge.getState();
    const { error } = await client.from("game_saves").upsert({
      user_id: user.id, slot: "main", game_state: state,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id,slot" });
    if (error) throw error;
    status("บันทึกเกมออนไลน์สำเร็จ");
  } catch (e) { status("บันทึกไม่สำเร็จ: " + e.message); }
  finally { busy = false; controls(); }
}
async function load() {
  if (!user || busy) return;
  busy = true; controls();
  try {
    const { data, error } = await client.from("game_saves")
      .select("game_state,updated_at").eq("user_id",user.id)
      .eq("slot","main").maybeSingle();
    if (error) throw error;
    if (!data) return status("ยังไม่มี Cloud Save สำหรับบัญชีนี้");
    if (!confirm("โหลดข้อมูลออนไลน์? เกมในเครื่องปัจจุบันจะถูกแทนที่")) return;
    bridge.loadState(data.game_state);
    status("โหลดเกมออนไลน์สำเร็จ");
  } catch (e) { status("โหลดไม่สำเร็จ: " + e.message); }
  finally { busy = false; controls(); }
}
el("he-cloud-login").onclick = login;
el("he-cloud-save").onclick = save;
el("he-cloud-load").onclick = load;
el("he-cloud-logout").onclick = async () => {
  if (!client) return;
  await client.auth.signOut();
};
async function start() {
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    client = createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    const { data } = await client.auth.getUser();
    user = data?.user || null;
    if (user) bridge.setIdentity(user.id);
    controls();
    status(user ? "เข้าสู่ระบบแล้ว: " + (user.email || "ผู้เล่น") : "ยังไม่เข้าสู่ระบบ · เล่นแบบออฟไลน์ได้");
    client.auth.onAuthStateChange((event, session) => {
      const next = session?.user || null;
      if (next?.id !== user?.id) {
        user = next;
        bridge.setIdentity(next?.id || null);
      } else user = next;
      controls();
      status(user ? "เข้าสู่ระบบแล้ว: " + (user.email || "ผู้เล่น") : "ออกจากระบบแล้ว · เล่นแบบออฟไลน์ได้");
    });
  } catch(e) { status("Cloud Save ไม่พร้อม: " + e.message); }
}
start();
})();
