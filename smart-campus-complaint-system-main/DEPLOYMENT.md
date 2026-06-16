# Deployment Guide - Smart Campus Complaint System

This guide provides instructions for deploying the Smart Campus Complaint System to Vercel.

## Architecture

- **Frontend**: React + Vite (deployed to Vercel)
- **Backend**: Express + Socket.io + Prisma (deployed separately due to WebSocket requirements)

## Deployment Strategy

Since the backend uses Socket.io (WebSockets) and a traditional Express server, Vercel's serverless architecture isn't ideal. We recommend:

### Option 1: Frontend on Vercel + Backend on Railway (Recommended)

**Why**: Railway supports long-lived connections and WebSockets natively.

### Option 2: Frontend on Vercel + Backend on Render

**Why**: Free tier available, good for small projects.

### Option 3: Frontend on Vercel + Backend on Fly.io

**Why**: Better global performance, competitive pricing.

---

## Step 1: Prepare Frontend for Vercel

### 1.1 Update Environment Variables

Create `client/.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

### 1.2 Update Vite Config (if needed)

Ensure `client/vite.config.ts` has proper build configuration:
```typescript
export default {
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}
```

### 1.3 Create Root package.json

Create `package.json` in the project root:
```json
{
  "name": "smart-campus-complaint-system",
  "version": "1.0.0",
  "workspaces": ["client", "server"],
  "scripts": {
    "build": "cd client && npm run build"
  }
}
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Via Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

### 2.2 Via GitHub Integration

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your repository
5. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_API_URL`: Your backend domain
   - `VITE_SOCKET_URL`: Your backend domain
7. Deploy

---

## Step 3: Deploy Backend to Railway (Recommended)

### 3.1 Prepare Backend

Update `server/package.json` if needed (ensure build script exists):
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### 3.2 Railway Deployment

1. Go to [railway.app](https://railway.app)
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Select your repository
5. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm run build && npx prisma generate`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `NODE_ENV`: production
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `CLIENT_URL`: Your Vercel frontend URL
   - `JWT_SECRET`: Generate a secure random string
   - `PORT`: 3001
7. Deploy

---

## Step 4: Update Prisma Configuration

### 4.1 Update Database Connection

In `server/.env`:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### 4.2 Run Migrations

After deploying backend:
```bash
npx prisma migrate deploy
```

Or in CI/CD, add to Railway's start command:
```bash
npx prisma migrate deploy && node dist/server.js
```

---

## Step 5: Update Frontend API URLs

After getting your backend URL, update:

1. **client/.env.production**:
```env
VITE_API_URL=https://your-backend-url
VITE_SOCKET_URL=https://your-backend-url
```

2. Redeploy frontend to Vercel

---

## Environment Variables Checklist

### Frontend (client)
- [ ] `VITE_API_URL` = Backend domain
- [ ] `VITE_SOCKET_URL` = Backend domain

### Backend (server)
- [ ] `NODE_ENV` = production
- [ ] `DATABASE_URL` = PostgreSQL connection string
- [ ] `CLIENT_URL` = Frontend Vercel domain
- [ ] `JWT_SECRET` = Secure random string
- [ ] `PORT` = 3001 (or as configured)

---

## Troubleshooting

### WebSocket Connection Issues

If Socket.io connections fail:
1. Check CORS is configured for your frontend domain
2. Verify `CLIENT_URL` in backend matches frontend domain
3. Check WebSocket upgrade is allowed in your hosting

### Database Migrations

If migrations fail on Railway:
1. SSH into Railway and run migrations manually
2. Or add migration to startup script
3. Ensure `DATABASE_URL` is correct

### Frontend Not Loading API

1. Check `VITE_API_URL` is set correctly
2. Verify CORS is enabled in backend
3. Check browser console for exact error

---

## Production Checklist

- [ ] Database migrations completed
- [ ] Environment variables set on both platforms
- [ ] Frontend connected to production backend
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error logging set up
- [ ] Database backups configured
- [ ] Monitor uptime

---

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Prisma Deploy Docs](https://www.prisma.io/docs/orm/overview/databases-supported)
