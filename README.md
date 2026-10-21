# Habit Tracker App

A simple habit‑tracking web app built with React, TypeScript, Vite, Tailwind CSS, and Firebase.

## Live demo
https://habit-app-rosy.vercel.app

## Prerequisites
- Git
- Node.js (v20.19 or newer, or v22.12+)
- npm (bundled with Node)

## Get the code
```sh
git clone https://github.com/faeznocode/habit-app.git
cd habit-app
npm ci
npm run dev
```

Open http://localhost:5173 (or the URL shown in the terminal).

## Firebase setup
1. Create a Firebase project.
2. Enable Google sign‑in in **Authentication**.
3. Create a Firestore database (native mode). Use the default database or note its ID.
4. Copy the web‑app config from project settings into `firebase-applet-config.json` (the file is already in the repo). The JSON contains only public keys; do not commit secret keys.
5. In the Firebase console open **Firestore → Rules** and paste the contents of `firestore.rules`. Click **Publish**.

## Running locally
```sh
npm run dev      # start dev server
npm run build    # production build (outputs to dist/)
npm run preview  # preview built app
```

## Deploy to Vercel
1. Push the repo to GitHub.
2. In Vercel, import the repository and select the **Vite** preset.
3. Use the default build command `npm run build` and output directory `dist`.
4. No environment variables are required; the Firebase config is bundled.

## Admin access
Create a document `admins/{uid}` in Firestore (replace `{uid}` with the user’s UID) to grant admin rights.

## Need help?
Open an issue on the GitHub repo or ask the maintainer.
