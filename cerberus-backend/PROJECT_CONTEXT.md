Of course. Here is the complete, final "living document" for Project Cerberus, fully filled out according to our extensive discussions. This document is designed to be the ultimate context-provider and "shared brain" for collaborating on this project.

---

# **Project Cerberus: AI Collaboration Context & Living Documentation**
<!-- 
  INSTRUCTIONS FOR THE HUMAN (YOU):
  1. **THIS IS OUR SHARED BRAIN.** Keep it open while you work.
  2. **UPDATE IT AFTER EVERY COMMIT.** The state of this doc MUST match the `develop` branch.
  3. **PASTE RELEVANT SECTIONS TO ME.** At the start of a new work session, copy/paste the relevant parts (e.g., Current State, Goal, Key Decisions) into our chat to brief me.
-->

## **1. Project Vision & Current State**

-   **High-Level Vision:** To build a secure, high-performance, and scalable multi-chain DeFi wallet backend, acting as the central nervous system for a world-class user-facing application.
-   **Current Goal:** We are building the foundational MVP. The immediate focus is on creating a robust and testable backend structure, starting with user authentication, data access, and the core blockchain abstraction.
-   **Current Status:** The project foundation is complete. We are beginning **Phase 1: Data Access & Schema Management**.

---

## **2. Master Implementation Roadmap**
<!-- 
  HOW TO USE:
  - Update this like a checklist. Change `[ ]` to `[x]` when a task is complete and committed.
  - The `--> YOU ARE HERE` marker helps you and me instantly see where we are.
-->

-   **[x] Phase 0: Project Foundation & Setup**
    -   [x] Create project monorepo structure.
    -   [x] Initialize Git and NPM.
    -   [x] Install Core Dependencies & Tooling (ESLint, Prettier, Jest, etc.).
    *   [x] Configure Linter, Formatter, and Pre-commit Hooks.
    *   [x] Implement basic Express server with a `/health` endpoint.
    *   [x] Set up the centralized & validated `config` module.

-   **[x] Phase 1: Data Access & Schema Management** 
    *   [x] Implement DB Connectors (`PostgreSQL`, `Redis`).
    *   [x] Implement graceful shutdown logic.
    *   [x] Define and manage database schema with `node-pg-migrate`.
    *   [x] Implement Data Access Layer (DAL) models (`user.model.js`, `wallet.model.js`).
    *   [x] Write integration tests for all DAL models against a test database.

-   **[ ] Phase 2: The Blockchain Abstraction Layer (BAL)** `--> YOU ARE HERE`
    *   [x] Implement the generic `EVMClient`.
    *   [ ] Implement the `SolanaClient`.
    *   [x] Define the standardized `AssetBalance` interface.
    *   [ ] Implement the `ChainFactory` to provide clients.
    *   [ ] Write integration tests for the BAL against testnets.

-   **[ ] Phase 3: Core Business Logic & Services**
    *   [ ] Implement `auth.service.js` (registration, login, refresh, logout logic).
    *   [ ] Unit test the `auth.service.js` with mocked DAL.
    *   [ ] Implement `market.service.js` (price fetching and caching).
    *   [ ] Unit test the `market.service.js` with mocked Redis and HTTP clients.
    *   [ ] Implement `portfolio.service.js` (orchestration logic).
    *   [ ] Unit test the `portfolio.service.js` with mocked dependencies.

-   **[ ] Phase 4: API Layer & Security Hardening**
    *   [ ] Implement `Zod` validation schemas for all API inputs.
    *   [ ] Implement `authenticate` and `validateRequest` middleware.
    *   [ ] Implement all API routes and controllers (`auth`, `portfolio`, `wallet`).
    *   [ ] Write E2E tests for all major API flows (happy path and error cases).

-   **[ ] Phase 5: Production Readiness & Containerization**
    *   [ ] Implement Redis-backed rate limiting.
    *   [ ] Implement JWT revocation list using Redis.
    *   [ ] Enhance logger with structured JSON output and `requestId` tracing.
    *   [ ] Create a multi-stage, production-ready `Dockerfile`.
    *   [ ] Create a comprehensive `.dockerignore` file.
    *   [ ] Configure `ecosystem.config.js` for PM2 cluster mode.
    *   [ ] Set up a `docker-compose.yml` for a complete local development environment.

-   **[ ] Phase 6: Deployment & CI/CD**
    *   [ ] Write Terraform scripts for all AWS infrastructure (VPC, ECS, RDS, ElastiCache, ECR, ALB, Secrets Manager).
    *   [ ] Build the CI/CD pipeline in GitHub Actions for automated testing.
    *   [ ] Implement the CD part of the pipeline to deploy to a staging environment.
    *   [ ] Configure the application to fetch secrets from AWS Secrets Manager at startup.
    *   [ ] Set up CloudWatch dashboards and alarms for monitoring.

---

## **3. Key Architectural Decisions & "Golden Rules"**
<!--
  This is our constitution. It prevents me from suggesting solutions that contradict our choices.
-->

- **Architecture:** Strict `Controller -> Service -> Data Access` pattern. Controllers are thin; Services contain logic; DALs handle data.
- **Database:**
  - **Connection:** Use a **lazy-initialized singleton pattern** for the PostgreSQL connection pool to prevent test environment lifecycle issues.
  - **Schema:** All schema changes are managed via `node-pg-migrate`.
  - **Querying:** All database access is through DAL models using parameterized queries.
- **Security:**
  - **Validation:** All API inputs are validated upfront with `Zod`.
  - **Password Hashing:** Use **`argon2id`** (via the `argon2` library) for password hashing, as specified in the PRD.
  - **Authentication:** JWTs for access control.
- **Error Handling:** Services throw custom, named errors. A global error handler middleware will catch these and format a consistent JSON response.
- **Testing:**
  - **DAL:** Tested with **integration tests** against a real (Dockerized) database.
  - **Services:** Tested with **unit tests**, mocking all external dependencies (DAL, other services).
  - **API:** Tested with **E2E tests** using `supertest`.
- **Environment Variables:** Must be loaded at the earliest possible point in the application lifecycle (`index.js` for the app, a setup file for tests) to prevent race conditions.

---

-   **Overall Architecture:** Follows a strict `Controller -> Service -> Data Access` pattern.
    -   `Controllers` (`api/`): Handle HTTP `req`/`res`. Absolutely no business logic. Their job is to parse the request, call a single service method, and format the response.
    -   `Services` (`services/`): Contain all business logic and orchestration. They are "pure" and know nothing about HTTP. They are the only layer allowed to call other services.
    -   `Data Layers` (`dal/`, `bal/`): Handle all external communication (Databases, Blockchains). They should not contain any business logic, only data fetching/persisting.

-   **Database (`dal/`):**
    -   **Primary DB:** PostgreSQL.
    *   **Schema Management:** All schema changes **must** be done via `node-pg-migrate` files. No manual `ALTER TABLE` commands. The state of the database schema is defined by code in the repository.
    *   **Querying:** Use the `pg` library. All database access **must** be through DAL models. These models are the only part of the application allowed to contain raw SQL and **must** use parameterized queries to prevent SQL injection.

-   **Blockchain (`bal/`):**
    -   **Abstraction:** All chain-specific logic **must** be contained within a client in `src/bal/connectors/`. The rest of the application should have no knowledge of `web3.js` or `@solana/web3.js`.
    -   **Standardization:** All connector clients **must** return data that conforms to our standardized interfaces (e.g., `AssetBalance`). This ensures the `PortfolioService` can treat data from Ethereum and Solana identically.
    -   **Factory Entry Point:** All service-layer interactions with the BAL **must** go through the `chain.factory.js`.

-   **Security:**
    -   **Validation:** All incoming request bodies, parameters, and query strings **must** be validated using `Zod` at the middleware or route level. Fail fast.
    *   **Password Hashing:** Use `bcrypt` with a salt round count of 12.
    *   **Authentication:** Protected routes will be secured using short-lived JWTs. A refresh token mechanism will be used for persistent sessions. Session termination is handled via a Redis-based JWT revocation list.
    *   **Secrets:** No secrets are to be stored in `.env` in production. All secrets will be fetched from AWS Secrets Manager at application startup.

-   **Error Handling:**
    -   **Strategy:** Services and data layers should throw custom, named errors (e.g., `new NotFoundError('User not found')`, `new AuthenticationError('Invalid credentials')`). A global error handler middleware will catch these and format a consistent JSON error response with the appropriate HTTP status code. Generic `Error` types will default to a `500 Internal Server Error`.

-   **Code Style & Quality:**
    -   **Asynchronous Code:** Use `async/await` for all asynchronous operations. Avoid raw `.then()` chains for flow control.
    -   **Immutability:** Favor immutable data structures where possible. Use `Object.freeze()` on the exported `config` object.
    -   **Dependency Injection:** Dependencies (like DAL models or other services) should be passed into service constructors or functions to facilitate easier testing (manual dependency injection).

---

## **4. Project Directory Structure (The Map)**

```
cerberus/
└── cerberus-backend/
    ├── .husky/
    │   └── pre-commit
    ├── db/                                // Database schema management
    │   └── migrations/
    │       └── <timestamp>_create_users_and_wallets_tables.mjs
    ├── node_modules/
    ├── tests/
    │   ├── integration/
    │   │   ├── services/
    │   │   │   └── portfolio.service.test.js
    │   │   └── dal/
    │   │       ├── user.model.test.js
    |   |       └── wallet.model.test.js
    │   ├── e2e/
    │   |    └── health.test.js 
    |   |
    |   └── jest.setup.cjs
    │
    ├── src/
    │   ├── api/
    │   │   ├── routes/
    │   │   │   ├── auth.routes.js
    │   │   │   └── portfolio.routes.js
    │   │   ├── schemas/
    │   │   │   ├── auth.schemas.js
    │   │   │   └── portfolio.schemas.js
    │   │   └── index.js                   // ★ Main API router (combines sub-routers)
    │   │
    │   ├── services/
    │   │   ├── auth.service.js
    │   │   ├── market.service.js
    │   │   └── portfolio.service.js
    │   │
    │   ├── bal/
    │   │   ├── connectors/
    │   │   │   ├── evm.client.js
    │   │   │   └── solana.client.js
    │   │   └── chain.factory.js
    │   │
    │   ├── middleware/
    │   │   ├── authenticate.js
    │   │   ├── errorHandler.js
    │   │   └── validateRequest.js
    │   │
    │   ├── config/
    │   │   ├── index.js                   // Validated config loader
    │   │   └── abis.js
    │   │
    │   ├── data/
    │   │   ├── abis/
    │   │   │   └── erc20.json
    │   │   └── token-lists/
    │   │       ├── ethereum.json
    │   │       └── solana.json
    │   │
    │   ├── dal/
    │   │   ├── postgres.js
    │   │   ├── redis.js
    │   │   └── models/
    │   │       ├── user.model.js
    │   │       └── wallet.model.js
    │   │
    │   ├── utils/
    │   │   ├── logger.js
    │   │   └── bigNumber.js
    │   │
    │   └── app.js                         // ★ NEW: Core Express app instance & global middleware
    │
    ├── .dockerignore
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── .prettierrc
    ├── Dockerfile
    ├── ecosystem.config.js
    ├── eslint.config.mjs                  // ★ RENAMED to .mjs
    ├── index.js                           // Main application entry point (server runner)
    ├── package.json
    ├── package-lock.json
    └── SECURITY.md                     # ★ The formal, non-custodial security policy document
```