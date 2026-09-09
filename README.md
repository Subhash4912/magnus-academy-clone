# Magnus Academy Clone

## Project overview

Magnus Academy Clone is a full-stack employee management and UI-learning application inspired by the style of the Magnus/JALA Academy admin application. It is an independent portfolio and assignment implementation; it is not the official JALA Academy product and does not use proprietary source code, credentials, or assets.

The application combines a responsive React interface with an authenticated Express API and MongoDB persistence. It demonstrates a complete login-to-CRUD workflow, database-backed dashboard statistics, reusable UI patterns, and account preferences.

## Features

- JWT login, logout, session restoration, and protected frontend/backend routes
- Bcrypt password hashing, profile updates, and authenticated password changes
- Employee create, search, view, edit, and delete workflows
- Client and server validation with accessible loading, error, success, and empty states
- MongoDB persistence and aggregated dashboard statistics
- Country, state, gender, skill, and recent-employee dashboard summaries
- Eleven interactive More modules: tabs, nested menus, autocomplete, accordion, gallery, slider, tooltips, popups, links, CSS controls, and iframes
- Settings for profile, password, System/Light/Dark theme, and local notification preferences
- Responsive navigation, forms, tables, cards, dialogs, and pages
- GSAP page entrances, dashboard counters, progress bars, dialogs, drawer, and interaction feedback with reduced-motion support

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, React Router, Tailwind CSS 4, GSAP, Axios |
| Backend | Node.js, Express 5, MongoDB, Mongoose |
| Authentication | JSON Web Tokens and bcryptjs |
| Quality | ESLint, Node.js test runner, integration tests, Git |

## Project architecture

```text
magnus-academy-clone/
├── frontend/
│   ├── public/                 # Favicon, local gallery art, iframe demo
│   ├── src/
│   │   ├── components/         # Shared layout, forms, tables, dialogs, UI demos
│   │   ├── context/            # Authentication and settings providers
│   │   ├── hooks/              # Context and asynchronous-state hooks
│   │   ├── layouts/            # Protected application layout
│   │   ├── pages/              # Auth, dashboard, employee, More, settings
│   │   ├── routes/             # React Router declarations
│   │   ├── services/           # Axios, auth, dashboard, employee services
│   │   └── utils/              # Navigation, form, content, storage helpers
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/             # Environment, JWT, MongoDB configuration
│   │   ├── controllers/        # Auth, dashboard, employee HTTP handlers
│   │   ├── middleware/         # Authentication, validation, error handling
│   │   ├── models/             # User and Employee Mongoose models
│   │   ├── routes/             # API route declarations
│   │   ├── services/           # Dashboard aggregation
│   │   └── utils/              # HTTP error and admin seed utilities
│   ├── test/                   # Unit and opt-in live integration tests
│   └── package.json
├── .gitignore
└── README.md
```

The frontend calls one shared Axios instance. It attaches the current Bearer token and converts failures into readable API errors. Express routes validate input before controllers call Mongoose. Central error middleware returns safe JSON and keeps database details and stack traces out of responses.

## Prerequisites

- Node.js 20.19+ or 22.12+; Node.js 22 is recommended and was used for verification
- npm
- MongoDB Community Server or a MongoDB Atlas cluster
- Git

## Installation

```bash
git clone <repository-url>
cd magnus-academy-clone

cd backend
npm install

cd ../frontend
npm install
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Environment variables

Copy each example file and replace placeholders locally. Never commit real `.env` files.

Backend: copy `backend/.env.example` to `backend/.env`.

```dotenv
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=use_a_random_secret_with_at_least_32_characters
JWT_EXPIRES_IN=1d
ADMIN_NAME=your_admin_name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

Frontend: copy `frontend/.env.example` to `frontend/.env`.

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Only `VITE_*` values are exposed to browser code. Keep database credentials, JWT secrets, and admin credentials in the backend environment only.

## MongoDB setup

For local MongoDB, start the MongoDB service and use a URI whose final path identifies the database, such as `mongodb://127.0.0.1:27017/magnus_academy`. For Atlas, create a database user, allow the development machine's network access, and place the Atlas connection URI in `MONGODB_URI`.

Mongoose creates the `users` and `employees` collections when records are first stored. Do not place a real URI in documentation or source code.

## Create the development admin

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`, then run:

```bash
cd backend
npm run seed:admin
```

The explicit seed checks for the normalized email and does not overwrite an existing account. Passwords must contain at least 8 characters and at most 72 UTF-8 bytes. The User model hashes the password before MongoDB receives it.

## Run the project

Start the API:

```bash
cd backend
npm run dev
```

Start Vite in a second terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The backend defaults to `http://localhost:5000`, and its health endpoint is `http://localhost:5000/api/health`.

Production-style frontend check:

```bash
cd frontend
npm run build
npm run preview
```

## API documentation

Successful responses use `{ "success": true, "message": "...", "data": ... }`. Expected failures use `{ "success": false, "message": "..." }`; unauthenticated responses also return `data: null`.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | API and database status |
| POST | `/api/auth/login` | Public | Validate credentials and issue JWT |
| GET | `/api/auth/me` | Bearer token | Restore the current user |
| PUT | `/api/auth/profile` | Bearer token | Update the current user's name |
| PUT | `/api/auth/password` | Bearer token | Verify and change current user's password |
| POST | `/api/employees` | Bearer token | Create employee |
| GET | `/api/employees` | Bearer token | List or search employees |
| GET | `/api/employees/:id` | Bearer token | Fetch employee |
| PUT | `/api/employees/:id` | Bearer token | Update supplied employee fields |
| DELETE | `/api/employees/:id` | Bearer token | Delete employee |
| GET | `/api/dashboard/stats` | Bearer token | Fetch aggregated employee statistics |

Employee search supports case-insensitive partial `name` and `mobile` query parameters:

```text
GET /api/employees?name=priya
GET /api/employees?mobile=9876
GET /api/employees?name=priya&mobile=9876
```

Unsupported, repeated, or non-string query values are rejected. Search text is escaped before it enters a regular expression.

## Authentication flow

1. The login form sends email and password to the backend.
2. The backend retrieves the selected password hash and verifies it with bcrypt.
3. A valid login receives a signed, expiring JWT and sanitized user data.
4. The frontend stores only the JWT under `magnus_auth_token`.
5. The Axios interceptor attaches `Authorization: Bearer <token>` to protected requests.
6. Authentication middleware verifies the algorithm, signature, issuer, audience, expiry, subject, and current user.
7. `/api/auth/me` restores the user after a browser refresh. Invalid or expired tokens are removed and return the user to login.

Profile and password endpoints always use the JWT subject. They do not accept a user ID or role from the client. A password change reuses the User model's bcrypt save hook and keeps the current JWT valid for this assignment.

## Employee CRUD flow

- **Create:** controlled form → client validation → protected POST → Mongoose validation → MongoDB.
- **Search:** name/mobile filters → protected GET → escaped database query → responsive table.
- **View/Edit:** route ID → protected GET → populated shared form → protected PUT → document validation.
- **Delete:** accessible confirmation dialog → protected DELETE → row removal and feedback.

Dashboard totals and distributions come from a dedicated MongoDB aggregation. The frontend does not download the employee list to calculate statistics.

## Testing

Backend unit/default suite:

```bash
cd backend
npm test
```

Live suites are opt-in because they connect to `MONGODB_URI`. In PowerShell:

```powershell
$env:RUN_EMPLOYEE_API_TESTS = '1'
$env:RUN_DASHBOARD_API_TESTS = '1'
$env:RUN_AUTH_SETTINGS_TESTS = '1'
npm.cmd test
```

The live tests use UUID-tagged users/employees or a uniquely named temporary collection and remove them afterward. They do not change the development admin.

Frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

There is no committed browser-test dependency. Final end-to-end verification was performed with a temporary local browser harness against the real frontend, API, and MongoDB.

## Security notes

- Bcrypt hashes passwords with a work factor of 12; password fields are excluded from normal Mongoose queries and API responses.
- JWT secrets and database/admin credentials come only from ignored backend environment variables.
- Employee, dashboard, profile, and password APIs require a valid current user and JWT.
- Profile/password endpoints allow only explicitly named fields; employee input and IDs are validated.
- CORS accepts the configured frontend origin, and internal errors return generic messages.
- `.env`, dependencies, builds, logs, coverage, and local test artifacts are ignored by Git.

This is a portfolio application. A public production deployment should additionally use HTTPS, secure HTTP-only cookie or equivalent hardened token storage, request rate limiting, security headers, managed secret rotation, monitoring, backups, and a defined account-recovery process.

## Known limitations

- JWTs are stored in localStorage as allowed by the assignment; there is no refresh-token or server-side revocation flow.
- Authentication supports a seeded admin role only; registration and password recovery are outside the project scope.
- Notification and theme settings are browser-local preferences and do not send messages or synchronize across devices.
- Employee results are not paginated, so a large production dataset would need server-side pagination.
- The iframe module uses local/inline content because many external sites deny embedding.
- No production deployment configuration is included.

## Explaining the project in an interview

Start with the full flow: React renders protected admin pages, Axios calls an Express REST API, and Mongoose persists employee/user data in MongoDB. Explain that authentication uses bcrypt for stored passwords and JWT middleware for each protected API.

Then walk through one employee lifecycle. The frontend validates controlled inputs, the backend validates again and rejects unknown fields, the controller saves through Mongoose, and the UI displays the normalized response. Search escapes user input; edit reuses the create form; delete uses an accessible confirmation dialog.

The dashboard is a useful technical example: one MongoDB `$facet` aggregation calculates totals, gender groups, country/state/skill distributions, and the five newest employees. The UI handles loading, errors, retries, empty data, and responsive layouts without calculating those statistics from a downloaded employee list.

The main challenges were keeping authentication state synchronized after refresh/profile changes, preventing stale 401 responses from clearing a newer session, securely changing passwords without exposing hashes, and making interactive examples keyboard-accessible. These were handled with focused providers, one Axios interceptor, strict allow-list validation, Mongoose hooks, native semantic controls, and regression tests across API and browser flows.
