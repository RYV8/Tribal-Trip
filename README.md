# Tribe Trip MVP

Tribe Trip is a web application for discovering African cultural heritage. It helps users explore museums, heritage sites, cultural stories, artifacts, practical culture guides, food spots, and curated routes across several African countries.

This project is an MVP, which means Minimum Viable Product. It is the first usable version of the product, built to test the idea, collect feedback, and improve the experience with the team.

The frontend can still run fully in the browser with bundled content. A Prisma backend API now exists in `backend/` for the real product path. When the API is available, the React app loads public catalogue data from it; when it is not available, the app falls back to the bundled MVP dataset. Signed-in users can persist their profile and saved library through the backend, while guest data remains local to the browser.

## What You Can Do In The App

- Discover museums, monuments, heritage sites, and cultural centers.
- Explore African countries through heritage-focused cards.
- Read short cultural stories with key points and timelines.
- View a starter gallery of cultural artifacts.
- Search across places, stories, and artifacts.
- Use local phrase vocabulary, greetings, etiquette, taboos, translations, food guidance, music styles, and clothing styles per country.
- View an Africa availability map with the current MVP countries highlighted.
- Create an account, sign in, update profile details, and sync saved favorite items.
- Add and display source citations for cultural content through the editorial dashboard.
- Manage country coverage and culture guides from the editorial dashboard.
- Validate backend write payloads before they reach catalogue, account, and admin controllers.
- Add local secrets and suggestions locally for the future moderation flow.
- Upload a local profile photo.
- Reopen the app shell offline after the first load.
- Switch between light mode and dark mode.
- Open a place location in Google Maps.

## Who This README Is For

This guide is written for every team member, including people who are not developers.

If you only want to test the app on your computer, follow the sections below in this order:

1. Install the required tools.
2. Clone the project.
3. Install the project dependencies.
4. Start the app.
5. Open the local link in your browser.

## Required Tools

Before running the project, install these tools on your machine:

- Git: used to download the project from GitHub.
- Node.js: used to run the app locally.
- npm: installed automatically with Node.js.

Recommended Node.js version:

```text
Node.js >= 20.19.0 or >= 22.12.0
```

To check if the tools are already installed, open a terminal and run:

```bash
git --version
node --version
npm --version
```

If one of these commands is not recognized, install the missing tool before continuing.

## Clone The Project

Open a terminal, choose the folder where you want to keep the project, then run one of the commands below.

Use HTTPS if you are not sure which option to choose:

```bash
git clone https://github.com/Shegitu/TribeTrip.git
cd TribeTrip
```

Use SSH only if your GitHub SSH key is already configured:

```bash
git clone git@github.com:Shegitu/TribeTrip.git
cd TribeTrip
```

After `cd TribeTrip`, your terminal should be inside the project folder.

## Fast Team Setup

Use this path when you already have access to the GitHub repository and you want to test the full frontend + backend experience.

```bash
npm ci
npm --prefix backend ci

cp .env.example .env.local
cp backend/.env.example backend/.env

npm run db:push
npm run seed:backend
npm run dev:editor
npm run dev:admin
npm run dev:super-admin
```

Then start the two services in two terminals from the repository root:

```bash
npm run dev:backend
```

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

Backend health checks:

```text
http://localhost:5000/api/live
http://localhost:5000/api/ready
```

If the frontend starts on another Vite port, use the URL printed by the terminal and add that URL to `FRONTEND_URLS` in `backend/.env` if CORS blocks requests.

## Local Test Accounts

These accounts are for local development and team testing only. Do not use these passwords in staging or production.

| Role | Email | Password | What to test |
| --- | --- | --- | --- |
| Editor | `editor@tribetrip.local` | `EditorPass123` | Draft/review content, upload media, sources, review suggestions |
| Admin | `admin@tribetrip.local` | `AdminPass123` | Publish/archive content, manage countries, culture guides, sources, users, audit logs |
| Super admin | `superadmin@tribetrip.local` | `SuperAdminPass123` | Admin-level user management and full admin permissions |

Create or reactivate them locally with:

```bash
npm run dev:editor
npm run dev:admin
npm run dev:super-admin
```

Normal users can be created from the Profile screen using the registration form.

To open the editorial dashboard:

1. Start backend and frontend.
2. Open `http://localhost:5173/`.
3. Go to `Profile`.
4. Sign in with one of the accounts above.
5. Click `Open editorial workspace`.

## Install The Project

Run this command once after cloning the project to install the frontend:

```bash
npm ci
```

This downloads all packages needed by the app. It can take a few minutes depending on your internet connection.

If `npm ci` fails, try:

```bash
npm install
```

To install the backend dependencies, run:

```bash
cd backend
npm ci
```

## Start The App Locally

Run the frontend:

```bash
npm run dev
```

After the command starts, the terminal will show a local URL. It usually looks like this:

```text
http://localhost:5173/
```

Open that link in your browser.

If port `5173` is already busy, Vite may show another port, for example `http://localhost:5174/`. Use the URL shown in your terminal.

## Start The Backend Locally

The backend uses Prisma with SQLite for local development. First create a backend `.env` file:

```bash
cd backend
cp .env.example .env
```

Update `JWT_SECRET` if needed. The default local database URL is:

```bash
DATABASE_URL="file:../dev.db"
```

Image uploads use local storage by default. For production Cloudinary uploads, configure `MEDIA_STORAGE_PROVIDER=cloudinary` and the Cloudinary keys in `backend/.env`.

Minimum local backend `.env` values:

```bash
PORT=5000
NODE_ENV=development
DATABASE_URL="file:../dev.db"
JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRES_IN=7d
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173
TRUST_PROXY=0
LOG_REQUESTS=false
MEDIA_STORAGE_PROVIDER=local
```

For team testing, keep SQLite. For real production, replace SQLite with a managed database and never reuse the local `JWT_SECRET`.

Create or update the local database schema:

```bash
npm run db:push
```

Seed the database from the current React content:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000/api
```

Health check:

```text
http://localhost:5000/api/health
```

Deployment checks:

```text
http://localhost:5000/api/live   # process is running
http://localhost:5000/api/ready  # process and database are ready
```

To make the frontend use a different API URL, create a root `.env.local` file and set:

```bash
VITE_API_URL=http://localhost:5000/api
```

You can start from the frontend example file:

```bash
cp .env.example .env.local
```

Root `.env.local` normally only needs:

```bash
VITE_API_URL=http://localhost:5000/api
```

## How To Test The App Locally

After opening the local URL in your browser, check these basic flows:

- The home page loads correctly.
- The navigation works between Home, Discover, Map, Culture, Search, and Profile.
- You can open a heritage place detail page.
- You can select a country on the Africa availability map.
- You can read phrases, etiquette, foods, and related places in the Culture guide.
- You can search for a place, story, or artifact.
- You can register or sign in from Profile.
- You can save an item as a favorite.
- The saved item appears in Profile under Saved library.
- Signed-in favorites are restored from the backend after refresh.
- You can add a local secret from Profile.
- You can upload and remove a profile photo from Profile.
- The light/dark theme switch works.
- The Google Maps direction button opens a map link.
- Admin users can open Profile > Editorial workspace to manage countries and culture guides.

Guest favorites, local secrets, profile photo, and theme preferences are saved only in your browser. Signed-in profile details and favorites are stored through the backend API.

## Docker Production Preview

The project includes a production-like Docker stack:

- `Dockerfile`: builds the React app and serves it with Nginx on port `8080`.
- `backend/Dockerfile`: runs the Express/Prisma API on port `5000` inside the Docker network.
- `docker-compose.yml`: connects frontend and backend, proxies `/api` through Nginx, persists SQLite data and uploads in Docker volumes.

Required environment:

```bash
cp deploy/docker.env.example .env
```

Set `JWT_SECRET` to a unique value with at least 32 characters before running the stack.

Start the stack:

```bash
docker compose --env-file .env up --build
```

Open:

```text
http://localhost:8080/
```

For the first Docker preview with an empty SQLite volume, seed bundled content:

```bash
RUN_SEED=true docker compose --env-file .env up --build
```

Docker health endpoints:

```text
http://localhost:8080/api/live
http://localhost:8080/api/ready
```

Use `deploy/docker.env.example` as the list of supported Docker environment variables. For hosted production, replace local SQLite with a managed database plan before real launch.
The frontend container can change API targets at startup with `TRIBE_TRIP_API_URL` without rebuilding the React bundle. See `deploy/README.md` for the deployment checklist.

Docker environment values to review before sharing a staging URL:

```bash
JWT_SECRET=replace_with_a_unique_32_plus_character_secret
JWT_EXPIRES_IN=7d
TRIBE_TRIP_API_URL=/api
FRONTEND_URLS=https://your-staging-domain.com
DATABASE_URL=file:../data/prod.db
TRUST_PROXY=1
LOG_REQUESTS=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_API_MAX=500
RATE_LIMIT_AUTH_MAX=30
RATE_LIMIT_LOCAL_SECRETS_MAX=60
RUN_SEED=false
MEDIA_STORAGE_PROVIDER=local
```

Use `RUN_SEED=true` only for the first staging preview with an empty database. After the database has content, switch it back to `false` so restarts do not reseed unexpectedly.

For production media uploads, use Cloudinary or another durable media service instead of container-local uploads:

```bash
MEDIA_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=tribe-trip
```

## Editorial Workflow

The editorial workspace is available from Profile after signing in with an editor or admin account.

- Editors can create and update draft/review catalogue records, culture guides, source citations, and local secret reviews.
- Admins can publish, archive, manage countries, manage users, delete sources, and read audit logs.
- Country coverage controls which countries appear as available in public discovery and the Africa map.
- Published culture guides are loaded from the backend by the public Culture screen, with bundled local data kept as a guest/prototype fallback.

Main admin sections:

| Section | Purpose | Editor | Admin |
| --- | --- | --- | --- |
| Places | Museums, heritage sites, cultural centers | Draft/review | Publish/archive |
| Stories | Civilizations, traditions, historical events | Draft/review | Publish/archive |
| Artifacts | Objects, artworks, cultural significance | Draft/review | Publish/archive |
| Countries | Country coverage and Africa map availability | No | Yes |
| Culture Guides | Phrases, etiquette, taboos, food, music, clothing | Draft/review | Publish/archive |
| Sources | Editorial citations for catalogue records | Add/update | Add/update/delete |
| Suggestions | Local secrets submitted by users | Review | Publish/reject/archive |
| Users | Account access and roles | No | Yes |
| Audit | Admin/editorial activity log | No | Yes |

Backend management commands from the repository root:

```bash
npm run db:push        # Apply Prisma schema to local SQLite
npm run seed:backend   # Import bundled frontend content into the backend DB
npm run dev:editor     # Create/reactivate local editor account
npm run dev:admin      # Create/reactivate local admin account
npm run dev:super-admin # Create/reactivate local super admin account
npm run test:backend   # Run backend security/workflow tests
```

When content is updated in `src/data/content.js` or `src/data/cultureGuides.js`, run `npm run seed:backend` again for local/staging databases that should mirror bundled content.

## Useful Commands

```bash
npm run dev          # Start the app for local testing
npm run dev:backend  # Start the backend API from the root folder
npm run build        # Create the production build in the dist/ folder
npm run preview      # Test the production build locally
npm run lint         # Check the code for common issues
npm run quality      # Run frontend lint/build and backend checks/tests
npm run predeploy:staging    # Run quality checks plus staging deployment config checks
npm run predeploy:production # Run production gate; fails until managed DB replaces SQLite
npm run db:push        # Create/update the local Prisma DB
npm run seed:backend   # Seed Prisma DB from frontend content
npm run check:backend  # Check backend JavaScript syntax
npm run test:backend   # Run backend security and workflow tests
npm run dev:admin      # Create/reactivate the local admin account
npm run dev:editor     # Create/reactivate the local editor account
npm run dev:super-admin # Create/reactivate the local super admin account

cd backend && npm run dev    # Start the backend API
cd backend && npm run db:push # Create/update the local Prisma DB
cd backend && npm run seed   # Seed Prisma DB from frontend content
cd backend && npm run check  # Check backend JavaScript syntax
cd backend && npm test       # Run backend security and workflow tests
```

## Quality Gates

The repository includes a GitHub Actions workflow in `.github/workflows/ci.yml`.

On every push to `main` or `master`, and on every pull request, CI runs:

- frontend dependency install, lint, and production build
- backend dependency install, JavaScript/schema validation, and backend tests

Before opening a pull request, run the same local quality gate:

```bash
npm run quality
```

Before staging deployment, run:

```bash
npm run predeploy:staging
```

`npm run predeploy:production` is stricter and intentionally blocks while the Prisma datasource is still SQLite.

For normal local testing, most team members only need:

```bash
npm run dev
```

## Project Structure

```text
.
|-- public/                 # Public images, logos, favicon, and static assets
|-- backend/                # Express/Prisma API foundation
|   |-- src/                # Active backend entry point, routes, controllers, middleware
|   |-- scripts/            # Seed scripts
|   `-- prisma/             # Prisma schema
|-- src/
|   |-- App.jsx             # Main application screens and behavior
|   |-- App.css             # Main application styles
|   |-- index.css           # Global styles
|   |-- main.jsx            # React entry point
|   |-- services/api.js      # Optional API client with local fallback behavior
|   |-- data/content.js      # Countries, places, stories, artifacts, and categories
|   `-- data/cultureGuides.js # Phrases, etiquette, food, music, clothing, and availability map data
|-- index.html              # Main HTML file used by Vite
|-- package.json            # Project commands and dependencies
|-- package-lock.json       # Exact installed dependency versions
`-- vite.config.js          # Vite configuration
```

## Where The Content Lives

Most app content is in:

```text
src/data/content.js
```

This file contains:

- `countries`: countries shown in the app.
- `categories`: content categories.
- `locations`: museums, heritage sites, and cultural centers.
- `stories`: cultural stories and timelines.
- `artifacts`: cultural objects shown in the gallery.

Culture guide content is in:

```text
src/data/cultureGuides.js
```

This file contains phrase vocabulary, translations, etiquette, taboos, foods, food spots, music styles, clothing styles, and Africa map availability points.

To add or update content, edit the matching list in `src/data/content.js` or `src/data/cultureGuides.js` and follow the existing examples. For the backend, run `cd backend && npm run seed` after updating the Prisma database.

## Where The Images Live

Local images and logos are in:

```text
public/
```

Important assets include:

- `public/hero-grand-bassam.jpg`
- `public/logo-light.jpeg`
- `public/logo-dark.jpeg`
- `public/logo-mark-light.png`
- `public/logo-mark-dark.png`

Some content images are loaded from external URLs inside `src/data/content.js`.
The frontend normalizes unstable Wikimedia image URLs to `public/hero-grand-bassam.jpg` so Docker/staging demos do not break when external images fail to load. Replace the fallback with curated local assets before a polished public launch.

## Environment Variables

The frontend does not require environment variables to run with bundled data. Optional frontend variable:

```bash
VITE_API_URL=http://localhost:5000/api
```

For Docker or hosted production, prefer runtime configuration:

```bash
TRIBE_TRIP_API_URL=/api
```

The backend requires a `.env` file copied from `backend/.env.example`, especially:

```bash
DATABASE_URL="file:../dev.db"
JWT_SECRET=change_this_to_a_long_random_secret_string
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173
TRUST_PROXY=0
LOG_REQUESTS=false
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_API_MAX=500
RATE_LIMIT_AUTH_MAX=30
RATE_LIMIT_LOCAL_SECRETS_MAX=60
MEDIA_STORAGE_PROVIDER=local
```

Production media uploads can use Cloudinary:

```bash
MEDIA_STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=tribe-trip
```

## Deployment Readiness

Use staging first. This project is ready for a controlled staging/demo deployment when this command passes:

```bash
npm run predeploy:staging
```

The staging gate checks frontend lint/build, backend syntax/schema/tests, Docker config, runtime frontend config, service worker API caching rules, and production guardrails.

For a real public production launch, this command must pass:

```bash
npm run predeploy:production
```

It currently fails on purpose while Prisma uses SQLite. Before market production, complete these items:

- Move from SQLite to a managed production database with backups.
- Update `backend/prisma/schema.prisma` datasource provider and production `DATABASE_URL` together.
- Set a unique production `JWT_SECRET` with at least 32 characters.
- Set `FRONTEND_URLS` to the final HTTPS frontend domain.
- Configure durable media storage, preferably Cloudinary for the current code path.
- Add final domain, HTTPS, and deployment platform health checks.
- Create real admin accounts after deploy; do not use the local test passwords in production.

Suggested staging order:

1. Run `npm run predeploy:staging` locally.
2. Build and start Docker with `docker compose --env-file .env up --build`.
3. Check `/api/ready` through the public frontend URL.
4. Sign in as admin and verify the editorial dashboard.
5. Create a normal user from Profile and verify saved items.
6. Share the staging URL with the team.

## Before Sharing Code Changes

Developers should run these commands before pushing changes or opening a pull request:

```bash
npm run lint
npm run build
cd backend && npm run check
```

This checks that the code has no common lint errors and that the production build still works.

## Common Problems

- `git` is not recognized: install Git and reopen your terminal.
- `node` or `npm` is not recognized: install Node.js and reopen your terminal.
- `npm ci` fails: check that your Node.js version is compatible.
- The app does not open on `5173`: use the exact URL shown in the terminal.
- Favorites or theme look stuck: clear the browser local storage for the local site.
- An image does not load: check if the image path in `public/` or the external URL in `src/data/content.js` is correct.
