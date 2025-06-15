This is the culmination of our discussions, synthesized into a single, exhaustive Product Requirements Document (PRD) that adheres to your request for maximum detail, verbosity, and technical completeness. This document is designed to serve as the definitive "source of truth" for the engineering team building Project Cerberus.

---

### **Product Requirements Document: Project Cerberus (DeFi Wallet Backend Platform)**

**Version:** 1.0
**Author:** Aayush Padhy    
**Date:** June 7, 2025

### 1. Project Overview

#### 1.1. Purpose & Vision
Project Cerberus is a foundational, multi-chain API platform conceived to be the central nervous system for a next-generation, non-custodial DeFi wallet. The vision is to abstract the immense and ever-growing complexity of interacting with disparate blockchain networks into a unified, elegant, and exceptionally performant set of APIs. This system will empower our frontend application to deliver a seamless, intuitive, and trustworthy user experience, transforming the chaotic world of multi-chain DeFi into a single, coherent portfolio view. Cerberus is not merely a data provider; it is an engineered bastion of security, data integrity, and operational excellence, designed to be the bedrock upon which user trust is built.

#### 1.2. Target Audience
*   **Primary Audience (Direct Consumer): The Frontend Development Team.** This PRD is their contract. The API must be flawlessly documented, predictable, consistent, and resilient. Its design must anticipate their needs, enabling them to build a world-class user interface with speed, confidence, and minimal friction. Every endpoint, data model, and error code must be crafted with their development experience in mind.
*   **Secondary Audience (Indirect Consumer): DeFi Wallet End-Users.** These users, ranging from crypto-curious newcomers to seasoned DeFi veterans, will never interact with Cerberus directly. However, their entire experience of application speed, data accuracy, reliability, and most importantly, security, is a direct reflection of this system's architecture and performance. Every design decision must be weighed against its impact on the end-user's trust and the perceived safety of their assets.

#### 1.3. Core Problems Being Solved
1.  **Blockchain Fragmentation & Cognitive Overload:** The modern DeFi user operates across numerous, non-interoperable blockchains (e.g., Ethereum, Solana, Polygon, BSC). Each possesses a unique RPC API, disparate data structures, and idiosyncratic token standards. This fragmentation forces users to use multiple tools and mentally stitch together their net worth. Cerberus solves this by providing a single, consistent API interface that normalizes data from all supported chains into a predictable format.
2.  **Data Aggregation Complexity & Performance Penalty:** Accurately calculating a user's true portfolio value is a non-trivial, multi-step process: fetching native balances, fetching all token balances (often requiring multiple calls per chain), fetching real-time market prices from external sources, and performing precise calculations. Offloading this heavy lifting from the client is essential for a fast, responsive user experience. Cerberus performs this complex orchestration on the server-side, delivering a simple, pre-computed result.
3.  **Security, Reliability & Resilience Burden:** Direct client-side interaction with public blockchain nodes is fraught with peril. Public nodes can be slow, go offline without warning, be subject to rate-limiting, or even return malicious or inconsistent data. Cerberus acts as a resilient, fault-tolerant gateway, managing secure connections to a curated set of reliable RPC providers and implementing robust caching and failover logic to shield the user from downstream instability.

#### 1.4. Business Goals
*   **Establish Unshakeable User Trust:** Achieve and maintain a security posture and operational reliability that sets an industry standard, making our wallet a trusted name in a space where trust is paramount.
*   **Accelerate Time-to-Market & Innovation:** Drastically reduce the development cycle for new user-facing features by providing a stable, powerful, and extensible backend platform, allowing the company to out-innovate competitors.
*   **Capture a Multi-Chain User Base:** Strategically and efficiently integrate new, popular blockchains via the Blockchain Abstraction Layer (BAL), attracting users from diverse ecosystems and expanding our Total Addressable Market (TAM).
*   **Minimize Operational & Reputational Risk:** Proactively mitigate the risk of financial loss, data breaches, or reputational damage through a meticulously designed, secure, and highly observable system.

#### 1.5. Success Metrics
*   **Frontend Adoption & Satisfaction:** The Frontend team formally confirms the v1 API meets 100% of their requirements for the initial product launch, measured by a sign-off checklist.
*   **Performance SLA:** P95 latency for the primary `GET /api/v1/portfolio/balance` endpoint will remain below 500ms under production load. P95 latency for all other endpoints will remain below 200ms.
*   **Reliability SLA:** Achieve and maintain a 99.95% API uptime, calculated monthly and excluding pre-announced maintenance windows.
*   **Security Posture:** Zero critical or high-severity vulnerabilities discovered in mandatory quarterly external penetration tests.
*   **Scalability:** The system must horizontally scale to handle a simulated load of 1,000 concurrent users performing portfolio fetches without degrading performance SLAs.
*   **Extensibility:** Time-to-market for adding read-only support for a new, mainstream EVM-compatible chain (e.g., Arbitrum) must be less than 3 developer-days, proving the efficacy of the BAL.

---

### 2. Feature List

Organized by internal system modules.

#### Module 1: Account Management & Security
*   **Feature: User Registration:**
    *   **What it does:** Allows a new user to create a secure account using an email and password. The system generates a unique user ID and securely hashes the password using Argon2id.
    *   **User Benefit:** Provides a standard, secure, and familiar way to create a persistent account for managing their wallet portfolio.
*   **Feature: User Authentication & Session Management:**
    *   **What it does:** Provides secure endpoints for users to log in (`/login`), receiving a short-lived JWT access token and a long-lived refresh token. A `/refresh` endpoint allows for seamless session renewal. A `/logout` endpoint invalidates tokens via a revocation list.
    *   **User Benefit:** Ensures that user sessions are secure, protected against theft, and can be continued across browser sessions without repeatedly entering a password, while also providing a definitive way to terminate all active sessions.
    *   **Connections:** This module is a dependency for all other authenticated features.

#### Module 2: Wallet & Portfolio Management
*   **Feature: Multi-Chain Wallet Linking:**
    *   **What it does:** Allows an authenticated user to associate multiple public blockchain addresses (e.g., one Ethereum address, one Solana address) with their single user account. The system validates the checksum and format of each address upon submission.
    *   **User Benefit:** Enables users to track all their assets across different chains and wallets under a single, unified account, providing a holistic financial overview.
*   **Feature: Aggregated Portfolio Balance Calculation:**
    *   **What it does:** The cornerstone feature. A single API endpoint that orchestrates the complex process of fetching all native and token balances from all linked wallets across all supported chains, fetching their real-time market prices, and calculating the total portfolio value in a user-specified currency (e.g., USD).
    *   **User Benefit:** This is the core value proposition. It transforms a complex, scattered collection of assets into a single, easy-to-understand number representing the user's total net worth.
    *   **Connections:** Relies critically on the Blockchain Abstraction Layer and the Market Data Service.
*   **Feature: Detailed Transaction History:**
    *   **What it does:** Provides a unified, human-readable list of recent transactions for a given linked wallet address. It normalizes disparate on-chain data formats (e.g., an Ethereum transfer vs. a Solana transfer) into a consistent structure.
    *   **User Benefit:** Offers users a clear and understandable audit trail of their recent activity without needing to use a complex block explorer.

#### Module 3: Blockchain Abstraction Layer (BAL)
*   **Feature: Chain-Agnostic Interface & Factory:**
    *   **What it does:** An internal architectural pattern, not a user-facing feature. It defines a standard contract (e.g., `getBalance(address)`, `getTransactions(address)`) and provides a factory function that returns the correct chain-specific client based on a `chainId`.
    *   **User Benefit (Indirect):** Radically simplifies the process of adding new blockchains, meaning the product can respond to market trends and user requests for new chains much faster. Ensures system stability and maintainability.
*   **Feature: EVM & Solana Connectors:**
    *   **What it does:** Concrete implementations of the BAL interface. The EVM Connector contains all logic for interacting with Ethereum, Polygon, and BSC via `web3.js`. The Solana Connector handles all interactions with the Solana network via `@solana/web3.js`.
    *   **User Benefit (Indirect):** Encapsulates the complex, chain-specific logic, isolating it to prevent bugs in one integration from affecting another.

#### Module 4: Market Data Service
*   **Feature: Real-time Price & Metadata Service:**
    *   **What it does:** An internal service responsible for fetching and caching token prices and metadata (name, symbol, decimals, logo URI) from reliable external data sources like CoinGecko.
    *   **User Benefit:** Provides the accurate, real-time market data necessary to calculate portfolio values. Caching ensures this data is delivered to the user with extremely low latency.

---

### 3. User Stories & Flows

#### 3.1. Personas
*   **Priya (The Cautious Newcomer):** 28, a graphic designer who has recently invested in some ETH and SOL. Her primary concerns are security and ease of use. She gets anxious about losing her funds and needs the application to feel safe, simple, and trustworthy.
*   **Alex (The DeFi Power User):** 35, a software engineer who actively trades and yield farms across multiple EVM chains and Solana. He demands speed, real-time data accuracy, and a comprehensive, no-nonsense view of all his assets. Latency is his enemy.
*   **David (The Frontend Developer):** 30, the lead developer building the wallet's user interface. He needs a predictable, well-documented, and error-resilient API. His goal is to build a beautiful and intuitive user experience, and he needs a backend that is a partner, not an obstacle.

#### 3.2. User Stories
*   **Priya:** "As a new user, I want to sign up with my email and a strong password so that I can create an account that feels secure and is under my control."
*   **Priya:** "As someone who is not a financial expert, I want to see my total balance in USD, displayed prominently and clearly, so I can instantly understand the value of my crypto holdings without doing any math."
*   **Alex:** "As a power user, I want the app to reflect changes in my balance and token prices in near real-time (within a minute) so I can make timely and informed trading decisions."
*   **Alex:** "As a multi-chain user, I want to add my primary Ethereum address, my Polygon "degen" address, and my main Solana address to my account so I can see my entire cross-chain net worth in one single view."
*   **David:** "As a developer, I want a single, powerful endpoint to fetch the entire aggregated portfolio, so I don't have to orchestrate dozens of complex, asynchronous calls on the client-side, which would be slow and error-prone."
*   **David:** "As a developer, when an external service like a blockchain node is down, I want the API to return a partial success response with a clear warning flag, so I can gracefully degrade the UI instead of showing a generic, unhelpful 'Error' message to the user."

#### 3.3. Critical User Flow: Initial Portfolio Load

**Scenario:** Alex, a logged-in user with linked Ethereum and Solana addresses, opens the wallet application for the first time in a new session.

| Step | User Action (Alex) | System Action (Frontend) | System Action (Backend - Project Cerberus) |
| :--- | :--- | :--- | :--- |
| 1 | Opens the wallet app. | App detects a valid `refreshToken` in its secure storage. | - |
| 2 | - | Issues a `POST /api/v1/auth/refresh` request with the `refreshToken`. | 1. **Authentication:** Receives `refreshToken`, verifies its signature and expiry. 2. **Authorization:** Looks up the token's session, confirms it's valid. 3. **Action:** Generates a new, short-lived `accessToken`. 4. **Response:** Returns the new `accessToken` to the client. |
| 3 | - | Securely stores the new `accessToken` in memory. Dispatches a request to the main dashboard screen. | - |
| 4 | - | Renders a skeleton UI (loading state) for the portfolio view. Issues a `GET /api/v1/portfolio/balance` request, including the new `accessToken` in the `Authorization: Bearer` header. | 1. **Authentication:** The API Gateway/middleware validates the JWT. It is valid. The `userId` is extracted from the token's `sub` claim and attached to the request object. |
| 5 | - | - | 2. **Data Fetching (DAL):** The Portfolio Service queries the PostgreSQL database: `SELECT address, chain_id FROM wallets WHERE user_id = 'alex-user-id'`. The result is `[ { address: '0x123...', chain_id: 'ethereum' }, { address: 'So111...', chain_id: 'solana' } ]`. |
| 6 | - | - | 3. **Parallel Orchestration (BAL):** The Portfolio Service initiates two **parallel, non-blocking** calls using the BAL Factory: <br>   a. `bal.getClient('ethereum').getAllBalances('0x123...')` <br>   b. `bal.getClient('solana').getAllBalances('So111...')` |
| 7 | - | - | 4. **Parallel Orchestration (Market Data):** Simultaneously, the service compiles a list of all whitelisted assets for these chains from its config and requests their prices from the Market Data Service: `marketService.getPrices(['ethereum', 'solana', 'wrapped-btc', 'serum', ...])`. |
| 8 | - | - | 5. **Execution (BAL & Market Data):** <br>   a. The **EVM Connector** makes multiple RPC calls to an Ethereum node to get ETH and ERC-20 balances. <br>   b. The **Solana Connector** makes RPC calls to a Solana node to get SOL and SPL balances. <br>   c. The **Market Data Service** checks Redis for all requested prices. For any cache misses, it makes a single batch call to the CoinGecko API, then populates the Redis cache with a 60-second TTL. |
| 9 | - | - | 6. **Aggregation & Calculation:** As all `Promise.all` calls resolve, the Portfolio Service receives the structured balance and price data. It iterates through each asset, using a BigNumber library to calculate `value_usd = balance * price`. It sums these values to get per-chain subtotals and a grand total. |
| 10| - | - | 7. **Response Formatting:** The service constructs the final JSON response payload as defined in the API contract, ensuring all numerical values are returned as strings to prevent floating-point precision loss. |
| 11| - | Waits for the loading screen to finish. | The API Gateway sends the `200 OK` response with the JSON payload back to the client. |
| 12| - | Receives the JSON payload. Parses the data and updates the application's state management store (e.g., Redux/Zustand), causing the UI to re-render from the skeleton to the fully populated portfolio view. | - |

---

### 4. Technical Architecture

The architecture is a **"Majestic Monolith,"** leveraging a containerized Node.js application, designed for scalability, security, and operational simplicity.

```mermaid
graph TD
    subgraph "User's Device"
        Frontend[React/Next.js SPA]
    end

    subgraph "AWS Cloud Infrastructure"
        DNS[Route 53] --> WAF[AWS WAF] --> ALB[Application Load Balancer]

        subgraph "VPC - Private Subnet"
            subgraph "ECS/Fargate Cluster (Auto Scaling)"
                Task1[Container Task: Node.js App w/ PM2]
                Task2[Container Task: Node.js App w/ PM2]
                TaskN[Container Task: Node.js App w/ PM2]
            end

            DB[RDS PostgreSQL Instance <br> Multi-AZ Failover]
            Cache[ElastiCache Redis Cluster <br> Read Replicas]
        end

        subgraph "Monitoring & Security"
            CloudWatch[CloudWatch Logs & Metrics] --> Grafana[Managed Grafana Dashboard]
            CloudWatch --> Alarms[SNS Alerts]
            SecretsManager[AWS Secrets Manager]
        end

        ALB --> Task1
        ALB --> Task2
        ALB --> TaskN

        Task1 --> DB
        Task1 --> Cache
        Task1 --> SecretsManager

        Task2 --> DB
        Task2 --> Cache
        Task2 --> SecretsManager
    end

    subgraph "Third-Party Integrations"
        TaskN --> RPC[RPC Providers<br>(e.g., Alchemy, QuickNode)]
        TaskN --> MarketData[Market Data APIs<br>(e.g., CoinGecko)]
    end

    Frontend --> DNS
```

*   **Backend:**
    *   **Language:** Node.js (v18+).
    *   **Framework:** Express.js.
    *   **Database (Primary):** PostgreSQL 14+ (via AWS RDS for managed backups, scaling, and high availability).
    *   **Database (Cache/Ephemeral):** Redis 7+ (via AWS ElastiCache) for caching, rate limiting, and JWT revocation lists.
    *   **Containerization:** Docker with PM2 (`pm2-runtime`) for process management inside the container.
*   **Cloud Provider: AWS**
    *   **Compute:** AWS Fargate for serverless container orchestration, removing the need to manage EC2 instances.
    *   **Networking:** Application Load Balancer (ALB) for traffic distribution, SSL termination. AWS WAF for protection against common web exploits.
    *   **Secrets Management:** AWS Secrets Manager for securely storing and retrieving database credentials, API keys, and JWT secrets.
    *   **Monitoring:** Amazon CloudWatch for logs and metrics, feeding into Amazon Managed Grafana for dashboards and Amazon SNS for alerting.

---

### 5. Data Models

#### `users` table
```sql
-- The central table for all user accounts.
CREATE TABLE users (
    -- A UUID generated by the database, serving as the primary, immutable key.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User's email address. Must be unique and is used for login. Stored in lowercase.
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email = lower(email)),

    -- The securely hashed user password. Generated using Argon2id. CANNOT be null.
    password_hash VARCHAR(255) NOT NULL,

    -- The user's preferred display currency (ISO 4217 code). Defaults to USD.
    preferred_currency VARCHAR(10) DEFAULT 'USD' NOT NULL,

    -- Timestamps for auditing and lifecycle management.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `wallets` table
```sql
-- Associates multiple blockchain wallets with a single user.
CREATE TABLE wallets (
    -- Primary key for the association.
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign key to the users table. If a user is deleted, all their associated wallets are also deleted.
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- A standardized identifier for the blockchain (e.g., 'ethereum', 'solana', 'polygon').
    chain_id VARCHAR(50) NOT NULL,

    -- The public address of the wallet. Case-insensitivity is handled at the application layer.
    address VARCHAR(255) NOT NULL,

    -- Optional user-provided nickname for the wallet (e.g., "My Savings", "DeFi Ape Wallet").
    nickname VARCHAR(100),

    -- Timestamps for auditing.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensures a user cannot add the exact same address on the same chain more than once.
    UNIQUE(user_id, chain_id, address)
);
```

#### Redis Data Structures
*   **Price Cache:**
    *   **Key:** `price:<asset-id>` (e.g., `price:ethereum`, `price:wrapped-solana`).
    *   **Type:** String (JSON encoded object: `{ "usd": "2000.05", "lastUpdated": "..." }`).
    *   **TTL:** 60 seconds.
*   **JWT Revocation List:**
    *   **Key:** `blacklist:jti:<jwt_jti_claim>`.
    *   **Type:** String.
    *   **Value:** `1`.
    *   **TTL:** Set to the remaining expiry time of the blacklisted JWT to ensure automatic cleanup.

---

### 6. API Contracts

All endpoints are prefixed with `/api/v1`. All monetary values in responses are **strings** to preserve precision.

#### `POST /auth/login`
*   **Description:** Authenticates a user with email and password, returning a JWT access/refresh token pair.
*   **Authentication:** None.
*   **Request Body (`application/json`):**
    ```json
    {
      "email": "user@example.com",
      "password": "user_secret_password"
    }
    ```
*   **Success Response (200 OK):** The `refreshToken` should be sent to the client in a secure, `httpOnly` cookie. The `accessToken` is returned in the body.
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "a1b2c3d4-...",
        "email": "user@example.com"
      }
    }
    ```
*   **Error Responses:** `400 Bad Request` (Invalid input), `401 Unauthorized` (Invalid credentials).

#### `GET /portfolio/balance`
*   **Description:** Fetches the fully aggregated portfolio value for the authenticated user. This is the primary data-read endpoint.
*   **Authentication:** JWT Bearer Token required (`Authorization: Bearer <accessToken>`).
*   **Query Parameters:** `currency` (optional, string, e.g., "EUR"): The currency to calculate the total value in. Defaults to the user's `preferred_currency`.
*   **Success Response (200 OK):**
    ```json
    {
      "totalValue": "12345.67",
      "currency": "USD",
      "lastUpdated": "2023-10-26T10:00:00Z",
      "chains": [
        {
          "chainId": "ethereum",
          "chainName": "Ethereum",
          "totalValue": "10150.25",
          "assets": [
            {
              "assetId": "ethereum", "symbol": "ETH", "name": "Ethereum", "logoUri": "...",
              "balance": "5.0", "price": "2000.05", "value": "10000.25"
            },
            {
              "assetId": "chainlink", "symbol": "LINK", "name": "Chainlink", "logoUri": "...",
              "balance": "10.0", "price": "15.00", "value": "150.00"
            }
          ]
        }
      ],
      "warnings": []
    }
    ```
*   **Error Responses:** `401 Unauthorized` (Invalid/expired JWT), `503 Service Unavailable` (If all critical downstream services are unreachable).

---

### 7. Security Requirements

1.  **Authentication & Authorization:** All protected endpoints MUST use JWT Bearer token authentication. A robust refresh token flow will be implemented. The system MUST enforce resource ownership (e.g., a user can only view their own wallets).
2.  **Data Protection:**
    *   **In Transit:** All communication MUST use TLS 1.3 or higher.
    *   **At Rest:** Passwords MUST be hashed using `Argon2id`. The PostgreSQL database MUST be encrypted at rest.
3.  **Secure Coding & Infrastructure:**
    *   All user-provided input MUST be rigorously validated using `Zod` schemas to prevent injection, overflow, and other data-based attacks.
    *   Use `helmet` middleware for standard security headers.
    *   **Non-Custodial Principle:** The architecture will be strictly non-custodial. Private keys will NEVER be transmitted to, stored by, or handled by the server. This will be formally documented in `SECURITY.md`.
    *   The application MUST run as a non-root user inside the Docker container.
    *   Secrets MUST be managed via AWS Secrets Manager, not environment variables in production.
4.  **Rate Limiting:** Implement global rate limiting using Redis to protect against brute-force login attempts and resource exhaustion DoS attacks.

---

### 8. Performance and Scalability Requirements

*   **Latency:** Defined in Success Metrics (P95 < 500ms for portfolio, < 200ms for others).
*   **Throughput:** Each container task should be benchmarked to handle at least 1000 requests per minute (RPM).
*   **Autoscaling:** The ECS/Fargate service will be configured with a target tracking scaling policy based on average CPU utilization (e.g., scale up when CPU > 70% for 3 mins, scale down when CPU < 40% for 15 mins).
*   **Bottleneck Mitigation:** The primary anticipated bottlenecks are external API calls to RPC nodes and market data providers. The Redis caching layer for market data and potential future caching for balance data are the primary mitigation strategies.

---

### 9. Monitoring and Observability

*   **Metrics (CloudWatch/Prometheus):**
    *   **RED Method:** Request **R**ate, **E**rror Rate (per endpoint, globally), and **D**uration (histograms/percentiles) for all API endpoints.
    *   **System:** CPU/Memory Utilization of container tasks.
    *   **Dependencies:** Latency and error rates for calls to external RPC nodes and market data APIs. Cache hit/miss ratio for Redis.
*   **Logging (CloudWatch Logs):**
    *   All logs MUST be structured (JSON format).
    *   Every request MUST be tagged with a unique `requestId` which is included in every log line generated during that request's lifecycle.
*   **Alerting (SNS via CloudWatch Alarms):**
    *   **Critical Alerts (page the on-call engineer):** API 5xx error rate > 5% for 5 mins. P99 latency > 3s for 5 mins.
    *   **Warning Alerts (notify via Slack/email):** High CPU/Memory utilization, low Redis cache hit ratio (< 80%), elevated latency for a specific downstream dependency.

---

### 10. Deployment & DevOps

*   **CI/CD Pipeline (GitHub Actions):**
    1.  **On Pull Request to `main`:** `lint` -> `tsc` (if using TS) -> `test` (unit & integration). All must pass.
    2.  **On Merge to `main`:** All previous steps, plus -> `docker build` -> `docker push` to AWS ECR -> Deploy to **Staging** environment.
    3.  **On Git Tag (e.g., `v1.0.0`):** A manual approval workflow in GitHub Actions triggers the deployment of the validated image from **Staging** to the **Production** environment.
*   **Environments:**
    *   **Development:** Local machines using Docker Compose.
    *   **Staging:** A full replica of the production AWS environment, using its own database. Used for end-to-end testing and QA.
    *   **Production:** The live, user-facing environment with full monitoring, alerting, and autoscaling enabled.
*   **Deployment Strategy:** Blue/Green deployment managed by AWS CodeDeploy or native ECS functionality. This allows for zero-downtime deployments and instantaneous rollbacks by shifting traffic.

---

### 11. Edge Cases and Constraints

1.  **User Input:** User enters an invalid or checksum-failed blockchain address. User attempts to add an address for an unsupported chain.
2.  **Data State:** User tries to add a wallet address that is already linked to their account. A user deletes their account, and all associated data must be purged correctly via `ON DELETE CASCADE`.
3.  **Network & Third-Party Failures:** An RPC provider for one chain is down, but others are up (system must return partial data). The market data API is down (system should use stale cache data if available, otherwise return balances without values). The system hits the rate limit of a third-party API. The Redis server is unavailable.
4.  **Data Edge Cases:** A token a user holds is not listed on the market data provider (should be shown with balance but no value). A token has more than 18 decimals, requiring BigNumber handling. A user has thousands of tokens, potentially timing out the request (needs pagination or optimization). A blockchain undergoes a re-org, causing recently fetched data to become invalid.
5.  **Security & Session:** A user's `accessToken` expires mid-request. A user's `refreshToken` is compromised. A brute-force attack is attempted on `/auth/login`. A malformed JWT is provided. A CSRF attack is attempted.
6.  **System Constraints:** The database connection pool is exhausted. The server's file descriptors are exhausted. A memory leak in the Node.js process causes performance degradation over time. A cache stampede occurs.

---

### 12. Non-functional Requirements

*   **Uptime/SLA:** 99.95% monthly uptime for the API.
*   **Data Integrity:** All financial and balance calculations MUST use a dedicated BigNumber library to prevent floating-point precision errors.
*   **Internationalization (i18n):** The API itself will be locale-agnostic. All data is returned in a standard format (UTF-8). The frontend is responsible for all translations.
*   **Accessibility (a11y):** While an API is not directly accessible, it must provide all necessary data for the frontend to meet WCAG 2.1 AA compliance (e.g., providing full text names for tokens, not just symbols).

---

### 13. Open Questions

1.  **RPC Provider Strategy:** What is the initial budget for third-party RPC providers? Will we use a single premium provider (e.g., Alchemy) for all chains it supports, or a multi-provider strategy to increase resilience? What is our failover policy?
2.  **Market Data Strategy:** What is the fallback plan if our primary market data provider (e.g., CoinGecko) is down for an extended period? Do we need a secondary source?
3.  **Custom Token Policy:** Will users be allowed to add custom, unvetted token contracts? If so, what is the security review process and how do we clearly label these as high-risk assets in the API response to protect users?
4.  **Transaction History Scope (v1):** Defining a truly universal transaction history format is complex. For the v1 launch, what are the minimum required event types to normalize and display (e.g., Send, Receive, Swap, Approve)?
5.  **Rate Limit Thresholds:** What are the initial numerical values for our rate limits (e.g., 100 requests/minute per IP, 20 login attempts/hour per user)? These will need to be tuned based on initial usage patterns.