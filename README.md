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

Vercel hosts only the **frontend**. Login needs a live API + MongoDB.

**Full steps:** see [DEPLOY.md](./DEPLOY.md)

Short version:

1. Create free MongoDB Atlas DB and copy `MONGO_URI`.
2. Deploy API with Render Blueprint (`render.yaml` in this repo).
3. In Vercel env, set real URL (not a placeholder):
   - `VITE_API_BASE_URL=https://YOUR-RENDER-URL/api`
4. Redeploy Vercel.
