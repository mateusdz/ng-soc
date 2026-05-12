# NG-SOAR

NG-SOAR is a lightweight frontend shell for the NG-SOC SOAR demonstration. Phase 1 provides the navigable React/Vite application, mock playbook library, Docker image, and reverse proxy routes for CACAO Roaster, SOARCA-GUI, and SOARCA.

## Run

```sh
cp .env.example .env
docker compose up --build
```

Open `http://localhost:8080`.

Direct development endpoints are also exposed on localhost:

- CACAO Roaster: `http://127.0.0.1:3000`
- SOARCA-GUI: `http://127.0.0.1:8081`
- SOARCA API: `http://127.0.0.1:8082`
- MongoDB: `127.0.0.1:27017`
- MQTT/Mosquitto: `127.0.0.1:1883`

## Phase 1 Routes

- `/dashboard`
- `/playbooks`
- `/playbooks/:playbookId`
- `/roaster/`
- `/executions/`
- `/settings`

The playbook library now loads from SOARCA `GET /playbook/` through `/api/soarca/playbook/`.
If SOARCA cannot be reached, NG-SOAR falls back to mock data so the shell remains usable.
