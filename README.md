<<<<<<< HEAD
# Garage website with online booking and admin panel

A complete website for a multi-vehicle garage (cars, bikes, scooters, auto-rickshaws and commercial vehicles), with online service booking, enquiries and an admin panel for the owner.

The demo runs as **"TorqueLine Garage"** with placeholder details: phone `+91 12345 67890`, an address in Pune, sample prices and clearly marked sample reviews. Everything can be changed from the admin panel without touching code.

**Contents:**
[What's included](#whats-included) ·
[Run it on your computer](#1-run-it-on-your-computer) ·
[Make it yours](#2-make-it-yours-no-code) ·
[Deploy](#3-deploy-it-online) ·
[Environment variables](#environment-variables) ·
[Admin accounts & security](#admin-accounts-roles-and-security) ·
[For developers](#for-developers) ·
[Troubleshooting](#troubleshooting)

---

## What's included

**Website**

| Page | What it does |
| --- | --- |
| Home `/` | Hero ("Complete Vehicle Care Under One Roof") with **Book a Service**, **Call Now** and **Explore Services**; service categories; why choose us; how a service works; workshop photos; packages; reviews; contact details with map |
| Services `/services` | Separate cards for car, bike/scooter and other-vehicle services, with indicative prices |
| Packages `/packages` | Basic, Standard, Complete Vehicle Checkup and Premium Maintenance for cars and bikes, labelled as demo estimates |
| Book a service `/book` | Booking form with validation, date and time slots from your opening hours, and a job-card confirmation (add to calendar, WhatsApp) |
| About `/about` | Story, commitments, owner message, experience, address and working hours |
| Gallery `/gallery` | Filterable photo gallery with a full-screen viewer |
| Reviews `/reviews` | Reviews, with sample ones clearly marked "Sample" |
| Contact `/contact` | Address, phone, WhatsApp, email, hours, Google Map, **Get directions** and an enquiry form |
| Privacy `/privacy` | Template privacy notice |

A WhatsApp button and a call button float on every page. The site works on phones, tablets and desktops.

**Admin panel** (`/admin`)

- **Dashboard:** total, pending, confirmed, completed and cancelled bookings, a 14-day bookings chart, today's jobs and recent enquiries.
- **Bookings:** search (name, mobile, registration number, reference), filter by date, vehicle type and status, change status, add workshop notes, reschedule, call or WhatsApp the customer, export to CSV.
- **Enquiries:** read, reply by phone, WhatsApp or email, and mark as new, in progress or resolved.
- **Services & prices:** add, edit, hide, reorder and delete services; change prices inline; edit category text and images.
- **Packages, Gallery, Reviews:** add, edit, reorder and delete. Uploaded photos are compressed in the browser and stored in the database.
- **Content & settings:** garage name, phone, WhatsApp, email, address, map, opening hours, booking slots, homepage and About text and photos, price label and disclaimer, FAQs, logo, accent colour (racing red or signal orange), demo notice, and search engine title and description.
- **Users & roles:** admin and staff accounts.

**Technology:** Next.js 16 (App Router, server route handlers), React 19, TypeScript, Tailwind CSS 4, PostgreSQL (Neon in production) through Drizzle ORM, and Zod validation. It deploys to Netlify or Vercel.

---

## 1. Run it on your computer

**You need:** [Node.js](https://nodejs.org) **20.9 or newer** (22 LTS recommended) and npm, which comes with Node.

```bash
cd garage-website
npm install
npm run dev
```

Open **http://localhost:3000** for the website and **http://localhost:3000/admin** for the admin panel.

With no database configured, the site runs in **demo mode**. A full PostgreSQL engine runs inside Node (PGlite), its data is saved in the `.data/` folder, and sample content is loaded on first start. The sign-in page shows two demo logins:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Demo@1234` |
| Staff | `staff@example.com` | `Staff@1234` |

These demo accounts exist **only in demo mode**. They are never created on a real database.

- **Start again with fresh demo data:** stop the server, run `npm run db:reset-demo`, then run `npm run dev`.
- **Faster version for presenting:** run `npm run build` once, then `npm start`. Pages load faster than in `dev`.

---

## 2. Make it yours (no code)

Sign in at `/admin` and work through this list before showing the site to customers.

| To change… | Go to |
| --- | --- |
| Garage name, tagline, owner, years of experience | **Content & settings → Business & contact** |
| Phone, WhatsApp number, email, address, Google Map | **Content & settings → Business & contact** |
| Opening hours, booking slot length, how far ahead customers can book | **Content & settings → Hours & booking** |
| Hero heading and text, hero photo, "why choose us", workshop photos | **Content & settings → Homepage** |
| About page text, photo and owner message | **Content & settings → About page** |
| Price label (for example "Demo estimate" or "Starting from"), price disclaimer, FAQs | **Content & settings → Pricing & FAQs** |
| Logo, accent colour, demo notice, Google search title and description | **Content & settings → Branding & SEO** |
| Services, descriptions and prices | **Services & prices** (click a price to edit it in place) |
| Service packages and their prices | **Packages** |
| Gallery photos | **Gallery** |
| Reviews | **Reviews** (delete the samples and add genuine reviews) |
| Staff logins | **Users & roles** |

In page text, `{name}` is replaced with the garage name and `{years}` with the years of experience.

**Going-live checklist**

1. Enter the real business details, hours and map location. The demo phone number is deliberately invalid.
2. Hide or delete any service the garage doesn't offer, and set real prices. Categories with no active services are hidden from the website automatically.
3. Replace the stock photos (hero, workshop, about, categories, gallery) with photos of the real workshop.
4. In **Reviews**, delete the sample reviews and add genuine ones, with the customers' permission.
5. On the **Dashboard**, click **Remove sample data** to delete the sample bookings and enquiries.
6. In **Branding & SEO**, turn off the demo notice and add a logo if you have one.
7. In **Pricing & FAQs**, change the price label and disclaimer if needed. Keep prices described as estimates subject to inspection.
8. Have the template privacy notice (`src/app/(site)/privacy/page.tsx`) reviewed for the business.

---

## 3. Deploy it online

You need three things: a **Neon** database (free tier), the code in a **GitHub** repository, and a **Netlify** or **Vercel** account (free tiers work).

### Step 1: Create the database on Neon

1. Sign up at [neon.com](https://neon.com) and click **New project**.
2. Pick a region near where your site's server code will run (see the note below), then click **Create**.
3. On the project dashboard, click **Connect** and copy the connection string. The pooled one is fine. It looks like:
   ```
   postgresql://neondb_owner:••••••@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   Keep it private. It contains the database password.

You don't need to create any tables. The app creates them (migrations), adds the starting content and creates the first admin account during the deploy build.

> **Choosing the region.** Every page reads from the database, so keep the database and the site's server functions in the same region.
> - **Netlify (free plan):** functions run in US East (Ohio), so choose Neon **AWS US East 2 (Ohio)**. On a Netlify Pro plan you can move functions to Singapore (**Cloud compute → Functions → Region**) and choose Neon **AWS Asia Pacific 1 (Singapore)**, the closest Neon region to India.
> - **Vercel:** choose Neon **Singapore** and set **Settings → Functions → Function Regions** to Singapore (`sin1`). This works on the free Hobby plan.

### Step 2: Put the code on GitHub

Create an empty repository on GitHub, then run this in the project folder:

```bash
git init
git add .
git commit -m "Garage website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

`.gitignore` already keeps `node_modules/`, `.next/`, `.data/` and `.env*` files (your secrets) out of the repository.

### Step 3a: Deploy on Netlify

1. In Netlify, choose **Add new project → Import an existing project** and pick your GitHub repository.
2. Leave the build settings as Netlify fills them in. `netlify.toml` sets the build command `npm run build:deploy`, the publish directory `.next` and Node 22.
3. Before deploying, add these **environment variables** (or later under **Project configuration → Environment variables**):

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | your Neon connection string |
   | `AUTH_SECRET` | a long random string (see [below](#environment-variables)) |
   | `ADMIN_EMAIL` | the owner's email, for example `owner@yourgarage.in` |
   | `ADMIN_PASSWORD` | a strong password: at least 8 characters, with a letter and a number |
   | `SEED_SAMPLE_DATA` | `false` for a clean live site; leave it out to include sample bookings for a demo |

4. Click **Deploy**. The build log shows `Database ready: { services: 21, … admins: 1 }`.
5. Open `https://YOUR-SITE.netlify.app/admin` and sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Netlify only applies environment variable changes after a new deploy (**Deploys → Trigger deploy**).

<details>
<summary>Netlify from the command line instead</summary>

```bash
npm install -g netlify-cli
netlify login
netlify init                      # create a new project and link this folder
netlify env:set DATABASE_URL "postgresql://…"
netlify env:set AUTH_SECRET "$(openssl rand -base64 32)"
netlify env:set ADMIN_EMAIL "owner@yourgarage.in"
netlify env:set ADMIN_PASSWORD "choose-a-strong-password-1"
netlify deploy --prod             # builds with netlify.toml, then publishes
```
</details>

### Step 3b: Deploy on Vercel

1. In Vercel, choose **Add New… → Project** and import your GitHub repository. The framework is detected as Next.js, and `vercel.json` sets the build command to `npm run build:deploy`.
2. Under **Environment Variables**, add the same keys as in the Netlify table: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and, optionally, `SEED_SAMPLE_DATA`.
   - Alternatively, add Neon from the Vercel Marketplace ([vercel.com/marketplace/neon](https://vercel.com/marketplace/neon)) and connect it to the project. It sets `DATABASE_URL` for you.
3. Click **Deploy**, then open `https://YOUR-PROJECT.vercel.app/admin` and sign in.
4. Set **Settings → Functions → Function Regions** to the region of your database, then redeploy.

### Step 4: After the first deploy

- **Delete `ADMIN_PASSWORD`** from the environment variables. It is only used to create the first admin, and only while no admin exists. Change the password any time in **Admin → My account**.
- **Custom domain:** add it in Netlify (**Domain management**) or Vercel (**Settings → Domains**). Then set `NEXT_PUBLIC_SITE_URL=https://www.yourgarage.in` and redeploy so search results and link previews use it.
- **Before a live presentation**, open the site a minute early. Neon's free tier pauses the database when idle, and the first request wakes it in about a second.
- **Hosting without a database:** if `DATABASE_URL` is missing on Netlify or Vercel, the site still works in demo mode, but its data lives in memory. Bookings and edits can disappear between requests and restarts, and the sign-in page warns about this. Always connect a database for anything you show to customers.

### Running on your own server (VPS) instead

```bash
npm ci
cp .env.example .env.local      # then fill in DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run build:deploy            # migrate + seed + build
npm start                       # serves on port 3000 (use PORT=8080 npm start to change)
```

Put it behind HTTPS (for example Nginx or Caddy). Session cookies are marked `Secure` automatically on HTTPS.

---

## Environment variables

Copy `.env.example` to `.env.local` for local use, or set these in Netlify or Vercel. None of them reach the browser.

| Variable | Required | What it's for |
| --- | --- | --- |
| `DATABASE_URL` | For a live site | PostgreSQL connection string (Neon). If it's missing, the site runs in demo mode. |
| `AUTH_SECRET` | When `DATABASE_URL` is set | Signs admin sessions. Use 32+ random characters: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. Changing it signs everyone out. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First deploy | Create the first admin account if the database has none. The password is stored hashed. |
| `ADMIN_NAME` | No | Display name for that first admin. Default: "Garage Owner". |
| `NEXT_PUBLIC_SITE_URL` | No | Your public web address, used for the sitemap, search results and link previews. Netlify and Vercel addresses are detected automatically. |
| `SEED_SAMPLE_DATA` | No | `false` skips the sample bookings and enquiries on first setup. Default: `true`. |
| `DB_AUTO_MIGRATE` | No | `false` stops the app applying migrations when it starts. The deploy build still runs them. Default: `true`. |
| `DATABASE_POOL_MAX` | No | Maximum database connections per server instance. Default: `5`. |
| `PGLITE_DATA_DIR` | No | Demo mode only: a folder for the demo database, or `memory`. |

---

## Admin accounts, roles and security

| Role | Can do |
| --- | --- |
| **Admin** | Everything: bookings (including delete), enquiries, services, prices, packages, gallery, reviews, website content and user accounts |
| **Staff** | Dashboard, view and update bookings (status, notes, reschedule), export bookings, and view and update enquiries. Staff can't delete records or change prices, content or users. |

**Create an account or reset a forgotten password from the command line.** This works against `DATABASE_URL`, or the demo database if it isn't set:

```bash
npm run admin:create
npm run admin:create -- --email owner@yourgarage.in --name "Owner" --role admin
```

The command asks for the password, hidden as you type. If the email already exists, it resets that account's password and signs it out everywhere. To run it against Neon from your computer, put `DATABASE_URL` in `.env.local` first.

**How the admin area is protected**

- Every admin page and admin API request is checked **on the server**. The session signature is verified, then the user is looked up in the database to confirm the account is still active and the session is still valid. `src/proxy.ts` only redirects signed-out visitors early.
- Passwords are hashed with **scrypt** and a random salt, and plain-text passwords are never stored. Failed sign-ins take the same time whether or not the email exists.
- Sessions use a signed token (HS256, `AUTH_SECRET`) in an **httpOnly, SameSite=Lax** cookie, marked `Secure` on HTTPS. They last 12 hours, or 30 days with "Keep me signed in". Changing a password, role or active status signs that user out on all devices.
- **Role-based access** is enforced on the server for every page and API route, not just hidden in the menu.
- **Rate limits** are stored in the database, so they work on serverless hosts:
  - Sign-in: 8 attempts per email and 20 per IP address every 15 minutes.
  - Bookings: 8 per IP address every 10 minutes.
  - Enquiries: 6 per IP address every 10 minutes.
  - IP addresses are stored only as salted hashes.
- Requests that change data must come from the site itself (Origin check), and the forms include a hidden anti-spam field.
- No credentials are written in the code. `DATABASE_URL` and `AUTH_SECRET` are read only on the server, never with a `NEXT_PUBLIC_` prefix, and production admins come from environment variables or `npm run admin:create`.
- Security headers are set on every response, including `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`. The admin area is excluded from search engines and browser caches.

---

## For developers

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server at http://localhost:3000 |
| `npm run build` / `npm start` | Production build and server |
| `npm run build:deploy` | `db:setup`, then `build`. Used by `netlify.toml` and `vercel.json`. |
| `npm run db:setup` | Applies migrations, adds starting content to empty tables and creates the first admin. Safe to run repeatedly. |
| `npm run admin:create` | Creates an admin or staff account, or resets a password |
| `npm run db:reset-demo` | Deletes the local demo database in `.data/` |
| `npm run db:generate` | After editing `src/lib/db/schema.ts`: writes a new SQL migration to `drizzle/` and embeds it in the app |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript checks (`typecheck` first generates the route types with `next typegen`) |

### Project structure

```
src/
  app/(site)/          public pages (home, services, packages, book, about, gallery, reviews, contact, privacy)
  app/admin/           admin sign-in and protected admin pages
  app/api/             JSON API: bookings, enquiries, auth, and /api/admin/* management routes
  app/media/[id]/      serves images uploaded from the admin panel
  components/site/     website sections, booking form, enquiry form, header, footer
  components/admin/    admin screens (bookings, services, content editor, …)
  components/ui/       shared buttons, form fields and images
  content/             starting content: business details and page text (defaults.ts),
                       services, prices, packages, gallery and sample reviews (seed-data.ts), photo links (images.ts)
  lib/db/              database schema, connection, migrations and seeding
  lib/data/            data access used by pages and API routes
  lib/auth/            password hashing, sessions, roles and permissions
  lib/validation.ts    form and API validation rules (Zod)
  proxy.ts             early redirect of signed-out visitors away from /admin
drizzle/               generated SQL migrations
scripts/               command-line tools (db:setup, admin:create, db:reset-demo)
public/                fonts, logo image and link-preview image
```

### Changing the starting content in code

The files in `src/content/` are copied into the database **the first time** it is set up. After that, the admin panel is the place to edit, and changes to these files won't overwrite saved content. To rebrand before the first deploy, edit `defaults.ts`, `seed-data.ts` and `images.ts`. For an existing local demo, run `npm run db:reset-demo` afterwards.

Other brand files:
- `src/app/icon.svg` and `src/app/apple-icon.png` are the browser tab and home-screen icons.
- `public/og-image.png` is the image shown when the site is shared on WhatsApp or social media.
- `src/components/logo.tsx` is the gear-and-wrench logo used when no logo is uploaded.

### How data is stored

- Settings (business details, page text, hours, branding) are stored as JSON per section and validated with Zod. Services, packages, gallery items, reviews, bookings, enquiries, users and uploaded images each have their own table (`src/lib/db/schema.ts`).
- Booking times use India Standard Time. Available slots come from the opening hours, and today's slots start at least 30 minutes ahead.
- Uploaded images are stored in PostgreSQL and served from `/media/<id>` with long-term caching. Neon's free 0.5 GB holds well over a thousand compressed photos.
- Migrations run inside a transaction with a PostgreSQL advisory lock, so parallel serverless starts can't apply them twice.

### Credits and licences

- **Photos:** stock images from [Unsplash](https://unsplash.com), free to use under the [Unsplash License](https://unsplash.com/license) and loaded from `images.unsplash.com`. Replace them with real workshop photos before launch. If a photo can't load, the site shows a neutral placeholder instead.
- **Fonts:** [Saira](https://fonts.google.com/specimen/Saira) and [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans), self-hosted in `public/fonts/` under the SIL Open Font License (licence files included).
- **Icons:** [Lucide](https://lucide.dev) (ISC licence), plus custom auto-rickshaw and chat icons.
- **Logo:** an original gear-and-wrench mark made for this demo.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Sign-in page says **"AUTH_SECRET is not set"** | Add `AUTH_SECRET` to your environment variables and redeploy. It's required whenever `DATABASE_URL` is set. |
| Sign-in page says **"No admin account yet"** | Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` and redeploy, or run `npm run admin:create` with `DATABASE_URL` in `.env.local`. |
| Build fails with **"Database setup failed"** | Check that `DATABASE_URL` is the full Neon string, including `?sslmode=require`, and that it is available to builds. On Netlify the variable's scopes must include Builds. |
| **"Too many attempts"** when signing in | The sign-in rate limit was reached. Wait 15 minutes, or use `npm run admin:create` to reset the password. |
| Changes to environment variables don't apply | Redeploy. Both Netlify and Vercel apply new values only to new deploys. |
| Photos don't show (grey placeholders) | The browser or network is blocking `images.unsplash.com`. Upload your own photos in the admin panel. |
| Local demo behaves oddly after many test edits | Stop the server, run `npm run db:reset-demo`, then start it again. |
| Port 3000 is already in use | `npm run dev -- -p 3001` |
=======
# shiv-shkti-auto
>>>>>>> 222c1ec84863d187ede9b91c72dc118080bf27db
