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

## Deploy (so Login works on Vercel)

Frontend and API both deploy on **Vercel**. You only need free MongoDB Atlas.

**Full steps:** see [DEPLOY.md](./DEPLOY.md)

Short version:

1. Create free MongoDB Atlas and copy `MONGO_URI`.
2. In Vercel → Environment Variables, set:
   - `MONGO_URI` = Atlas connection string
   - `JWT_SECRET` = any long secret
   - Delete `VITE_API_BASE_URL` (or set it to `/api`)
3. Redeploy Vercel.
4. Test: `https://YOUR-SITE.vercel.app/api/health`
