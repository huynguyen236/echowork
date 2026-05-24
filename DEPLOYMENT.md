# EchoWork — Deployment Guide

> Production-ready deployment guide for EXE201 demo and beyond.

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | ✅ | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `PORT` | ✅ | Server port | `3000` |
| `NODE_ENV` | ✅ | Environment | `production` |
| `JWT_SECRET` | ✅ | **Min 32 chars random string** | auto-generated |
| `JWT_EXPIRES_IN` | ✅ | Token lifetime | `7d` |
| `CLIENT_URL` | ✅ | Frontend URL for CORS | `https://echowork.vercel.app` |
| `AVATAR_MAX_SIZE` | optional | Avatar upload max bytes | `2097152` (2 MB) |
| `CV_MAX_SIZE` | optional | CV upload max bytes | `5242880` (5 MB) |
| `RATE_LIMIT_WINDOW_MS` | optional | Rate limit window in ms | `900000` (15 min) |
| `RATE_LIMIT_MAX` | optional | Max requests per window | `10` |

> [!CAUTION]
> **NEVER commit `.env` to git.** It contains your database credentials and JWT secret.
> The `.gitignore` already excludes it — double-check before pushing.

---

## Option 1 — Render.com (Recommended for EXE201 Demo)

### Backend (Node.js API)

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service** → Connect your repo.
3. Set **Root Directory**: `BE`
4. **Build Command**: `npm ci && npx prisma generate`
5. **Start Command**: `node server.js`
6. Add environment variables in the **Environment** tab (see table above).
7. Under **Advanced**, set **Health Check Path**: `/api/health`

Alternatively, use the included `render.yaml`:
```
BE/render.yaml
```

### Database

Use **Railway** or **PlanetScale** for a free MySQL database:
- Railway: New Project → MySQL → copy the `DATABASE_URL` → paste into Render env vars.
- PlanetScale: Create database → Get connection string → paste into Render.

### Frontend (Static HTML)

Deploy `FE/` to **Vercel**, **Netlify**, or **Cloudflare Pages**:

```bash
# Vercel
npx vercel --cwd FE

# Netlify (drag & drop FE/ folder at app.netlify.com)
```

> [!IMPORTANT]
> After deploying the frontend, set `CLIENT_URL` in Render to your Vercel URL.
> Also set `window.ECHO_API_BASE` in your HTML before loading scripts:
> ```html
> <script>window.ECHO_API_BASE = 'https://echowork-api.onrender.com/api';</script>
> ```

---

## Option 2 — Railway (Full-Stack in One Place)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub.
2. Select the `BE/` directory.
3. Add a **MySQL** plugin from the Railway marketplace.
4. Railway auto-injects `DATABASE_URL`. Add the other env vars manually.
5. Set the **Start Command**: `node server.js`.
6. Deploy. Your API URL will be `https://echowork-api.up.railway.app`.

---

## Option 3 — VPS (Ubuntu / Debian)

```bash
# 1. Install Node 20 + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pm2

# 2. Clone and install
git clone https://github.com/your-org/echowork.git
cd echowork/BE
cp .env.example .env
nano .env  # fill in your values

# 3. Install dependencies and run migrations
npm ci
npx prisma generate
npx prisma migrate deploy   # applies all migrations to production DB

# 4. Start with PM2
pm2 start server.js --name echowork-api
pm2 save
pm2 startup

# 5. Nginx reverse proxy (optional but recommended)
# /etc/nginx/sites-available/echowork
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Option 4 — Docker

```bash
cd BE

# Build image
docker build -t echowork-api .

# Run with env file
docker run -d \
  --name echowork \
  -p 3000:3000 \
  --env-file .env \
  echowork-api

# Check logs
docker logs -f echowork
```

---

## Pre-Deployment Checklist

- [ ] `JWT_SECRET` is a long random string (not the default)
- [ ] `NODE_ENV=production` is set
- [ ] `CLIENT_URL` matches your frontend domain exactly (no trailing slash)
- [ ] `DATABASE_URL` is set and the database is reachable
- [ ] `npx prisma migrate deploy` has been run on the production database
- [ ] `.env` is NOT committed to git
- [ ] `window.ECHO_API_BASE` is set in the frontend HTML to the production API URL
- [ ] Test `/api/health` endpoint returns `{"success":true}`

---

## Post-Deployment Verification

```bash
# Health check
curl https://your-api.onrender.com/api/health

# Test auth
curl -X POST https://your-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@echowork.com","password":"admin123"}'
```

---

## Stack Summary

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | HTML/CSS/Vanilla JS | Vercel / Netlify / Cloudflare Pages |
| Backend | Node.js + Express | Render / Railway / VPS |
| Database | MySQL + Prisma ORM | Railway / PlanetScale / VPS |
| File Uploads | Multer (local disk) | Stored in `uploads/` on server |
| PDF Export | Puppeteer | Runs on backend server |
