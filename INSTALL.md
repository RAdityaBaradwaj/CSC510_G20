# Installation Guide

This guide covers fresh installs for both the **RouteDash API** (`proj2/server`) and the **Expo mobile client** (`proj2/routedash`). All commands assume macOS/Linux; Windows users can run the same commands inside WSL2 or PowerShell (use `setx` for environment variables).

---

## 1. Prerequisites

- **Node.js 18 LTS** (verify with `node -v`)
- **npm 9+** (ships with Node 18; verify with `npm -v`)
- **PostgreSQL 15+** (local Docker container or managed DB)
- **Expo prerequisites**  
  - Xcode + iOS Simulator (macOS) and/or Android Studio Emulator  
  - Expo Go app on physical devices (optional)
- **Git** with access to `https://github.com/RAdityaBaradwaj/CSC510_G20`

---

## 2. Clone the repository

```bash
git clone https://github.com/RAdityaBaradwaj/CSC510_G20.git
cd CSC510_G20
git checkout main
```

> ✅ Tip: create a feature branch for any changes (`git checkout -b feature/my-task`) before committing.

---

## 3. Backend (proj2/server)

1. **Install dependencies**

   ```bash
   cd proj2/server
   npm install
   ```

2. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   Update the new `.env`:

   ```bash
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/routedash
   JWT_SECRET=generate_a_long_random_string
   ```

3. **Database setup**

   ```bash
   npm run prisma:generate
   npm run db:migrate
   npm run db:seed   # optional demo data
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   The API listens on `http://localhost:4000`. Health check: `curl http://localhost:4000/health`.

---

## 4. Mobile client (proj2/routedash)

1. **Install dependencies**

   ```bash
   cd proj2/routedash
   npm install
   ```

2. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and provide:

   ```
   API_URL=http://localhost:4000
   GOOGLE_MAPS_API_KEY=<your key>
   ```

   - iOS Simulator: `API_URL=http://127.0.0.1:4000`
   - Android Emulator: `API_URL=http://10.0.2.2:4000`

3. **Start Expo**

   ```bash
   npm start
   ```

   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan the QR code using Expo Go on a physical device

---

## 5. Running quality checks

From the repository root:

```bash
npm run --prefix proj2/server lint
npm run --prefix proj2/server test
npm run --prefix proj2/server test:coverage
npm run --prefix proj2/routedash lint
```

GitHub Actions will run these automatically on every pull request (see `.github/workflows/`).

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Error: Environment variable not found: DATABASE_URL` | Revisit step 3.2 and ensure `.env` has a valid Postgres connection string. |
| Prisma migration fails with `database "routedash" does not exist` | Create the database manually: `createdb routedash` (macOS/Linux) or use pgAdmin. |
| Expo app cannot reach API (`Network request failed`) | Double-check `API_URL` uses the simulator-friendly hostname; ensure the backend server is running. |
| Google Maps blank tiles | Ensure the key in `.env` has both **Maps SDK for iOS** and **Maps SDK for Android** enabled in Google Cloud. |

---

Need automated deployment instructions? See [proj2/docs/deployment.md](proj2/docs/deployment.md) for Docker Compose, Fly.io, and Expo EAS build steps.
