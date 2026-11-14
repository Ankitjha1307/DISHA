# DISHA — Disaster Intelligence System for Humanitarian Assistance

DISHA is a B.Tech 5th-semester academic mini-project that demonstrates a limited
citizen-to-officer incident reporting and response-coordination workflow for a
simulated Greater Noida environment.

A citizen registers, reports an incident with a category, description, location
and optional photo, and tracks the report. An officer reviews the report, verifies
or rejects it, assigns a severity, sees verified incidents on a map, receives
explainable demo-resource recommendations, and manually confirms a deployment.

> **Important:** DISHA is a decision-support prototype. It is not an emergency
> dispatch service, does not contact authorities, does not dispatch real vehicles,
> and does not guarantee assistance. Call **112** (or the appropriate local
> number) in a real emergency. All incidents, resources and deployments are
> simulated demo data.

## Repository layout

```text
disha/
├── frontend/                 Next.js 16 App Router frontend
│   ├── src/app/              Public, citizen and officer routes
│   ├── src/components/       UI, landing, citizen, officer and shared components
│   ├── src/lib/              Typed API client, formatting and helpers
│   └── src/types/            Shared TypeScript types
├── server/                   Express 5 + TypeScript REST API
│   ├── src/config/           Environment, database and upload configuration
│   ├── src/middleware/       Auth, RBAC, validation, uploads, rate limits, CSRF origin check
│   ├── src/models/           Mongoose models
│   ├── src/routes/           Auth, citizen incident and officer routes
│   ├── src/services/         Business logic, recommendations and deployments
│   ├── src/utils/            Haversine distance, auth tokens and helpers
│   └── src/app.test.ts       Backend integration tests
├── WORKFLOW.md               Current citizen and officer journey after onboarding
├── AGENTS.md                 Product specification and implementation guide
└── README.md
```

## Stack

- **Frontend:** Next.js 16.3.4 (App Router), React 19.2.8, TypeScript, Tailwind
  CSS 4, shadcn/ui (radix-nova), lucide-react, next-themes, sonner, Leaflet and
  react-leaflet.
- **Backend:** Node.js, Express 5, TypeScript, MongoDB, Mongoose, Zod, bcryptjs,
  JWT in an HTTP-only cookie, Helmet, CORS, express-rate-limit, multer and
  Cloudinary image hosting with a local-disk fallback.
- **Maps:** OpenStreetMap tiles through Leaflet. Distances are straight-line
  Haversine estimates, never road distance or travel time.

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB (local or Atlas), **or** the development-only in-memory database for
  local demos

## Local setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and set at least:

```dotenv
NODE_ENV=development
PORT=5000
JWT_SECRET=<a long random value, at least 32 characters>
CLIENT_ORIGIN=http://localhost:3000
OFFICER_SEED_EMAIL=officer@disha.demo
OFFICER_SEED_PASSWORD=<your own development-only password>
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then choose one database option:

```bash
# Option A: MongoDB Atlas or a local MongoDB (set MONGODB_URI in .env)
npm run seed
npm run dev

# Option B: no local MongoDB — development-only in-memory database
# Data is lost when the server stops.
npm run dev:memory
```

For Atlas:

```dotenv
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/disha?retryWrites=true&w=majority
USE_MEMORY_DB=false
SEED_ON_START=false
```

- Add your current IP address to the Atlas network-access list.
- Run `npm run seed` once to create the officer account and demo resources.
- Run `npm run db:check` at any time to confirm the connection and collection
  counts without printing the connection string.
- The seed script updates resource details but preserves existing resource
  availability and an existing officer password, so re-running it does not reset
  an active demo deployment or a changed password.

`npm run dev:memory` starts MongoDB in memory and seeds the officer account and
demo resources automatically. The API listens on `http://localhost:5000`.
`GET /api/health` returns the health status.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

```dotenv
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Only `NEXT_PUBLIC_*` values are exposed to the browser. Never put database
credentials, JWT secrets or Cloudinary secrets in the frontend.

### 3. Demo accounts

- **Officer:** use the `OFFICER_SEED_EMAIL` and `OFFICER_SEED_PASSWORD` values
  from `server/.env`. The seed script creates the account; there is no public
  officer registration.
- **Citizen:** create an account through `/register`.

The example values in `server/.env.example` are placeholders, not committed
credentials. Do not commit a real `.env` or a production password.

## Environment variables

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Recommended | Base URL of the Express API. Defaults to `http://localhost:5000` if omitted. No trailing slash. |

### Backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | No | `development`, `test` or `production`. Defaults to `development`. |
| `PORT` | No | API port. Defaults to `5000`. |
| `MONGODB_URI` | Yes unless `USE_MEMORY_DB=true` | MongoDB connection string. |
| `JWT_SECRET` | Yes | JWT signing secret, at least 32 characters. |
| `CLIENT_ORIGIN` | Yes | Exact frontend origin allowed for credentialed CORS and Origin checks. |
| `OFFICER_SEED_EMAIL` | Yes for seeding | Development/demo officer email. |
| `OFFICER_SEED_PASSWORD` | Yes for seeding | Development/demo officer password, minimum 8 characters. |
| `USE_MEMORY_DB` | No | Development-only in-memory MongoDB. Rejected in production. |
| `SEED_ON_START` | No | Seed the officer and demo resources on server start. |
| `UPLOAD_DIR` | No | Local fallback directory for uploaded images. Defaults to `server/uploads`. |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name. Set with the other two Cloudinary values to enable hosted image storage. |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret. Keep this server-side; never expose it through `NEXT_PUBLIC_*`. |

Environment variables are validated at startup. Missing or invalid required
values stop the server with a readable error.

## Core workflow

For the full screen-by-screen citizen and officer journey, see
[`WORKFLOW.md`](WORKFLOW.md).

Canonical incident statuses:

1. `submitted` — citizen submitted the report.
2. `under_review` — officer started reviewing it.
3. `verified` — officer accepted it for a demo response.
4. `dispatched` — officer confirmed a demo resource deployment.
5. `resolved` — officer marked the incident addressed.
6. `rejected` — officer rejected the report.

Allowed transitions are enforced in backend services. Citizens can only create
reports and read their own reports. Officer-only operations require the
`officer` role on the server.

Completing a deployment sets the incident to `resolved` and frees the resource.
Cancelling an active deployment sets the incident back to `verified` and frees
the resource. A resource cannot be assigned to two active deployments.

## Resource recommendations

For a verified incident, the backend:

1. Keeps only resources with `availability = available`.
2. Keeps only resources whose capabilities include the incident category.
3. Calculates straight-line distance with Haversine when incident coordinates
   exist.
4. Ranks eligible resources by straight-line distance, then resource code as a
   deterministic tie-breaker.
5. Returns a ranked list with distance and a short explanation.
6. Requires the officer to confirm a deployment; availability is re-checked at
   confirmation time.

If the incident has no coordinates, proximity ranking is unavailable and the
message is explicit. If no eligible resource exists, the API returns a clear
empty state. Distances are not road distances, ETAs or live availability.

## API summary

### Public and auth

- `GET /api/health`
- `POST /api/auth/register` — citizen only
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Citizen (authenticated citizen, own records only)

- `POST /api/incidents`
- `GET /api/incidents/my`
- `GET /api/incidents/my/:id`

### Officer (authenticated officer)

- `GET /api/officer/dashboard`
- `GET /api/officer/incidents`
- `GET /api/officer/incidents/:id`
- `PATCH /api/officer/incidents/:id/review`
- `PATCH /api/officer/incidents/:id/verify`
- `PATCH /api/officer/incidents/:id/reject`
- `PATCH /api/officer/incidents/:id/severity`
- `GET /api/officer/resources`
- `PATCH /api/officer/resources/:id/availability`
- `GET /api/officer/incidents/:id/recommendations`
- `POST /api/officer/incidents/:id/deployments`
- `GET /api/officer/deployments`
- `PATCH /api/officer/deployments/:id`

## Frontend routes

Public:

- `/`
- `/explore`
- `/safety`
- `/login`
- `/register`
- `/report` (redirects to `/report-incident`)

Citizen:

- `/dashboard`
- `/report-incident`
- `/my-reports`
- `/my-reports/[id]`

Officer:

- `/officer/dashboard`
- `/officer/incidents`
- `/officer/incidents/[id]`
- `/officer/map`
- `/officer/resources`
- `/officer/deployments`

Client route guards improve navigation but are not the security boundary. Every
protected API endpoint authenticates the request and enforces the role and record
ownership on the server.

## Safety and emergency information

`/safety` contains category-specific preparedness guidance and emergency
contact numbers verified against authoritative sources on **14 November 2026**:

- Uttar Pradesh Police, UP-112 — Emergency Contact Information:
  <https://112.up.gov.in/emergencycontactinformation>
- National Disaster Management Authority — Do's and Don'ts:
  <https://ndma.gov.in/>
- NDMA — Pocketbook of Do's and Don'ts:
  <https://ndma.gov.in/sites/default/files/PDF/pocketbook-do-dont.pdf>

Phone numbers can change. Confirm local availability before relying on them.
DISHA does not place calls, contact authorities or monitor a live emergency
channel.

## Uploaded images

- Accepted types: JPEG, PNG and WebP.
- Maximum size: 5 MB.
- File type is checked from magic bytes, not the filename extension.
- When `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and
  `CLOUDINARY_API_SECRET` are all set, photos are uploaded to the
  `disha/incidents` Cloudinary folder and the returned secure URL is stored in
  MongoDB.
- If Cloudinary is not configured, images fall back to `server/uploads` (or
  `UPLOAD_DIR`) and are served from `/uploads`.
- The database stores only the image URL, not the image binary.
- Local disk storage is not durable across redeploys on platforms with ephemeral
  filesystems. Cloudinary is recommended for deployed demos.

## Tests and checks

Backend:

```bash
cd server
npm test          # integration tests using mongodb-memory-server
npm run typecheck
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

The backend tests cover registration/login, RBAC, ownership checks, incident
validation, review/verify/reject transitions, ownership isolation, resource
filtering, recommendation fallback, deployment creation, duplicate-assignment
prevention and completion/cancellation consistency.

## Deployment notes

Target topology (only when credentials and approval are available):

- **Frontend:** Vercel
- **API:** Render
- **Database:** MongoDB Atlas
- **Images:** Cloudinary when all three Cloudinary variables are set; local disk
  otherwise

### Render API

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Set `NODE_ENV=production`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`
  and the officer seed values.
- Set `CLIENT_ORIGIN` to the exact Vercel URL, for example
  `https://your-disha-app.vercel.app`.
- `USE_MEMORY_DB` must be `false` in production.
- Run the seed script once against Atlas if the officer account or resources are
  missing: `npm run seed`.

### Vercel frontend

- Set `NEXT_PUBLIC_API_URL` to the Render API URL, without a trailing slash.
- Redeploy after changing the variable.

### Cookies and CORS

The auth cookie is `disha_token`:

- `HttpOnly`, `path=/`, 7-day expiry.
- Development: `SameSite=Lax`, `Secure=false`.
- Production: `SameSite=None`, `Secure=true` for a cross-site Vercel + Render
  deployment.
- CORS uses the exact `CLIENT_ORIGIN` with credentials enabled, never `*`.

Cross-site cookies require HTTPS on both sites. If the frontend and API are
served from the same site, a same-site deployment avoids third-party cookie
restrictions.

State-changing requests are checked against `CLIENT_ORIGIN` when a browser sends
an `Origin` header. Requests without an `Origin` header (for example curl) are
allowed through the origin check, but protected routes still require a valid
session cookie. This is basic CSRF hardening, not a complete CSRF-token system.

## Known limitations

- Academic prototype with simulated Greater Noida data.
- No AI/ML prediction, satellite imagery, live feeds or automated dispatch.
- No road routing, travel time or live vehicle tracking.
- No real emergency-service integration or guarantee of response.
- Without Cloudinary configured, local image storage is not durable across
  ephemeral production filesystems.
- Demo correspondence and resource availability are not live information.
