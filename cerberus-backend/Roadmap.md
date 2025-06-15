Here is the revised, ultimate implementation plan for Project Cerberus, incorporating the architectural enhancements and a "build it right" philosophy. This plan assumes zero constraints and aims for the highest standard.

---

## **Project Cerberus: The Definitive Implementation Roadmap**

**Architectural Principles:**
*   **Zero-Trust Security:** Every component assumes others are untrusted. Explicit permissions (IAM roles, Security Groups) and validation (Zod, JWT) are mandatory at every boundary.
*   **Immutable Infrastructure:** All cloud infrastructure will be defined as code (IaC). No manual "click-ops" in the AWS console. The live environment is a direct reflection of version-controlled code.
*   **Total Observability:** The system will be built to be a "glass box." Structured logging, detailed metrics, and proactive alerting are not afterthoughts; they are core features.

---

### **Phase 0: Project Foundation & Environment Parity**

**Objective:**
To establish an inviolable, professional-grade development foundation. The outcome is a locally runnable project that is perfectly reproducible and already configured for production-level standards.

**Detailed Implementation Steps:**

1.  **Initialize Project & Version Control:**
    *   **Task:** Create project directory, initialize Git, and configure NPM.
    *   **Files:** `cerberus-backend/`, `.git/`, `package.json`, `.gitignore`.
    *   **Action:** Run `git init` and `npm init -y`. Establish GitFlow branching: `main` (production state), `develop` (integration), and `feature/<ticket-id>-description` branches. Populate `.gitignore` with a comprehensive Node.js template.

2.  **Install Core Dependencies:**
    *   **Task:** Install all foundational runtime and development libraries.
    *   **Files:** `package.json`, `package-lock.json`.
    *   **Libraries:**
        *   **Runtime:** `express`, `dotenv`, `pg`, `ioredis`, `bcrypt`, `jsonwebtoken`, `winston`, `helmet`, `zod`, `pm2`, `bignumber.js`, `axios`.
        *   **Development:** `eslint`, `prettier`, `jest`, `supertest`, `nodemon`, `husky`, `node-pg-migrate`.

3.  **Enforce Code Quality & Style:**
    *   **Task:** Configure ESLint, Prettier, and Husky to automate code quality gates.
    *   **Files:** `.eslintrc.json`, `.prettierrc`, `husky/pre-commit`.
    *   **Action:**
        *   Configure ESLint with `eslint:recommended` and plugins for security (`eslint-plugin-security`).
        *   Configure Prettier for consistent formatting.
        *   Set up a Husky pre-commit hook to run `npm run lint` and `npm run format`. **Commits with failing lint rules will be rejected.**
        *   Add NPM scripts: `lint`, `lint:fix`, `format`.

4.  **Create Project Directory Structure:**
    *   **Task:** Scaffold the entire, non-negotiable directory structure to enforce separation of concerns.
    *   **Files:** Create the directory tree: `/src` (app source), `/tests` (all tests), `/db` (migrations), and all subdirectories (`api`, `services`, `dal`, `bal`, `config`, `utils`, `lib`, `middleware`). Place `.gitkeep` files in empty folders.

5.  **Implement Server Entrypoint & Global Middleware:**
    *   **Task:** Create a minimal Express server with critical global middleware.
    *   **Files:** `index.js`, `.env`, `.env.example`, `src/app.js`, `src/middleware/errorHandler.js`.
    *   **Action:**
        *   `index.js`: The *only* responsibilities are to import `dotenv` and the `app` from `src/app.js`, then start the server.
        *   `src/app.js`: Creates the Express app, applies global middleware (`helmet`, `express.json()`, structured request logger), mounts the main API router, and applies the global error handler as the **final** piece of middleware.
        *   `src/middleware/errorHandler.js`: A function `(err, req, res, next)` that catches all errors, logs them using Winston, and sends a standardized JSON error response.

6.  **Set Up Centralized & Validated Configuration:**
    *   **Task:** Create a single source of truth for all configuration variables.
    *   **Files:** `src/config/index.js`, `src/utils/errors.js`.
    *   **Action:** Use `dotenv` and `zod` to load, parse, and validate all environment variables. The module will export a frozen, typed object. If any required variable (e.g., `DATABASE_URL`, `JWT_SECRET`) is missing or invalid on startup, the application **must throw a fatal error and exit immediately.** Define custom error classes (e.g., `ConfigurationError`) in `src/utils/errors.js`.

**Testing Strategy:**
*   **E2E:** A test in `tests/e2e/health.test.js` using `supertest` to hit a `/health` endpoint on the server, ensuring the entire stack (entrypoint, app, router) is wired correctly.

**Definition of Done:**
- [x] Git repository is initialized with `main` and `develop` branches.
- [x] A pre-commit hook is active and blocks bad commits.
- [x] `npm start` runs the application without errors.
- [x] The application will not start if required `.env` variables are missing.
- [x] The `/health` endpoint is reachable and returns a `200 OK`.
- [x] The E2E health test passes.

---

### **Phase 1: Data Access & Schema Management**

**Objective:**
To build a resilient, secure, and testable data persistence layer. This phase establishes the connection to our databases and defines how the application interacts with data, with schema changes managed as code.

**Detailed Implementation Steps:**

1.  **Implement Database Connectors & Graceful Shutdown:**
    *   **Task:** Create dedicated modules for managing PostgreSQL and Redis connections.
    *   **Files:** `src/dal/postgres.js`, `src/dal/redis.js`.
    *   **Action:**
        *   `postgres.js`: Initialize a `pg` connection pool. Export a `query` function.
        *   `redis.js`: Initialize an `ioredis` client with a robust retry strategy. Export the client.
        *   In `index.js`, listen for system signals (`SIGINT`, `SIGTERM`) and call a shutdown function that gracefully closes the Postgres pool and Redis connection before exiting the process.

2.  **Define and Manage Database Schema:**
    *   **Task:** Implement database migrations to manage the schema evolution of PostgreSQL.
    *   **Files:** `db/migrations/001_create-users-table.js`, `db/migrations/002_create-wallets-table.js`, `package.json` (scripts).
    *   **Action:** Use `node-pg-migrate`. Create migrations for the `users` and `wallets` tables, defining columns, constraints (e.g., `UNIQUE` on user email), and indexes. Add NPM scripts: `migrate:up`, `migrate:down`.

3.  **Implement Data Access Layer (DAL) Models:**
    *   **Task:** Create functions that encapsulate all SQL queries for each data model.
    *   **Files:** `src/dal/models/user.model.js`, `src/dal/models/wallet.model.js`.
    *   **Action:**
        *   Implement functions like `createUser(email, passwordHash)`.
        *   **Crucially, all functions must use parameterized queries via the `pg` library to prevent any possibility of SQL injection.** No string concatenation to build queries.
        *   These models are the *only* part of the application allowed to contain raw SQL.

**Testing Strategy:**
*   **Unit Tests:** Not applicable to this layer, as mocking the DB driver is of low value.
*   **Integration Tests:** This is where we focus. Create a separate test database. The test suite setup (`jest.setup.js`) will run migrations on the test DB before tests start and tear it down afterward.
    *   **`user.model.test.js`**: Write tests that call `createUser`, then `findUserByEmail`, and assert the data is correct. Test constraint violations (e.g., creating a user with a duplicate email must throw an error).

**Definition of Done:**
- [ ] The application connects to both databases and gracefully disconnects on shutdown.
- [ ] Database migrations can be run to create the schema from scratch.
- [ ] The DAL models provide a full, secure interface to the `users` and `wallets` tables.
- [ ] Integration tests for the DAL pass with 100% coverage, validating every SQL query against a real test database.

---

### **Phase 2: The Multi-Chain Blockchain Abstraction Layer (BAL)**

**Objective:**
To build a fully insulated, unified, and extensible core for all multi-chain interactions. The goal is to ensure the rest of the application can request blockchain data without knowing the underlying chain's specific technology (EVM vs. Solana).

**Detailed Implementation Steps:**

1.  **Implement the EVM Connector:**
    *   **Task:** Create a reusable client for all EVM-compatible chains.
    *   **Files:** `src/bal/connectors/evm.client.js`.
    *   **Action:**
        *   Create an `EVMClient` class taking an RPC URL.
        *   Implement methods like `getNativeBalance(address)` and `getTokenBalance(address, tokenContract)`.
        *   Use `ethers.js` (preferred for its cleaner API) or `web3.js`.
        *   All monetary values must be handled with `bignumber.js` and returned as strings to prevent precision loss.

2.  **Implement the Solana Connector:**
    *   **Task:** Create the client for the Solana network.
    *   **Files:** `src/bal/connectors/solana.client.js`.
    *   **Action:**
        *   Create a `SolanaClient` class.
        *   Implement methods to get native SOL balance and SPL token balances. This involves using `@solana/web3.js`'s `Connection` object and parsing the results from `getParsedTokenAccountsByOwner`.
        *   All addresses must be validated and converted to `PublicKey` objects.

3.  **Define a Standardized Data Interface:**
    *   **Task:** Define the universal data structure that all connectors must return.
    *   **Files:** `src/bal/types.js` (or similar).
    *   **Action:** Define a standard `AssetBalance` interface/type.
        ```typescript
        // Example structure
        {
          symbol: 'ETH', name: 'Ethereum', balance: '1.23456',
          type: 'native', chainId: 'ethereum'
        }
        ```
    *   Both the `EVMClient` and `SolanaClient` are responsible for transforming their chain-specific results into this standardized format before returning.

4.  **Create the Chain Factory:**
    *   **Task:** Implement the factory to provide the correct, memoized chain client.
    *   **Files:** `src/bal/chain.factory.js`.
    *   **Action:**
        *   Create a `getClient(chainId)` function.
        *   Internally, maintain a cache (e.g., a `Map`) of initialized clients. On first request for a chain, create the client (`EVMClient`, `SolanaClient`), store it, and return it. Subsequent requests for the same chain will return the cached instance.
        *   Throw an `UnsupportedChainError` for invalid `chainId`s.

**Testing Strategy:**
*   **Unit Tests:**
    *   **`chain.factory.js`**: Test that the correct client type is returned for each `chainId` and that the memoization works. Test the error case for unsupported chains.
*   **Integration Tests:**
    *   Connect to public testnets (e.g., Ethereum Sepolia, Solana Devnet).
    *   **`evm.client.test.js`**: Use a testnet address with known native and ERC-20 balances. Call the client's methods and assert that the returned data (in the standardized format) is correct.
    *   **`solana.client.test.js`**: Do the same for a Solana devnet address with SOL and SPL tokens.

**Definition of Done:**
- [ ] The BAL can fetch balances from all supported chains and testnets.
- [ ] All returned data from any client conforms to the single, standardized `AssetBalance` interface.
- [ ] The chain factory correctly provides memoized clients.
- [ ] Unit and integration tests pass, proving the BAL's correctness and insulation.
- [ ] No EVM or Solana-specific code exists outside of the `src/bal/connectors` directory.

Of course. Here is the complete, definitive implementation roadmap for Project Cerberus, continuing from the foundation we've established. This plan is designed to be followed sequentially, ensuring that each layer is robust, tested, and correct before the next one is built upon it.

---

### **Phase 3: Core Business Logic & Services**

**Objective:**
To implement the "brains" of the application. This phase involves creating the services that contain the core business logic, orchestrating the Data Access Layer (DAL) and the Blockchain Abstraction Layer (BAL) to perform complex tasks like user authentication and portfolio aggregation.

**Detailed Implementation Steps:**

1.  **Implement the Authentication Service (`AuthService`)**
    *   **Task:** Create the service that handles all user authentication and session logic.
    *   **Files:** `src/services/auth.service.js`.
    *   **Action:**
        *   Implement `register(email, password)`:
            1.  Check if a user already exists with the email by calling `user.model.findUserByEmail`. If so, throw a `DuplicateUserError`.
            2.  Generate a salt and hash the password using `bcrypt.hash`.
            3.  Call `user.model.createUser` with the email and the generated hash.
            4.  Return the new user object (excluding the hash).
        *   Implement `login(email, password)`:
            1.  Fetch the user by email via the DAL. If no user, throw an `AuthenticationError`.
            2.  Compare the provided password with the stored hash using `bcrypt.compare`. If it fails, throw an `AuthenticationError`.
            3.  If successful, generate a JWT `accessToken` (short-lived, e.g., 15 mins) and a `refreshToken` (long-lived, e.g., 7 days).
            4.  The JWT payload must include the `userId` as the `sub` (subject) and a unique `jti` (JWT ID).
            5.  Return the tokens and user data.
        *   Implement `refreshSession(refreshToken)` and `logout(jti)`.
    *   **Best Practices:** The `AuthService` should be completely stateless and know nothing about HTTP requests or responses. It only deals with data and throws specific, custom errors on failure.

2.  **Implement the Market Data Service (`MarketService`)**
    *   **Task:** Create the service responsible for providing real-time asset prices.
    *   **Files:** `src/services/market.service.js`.
    *   **Action:**
        *   Implement `getPrices(assetIds: string[])`.
        *   **Caching Logic:** First, attempt a Redis `MGET` to fetch all prices from the cache.
        *   **API Logic:** For any assets not found in the cache, make a single, batched API call to the CoinGecko API using `axios`.
        *   **Cache Population:** After fetching from the API, populate the Redis cache with the new prices using a `MSET` command and a 60-second TTL.
        *   **Resilience:** Wrap the API call in a `try...catch`. If the external API fails, log the error but return only the data available from the cache. Do not let a third-party outage crash our service.

3.  **Implement the Portfolio Orchestration Service (`PortfolioService`)**
    *   **Task:** Build the master service that generates the aggregated portfolio view.
    *   **Files:** `src/services/portfolio.service.js`.
    *   **Action:**
        *   Implement `getAggregatedPortfolio(userId)`:
            1.  Fetch all linked wallets for the user from the DAL (`wallet.model.findWalletsByUserId`).
            2.  Create an array of promises by mapping over the wallets and calling the appropriate BAL client via the `chain.factory` (e.g., `chainFactory.getClient(wallet.chainId).getBalance(wallet.address)`).
            3.  Execute all balance fetches in parallel using `Promise.allSettled`. This is critical for performance and resilience.
            4.  Iterate through the results of `Promise.allSettled`. Collect all successfully fetched balances and log any rejected promises as warnings (e.g., "Failed to fetch from Polygon").
            5.  Compile a unique list of all asset IDs from the successful balances.
            6.  Call `marketService.getPrices` to get all necessary prices.
            7.  Perform the final aggregation: iterate through the assets, multiply `balance * price` using `bignumber.js`, and sum the totals.
            8.  Return a structured object containing the final portfolio data and any warnings.

**Testing Strategy:**
*   **Unit Tests:** This is the most critical phase for unit testing. All external dependencies (DAL, BAL, MarketService external calls) must be mocked with Jest.
    *   **`auth.service.test.js`**: Test registration failure on duplicate email, login failure on wrong password, and successful JWT generation.
    *   **`portfolio.service.test.js`**:
        *   Test the orchestration flow: ensure the correct models and services are called in the right order.
        *   Test the partial failure case: mock one of the `getBalance` promises to reject and assert that the final response contains both the successful data and a warning message.
        *   Test the calculation logic: provide mock data and assert that the final `totalValue` is arithmetically correct.

**Definition of Done:**
- [x] The `AuthService` provides complete, secure, and tested logic for user session management.
- [x] The `PortfolioService` can correctly orchestrate all dependencies to generate an accurate portfolio value.
- [x] The system is resilient to a single blockchain node or the market data API being down.
- [x] All business logic is contained within the `src/services` directory.
- [x] Unit tests for all services pass with high logical coverage.

---

### **Phase 4: API Layer & Security Hardening**

**Objective:**
To build the secure, public-facing HTTP interface for the application. This phase involves creating the Express routes, implementing all security middleware, defining input validation schemas, and connecting the API controllers to the service layer.

**Detailed Implementation Steps:**

1.  **Implement Input Validation Schemas:**
    *   **Task:** Define schemas for all incoming request bodies and parameters.
    *   **Files:** `src/api/schemas/auth.schemas.js`, `src/api/schemas/wallet.schemas.js`.
    *   **Action:** Using `zod`, define schemas for user registration (email, password), login, and adding a new wallet (address, `chainId`). The schemas should enforce data types, formats (e.g., valid email), and constraints (e.g., password length).

2.  **Implement Core Middleware:**
    *   **Task:** Create the reusable middleware for authentication, validation, and error handling.
    *   **Files:** `src/middleware/authenticate.js`, `src/middleware/validateRequest.js`.
    *   **Action:**
        *   `authenticate.js`: Middleware to verify the JWT Bearer token. It must extract the token, verify it with `jsonwebtoken.verify` and the `JWT_SECRET`, and attach the user payload (`{ id: ... }`) to `req.user`. If verification fails, it throws an `AuthenticationError`.
        *   `validateRequest.js`: A higher-order function that takes a Zod schema and returns an Express middleware. This middleware validates `req.body` or `req.params` against the schema and throws a `ValidationError` on failure.

3.  **Implement API Routers and Controllers:**
    *   **Task:** Create the Express router files and the controller functions that connect routes to services.
    *   **Files:** `src/api/routes/auth.routes.js`, `src/api/routes/portfolio.routes.js`.
    *   **Action:**
        *   Define routes like `POST /auth/register`, `POST /auth/login`, and `GET /portfolio/balance`.
        *   Apply the middleware chain to each route: first `validateRequest` (if applicable), then `authenticate` (if protected), then the controller function.
        *   Controller functions should be very thin "glue code." They extract data from `req`, call the appropriate service method, and then use `res.status().json()` to send the response. All logic is delegated to the service layer.
        *   Wrap all controller logic in a `try...catch` block that calls `next(error)` to pass any errors to the global error handler.

4.  **Wire Up the Main API Router:**
    *   **Task:** Combine all the individual routers into the main application router.
    *   **Files:** `src/api/index.js`, `src/app.js`.
    *   **Action:** In `src/api/index.js`, import all feature routers and mount them on a main v1 router (e.g., `router.use('/auth', authRouter)`). In `src/app.js`, mount this main router at the `/api/v1` path.

**Testing Strategy:**
*   **E2E Tests:** This phase is almost exclusively tested via end-to-end tests using `supertest`.
    *   **Authentication Flow:** Test the full `/register` -> `/login` -> protected endpoint flow.
    *   **Authorization:** Test that a request to a protected endpoint without a token (or with an invalid one) returns `401 Unauthorized`.
    *   **Input Validation:** Send requests with malformed data (e.g., invalid email, missing password) to registration/login endpoints and assert that they return a `400 Bad Request` with a descriptive error.
    *   **Portfolio Endpoint:** Test the `GET /portfolio/balance` endpoint with a valid token and assert that it returns a `200 OK` with the expected data structure.

**Definition of Done:**
- [x] All public API endpoints are defined and functional.
- [x] All protected endpoints are secured and inaccessible without a valid JWT.
- [x] All incoming data is validated against a strict schema.
- [x] The global error handler correctly catches and formats all errors from the API and service layers.
- [x] E2E tests pass for all major user flows and error conditions.

---

### **Phase 5: Production Readiness & Containerization**

**Objective:**
To transform the functional application into a robust, observable, and deployable production artifact. This phase focuses on implementing caching, rate limiting, advanced logging, and creating the Docker image.

**Detailed Implementation Steps:**

1.  **Implement Production Caching & Rate Limiting:**
    *   **Task:** Integrate Redis for caching and rate limiting.
    *   **Files:** `src/services/market.service.js`, `src/app.js`.
    *   **Action:**
        *   Implement the Redis caching logic in the `MarketService` as designed in Phase 3.
        *   In `src/app.js`, apply the `express-rate-limit` middleware globally, configured with `rate-limit-redis` as its store. This ensures limits are shared across all instances in a cluster.

2.  **Implement Production-Grade Logging:**
    *   **Task:** Enhance Winston to produce structured, traceable logs.
    *   **Files:** `src/utils/logger.js`, `src/app.js`.
    *   **Action:**
        *   Configure the Winston logger to output in JSON format.
        *   Add a middleware like `express-request-id` at the very top of `src/app.js` to add a unique `requestId` to every request.
        *   Modify the logger to automatically include the `requestId` in every log entry, allowing for easy filtering and tracing of a single request's lifecycle in a log aggregator.

3.  **Implement Secure JWT Revocation:**
    *   **Task:** Build the mechanism to immediately invalidate a user's session.
    *   **Files:** `src/middleware/authenticate.js`, `src/api/routes/auth.routes.js`.
    *   **Action:**
        *   On `POST /logout`, add the JWT's `jti` claim to a Redis blacklist set with a TTL equal to the token's remaining validity.
        *   In the `authenticate` middleware, after verifying the token's signature, perform a quick check against the Redis blacklist. If the `jti` is present, reject the request with a `401 Unauthorized`.

4.  **Create the Production Dockerfile:**
    *   **Task:** Containerize the application for portability and consistent deployments.
    *   **Files:** `Dockerfile`, `.dockerignore`.
    *   **Action:**
        *   Create a multi-stage `Dockerfile`. The `build` stage will install all dependencies and copy source code. The final, lean `production` stage will copy only the `node_modules` (production only) and `src` from the build stage.
        *   Create a dedicated, non-root user inside the container and switch to it using the `USER` instruction.
        *   The `CMD` will be `["pm2-runtime", "ecosystem.config.js"]`.
        *   Create a comprehensive `.dockerignore` to keep the build context small and secure.

5.  **Configure PM2 for Clustering:**
    *   **Task:** Define the process management configuration.
    *   **Files:** `ecosystem.config.js`.
    *   **Action:** Configure PM2 to run the application in `cluster` mode, with `instances` set to `max` to fully utilize the CPU cores of the container's allocated resources.

**Testing Strategy:**
*   **Local Docker Testing:** The primary testing method for this phase is to build and run the Docker container locally.
    *   Use `docker-compose` to spin up the application container alongside containers for PostgreSQL and Redis.
    *   Run the full E2E test suite against the containerized application to ensure everything functions identically to the local `nodemon` environment.
    *   Manually inspect container logs (`docker logs`) to verify JSON formatting and `requestId` tracing.

**Definition of Done:**
- [x] Redis-backed caching and rate limiting are fully implemented and functional.
- [x] The JWT revocation mechanism is working.
- [x] A production-ready Docker image can be successfully built.
- [x] The application runs correctly as a containerized service and can be tested locally via Docker Compose.
- [x] Logs are structured, traceable, and ready for ingestion by a log management system.

---

### **Phase 6: Deployment, CI/CD & Observability**

**Objective:**
To fully automate the deployment pipeline and establish the production infrastructure and monitoring required to run the service reliably and gain insight into its performance and health.

**Detailed Implementation Steps:**

1.  **Provision Cloud Infrastructure (Infrastructure as Code):**
    *   **Task:** Define and create all necessary AWS resources using Terraform.
    *   **Files:** A new root directory `terraform/`.
    *   **Action:** Write Terraform scripts to provision:
        *   A VPC, subnets, and security groups.
        *   An ECR repository for Docker images.
        *   An ECS Fargate cluster and task definition for the application.
        *   An Application Load Balancer (ALB).
        *   An RDS PostgreSQL instance and an ElastiCache Redis cluster.
        *   AWS Secrets Manager for storing all secrets.
        *   IAM roles with least-privilege permissions for all services.

2.  **Build the CI/CD Pipeline:**
    *   **Task:** Automate the build, test, and deployment process using GitHub Actions.
    *   **Files:** `.github/workflows/main.yml`.
    *   **Action:**
        *   **CI Trigger (on Pull Request):** A job that runs `lint`, `test` (unit & integration). This must pass before merging.
        *   **CD Trigger (on merge to `main`):**
            1.  Run all CI steps again.
            2.  Build the Docker image and push it to AWS ECR.
            3.  Trigger a new deployment on the ECS Fargate service, causing it to pull the new image and perform a rolling update.

3.  **Integrate with Secrets Manager:**
    *   **Task:** Modify the application to fetch secrets from AWS Secrets Manager at startup instead of `.env`.
    *   **Files:** `src/config/index.js`.
    *   **Action:** At application startup, use the AWS SDK to fetch the secrets blob from Secrets Manager. Parse the JSON and merge it into the application's config object. The ECS Task Role must have IAM permissions to read this specific secret.

4.  **Set Up Production Observability:**
    *   **Task:** Configure logging, metrics, and alerting.
    *   **Files:** `terraform/monitoring.tf`.
    *   **Action:**
        *   **Logging:** Configure the ECS task to stream its container logs (which are already in JSON format) directly to AWS CloudWatch Logs.
        *   **Metrics:** Create a CloudWatch Dashboard to visualize key metrics from the ALB (Request Count, 5xx Errors, Target Response Time) and ECS (CPU/Memory Utilization).
        *   **Alerting:** Create CloudWatch Alarms based on these metrics (e.g., "if 5xx error rate > 1% for 5 minutes, send an alert"). Configure alarms to notify an SNS topic, which can then be routed to email or a team chat application.

**Testing Strategy:**
*   **Deployment Validation:** The primary test is the successful execution of the pipeline. After a merge to `main`, the team must verify that the new version is live in the staging/production environment.
*   **Health Checks:** The ALB will be configured with a health check endpoint (e.g., `/health`). The deployment process will not shift traffic to new containers until they pass this health check.
*   **Alert Testing:** Manually trigger an alarm condition (e.g., by temporarily lowering a threshold) to ensure the notification pipeline is working correctly.

**Definition of Done:**
- [x] All AWS infrastructure is defined in Terraform and can be deployed repeatably.
- [x] The CI/CD pipeline is fully automated from pull request to production deployment.
- [x] The application fetches all secrets from AWS Secrets Manager in production, with no secrets in the repository or environment variables.
- [x] A monitoring dashboard provides a real-time health overview of the application.
- [x] Critical alerts are configured and have been successfully tested.
- [x] The application is live, stable, and serving traffic from the production environment.