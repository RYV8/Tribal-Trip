# Tribe Trip Backend

Production API foundation for Tribe Trip. This backend replaces the earlier duplicate prototype structure with a single `src/` entry point and a schema aligned with the current frontend product: cultural discovery, stories, artifacts, culture guides, food, music, clothing, favorites, profile, and moderated local secrets.

## Stack

- Node.js
- Express
- Prisma ORM
- Zod request validation
- SQLite for local development
- PostgreSQL or MySQL-ready for production with a provider/URL change
- JWT authentication
- Helmet security headers
- Express Rate Limit request throttling
- Request IDs and optional structured request logs
- Local media uploads for development
- Cloudinary media uploads for production when configured

The local backend uses Prisma with SQLite, so no local database password is required for development.

## Setup

1. Configure environment:

```bash
cp .env.example .env
```

Update `JWT_SECRET` and `FRONTEND_URLS`. The default local database is:

```bash
DATABASE_URL="file:../dev.db"
```

In production, the API refuses to start unless `DATABASE_URL` is set and `JWT_SECRET` is a unique value with at least 32 characters.

Rate limits are configurable per environment:

```bash
TRUST_PROXY=0
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_API_MAX=500
RATE_LIMIT_AUTH_MAX=30
RATE_LIMIT_LOCAL_SECRETS_MAX=60
LOG_REQUESTS=false
```

Set `TRUST_PROXY=1` when the API runs behind one trusted reverse proxy or load balancer.
Production enables request logs by default unless `LOG_REQUESTS=false` is set.

Local development stores uploaded images in `backend/uploads`. For production media storage, set:

```bash
MEDIA_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=tribe-trip
```

2. Create/update the local Prisma database:

```bash
npm run db:push
```

3. Seed from the current React dataset:

```bash
npm run seed
```

4. Create a local admin account for protected admin routes:

```bash
npm run dev:admin
npm run dev:editor
npm run dev:super-admin
```

Default dev credentials:

```text
admin@tribetrip.local / AdminPass123
editor@tribetrip.local / EditorPass123
superadmin@tribetrip.local / SuperAdminPass123
```

5. Start the API:

```bash
npm run dev
```

Health check:

```text
GET http://localhost:5000/api/health
```

Deployment probes:

```text
GET http://localhost:5000/api/live
GET http://localhost:5000/api/ready
```

Run backend security and workflow tests:

```bash
npm test
```

## Docker

The backend image is built from the repository root with `backend/Dockerfile` so the seed script can read the frontend content data. In the root `docker-compose.yml`, the backend uses:

```text
DATABASE_URL=file:../data/prod.db
```

That resolves to `/app/data/prod.db` inside the container and is persisted with a Docker volume. The stack runs `npm run db:push` before startup, and only runs the seed script when `RUN_SEED=true` is set.

Public traffic should go through the frontend Nginx container, which proxies `/api` and `/uploads` to the backend service.
The frontend container writes `/runtime-config.js` at startup from `TRIBE_TRIP_API_URL`, so the same built frontend image can point to `/api` or to a separately hosted API.

## Main Endpoints

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET  /api/profile
PUT  /api/profile

GET  /api/countries
GET  /api/countries/:slug
GET  /api/categories
GET  /api/categories/:slug

GET  /api/locations
GET  /api/locations/:slug
GET  /api/stories
GET  /api/stories/:slug
GET  /api/artifacts
GET  /api/artifacts/:slug

GET  /api/culture-guides
GET  /api/culture-guides/:countrySlug
GET  /api/map/availability
GET  /api/search?q=benin

GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites

GET  /api/local-secrets
POST /api/local-secrets
POST /api/local-secrets/:id/helpful

POST   /api/admin/media
GET    /api/admin/audit-logs
GET    /api/admin/users
PATCH  /api/admin/users/:id
GET    /api/admin/countries
POST   /api/admin/countries
PUT    /api/admin/countries/:slug
GET    /api/admin/culture-guides
PUT    /api/admin/culture-guides/:countrySlug
DELETE /api/admin/culture-guides/:countrySlug
GET    /api/admin/sources
POST   /api/admin/sources
PUT    /api/admin/sources/:id
DELETE /api/admin/sources/:id
GET    /api/admin/locations?status=all
POST   /api/admin/locations
PUT    /api/admin/locations/:slug
DELETE /api/admin/locations/:slug
GET    /api/admin/stories?status=all
POST   /api/admin/stories
PUT    /api/admin/stories/:slug
DELETE /api/admin/stories/:slug
GET    /api/admin/artifacts?status=all
POST   /api/admin/artifacts
PUT    /api/admin/artifacts/:slug
DELETE /api/admin/artifacts/:slug
GET    /api/admin/local-secrets?status=submitted
PATCH  /api/admin/local-secrets/:id
```

## Editorial Roles

- `editor`: can create and update draft/review records, draft/review culture guides, upload media, move suggestions to review, and add source citations.
- `admin` / `super_admin`: can publish, archive, manage countries, reject suggestions, view audit logs, delete sources, and manage user access.
- `admin`: can manage `user` and `editor` accounts, but cannot manage admin accounts or assign admin roles.
- `super_admin`: can manage admin-level accounts.
- Protected routes verify the current user and role from the database on each request, not only from the JWT payload.
- Disabled accounts cannot sign in and existing tokens for disabled accounts are rejected.
- Write routes validate request `body`, `query`, and `params` with Zod before controller logic runs.
- Each response includes an `X-Request-Id` header, and error responses include `requestId` for support/debugging.

## Current Scope

This is now ready as a backend foundation, not yet a complete market deployment. Public catalogue data, account/profile data, saved items, source citations, country coverage, culture guides, admin writes, user access, media uploads, moderation workflow, structured request validation, security headers, configurable rate limiting, deployment health probes, request IDs, and structured request logging all have API coverage. Remaining production work:

- Configure production Cloudinary credentials before launch.
- Add backups and deployment-specific monitoring before launch.

## Important Structure

```text
backend/
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- routes/
|   `-- utils/
|-- scripts/seed-from-frontend.js
|-- scripts/create-dev-admin.js
|-- scripts/create-dev-editor.js
|-- prisma/schema.prisma
|-- package.json
`-- .env.example
```

The active backend entry point is `src/server.js`. Legacy root-level prototype files were removed to keep one clear backend architecture.
