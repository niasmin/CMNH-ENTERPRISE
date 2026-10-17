# CMNH ENTERPRISE — Healthcare Empire

เกมจำลองบริหารศูนย์ดูแลผู้สูงอายุและเครือข่ายสุขภาพ (CMNH, Tranquila, Home Care, Daycare, Neuro Hospital และ Payap Health Care)

## สถานะ

Repository สำหรับพัฒนาเกม Healthcare Empire โดยแยก **ตัวเกมที่เผยแพร่บน GitHub** ออกจาก **V11 Mobile Beta แบบเต็ม** ที่ยังเป็นแพ็กเกจ ZIP ในบทสนทนา ChatGPT และยังไม่ได้อัปโหลดสินทรัพย์ภาพ 6.5 MB เข้า GitHub ครบถ้วน

## เริ่มเล่น

เปิด `index.html` หรือเปิดผ่าน GitHub Pages หลังตั้งค่า Pages ให้ใช้ `main` / root

## สิ่งที่ต้องทำก่อนเรียก Production

- นำ source และ assets จาก `Healthcare_Empire_V11_Mobile_Beta_Cloudflare.zip` มาแทนตัวเกมเบื้องต้นใน repository นี้
- ทดสอบภาพและการควบคุมบนโทรศัพท์จริง
- ทดสอบการบันทึกและโหลดเกม รวมถึงระบบ cloud save ที่ใช้บัญชีจริง
- ตั้งค่า deployment และทดสอบ regression

**หมายเหตุ:** GitHub Pages ยังไม่ถูกเปิดใช้โดยอัตโนมัติ และ Cloud Save ยังไม่ยืนยันว่าเชื่อมบริการจริงแล้ว
