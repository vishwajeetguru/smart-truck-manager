# Deployment Guide: Smart Truck Manager

This guide explains how to deploy the application using **Neon (Database)**, **Render (Backend)**, and **Netlify (Frontend)**.

## 1. Database Setup (Neon)

1.  **Create a Project**: Go to [Neon Console](https://console.neon.tech/) and create a new project.
2.  **Get Connection String**: Copy the "Connection String" from the dashboard. It looks like:
    `postgres://user:password@ep-random-123456.us-east-2.aws.neon.tech/neondb`
3.  **Save this string**: You will need it for the Backend deployment.

## 2. Backend Deployment (Render)

1.  **Create Web Service**: Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2.  **Connect GitHub**: Select this repository (`smart-truck-manager`).
3.  **Configure Service**:
    *   **Name**: `smart-truck-manager-api` (or similar)
    *   **Root Directory**: `backend` (Important!)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
4.  **Environment Variables**: Add the following variables:
    *   `DATABASE_URL`: (Paste your Neon Connection String here)
    *   `JWT_SECRET`: (Generate a strong random string)
    *   `FRONTEND_URL`: `https://smart-truck-manager.netlify.app` (Or your Netlify URL)
    *   `SMTP_HOST`: `smtp.gmail.com`
    *   `SMTP_PORT`: `465`
    *   `SMTP_USER`: (Your email)
    *   `SMTP_PASS`: (Your App Password)
5.  **Deploy**: Click **Create Web Service**.
6.  **Copy Backend URL**: Once deployed, copy the service URL (e.g., `https://smart-truck-manager-api.onrender.com`).

## 3. Frontend Deployment (Netlify)

1.  **Create Site**: Go to [Netlify](https://app.netlify.com/) and click **Add new site** -> **Import from existing project**.
2.  **Connect GitHub**: Select this repository (`smart-truck-manager`).
3.  **Configure Build**:
    *   **Base Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
4.  **Environment Variables**: Click **Advanced** -> **New Variable** and add:
    *   `VITE_API_URL`: (Paste your Render Backend URL, e.g., `https://smart-truck-manager-api.onrender.com/api`)
    *   **Note**: Do NOT add a trailing slash after `/api`.
5.  **Deploy**: Click **Deploy site**.

## 4. Final Steps
1.  **Database Initialization**: The backend automatically attempts to create tables on startup (`init_db.js` or `server.js` logic). Check Render logs to ensure no SQL errors individually.
2.  **Verify**: Open your Netlify URL and test registration/login.
