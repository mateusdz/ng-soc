# NG-SOAR Implementation Brief

## Purpose

Implement **NG-SOAR**, the NG-SOC project’s integrated SOAR platform prototype.

The current implementation direction is **Option B**: extend **SOARCA-GUI** into the main NG-SOAR frontend instead of keeping a separate frontend shell. The previous standalone `ng-soar-frontend` reference app has been removed after its useful search, filtering, Roaster hosting, dashboard, and execution-summary display features were migrated into `apps/SOARCA-GUI`.

NG-SOAR should provide one professional web interface for:

1. Discovering, searching, and filtering CACAO playbooks.
2. Importing CACAO playbooks through the existing SOARCA-GUI flow.
3. Inspecting playbook detail using SOARCA-GUI’s existing detail view plus NG-SOAR metadata additions.
4. Opening existing or new playbooks in CACAO Roaster for authoring, validation, editing, versioning, and execution.
5. Monitoring executions and handling manual runtime input through SOARCA-GUI’s existing monitoring views.
6. Persisting execution summary/last status in the NG-SOAR API/MongoDB extension when SOARCA’s reporter data is temporary.

## Current Strategic Decision

SOARCA-GUI becomes the primary frontend.

```text
Browser
  |
  v
NG-SOAR frontend, implemented by extending SOARCA-GUI
  |
  |-- /dashboard
  |-- /playbooks
  |-- /playbooks/new
  |-- /playbooks/:playbookId
  |-- /playbooks/:playbookId/edit
  |-- /roaster
  |-- /roaster/playbook/:playbookId
  |-- /monitoring
  |-- /monitoring/:executionId
  |-- /settings
  |
  v
Reverse proxy
  |
  |-- SOARCA-GUI / NG-SOAR frontend
  |-- CACAO Roaster frontend
  |-- SOARCA API
  |-- NG-SOAR API/BFF
  |
  v
SOARCA + MongoDB
```

The former `apps/ng-soar-frontend` has been removed. SOARCA-GUI is now the only first-party frontend in the main Docker stack.

## Existing Tools

- **SOARCA-GUI**
  - React + Vite + TypeScript frontend for SOARCA.
  - Already includes playbook list, playbook import/create/edit/detail, execution monitoring, manual input, settings, theme, routing, sidebar, and React Query.
  - This is now the main NG-SOAR frontend foundation.

- **SOARCA**
  - Go backend and CACAO execution engine.
  - Owns playbook storage and execution APIs.
  - MongoDB remains the authoritative SOARCA playbook store.

- **CACAO Roaster**
  - CACAO authoring, visual editing, validation, and execution UI.
  - Remains the preferred authoring/inspection surface.
  - Must support opening an existing SOARCA playbook by URL and creating a new playbook.

- **NG-SOAR API/BFF**
  - Minimal Node/Mongo API currently used for execution summary persistence.
  - May later be renamed or moved, but should remain available to SOARCA-GUI while persistence is needed.

## Product Definition

NG-SOAR is a **playbook knowledge management and SOAR orchestration console**.

Primary users:

1. Demo user.
2. Project reviewer.
3. System administrator.
4. Playbook engineer.
5. SOC manager.
6. SOC analyst.

Main success criteria:

1. One main frontend, not multiple competing shells.
2. Strong playbook search and filtering.
3. Smooth handoff between playbook detail, Roaster authoring, SOARCA execution, and SOARCA-GUI monitoring/manual input.
4. Professional NG-SOAR branding and coherent design.
5. Persisted execution summaries and last execution state.

## Key Architectural Decisions

### 1. SOARCA-GUI Is the Main Frontend

The platform should extend SOARCA-GUI rather than embed SOARCA-GUI inside the separate NG-SOAR frontend.

Consequences:

- `apps/SOARCA-GUI` receives NG-SOAR branding, navigation, playbook search/filtering, Roaster routes, dashboard, and persisted execution summary integration.
- The reverse proxy should serve SOARCA-GUI at `/`.
- The old standalone frontend should not be reintroduced unless there is a deliberate product split.

### 2. Playbook Source of Truth Remains SOARCA

Playbooks should be loaded, created, updated, and deleted through SOARCA API endpoints.

SOARCA’s conceptual playbook repository capabilities:

```go
GetPlaybooks() ([]cacao.Playbook, error)
GetPlaybookMetas() ([]api.PlaybookMeta, error)
Create(jsonData *[]byte) (cacao.Playbook, error)
Read(id string) (cacao.Playbook, error)
Update(id string, jsonData *[]byte) (cacao.Playbook, error)
Delete(id string) error
```

Do not introduce a duplicate playbook store unless versioning requires it.

### 3. CACAO Roaster Remains the Authoring UI

SOARCA-GUI/NG-SOAR should expose Roaster as a first-class route:

```text
/roaster
/roaster/playbook/:playbookId
```

Expected behavior:

1. User opens an existing playbook detail page.
2. User selects `Open in Roaster`.
3. Roaster loads the selected SOARCA playbook by ID.
4. User inspects, edits, validates, saves a new version, and executes through Roaster/SOARCA.

Roaster must also remain available for creating a new playbook from scratch.

### 4. SOARCA-GUI Handles Monitoring and Manual Input

Do not duplicate manual input functionality in new NG-SOAR views.

SOARCA-GUI’s monitoring and manual input views remain the execution operation surface:

```text
/monitoring
/monitoring/:executionId
```

NG-SOAR additions should improve navigation, status indicators, and persisted execution summaries around those existing views.

### 5. Execution Summary Persistence Stays in MongoDB via NG-SOAR API

The NG-SOAR API/BFF persists execution summaries so last execution state survives beyond SOARCA’s reporter availability.

Minimum execution summary:

```ts
type ExecutionSummary = {
  id: string;
  playbookId: string;
  playbookModified?: string;
  playbookVersionLabel?: string;
  executionId?: string;
  status:
    | "successfully_executed"
    | "failed"
    | "ongoing"
    | "await_user_input"
    | "server_side_error"
    | "client_side_error"
    | "timeout_error"
    | "exception_condition_error"
    | "unknown";
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  source: "soarca" | "roaster" | "soarca-gui" | "ng-soar";
};
```

### 6. Playbook Versioning

For the prototype, version identity should use:

```text
CACAO playbook ID + modified datetime + optional version label
```

When Roaster saves an edited playbook, prefer creating a new version/document instead of silently overwriting. If SOARCA cannot support multiple versions with the same CACAO ID, add version metadata in the NG-SOAR API/BFF.

## Required NG-SOAR Views in SOARCA-GUI

### 1. Dashboard

Route:

```text
/dashboard
```

Purpose: demo/reviewer landing page.

Show:

- Playbook inventory metrics:
  - total playbooks
  - manual-step playbooks
  - derived/versioned playbooks
  - recently modified playbooks
  - validation status counts when available
- Execution metrics:
  - recent executions
  - last execution status summary
  - running executions
  - awaiting manual input
  - failed executions
- Platform metrics:
  - SOARCA runtime status
  - NG-SOAR API health
  - Roaster availability
  - MongoDB-backed execution persistence status
- Quick links to Playbooks, Playbook Editor/Roaster, Monitoring, and Settings.

Keep this robust and modest. Advanced analytics are not required.

Recommended SOAR dashboard metrics:

Business-value metrics:

- Automation coverage: percentage of playbooks that can run without manual steps.
- Reuse and maturity: total playbooks, derived versions, recently modified playbooks.
- Operational reliability: success/failure trend and failed executions needing attention.
- Analyst workload reduction proxy: manual-input count and average manual wait time when available.
- Readiness/compliance proxy: validated playbooks vs. unvalidated/errored playbooks.

Operational-value metrics:

- Running executions.
- Awaiting manual input.
- Failed executions.
- Last execution per playbook.
- Top recently changed playbooks.
- Platform health by component.
- Reporter sync age and NG-SOAR persistence sync age.

### 2. Playbook Library

Route:

```text
/playbooks
```

Base: existing SOARCA-GUI `PlaybooksPage`.

Required:

- Search across extracted metadata.
- Search across full CACAO JSON.
- Filters for:
  - name/title
  - description
  - labels
  - playbook type
  - author
  - modified datetime/version label
  - manual step presence
  - validation status, if available
  - last execution status, if available
- Saved views:
  - All
  - Manual-step playbooks
  - Recently modified
  - Recently executed
  - Awaiting manual input

Improve the playbook result table/list:

- Use a denser, scan-friendly professional table/list hybrid.
- Show meaningful columns/properties:
  - name
  - author display name, resolved from identity store
  - playbook type
  - labels
  - version label / derived-from indicator
  - workflow step count
  - manual-step indicator
  - validation status if available
  - last execution status
  - created/modified timestamps
  - severity/priority/impact if present
- Keep the workflow preview available, but make it secondary and visually cleaner.
- Avoid showing only raw identity IDs where a display name can be resolved.

The existing SOARCA-GUI detail strengths should be preserved, but the list view should become more information-dense than the initial card-only version.

### 3. Playbook Detail

Route:

```text
/playbooks/:playbookId
```

Base: existing SOARCA-GUI playbook detail page.

Keep:

- Existing detail layout.
- Existing workflow step/timeline visualization.
- Existing actions: edit, delete, and export.

Review:

- SOARCA-GUI currently has a direct `Run` action. The preferred NG-SOAR demo path is still Roaster inspection before execution, so this action should either route through Roaster, require explicit confirmation, or be hidden in a later polish phase.

Add:

- NG-SOAR version label.
- Last execution status and timestamp.
- Manual-step indicator.
- Validation status if available.
- Labels, author, summary, created/modified metadata if absent or incomplete.
- Clear `Open in Roaster` action.
- Optional execution history section.

### 4. Import/Create Playbook

Route:

```text
/playbooks/new
```

Base: existing SOARCA-GUI upload/editor flow.

Required:

- Keep upload/import.
- Keep JSON editor creation.
- After successful import, offer to open the playbook in Roaster.
- Provide a path to create a new playbook directly in Roaster.

### 5. CACAO Roaster

Routes:

```text
/roaster
/roaster/playbook/:playbookId
```

Required:

- Add Roaster navigation in SOARCA-GUI.
- Open the Roaster service through the reverse proxy.
- Existing playbook URL should load selected SOARCA playbook.
- `/roaster` should support creating a new playbook in Roaster.

Product direction:

- Rename the navigation item from **Roaster** to **Playbook Editor** for end users.
- Keep CACAO Roaster as the underlying authoring engine.
- Rename the current integration action to **Execute playbook** where it starts an execution flow.
- Do not navigate away from editing too early, because validation errors and last-minute edits are common.
- Preferred execution UX:
  - Keep the editor visible.
  - Open an execution side panel/drawer or split view beside/below the editor.
  - Show validation status before execution.
  - Allow execution progress/manual-input state to link into `/monitoring/:executionId`.
  - Let the user collapse the execution panel and continue editing.

Roaster export/function extraction:

- Identify Roaster functions for PNG export and STIX 2.1 export.
- Prefer extracting these as reusable modules or callable helper functions rather than duplicating logic.
- Add playbook detail actions:
  - export workflow PNG
  - export STIX 2.1 wrapped CACAO playbook
- Long-term sharing targets: TAXII, OpenCTI, MISP.

### 6. Monitoring and Manual Input

Routes:

```text
/monitoring
/monitoring/:executionId
```

Base: existing SOARCA-GUI monitoring views.

Required:

- Keep manual runtime input working.
- Add/keep visible action-required indicators.
- Link playbook detail and playbook library statuses to monitoring details where possible.

### 7. Settings / Connections

Route:

```text
/settings
```

Show:

- Appearance controls already present in SOARCA-GUI.
- A **Platform Operations** tab for deployment info, status, and health.
- An **API Explorer** tab for Swagger/OpenAPI developer documentation.

Header status indicator:

- The current green dot only indicates SOARCA ping health (`/api/status/ping` returns `pong`).
- It does **not** mean every NG-SOAR container is healthy.
- Replace or augment it with a platform health indicator that can summarize:
  - SOARCA API
  - SOARCA-GUI frontend
  - NG-SOAR API/BFF
  - CACAO Roaster
  - MongoDB
  - Mosquitto
  - reverse proxy

Platform Operations tab:

- Show one card per service/container.
- Relevant properties:
  - service name
  - role/purpose
  - health status
  - public route or internal URL
  - version/build where available
  - runtime/mode where available
  - uptime or last successful check
  - backing dependencies
  - last error if unhealthy
- Initial health sources:
  - SOARCA: `/api/soarca/status/` and `/api/soarca/status/ping`
  - NG-SOAR API: `/api/ng-soar/health`
  - Roaster: proxied `/_roaster/` availability
  - SOARCA-GUI: loaded frontend bundle/version
  - MongoDB: via NG-SOAR API health response and SOARCA status if exposed
  - Mosquitto: initially report configured dependency; add active health endpoint only if needed

API Explorer tab:

- Embed Swagger UI/OpenAPI inside NG-SOAR for authenticated developers.
- Also keep raw OpenAPI JSON and Swagger endpoints directly reachable through the reverse proxy for tooling.
- Recommendation: use both.
  - Embedded API Explorer improves demo/developer discoverability.
  - Direct endpoints are still better for code generation, CI, and external integration.

Suggested API Explorer content:

- SOARCA API Swagger/OpenAPI.
- NG-SOAR API OpenAPI for execution summaries, identity store, platform health, and future versioning.
- Authentication/API-key usage examples once security is added.

### 8. Authentication and API Security

Required:

- Secure the frontend application.
- Protect backend APIs with API keys initially.
- Plan for OIDC or another identity provider when moving beyond demo mode.

Recommended staged approach:

1. Demo/dev API key protection for NG-SOAR API.
   - Require `X-NG-SOAR-API-Key` or `Authorization: Bearer <token>` for mutating endpoints.
   - Keep health endpoint public or expose a limited public health endpoint.
   - Configure keys through environment variables.
2. Frontend login/session.
   - Use a simple login boundary first if no IdP is ready.
   - Move to OIDC later for real users.
3. Reverse proxy protection.
   - Ensure `/api/ng-soar/*` and sensitive SOARCA endpoints are not openly writable in production-like deployments.
4. Role-aware authorization later.
   - Author can edit own playbooks.
   - Non-author can derive/copy and edit their derived playbook.
   - Admin can manage identities and system settings.

### 9. Identity Store and Playbook Author Resolution

Need:

- A separate identity store for CACAO identity objects.
- Playbooks should show author display names instead of raw identity IDs when possible.
- `created_by` / `created_by_ref` values should resolve to identity records.
- New playbooks should align author identity with the logged-in user.

Identity object fields to store:

- `type`
- `spec_version`
- `id`
- `created_by_ref`
- `created`
- `modified`
- `name`
- `description`
- `roles`
- `identity_class`
- `sectors`
- `contact_information`

Initial NG-SOAR API/BFF endpoints:

```text
GET    /api/ng-soar/identities
GET    /api/ng-soar/identities/:id
POST   /api/ng-soar/identities
PATCH  /api/ng-soar/identities/:id
DELETE /api/ng-soar/identities/:id
```

Frontend integration:

- Add identity cache/query hooks in SOARCA-GUI.
- Resolve author names in playbook list, filters, badges, and detail.
- Filters should show identity names but store/use identity IDs.
- Keep raw identity ID visible in detail for traceability.

Future authorization:

- Logged-in user maps to one identity object.
- If user identity matches playbook author, allow edit.
- If not, show **Derive playbook** / **Create editable copy** instead of direct edit.

### 10. Intended Usage Flow

Primary analyst/playbook-engineer flow:

1. Login to NG-SOAR.
2. Review dashboard for health, failed runs, manual input, and recent playbook changes.
3. Search/filter playbook library.
4. Open playbook detail.
5. Review author, metadata, validation state, execution history, and workflow preview.
6. Open in Playbook Editor.
7. Edit/validate playbook in Roaster.
8. Execute playbook from the editor.
9. Keep editor visible while execution panel shows status/manual input.
10. Open full Monitoring detail if deeper execution investigation is needed.
11. Persist last execution state back to the playbook library/dashboard.

Primary developer/integrator flow:

1. Login to NG-SOAR.
2. Open Settings.
3. Review Platform Operations health.
4. Open API Explorer.
5. Read Swagger/OpenAPI docs and API-key usage.
6. Integrate with SOARCA or NG-SOAR API endpoints.

## Repository Direction

Target structure:

```text
ng-soar/
├── apps/
│   ├── SOARCA-GUI/              # primary NG-SOAR frontend
│   ├── CACAO-Roaster/           # reused authoring frontend
│   ├── SOARCA/                  # reused backend source reference
│   └── ng-soar-api/             # execution summary persistence/BFF
├── nginx/
│   └── default.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## API/BFF Endpoints

Current NG-SOAR API/BFF endpoints:

```text
GET    /api/ng-soar/health
GET    /api/ng-soar/execution-summaries
GET    /api/ng-soar/execution-summaries/:id
POST   /api/ng-soar/execution-summaries
PATCH  /api/ng-soar/execution-summaries/:id
GET    /api/ng-soar/playbooks/:id/last-execution
```

Future optional endpoints:

```text
GET    /api/ng-soar/openapi.json
GET    /api/ng-soar/platform/health
POST   /api/ng-soar/playbooks/:id/versions
GET    /api/ng-soar/playbooks/:id/versions
GET    /api/ng-soar/identities
GET    /api/ng-soar/identities/:id
POST   /api/ng-soar/identities
PATCH  /api/ng-soar/identities/:id
DELETE /api/ng-soar/identities/:id
```

Do not duplicate SOARCA playbook CRUD unless versioning or normalization requires it.

## Reverse Proxy Requirements

Use one visible host/port for the user.

Target routes:

```text
/                         -> SOARCA-GUI extended as NG-SOAR
/api/*                    -> SOARCA API through SOARCA-GUI or reverse proxy
/api/ng-soar/*             -> NG-SOAR API/BFF
/_roaster/* or /roaster/*  -> CACAO Roaster service
```

The frontend route `/roaster/*` may render a host/iframe view that points to the proxied Roaster service if Roaster cannot be cleanly served under the same client route.

## Docker Compose Requirements

The stack should start:

- `soarca-gui` as the main frontend.
- `ng-soar-api`.
- `cacao-roaster`.
- `soarca`.
- `mongodb`.
- `mosquitto`.
- `reverse-proxy`.

The former standalone `ng-soar-frontend` service has been removed from the main stack.

## Implementation Phases

### Phase 1: Make SOARCA-GUI the NG-SOAR Frontend

Build:

- Serve SOARCA-GUI at `/` through the reverse proxy.
- Update visible branding to NG-SOAR.
- Update browser title and alt text.
- Keep SOARCA connection status working.
- Keep existing playbook, monitoring, and settings routes working.

Acceptance criteria:

- `http://localhost:8080/` opens the SOARCA-GUI based NG-SOAR app.
- Sidebar/header branding says NG-SOAR.
- Existing playbooks and monitoring pages still work.
- No standalone NG-SOAR frontend service is required for the main visible route.

### Phase 2: Add Roaster Navigation to SOARCA-GUI

Build:

- Add `/roaster` and `/roaster/playbook/:playbookId` routes.
- Add sidebar navigation for Roaster.
- Port the Roaster host route from the former NG-SOAR frontend.
- Allow opening Roaster without a playbook to create a new one.

Acceptance criteria:

- User can open Roaster from SOARCA-GUI/NG-SOAR.
- User can open a specific playbook in Roaster.
- User can start a new playbook in Roaster.

### Phase 3: Migrate Playbook Search and Filters

Build:

- Keep migrated NG-SOAR metadata extraction/search/filter utilities under `apps/SOARCA-GUI/src/ng-soar`.
- Merge them into SOARCA-GUI `PlaybooksPage`.
- Preserve SOARCA-GUI’s existing detail visual style while making search results denser.
- Add saved views.

Acceptance criteria:

- Playbook search works across metadata and full CACAO JSON.
- User can filter by type, author, manual step, validation status, and execution status when available.
- Labels are searched through the free-text metadata/CACAO JSON search instead of a fixed dropdown.
- Existing import/create/detail flows remain intact.

Current status:

- Playbook search results use a scan-friendly table backed by the NG-SOAR search metadata component.
- Columns show CACAO properties including playbook name/description, resolved author display name, playbook type, labels, modified timestamp, workflow step count, playbook processing summary, severity/priority/impact, validity/executable state, and last execution status.
- Result columns are sortable.
- Type filtering uses the CACAO playbook type vocabulary: attack, detection, engagement, investigation, mitigation, notification, prevention, and remediation.
- Author display prefers identity first name + last name for user identities, falling back to the CACAO identity name for organization identities.
- Row click and the Open action route to the existing SOARCA-GUI playbook detail view.

### Phase 4: Enrich Playbook Detail

Build:

- Add NG-SOAR metadata fields to SOARCA-GUI playbook detail.
- Add last execution status from NG-SOAR API.
- Add `Open in Roaster`.
- Add optional execution history section.

Acceptance criteria:

- Detail page keeps the existing SOARCA-GUI strengths.
- User sees richer NG-SOAR metadata and persisted last execution state.
- User can move from detail to Roaster and monitoring.

Current status:

- Playbook detail uses an NG-SOAR-owned CACAO metadata panel beside the existing workflow visualization.
- Metadata is grouped into overview, identity/classification, lifecycle/versioning, risk/readiness, processing summary/resources, and applicability/references.
- Detail shows resolved author names, raw identifiers where traceability matters, validity/executable state, revoked state, CACAO playbook type/activity fields, playbook processing summary, risk scores, resource counts, external references, and persisted execution status.
- Author and external references can be expanded to inspect their full source objects without crowding the default view.
- Playbook processing summary is inferred on SOARCA-GUI import/update and Roaster save-to-NG-SOAR. Existing author-provided summary values are preserved.
- Detail includes a **Populate summary** action when a stored playbook has no `playbook_processing_summary`.

### Phase 5: Import/Create to Roaster Handoff

Build:

- After upload/import succeeds, offer to open imported playbook in Roaster.
- Add a “Create in Roaster” route/action.
- Keep existing JSON editor creation.

Acceptance criteria:

- User can import a playbook and continue directly to Roaster.
- User can create a new playbook from scratch in Roaster.

### Phase 6: Execution Persistence Integration in SOARCA-GUI

Build:

- Add SOARCA-GUI API client functions for NG-SOAR API/BFF execution summaries.
- Display last execution state in playbook list and detail.
- Keep SOARCA-GUI monitoring/manual input as the operational execution surface.

Acceptance criteria:

- Last execution status persists beyond SOARCA reporter availability.
- Playbook library and detail show persisted execution state.

### Phase 7: Versioning

Build:

- Define version label and parent/version metadata behavior.
- Ensure Roaster save creates a traceable version.
- Add version list/history if feasible.

Acceptance criteria:

- User can distinguish playbook versions.
- Roaster-created edits do not silently destroy prior context.

### Phase 8: Dashboard Operational Overview

Build:

- Replace the SOARCA-GUI dashboard placeholder with an NG-SOAR dashboard.
- Show playbook totals, manual playbooks, derived versions, execution summaries, and running/manual-input state.
- Show recent playbooks and persisted executions.
- Show SOARCA runtime/version/uptime when available.
- Add quick actions for playbook creation, Roaster, and monitoring.

Acceptance criteria:

- `/dashboard` is useful as the demo/reviewer landing page.
- Dashboard data comes from SOARCA-GUI, SOARCA, and NG-SOAR API clients without duplicating old frontend code.
- Failure of optional execution/status calls does not block access to playbooks.

### Phase 9: Remove Former NG-SOAR Frontend

Build:

- Confirm SOARCA-GUI contains all useful migrated features.
- Remove `ng-soar-frontend` service from Docker Compose.
- Remove old frontend routes/env vars.
- Remove `apps/ng-soar-frontend`.

Acceptance criteria:

- Full demo flow works with SOARCA-GUI as the only main frontend.
- No dead navigation points to the old frontend.
- `docker compose config --services` lists no `ng-soar-frontend` service.

### Phase 10: Documentation and Demo Polish

Build:

- Update README.
- Add architecture diagram.
- Add demo script.
- Add troubleshooting notes.
- Record known limitations and remaining polish backlog.

Acceptance criteria:

- A reviewer can start the stack and follow the intended demo without extra explanation.
- README documents the main services, routes, verification commands, and common troubleshooting steps.

Current status:

- README now documents the single-frontdoor architecture, main routes, service responsibilities, demo flow, verification commands, and troubleshooting notes.
- Remaining Phase 10 work is mostly demo-content polish: curated sample playbooks, screenshots if needed, and final thesis/demo wording.

### Phase 11: Settings Platform Operations and API Explorer

Build:

- Replace the single SOARCA-only status settings view with settings tabs:
  - **Appearance**
  - **Platform Operations**
  - **API Explorer**
- Replace the ambiguous header green dot with a labeled or tooltip-rich platform health indicator.
- Add service cards for SOARCA, SOARCA-GUI, NG-SOAR API, CACAO Roaster, MongoDB, Mosquitto, and reverse proxy.
- Add NG-SOAR API endpoint for aggregated platform health where direct browser checks are insufficient.
- Add or proxy OpenAPI/Swagger docs for SOARCA and NG-SOAR API.
- Embed Swagger UI in the API Explorer tab while preserving raw OpenAPI endpoints for external tooling.

Acceptance criteria:

- User can tell whether the header status means SOARCA-only or full-platform health.
- Settings shows health/status/configuration for each relevant service.
- Developers can discover API endpoints from inside NG-SOAR.
- Direct OpenAPI URLs remain usable for code generation and external integration.

Current status:

- NG-SOAR API exposes `/api/ng-soar/platform/health`.
- NG-SOAR API exposes `/api/ng-soar/openapi.json`.
- Header status indicator now uses the platform health summary instead of SOARCA-only ping.
- Settings has tabs for Appearance, Platform Operations, and API Explorer.
- Platform Operations shows service cards for SOARCA, NG-SOAR API, CACAO Roaster, NG-SOAR frontend, reverse proxy, MongoDB, and Mosquitto.
- API Explorer embeds a themed Swagger UI shell for both NG-SOAR and SOARCA APIs.
- API Explorer follows the resolved application theme, including light mode and automatic system-theme mode.

### Phase 12: Authentication and API Key Protection

Build:

- Add initial authentication boundary for the frontend.
- Protect NG-SOAR API mutating endpoints with an API key.
- Add environment variables for API key configuration.
- Document API-key usage in API Explorer.
- Plan OIDC integration for real user identity and later role-based authorization.

Acceptance criteria:

- NG-SOAR API is not openly writable.
- Frontend requests include required API credentials where appropriate.
- Health endpoints expose only safe information without authentication.
- Documentation explains how developers authenticate.

### Phase 13: Identity Store and Author Resolution

Build:

- Add Mongo-backed identity collection in NG-SOAR API.
- Add CRUD endpoints for CACAO identity objects.
- Seed or import known identities, including the CACAO TC example if useful for demo data.
- Add SOARCA-GUI identity query/cache layer.
- Resolve playbook author IDs into identity display names in list, filters, and detail.
- Prepare logged-in-user-to-identity mapping for future edit/derive authorization rules.

Acceptance criteria:

- Playbook list and filters show author names, not only identity IDs.
- Detail still exposes raw identity ID for traceability.
- New playbook authoring can align with the logged-in user's identity once auth is enabled.

Current status:

- NG-SOAR API exposes Mongo-backed `/api/ng-soar/identities` endpoints.
- The CACAO TC identity is seeded for demo/reference data if it is not already present.
- SOARCA-GUI has an identity query/cache layer.
- Playbook search metadata resolves `created_by` identity IDs to display names for search, badges, filters, and NG-SOAR detail fields.

### Phase 14: Playbook Editor Execution Split View

Build:

- Rename the Roaster navigation item to **Playbook Editor**.
- Rename execution-related integration action to **Execute playbook**.
- Plan and implement an execution side panel/split view from the editor route.
- Validate before execution where possible.
- Keep editor visible during execution status/manual-input review.
- Link to full monitoring detail when needed.

Acceptance criteria:

- User does not lose editor context when executing.
- Execution failures/manual input can be reviewed without abandoning editing.
- Full monitoring remains available for deep inspection.

Current status:

- Main navigation label is now **Playbook Editor**.
- CACAO Roaster's SOARCA integration entry uses **Execute** / **Execute playbook** language.
- NG-SOAR editor host includes an execution companion panel beside Roaster.
- The panel can execute the stored SOARCA playbook, show latest persisted execution state, and link to monitoring.
- Roaster exposes a **Save to NG-SOAR** action that persists the current CACAO playbook through SOARCA's playbook API into the shared playbook database.

### Phase 15: Roaster Export Extraction

Build:

- Locate Roaster PNG export and STIX 2.1 export implementation.
- Extract or expose reusable functions without duplicating logic.
- Add playbook detail actions:
  - export workflow PNG
  - export STIX 2.1 wrapped CACAO playbook
- Keep exports consistent with Roaster output.

Acceptance criteria:

- User can export PNG/STIX from SOARCA-GUI playbook detail.
- Output matches Roaster's existing export behavior.
- Future TAXII/OpenCTI/MISP sharing remains possible.

### Phase 16: Dashboard Metrics Upgrade

Build:

- Add business-value metrics:
  - automation coverage
  - validated vs. unvalidated playbooks
  - failed execution count/trend
  - manual-input workload
  - playbook reuse/versioning activity
- Add operational metrics:
  - running executions
  - awaiting manual input
  - last execution per playbook
  - recent failures
  - platform component health
  - reporter/persistence sync freshness
- Keep dashboard concise and action-oriented.

Acceptance criteria:

- Dashboard tells a SOC/demo story, not just raw counts.
- Metrics link to playbook, monitoring, or settings views where useful.
- Optional metrics degrade gracefully when data is not available.

### Phase 17: Playbook Library Table Upgrade

Build:

- Replace or enhance the current result list with a denser table/list hybrid.
- Add columns/properties from the migrated NG-SOAR frontend concept:
  - name
  - author display name
  - type
  - labels
  - version/derived indicator
  - workflow step count
  - manualplay-step indicator
  - validation status
  - last execution status
  - created/modified timestamps
  - severity/priority/impact if present
- Make workflow preview secondary and cleaner.
- Ensure new user-provided playbooks scale the UI.

Acceptance criteria:

- Users can scan and compare many playbooks quickly.
- Search/filter results expose the important CACAO metadata.
- Author filter uses identity names with identity IDs under the hood.

Current status:

- `/playbooks/new` supports bulk import of multiple CACAO JSON playbooks.
- Bulk import validates each file client-side, skips invalid files, and writes valid playbooks through SOARCA's playbook API.

## Remaining Polish Backlog

- Settings Platform Operations and API Explorer.
- Authentication and API key protection.
- Identity store and author-name resolution.
- Playbook Editor execution split view.
- Roaster PNG/STIX export extraction for playbook detail.
- Dashboard metrics upgrade.
- Playbook library table upgrade.
- Roaster host first-pass polish is implemented: NG-SOAR context bar, linked playbook ID, reload, standalone open, playbook detail, and playbook library shortcuts.
- Decide how deeply to visually merge Roaster into the SOARCA-GUI shell beyond the current embedded host.
- Consider hiding or reducing Roaster chrome after the embedded flow is stable.
- Add richer persisted playbook version history if the demo needs it.
- Prepare 2-3 curated CACAO playbooks for the final demo.
- Prepare one manual-input execution scenario for the final demo.
- Align the SOARCA-GUI design system with final NG-SOAR branding.

## Definition of Done

The implementation is acceptable when this demo works:

1. Start full stack with Docker Compose.
2. Open NG-SOAR in the browser.
3. See NG-SOAR branded SOARCA-GUI shell.
4. Open Playbooks.
5. Search/filter SOARCA/MongoDB playbooks.
6. Import a CACAO playbook.
7. Open playbook detail.
8. See SOARCA-GUI detail visualization plus NG-SOAR metadata.
9. Open the playbook in Roaster.
10. Create or edit a playbook in Roaster.
11. Save a version where feasible.
12. Execute through Roaster/SOARCA.
13. Monitor execution in SOARCA-GUI.
14. Handle manual input in SOARCA-GUI.
15. Return to Playbooks and see persisted last execution state.

## Guardrails

Do:

- Extend SOARCA-GUI as the main frontend.
- Reuse SOARCA, SOARCA-GUI, and CACAO Roaster.
- Keep SOARCA as the main playbook backend.
- Keep manual input inside SOARCA-GUI.
- Use NG-SOAR API/BFF only where it adds persistence/versioning value.
- Prefer small, verifiable migration phases.

Do not:

- Maintain two competing main frontends.
- Rebuild SOARCA-GUI from scratch.
- Rebuild CACAO Roaster from scratch.
- Duplicate manual input UI unnecessarily.
- Add complex RBAC in v1.
- Add direct playbook execution outside Roaster unless explicitly decided later.
