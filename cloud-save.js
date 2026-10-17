/* Healthcare Empire Supabase Auth + Cloud Save (optional; local save continues working) */
(function(){
"use strict";
const c=window.HE_SUPABASE_CONFIG;
if(!c){console.warn("Missing Supabase configuration");return}
const $=id=>document.getElementById(id);
const status=(msg)=>{const e=$("cloud-status");if(e)e.textContent=msg};
let client=null, user=null, busy=false;
async function initialize(){
 try{
  const mod=await import("https://esm.sh/@supabase/supabase-js@2");
  client=mod.createClient(c.url,c.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data,error}=await client.auth.getUser();
  if(error && error.name!=="AuthSessionMissingError")console.warn(error.message);
  user=data?.user||null;draw();
  client.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;draw()});
 }catch(e){status("ไม่สามารถโหลดระบบ Cloud Save: "+e.message)}
}
function draw(){
 const email=$("cloud-email"),login=$("cloud-login"),logout=$("cloud-logout"),save=$("cloud-save"),load=$("cloud-load");
 if(email)email.hidden=!!user;
 if(login)login.hidden=!!user;
 if(logout)logout.hidden=!user;
 if(save)save.disabled=!user||busy;
 if(load)load.disabled=!user||busy;
 status(user?"เข้าสู่ระบบ: "+(user.email||"บัญชีผู้เล่น"):"ยังไม่เข้าสู่ระบบ · เล่นและบันทึกในเครื่องได้ตามปกติ");
}
async function signIn(){
 const email=$("cloud-email")?.value?.trim();
 if(!email||!email.includes("@")){status("กรุณากรอกอีเมลที่ถูกต้อง");return}
 const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
 status(error?"ส่งลิงก์ไม่สำเร็จ: "+error.message:"ส่งลิงก์เข้าสู่ระบบไปยังอีเมลแล้ว");
}
async function cloudSave(){
 if(!user||busy)return;
 busy=true;draw();
 try{
  const state=window.HE_getGameState?.();
  if(!state)throw Error("เกมยังไม่พร้อมบันทึก");
  const {error}=await client.from("game_saves").upsert({user_id:user.id,slot:"main",game_state:state,updated_at:new Date().toISOString()},{onConflict:"user_id,slot"});
  if(error)throw error;
  status("บันทึกเกมบน Supabase สำเร็จ");
 }catch(e){status("บันทึกออนไลน์ไม่สำเร็จ: "+e.message)}
 finally{busy=false;drawButtons()}
}
async function cloudLoad(){
 if(!user||busy)return;
 busy=true;draw();
 try{
  const {data,error}=await client.from("game_saves").select("game_state,updated_at").eq("user_id",user.id).eq("slot","main").maybeSingle();
  if(error)throw error;
  if(!data){status("ยังไม่มีข้อมูลบันทึกบน Cloud");return}
  if(!confirm("โหลดเกมจาก Cloud? ข้อมูลเกมปัจจุบันในเครื่องจะถูกแทนที่"))return;
  if(!window.HE_setGameState?.(data.game_state))throw Error("รูปแบบข้อมูลเกมไม่ถูกต้อง");
  status("โหลดเกมจาก Supabase สำเร็จ ("+new Date(data.updated_at).toLocaleString("th-TH")+")");
 }catch(e){status("โหลดออนไลน์ไม่สำเร็จ: "+e.message)}
 finally{busy=false;drawButtons()}
}
function drawButtons(){const save=$("cloud-save"),load=$("cloud-load");if(save)save.disabled=!user||busy;if(load)load.disabled=!user||busy}
function setup(){
 $("cloud-login")?.addEventListener("click",signIn);
 $("cloud-logout")?.addEventListener("click",async()=>{if(client){await client.auth.signOut();user=null;draw()}});
 $("cloud-save")?.addEventListener("click",cloudSave);
 $("cloud-load")?.addEventListener("click",cloudLoad);
 initialize();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup);else setup();
})();
