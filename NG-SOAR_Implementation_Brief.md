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

- Total playbooks.
- Manual-step playbooks.
- Derived/versioned playbooks.
- Recently modified playbooks.
- Recent executions.
- Last execution status summary.
- SOARCA runtime status.
- Quick links to Playbooks, Roaster, and Monitoring.

Keep this robust and modest. Advanced analytics are not required.

### 2. Playbook Library

Route:

```text
/playbooks
```

Base: existing SOARCA-GUI `PlaybooksPage`.

Add from the former NG-SOAR frontend:

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

The existing SOARCA-GUI visual card/detail style should be preserved and improved rather than replaced wholesale.

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

- SOARCA API health.
- NG-SOAR API/BFF health.
- CACAO Roaster route/config.
- Mongo-backed execution persistence status if feasible.
- Theme/design controls already present in SOARCA-GUI.

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
POST   /api/ng-soar/playbooks/:id/versions
GET    /api/ng-soar/playbooks/:id/versions
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
- Preserve SOARCA-GUI’s existing card/detail visual style.
- Add saved views.

Acceptance criteria:

- Playbook search works across metadata and full CACAO JSON.
- User can filter by type, labels, author, manual step, validation status, modified date, and last execution status when available.
- Existing import/create/detail flows remain intact.

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

Acceptance criteria:

- A reviewer can start the stack and follow the intended demo without extra explanation.

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
