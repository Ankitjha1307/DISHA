DISHA — Project Instructions for OpenCode
1. Project identity
Project name: DISHA
Full form: Disaster Intelligence System for Humanitarian Assistance
Project type: 5th-semester engineering mini/minor project
Initial release: DISHA v0.1
Primary audience: Citizens in a Greater Noida mock/demo environment
Project mode: Frontend-first academic prototype using mock data; no backend in the initial scope.

DISHA is a citizen-facing disaster incident reporting and assistance-awareness prototype. It should demonstrate how a citizen can report an incident, provide its location and optional photo evidence, review their submitted reports, and find basic safety information. The product should feel like a credible, polished civic/emergency-assistance service—not a generic admin template or a static college assignment.

The core citizen journey is:

Discover DISHA → open the citizen portal → report an incident → receive a confirmation and report ID → view the report and its simulated status → access safety resources.

The project must not imply that a real emergency service has received a report or dispatched help. The current prototype is simulated and is not an emergency dispatch service.
2. Scope and product boundaries
In scope for the initial prototype
1. A polished public landing page.
2. A citizen home dashboard.
3. An incident-reporting form.
4. Client-side image selection/capture preview.
5. Location entry using a manual location/map-pin interaction or browser geolocation when available and permitted. Provide a manual fallback if permission is denied or geolocation is unavailable.
6. A clear successful-submission toast and confirmation view with a demo report ID.
7. A “My Reports” page with mock report history, filters and status labels.
8. A citizen-facing incident map/area view if it can be implemented reliably within the mini-project scope. Clearly distinguish illustrative/mock data from live information.
9. Safety guidelines and verified emergency contact information. Do not invent official contact details; source and verify them before presenting them as official.
10. Profile/settings UI only to the extent useful for the prototype; do not build real authentication unless explicitly requested.
11. Responsive design, accessible interactions, light theme by default and dark theme support.
12. Toasts, empty states, validation, loading/disabled states and helpful error messages.
Not in the initial scope unless explicitly requested later
- A production backend, database, authentication, authorization or real user accounts.
- Real dispatch, contact with emergency services, or claims that authorities have been notified.
- A full officer/admin command centre as the main experience. The citizen portal is the immediate priority. An officer view can be considered as a separate later milestone if the project requirements demand it.
- AI/ML disaster prediction, automated damage assessment, satellite imagery analysis, chatbots, microservices, Redis, Kubernetes, or optimization solvers.
- Live vehicle tracking, real-time emergency feeds, or guaranteed resource availability.
- Complex production infrastructure that does not help demonstrate the mini-project's core flow.
Keep the scope achievable. Prefer a small, coherent, working vertical slice over many incomplete screens.
3. Technology stack already present
Use the existing project and dependencies. Do not recreate the app from scratch or replace the stack without a strong reason.
- Next.js 16.3.4, App Router
- React and React DOM 19.2.8
- TypeScript ^5
- Tailwind CSS ^4 using @tailwindcss/postcss
- shadcn/ui configured with the radix-nova style
- Radix UI primitives via the existing radix-ui dependency
- lucide-react for icons
- next-themes for theme support
- sonner for toast notifications
- class-variance-authority, existing cn package, and tw-animate-css
The existing package.json scripts are:
- npm run dev
- npm run build
- npm run start
- npm run lint
The repository's components.json specifies src/app/globals.css, with aliases such as @/components, @/components/ui, @/lib, and @/hooks. Inspect the actual folder structure before editing; the files may live under src/app/ rather than app/.
4. Existing codebase context
The user supplied these existing files/configuration details:
- The current home page (page.tsx) redirects / to /dashboard using redirect("/dashboard"). The intended next step is to replace that redirect with the public landing page, while keeping /dashboard as the citizen portal route.
- The root layout loads Geist and Geist Mono through next/font/google, imports globals.css, defines DISHA metadata and renders the Sonner toaster from @/components/ui/sonner.
- globals.css imports tailwindcss, tw-animate-css, and shadcn/tailwind.css. It defines light/dark CSS variables and shadcn design tokens. Preserve the token system and extend it carefully rather than replacing the stylesheet wholesale.
- components.json uses radix-nova, RSC enabled, TSX enabled, Lucide icons, CSS variables, and the @/ aliases.
- The package list does not currently include a map library, Framer Motion, or separate Aceternity/Magic UI packages. Check before installing anything because package contents can change.
Before substantial changes, inspect the actual repository structure, relevant files, current components, and installed packages. Do not assume a component or route exists without checking.
5. Visual design direction
The interface should look like a polished, contemporary civic-tech/SaaS product. Avoid the generic “college project dashboard” appearance.
Brand and visual language
- Brand: DISHA.
- Meaning: Disaster Intelligence System for Humanitarian Assistance.
- Primary palette: confident blue with navy/deep-slate text, white and cool off-white surfaces, subtle cyan accents, and restrained severity colours.
- Default appearance: light theme.
- Dark theme: supported and visually consistent, not an afterthought.
- Typography: use the existing Geist font setup unless a change has a clear benefit.
- Use generous whitespace, a clear type scale, strong alignment, restrained borders, rounded corners, layered surfaces and subtle shadows.
- Use gradients and blurred ambient glows selectively. Maintain contrast and legibility.
- Use consistent design tokens and reusable components; avoid scattering arbitrary hex colours throughout every page when a token is appropriate.
Visual quality
Use high-quality hero compositions, thoughtful empty states, polished cards, clear navigation, micro-interactions, responsive layouts and subtle transitions. 21st.dev, Aceternity UI and Magic UI may be used as sources of inspiration or copied components where suitable, but they are not mandatory dependencies. Prefer adapting small, understandable components over adding a large library for one effect.

Animations must be purposeful, performant and respectful of prefers-reduced-motion. Do not animate every card or add effects that distract from incident reporting. Never sacrifice readability or task completion for decoration.
Landing page
The public route / should be a real landing page, not a redirect. The intended first-pass design includes:
- Navigation with DISHA branding and links to About, Features and Safety Resources.
- A strong hero headline along the lines of “When every second matters.”
- A concise description of citizen incident reporting and assistance awareness.
- A primary CTA to enter the citizen portal and a secondary CTA to explore features.
- A custom illustrative incident-map visual or polished visual panel. Clearly label it illustrative; do not imply it shows live incidents.
- Feature cards for incident reporting, location awareness and report tracking.
- A safety/preparedness callout and a simple footer.
- Responsive navigation and mobile-friendly CTA layout.
If implementing the initial hero supplied in conversation, preserve its core idea but verify imports, syntax, lint and build. Do not assume copied JSX is error-free.
6. Citizen portal information architecture
The main citizen-facing routes/pages should be built in this order:
A. /dashboard — Citizen Home
Include:
- A welcoming header and a short explanation of what the citizen can do.
- A prominent “Report an Incident” action.
- Small personal activity summaries, such as total reports, under review and resolved. These must be derived from demo records, not hard-coded separately from the report list.
- Recent reports with category, short location, report ID, date/time and status.
- Quick access to safety guidelines and emergency contact information.
- Optional map/area preview if it adds value without overcrowding the page.
- Helpful first-use/empty state when the citizen has no reports.
Do not place officer-only KPIs (such as all active incidents across a district, pending officer verification, or fleet availability) on the citizen dashboard. The citizen should see their own activity only.
B. Incident report flow
Use a dedicated route or a well-structured form view, not a huge form embedded in the home dashboard. The flow should include:
1. Incident category: fire, road accident, flooding/waterlogging, building damage, medical emergency/other, with wording appropriate to a demo.
2. Description with sensible length validation.
3. Location: manual location text and/or map pin; browser geolocation only after user action/permission. Include a manual fallback.
4. Optional image upload/camera capture using a file input, with preview, file type/size validation and a way to remove/change the image.
5. Review/submit action with disabled/loading feedback while submitting.
6. On successful local submission, create a unique demo ID, store a timestamp, set the initial status to “Submitted” or “Under review”, show a Sonner toast saying “Incident reported successfully”, and present a confirmation with the report ID.
No actual backend upload or real emergency alert occurs. Explain that this is a prototype where appropriate, without making the main UI alarming or cluttered.
C. /my-reports (or a route that follows existing conventions)
Include:
- Citizen's own mock/submitted reports.
- Search and filters by category/status when useful.
- Report details including ID, category, location, submitted date, description, optional image preview and current simulated status.
- Clear status badges and an empty state.
- Consistent data with the dashboard counts.
D. Incident map/area view
If included in this milestone:
- Use a real interactive map library, such as Leaflet with OpenStreetMap tiles, rather than a static image pretending to be a map.
- Check whether a suitable map package already exists before adding one. If not, explain the dependency and add only what is necessary.
- Map data is mock/illustrative. Add a visible demo label and a legend.
- Respect privacy: never expose precise citizen report locations publicly by default. Use approximate/mock locations unless the project explicitly defines a safe access model.
- Provide a useful list or fallback view if the map cannot load.
E. Safety resources
- Provide concise preparedness guidance for relevant incident categories.
- Show emergency numbers only after verifying them from authoritative sources. Do not invent official contacts or claim that DISHA directly calls them.
- Make any call links usable on mobile (tel:) and clearly distinguish informational resources from reporting functionality.
F. Profile/settings
Only implement what is useful for the demo, such as theme selection or a mock profile. Do not imply that a real identity is authenticated or secured if no auth system exists.
7. Mock-data and frontend architecture
Keep demo data consistent, typed and separate from page presentation.
- Define TypeScript types for incidents/reports, incident category and report status.
- Keep seed/mock records in a dedicated module, for example src/lib/mock-data.ts, adjusted to the real repository structure.
- Put shared report operations in a small client-side data/service module rather than duplicating business logic in each page.
- For local persistence, localStorage is acceptable for a frontend demo, but only access it in client-side code/effects or guarded browser-only helpers. Avoid accessing browser globals in Server Components or during server rendering.
- If local storage is used, seed demo records carefully, handle invalid/missing values and keep dashboard summaries in sync with the same source of records.
- Do not create an elaborate state-management layer for a small prototype. React state and a small context/store are enough if shared state requires it.
- Use Server Components by default. Add "use client" only where interactivity/browser APIs require it.
- Keep route pages thin; extract reusable components when they improve clarity.
- Avoid fake API calls, arbitrary delays, or mock “success” messages that suggest a server accepted a report.
8. Component and UI-library guidance
- Reuse the existing shadcn components if they are present. Inspect src/components/ui (or the equivalent) before importing components.
- Use Lucide icons consistently; do not mix emoji icons with the main interface.
- Use Sonner for concise action feedback, and ensure important confirmation details are also visible in the page rather than only in a toast.
- Use semantic HTML and proper form labels. Every input needs an accessible label; icon-only buttons need accessible names.
- Buttons should be real buttons; navigation should use Next.js Link where appropriate.
- Provide keyboard focus styles, good contrast, validation messages and reduced-motion support.
- Use 21st.dev/Aceternity/Magic UI components selectively. Copy and adapt the necessary code into the repository; do not assume those sites are runtime dependencies or install unrelated packages.
- Avoid adding Framer Motion or other animation libraries unless a concrete requirement justifies the extra dependency.
- Do not use a decorative map screenshot in place of a functional map if the feature is described as interactive.
9. Code quality and implementation rules
- TypeScript should remain strict and understandable. Avoid any unless there is a clear reason.
- Follow the repository's current naming conventions and alias configuration.
- Do not replace the existing globals.css, layout, or component configuration wholesale. Make small, deliberate changes and preserve shadcn tokens.
- Do not remove Geist fonts, the Sonner toaster, theme support or existing UI components without a reason.
- Check package versions and existing components before installing or generating new ones.
- Avoid duplicate components, unused imports, dead code and unnecessary dependencies.
- Handle loading, error, empty, success and disabled states for meaningful user actions.
- Keep the UI responsive for small mobile screens, tablets and desktop.
- Do not add secrets, API keys, credentials or personal data to source control.
- Do not claim a feature is implemented until the relevant route and behavior exist and have been tested.
- When editing files, preserve unrelated working code and summarize what changed.
10. Suggested build sequence
Implement one coherent milestone at a time:
1. Inspect first: list the repository structure, review the existing app routes, layout, CSS, components, aliases and installed packages. Identify any mismatch between this document and the repository.
2. Public landing page: implement / with responsive navigation, premium hero, clear CTAs, feature cards, safety callout and footer.
3. Citizen dashboard shell: implement /dashboard with responsive navigation and a clean dashboard layout.
4. Typed demo records: define incident/report types and a single source of mock data.
5. Report submission: implement validation, image preview, location input, local demo submission, confirmation and toast.
6. My Reports: show the same records, search/filter and report details.
7. Safety resources: add well-sourced emergency contacts and guidance.
8. Optional map: implement a real interactive map only after the core reporting flow works.
9. Polish and verification: test mobile layouts, keyboard accessibility, theme behavior, empty states and navigation; run lint and production build.
Do not try to implement all routes in one giant component or one huge change. After each milestone, run the relevant checks and fix errors before moving on.
11. Verification checklist
Before calling a milestone complete:
- [ ] Routes load without runtime errors.
- [ ] npm run lint passes, or any pre-existing failure is clearly identified.
- [ ] npm run build passes, or any environment/network issue is documented accurately.
- [ ] Landing-page CTAs lead to the intended routes/sections.
- [ ] The citizen can complete the demo report form with valid input.
- [ ] Invalid input and rejected/oversized files show useful errors.
- [ ] A successful submission generates a report ID and appears in My Reports.
- [ ] Dashboard summary counts are derived from the same report records.
- [ ] Empty states and failed/unavailable geolocation are handled.
- [ ] The interface works on mobile and desktop.
- [ ] Light theme is the default and dark theme remains usable.
- [ ] No UI claims that mock data is live or that real emergency services were notified.
- [ ] No secret, API key or real personal data is included.
12. Instructions for OpenCode when starting work
Start by inspecting the current codebase; do not immediately overwrite files. Confirm whether the app uses src/app or app, identify existing UI components and check the current state of /, /dashboard, theme handling and toast setup. Then implement only the next requested milestone.

When responding to the user, be explicit about:
- Which files you inspected or changed.
- Any dependencies added and why.
- Commands/tests actually run and their real outcomes.
- Any feature that is still mocked, illustrative or incomplete.
Do not silently expand scope. If a decision materially changes the product (for example, adding a backend, real authentication or live maps/data), explain the trade-off and ask before proceeding.