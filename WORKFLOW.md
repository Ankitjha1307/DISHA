# DISHA — Citizen and Officer Workflow

This document describes the workflow implemented in the current DISHA project. It
covers what a citizen and an officer see after onboarding, which actions each role
can perform, and which records and fields are visible to each role.

DISHA is a B.Tech 5th-semester academic prototype. It does not contact emergency
services, dispatch real vehicles, track live resources or guarantee assistance. All
incidents, resources and deployments described here are simulated demo data.

## 1. Roles and onboarding

DISHA has exactly two roles: `citizen` and `officer`. The server enforces the role
on every protected API request; hiding navigation links is only a user-experience
convenience.

### Public entry points

| Route | What it is for |
| --- | --- |
| `/` | Public landing page with the product explanation, safety callout and entry points. |
| `/explore` | Public walkthrough of the reporting and preparedness workflow. |
| `/safety` | Preparedness guidance and emergency contact information with source attribution. |
| `/login` | Sign-in page for citizens and the seeded officer. |
| `/register` | Citizen registration only. |
| `/report` | Redirects to `/report-incident`. |

### Citizen onboarding

1. The citizen opens `/register`.
2. The form collects full name, email, password and password confirmation.
3. `POST /api/auth/register` validates the input, normalizes the email, hashes the
   password with bcryptjs and creates a user with the `citizen` role.
4. The server sets the HTTP-only `disha_token` cookie and returns the signed-in user.
5. The frontend redirects the citizen to `/dashboard`.

A citizen cannot choose or promote themselves to the `officer` role through public
registration.

### Officer onboarding

1. The officer account is created by the controlled seed script, not by public
   registration.
2. The officer signs in at `/login` using the configured seed credentials.
3. `POST /api/auth/login` validates the credentials and returns the database role.
4. The frontend redirects the officer to `/officer/dashboard`.

The seeded officer is a demonstration account. Production or public demo
credentials should never be committed or published.

### Session and logout

- Authentication uses a signed 7-day JWT in the HTTP-only `disha_token` cookie.
- The browser sends the cookie with credentialed API requests.
- `GET /api/auth/me` restores the session on page load.
- Logout calls `POST /api/auth/logout`, clears the cookie and returns the user to
  `/login`.
- Client route guards redirect signed-out users to `/login` and keep each role in
  its own area, but the backend remains the security boundary.

## 2. Citizen experience after login

### 2.1 Citizen navigation

The citizen sidebar contains:

- Overview
- Report an incident
- My reports
- Safety guidance

The header shows the citizen role, the demo geography, the signed-in name, the
theme toggle, sign-out and a link back to the public site.

### 2.2 Citizen dashboard — `/dashboard`

The dashboard calls `GET /api/incidents/my` and calculates all counts from the
signed-in citizen's own records.

The citizen sees:

- A personalized greeting.
- A prominent **Report an incident** action.
- **Total reports** — every report submitted from this account.
- **Awaiting review** — reports in `submitted` or `under_review`.
- **In progress** — reports in `verified` or `dispatched`.
- **Resolved** — reports in `resolved`.
- Up to four recent reports with category, status, location, report ID and
  submission time.
- A first-use empty state when the account has no reports.
- Emergency-contact shortcuts and the reminder that DISHA does not place calls or
  dispatch help.

The dashboard does not show district-wide officer KPIs, resource availability or
other citizens' reports.

### 2.3 Reporting an incident — `/report-incident`

The form collects:

- **Category**: fire, road accident, flooding/waterlogging, building damage,
  medical emergency or other.
- **Description**: 10 to 2,000 characters.
- **Location label**: 3 to 240 characters, such as a landmark or address.
- **Optional coordinates**: the citizen may explicitly press **Capture location**
  to request browser geolocation, or enter latitude and longitude manually.
  Latitude and longitude must be supplied together or both left blank.
- **Optional image**: JPEG, PNG or WebP, maximum 5 MB, with preview and
  remove/change controls.

On submission:

1. The browser sends multipart form data to `POST /api/incidents`.
2. The server authenticates the cookie and requires the `citizen` role.
3. The server validates the fields again. Client-side validation is not trusted.
4. The uploaded image is checked by MIME type, size and magic bytes.
5. If Cloudinary is configured, the image is uploaded to the `disha/incidents`
   folder and only the secure URL is saved in MongoDB. Otherwise the image is
   stored on local disk and served from `/uploads`.
6. The server takes `reporterId` from the authenticated session, never from the
   request body.
7. The report is created with status `submitted`, the current year and a
   collision-safe report ID such as `DSH-2026-0001`.
8. The citizen sees a confirmation card with the report ID, current status and
   links to the detail page or another report.

If image persistence or incident creation fails, the uploaded image is cleaned up.

### 2.4 My Reports — `/my-reports`

`GET /api/incidents/my` returns only reports whose `reporterId` matches the
signed-in citizen. The page provides:

- Search by report ID, location or category label.
- Category filter.
- Status filter.
- A clear-filters action.
- Loading skeletons, an error state with retry and empty states for both
  "no reports yet" and "no matches".
- Report cards showing category, status, location, report ID and submission time.

### 2.5 Report detail — `/my-reports/[id]`

`GET /api/incidents/my/:id` applies both the report ID and the signed-in citizen's
ID in the database query. A citizen cannot read another citizen's report by
changing the URL.

The citizen sees:

- Report ID, category, status and officer-assigned severity, if one exists.
- The description and location they submitted.
- Coordinates when they provided them.
- Submission and last-updated timestamps.
- The optional evidence image.
- A status timeline for `submitted`, `under_review`, `verified`, `dispatched` and
  `resolved`.
- A clear rejected state when the report is rejected.

The citizen does not see internal `officerNotes`, deployment notes or other
citizens' records.

### 2.6 Safety guidance — `/safety`

The citizen can open a public safety page containing:

- Emergency contact numbers and descriptions.
- Category-specific do's and don'ts for fire, road accidents, flooding, building
  damage, medical emergencies and other incidents.
- Guidance on calling emergency services first when there is immediate danger.
- A household preparedness checklist.
- Source attribution and a reminder that numbers and guidance can change.

This page is informational. It does not place calls or connect to an emergency
service.

## 3. Officer experience after login

### 3.1 Officer navigation

The officer sidebar contains:

- Overview
- Incident queue
- Incident map
- Resources
- Deployments

The header identifies the officer role and the demo environment. The officer does
not see citizen navigation or public registration controls.

### 3.2 Officer dashboard — `/officer/dashboard`

`GET /api/officer/dashboard` calculates KPIs from MongoDB:

- **Active incidents** — `submitted`, `under_review`, `verified` or `dispatched`.
- **Awaiting verification** — `submitted` or `under_review`.
- **High priority** — active incidents with `high` or `critical` severity.
- **Available resources** — demo resources currently marked `available`.

The dashboard also shows up to six recent active incidents with report ID,
category, location, submission time, severity, status and a review/view action.
Quick links open the map, resource inventory and deployments pages.

All counts are API-derived. The page clearly labels resource availability as
seeded demonstration data.

### 3.3 Incident queue — `/officer/incidents`

`GET /api/officer/incidents` returns up to 200 reports, newest first. The officer
can:

- Search by report ID, location or category label.
- Filter by status.
- Use the **Awaiting review** status shortcut.
- Filter by category.
- Filter by officer-assigned severity.
- Clear all filters.

The page handles loading, error and empty states. The queue is operational data;
it is not a public incident feed.

### 3.4 Incident detail — `/officer/incidents/[id]`

`GET /api/officer/incidents/:id` returns the report and its active deployment, if
any.

The officer sees:

- Report ID, category, status and severity.
- The citizen-provided description, location and coordinates.
- Submission and last-updated timestamps.
- The optional evidence image.
- The active demo deployment, when one exists.
- Internal officer notes.
- Audit details.

The officer can:

1. **Begin review** — `submitted` to `under_review`.
2. **Set or update operational severity** — `low`, `medium`, `high` or `critical`.
   Severity is officer-assigned and is not accepted from the citizen.
3. **Verify** — `under_review` to `verified`. This is the step that enables
   resource recommendations.
4. **Reject** — `submitted` or `under_review` to `rejected`, with optional internal
   notes.
5. **Open a report that is already beyond review** to inspect its current state.

Invalid transitions are rejected by backend services with a conflict response.
Severity cannot be changed after a report is rejected. Citizens cannot call these
endpoints.

### 3.5 Incident map — `/officer/map`

The officer map uses Leaflet and OpenStreetMap tiles and displays:

- Reports in `verified`, `dispatched` or `resolved` status that have coordinates.
- Seeded resource base locations.
- A legend for report status and resource availability.
- Marker details and lists below the map as a fallback if tiles or the map fail.

The map is explicitly labelled as simulated geography. Resource markers are base
locations, not live vehicle positions. There is no road routing, ETA or live
tracking.

Coordinates are available only through authenticated officer endpoints. Citizens
see only their own report locations; public pages do not expose other citizens'
precise locations.

### 3.6 Resource inventory — `/officer/resources`

`GET /api/officer/resources` returns the seeded demo inventory. Each resource
shows:

- Resource code and name.
- Type: ambulance, fire unit, rescue team or shelter.
- Supported incident categories.
- Base location and coordinates.
- Availability: `available`, `deployed` or `unavailable`.
- Last update time.

The officer may manually set a resource to `available` or `unavailable` through
`PATCH /api/officer/resources/:id/availability`. A resource with an active
deployment cannot be changed manually; `deployed` is managed by the deployment
workflow. Availability is an academic demo state, not live fleet data.

### 3.7 Resource recommendations

Recommendations are available only for a `verified` incident through
`GET /api/officer/incidents/:id/recommendations`.

The backend:

1. Keeps only resources with `availability = available`.
2. Keeps only resources whose capabilities include the incident category.
3. Calculates straight-line Haversine distance when both the incident and the
   resource base have coordinates.
4. Sorts results by distance ascending, with resource code as a deterministic
   tie-breaker.
5. Returns the resource details, distance when available and a short explanation.

The officer sees the eligible resources, their base locations, distances and
explanations. If the incident has no coordinates, the API says proximity ranking is
unavailable and returns eligible resources without inventing distances. If no
eligible resource exists, the UI shows a clear empty state.

Distances are straight-line estimates. They are not road distances, travel times
or live availability.

### 3.8 Confirming a deployment

The officer chooses a recommended resource and explicitly confirms the deployment
through `POST /api/officer/incidents/:id/deployments`.

Before creating the deployment, the backend re-checks that:

- The report is still `verified`.
- The resource is still `available`.
- The resource supports the incident category.

The backend then:

- Marks the resource `deployed`.
- Creates a deployment with status `assigned`.
- Sets the incident to `dispatched`.
- Records the assigning officer from the authenticated session.

A unique partial index prevents one resource from being assigned to two active
deployments. The operation is also guarded against concurrent changes so the
incident, resource and deployment remain consistent.

### 3.9 Deployments — `/officer/deployments`

`GET /api/officer/deployments` lists up to 200 deployments, newest first. Active
deployments are separated from past deployments. Each record shows the report,
resource, status, notes and timestamps.

The officer can update an active deployment through
`PATCH /api/officer/deployments/:id`:

- **Complete** — deployment becomes `completed`, incident becomes `resolved`, and
  the resource returns to `available`.
- **Cancel** — deployment becomes `cancelled`, incident returns to `verified`, and
  the resource returns to `available`.

Either action may include a short internal note. The citizen sees the resulting
public incident status, not internal deployment notes.

## 4. End-to-end example

1. A citizen registers and lands on `/dashboard`.
2. The citizen reports a fire near a known landmark, captures coordinates and
   optionally attaches a photo.
3. The report is stored with a `DSH-YYYY-NNNN` ID and status `submitted`.
4. The citizen sees the report in `/my-reports` and opens its detail page.
5. The officer signs in with the seeded account and sees the report in
   `/officer/incidents`.
6. The officer opens review, sets severity and verifies the report.
7. The verified report appears on `/officer/map`.
8. The officer opens recommendations and sees available fire units ranked by
   straight-line distance.
9. The officer confirms one resource.
10. The resource becomes `deployed`, the deployment becomes `assigned` and the
    report becomes `dispatched`.
11. The citizen sees the updated `dispatched` status on their report.
12. The officer marks the deployment complete.
13. The report becomes `resolved`, the resource becomes `available` and the citizen
    sees the resolved status.

## 5. Status lifecycle

| Status | Set by | Meaning |
| --- | --- | --- |
| `submitted` | Citizen creation | The report was saved and is waiting for officer review. |
| `under_review` | Officer | An officer started reviewing the report. |
| `verified` | Officer | The report is accepted for a demo response. |
| `dispatched` | Officer deployment confirmation | A demo resource is assigned. |
| `resolved` | Officer completes deployment | The demo incident is marked addressed. |
| `rejected` | Officer | The report was not accepted for the demo workflow. |

Allowed transitions:

- `submitted` -> `under_review`
- `under_review` -> `verified`
- `submitted` or `under_review` -> `rejected`
- `verified` -> `dispatched`
- `dispatched` -> `resolved` when the deployment is completed
- `dispatched` -> `verified` when the deployment is cancelled

There is no generic unrestricted status-update endpoint.

## 6. Data visibility

| Data | Citizen | Officer | Public visitor |
| --- | --- | --- | --- |
| Own report details and image | Yes | Yes, for all reports | No |
| Another citizen's report | No | Yes, for response work | No |
| Exact report coordinates | Own reports only | Yes, when provided | No |
| Internal officer notes | No | Yes | No |
| Severity | Yes, as a badge on own report | Yes, can set it | No |
| Resource inventory and availability | No | Yes | No |
| Deployment records and notes | No | Yes | No |
| Personal dashboard counts | Own records only | No | No |
| Officer KPIs | No | Yes | No |
| Safety guidance and emergency numbers | Yes | Yes | Yes |

## 7. Error, empty and loading states

The implemented pages include:

- Loading skeletons or status indicators while API data loads.
- Retry actions when a request fails.
- Empty states for new citizens, empty queues, no filtered results, no mapped
  incidents, no available resources and no deployments.
- Inline validation and API error messages on forms.
- Disabled and busy states while submitting decisions or deployments.
- Clear success toasts after report submission, officer decisions and deployment
  updates.

## 8. Route reference

### Public

- `/`
- `/explore`
- `/safety`
- `/login`
- `/register`
- `/report` (redirects to `/report-incident`)

### Citizen

- `/dashboard`
- `/report-incident`
- `/my-reports`
- `/my-reports/[id]`

### Officer

- `/officer/dashboard`
- `/officer/incidents`
- `/officer/incidents/[id]`
- `/officer/map`
- `/officer/resources`
- `/officer/deployments`

## 9. API reference used by the workflow

### Auth

- `POST /api/auth/register` — citizen only
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Citizen

- `POST /api/incidents` — create an owned report
- `GET /api/incidents/my` — own reports
- `GET /api/incidents/my/:id` — own report detail

### Officer

- `GET /api/officer/dashboard`
- `GET /api/officer/incidents`
- `GET /api/officer/incidents/:id`
- `PATCH /api/officer/incidents/:id/review`
- `PATCH /api/officer/incidents/:id/verify`
- `PATCH /api/officer/incidents/:id/reject`
- `PATCH /api/officer/incidents/:id/severity`
- `GET /api/officer/incidents/:id/recommendations`
- `POST /api/officer/incidents/:id/deployments`
- `GET /api/officer/resources`
- `PATCH /api/officer/resources/:id/availability`
- `GET /api/officer/deployments`
- `PATCH /api/officer/deployments/:id`

## 10. Demo boundaries

- No emergency-service notification, call placement or authority integration.
- No automatic dispatch or autonomous decision-making.
- No AI/ML prediction, damage detection or severity prediction.
- No road routing, travel time or live vehicle tracking.
- No live inventory; resources and availability are seeded demo records.
- No public officer registration or role self-promotion.
- No citizen access to another citizen's report or to officer-only data.
- No claim that a deployment represents a real emergency response.

For setup, environment variables, testing and deployment notes, see
[`README.md`](README.md). For the product specification and implementation rules,
see [`AGENTS.md`](AGENTS.md).
