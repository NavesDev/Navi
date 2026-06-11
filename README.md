# Navi 🌌

> 🌐 **Looking for the Portuguese version? / Quer ler em português?** Check out [docs/README.pt-br.md](./docs/README.pt-br.md).

Navi is an AI-powered personal assistant app designed to help you manage your finances, goals, habits, projects, and productivity through natural language conversation. The platform also features a modern administrative web dashboard for structured data visualization.

---

## 👁️ Product Vision

Navi simplifies self-management. Instead of opening complex apps and filling out extensive forms to record an expense, log a habit, or update a task, the user simply chats with Navi. The AI assistant interprets the intent, processes the information, and updates the database transparently.

---

## 🛠️ Tech Stack

The project uses a modern and scalable **Monorepo** architecture:

* **Monorepo Manager**: [pnpm Workspaces](https://pnpm.io/workspaces) for quick local package sharing.
* **Mobile Frontend**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (TypeScript) running natively on iOS and Android.
* **Web Frontend (Dashboard)**: [React](https://react.dev/) with [Vite](https://vite.dev/) (TypeScript) for the analytics administrative area.
* **Backend**: [Ruby on Rails 8.1](https://rubyonrails.org/) in API mode, providing fast development speed, security, and a robust architecture.
* **Database**: [PostgreSQL](https://www.postgresql.org/) hosted on [Neon Serverless PostgreSQL](https://neon.tech/) for dynamic scaling and database branching.
* **Infrastructure & Deployment**:
  * **Local**: Docker & Docker Compose.
  * **Production VM**: Google Cloud Compute Engine (24/7 VM) configured with [Kamal](https://kamal-deploy.org/) for simple containerized deployment.
* **Artificial Intelligence (Future)**: Integration with the Google Gemini API using the official SDK.

---

## 📂 Monorepo Structure

```
navi/
├── apps/
│   ├── mobile/             # React Native & Expo Mobile App
│   └── web/                # React & Vite Administrative Dashboard
├── services/
│   └── api/                # Ruby on Rails 8.1 API Backend
├── packages/
│   ├── config/             # Shared tooling config (TypeScript tsconfig, etc.)
│   ├── shared/             # Shared utilities (formatting, habit streaks, etc.)
│   └── types/              # Domain TypeScript types shared across apps
├── infra/
│   ├── docker/             # Local Docker & Compose configuration
│   └── google-cloud/       # GCP infrastructure documentation and scripts
├── docs/                   # System architecture documentation, diagrams, and guides
├── package.json            # Monorepo automation scripts
├── pnpm-workspace.yaml     # pnpm workspace definition
└── README.md               # Main repository documentation (English)
```

---

## 🎯 Planned Features

1. **AI Chat Interface**: Natural language inputs interpreted by AI to automatically map and execute actions.
2. **Simplified Financial Control**: Instant income/expense recording, updated balance tracking, savings goals, and automated transaction categorization.
3. **Habit Tracker**: Daily/weekly habits with streak gamification.
4. **Personal Goals**: Progress tracking for short, medium, and long-term goals.
5. **Productivity & Tasks**: To-do lists, workflows, deadlines, and integrated reminders.
6. **Analytical Dashboard**: Web interface with interactive charts for cash flow, habit consistency, and task completion.

---

## 🧠 Technical Decisions

* **pnpm Workspaces**: Facilitates maintaining unified TypeScript types (`@navi/types`) and common helper functions (`@navi/shared`), reducing dependency duplication and speeding up builds.
* **Rails API Mode**: Rails eliminates the need to integrate separate libraries for authentication, mailers, background processing (Solid Queue), and caching (Solid Cache) as these are native to Rails 8.
* **Neon PostgreSQL**: Serverless PostgreSQL keeps database costs near zero in development/early phases, and offers instant backups and database branches for isolated testing.
* **Kamal on GCP Compute Engine**: Kamal frees us from proprietary PaaS lock-ins, running containerized builds on a single virtual machine efficiently.

---

## 🚀 Installation and Setup

### Prerequisites
* Node.js >= 22.0.0
* pnpm >= 11.0.0
* Ruby >= 3.4.0 and Rails >= 8.1.0
* Docker & Docker Compose (optional for local database)

### 1. Install Dependencies
Run the following at the root of the workspace:
```bash
pnpm install
```

---

### 2. Run the Mobile App (Expo)

To start the Metro Bundler server for mobile development:
```bash
# Start Metro via monorepo script
pnpm dev:mobile

# Or navigate to the directory and run directly
cd apps/mobile
pnpm start
```
You can open the app in an Android/iOS emulator or scan the QR code using the **Expo Go** app on your physical device.

---

### 3. Run the Backend API (Rails)

#### Configuring Neon PostgreSQL (`DATABASE_URL`)
To connect to Neon in development or production, define the `DATABASE_URL` environment variable.

1. Create a database in your **Neon** console.
2. Copy the connection string (ensure it contains `sslmode=require`).
3. Define the connection string locally. You can create a `.env` file in the `services/api/` folder:

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[NEON-HOST]/neondb?sslmode=require"
```

*Note: The project's `database.yml` is configured to automatically read this environment variable if set.*

#### Run the Database Locally (PostgreSQL 18 via Docker)
If you prefer running a local **PostgreSQL 18** instance instead of Neon for development:

1. Start the database container:
   ```bash
   cd infra/docker
   docker compose up -d db
   ```
2. Define the local connection URL in `services/api/.env`:
   ```env
   DATABASE_URL="postgres://postgres:local_postgres_password@localhost:5432/api_development"
   ```

#### Run Migrations and Start Rails Server
From the root of the workspace:
```bash
# Setup database schemas and run migrations
pnpm --filter @navi/api db:setup

# Start local Rails API server (port 3000)
pnpm dev:api
```
The API will run on `http://localhost:3000`.

---

### 4. Run the Web Dashboard (Vite)

To run the administrative web dashboard locally:
```bash
pnpm dev:web
```
The dashboard will be available on `http://localhost:5173`.

---

## 📈 Initial Project Status

* [x] Monorepo structure initialized with `pnpm workspaces`.
* [x] Mobile Expo app configured with TypeScript and workspace linkings.
* [x] Web Vite dashboard scaffolded with React and workspace linkings.
* [x] Ruby on Rails 8.1 API backend generated with PostgreSQL support.
* [x] Shared package `@navi/types` created with core domain interfaces.
* [x] Shared package `@navi/shared` created with formatting and streak utility functions.
* [x] Local Docker Compose setup created for PostgreSQL 18.
* [x] GCP deployment docs and system architecture diagrams documented.
