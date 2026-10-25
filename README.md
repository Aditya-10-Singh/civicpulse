# 🏛️ CivicPulse — Smart Civic Grievance & Redressal Platform

> **A modern full-stack web application bridging Citizen Civic Reporting, Relational PostgreSQL Storage (Supabase), and Live Field Operations Spreadsheets (Google Sheets).**

![CivicPulse Banner](https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80)

---

## 📋 Assessment Criteria Alignment (8 / 8 Checklist)

| No. | Assessment Question | Implementation in CivicPulse |
|:---:|:---|:---|
| **1** | **Self Introduction** | Dedicated pitch & profile for **Aditya Singh** (Full-Stack Web Developer). |
| **2** | **Project Introduction** | Real-world problem: Municipal civic hazard reporting & dual-database sync architecture built this week. |
| **3** | **Frontend Development** | Modern React + Vite + Tailwind CSS UI with glassmorphic dark theme, KPI stat cards, filters, and modals. |
| **4** | **GitHub** | Full Git version control, structured commits, modular code, and ready to push to GitHub. |
| **5** | **Google Sheets Integration** | Real-time Webhook integration with Google Apps Script + Bulk Sync + Instant CSV export. |
| **6** | **Supabase Integration** | PostgreSQL database with complete CRUD (Create, Read, Update, Delete) & Row Level Security policies. |
| **7** | **Authentication** | Supabase Auth (Email & Password, Session State, JWT, and 1-Click Demo Citizen Login). |
| **8** | **Deployment** | Production-ready Vite build with `vercel.json` SPA rewrites ready for 1-click Vercel deployment. |

---

## 🌟 The Real-World Problem Solved

Across urban centers and residential communities, citizens encounter infrastructure hazards daily: dangerous potholes, ruptured water mains, faulty street lamps, and overflowing waste containers.

- **The Disconnect**: Developers build applications connected to SQL databases, but local municipal field officers, contractor teams, and city inspectors work out of **spreadsheets** (Excel/Google Sheets) for daily assignment and route planning.
- **The CivicPulse Solution**: Authenticated citizens report issues with photo proof, geolocation, and category tags. Submissions are written to **Supabase PostgreSQL** for data integrity and simultaneously pushed via **Google Apps Script Webhooks** to the department's **live Google Sheet** for immediate field dispatch.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Canvas-Confetti
- **Backend / Database**: Supabase (PostgreSQL, Row Level Security, Auth)
- **External Integration**: Google Sheets API / Google Apps Script Web App
- **Deployment**: Vercel SPA Hosting

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## ⚡ Connecting Live Supabase Database (Criterion #6 & #7)

1. Create a free project at [database.new](https://database.new) (Supabase).
2. Navigate to **SQL Editor** in your Supabase Dashboard.
3. Open `supabase_schema.sql` from this repository, copy its contents, and click **Run**.
4. Go to **Project Settings > API**, copy your **Project URL** and **Anon Public Key**.
5. Paste them into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   *(Or click the ⚙️ Settings icon directly in the CivicPulse UI to save them without restarting the dev server!)*

---

## 📊 Connecting Google Sheets Webhook (Criterion #5)

1. Open a new Google Sheet at [sheets.new](https://sheets.new). Rename the tab to `Grievances`.
2. Go to **Extensions > Apps Script**.
3. Replace the default code with the contents of `google_apps_script.js` from this project.
4. Click **Deploy > New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize permissions, and copy the **Web app URL**.
6. Paste the URL into the **Google Sheets Sync** drawer inside the CivicPulse app or in `.env`:
   ```env
   VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
   ```

---

## 🚢 Deploying to Vercel (Criterion #8)

1. Push this project to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete CivicPulse full-stack platform"
   git remote add origin https://github.com/Aditya-10-Singh/CivicPulse.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `CivicPulse` repository.
4. (Optional) Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_SHEETS_WEBHOOK_URL`).
5. Click **Deploy**!

---

## 👨‍💻 Developer & Viva Information

- **Developer**: Aditya Singh
- **Email**: adityasingh00552@gmail.com
- **GitHub**: [github.com/Aditya-10-Singh](https://github.com/Aditya-10-Singh)
- **Built for**: Full-Stack Technical Evaluation & Practical Assessment
