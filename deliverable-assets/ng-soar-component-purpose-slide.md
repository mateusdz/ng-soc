# NG-SOAR Component Purpose Slide

Copyright (c) 2026 Cyentific AS. All Rights Reserved.

Use `ng-soar-component-purpose-slide.png` or `ng-soar-component-purpose-slide.svg` in the presentation.

| Component | Purpose | Main functionality |
| --- | --- | --- |
| Nginx Reverse Proxy | Single browser-facing access point | Routes `/`, `/_roaster`, `/api/ng-soar`, and `/api/soarca`; keeps internal services private |
| SOARCA-GUI | Primary NG-SOAR user interface | Dashboard, playbook catalog, execution monitoring, settings, API explorer |
| CACAO Roaster | Visual CACAO playbook authoring surface | Create, inspect, import, edit, validate, and save CACAO playbooks |
| NG-SOAR API | Platform glue and demo visibility layer | Execution summaries, identity resolution, health checks, OpenAPI docs |
| SOARCA | CACAO playbook execution engine | Validate playbooks, execute workflows, track state, coordinate security actions |
| MongoDB | Durable state for demo workflows | Stores playbooks, SOARCA execution data, and NG-SOAR summaries |
| Mosquitto MQTT | Event broker for integrations | Supports SOARCA messaging and asynchronous custom integrations |
| External Security Tools | Automation targets | Receive actions through HTTP(S), SSH, OpenC2, or MQTT integrations |
| Docker Compose VM | Portable demo deployment unit | Runs all services together on one VM with one exposed entrypoint |

Speaker note:

The simplest way to present this slide is to separate the platform into four responsibilities: access, user experience, orchestration, and state/integration. The reverse proxy gives one clean entrypoint. SOARCA-GUI and CACAO Roaster are the user-facing layer. NG-SOAR API adds demo visibility around SOARCA. SOARCA runs the CACAO playbooks, while MongoDB and MQTT provide persistence and integration support.
