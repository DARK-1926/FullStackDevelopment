# DevRhythm

**Your coding practice, in full view.**

DevRhythm brings coding activity, practice streaks, contest schedules, and application tracking into one developer dashboard. Connect public profiles from coding platforms, inspect practice trends, and keep your career pipeline alongside your progress.

![DevRhythm overview dashboard](docs/screenshots/overview-headless.png)

## What you can do

- **See your practice at a glance.** Review solved-problem totals, daily cadence, active days, recent activity, and streak health.
- **Dynamic Daily Coding Challenge.** Syncs the live, official Problem of the Day directly from LeetCode GraphQL with difficulty badges, topic tags, and quick-completion logging.
- **Custom Daily Targets & Steppers.** Adjust your daily problem targets with `-` and `+` steppers or click to type a custom goal with automatic progress recalculation.
- **Bring platform profiles together.** Look up public profiles on LeetCode, Codeforces, CodeChef, GeeksforGeeks, and GitHub.
- **Explore your activity.** Inspect platform metrics, practice trends, 365-day Skyline visualization, and streak health in the dashboard.
- **Keep up with events.** Browse coding contests, hackathons, workshops, and deadlines in the calendar.
- **Organize your career search.** Track applications through their stages and maintain a profile with your skills and platform handles.
- **Log practice.** Record activity against a supported platform and follow your consistency over time.

> **Data note:** Platform and contest information depends on each provider's public endpoints and availability. The interface also includes sample data so that the product can be explored without connecting every service. Treat retrieved metrics as provider data, not as a guarantee of identical coverage across platforms.

## Screenshots

| Overview |
|---|
| ![Overview dashboard](docs/screenshots/overview-headless.png) |

| Contests and events | Career pipeline |
|---|---|
| ![Contests and events calendar](docs/screenshots/calendar-headless.png) | ![Applications pipeline](docs/screenshots/career-headless.png) |

| Profile | Sign in |
|---|---|
| ![Profile page with coding accounts](docs/screenshots/profile-headless.png) | ![Sign-in page](docs/screenshots/sign-in-headless.png) |

## Architecture

The client is a React single-page application. In development, Vite proxies `/api` requests to Express. The API routes requests through controllers to MongoDB-backed models or the local JSON fallback store; platform adapters fetch public profile and event data from their providers.

```mermaid
flowchart LR
  subgraph Browser["Browser"]
    UI["React pages and components"]
    State["AppContext and local storage"]
    Client["Frontend service clients"]
    UI <--> State
    UI --> Client
  end

  Proxy["Vite /api proxy (development)"]
  API["Express API"]
  Routes["Route modules and middleware"]
  Controllers["Controllers"]
  Adapters["Platform and contest adapters"]
  Mongo[("MongoDB / Mongoose")]
  Fallback[("Local JSON fallback")]
  Providers["Public platform and event providers"]

  Client --> Proxy --> API --> Routes --> Controllers
  Controllers --> Mongo
  Controllers --> Fallback
  Controllers --> Adapters --> Providers
  Adapters --> Controllers
  Controllers --> API --> Client
```

### Main workflows

**Platform sync and analytics**

```mermaid
flowchart LR
  User["User opens dashboard"] --> Page["Overview and analytics sections"]
  Page --> Context["AppContext"]
  Context --> Client["Platform service client"]
  Client --> API["GET /api/platforms/:platform/:handle"]
  API --> Adapter["Platform adapter"]
  Adapter --> Provider["Public platform endpoint"]
  Provider --> Adapter --> API --> Context
  Context --> View["Dashboard metrics and activity views"]
```

**Authentication**

```mermaid
sequenceDiagram
  actor User
  participant UI as React auth page
  participant API as Express API
  participant Auth as Auth controller
  participant Store as MongoDB or fallback store

  User->>UI: Register or sign in
  UI->>API: POST /api/auth/register or /login
  API->>Auth: Validate request
  Auth->>Store: Find or persist user
  Store-->>Auth: User record
  Auth-->>UI: JWT and sanitized user
  UI->>API: GET /api/auth/me (authenticated)
  API-->>UI: Verified user profile
```

**Data model**

```mermaid
erDiagram
  USER ||--o{ GROWTH_LOG : records
  USER ||--o{ APPLICATION : tracks
  OPPORTUNITY {
    string title
    string company
    string deadline
    string sourceUrl
  }
  USER {
    string name
    string email
    string profileImage
    string platformHandles
  }
  GROWTH_LOG {
    string date
    string platform
    number problemsSolved
  }
  APPLICATION {
    string role
    string company
    string status
    string opportunityId
  }
```

`Application.opportunityId` is stored as a string; it is not a MongoDB reference to `Opportunity`. See the editable [architecture](docs/diagrams/architecture.md), [workflow](docs/diagrams/workflow.md), [data-flow](docs/diagrams/data-flow.md), [module-interaction](docs/diagrams/module-interaction.md), [authentication](docs/diagrams/authentication.md), and [database ER](docs/diagrams/database-er.md) diagrams.

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Lucide icons, native CSS variables |
| Backend | Node.js, Express, rate limiting, CORS |
| Persistence | MongoDB (Mongoose) with a local JSON fallback store |
| Authentication | JSON Web Tokens (JWT), bcryptjs password hashing |
| Testing & QA | Vitest, ESLint (Airbnb JavaScript standards) |

## Run locally

Requirements: Node.js 20 or later and npm.

```bash
npm ci
npm run dev
```

The development command starts the frontend at `http://localhost:5173` and the API at `http://localhost:5000`. The API health endpoint is `http://localhost:5000/api/health`. Vite proxies `/api` requests to the local API.

MongoDB is optional for local startup. When it is unavailable, account routes use the development fallback store, which writes ignored local state to `backend/local_db.json`. Do not use production credentials or data for local development.

Run only one process with `npm run dev:client` (or `npm run dev:frontend`) and `npm run server` (or `npm run dev:backend`) in separate terminals.

## API surface

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create an account |
| `POST` | `/auth/login` | Public | Sign in and receive a JWT |
| `GET` | `/auth/me` | JWT | Retrieve the authenticated profile |
| `PUT` | `/user/profile` | JWT | Update profile details |
| `POST` | `/growth/log` | JWT | Record a coding activity log |
| `GET` | `/growth/logs` | JWT | Retrieve the user's recent activity logs |
| `GET` | `/platforms/daily-challenge` | Public | Fetch official real-time LeetCode Problem of the Day |
| `GET` | `/platforms/leetcode/:handle` | Public | Fetch a LeetCode profile |
| `GET` | `/platforms/codeforces/:handle` | Public | Fetch a Codeforces profile |
| `GET` | `/platforms/codechef/:handle` | Public | Fetch a CodeChef profile |
| `GET` | `/platforms/gfg/:handle` | Public | Fetch a GeeksforGeeks profile |
| `GET` | `/platforms/github/:handle` | Public | Fetch a GitHub profile |
| `GET` | `/contests` | Public | Retrieve contest and event data |
| `GET` | `/opportunities` | Public | List opportunities |
| `GET` | `/opportunities/:id` | Public | Retrieve an opportunity |
| `GET` | `/applications` | Optional auth | List applications |
| `POST` | `/applications` | Optional auth | Create an application |
| `PATCH`, `PUT` | `/applications/:id` | Optional auth | Update an application |
| `DELETE` | `/applications/:id` | Optional auth | Delete an application |
| `GET` | `/health` | Public | Check API and database status |

Platform profile endpoints accept `?force=true` to bypass a fresh in-memory cache entry when supported by the adapter. External providers may impose their own limits or change availability.

## Data and persistence

- **User** stores account credentials (hashed), profile details, and public platform handles.
- **GrowthLog** records a user's activity date, platform, count, and optional notes.
- **Opportunity** stores role and event listing details.
- **Application** stores a user's role-tracking entry, status, dates, and notes.
- **MongoDB** is the persistent store when configured and reachable. The local JSON fallback supports local development when it is not.
- The frontend also keeps selected dashboard and career state in browser `localStorage`.

The file-backed fallback is not a substitute for a production database. In serverless environments where the filesystem is not writable, fallback state may only live in memory for the lifetime of a warm process.

## Tests and quality checks

Run the same checks used by the repository's CI workflow:

```bash
npm run lint
npm test
npm run audit:production
npm run build
```

Vitest runs the test suites, ESLint checks the JavaScript/JSX, and the production audit checks installed production dependencies. The CI workflow runs these checks on pull requests and pushes to `dev` or `main` using Node.js 20.

## Deployment

- **GitHub Pages:** `.github/workflows/deploy.yml` builds and publishes the static frontend from pushes to `main`. GitHub Pages does not run the Express API; configure a separate API host if the deployed frontend needs backend functionality.
- **Vercel:** `vercel.json` builds the frontend into `dist` and rewrites `/api/*` requests to `api/index.js`, which passes requests to Express. Configure `MONGODB_URI` and a strong `JWT_SECRET` in the deployment environment for persistent, signed-in accounts.

The local JSON fallback is not durable across serverless instances. Use MongoDB or another persistent database for deployed user data.

## Repository map

```text
api/
  index.js                 Vercel serverless API entry point
backend/
  src/
    config/                Environment and MongoDB connection
    controllers/           Authentication, growth, platform, and career handlers
    middleware/            Authentication, rate limiting, and error handling
    models/                Mongoose schemas
    routes/                Express route modules
    services/              Platform and contest integrations
    store/                 Local JSON fallback store
frontend/
  src/
    app/                   Application composition and navigation
    features/              Dashboard, calendar, applications, profile, auth
    shared/
      components/          Reusable UI and application shell
      context/             Shared state and lifecycle
      data/                Sample data
      services/            Frontend API clients
    styles/                Global styling
docs/
  diagrams/                Editable Mermaid diagrams
  screenshots/             Product screenshots
.github/workflows/          CI and GitHub Pages deployment
```

## Project documentation

- [Architecture notes](docs/ARCHITECTURE.md)
- [Engineering standards](docs/ENGINEERING_STANDARDS.md)
- [Operations guide](docs/OPERATIONS.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributing guide](CONTRIBUTING.md)

## Responsible use

Platform integrations retrieve public profile information. Use them in accordance with each provider's terms and access policies, and avoid sending private credentials to third-party platforms. Keep secrets server-side and distinguish live provider responses from sample or locally stored data.

No `LICENSE` file is currently included in this repository.
