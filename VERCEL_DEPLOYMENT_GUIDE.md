# 🚀 Vercel Deployment & Hosting Guide
### AP Smart Crime Analysis & Predictive Insights Platform
**Department of CSE (Data Science) • Geethanjali Institute of Science & Technology**

---

## 📋 Overview

This platform is configured for production hosting on **Vercel** for the frontend, with options to connect to a hosted backend (e.g., Render, Railway, Fly.io, or VPS) backed by MongoDB Atlas.

---

## ⚡ Option 1: Deploying to Vercel (Recommended)

### Step 1: Push Code to GitHub
Ensure your repository is pushed to your GitHub account:
```bash
git init
git add .
git commit -m "feat: hosting ready with vercel config and clean login"
git branch -M main
git remote add origin https://github.com/<your-username>/smart-crime-mapping.git
git push -u origin main
```

### Step 2: Import Project in Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`smart-crime-mapping`).

### Step 3: Project Configuration
Vercel is pre-configured with both root and frontend `vercel.json` files:
- **Framework Preset**: Vite
- **Root Directory**: 
  - *Default (Monorepo)*: Leave as `./` (Root `vercel.json` handles `cd frontend && npm install && npm run build` and outputs to `frontend/dist`).
  - *OR Subfolder*: Select `frontend` (Build command: `npm run build`, Output directory: `dist`).

### Step 4: Configure Environment Variables in Vercel
Under **Environment Variables**, add:
| Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | The URL of your deployed backend API |

*Note: If no backend is configured initially, the frontend automatically falls back to graceful offline/failover mode, allowing all public dashboards, sample datasets, and crime maps to operate smoothly!*

### Step 5: Click "Deploy"
Your site will build and be live at `https://<your-project-name>.vercel.app`.

---

## 🛠️ Option 2: Deploying the Backend API

To connect the live Vercel frontend with a live Node/Express backend:

### Recommended Free/Low-Cost Platforms:
- **Render** ([render.com](https://render.com)) - Web Service (Node)
- **Railway** ([railway.app](https://railway.app)) - Deploy from GitHub
- **Fly.io** or **Docker Container**

### Backend Environment Variables:
Set these in your backend host (e.g., Render Dashboard):
```ini
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_crime_mapping?retryWrites=true&w=majority
JWT_SECRET=your_super_strong_production_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=https://<your-vercel-app-name>.vercel.app
```

### Database (MongoDB Atlas):
1. Create a free M0 Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Allow network access (`0.0.0.0/0` or your backend IP).
3. Copy the connection string into `MONGODB_URI`.

---

## 🔍 Pre-Configured Hosting Optimizations

1. **SPA Rewrites**:
   - `vercel.json` contains rewrites mapping `/(.*)` to `/index.html` so refreshing pages (`/dashboard`, `/analytics`, `/predictions`, `/crime-map`, `/request-access`) never produces 404 errors.
2. **Dynamic API URL Resolution**:
   - `frontend/src/api/client.ts` automatically normalizes trailing slashes, appends `/api` if needed, and prevents Mixed Content security blocks on HTTPS domains.
3. **CORS Flexibility**:
   - `backend/src/app.ts` dynamically mirrors request origins to support custom Vercel preview and production domains with secure credentials.
4. **Static Asset Caching**:
   - 1-year immutable caching configured for static JavaScript and CSS assets in `/assets/`.
5. **Clean Authentication**:
   - Demo one-click buttons removed from the Login page for a clean, production-grade interface.
