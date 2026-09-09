# Magnus Academy Web Application

React frontend for the Magnus Academy Clone. It includes JWT session handling, protected routes, a live dashboard, Employee CRUD, eleven interactive UI modules, account settings, persistent theme/notification preferences, responsive navigation, and scoped GSAP motion.

## Setup and scripts

Requires Node.js 20.19+ or 22.12+; Node.js 22 is recommended.

```bash
npm install
```

Copy `.env.example` to `.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Commands:

```bash
npm run dev      # Vite development server
npm run lint     # ESLint
npm run build    # Production bundle
npm run preview  # Preview the production bundle
```

## Structure

```text
src/
├── components/  # Common, employee, layout, More components
├── context/     # Authentication and browser preference providers
├── hooks/       # useAuth, useSettings, useAsync
├── layouts/     # Protected application shell
├── pages/       # Login, dashboard, employee, More, settings, 404
├── routes/      # Application route declarations
├── services/    # Shared Axios instance and domain services
└── utils/       # Navigation, forms, local content/storage helpers
public/          # Local SVG gallery, favicon, iframe demo
```

## Routes

`/login` is public. `/dashboard`, `/employee/*`, `/more/*`, and `/settings` render inside the authenticated layout. `/employee` redirects to search, and unknown routes display the application 404 page.

The AuthProvider restores valid sessions through `/auth/me`. Axios reads `magnus_auth_token`, attaches the Bearer header centrally, and dispatches one invalid-session event for relevant 401 responses. Profile updates replace the current context user so the header changes immediately.

Theme and notification preferences use `magnus_theme` and `magnus_notification_preferences`. These stores never contain passwords, user profiles, or tokens. System/Light/Dark applies one application-wide palette.

## UI behavior

- Dashboard uses the dedicated statistics API and includes loading, retry, empty, distribution, recent-employee, and quick-action states.
- Create and Edit reuse one controlled Employee form. Search and Delete provide loading, validation, confirmation, and feedback states.
- More modules use local React state and semantic controls; gallery and iframe content are local assets.
- Mobile uses an accessible navigation dialog; desktop uses a persistent sidebar. Tables and tabs contain their own horizontal scrolling when needed.
- GSAP animates login content, route entrances, cards, dashboard counters and bars, employee rows, dialogs, the mobile drawer, and button presses.
- Animation selectors are component-scoped and automatically cleaned up by `@gsap/react`; reduced-motion preferences disable movement.

For deployment, configure `VITE_API_BASE_URL`, serve `dist/`, and configure the static host to rewrite non-asset URLs to `index.html` for React Router refreshes. The API must allow the deployed frontend origin.
