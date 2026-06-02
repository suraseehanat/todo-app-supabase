# Todo App — React + Vite + Supabase

เดโม todo list ที่ต่อ Supabase จริง

## รันบนเครื่อง

```bash
npm install
cp .env.example .env   # แล้วใส่ค่าของ Supabase
npm run dev
```

## Environment variables

| ตัวแปร | คำอธิบาย |
|--------|---------|
| `VITE_SUPABASE_URL` | Project URL จาก Supabase |
| `VITE_SUPABASE_ANON_KEY` | Publishable / anon key |

## Deploy บน Vercel

1. Import repo นี้ที่ vercel.com
2. ตั้ง environment variables ทั้ง 2 ตัว
3. Deploy

## Database schema

ตาราง `todos`: id (uuid), task (text), is_done (bool), created_at (timestamptz) — เปิด RLS
