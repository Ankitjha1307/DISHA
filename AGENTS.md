This file is the working product specification and implementation guide for DISHA. Read it before making changes. Inspect the current repository before editing. Keep the project at a realistic 5th-semester engineering mini-project scope; do not silently expand it into a production emergency-management platform.

1. Project identity and purpose
- Name: DISHA — Disaster Intelligence System for Humanitarian Assistance.
- Type: B.Tech 5th-semester mini/minor project.
- Demo geography: Greater Noida, Uttar Pradesh (simulated environment).
- Users: Citizens and authorized response officers.
- Purpose: Demonstrate a complete but limited citizen-to-officer incident reporting and response-coordination workflow.
A citizen submits an incident with category, description, location and optional photo. An officer reviews and verifies or rejects it. Verified incidents appear on an officer map. DISHA recommends eligible available demo resources using simple explainable rules. The officer manually confirms a deployment and updates the incident. The citizen can track the report.

DISHA is an academic decision-support prototype, not an emergency dispatch service. It does not contact authorities, automatically dispatch real vehicles, guarantee assistance or replace official emergency channels. Clearly label simulated data and workflows.
2. Mini-project scope
Required
1. Public landing page.
2. Citizen registration, login and logout.
3. Officer login using a pre-created/seeded officer account; no public officer registration.
4. Server-enforced authentication and role-based access control (RBAC).
5. Citizen dashboard.
6. Incident reporting with validation, optional image and location capture/manual fallback.
7. Persistent incident records in MongoDB.
8. Citizen My Reports and report details, restricted to the signed-in citizen's records.
9. Officer dashboard with operational KPIs and pending incident queue.
10. Officer review, verification and rejection.
11. Officer incident map using demo geography.
12. Small resource inventory with type, capabilities, location and availability.
13. Explainable, rule-based recommendations for a verified incident.
14. Officer-controlled deployment confirmation and status updates.
15. Citizen-visible report status tracking.
16. Basic safety guidance and emergency contact information verified from authoritative sources before being called official.
17. Responsive UI, light theme by default, dark theme support, accessible forms, loading/error/empty states.
Explicitly out of scope
Do not implement unless the user explicitly changes scope:
- AI/ML disaster prediction, damage detection or severity prediction.
- Satellite imagery, remote sensing, drones or computer vision.
- Live emergency feeds, government-system integrations or real emergency-service notifications.
- Automatic dispatch or autonomous decisions.
- Real-time ambulance/personnel GPS tracking.
- Road routing, shortest-path solvers or OR-Tools.
- Microservices, Kubernetes, Redis, Kafka or event streaming.
- Complex organization hierarchies or elaborate permission engines.
- Chat, social feeds, call-centre systems or payments.
- Production-grade high-availability infrastructure or compliance claims.
- Analytics beyond useful counts and simple charts.
Prefer one reliable end-to-end vertical slice over many incomplete features.
3. Roles and permissions
There are exactly two roles: citizen and officer.
Citizen may
- Register, log in and log out.
- View the citizen dashboard.
- Submit incident reports with optional image and location.
- View only their own reports and report details.
- Track officer-updated status.
- Access safety guidance and emergency information.
- Edit only explicitly supported profile fields, if implemented.
Citizen may not view all reports, access officer pages, verify/reject incidents, manage resources, confirm deployments or change their own role.
Officer may
- Log in using a seeded/pre-created account.
- View the officer dashboard and incident queue.
- Review incident details and evidence.
- Verify or reject reports.
- Set/update operational severity and permitted statuses.
- View incidents on the officer map.
- View/update demo resource availability.
- Request and inspect resource recommendations.
- Manually confirm/cancel deployments and update incident progress.
Officer accounts must not be created through public registration. Do not implement self-service role promotion.
Backend-enforced RBAC is mandatory
Hiding UI links is not security. Every protected API endpoint must authenticate the user and enforce the role on the server. Enforce record ownership so a citizen cannot read another citizen's incident by changing an ID.

Use simple middleware:
- authenticate: validate session/token and attach trusted user identity and role.
- authorize("officer"): protect officer-only endpoints.
- Ownership checks: citizen reads are restricted to their own records.
Never trust a browser-supplied role, user ID, reporter ID, status, severity or deployment decision where the server must determine it.
4. Explicit technology stack
Use the following stack unless the user explicitly approves a change. Inspect existing dependencies first; do not install everything in one step.
Frontend
- Next.js 16.3.4 — App Router.
- React 19.2.8 and React DOM 19.2.8.
- TypeScript ^5.
- Tailwind CSS ^4 with @tailwindcss/postcss.
- shadcn/ui, existing radix-nova style.
- Radix UI primitives via existing radix-ui.
- lucide-react for icons.
- next-themes for light/dark theme.
- sonner for toast notifications.
- class-variance-authority, existing cn utility/package and tw-animate-css.
- Zod for client/shared validation where useful; server validation remains authoritative.
- React Hook Form is optional; use only if form complexity justifies it.
Backend
- Node.js runtime.
- Express.js REST API.
- TypeScript.
- MongoDB database.
- Mongoose ODM.
- Zod request validation.
- bcryptjs (or bcrypt if environment compatibility is confirmed) for password hashing.
- jsonwebtoken if using JWT-based sessions.
- cookie-parser for auth cookies.
- cors with exact configured frontend origin and credentials.
- helmet for HTTP security headers.
- express-rate-limit for login/register and other sensitive endpoints.
- multer for multipart image uploads when needed.
- Cloudinary optional for hosted image storage. Do not store large image binaries in MongoDB.
Maps and geospatial utilities
- Leaflet and react-leaflet for interactive maps.
- OpenStreetMap tiles, subject to provider usage policy.
- Haversine distance calculation for straight-line distance estimates. Implement a small tested utility; do not add a routing engine.
- Never present straight-line distance as road distance or travel time.
Development/deployment
- npm (unless the repository already uses another package manager).
- ESLint.
- Git/GitHub.
- Vercel for Next.js frontend.
- Render for Express API.
- MongoDB Atlas for hosted MongoDB.
- Cloudinary optional for image storage.
Confirm compatibility with current Next.js/React versions before installing packages. Prefer existing dependencies and small additions.
5. Repository architecture
Do not recreate the existing Next.js app. Suggested organization:
disha/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── landing/
│   │   ├── citizen/
│   │   ├── officer/
│   │   └── shared/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── server/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── validators/
│       ├── utils/
│       └── app.ts
├── public/
├── .env.example
├── package.json
└── AGENTS.md
This is guidance, not permission to move existing files unnecessarily. First inspect whether the app uses src/app or app; follow actual conventions. Keep the backend in a simple server/ directory if appropriate. Do not introduce a complicated monorepo toolchain.
Frontend/backend boundary
- Browser calls Express through a small typed API client.
- Use one API base URL, e.g. NEXT_PUBLIC_API_URL.
- Never put DB credentials, JWT secrets, Cloudinary secrets or private config in NEXT_PUBLIC_*.
- Configure CORS for the exact frontend origin, not *, when using credentialed cookies.
- Keep API error responses consistent.
- Backend is authoritative for authorization, ownership, status transitions and deployments.
6. Authentication and session security
- Citizen registration requires name, email and password.
- Normalize email and enforce a unique index.
- Hash passwords with bcrypt/bcryptjs. Never store plaintext passwords.
- Officer accounts are created through a seed script or controlled development process, not public registration.
- Login validates credentials server-side.
- Use a signed JWT in an HTTP-only cookie, Secure in production, with appropriate SameSite/domain/path settings. Do not store auth tokens in localStorage.
- Logout clears the cookie.
- Add rate limiting to authentication routes.
- Do not log passwords, tokens, cookies or secrets.
- Validate required environment variables at server startup.
- Seed officer credentials through environment variables or a seed script. Never commit a real password. Document local demo setup with placeholders or development-only credentials.
- For cross-site cookie deployment, document SameSite=None; Secure and CSRF implications. Prefer a same-site deployment arrangement when feasible.
- For cookie-authenticated state-changing routes, implement an appropriate CSRF strategy; at minimum validate request Origin/Referer for browser requests where appropriate. Do not claim security controls that are not implemented.
7. Data models and lifecycle
Keep schemas small.
User
- name
- email (unique, normalized)
- passwordHash
- role: citizen | officer
- timestamps
Incident
- reportId — collision-safe human-readable ID, e.g. DSH-2026-0001.
- reporterId — User reference.
- category: fire | road_accident | flooding | building_damage | medical_emergency | other.
- description
- location: label/address plus latitude and longitude when available.
- imageUrl — optional.
- severity — officer-assigned/updated; never blindly trust citizen severity.
- status
- officerNotes — internal; do not expose to citizens.
- timestamps
Resource
- resourceCode or name.
- type: ambulance, fire unit, rescue team or shelter.
- capabilities: supported incident categories.
- location: latitude, longitude and base label.
- availability: available | deployed | unavailable.
- timestamps
Use a small seeded Greater Noida demo inventory. This is not a live fleet.
Deployment
- incidentId
- resourceId
- assignedBy (officer ID)
- status: assigned | completed | cancelled
- timestamps
- optional short notes
Prevent a resource from being assigned to multiple active deployments. Update resource availability and incident status consistently.
Canonical incident status
Use the same enum across backend, frontend, filters, badges and tests:
1. submitted — citizen submitted the report.
2. under_review — officer started reviewing.
3. verified — officer accepted it for response.
4. dispatched — officer confirmed a demo resource deployment.
5. resolved — officer marked the incident addressed.
6. rejected — officer rejected the report.
Allowed basic transitions:
- Citizen creates: submitted.
- Officer begins review: under_review.
- Officer verifies: verified.
- Officer confirms deployment: dispatched.
- Officer resolves: resolved.
- Officer rejects during review: rejected.
Enforce transitions in backend services. Citizens cannot set officer-only statuses. Do not expose an unrestricted status update endpoint. Define deliberate behavior for cancelled deployments so incident/resource states do not become inconsistent.
8. Resource recommendation logic
This is a core differentiator but must remain deterministic, explainable and small. It is not AI.

For a verified incident:
1. Find resources with availability = available.
2. Filter resources whose capabilities support the incident category.
3. Calculate straight-line distance from incident coordinates using Haversine.
4. Rank eligible resources by a transparent rule considering distance and capability match. Document the rule.
5. Return a small ranked list with distance and a concise explanation.
6. Let the officer choose and confirm.
Rules:
- If incident coordinates are missing, say proximity ranking is unavailable and list eligible resources without inventing distance.
- If no eligible resource is available, show a clear empty state.
- Never claim road ETA, route optimization or live availability.
- Officer must explicitly confirm deployment.
- Backend must re-check availability at confirmation time to prevent duplicate assignments.
- Keep recommendation logic in a backend service and unit-test it.
9. Citizen routes and experience
Citizen experience is the primary public-facing product: calm, simple and mobile-first.
Public /
- Real landing page, not a redirect to dashboard.
- DISHA branding/navigation.
- Strong hero headline such as “When every second matters.”
- Concise explanation of incident reporting and assistance awareness.
- Primary CTA to enter citizen portal; secondary CTA to explore features.
- Illustrative map/incident visual labelled as illustrative.
- Feature cards: report incidents, location awareness, track reports.
- Safety/preparedness callout and footer.
- Never present demo counts as live regional statistics.
Authentication
- /login
- /register for citizens only
- Clear validation and error messages.
- No public officer registration.
- After login, route according to server-verified role.
- Client route guards improve UX but are not the security boundary.
Citizen routes
- /dashboard
- /report-incident
- /my-reports
- /my-reports/[id] or equivalent detail view
- /safety
- /profile only if useful
Citizen dashboard:
- Greeting and short explanation.
- Prominent Report an Incident CTA.
- Personal report counts derived from API records.
- Recent personal reports with ID, category, location, date and status.
- Safety shortcuts.
- First-use empty state.
- Do not show district-wide officer KPIs or fleet availability.
Incident form
- Category selection.
- Description with client and server validation.
- Location: browser geolocation only after explicit action/permission; manual fallback.
- Optional image with preview, type/size validation and remove/change.
- Review/submit and loading/disabled feedback.
- Confirmation with generated report ID.
- Clearly explain that this prototype does not notify emergency services.
My Reports
- Only authenticated citizen's own records.
- Useful search/filter by category/status.
- Detail: ID, category, description, location, date, optional image and status.
- Do not expose internal officer notes.
- Dashboard counts must use the same underlying API data.
10. Officer routes and experience
Officer interface is a separate protected area, not the public landing page.

Suggested routes:
- /officer/dashboard
- /officer/incidents
- /officer/incidents/[id]
- /officer/map
- /officer/resources
- /officer/deployments
Officer dashboard
- Active incidents.
- Reports awaiting verification.
- High-priority incidents.
- Available demo resources.
- Recent incident queue.
- Small map preview if useful.
KPIs must be calculated from API data, not hardcoded.
Incident management
- List/table: report ID, category, location, submitted time, severity and status.
- Search/filter.
- Detail with description, evidence and coordinates.
- Verify/reject actions with confirmation and optional officer notes.
- Officer-set severity: low | medium | high | critical.
- Distinguish citizen-provided information from officer-assigned severity.
Map
- Leaflet/react-leaflet + OpenStreetMap tiles.
- Demo incident and resource markers.
- Legend and marker detail.
- Clearly label simulated data.
- Precise report coordinates may be available to authorized officers; never expose other citizens' precise report locations on a public map.
- Provide a list/fallback if map or tiles fail.
- Do not call a static screenshot an interactive map.
Resources and deployment
- List seeded resources, type, base location, capabilities and availability.
- Officer may update availability.
- No live tracking.
- For a verified incident, request ranked recommendations.
- Officer reviews reasons and manually confirms.
- Backend revalidates availability and records deployment.
- Resource becomes deployed; incident becomes dispatched.
- Officer may complete/cancel deployment and update incident consistently.
- Citizen sees appropriate public status only, not internal notes.
11. Visual design system
DISHA should look like a polished contemporary civic-tech/SaaS product, not a generic college dashboard.
- Primary palette: confident blue.
- Supporting: navy/deep slate, white and cool off-white.
- Accent: subtle cyan.
- Severity colours: restrained and consistent (red for critical/high, amber for medium, green for resolved/available).
- Light theme by default; dark theme complete and legible.
- Preserve existing Geist/Geist Mono unless there is a clear reason to change.
- Generous whitespace, strong hierarchy, alignment, restrained borders, layered surfaces and subtle shadows.
- Accessible contrast and readable type.
Premium components and motion
- 21st.dev, Aceternity UI and Magic UI may be sources for individual copied/adapted components; they are not assumed runtime dependencies.
- Use a premium hero, tasteful gradients/ambient background, polished cards, micro-interactions and purposeful transitions.
- Prefer CSS/Tailwind and existing tw-animate-css.
- Add Framer Motion only if a concrete interaction requires it and the added dependency is justified.
- Avoid animation overload. Citizen reporting must remain clear and fast.
- Respect prefers-reduced-motion.
- Never substitute decorative UI for a real map or working workflow.
Preserve existing configuration
Inspect and preserve:
- src/app/globals.css (or actual location).
- Existing shadcn CSS variables/theme tokens.
- components.json radix-nova configuration.
- Geist fonts.
- Sonner toaster.
- Existing theme support.
Do not replace global CSS wholesale.
12. API design
Use REST endpoints, consistent JSON responses and validation. Follow existing conventions if already established, while retaining equivalent protection.
Auth
- POST /api/auth/register — citizen only.
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
Citizen
- POST /api/incidents — authenticated citizen creates.
- GET /api/incidents/my — own reports.
- GET /api/incidents/my/:id — own detail with ownership check.
- Safety content may be static frontend content or a read-only endpoint.
Officer
- GET /api/officer/dashboard
- GET /api/officer/incidents
- GET /api/officer/incidents/:id
- PATCH /api/officer/incidents/:id/review
- PATCH /api/officer/incidents/:id/verify
- PATCH /api/officer/incidents/:id/reject
- PATCH /api/officer/incidents/:id/severity
- GET /api/officer/resources
- PATCH /api/officer/resources/:id/availability
- GET /api/officer/incidents/:id/recommendations
- POST /api/officer/incidents/:id/deployments
- PATCH /api/officer/deployments/:id
Do not create a generic unrestricted incident update endpoint.
13. Environment variables and deployment
Suggested variables (adapt as needed):

Frontend:
- NEXT_PUBLIC_API_URL
Backend:
- PORT
- NODE_ENV
- MONGODB_URI
- JWT_SECRET if JWT is used
- CLIENT_ORIGIN
- COOKIE_SECRET if required
- CLOUDINARY_CLOUD_NAME (optional)
- CLOUDINARY_API_KEY (optional)
- CLOUDINARY_API_SECRET (optional)
- OFFICER_SEED_EMAIL
- OFFICER_SEED_PASSWORD (development/demo seed only)
Validate required variables at startup. Provide .env.example with placeholders. Never commit .env or real credentials. Do not log secret values.

Target deployment, only when credentials/user approval are available:
- Next.js frontend: Vercel.
- Express API: Render.
- MongoDB: Atlas.
- Images: Cloudinary optional.
Document cookie/CORS configuration for the actual deployment topology. Do not claim deployment has succeeded unless verified.
14. Validation, privacy and error handling
- Validate request body, params and query on the backend.
- Use predictable error response shapes and appropriate HTTP codes.
- Do not expose stack traces, secrets, DB internals or password hashes.
- Validate uploaded file MIME type and size; do not trust filename extensions.
- Do not accept arbitrary user-supplied image URLs as trusted evidence.
- Keep exact incident coordinates private from other citizens.
- Citizens may see their own report location; authorized officers may see coordinates needed for response.
- Avoid unnecessary personal data.
- Add basic rate limits to authentication and incident submission.
- Use Helmet and safe production cookie settings.
- CORS must use the intended frontend origin; no wildcard with credentialed cookies.
- Clearly distinguish demo data from live information.
15. Testing requirements
Keep testing proportionate but cover the important security and workflow paths.
Authentication/RBAC
- Citizen can register/login/logout.
- Invalid credentials rejected.
- Seeded officer can log in.
- Unauthenticated users cannot access protected APIs.
- Citizen cannot access officer endpoints.
- Citizen cannot read another citizen's report by changing its ID.
- Citizen cannot change role or set officer-only statuses.
Incident workflow
- Valid incident can be submitted and persisted.
- Invalid fields rejected.
- File type/size restrictions work.
- Report appears in owner's My Reports.
- Officer can review, verify or reject.
- Invalid status transitions rejected.
- Citizen sees updated status for own report.
Recommendation/deployment
- Unavailable and incompatible resources are excluded.
- Haversine distance works for known coordinates.
- Missing coordinates trigger fallback.
- Officer can confirm deployment.
- Resource cannot be assigned to two active deployments.
- Resource and incident statuses remain consistent.
UI and quality
- Routes render without runtime errors.
- Forms have labels and useful validation.
- Loading/error/empty states work.
- Role-specific navigation is correct.
- Mobile and desktop layouts work.
- Light/dark themes work.
- Run frontend/backend lint, type checks and builds where configured. Report actual results only.
16. Phased implementation plan
Do not attempt all features in one giant change.
Phase 0 — Inspect
Inspect repository structure, scripts, routes, components, styles, aliases and installed dependencies. Identify whether app uses src/app or app. Review current /, /dashboard, layout, theme and toast setup. Report conflicts before editing.
Phase 1 — Landing page and design foundation
Implement / as a polished public landing page. Preserve existing setup. Build responsive navigation, hero, feature section, safety callout and footer. Run relevant checks.
Phase 2 — UI shells
Build citizen and officer dashboard shells and role-appropriate navigation. Temporary placeholders must be clearly identified; do not show fabricated live KPIs.
Phase 3 — Backend/database
Create a small Express TypeScript API in server/. Configure MongoDB/Mongoose, env validation, central error handling, CORS, Helmet and request validation. Add User, Incident, Resource and Deployment models. Add officer/resource seed script. Document startup.
Phase 4 — Authentication/RBAC
Implement citizen registration, login, logout and current-user endpoint. Implement officer login through seeded account. Add secure cookie handling, role middleware and ownership checks. Test permissions before building workflows.
Phase 5 — Citizen incident workflow
Implement form, image upload, location, MongoDB persistence, My Reports and report detail. Connect dashboard counts to API data. Verify the full citizen journey.
Phase 6 — Officer workflow
Implement officer queue, incident detail, review, verification/rejection and severity. Connect officer KPIs to API data. Verify citizens cannot invoke officer operations.
Phase 7 — Map/resources/recommendations
Add Leaflet map and demo markers. Implement tested Haversine utility and explainable capability/distance ranking. Add resource inventory and deployment confirmation. Test unavailable resources and duplicate assignment prevention.
Phase 8 — Polish and deployment
Add safety content and verified emergency information. Finish accessibility, themes and error/empty/loading states. Test the complete workflow. Run lint/type/build checks for frontend and backend. Prepare .env.example and deployment instructions. Deploy only with credentials and user approval.
17. Code quality rules
- Keep TypeScript strict and understandable; avoid any.
- Follow actual repository naming and alias conventions.
- Use Server Components by default; add "use client" only for interaction/browser APIs.
- Keep pages thin and extract reusable components where useful.
- Keep business logic in backend services, not duplicated in UI.
- Use a small typed API client.
- Avoid unnecessary global state libraries.
- Check installed dependencies before adding packages.
- Avoid animation dependencies without a concrete need.
- Use semantic HTML, accessible labels, keyboard focus and correct buttons/links.
- Handle loading, error, empty, success and disabled states.
- Preserve unrelated working code.
- Do not fake API success, authentication, deployments or notifications.
- Do not describe simulated resources as real availability.
- Do not claim authorities were notified.
- Do not silently expand scope.
18. Definition of done
The mini-project is complete when this end-to-end demonstration works:
1. Citizen registers and logs in.
2. Citizen submits an incident with category, description, location and optional image.
3. Incident is persisted in MongoDB and receives a report ID.
4. Citizen sees it in My Reports.
5. Officer logs in with a seeded account.
6. Officer sees and reviews the report and evidence.
7. Officer verifies or rejects it.
8. Verified incident appears on the officer map.
9. System recommends eligible available demo resources with distance and explanation.
10. Officer confirms deployment.
11. Resource becomes deployed/unavailable and incident status updates.
12. Citizen sees the appropriate updated status.
13. Unauthorized API access is rejected.
The result must remain explainable and demonstrable as a 5th-semester mini-project. No live emergency integration, AI prediction or production dispatch claims.
19. OpenCode operating instructions
For every task:
1. Read this file.
2. Inspect relevant existing files before editing.
3. Confirm assumptions from the actual repository; do not invent routes or dependencies.
4. State a concise plan for the requested milestone.
5. Make the smallest coherent change.
6. Run relevant checks and fix regressions caused by the change.
7. Report:
   - Files inspected and changed.
   - Dependencies added/removed and why.
   - Commands/tests actually run and real outcomes.
   - What is functional versus mocked/incomplete.
   - Any setup/manual steps required from the user.
If a requirement conflicts with the repository or materially increases scope, explain the trade-off and ask before proceeding.