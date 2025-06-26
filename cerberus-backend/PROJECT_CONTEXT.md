This is the complete, final "living document" for Project Cerberus, fully filled out according to our extensive discussions. This document is designed to be the ultimate context-provider and "shared brain" for collaborating on this project.

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
-    **Current Goal:** We are building the foundational MVP. Having completed the data and blockchain layers, our next focus is to build the service layer that contains our core business logic.
-   **Current Status:** We have completed Phases 0, 1, and 2. We are now starting **Phase 3: Core Business Logic & Services**.

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

-   **[x] Phase 2: The Blockchain Abstraction Layer (BAL)** 
    *   [x] Implement the generic `EVMClient`.
    *   [x] Implement the `SolanaClient`.
    *   [x] Define the standardized `AssetBalance` interface.
    *   [x] Implement the `ChainFactory` to provide clients.
    *   [x] Write integration tests for the BAL against testnets.

-   **[ ] Phase 3: Core Business Logic & Services** `--> YOU ARE HERE`
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
  This is our constitution, consolidated and cleaned. It prevents me from suggesting solutions that contradict our choices.
-->

-   **Architecture:** Strict `Controller -> Service -> Data Access` pattern. Controllers are thin; Services contain business logic; DALs/BALs handle external data.
-   **Database:**
    -   **Connection:** Use a **lazy-initialized singleton pattern** for the PostgreSQL connection pool to prevent test environment lifecycle issues.
    -   **Schema:** All schema changes are managed via `node-pg-migrate`.
    -   **Querying:** All database access is through DAL models using parameterized queries.
-   **Blockchain (BAL):**
    -   **Abstraction:** All chain-specific logic is encapsulated within connector clients in `src/bal/connectors/`.
    -   **Standardization:** All connectors MUST return data that conforms to our standard `AssetBalance` interface.
    -   **Entry Point:** All service-layer interactions with the BAL MUST go through the `chain.factory.js`.
-   **Security:**
    -   **Validation:** All API inputs are validated upfront with `Zod`.
    -   **Password Hashing:** Use **`argon2id`** (via the `argon2` library) for password hashing.
    -   **Authentication:** JWTs for access control.
-   **Error Handling:** Services throw custom, named errors. A global error handler middleware will catch them and format a consistent JSON response.
-   **Testing:**
    -   **DAL/BAL:** Tested with **integration tests** against real (Dockerized or testnet) external services.
    -   **Services:** Tested with **unit tests**, mocking all external dependencies (DAL, BAL, other services).
    -   **API:** Tested with **E2E tests** using `supertest`.
-   **Environment Variables:** Must be loaded at the earliest possible point in the application lifecycle (`index.js` for the app, a setup file for tests) to prevent race conditions.
-   **Code Style:** Use `async/await` for all asynchronous operations. Favor immutability where practical.


---


## **4. Project Directory Structure (The Map)**

```
cerberus/
└── cerberus-backend/
    ├── .husky/
    │   └── pre-commit
    ├── db/
    │   └── migrations/
    │       └── <timestamp>_create_users_and_wallets_tables.mjs
    ├── node_modules/
    ├── tests/
    │   ├── e2e/
    │   │   └── health.test.js
    │   ├── integration/
    │   │   ├── bal/
    │   │   │   ├── evm.client.test.js
    │   │   │   └── solana.client.test.js
    │   │   └── dal/
    │   │       ├── user.model.test.js
    │   │       └── wallet.model.test.js
    │   ├── unit/
    │   │   └── bal/
    │   │       └── chain.factory.test.js
    │   └── jest.setup.cjs
    │
    ├── src/
    │   ├── api/
    │   │   ├── routes/
    │   │   │   ├── auth.routes.js
    │   │   │   └── portfolio.routes.js
    │   │   ├── schemas/
    │   │   │   ├── auth.schemas.js
    │   │   │   └── portfolio.schemas.js
    │   │   └── index.js
    │   │
    │   ├── bal/
    │   │   ├── connectors/
    │   │   │   ├── evm.client.js
    │   │   │   └── solana.client.js
    │   │   ├── chain.factory.js
    │   │   └── types.js
    │   │
    │   ├── config/
    │   │   ├── abis.js
    │   │   └── index.js
    │   │
    │   ├── dal/
    │   │   ├── models/
    │   │   │   ├── user.model.js
    │   │   │   └── wallet.model.js
    │   │   ├── postgres.js
    │   │   └── redis.js
    │   │
    │   ├── data/
    │   │   ├── abis/
    │   │   │   └── erc20.json
    │   │   └── token-lists/
    │   │       ├── ethereum.json
    │   │       └── solana.json
    │   │
    │   ├── middleware/
    │   │   ├── authenticate.js
    │   │   ├── errorHandler.js
    │   │   └── validateRequest.js
    │   │
    │   ├── services/
    │   │   ├── auth.service.js
    │   │   ├── market.service.js
    │   │   └── portfolio.service.js
    │   │
    │   ├── utils/
    │   │   ├── bigNumber.js
    │   │   └── logger.js
    │   │
    │   └── app.js
    │
    ├── .dockerignore
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── .prettierrc
    ├── docker-compose.yml
    ├── ecosystem.config.js
    ├── eslint.config.mjs
    ├── jest.config.js
    ├── index.js
    ├── package.json
    ├── package-lock.json
    ├── PROJECT_CONTEXT.md
    ├── Roadmap.md
    └── SECURITY.md
```