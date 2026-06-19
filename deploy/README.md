# Tribe Trip Deployment Checklist

This folder documents the deploy path for the current React + Express + Prisma stack.

## Local Development

Frontend environment:

```bash
cp frontend-env/.env.example frontend-env/.env
```

Default value:

```bash
VITE_API_URL=http://localhost:5000/api
```

Backend environment:

```bash
cd backend
cp .env.example .env
npm run db:push
npm run seed
npm run dev:admin
```

Run both services from the repository root:

```bash
npm run dev
npm run dev:backend
```

## Docker Production Preview

Create a local Docker environment file:

```bash
cp deploy/docker.env.example .env
```

Update at minimum:

```bash
JWT_SECRET=replace_with_a_unique_32_plus_character_secret
```

Start the stack:

```bash
docker compose --env-file .env up --build
```

First run with an empty SQLite volume:

```bash
RUN_SEED=true docker compose --env-file .env up --build
```

The first seeded startup can take longer than a normal restart because Prisma creates the database and imports bundled content before the API becomes ready.

Open:

```text
http://localhost:8080/
```

Health probes:

```text
http://localhost:8080/api/live
http://localhost:8080/api/ready
```

## Runtime Frontend Config

The frontend image supports runtime API configuration without rebuilding the React bundle.

Use this when frontend and API are served by the same Nginx container:

```bash
TRIBE_TRIP_API_URL=/api
```

Use a full URL only when the API is hosted separately:

```bash
TRIBE_TRIP_API_URL=https://api.example.com/api
```

The Docker frontend container rewrites `/runtime-config.js` at startup. The service worker intentionally does not cache `/runtime-config.js`, `/api/*`, or `/uploads/*`.

## Backend Production Checklist

Required:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=file:../data/prod.db
JWT_SECRET=replace_with_a_unique_32_plus_character_secret
FRONTEND_URLS=https://your-frontend-domain.com
TRUST_PROXY=1
```

Recommended:

```bash
LOG_REQUESTS=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_API_MAX=500
RATE_LIMIT_AUTH_MAX=30
RATE_LIMIT_LOCAL_SECRETS_MAX=60
```

Media uploads:

```bash
MEDIA_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=tribe-trip
```

SQLite is acceptable for the Docker preview. Before a real public launch, use a managed database, add backups, and update the Prisma datasource provider and `DATABASE_URL` together.

## Pre-Deploy Gate

Run before building or deploying:

```bash
npm run predeploy:staging
git diff --check
```

For a real market production launch, run:

```bash
npm run predeploy:production
```

That command intentionally fails while the project is still using SQLite, because production needs a managed database with backups. Staging can use SQLite for a controlled preview.

The deployment is not ready if any of these fail:

- `npm run lint`
- `npm run build`
- `npm run check:backend`
- `npm run test:backend`
- `node scripts/predeploy-check.js staging`
- `/api/ready` returns non-200

## Vercel Deployment

This repository supports a single Vercel deployment that serves the React app and the Express API from the same origin.

Use these settings in Vercel:

```text
Install Command: npm ci && npm --prefix backend ci
Build Command: npm run build:vercel
Output Directory: dist
```

Required environment variables:

```text
NODE_ENV=production
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=replace_with_a_unique_32_plus_character_secret
FRONTEND_URLS=https://your-vercel-domain.vercel.app
MEDIA_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Notes:

- Keep `VITE_API_URL` empty for same-origin Vercel deployments so the frontend uses `/api`.
- The API refuses to boot on Vercel unless Supabase Storage or Cloudinary is configured, because serverless file storage is ephemeral.
- Use `backend/prisma/schema.vercel.prisma` for the deployed API schema and the local SQLite schema only for development.
