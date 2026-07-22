# Deploy so Login works on Vercel

Vercel only hosts the website (frontend).  
Login needs a live **API server** + **MongoDB**.

Follow these 3 steps once.

---

## Step 1 — Free MongoDB (Atlas)

1. Open https://www.mongodb.com/cloud/atlas and create a free account.
2. Create a **Free (M0)** cluster.
3. Click **Connect** → **Drivers** → copy the connection string.  
   Example shape:
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/restaurant-mern?retryWrites=true&w=majority`
4. Network Access → **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect.
5. Replace `USERNAME` / `PASSWORD` with your DB user password.

Keep this string ready — you need it in Step 2.

---

## Step 2 — Deploy API on Render (free)

1. Open https://dashboard.render.com and sign up (GitHub login is easiest).
2. Click **New** → **Blueprint**.
3. Connect the GitHub repo: `Rumman954/Restaurant-Management-System`.
4. Render will read `render.yaml` automatically.
5. When asked for **MONGO_URI**, paste your Atlas string from Step 1.
6. Click **Apply**.
7. Wait until the service is **Live**.
8. Copy the service URL, for example:
   `https://restaurant-mern-api.onrender.com`

Test in browser:
`https://YOUR-RENDER-URL/api/health`  
You should see `{ "ok": true, ... }`.

---

## Step 3 — Point Vercel at the API

1. Open your Vercel project → **Settings** → **Environment Variables**.
2. Set / update:

| Name | Value |
|------|--------|
| `VITE_API_BASE_URL` | `https://YOUR-RENDER-URL/api` |

Example:
`VITE_API_BASE_URL=https://restaurant-mern-api.onrender.com/api`

**Important:** Do **not** keep `https://YOUR-BACKEND-URL/api`. That was only a placeholder.

3. Redeploy:
   - Deployments → latest → **Redeploy**  
   - Or push any small commit to `main`.

4. Open the live site and login:
   - Admin: `admin@gmail.com` / `admin123`
   - Employee: `employee@gmail.com` / `employee123`
   - Customer: `customer@gmail.com` / `customer123`

---

## If login still fails

1. Open browser DevTools → **Network** → try Login.
2. Check the request URL. It must be your Render `/api/auth/login`, not `localhost` and not `YOUR-BACKEND-URL`.
3. Open `https://YOUR-RENDER-URL/api/health` — must work.
4. Free Render apps sleep after idle; first request can take ~30–60 seconds. Wait and try again.

---

## Local development (unchanged)

```bash
# server/.env
MONGO_URI=mongodb://127.0.0.1:27017/restaurant-mern
JWT_SECRET=dev-secret

# client/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

Then run `npm run dev` from the project root.
