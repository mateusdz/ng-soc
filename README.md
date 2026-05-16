# NG-SOAR

NG-SOAR is an NG-SOC SOAR demonstration platform built around SOARCA-GUI, CACAO Roaster, SOARCA, and a small NG-SOAR API for persisted execution summaries.

The main frontend is the NG-SOAR extended SOARCA-GUI application. The former standalone `ng-soar-frontend` shell has been removed after its search, Roaster, dashboard, and execution-summary features were migrated into `apps/SOARCA-GUI`.

## Architecture

```text
Browser
  |
  v
reverse-proxy :8080
  |
  |-- /                    -> soarca-gui :8081
  |-- /api/soarca/*        -> soarca :8080
  |-- /api/ng-soar/*       -> ng-soar-api :3001
  |-- /_roaster/*          -> cacao-roaster :3000
  |
  v
SOARCA + MongoDB + Mosquitto
```

## Run

```sh
cp .env.example .env
docker compose up --build
```

Open `http://localhost:8080`.

Direct development endpoints are also exposed on localhost:

- NG-SOAR frontend: `http://localhost:8080`
- CACAO Roaster: `http://127.0.0.1:3000`
- SOARCA-GUI direct: `http://127.0.0.1:8081`
- SOARCA API direct: `http://127.0.0.1:8082`
- MongoDB: `127.0.0.1:27017`
- MQTT/Mosquitto: `127.0.0.1:1883`

## Routes

- `/dashboard`
- `/playbooks`
- `/playbooks/new`
- `/playbooks/:playbookId`
- `/playbooks/:playbookId/edit`
- `/roaster` (Playbook Editor)
- `/roaster/playbook/:playbookId` (Playbook Editor for a stored playbook)
- `/monitoring`
- `/monitoring/:executionId`
- `/settings`

Settings includes:

- **Appearance**: UI theme and frontend version.
- **Platform Operations**: health cards for SOARCA, NG-SOAR API, CACAO Roaster, NG-SOAR frontend, reverse proxy, MongoDB, and Mosquitto.
- **API Explorer**: embedded themed Swagger UI for NG-SOAR and SOARCA APIs, following the selected application theme.

## Main Services

- `soarca-gui`: primary NG-SOAR frontend, extended under `apps/SOARCA-GUI/src/ng-soar`.
- `cacao-roaster`: CACAO authoring and visual playbook editing surface.
- `soarca`: SOARCA API and execution engine.
- `ng-soar-api`: execution-summary persistence, identity resolution, platform health, and API documentation shell.
- `mongodb`: SOARCA and NG-SOAR persistence.
- `mosquitto`: MQTT broker used by SOARCA.
- `reverse-proxy`: single visible entrypoint on `NG_SOAR_PORT`.

## Demo Flow

1. Open `http://localhost:8080/dashboard`.
2. Check dashboard totals, SOARCA status, recent playbooks, and recent executions.
3. Open `/playbooks`.
4. Search or filter playbooks by text, labels, type, manual steps, version state, modified date, or last execution status.
5. Open a playbook detail page.
6. Review SOARCA-GUI workflow visualization plus NG-SOAR metadata and last execution status.
7. Use `Open in Playbook Editor` or `/roaster/playbook/:playbookId` to inspect/edit the playbook in CACAO Roaster.
8. Import one or many CACAO JSON playbooks, or save from Playbook Editor using `Save to NG-SOAR`.
9. Run or monitor execution through `/monitoring`.
10. Use SOARCA-GUI manual input handling for manual runtime steps.
11. Return to the dashboard or playbook list to confirm persisted execution status.

## Verification

```sh
docker compose config --services
curl -I http://localhost:8080/dashboard
curl -I http://localhost:8080/playbooks
curl -I http://localhost:8080/roaster
curl -I http://localhost:8080/api/ng-soar/health
curl -I http://localhost:8080/api/ng-soar/platform/health
curl -I http://localhost:8080/api/ng-soar/identities
curl -I http://localhost:8080/api/ng-soar/openapi.json
curl -I http://localhost:8080/api/soarca/status/
curl -I http://localhost:8080/_roaster/
```

The service list should not include `ng-soar-frontend`.

For the SOARCA-GUI build:

```sh
cd apps/SOARCA-GUI
npm run build
```

## Development Notes

NG-SOAR additions to SOARCA-GUI should stay under `apps/SOARCA-GUI/src/ng-soar` where practical. Small hook points in upstream SOARCA-GUI files are acceptable when routing, page composition, or existing actions need to call NG-SOAR functionality.

This keeps the local fork easier to compare with future SOARCA-GUI versions.

## Troubleshooting

If the Roaster tab is blank:

- Open `http://localhost:8080/_roaster/` and confirm it returns HTML.
- Confirm hashed Roaster assets such as `/bundle.*.js` return JavaScript, not SOARCA-GUI HTML.
- Restart the proxy after editing `nginx/default.conf`:

```sh
docker compose restart reverse-proxy
```

If the dashboard or playbook pages fail to load:

- Check SOARCA status at `http://localhost:8080/api/soarca/status/`.
- Check NG-SOAR API status at `http://localhost:8080/api/ng-soar/health`.
- Check full platform health at `http://localhost:8080/api/ng-soar/platform/health`.
- Check containers:

```sh
docker compose ps
```

If old frontend containers still appear after pulling newer changes:

```sh
docker compose up -d --remove-orphans
```

## Known Limitations

- Workflow preview is functional but still needs design and layout refinement.
- Roaster is still hosted as an embedded app rather than fully merged as native SOARCA-GUI components.
- Versioning currently relies on derived CACAO metadata and UI surfacing; richer persisted version history is still future work.
- Execution-summary persistence is intentionally small and focused on demo visibility, not full audit/event storage.
