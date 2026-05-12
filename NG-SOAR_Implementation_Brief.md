# NG-SOAR Implementation Brief for Codex / Claude Code

## Purpose

Implement **NG-SOAR**, the NG-SOC project’s unified SOAR frontend shell and playbook knowledge management prototype.

NG-SOAR is not a rewrite of CACAO Roaster, SOARCA, or SOARCA-GUI. It is a lightweight integration layer that makes the existing tools feel like one operational application.

The goal is to support the NG-SOC project demonstration by providing one web interface for:

1. Discovering and searching CACAO playbooks.
2. Previewing playbook metadata and structure.
3. Opening playbooks in CACAO Roaster for inspection, validation, editing, and execution.
4. Viewing execution logs and manual runtime tasks through SOARCA-GUI.
5. Persisting execution metadata/last status in an NG-SOAR API/MongoDB extension when SOARCA only retains it temporarily.

## Context

Existing tools:

- **CACAO Roaster**
  - Web application for creating, parsing, validating, manipulating, visualizing, and executing CACAO v2.0 playbooks.
  - Frontend-only application.
  - Written in TypeScript + Webpack.
  - Repository: https://github.com/opencybersecurityalliance/cacao-roaster
  - Documentation: https://deepwiki.com/opencybersecurityalliance/cacao-roaster
  - Existing SOARCA integration is configured via `SOARCA_URL` or through the Roaster SOARCA integration window.

- **SOARCA**
  - CACAO execution engine.
  - Backend application written in Go.
  - Provides REST/Swagger API.
  - Uses MongoDB-backed playbook storage.
  - Repository: https://github.com/COSSAS/SOARCA
  - API documentation: https://cossas.github.io/SOARCA/docs/soarca-api/
  - Playbook repository implementation reference: https://github.com/COSSAS/SOARCA/blob/development/internal/database/playbook/playbook.go

- **MongoDB**
  - Authoritative playbook storage through SOARCA.
  - NG-SOAR should not directly couple to MongoDB unless absolutely necessary.
  - Preferred access path: NG-SOAR frontend -> NG-SOAR BFF/API if needed -> SOARCA API -> MongoDB.

- **SOARCA-GUI**
  - React + Vite GUI for SOARCA execution logs and manual runtime input.
  - Repository: https://github.com/COSSAS/SOARCA-GUI
  - Should be reused as-is through reverse proxy/internal route composition.

- **CACAO v2.0**
  - OASIS CACAO Security Playbooks v2.0.
  - Specification: https://docs.oasis-open.org/cacao/security-playbooks/v2.0/security-playbooks-v2.0.html

## Product Definition

NG-SOAR is a **playbook knowledge management system with authoring and execution capabilities**.

For this NG-SOC implementation, NG-SOAR should be treated as an **integration prototype** and **demo-oriented operational SOAR console**.

PKMS - Playbook Knowledge Management System = "NG-SOAR frontend" / "NG-SOAR view"

Primary users for the NG-SOC phase:

1. Demo user.
2. Project reviewer.
3. System administrator.
4. Playbook engineer.
5. SOC manager.
6. SOC analyst.

Main success criteria:

1. Easier playbook search and filtering.
2. Strong NG-SOC demonstration value.
3. Unified interface for existing CACAO/SOARCA tools.

Do not over-engineer production functionality. The first goal is working integration.

## High-Level Architecture

```text
Browser
  |
  v
NG-SOAR Frontend Shell
React + Vite + TypeScript + Tailwind + Shadcn
  |
  |-- /dashboard
  |-- /playbooks
  |-- /playbooks/:playbookId
  |-- /roaster/*
  |-- /executions/*
  |-- /settings
  |
  v
Reverse Proxy / Nginx / Traefik
  |
  |-- NG-SOAR frontend
  |-- CACAO Roaster frontend
  |-- SOARCA-GUI frontend
  |-- SOARCA API
  |-- optional NG-SOAR BFF/API
  |
  v
SOARCA Backend
  |
  v
MongoDB
```

Recommended approach:

```text
NG-SOAR frontend
+ optional minimal NG-SOAR BFF/API
+ SOARCA as main backend
+ MongoDB through SOARCA
+ reverse-proxied internal routes for CACAO Roaster and SOARCA-GUI
```

Do **not** directly merge the codebases unless absolutely necessary. Use reverse-proxied internal routes first. This is faster, simpler, and adequate for the NG-SOC prototype.

## Key Architectural Decisions

### 1. NG-SOAR does not execute playbooks directly

Execution must happen through CACAO Roaster.

Reason: users should inspect the playbook in Roaster before execution. Roaster already supports SOARCA execution.

NG-SOAR may display last execution status, but it must not have its own execute button in v1.

### 2. CACAO Roaster remains the authoring and execution UI

NG-SOAR should provide an **Open in Roaster** action.

The selected playbook should open in Roaster through this route:

```text
/roaster/playbook/:playbookId
```

Roaster must be extended or configured to support URL-based playbook loading.

Expected behavior:

```text
User opens /playbooks/:id in NG-SOAR
User clicks Open in Roaster
NG-SOAR routes to /roaster/playbook/:playbookId
Roaster receives playbookId
Roaster fetches CACAO JSON from SOARCA API or NG-SOAR BFF
Roaster loads the playbook into existing Roaster state/UI
User inspects, validates, edits, saves new version, and executes through Roaster
```

### 3. SOARCA-GUI remains the execution log/manual task UI

SOARCA-GUI should be mounted as an internal NG-SOAR route, for example:

```text
/executions/*
```

It should continue to communicate with SOARCA API.

Do not rewrite SOARCA-GUI in v1.

### 4. Playbook source of truth is MongoDB through SOARCA

SOARCA’s playbook repository interface includes the following operations:

```go
GetPlaybooks() ([]cacao.Playbook, error)
GetPlaybookMetas() ([]api.PlaybookMeta, error)
Create(jsonData *[]byte) (cacao.Playbook, error)
Read(id string) (cacao.Playbook, error)
Update(id string, jsonData *[]byte) (cacao.Playbook, error)
Delete(id string) error
```

Use the SOARCA API endpoints corresponding to these capabilities.

If endpoint names differ, inspect SOARCA Swagger/API code and adapt accordingly.

### 5. Playbook versioning

For this prototype, use:

```text
CACAO playbook id + modified datetime
```

When saving an edited playbook from Roaster, create a **new document/version**, not an in-place overwrite.

Implementation detail to decide during coding:

- Prefer SOARCA `Create` for a new version if it supports multiple documents with the same CACAO playbook ID but different modified timestamp.
- If SOARCA or MongoDB unique constraints prevent this, implement a small NG-SOAR BFF/API versioning layer.

### 6. Execution history persistence

SOARCA exposes execution status/logs, but if these are only available for a short time, NG-SOAR needs a minimal API and MongoDB collection to persist execution summaries.

Persist at least:

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
  finishedAt?: string;
  lastUpdatedAt: string;
  source: "soarca" | "roaster" | "soarca-gui" | "ng-soar";
  raw?: unknown;
};
```

This can be implemented later in the MVP if time is limited, but the data model should not block it.

## Required NG-SOAR Views

### 1. Dashboard

Route:

```text
/dashboard
```

Purpose: reviewer/demo landing page.

Show:

- Total playbooks.
- Valid playbooks.
- Invalid playbooks.
- Playbooks with manual steps.
- Recently modified playbooks.
- Recent executions if available.
- Last execution status summary if available.
- Quick links:
  - Playbook Library.
  - CACAO Roaster.
  - SOARCA-GUI / Execution View.
  - Settings / Connections.

Keep this simple and robust. Do not implement advanced analytics in v1.

### 2. Playbook Library

Route:

```text
/playbooks
```

Purpose: playbook knowledge management.

Must provide:

- Fetch playbooks from SOARCA API.
- Display playbooks as table and/or cards.
- Search across extracted metadata.
- Search across full CACAO JSON.
- Support exact search and fuzzy search if feasible.
- Filter by:
  - name/title
  - description
  - labels
  - playbook type
  - author
  - playbook version / modified datetime
  - playbook summary if available
  - manual step present
  - CACAO validation status
- Saved views:
  - All playbooks
  - Valid playbooks
  - Invalid playbooks
  - Manual-step playbooks
  - Recently modified
  - Recently executed, if execution metadata exists

Do not add custom business metadata in this version. Extract metadata from CACAO JSON only.

### 3. Playbook View / Preview

Route:

```text
/playbooks/:playbookId
```

Purpose: inspect a playbook before opening in Roaster.

Show:

- Name/title.
- Description.
- Author.
- Created datetime.
- Modified datetime.
- Version label using `playbookId + modified datetime`.
- Number of workflow steps.
- CACAO validation result if available.
- Last execution status if available.
- Manual step indicator.
- Labels.
- Small visual preview.

Required actions:

- `Preview`.
- `Open in Roaster`.

Do not add `Execute` in NG-SOAR.

Visual preview fallback order:

1. Embedded read-only CACAO Roaster preview, if easily available.
2. Simplified DAG rendered with React Flow.
3. Thumbnail/screenshot from Roaster, optional later.

Recommended for v1: use React Flow to render a simplified graph of all workflow steps.

### 4. CACAO Roaster View

Routes:

```text
/roaster
/roaster/playbook/:playbookId
```

Purpose: authoring, inspection, validation, and execution.

Required:

- Mount CACAO Roaster inside the NG-SOAR route structure using reverse proxy/internal route composition.
- Add/reuse Roaster support for loading playbook by URL.
- Roaster should fetch the selected playbook by ID from SOARCA API or NG-SOAR BFF.
- Roaster should save edited playbooks as new document versions.
- Roaster remains responsible for validation and execution through SOARCA.

### 5. Execution / SOARCA-GUI View

Route:

```text
/executions/*
```

Purpose: execution logs, status, and manual runtime input.

Required:

- Mount SOARCA-GUI as an internal NG-SOAR route using reverse proxy/internal route composition.
- Reuse SOARCA-GUI fully.
- Keep SOARCA-GUI connected to SOARCA API.
- Support manual runtime input through SOARCA-GUI.
- Show execution logs/status through existing SOARCA-GUI capabilities.

### 6. Settings / Connections

Route:

```text
/settings
```

Show simple connection status:

- SOARCA API URL.
- CACAO Roaster URL.
- SOARCA-GUI URL.
- NG-SOAR API/BFF URL if used.
- Health check status for each service if feasible.

## Suggested Frontend Stack

Use:

- React.
- Vite.
- TypeScript.
- Tailwind CSS.
- Shadcn UI.
- React Router.
- TanStack Query.
- TanStack Table.
- React Flow for simplified playbook DAG preview.
- Fuse.js or similar for fuzzy search if simple to add.

## Suggested Repository Structure

```text
ng-soar/
├── apps/
│   └── ng-soar-frontend/
│       ├── src/
│       │   ├── app/
│       │   │   ├── App.tsx
│       │   │   ├── router.tsx
│       │   │   └── layout.tsx
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── PlaybookLibrary.tsx
│       │   │   ├── PlaybookDetail.tsx
│       │   │   ├── RoasterHost.tsx
│       │   │   ├── SoarcaGuiHost.tsx
│       │   │   └── Settings.tsx
│       │   ├── components/
│       │   │   ├── playbooks/
│       │   │   ├── layout/
│       │   │   └── ui/
│       │   ├── services/
│       │   │   ├── soarcaApi.ts
│       │   │   ├── ngSoarApi.ts
│       │   │   ├── playbookMetadata.ts
│       │   │   ├── playbookSearch.ts
│       │   │   └── playbookGraph.ts
│       │   ├── types/
│       │   │   ├── cacao.ts
│       │   │   ├── playbook.ts
│       │   │   └── execution.ts
│       │   └── config/
│       │       └── env.ts
│       ├── Dockerfile
│       ├── nginx.conf
│       ├── package.json
│       └── vite.config.ts
│
├── services/
│   └── ng-soar-api/              # optional but recommended if execution summaries must be persisted
│       ├── src/
│       ├── Dockerfile
│       └── package.json
│
├── docker-compose.yml
├── nginx/
│   └── default.conf
├── .env.example
└── README.md
```

## Suggested Frontend Types

```ts
export type ExecutionStatus =
  | "successfully_executed"
  | "failed"
  | "ongoing"
  | "await_user_input"
  | "server_side_error"
  | "client_side_error"
  | "timeout_error"
  | "exception_condition_error"
  | "unknown";

export type ValidationStatus = "unknown" | "valid" | "invalid";

export type PlaybookCard = {
  id: string;
  cacaoId?: string;
  title: string;
  description?: string;
  summary?: string;
  author?: string;
  playbookType?: string;
  labels: string[];
  createdAt?: string;
  modifiedAt?: string;
  versionLabel: string;
  workflowStepCount: number;
  hasManualSteps: boolean;
  cacaoValidationStatus: ValidationStatus;
  lastExecutionStatus?: ExecutionStatus;
  lastExecutionAt?: string;
  rawCacao: unknown;
};
```

## Metadata Extraction Requirements

Implement a function like:

```ts
export function extractPlaybookCard(rawCacao: unknown): PlaybookCard
```

It should extract, where available:

- `id`
- `name` or title-equivalent
- `description`
- `created`
- `modified`
- `created_by` / author-equivalent
- `labels`
- `playbook_types` or equivalent
- workflow step count
- whether manual steps exist
- validation status if available
- full raw CACAO JSON

Manual step detection should scan workflow/action objects for manual/human/user-input step types. Keep the logic defensive because CACAO structures may vary.

Full-text search should use:

```ts
JSON.stringify(rawCacao).toLowerCase()
```

for the initial implementation.

## SOARCA API Integration

Implement `soarcaApi.ts` with functions similar to:

```ts
export async function listPlaybooks(): Promise<unknown[]>;
export async function listPlaybookMetas(): Promise<unknown[]>;
export async function getPlaybook(id: string): Promise<unknown>;
export async function createPlaybook(playbook: unknown): Promise<unknown>;
export async function updatePlaybook(id: string, playbook: unknown): Promise<unknown>;
export async function deletePlaybook(id: string): Promise<void>;
export async function listExecutions(): Promise<unknown[]>;
export async function getExecution(id: string): Promise<unknown>;
```

Do not assume final endpoint paths. Inspect SOARCA Swagger/API code and map these functions to the actual endpoints.

Known SOARCA repository-level playbook capabilities:

```go
GetPlaybooks()
GetPlaybookMetas()
Create()
Read(id)
Update(id)
Delete(id)
```

Use these as the conceptual API contract.

## NG-SOAR API / BFF

Create this only if needed. It is recommended for execution summary persistence.

Responsibilities:

1. Persist execution summaries beyond SOARCA’s temporary availability.
2. Optionally normalize playbook responses for the frontend.
3. Optionally proxy SOARCA API to avoid CORS and route complexity.
4. Optionally support Roaster URL-based playbook loading.

Suggested minimal endpoints:

```text
GET    /api/health
GET    /api/playbooks
GET    /api/playbooks/:id
POST   /api/playbooks
POST   /api/playbooks/:id/versions
GET    /api/execution-summaries
GET    /api/execution-summaries/:id
POST   /api/execution-summaries
PATCH  /api/execution-summaries/:id
GET    /api/playbooks/:id/last-execution
```

Important: if SOARCA already provides enough playbook endpoints, do not duplicate playbook CRUD unless needed for versioning or normalization.

## Reverse Proxy Requirements

Use one visible host/port for the user.

Suggested routes:

```text
/                         -> NG-SOAR frontend
/api/ng-soar/*             -> NG-SOAR API/BFF, if used
/api/soarca/*              -> SOARCA API
/roaster/*                 -> CACAO Roaster frontend
/executions/*              -> SOARCA-GUI frontend
```

Potential issue: Roaster and SOARCA-GUI may assume they are served at `/`.

If that happens, choose the fastest robust solution:

1. Configure base path/public path for each frontend if supported.
2. Otherwise serve them on subdomains or separate internal ports and open them inside NG-SOAR through full-page internal navigation.
3. Avoid iframe unless routing/base-path problems make it the fastest option.

Recommended order:

```text
1. Reverse-proxied internal routes.
2. Full-page route redirects under one proxy.
3. iframe only if necessary for prototype speed.
```

## Docker Compose Requirements

Create or update `docker-compose.yml` to start:

- `ng-soar-frontend`
- `ng-soar-api` if used
- `cacao-roaster`
- `soarca`
- `soarca-gui`
- `mongodb`
- `reverse-proxy`

Use environment variables for all service URLs.

Example `.env.example`:

```env
NG_SOAR_PORT=8080
NG_SOAR_API_URL=http://ng-soar-api:3001
SOARCA_API_URL=http://soarca:8080
MONGODB_URI=mongodb://mongodb:27017/soarca
CACAO_ROASTER_URL=http://cacao-roaster:80
SOARCA_GUI_URL=http://soarca-gui:80
VITE_NG_SOAR_API_BASE=/api/ng-soar
VITE_SOARCA_API_BASE=/api/soarca
VITE_ROASTER_BASE=/roaster
VITE_SOARCA_GUI_BASE=/executions
```

## Implementation Phases

### Phase 1: Frontend shell

Build:

- React/Vite/TypeScript app.
- Main layout/navigation.
- Routes:
  - `/dashboard`
  - `/playbooks`
  - `/playbooks/:playbookId`
  - `/roaster/*`
  - `/executions/*`
  - `/settings`
- Mock playbook data.
- Dockerfile.
- Basic reverse proxy config.

Acceptance criteria:

- `docker compose up --build` starts the stack.
- User can open NG-SOAR.
- User can navigate between Dashboard, Playbook Library, Roaster route, SOARCA-GUI route, and Settings.

### Phase 2: Connect Playbook Library to SOARCA

Build:

- SOARCA API client.
- Load playbooks from SOARCA/MongoDB.
- Extract metadata from CACAO JSON.
- Display playbook table/cards.
- Implement search and filters.
- Implement saved views.

Acceptance criteria:

- Existing SOARCA/MongoDB playbooks appear in NG-SOAR.
- User can search across full CACAO JSON.
- User can filter by title, description, labels, type, author, modified datetime, manual-step presence, and validation status.

### Phase 3: Playbook detail and preview

Build:

- Playbook detail page.
- Metadata summary.
- Workflow step count.
- Manual step indicator.
- Last execution status if available.
- React Flow simplified workflow graph.
- Open in Roaster button.

Acceptance criteria:

- User can open a playbook detail page.
- User can inspect relevant metadata.
- User sees a simplified graph of all workflow steps.
- There is no direct execute button in NG-SOAR.

### Phase 4: Roaster URL loading

Build:

- Add route support in Roaster:
  - `/roaster/playbook/:playbookId`
- Fetch selected playbook from SOARCA API or NG-SOAR BFF.
- Load fetched CACAO JSON into Roaster state.
- Ensure Roaster can save edited playbook as a new version.

Acceptance criteria:

- From NG-SOAR, user clicks Open in Roaster.
- CACAO Roaster opens inside the NG-SOAR unified shell.
- Selected playbook is loaded automatically.
- User can inspect, validate, edit, save as new version, and execute from Roaster.

### Phase 5: SOARCA-GUI integration

Build:

- Mount SOARCA-GUI under `/executions/*`.
- Ensure it can communicate with SOARCA API through proxy/config.
- Keep manual runtime input working.

Acceptance criteria:

- User can open execution view from NG-SOAR.
- SOARCA-GUI shows execution logs/status.
- Manual task input remains available.

### Phase 6: Execution summary persistence, if needed

Build:

- Minimal NG-SOAR API/BFF.
- MongoDB collection for execution summaries.
- Sync/record last execution status per playbook.
- Display last execution status in Playbook Library and Playbook Detail.

Acceptance criteria:

- Last execution status survives beyond SOARCA’s short-term in-memory/log availability.
- Playbook Library can show last execution state.

## Security and Access Control

Keep v1 simple.

Do not implement complex RBAC unless time allows.

If adding roles, use simple assignable roles:

- viewer
- analyst
- playbook_engineer
- executor
- admin

Execution should remain inside Roaster. NG-SOAR should not expose secrets. Do not display secrets in the Playbook Library or Playbook Detail.

## Guardrails

Do:

- Reuse CACAO Roaster.
- Reuse SOARCA.
- Reuse SOARCA-GUI.
- Use SOARCA API as the primary backend.
- Keep NG-SOAR lightweight.
- Use reverse proxy/internal route composition first.
- Add minimal BFF/API only where needed.
- Prefer working integration over architectural purity.

Do not:

- Rebuild CACAO Roaster.
- Rebuild SOARCA-GUI.
- Add direct execution button in NG-SOAR.
- Add complex production RBAC in v1.
- Add custom metadata model unless needed later.
- Couple NG-SOAR directly to MongoDB unless SOARCA API is insufficient.
- Rewrite existing open-source tools unless a small integration patch is necessary.

## Definition of Done

The implementation is acceptable when this demo works:

1. Start full stack with Docker Compose.
2. Open NG-SOAR in the browser.
3. See dashboard.
4. Open Playbook Library.
5. Load playbooks from SOARCA/MongoDB.
6. Search/filter playbooks.
7. Open playbook detail.
8. See metadata and simplified workflow preview.
9. Click Open in Roaster.
10. CACAO Roaster opens with the selected playbook loaded.
11. User validates/inspects/executes through Roaster.
12. Open SOARCA-GUI execution view from NG-SOAR.
13. See execution logs/status/manual task handling.
14. If implemented, last execution status is stored and shown in NG-SOAR.

## Prompt for Codex / Claude Code

Use the following instruction when starting an implementation session:

```text
You are implementing NG-SOAR, a lightweight integration-oriented SOAR frontend shell for the NG-SOC project.

Read this entire implementation brief first. Then inspect the repository structure and existing Docker setup. Do not rewrite CACAO Roaster, SOARCA, or SOARCA-GUI. Reuse them.

Your first goal is to create a working React + Vite + TypeScript NG-SOAR frontend with routes for Dashboard, Playbook Library, Playbook Detail, CACAO Roaster, SOARCA-GUI, and Settings. Dockerize it and integrate it with the existing services through Docker Compose and reverse proxy configuration.

After the shell works, connect the Playbook Library to SOARCA API. Use SOARCA as the primary backend and MongoDB only through SOARCA unless a small NG-SOAR BFF/API is needed. Extract searchable playbook metadata from CACAO JSON. Add full JSON search and basic filters.

Do not add a direct execute button in NG-SOAR. Execution must happen through CACAO Roaster after the user inspects the playbook. Add or reuse URL-based playbook loading in CACAO Roaster at /roaster/playbook/:playbookId.

Mount SOARCA-GUI under the NG-SOAR unified frontend as the execution/log/manual-task view. Use reverse proxy/internal routes first. Avoid code-level merging unless necessary.

Prioritize a working NG-SOC demo over perfect architecture. Keep the implementation simple, typed, and maintainable.
```
