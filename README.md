# Hephzi Storefront

New Next.js e-commerce project inspired by the reference shoe-store project.

## Requirements covered

- Responsive shop landing page and cart.
- Checkout page that posts orders to `app/api/orders`.
- Supabase schema and server-only service-role persistence.
- Mailgun confirmation email integration.
- Google OAuth environment configuration ready for NextAuth.

## Run

```bash
npm install
copy .env.example .env.local
npm run dev
```

Run `supabase/schema.sql` in the Supabase SQL editor, then configure Google OAuth in Google Cloud Console and add the credentials to `.env.local`.
