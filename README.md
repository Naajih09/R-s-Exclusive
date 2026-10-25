# R-s-Exclusive

An online catalogue for a Nigerian store. Customers browse products, add them to a cart, and send the order to the store on WhatsApp.

Built with React, Vite, Tailwind CSS and Supabase.

## Phase 1: public catalogue

- Product grid with category filters and search (prefix matching, so "ank" finds "Ankara").
- Product pages with photos, specifications, option choices (such as size) and stock status.
- A cart that is saved in the browser and capped to available stock.
- Checkout through a prefilled WhatsApp message to the store number.

Store owners manage products directly in Supabase for now. An admin area is planned for a later phase.

## Local setup

Requirements: Node 22, pnpm, and Docker Desktop (for local Supabase).

```sh
pnpm install
npx supabase start          # starts local Supabase and prints the API URL and anon key
npx supabase db reset       # applies migrations and loads supabase/seed.sql
```

Create `.env.local` with the values printed by `supabase start`:

```sh
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key>
```

Then run the app:

```sh
pnpm dev
```

## Checks

```sh
pnpm test             # unit and UI tests
pnpm lint
pnpm build
npx supabase test db  # row level security tests in supabase/tests
```

## Security notes

- The browser only uses the public anon key. Row level security limits it to published products, their images, categories and store settings.
- Write access requires `app_metadata.role = "admin"` on the user. Only the service role can set this, so signing up does not grant access.
- Never put database connection strings or the service role key in a `VITE_` variable. Anything prefixed with `VITE_` is shipped to the browser.
- `supabase/seed.sql` contains sample data and refuses to run outside the local database.
