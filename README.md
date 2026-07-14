# Restaurant MERN

This is a full MERN project:

- MongoDB
- Express.js
- React (Vite)
- Node.js

No PHP is used in this project.

## Run

1. Server env:
   - Copy `server/.env.example` to `server/.env`
2. Client env:
   - Copy `client/.env.example` to `client/.env`
3. Install already done. If needed:
   - `npm install`
   - `npm install --prefix server`
   - `npm install --prefix client`
4. Seed DB:
   - `npm run seed`
5. Start both:
   - `npm run dev`
6. Admin login:
   - Set `ADMIN_EMAIL` in `server/.env`
   - Login with that email, then open `/admin`

Client: `http://localhost:5173`  
Server: `http://localhost:5000`

## Vercel note

Vercel hosts only the **frontend**. Categories/Foods browse from built-in menu data (no API required).

For Login / Register / Orders / Admin on the live site:

1. Deploy `server` + MongoDB (Atlas) to a host like Render/Railway.
2. In Vercel Project Settings → Environment Variables, set:
   - `VITE_API_BASE_URL=https://YOUR-BACKEND-URL/api`
3. Redeploy the frontend.
