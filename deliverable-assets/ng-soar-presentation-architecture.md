# NG-SOAR Presentation Architecture

Copyright (c) 2026 Cyentific AS. All Rights Reserved.

Use `ng-soar-presentation-architecture.svg` for slides. The Mermaid source below is an editable version of the same high-level runtime view.

```mermaid
flowchart LR
    user["SOC Analyst<br/>Browser"]

    subgraph vm["Remote VM / Docker Compose network"]
        proxy["Nginx reverse proxy<br/>public entrypoint<br/>NG_SOAR_PORT default 8080"]

        subgraph ui["Presentation and authoring"]
            gui["SOARCA-GUI<br/>Dashboard, playbooks, monitoring, settings"]
            roaster["CACAO Roaster<br/>Visual CACAO playbook editor"]
        end

        subgraph api["API and orchestration"]
            ngapi["NG-SOAR API<br/>Health, identities, docs, execution summaries"]
            soarca["SOARCA<br/>CACAO validation and execution engine"]
        end

        subgraph data["Persistence and messaging"]
            mongo["MongoDB<br/>Playbooks, execution data, summaries"]
            mqtt["Mosquitto MQTT<br/>Event and integration broker"]
        end
    end

    tools["External security tools<br/>HTTP(S), SSH, OpenC2, MQTT integrations"]

    user -->|"HTTP"| proxy
    proxy -->|"/"| gui
    proxy -->|"/_roaster"| roaster
    proxy -->|"/api/ng-soar"| ngapi
    proxy -->|"/api/soarca"| soarca
    gui -->|"API calls"| ngapi
    roaster -->|"save / run playbooks"| soarca
    ngapi -->|"sync summaries"| soarca
    ngapi --> mongo
    soarca --> mongo
    soarca --> mqtt
    soarca -->|"execute actions"| tools
    mqtt -->|"custom integrations"| tools
```

Speaker note:

NG-SOAR exposes one browser-facing entrypoint through Nginx. The proxy routes the main UI, the embedded CACAO Roaster editor, the NG-SOAR platform API, and the SOARCA execution API. SOARCA is the orchestration engine, MongoDB stores playbooks and execution state, and Mosquitto supports asynchronous/custom integrations with external security tools.
