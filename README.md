# NG-SOAR

NG-SOAR is an NG-SOC SOAR demonstration platform built around SOARCA-GUI, CACAO Roaster, SOARCA, and a small NG-SOAR API for persisted execution summaries.

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

## Routes

- `/dashboard`
- `/playbooks`
- `/playbooks/:playbookId`
- `/roaster`
- `/roaster/playbook/:playbookId`
- `/monitoring`
- `/settings`

The main frontend is the NG-SOAR extended SOARCA-GUI application. The former standalone `ng-soar-frontend` shell has been removed after its useful search, Roaster, dashboard, and execution-summary features were migrated.
