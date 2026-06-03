# CLAUDE.md

บริบทโปรเจกต์สำหรับ Claude Code อ่านไฟล์นี้ก่อนเริ่มทำงาน

## ภาพรวม

Todo list web app เชื่อมต่อ Supabase จริง deploy บน Vercel (auto-deploy เมื่อ push ขึ้น branch `main`)

Stack: React 18 + Vite 5 + Supabase (Postgres) + Tailwind (โหลดผ่าน CDN ใน `index.html`) ไอคอนใช้ lucide-react

## โครงสร้างไฟล์

- `src/App.jsx` — คอมโพเนนต์หลักทั้งหมด (UI + logic การคุยกับ DB)
- `src/supabaseClient.js` — สร้าง Supabase client อ่านค่าจาก env var
- `src/main.jsx` — entry point
- `index.html` — โหลด Tailwind ผ่าน CDN
- `.env` — ค่า config (ไม่อยู่ใน git ต้องสร้างเอง ดูหัวข้อ Environment)

## Environment variables

ไฟล์ `.env` ที่ root (ไม่ commit ขึ้น git):

```
VITE_SUPABASE_URL=https://hvutunxwfckgrakxknqs.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_KO9bO7CdX3oGOpjgo0qdhQ_rkDZL9Cy
```

บน Vercel ตั้งค่า 2 ตัวนี้ในหน้า Project Settings > Environment Variables (ไม่ใช่ commit ไฟล์ขึ้นไป)

key ที่ใช้เป็น publishable/anon key เปิดเผยใน frontend ได้ตามปกติ ความปลอดภัยมาจาก RLS **ห้ามใส่ service_role key ใน frontend เด็ดขาด**

## Database schema

ตาราง `public.todos` (เปิด RLS):

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|---------|
| `id` | uuid | primary key, default gen_random_uuid() |
| `task` | text | not null |
| `is_done` | boolean | not null, default false |
| `created_at` | timestamptz | not null, default now() |
| `category` | text | not null, default 'ทั่วไป' |
| `due_date` | date | nullable |

RLS policy: ตอนนี้เปิดให้ role `anon` ทำได้ทั้ง select/insert/update/delete (ไม่มีระบบ login) — เหมาะกับเดโม ถ้าจะใช้จริงต้องเพิ่ม auth แล้วผูก policy กับ auth.uid()

หมวดหมู่ที่ UI รองรับ: ทั่วไป, งาน, ส่วนตัว, ช้อปปิ้ง, สุขภาพ

## คำสั่งที่ใช้บ่อย

- `npm install` — ติดตั้ง dependencies
- `npm run dev` — รัน dev server (http://localhost:5173)
- `npm run build` — build production (ควรรันเช็คก่อน push เสมอ)
- `npm run preview` — ดู production build ในเครื่อง

## Workflow การ deploy

1. แก้โค้ด
2. `npm run build` ให้ผ่านก่อน
3. commit + push ขึ้น `main`
4. Vercel auto-deploy เอง

## ลิงก์

- GitHub: https://github.com/suraseehanat/todo-app-supabase
- Supabase project ref: hvutunxwfckgrakxknqs (region: ap-southeast-2)

## ข้อควรระวัง

- อย่า commit `.env`
- ตรวจว่า insert/update ส่ง field ให้ตรงกับ schema (เช่น `due_date` ส่ง null ได้ถ้าไม่ระบุ)
- เมื่อแก้ schema ใน Supabase อย่าลืมอัปเดตทั้ง `App.jsx` และไฟล์นี้ให้ตรงกัน
