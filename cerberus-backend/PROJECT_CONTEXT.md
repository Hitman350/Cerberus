# Project Cerberus: AI Collaboration Context & Living Documentation
<!-- 
  INSTRUCTIONS FOR THE HUMAN (YOU):
  1. **THIS IS OUR SHARED BRAIN.** Keep it open while you work.
  2. **UPDATE IT AFTER EVERY COMMIT.** The state of this doc MUST match the `develop` branch.
  3. **PASTE RELEVANT SECTIONS TO ME.** At the start of a new work session, copy/paste the relevant parts (e.g., Current State, Goal, Key Decisions) into our chat to brief me.
-->

## 1. Project Vision & Current State

- **High-Level Vision:** To build a secure, high-performance, and scalable multi-chain DeFi wallet backend.
- **Current Goal:** We are building the foundational MVP. The immediate focus is on creating a robust and testable backend structure, starting with user authentication and data access.
- **Current Status:** We are in the middle of **Phase 0: Project Foundation & Setup**.

---

## 2. Master Implementation Roadmap
<!-- 
  HOW TO USE:
  - Update this like a checklist. Change `[ ]` to `[x]` when a task is complete and committed.
  - The `--> YOU ARE HERE` marker helps you and me instantly see where we are.
-->

- **[ ] Phase 0: Project Foundation & Setup** `--> YOU ARE HERE`
  - [x] Create project monorepo structure.
  - [x] Initialize Git and NPM.
  - [x] **Install Core Dependencies & Tooling** (ESLint, Prettier, Jest, etc.).
  - [x] Configure Linter, Formatter, and Pre-commit Hooks.
  - [ ] Implement basic Express server with a `/health` endpoint.
  - [ ] Set up the centralized & validated `config` module.

- **[ ] Phase 1: Data Access & Schema Management**
  - [ ] Implement DB Connectors (`PostgreSQL`, `Redis`).
  - [ ] Implement graceful shutdown logic.
  - [ ] Define and manage database schema with `node-pg-migrate`.
  - [ ] Implement Data Access Layer (DAL) models (`user.model.js`, etc.).
  - [ ] Write integration tests for all DAL models against a test database.

- **[ ] Phase 2: The Blockchain Abstraction Layer (BAL)**
  - [ ] Implement the generic `EVMClient`.
  - [ ] Implement the `SolanaClient`.
  - [ ] Define the standardized `AssetBalance` interface.
  - [ ] Implement the `ChainFactory` to provide clients.
  - [ ] Write integration tests for the BAL against testnets.

- **[ ] Phase 3: Core Business Logic & Services**
  - [ ] Implement `auth.service.js` (registration, login logic).
  - [ ] Unit test the `auth.service.js` with mocked DAL.
  - [ ] Implement `portfolio.service.js` (orchestration logic).

<!-- ... Other phases will be added here as we progress ... -->

---

## 3. Key Architectural Decisions & "Golden Rules"
<!--
  HOW TO USE:
  - This is our constitution. Record every major decision here.
  - This prevents me from suggesting solutions that contradict our established patterns.
-->

- **Overall Architecture:** Follows a strict `Controller -> Service -> Data Access` pattern.
  - `Controllers` (`api/`): Handle HTTP `req`/`res`. Absolutely no business logic.
  - `Services` (`services/`): Contain all business logic. They are "pure" and know nothing about HTTP.
  - `Data Layers` (`dal/`, `bal/`): Handle all external communication (DBs, Blockchains).

- **Database (`dal/`):**
  - **Primary DB:** PostgreSQL.
  - **Schema Management:** All schema changes **must** be done via `node-pg-migrate` files. No manual `ALTER TABLE` commands.
  - **Querying:** Use the `pg` library. All database access **must** be through DAL models, which use parameterized queries to prevent SQL injection.

- **Blockchain (`bal/`):**
  - **Abstraction:** All chain-specific logic **must** be contained within a client in `src/bal/connectors/`.
  - **Standardization:** All clients **must** return data that conforms to our standardized interfaces (e.g., `AssetBalance`). The rest of the app should not know the difference between EVM and Solana data structures.

- **Security:**
  - **Validation:** All incoming request bodies/params **must** be validated using `Zod` at the middleware or route level.
  - **Password Hashing:** Use `bcrypt` with a reasonable salt round count (e.g., 12).
  - **Authentication:** Protected routes will be secured using JWTs.

- **Error Handling:**
  - **Strategy:** Services and data layers should throw custom, named errors (e.g., `new NotFoundError('User not found')`). A global error handler middleware will catch these and format a consistent JSON error response.

---

## 4. Project Directory Structure (The Map)
<!--
  HOW TO USE:
  - Update this only when you add a new key file or restructure directories.
  - This gives me a quick mental map of the codebase.
-->