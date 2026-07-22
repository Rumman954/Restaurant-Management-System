# Deploy Login on Vercel (no Render)

Frontend + API both run on **Vercel**.  
You only need a free **MongoDB Atlas** database.

---

## Step 1 — Free MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas and create a free account.
2. Create a **Free (M0)** cluster.
3. **Database Access** → create a user (username + password).
4. **Network Access** → Add IP → **Allow Access from Anywhere** (`0.0.0.0/0`).
5. **Connect** → **Drivers** → copy the URI, for example:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/restaurant-mern?retryWrites=true&w=majority
```

Replace `USER` and `PASSWORD` with your DB user.  
If the password has special characters, URL-encode them.

---

## Step 2 — Vercel Environment Variables

Open your Vercel project → **Settings** → **Environment Variables**.

### Add these (Production + Preview):

| Name | Value |
|------|--------|
| `MONGO_URI` | your Atlas connection string from Step 1 |
| `JWT_SECRET` | any long random string, e.g. `my-restaurant-secret-key-2026` |
| `ADMIN_EMAIL` | `admin@gmail.com` |
| `ADMIN_PASSWORD` | `admin123` |

### Fix / remove this:

| Name | Action |
|------|--------|
| `VITE_API_BASE_URL` | **Delete it**, or set to exactly `/api` |

Do **not** keep `https://YOUR-BACKEND-URL/api` — that breaks login.

Optional:

| Name | Value |
|------|--------|
| `CLIENT_ORIGIN` | `https://restaurant-management-system-omega-liard.vercel.app` |
| `STRIPE_SECRET_KEY` | from Stripe Dashboard → Developers → API keys (`sk_test_...`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | from Stripe Dashboard → Developers → API keys (`pk_test_...`) |

**Stripe note:** both keys are required for Online Payment. After adding `VITE_*` keys, you must **Redeploy** (Vite embeds them at build time).

---

## Step 3 — Redeploy

1. Vercel → **Deployments** → latest → **Redeploy**  
   (check “Use existing Build Cache” **off** if available)
2. Or push a new commit to `main`.

---

## Step 4 — Test

1. Open: `https://YOUR-SITE.vercel.app/api/health`  
   Should show `{ "ok": true, ... }`
2. Login with:
   - Admin: `admin@gmail.com` / `admin123`
   - Employee: `employee@gmail.com` / `employee123`
   - Customer: `customer@gmail.com` / `customer123`

---

## Local development (unchanged)

`server/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/restaurant-mern
JWT_SECRET=dev-secret
```

`client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Then: `npm run dev`
