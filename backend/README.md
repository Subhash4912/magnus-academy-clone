# Magnus Academy API

Express and MongoDB API for the Magnus Academy Clone. It provides JWT authentication, Employee CRUD/search, dashboard aggregation, profile editing, password changes, centralized validation, and safe error responses.

## Setup

Requires Node.js 20.19+ (Node.js 22 recommended) and a local or Atlas MongoDB database.

```bash
npm install
```

Copy `.env.example` to `.env` and configure:

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

Create the development admin explicitly, then start the server:

```bash
npm run seed:admin
npm run dev
```

`npm start` runs without the development file watcher. The server validates JWT configuration, connects to MongoDB, and only then begins listening. SIGINT/SIGTERM close HTTP and database resources.

## Structure

```text
src/
├── config/       # Environment, MongoDB, JWT
├── controllers/  # HTTP request/response handling
├── middleware/   # Authentication, validation, 404, errors
├── models/       # User and Employee schemas
├── routes/       # Auth, employee, dashboard endpoints
├── services/     # Dashboard MongoDB aggregation
└── utils/        # HttpError and admin seed
test/             # Unit and opt-in live integration tests
```

## Endpoints

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | API/database health |
| POST | `/api/auth/login` | Public | Authenticate and issue JWT |
| GET | `/api/auth/me` | Protected | Current sanitized user |
| PUT | `/api/auth/profile` | Protected | Update current user's name |
| PUT | `/api/auth/password` | Protected | Verify and update password |
| POST | `/api/employees` | Protected | Create employee |
| GET | `/api/employees` | Protected | List/search employees |
| GET | `/api/employees/:id` | Protected | Fetch employee |
| PUT | `/api/employees/:id` | Protected | Update employee fields |
| DELETE | `/api/employees/:id` | Protected | Delete employee |
| GET | `/api/dashboard/stats` | Protected | Aggregated employee statistics |

`GET /api/employees` accepts optional partial `name` and `mobile` parameters. Results are newest first. User text is escaped before regex search; unsupported and repeated parameters return 400.

Dashboard data includes total/male/female/other counts, country/state/skill groups, and the latest five employees. A single `$facet` aggregation calculates the response. Missing country/state values use `Unspecified`, blank skills are excluded, and repeated skills on one employee count once.

## Validation and security

- User email is normalized and unique. Passwords are 8–72 UTF-8 bytes and hashed with bcrypt work factor 12.
- Password is `select: false` and is removed from JSON. APIs return only user ID, name, email, and role.
- JWT verification allows HS256 and validates issuer, audience, expiry, ObjectId subject, and current user.
- Profile and password endpoints derive identity from the JWT and reject unknown fields, role changes, user IDs, and arbitrary updates.
- Employee requests use an allow-list and validate required values, types, date, arrays, and ObjectIds.
- CORS accepts only `CLIENT_ORIGIN`. Database/internal errors are logged with fixed messages and returned as generic 500 responses.

## Response convention

```json
{ "success": true, "message": "Operation completed", "data": {} }
```

Expected errors use `success: false` and a safe message. Authentication errors return HTTP 401 with `data: null`; field validation may include an `errors` object.

## Tests

```bash
npm test
```

Default tests avoid live database mutations. To run every test in PowerShell:

```powershell
$env:RUN_EMPLOYEE_API_TESTS = '1'
$env:RUN_DASHBOARD_API_TESTS = '1'
$env:RUN_AUTH_SETTINGS_TESTS = '1'
npm.cmd test
```

Live tests use temporary records/collections and clean them up. They never change the configured development admin account.
