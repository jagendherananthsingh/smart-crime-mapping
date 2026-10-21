# 🚀 Vercel Unified Fullstack Deployment Guide
### AP Smart Crime Analysis & Predictive Insights Platform
**Department of CSE (Data Science) • Geethanjali Institute of Science & Technology**

---

## ⚡ Unified Simultaneous Deployment (Frontend + Backend)

Both the **Frontend (React + Vite)** and the **Backend (Express + REST API)** are configured to deploy **together at the exact same time under a single Vercel project**.

### How It Works:
1. **Frontend SPA**: Static files are built into `frontend/dist` and served with client-side routing rewrites (`/(.*) -> /index.html`).
2. **Backend Serverless API**: The Express application runs as a serverless function (`api/index.js`), handling all `/api/*` requests on the exact same domain.
3. **No Cross-Origin Issues**: Because both are hosted under `https://<your-project>.vercel.app`, browser requests to `/api/...` are local (same origin), requiring no extra CORS setups or external servers!

---

## 📋 1-Click Deployment Instructions

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "feat: unified simultaneous frontend and backend deployment on vercel"
git push -u origin main
```

### Step 2: Import into Vercel
1. Open **[vercel.com/new](https://vercel.com/new)**.
2. Select your repository: **`jagendherananthsingh/smart-crime-mapping`**.
3. **Root Directory**: Keep the default: `./` (do **not** change it to `frontend` or `backend`).
4. **Build and Output Settings**: Automatically detected from `vercel.json`:
   - Build Command: `npm --prefix backend install && npm --prefix backend run build && npm --prefix frontend install && npm --prefix frontend run build`
   - Output Directory: `frontend/dist`

### Step 3: (Optional) Add MongoDB Atlas Connection
In Vercel **Settings → Environment Variables**:
| Key | Value (Example) | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@cluster0.mongodb.net/smart_crime_mapping` | MongoDB Atlas Cloud Database |
| `JWT_SECRET` | `your_secure_random_key_2026` | Secret for user sessions |

*(If MONGODB_URI is not set initially, the platform gracefully runs with resilient demo datasets and statistics so your live site works out of the box!)*

### Step 4: Click Deploy!
Both your **Frontend Website** and your **Backend API** will be deployed and active together in under 1 minute!
- Frontend UI: `https://<your-app>.vercel.app/`
- Backend API: `https://<your-app>.vercel.app/api/health`
