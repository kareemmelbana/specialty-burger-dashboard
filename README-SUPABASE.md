# Specialty Burger Dashboard + Supabase

## 1) Dashboard

This folder is the complete dashboard project.

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

Do not put a Supabase Secret / service_role key in the frontend.

Install and run:

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## 2) Supabase

Run `supabase-setup-final.sql` in Supabase SQL Editor.

After creating the owner in Authentication, run `add-owner.sql` (or replace its UUID with the owner user's UUID).

## 3) Images

The dashboard includes a local `public/menu/` copy of the original website menu images. Product image paths are normalized so both `/menu/...` paths and old full website URLs resolve correctly.

## 4) Main test

1. Sign in to the dashboard.
2. Menu -> Products.
3. Change a product price and save.
4. Verify the `products` row in Supabase changed.
5. Refresh the website and verify the same price.
6. Add a category and verify it appears in `categories`.
