# Deployment Guide

This document outlines how to deploy the RouteDash stack in staging/production environments.

---

## 1. Infrastructure overview

- **API**: Node.js service (Express + Prisma) packaged via Docker.
- **Database**: PostgreSQL 15 (Render, Supabase, Neon, or RDS).
- **Storage**: No binary assets yet; S3 bucket planned for future menu imagery.
- **Mobile app**: Distributed through Expo EAS builds (Android APK + iOS build for TestFlight).

---

## 2. Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db-host:5432/routedash` |
| `JWT_SECRET` | 32+ character secret for session signing | `base64:...` |
| `PORT` | API port (default `4000`) | `8080` |
| `NODE_ENV` | `production` in deployed environments | `production` |

---

## 3. Docker deployment

1. **Build images**

   ```bash
   cd proj2/server
   docker build -t routedash-api:latest .
   ```

2. **Run migrations in the container**

   ```bash
   docker run --rm \
     -e DATABASE_URL=$DATABASE_URL \
     routedash-api:latest \
     npx prisma migrate deploy
   ```

3. **Start the container**

   ```bash
   docker run -d --name routedash-api \
     -p 8080:4000 \
     -e DATABASE_URL=$DATABASE_URL \
     -e JWT_SECRET=$JWT_SECRET \
     -e NODE_ENV=production \
     routedash-api:latest
   ```

4. **Health check**

   ```
   curl https://your-api-host/health
   ```

---

## 4. Fly.io one-click deploy

1. Install the Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. From `proj2/server`, run `flyctl launch` (do not deploy yet).
3. Update `fly.toml` with secrets:

   ```bash
   flyctl secrets set DATABASE_URL=... JWT_SECRET=...
   ```

4. Deploy: `flyctl deploy`.

Fly automatically provisions an SSL-enabled hostname. Remember to update the Expo env with the new API URL.

---

## 5. Expo builds

1. Install Expo CLI globally `npm install -g expo-cli` (optional).
2. Authenticate: `npx expo login`.
3. Configure build profiles in `proj2/routedash/app.config.ts`.
4. Trigger builds:

   ```bash
   cd proj2/routedash
   npx expo prebuild
   npx eas build -p ios --profile preview
   npx eas build -p android --profile preview
   ```

5. Submit iOS build to TestFlight: `npx eas submit -p ios`.
6. Share the Android `.apk`/`.aab` via Google Play Internal Testing.

---

## 6. Observability

- **Logs**: Use services like Fly.io logs, Render logs, or connect to Datadog.
- **Metrics**: TODO — integrate OpenTelemetry with Prometheus exporter.
- **Alerts**: Configure pager/Slack alerts when error rates exceed thresholds.

---

## 7. Rollback strategy

- Maintain database backups (daily snapshots).
- Deploy using blue/green or canary strategy when possible.
- `git tag` each release; use `flyctl releases` (or platform equivalent) to roll back if needed.

---

## 8. Post-deployment checklist

- [ ] Migrations applied successfully.
- [ ] Health endpoint returns `200 OK`.
- [ ] Mobile app configured to hit the new API base URL.
- [ ] Background jobs (if any) confirmed running.
- [ ] CI pipeline green on `main`.

---

Questions? Reach out in Discord `#ops` or open an issue labelled `type:infra`.
