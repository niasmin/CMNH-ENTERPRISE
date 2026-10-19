# CMNH ENTERPRISE — Healthcare Empire

## สถานะการย้าย V11 (18 ต.ค. 2569)

- **เชื่อม Supabase:** โปรเจกต์ `qrxfmymmsjsyzhvuudtj`; ตาราง `public.game_saves` พร้อม RLS
- **เพิ่ม Cloud Save adapter:** `v11-supabase-save.js` สำหรับ V11 (ไม่ใช้ D1 Worker)
- **เพิ่มระบบ Deploy:** `.github/workflows/deploy-v11.yml` แตกไฟล์ ZIP V11 และเผยแพร่ผ่าน GitHub Pages
- **ยังรอ ZIP เกม V11:** ไฟล์ภาพและ source รวม ~6.5 MB ยังไม่ถูกอัปโหลดเข้ามาใน GitHub ผ่านตัวเชื่อมต่อ จึงยังไม่ใช่ V11 แบบเต็ม

### ขั้นตอนเดียวที่ต้องทำเพื่อให้ V11 พร้อม Deploy

1. ดาวน์โหลด `Healthcare_Empire_V11_Mobile_Beta_Cloudflare.zip` จากบทสนทนา ChatGPT
2. ใน GitHub เปิด repository นี้ ไปที่ `releases/` (ถ้ายังไม่มี ให้สร้างด้วยการเลือก Add file → Upload files แล้วกำหนด path)
3. อัปโหลดไฟล์ชื่อ **`releases/Healthcare_Empire_V11_Mobile_Beta_Cloudflare.zip`** โดยคงชื่อเดิมทุกตัวอักษร แล้ว Commit ไปที่ `main`
4. เปิด **Settings → Pages → Build and deployment → Source: GitHub Actions**
5. เปิด **Actions → Deploy Healthcare Empire V11** และตรวจว่า workflow สำเร็จ
6. ใน Supabase **Authentication → URL Configuration** เพิ่ม URL ของ GitHub Pages `https://niasmin.github.io/CMNH-ENTERPRISE/` เป็น Redirect URL ที่อนุญาต
7. ทดสอบ Login → Save → Load บนมือถือจริงและอีกอุปกรณ์ก่อนใช้จริง

### วิธี Deploy

GitHub Actions แตก ZIP ลง `site/`, แทนที่การเชื่อม Cloud Save เดิมที่ใช้ D1 Worker ด้วย Supabase โดยตรง, แล้ว Deploy ไปยัง GitHub Pages
(ไฟล์ `auth-cloud.js` ของ V11 เดิมถูกถอดออกจากหน้า Deploy แต่ยังอยู่ใน ZIP สำหรับอ้างอิง)

### ข้อจำกัด

- Supabase ใช้เฉพาะ **publishable key** ที่เผยแพร่ในเว็บได้ ห้ามใส่ service_role หรือ database password ลง repository
- Save ยังเป็นการกดบันทึกเอง ไม่ใช่ auto-save; การบันทึกพร้อมกันจากสองเครื่องยังไม่มี conflict resolution
- ภาพ V11 และการทำงานบน iPhone/Android ยังไม่ผ่านการทดสอบจริง
- การตั้งค่า Supabase Auth Redirect URL ต้องทำใน Dashboard ก่อนใช้งาน Magic Link

## V14 — Care & Beyond

เพิ่มหน้าเกมไอโซเมตริกตามภาพอ้างอิง พร้อมเมนูบริหารที่ใช้ข้อมูลเกมเดิม แผนที่เลื่อน/ซูมได้ ตัวละครพยาบาลเคลื่อนไหว และคลังภาพ 68 รายการ

```sh
python3 tools/prepare-v11.py
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

ZIP V11 มีอยู่ใน repository แล้ว คำแนะนำด้านบนที่ระบุว่ายังรอ ZIP เป็นข้อมูลเก่า ใช้ `site/` ที่สร้างด้วยคำสั่งข้างต้นสำหรับเล่น V14

ดู [วิธีเล่น โครงสร้างภาพ และข้อจำกัด V14](docs/V14-CARE-AND-BEYOND.md) สำหรับรายละเอียด แผนที่เป็นภาพประกอบ ตัวละครใช้ท่าจาก JPEG อ้างอิง ยังไม่ใช่ rig หรือชุดภาพโปร่งใสสมบูรณ์

## เส้นทางพัฒนา 7 ระยะ

เพิ่มหน้าดูเป้าหมายตั้งแต่ First Care Home, Professional Nursing Center, Tranquila, Home Care & Daycare, Healthcare Workforce, Neuro Hospital ถึง Healthcare Empire พร้อมภาพจากชุดใหม่ ปุ่มพัฒนา/สร้าง/จ้างใช้กติกาเดิม ดู [เงื่อนไขและการทดสอบ](docs/V15-PHASES.md)
