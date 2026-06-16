Below is a high-level technical architecture for NG-SOAR that reflects the current architectural decision: **SOARCA-GUI is the main NG-SOAR frontend**, and the old standalone `ng-soar-frontend` must not be reintroduced.

# NG-SOAR High-Level Technical Architecture

## 1. Architectural Overview

NG-SOAR is a demonstration platform for security orchestration, automation, and response in the NG-SOC context. It integrates CACAO playbook authoring, playbook storage, execution, monitoring, manual runtime interaction, and durable execution summary reporting into a single browser-accessible platform.

The architecture is intentionally composed from existing open-source and project-specific components rather than introducing a large custom orchestration layer. The main architectural principle is:

**SOARCA owns CACAO playbooks and execution. SOARCA-GUI provides the NG-SOAR user interface. CACAO Roaster provides the authoring/editor surface. NG-SOAR API adds only the extension services that SOARCA does not persist durably.**

The platform consists of the following primary services:

1. **SOARCA-GUI / NG-SOAR Frontend**
2. **SOARCA backend and CACAO execution engine**
3. **CACAO Roaster**
4. **NG-SOAR API / BFF**
5. **MongoDB**
6. **Mosquitto MQTT broker**
7. **Nginx reverse proxy**

At runtime, users access NG-SOAR through a single browser entrypoint exposed by Nginx. Nginx routes frontend traffic, SOARCA API calls, NG-SOAR API calls, and embedded Roaster traffic to the correct internal services.

---

## 2. Component Diagram Description

At a high level, the component structure is:

```text
+---------------------------------------------------------------+
|                           Browser                             |
|                                                               |
|  NG-SOAR UI                                                   |
|  Dashboard | Playbooks | Playbook Detail | Roaster | Monitor  |
+-------------------------------+-------------------------------+
                                |
                                v
+---------------------------------------------------------------+
|                     Nginx Reverse Proxy                       |
|                                                               |
|  /                 -> SOARCA-GUI / NG-SOAR Frontend           |
|  /api/soarca/*     -> SOARCA API                              |
|  /api/ng-soar/*    -> NG-SOAR API / BFF                       |
|  /_roaster/*       -> CACAO Roaster                           |
+-------------------+----------------------+--------------------+
                    |                      |
                    |                      |
                    v                      v
+--------------------------------+   +--------------------------------+
| SOARCA-GUI / NG-SOAR Frontend  |   | CACAO Roaster                  |
| apps/SOARCA-GUI                |   | apps/CACAO-Roaster             |
|                                |   |                                |
| React + Vite + TypeScript      |   | TypeScript + Webpack           |
| React Query                    |   | CACAO visual authoring/editing |
| NG-SOAR additions under        |   | Exposed as Playbook Editor     |
| src/ng-soar                    |   | Embedded/proxied in frontend   |
+----------------+---------------+   +--------------------------------+
                 |
                 | API calls
                 v
+--------------------------------+   +--------------------------------+
| SOARCA                         |   | NG-SOAR API / BFF              |
| Go backend                     |   | apps/ng-soar-api               |
| CACAO execution engine         |   | Node.js + Express              |
|                                |   |                                |
| Playbook CRUD                  |   | Execution summaries            |
| Execution trigger APIs         |   | Identity resolution            |
| Reporter APIs                  |   | Platform health                |
| Manual input APIs              |   | Last execution lookup          |
| Validation/execution logic     |   | OpenAPI/Swagger docs           |
+----------------+---------------+   +----------------+---------------+
                 |                                    |
                 v                                    v
+----------------------------------------------------------------+
|                            MongoDB                             |
|                                                                |
|  SOARCA-owned collections:                                     |
|  - CACAO playbooks                                             |
|                                                                |
|  NG-SOAR API-owned collections:                                |
|  - execution summaries                                         |
|  - identity records                                            |
+----------------------------------------------------------------+

+----------------------------------------------------------------+
|                         Mosquitto MQTT                         |
|                                                                |
|  MQTT broker used by SOARCA                                    |
+----------------------------------------------------------------+
```

The frontend is not a separate NG-SOAR shell. Instead, NG-SOAR functionality is added inside `apps/SOARCA-GUI`, primarily under:

```text
apps/SOARCA-GUI/src/ng-soar
```

This keeps SOARCA-GUI as the primary runtime interface while allowing NG-SOAR-specific views, adapters, API clients, metadata enrichment, and UI extensions to evolve in a clearly separated internal module.

---

## 3. Deployment and Runtime View

The deployment model is service-oriented and container-friendly. Each major component can be deployed as an independent service behind Nginx.

```text
Runtime services:

1. nginx
   - Public HTTP entrypoint
   - Reverse proxy and route dispatcher
   - Static asset routing
   - Roaster proxy support
   - Websocket support where needed

2. soarca-gui
   - React/Vite frontend
   - Served as the main NG-SOAR UI

3. soarca
   - Go backend
   - CACAO playbook storage, validation, and execution
   - Reporter state
   - Manual runtime input APIs
   - Uses MongoDB and Mosquitto

4. cacao-roaster
   - CACAO playbook authoring and visual editing application
   - Exposed through proxied routes

5. ng-soar-api
   - Node.js/Express BFF
   - Small extension API
   - Uses MongoDB for durable NG-SOAR-specific records

6. mongodb
   - Shared database instance
   - Logical ownership separated by service responsibility

7. mosquitto
   - MQTT broker used by SOARCA
```

The intended browser-facing route structure is:

```text
/                         -> SOARCA-GUI / NG-SOAR Frontend
/api/soarca/*             -> SOARCA API
/api/ng-soar/*            -> NG-SOAR API / BFF
/_roaster/*               -> CACAO Roaster static/runtime route
```

User-facing NG-SOAR routes include:

```text
/dashboard
/playbooks
/playbooks/:playbookId
/playbooks/import
/playbooks/create
/playbooks/:playbookId/edit
/roaster
/roaster/playbook/:playbookId
/monitoring
/monitoring/:executionId
/settings
/health
/api-explorer
```

The exact route naming may vary in implementation, but architecturally these views belong inside the SOARCA-GUI application.

---

## 4. Frontend Architecture

The frontend architecture is centered on **SOARCA-GUI as the primary application**.

```text
apps/SOARCA-GUI
```

This is a React + Vite + TypeScript application. NG-SOAR-specific functionality is added inside the existing SOARCA-GUI codebase rather than in a separate frontend shell.

A recommended internal structure is:

```text
apps/SOARCA-GUI/src/ng-soar/
  api/
    soarcaClient.ts
    ngSoarClient.ts
    roasterRoutes.ts

  components/
    DashboardCards/
    PlaybookTable/
    PlaybookMetadataBadges/
    ExecutionStatusBadge/
    HealthStatusPanel/
    ApiExplorerPanel/

  features/
    dashboard/
    playbooks/
    playbook-detail/
    roaster/
    monitoring/
    settings/
    health/

  hooks/
    usePlaybooks.ts
    usePlaybook.ts
    useExecutionSummaries.ts
    useLastExecution.ts
    usePlatformHealth.ts
    useReporterState.ts

  types/
    cacao.ts
    playbookMetadata.ts
    executionSummary.ts
    identity.ts
    health.ts

  utils/
    playbookMetadata.ts
    identityDisplay.ts
    executionStatus.ts
    versioning.ts
```

### Frontend responsibilities

The frontend is responsible for:

1. Presenting the NG-SOAR dashboard.
2. Listing and filtering CACAO playbooks from SOARCA.
3. Showing enriched playbook metadata.
4. Opening playbook detail pages.
5. Embedding CACAO Roaster as the preferred playbook editor.
6. Supporting playbook import/create/edit flows through SOARCA and Roaster.
7. Displaying monitoring and execution details.
8. Handling manual runtime input through SOARCA-GUI monitoring views.
9. Showing platform health from the NG-SOAR API.
10. Exposing API documentation through an API explorer view.
11. Using React Query for API state management, caching, refetching, and loading/error states.

### React Query usage

React Query should be used as the frontend’s primary server-state mechanism.

Typical query groups:

```text
SOARCA queries:
- usePlaybooks()
- usePlaybook(playbookId)
- useReporterState()
- useExecution(executionId)
- useManualInput(executionId)
- useValidation(playbookId)

NG-SOAR API queries:
- useExecutionSummaries()
- useLastExecution(playbookId)
- useIdentity(identityId)
- usePlatformHealth()
- useOpenApiSpec()
```

Mutations should be used for:

```text
- importing playbooks
- saving playbooks
- triggering execution
- submitting manual runtime input
- persisting execution summaries
- updating identity records where supported
```

### Roaster integration

CACAO Roaster is exposed to users as:

```text
Playbook Editor
```

The frontend route structure should include:

```text
/roaster
/roaster/playbook/:playbookId
```

Internally, these routes embed or proxy the Roaster application through Nginx using:

```text
/_roaster/*
```

The frontend should treat Roaster as the preferred authoring, validation, inspection, and editing surface. NG-SOAR should not attempt to duplicate Roaster’s full CACAO graphical editing capabilities in separate frontend components.

---

## 5. Backend and API Architecture

The backend architecture is deliberately split between **SOARCA** and the **NG-SOAR API/BFF**.

## 5.1 SOARCA

SOARCA is the core backend and execution engine.

Responsibilities:

```text
- CACAO playbook storage
- Playbook CRUD APIs
- Playbook validation
- Playbook execution
- Execution trigger APIs
- Reporter APIs
- Manual input APIs
- Execution status APIs
- MQTT integration through Mosquitto
```

SOARCA is the authoritative service for playbooks. MongoDB playbook collections owned by SOARCA should be treated as the source of truth.

NG-SOAR must not introduce a second playbook database or duplicate playbook persistence layer.

## 5.2 NG-SOAR API / BFF

The NG-SOAR API is a minimal Node.js + Express service located at:

```text
apps/ng-soar-api
```

Its purpose is to provide extension functionality that does not naturally belong inside SOARCA or that needs durable storage beyond SOARCA reporter state.

Responsibilities:

```text
- Persist execution summaries
- Provide durable last execution lookup
- Periodically sync from SOARCA reporter state
- Resolve CACAO identities into display names
- Store identity records
- Provide platform health aggregation
- Expose OpenAPI/Swagger documentation
```

The NG-SOAR API should remain small. It should not become a competing SOAR backend.

Recommended route groups:

```text
/api/ng-soar/health
/api/ng-soar/executions/summaries
/api/ng-soar/executions/latest/:playbookId
/api/ng-soar/identities/:identityId
/api/ng-soar/openapi.json
/api/ng-soar/docs
```

Possible internal modules:

```text
apps/ng-soar-api/src/
  server.ts
  config.ts

  routes/
    health.routes.ts
    executionSummaries.routes.ts
    identities.routes.ts
    docs.routes.ts

  services/
    soarcaReporterSync.service.ts
    executionSummary.service.ts
    identity.service.ts
    health.service.ts

  repositories/
    executionSummary.repository.ts
    identity.repository.ts

  clients/
    soarca.client.ts

  models/
    executionSummary.model.ts
    identity.model.ts
```

The key architectural boundary is:

```text
SOARCA = playbooks and execution authority
NG-SOAR API = durable extension metadata and platform aggregation
```

---

## 6. Data Ownership

Clear data ownership is essential to avoid architectural drift.

| Data / Capability              | Owning Service   | Storage                       | Notes                                                   |
| ------------------------------ | ---------------- | ----------------------------- | ------------------------------------------------------- |
| CACAO playbooks                | SOARCA           | MongoDB                       | Authoritative playbook store                            |
| Playbook CRUD                  | SOARCA           | MongoDB                       | NG-SOAR frontend calls SOARCA APIs                      |
| Playbook validation            | SOARCA / Roaster | SOARCA + Roaster UI           | Roaster preferred UI; SOARCA validates before execution |
| Playbook execution             | SOARCA           | SOARCA runtime state          | SOARCA owns execution lifecycle                         |
| Reporter state                 | SOARCA           | SOARCA runtime/reporter state | May be temporary                                        |
| Manual runtime input           | SOARCA           | SOARCA runtime APIs           | Handled through SOARCA-GUI monitoring views             |
| Execution summaries            | NG-SOAR API      | MongoDB                       | Durable summary derived from SOARCA reporter state      |
| Last execution status          | NG-SOAR API      | MongoDB                       | Used by dashboard and playbook pages                    |
| CACAO identity display records | NG-SOAR API      | MongoDB                       | Used for readable author/identity display               |
| Platform health                | NG-SOAR API      | Aggregated from services      | NG-SOAR API provides health aggregation                 |
| API documentation              | NG-SOAR API      | Generated/static OpenAPI      | Swagger/OpenAPI endpoints                               |

The most important rule:

**Do not create a duplicate NG-SOAR playbook store.**

All playbook reads/writes should go through SOARCA unless a temporary UI draft state is needed before saving. Temporary frontend state is acceptable; persistent duplicate playbook storage is not.

---

## 7. Key Data Flows

## 7.1 Dashboard Loading Flow

```text
User opens dashboard
    |
    v
SOARCA-GUI / NG-SOAR frontend loads:
    |
    |-- playbooks from SOARCA
    |-- reporter state from SOARCA
    |-- execution summaries from NG-SOAR API
    |-- platform health from NG-SOAR API
    |
    v
Frontend merges and presents:
    |
    |-- playbook counts
    |-- execution status overview
    |-- last execution state
    |-- validation/executable indicators
    |-- platform health
```

The dashboard is an aggregation view. It should not own the underlying data.

## 7.2 Playbook Library Flow

```text
User opens /playbooks
    |
    v
Frontend queries SOARCA playbook APIs
    |
    v
SOARCA returns CACAO playbooks / metadata
    |
    v
Frontend enriches metadata:
    |
    |-- labels
    |-- playbook type
    |-- author identity display name
    |-- manual-step presence
    |-- validation/executable status
    |-- derived/version metadata
    |-- last execution status from NG-SOAR API
    |
    v
User searches, filters, opens playbook detail
```

Metadata enrichment is a frontend/API composition concern. The underlying playbook remains owned by SOARCA.

## 7.3 Playbook Detail Flow

```text
User opens /playbooks/:playbookId
    |
    v
Frontend loads:
    |
    |-- playbook from SOARCA
    |-- last execution summary from NG-SOAR API
    |-- identity display data from NG-SOAR API
    |-- reporter/execution status from SOARCA if relevant
    |
    v
Frontend renders:
    |
    |-- CACAO metadata
    |-- validation/executable status
    |-- author/identity information
    |-- execution history summary
    |-- actions: edit, validate, execute, open in Roaster
```

## 7.4 Roaster Editing Flow

```text
User selects "Open in Playbook Editor"
    |
    v
Frontend navigates to /roaster/playbook/:playbookId
    |
    v
Route embeds/proxies CACAO Roaster via Nginx
    |
    v
Roaster loads playbook through SOARCA-compatible flow
    |
    v
User edits, inspects, validates, saves
    |
    v
Saved playbook remains in SOARCA/MongoDB
```

Roaster is not a separate product in the user experience. It is exposed as the NG-SOAR Playbook Editor.

## 7.5 Execution Flow

```text
User triggers playbook execution
    |
    v
Frontend calls SOARCA execution trigger API
    |
    v
SOARCA validates and executes CACAO playbook
    |
    v
SOARCA uses Mosquitto/MQTT where required
    |
    v
SOARCA exposes execution status and reporter state
    |
    v
Frontend monitors execution through /monitoring
    |
    v
If manual input is required:
    |
    v
SOARCA-GUI monitoring view collects and submits manual input
```

SOARCA remains responsible for execution semantics, runtime state, validation, and manual input handling.

## 7.6 Execution Summary Persistence Flow

```text
SOARCA produces reporter/execution state
    |
    v
NG-SOAR API periodically syncs reporter state from SOARCA
    |
    v
NG-SOAR API derives execution summary
    |
    v
NG-SOAR API stores durable summary in MongoDB
    |
    v
Dashboard and playbook pages query NG-SOAR API
    |
    v
Frontend displays durable last execution status
```

This flow exists because SOARCA reporter data may be temporary. NG-SOAR API provides durable summary-level information without taking over execution ownership.

---

## 8. Integration Points

## 8.1 SOARCA-GUI ↔ SOARCA

Primary integration for:

```text
- playbook listing
- playbook detail retrieval
- playbook CRUD
- validation
- execution triggering
- execution monitoring
- reporter state
- manual runtime input
- platform/status endpoints exposed by SOARCA
```

## 8.2 SOARCA-GUI ↔ NG-SOAR API

Primary integration for:

```text
- durable execution summaries
- last execution lookup
- identity display resolution
- platform health aggregation
- OpenAPI/Swagger documentation
```

## 8.3 SOARCA-GUI ↔ CACAO Roaster

Primary integration for:

```text
- visual CACAO playbook authoring
- playbook editing
- playbook inspection
- playbook validation support
```

Implemented through:

```text
/roaster
/roaster/playbook/:playbookId
/_roaster/*
```

## 8.4 NG-SOAR API ↔ SOARCA

Primary integration for:

```text
- periodic reporter state synchronization
- deriving durable execution summaries
- checking SOARCA availability for health reporting
```

## 8.5 SOARCA ↔ MongoDB

Primary integration for:

```text
- CACAO playbook storage
- playbook retrieval
- playbook updates
```

## 8.6 NG-SOAR API ↔ MongoDB

Primary integration for:

```text
- execution summary persistence
- identity record persistence
```

## 8.7 SOARCA ↔ Mosquitto

Primary integration for:

```text
- MQTT-based SOARCA runtime communication
- execution-related messaging where required by SOARCA
```

## 8.8 Browser ↔ Nginx

Primary browser-facing integration for:

```text
- frontend access
- API routing
- Roaster asset proxying
- websocket forwarding where required
```

---

## 9. Versioning Model

The current versioning model is intentionally lightweight.

At this stage, playbook versioning can be represented using:

```text
- CACAO playbook ID
- modified datetime
- optional version label
- derived metadata in the frontend
```

This is sufficient for the current demonstration platform because SOARCA remains the authoritative playbook store and NG-SOAR does not yet provide a full version-history subsystem.

A future richer versioning model may include:

```text
- immutable playbook revisions
- explicit version graph
- diff between playbook versions
- rollback support
- release labels
- provenance metadata
- approval workflow
- audit trail
```

This should be introduced only when needed. Adding rich versioning too early would complicate data ownership and risk creating a parallel playbook persistence layer.

---

## 10. Security Architecture

Authentication and API security are staged future hardening concerns.

The current architecture should describe security as planned and incremental rather than fully implemented.

Recommended staged security roadmap:

### Stage 1: API Key Protection

```text
- Protect SOARCA and NG-SOAR API endpoints with API keys.
- Configure Nginx to forward required internal credentials.
- Keep service-to-service credentials outside frontend code.
- Use environment variables or secret management in deployment.
```

### Stage 2: Frontend Login and Session

```text
- Add user login to SOARCA-GUI / NG-SOAR frontend.
- Introduce session or token-based authentication.
- Protect dashboard, playbook, monitoring, settings, and API explorer views.
```

### Stage 3: OIDC and Role-Based Authorization

```text
- Integrate OIDC provider.
- Add user roles.
- Enforce authorization on sensitive actions:
  - playbook editing
  - playbook deletion
  - execution triggering
  - manual runtime input
  - settings changes
  - API documentation access
```

Possible roles:

```text
- Viewer
- Analyst
- Playbook Author
- Operator
- Administrator
```

Longer-term hardening should also include:

```text
- audit logging
- request tracing
- execution approval policies
- secrets management
- TLS everywhere
- per-service network policies
- container image scanning
- secure default headers in Nginx
- rate limiting for exposed APIs
```

---

## 11. Current Limitations

The current architecture is suitable for a demonstration platform but has deliberate limitations.

### 11.1 Lightweight Versioning

Current versioning is based on playbook ID, modification time, and optional labels. It does not yet provide full revision history, rollback, approval chains, or immutable release artifacts.

### 11.2 Limited Authentication and Authorization

Authentication and role-based access control are planned but not yet the core implementation focus. This is acceptable for a controlled demonstration environment but must be hardened before production deployment.

### 11.3 Roaster Embedded as a Separate Application

CACAO Roaster is integrated as a first-class editor route, but it remains a separate application embedded/proxied into the SOARCA-GUI experience. This is pragmatic and avoids rebuilding Roaster functionality, but it requires careful route, asset, and state handling.

### 11.4 Execution Summaries Are Derived

NG-SOAR API stores durable execution summaries derived from SOARCA reporter state. The summary is not the execution source of truth. SOARCA remains authoritative for actual execution state.

### 11.5 No Duplicate Playbook Store

This is a constraint, not a weakness. NG-SOAR intentionally does not own playbook persistence. However, this means richer NG-SOAR-specific metadata must either be derived or stored separately without breaking SOARCA ownership.

### 11.6 Health Is Aggregated

Platform health is aggregated through the NG-SOAR API. Health reporting depends on the availability and quality of service-level health endpoints from SOARCA, MongoDB, Roaster, and other components.

---

## 12. Future Architecture Considerations

The architecture can evolve in several directions without violating the current design.

### 12.1 Rich Playbook Lifecycle Management

Future capabilities may include:

```text
- playbook version history
- diff and rollback
- approval workflows
- signed playbook releases
- provenance tracking
- author/reviewer metadata
- lifecycle states: draft, validated, approved, deprecated
```

This should be added around SOARCA’s playbook source of truth, not by replacing it.

### 12.2 Stronger Identity and Access Management

The platform should move toward:

```text
- OIDC login
- role-based access control
- service-to-service authentication
- audit logs
- least-privilege access
```

This is especially important if NG-SOAR is used outside a local demonstration environment.

### 12.3 Event-Driven Execution Summary Pipeline

The current periodic sync from SOARCA reporter state is simple and robust for demonstration purposes. Later, it may be replaced or complemented by an event-driven mechanism:

```text
SOARCA execution event
    -> message bus / webhook / MQTT topic
    -> NG-SOAR API consumer
    -> durable execution summary
    -> frontend update
```

This would reduce polling and improve near-real-time dashboard updates.

### 12.4 Better Roaster-SOARCA State Synchronization

Future work may improve:

```text
- direct open/save contract between Roaster and SOARCA
- postMessage communication between iframe and parent frontend
- unsaved-change detection
- editor-to-dashboard refresh events
- validation result propagation
```

This would make the embedded editor feel more native inside NG-SOAR.

### 12.5 Observability

The platform should eventually include:

```text
- structured logs
- correlation IDs
- distributed tracing
- metrics
- execution duration statistics
- failed execution diagnostics
- API latency monitoring
```

This would support both operational debugging and demonstration evidence.

### 12.6 Production Deployment Hardening

For production-like deployment, the architecture should add:

```text
- TLS termination
- secure secrets handling
- backup and restore for MongoDB
- container health checks
- restart policies
- service-level resource limits
- vulnerability scanning
- network segmentation
- CI/CD deployment gates
```

### 12.7 External CTI and SOC Integrations

NG-SOAR may later integrate with external systems such as:

```text
- OpenCTI
- MISP
- Wazuh
- SIEM/XDR platforms
- ticketing systems
- notification systems
- OpenC2 endpoints
- TAXII servers
```

These should be introduced as integrations around SOARCA playbook execution and CACAO action semantics, not as hardcoded frontend-only features.

---

## 13. Architectural Summary

The core architecture can be summarized as follows:

```text
NG-SOAR is a SOAR demonstration platform built by extending SOARCA-GUI as the primary frontend. SOARCA remains the authoritative backend for CACAO playbook storage, validation, and execution. CACAO Roaster is integrated as the preferred Playbook Editor through proxied frontend routes. NG-SOAR API is a small extension service that persists durable execution summaries, resolves CACAO identities, aggregates platform health, and exposes API documentation. MongoDB stores both SOARCA-owned playbooks and NG-SOAR-owned extension records, with clear logical ownership boundaries. Nginx provides a single browser entrypoint and routes traffic to the frontend, SOARCA, NG-SOAR API, and Roaster.
```

The most important architectural decisions are:

```text
- SOARCA-GUI is the main frontend.
- The old standalone ng-soar-frontend is removed and should not be reintroduced.
- SOARCA is the playbook source of truth.
- CACAO Roaster is the authoring and editing surface.
- SOARCA-GUI handles monitoring and manual runtime input.
- NG-SOAR API remains small and focused on extension concerns.
- Execution summaries are persisted separately because SOARCA reporter state may be temporary.
- Authentication and authorization are future hardening stages.
```

This gives NG-SOAR a clean demonstration architecture without overengineering the platform or duplicating responsibilities already handled by SOARCA and CACAO Roaster.
