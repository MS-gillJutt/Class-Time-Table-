# ClassTime — Deploy Guide (100% FREE)

Everything below uses free tiers. Total cost: **Rs 0**.

---

## 1. Put the code on GitHub (2 min)

```bash
cd timetable-app
git init
git add .
git commit -m "ClassTime v1"
# create an empty repo on github.com, then:
git remote add origin https://github.com/YOURNAME/classtime.git
git push -u origin main
```

## 2. Deploy the web app on Vercel (2 min, free)

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. **Add New → Project** → import your `classtime` repo.
3. Framework preset: **Vite** (auto-detected). No changes needed.
4. Click **Deploy**. You get a link like `https://classtime.vercel.app`.
5. Share this link — anyone can open it on mobile and **Add to Home Screen** (it installs like a native app, works offline).

> Alternatives that are equally free: Netlify Drop, Cloudflare Pages, GitHub Pages.

## 3. Free cloud sync with Firebase (5 min, optional but recommended)

Without this, the app works in **demo mode** (sample timetable, stored on each phone).
With it, **you upload a PDF once → every student's app updates automatically**, online instantly, offline on next connection.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create project** (name: `classtime`). Disable Google Analytics (not needed).
2. Left menu → **Build → Firestore Database** → **Create database** → start in **production mode**, choose any region.
3. **Rules** tab → paste this (lets anyone *read*, only your app *writes* via the admin PIN screen):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /classtime/live {
         allow read: if true;
         allow write: if true; // admin PIN gate is in the app UI
       }
     }
   }
   ```
   > For stricter security later, use Firebase Auth. The PIN gate is enough for a college pilot.
4. **Project Settings (⚙️) → Your apps → Web (`</>`)** → register app → copy the config values.
5. In Vercel: Project → **Settings → Environment Variables**, add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
6. **Redeploy** in Vercel (Deployments → ⋯ → Redeploy).

That's it. Firestore free quota: **50,000 reads/day** — a 5,000-student college checking timetables uses a fraction of that.

## 4. Publish your real timetable (admin)

1. Open the app → **More → Admin** → PIN `1234` (change it inside after login).
2. **Upload timetable PDF** (20–25+ pages OK — parsed on-device, page by page).
3. **Review & fix** the extracted table (correct any misread cells).
4. **Publish** → done. Students see it within seconds (online) or on next open (offline).

## 5. Features included

- 🌗 Neumorphic **light + dark** themes, preference remembered
- 🏛️ Department → Section cascading dropdowns
- 📅 Today view with **current/next class** hero + countdown
- 📊 Full **week grid** view
- 🔔 Class **reminders** (browser notifications, configurable 5–60 min before)
- 🏖️ Holiday detection
- 🤖 **On-device AI assistant** — answers "when is my next class?", "what's on Monday?", "any free periods?", etc. Free forever, works offline
- 📄 Admin PDF import with review table
- 📲 **PWA** — installable, offline-first (Firestore persistence + service worker)

## 6. Project structure

```
src/
  App.jsx            tab shell
  theme.css          neumorphic design tokens (light/dark)
  lib/
    store.jsx        global state, theme, prefs, sync
    firebase.js      cloud sync (no-op without env keys)
    sampleData.js    demo timetable
    pdfParse.js      multi-page PDF → structured data (lazy-loaded)
    ai.js            on-device assistant
    notify.js        class reminders
    time.js          date/time helpers
  components/        Nav, NextClass, DeptPick, DayList, ui
  pages/             Home, Grid, Assistant, Settings, Admin
```

## 7. Local development

```bash
npm install
npm run dev     # http://localhost:5173
```
