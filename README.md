# TrustFlow

Collect, manage, and showcase customer testimonials to boost conversions. Embed beautiful widgets on any website. Grows virally through "Powered by TrustFlow" branding on free-tier widgets.

---

## What It Does

- **Collect testimonials** via shareable public pages (`/t/your-slug`) or email campaigns
- **Manage & moderate** — approve, reject, tag, and organize testimonials per space (project)
- **Embed anywhere** — drop a `<script>` tag on any website to display a testimonial widget
- **Sentiment analysis** — every submission is auto-scored for positive/negative sentiment
- **Analytics** — track page views, submissions, conversion rates, sentiment trends
- **Monetization built-in** — free tier with limits → Pro/Business/Enterprise via Stripe subscriptions
- **Viral loop** — free-tier widgets show "Powered by TrustFlow" linking back to signup

---

## Tech Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 15 (App Router)             |
| Language      | TypeScript                          |
| Database      | PostgreSQL + Prisma ORM             |
| Auth          | NextAuth.js (Credentials + Google)  |
| Payments      | Stripe (Subscriptions + Webhooks)   |
| Email         | Resend                              |
| Styling       | Tailwind CSS                        |
| UI Components | Radix UI + custom components        |
| Validation    | Zod                                 |
| Deployment    | Vercel (recommended)                |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── (auth)/                     # Login & Register pages
│   ├── (dashboard)/                # Authenticated dashboard
│   │   ├── dashboard/              # Overview
│   │   ├── spaces/                 # Manage spaces (projects)
│   │   │   ├── [spaceId]/          # Single space management
│   │   │   └── new/                # Create new space
│   │   ├── billing/                # Subscription management
│   │   └── settings/               # User settings
│   ├── api/
│   │   ├── auth/                   # NextAuth + registration
│   │   ├── spaces/                 # CRUD for spaces
│   │   ├── testimonials/           # Approve/reject/delete testimonials
│   │   ├── collect/[slug]/         # Public testimonial submission endpoint
│   │   ├── widget/[spaceId]/       # Widget data API (CORS-enabled)
│   │   ├── embed/script.js/        # JavaScript embed snippet
│   │   ├── billing/                # Stripe checkout & portal
│   │   ├── webhooks/stripe/        # Stripe webhook handler
│   │   ├── campaigns/              # Email campaign management
│   │   ├── analytics/[spaceId]/    # Analytics data
│   │   └── user/profile/           # User profile updates
│   ├── t/[slug]/                   # Public testimonial collection page
│   └── embed/[spaceId]/            # Embeddable widget page (iframe)
├── components/                     # UI components
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── prisma.ts                   # Prisma client
│   ├── stripe.ts                   # Stripe client + plan config
│   ├── sentiment.ts                # Built-in sentiment analysis
│   ├── rate-limit.ts               # In-memory rate limiter
│   ├── validations.ts              # Zod schemas
│   └── utils.ts                    # Helpers
└── types/                          # TypeScript declarations
```

---

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- Stripe account
- (Optional) Google OAuth credentials
- (Optional) Resend account for email campaigns

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd new_project
npm install
```

### 2. Create `.env` file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

```env
# ── Database ──────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/trustflow?schema=public"
```

**Where to get it:**
- **Local:** Install PostgreSQL, create a database called `trustflow`, and use the connection string above with your credentials
- **Hosted (recommended):** Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) — all offer free PostgreSQL. Copy the connection string from their dashboard.

---

```env
# ── NextAuth ──────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

**Where to get it:**
- `NEXTAUTH_URL` — your app URL. Use `http://localhost:3000` for local dev, your production URL when deployed.
- `NEXTAUTH_SECRET` — generate one by running:
  ```bash
  openssl rand -base64 32
  ```

---

```env
# ── Google OAuth (optional) ───────────────────────
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**Where to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client IDs**
4. Set application type to **Web application**
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production URL)
6. Copy the Client ID and Client Secret

> If you skip this, the app still works with email/password login only.

---

```env
# ── Stripe ────────────────────────────────────────
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRO_PRICE_ID=""
STRIPE_BUSINESS_PRICE_ID=""
STRIPE_ENTERPRISE_PRICE_ID=""
```

**Where to get it:**
1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Go to **Developers → API keys** — copy the **Secret key** (`sk_test_...`)
3. Create 3 subscription products in **Product Catalog → Add Product**:
   - **Pro** — $29/month, recurring
   - **Business** — $79/month, recurring
   - **Enterprise** — $199/month, recurring
4. After creating each product, copy its **Price ID** (`price_...`) from the product page
5. Set up the webhook:
   - Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the **Signing secret** (`whsec_...`)
   - For **local development**, use Stripe CLI:
     ```bash
     brew install stripe/stripe-cli/stripe
     stripe login
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
     This prints the webhook secret to use locally.

---

```env
# ── Resend (optional — for email campaigns) ──────
RESEND_API_KEY=""
EMAIL_FROM="TrustFlow <noreply@yourdomain.com>"
```

**Where to get it:**
1. Sign up at [Resend](https://resend.com)
2. Go to **API Keys → Create API Key** — copy it (`re_...`)
3. Add and verify your sending domain under **Domains**
4. Set `EMAIL_FROM` to an address on your verified domain

> If you skip this, the app works fine — email campaigns just won't send.

---

```env
# ── OpenAI (optional — for AI features) ──────────
OPENAI_API_KEY=""
```

**Where to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key — copy it (`sk-...`)

> Currently not used in core flow. The built-in sentiment analysis runs locally without any API. This key is reserved for future AI-enhanced features (summarization, rewriting).

---

```env
# ── App ───────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Set to `http://localhost:3000` locally, your production URL when deployed.

---

### 4. Set Up Database

```bash
npx prisma db push      # Create tables
npx prisma generate      # Generate Prisma client
```

To explore your database visually:

```bash
npx prisma studio
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Pricing / Plan Limits

| Feature                | Free | Pro ($29/mo) | Business ($79/mo) | Enterprise ($199/mo) |
| ---------------------- | ---- | ------------ | ------------------ | -------------------- |
| Spaces                 | 1    | 3            | 10                 | Unlimited            |
| Testimonials per space | 10   | Unlimited    | Unlimited          | Unlimited            |
| Remove branding        | No   | Yes          | Yes                | Yes                  |
| Analytics              | No   | Basic        | Full               | Full                 |
| Email campaigns        | No   | Yes          | Yes                | Yes                  |
| AI sentiment           | No   | No           | Yes                | Yes                  |
| API access             | No   | No           | No                 | Yes                  |

---

## How To Embed

After creating a space and collecting testimonials, go to the space detail page. Copy the embed code:

```html
<script
  src="https://your-domain.com/api/embed/script.js?space=SPACE_ID&theme=light"
  defer
></script>
```

Paste it into any website. The widget renders automatically and updates as you approve new testimonials.

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel's project settings
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL
5. Update Stripe webhook endpoint to your production URL
6. Deploy

---

## Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start dev server                   |
| `npm run build`    | Production build                   |
| `npm run start`    | Start production server            |
| `npm run lint`     | Run ESLint                         |
| `npm run db:push`  | Push schema to database            |
| `npm run db:studio`| Open Prisma Studio (DB GUI)        |
| `npm run db:migrate`| Run Prisma migrations             |
| `npm run db:seed`  | Seed database with sample data     |
