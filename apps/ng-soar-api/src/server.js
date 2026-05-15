import express from "express";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import net from "node:net";
import swaggerUiDist from "swagger-ui-dist";

const PORT = Number(process.env.PORT ?? 3001);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://root:rootpassword@mongodb:27017/?authSource=admin";
const MONGODB_DATABASE = process.env.MONGODB_DATABASE ?? "ng_soar";
const SOARCA_API_URL = (process.env.SOARCA_API_URL ?? "http://soarca:8080").replace(/\/$/, "");
const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS ?? 10000);
const CACAO_ROASTER_URL = (process.env.CACAO_ROASTER_URL ?? "http://cacao-roaster:3000").replace(/\/$/, "");
const SOARCA_GUI_URL = (process.env.SOARCA_GUI_URL ?? "http://soarca-gui:8081").replace(/\/$/, "");
const REVERSE_PROXY_URL = (process.env.REVERSE_PROXY_URL ?? "http://reverse-proxy").replace(/\/$/, "");
const MQTT_HOST = process.env.MQTT_HOST ?? "mosquitto";
const MQTT_PORT = Number(process.env.MQTT_PORT ?? 1883);

const client = new MongoClient(MONGODB_URI);
const app = express();
const swaggerUiAssetPath = swaggerUiDist.getAbsoluteFSPath();

app.use(express.json({ limit: "1mb" }));

const cacaoTcIdentity = {
  type: "identity",
  spec_version: "2.1",
  id: "identity--5abe695c-7bd5-4c31-8824-2528696cdbf1",
  created_by_ref: "identity--8ce3f695-d5a4-4dc8-9e93-a65af453a31a",
  created: "2023-06-20T10:00:00.000Z",
  modified: "2023-06-20T10:00:00.000Z",
  name: "OASIS Collaborative Automated Course of Action Operations (CACAO) for Cyber Security TC",
  description:
    "A global community of cyber security experts creating standards enabling increased automation, collaboration, and effectiveness of the global response to cyber threats.",
  roles: ["Technical Committee"],
  identity_class: "organization",
  sectors: ["non-profit"],
  contact_information: "cacao-comment@lists.oasis-open.org"
};

const ngSoarOpenApi = {
  openapi: "3.0.3",
  info: {
    title: "NG-SOAR API",
    version: "0.1.0",
    description: "NG-SOAR extension API for platform health and persisted execution summaries."
  },
  servers: [{ url: "/api/ng-soar" }],
  paths: {
    "/health": {
      get: {
        summary: "Check NG-SOAR API and MongoDB connectivity",
        responses: {
          200: { description: "NG-SOAR API is healthy" },
          503: { description: "NG-SOAR API is unhealthy" }
        }
      }
    },
    "/platform/health": {
      get: {
        summary: "Check NG-SOAR platform component health",
        responses: {
          200: { description: "All platform checks are operational" },
          207: { description: "One or more platform checks are degraded" }
        }
      }
    },
    "/execution-summaries": {
      get: { summary: "List persisted execution summaries", responses: { 200: { description: "Execution summaries" } } },
      post: { summary: "Create or upsert an execution summary", responses: { 201: { description: "Execution summary created" }, 400: { description: "Invalid payload" } } }
    },
    "/execution-summaries/{id}": {
      get: { summary: "Read one execution summary", responses: { 200: { description: "Execution summary" }, 404: { description: "Not found" } } },
      patch: { summary: "Update one execution summary", responses: { 200: { description: "Execution summary updated" }, 404: { description: "Not found" } } }
    },
    "/identities": {
      get: { summary: "List CACAO identity objects", responses: { 200: { description: "Identity objects" } } },
      post: { summary: "Create or upsert a CACAO identity object", responses: { 201: { description: "Identity saved" }, 400: { description: "Invalid identity" } } }
    },
    "/identities/{id}": {
      get: { summary: "Read one CACAO identity object", responses: { 200: { description: "Identity object" }, 404: { description: "Not found" } } },
      put: { summary: "Replace one CACAO identity object", responses: { 200: { description: "Identity saved" }, 400: { description: "Invalid identity" } } },
      delete: { summary: "Delete one CACAO identity object", responses: { 204: { description: "Identity deleted" }, 404: { description: "Not found" } } }
    },
    "/playbooks/{id}/last-execution": {
      get: { summary: "Read the last persisted execution for a playbook", responses: { 200: { description: "Last execution summary" }, 404: { description: "Not found" } } }
    }
  }
};

function swaggerHtml({ title, specUrl }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="./swagger-ui.css" />
    <style>
      :root { color-scheme: dark; }
      html,
      body {
        margin: 0;
        background: #101827;
        color: #e5e7eb;
      }

      .swagger-ui {
        background: #101827;
        color: #e5e7eb;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .swagger-ui .topbar {
        display: none;
      }

      .swagger-ui .wrapper {
        max-width: none;
        padding: 0 2rem;
      }

      .swagger-ui .information-container,
      .swagger-ui .scheme-container,
      .swagger-ui section.models {
        background: #101827;
      }

      .swagger-ui .scheme-container {
        border-top: 1px solid #334155;
        border-bottom: 1px solid #334155;
        box-shadow: none;
      }

      .swagger-ui .info .title,
      .swagger-ui .opblock-tag,
      .swagger-ui section.models h4,
      .swagger-ui .model-title,
      .swagger-ui .model,
      .swagger-ui table thead tr td,
      .swagger-ui table thead tr th,
      .swagger-ui .parameter__name,
      .swagger-ui .response-col_status,
      .swagger-ui .response-col_description,
      .swagger-ui .tab li,
      .swagger-ui label,
      .swagger-ui p,
      .swagger-ui h1,
      .swagger-ui h2,
      .swagger-ui h3,
      .swagger-ui h4,
      .swagger-ui h5 {
        color: #e5e7eb;
      }

      .swagger-ui .info .base-url,
      .swagger-ui .info .description,
      .swagger-ui .opblock-tag small,
      .swagger-ui .parameter__type,
      .swagger-ui .parameter__in,
      .swagger-ui .markdown p,
      .swagger-ui .opblock .opblock-summary-description {
        color: #cbd5e1;
      }

      .swagger-ui .info .title small,
      .swagger-ui .info .title small pre {
        background: #334155;
        color: #e5e7eb;
      }

      .swagger-ui .opblock,
      .swagger-ui section.models,
      .swagger-ui .model-box,
      .swagger-ui .responses-inner,
      .swagger-ui .opblock-body pre,
      .swagger-ui .highlight-code {
        background: #111827;
        border-color: #334155;
        box-shadow: none;
      }

      .swagger-ui .opblock .opblock-summary,
      .swagger-ui .opblock-section-header,
      .swagger-ui .responses-table,
      .swagger-ui table tbody tr td {
        border-color: #334155;
      }

      .swagger-ui .opblock-section-header {
        background: #1f2937;
        box-shadow: none;
      }

      .swagger-ui .opblock.opblock-get {
        background: rgba(59, 130, 246, 0.14);
        border-color: #3b82f6;
      }

      .swagger-ui .opblock.opblock-post {
        background: rgba(16, 185, 129, 0.14);
        border-color: #10b981;
      }

      .swagger-ui .opblock.opblock-put,
      .swagger-ui .opblock.opblock-patch {
        background: rgba(245, 158, 11, 0.14);
        border-color: #f59e0b;
      }

      .swagger-ui .opblock.opblock-delete {
        background: rgba(239, 68, 68, 0.14);
        border-color: #ef4444;
      }

      .swagger-ui input,
      .swagger-ui select,
      .swagger-ui textarea {
        background: #0f172a;
        border-color: #475569;
        color: #e5e7eb;
      }

      .swagger-ui .btn {
        border-color: #3b82f6;
        color: #93c5fd;
      }

      .swagger-ui .btn.execute {
        background: #2563eb;
        border-color: #2563eb;
        color: #ffffff;
      }

      .swagger-ui svg,
      .swagger-ui .model-toggle:after {
        filter: invert(1) brightness(1.8);
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="./swagger-ui-bundle.js"></script>
    <script src="./swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "${specUrl}",
          dom_id: "#swagger-ui",
          deepLinking: true,
          docExpansion: "list",
          syntaxHighlight: {
            theme: "agate"
          },
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          layout: "StandaloneLayout"
        });
      };
    </script>
  </body>
</html>`;
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    for (const key of ["executions", "items", "data", "results"]) {
      if (Array.isArray(value[key])) {
        return value[key];
      }
    }
  }

  return [];
}

function pickString(record, keys) {
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key].trim()) {
      return record[key];
    }
  }

  return undefined;
}

function normalizeDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toISOString();
}

function durationMs(startedAt, completedAt) {
  if (!startedAt || !completedAt) {
    return undefined;
  }

  const started = new Date(startedAt).valueOf();
  const completed = new Date(completedAt).valueOf();
  return Number.isNaN(started) || Number.isNaN(completed) ? undefined : Math.max(completed - started, 0);
}

function omitUndefined(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function normalizeExecutionSummary(value, source = "ng-soar") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const playbookId = pickString(value, ["playbookId", "playbook_id", "playbookID"]);
  if (!playbookId) {
    return undefined;
  }

  const executionId = pickString(value, ["executionId", "execution_id", "id"]);
  const startedAt = normalizeDate(pickString(value, ["startedAt", "started", "start_time"]));
  const completedAt = normalizeDate(pickString(value, ["completedAt", "ended", "finishedAt", "end_time"]));
  const status = pickString(value, ["status"]) ?? "unknown";
  const id = pickString(value, ["id", "_id"]) ?? executionId ?? `${playbookId}:${startedAt ?? randomUUID()}`;

  return omitUndefined({
    id,
    playbookId,
    playbookModified: normalizeDate(pickString(value, ["playbookModified", "playbook_modified"])),
    playbookVersionLabel: pickString(value, ["playbookVersionLabel", "playbook_version_label"]),
    executionId,
    status,
    statusText: pickString(value, ["statusText", "status_text"]),
    startedAt,
    completedAt,
    durationMs: typeof value.durationMs === "number" ? value.durationMs : durationMs(startedAt, completedAt),
    source,
    raw: source === "soarca" ? value : undefined
  });
}

function publicSummary(summary) {
  if (!summary) {
    return summary;
  }

  const { _id, id, raw, ...rest } = summary;
  return {
    id: id ?? String(_id),
    ...rest
  };
}

function sortLastExecution() {
  return {
    completedAt: -1,
    startedAt: -1,
    updatedAt: -1,
    createdAt: -1
  };
}

async function collection() {
  return client.db(MONGODB_DATABASE).collection("execution_summaries");
}

async function identitiesCollection() {
  return client.db(MONGODB_DATABASE).collection("identities");
}

function normalizeStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim())
    : undefined;
}

function normalizeIdentity(value, fallbackId) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const id = typeof value.id === "string" && value.id.trim() ? value.id.trim() : fallbackId;
  const name = typeof value.name === "string" && value.name.trim() ? value.name.trim() : undefined;

  if (!id || !name) {
    return undefined;
  }

  const now = new Date().toISOString();

  return omitUndefined({
    type: typeof value.type === "string" && value.type.trim() ? value.type.trim() : "identity",
    spec_version:
      typeof value.spec_version === "string" && value.spec_version.trim()
        ? value.spec_version.trim()
        : "2.1",
    id,
    created_by_ref:
      typeof value.created_by_ref === "string" && value.created_by_ref.trim()
        ? value.created_by_ref.trim()
        : undefined,
    created: normalizeDate(value.created) ?? now,
    modified: normalizeDate(value.modified) ?? now,
    name,
    description:
      typeof value.description === "string" && value.description.trim()
        ? value.description.trim()
        : undefined,
    roles: normalizeStringArray(value.roles),
    identity_class:
      typeof value.identity_class === "string" && value.identity_class.trim()
        ? value.identity_class.trim()
        : undefined,
    sectors: normalizeStringArray(value.sectors),
    contact_information:
      typeof value.contact_information === "string" && value.contact_information.trim()
        ? value.contact_information.trim()
        : undefined,
    createdAt: normalizeDate(value.createdAt) ?? now,
    updatedAt: now
  });
}

function publicIdentity(identity) {
  if (!identity) {
    return undefined;
  }

  const { _id, ...rest } = identity;
  return rest;
}

async function upsertIdentity(identity) {
  const identities = await identitiesCollection();
  await identities.updateOne(
    { id: identity.id },
    { $set: identity },
    { upsert: true },
  );
  return publicIdentity(await identities.findOne({ id: identity.id }));
}

async function seedIdentities() {
  const identities = await identitiesCollection();
  await identities.updateOne(
    { id: cacaoTcIdentity.id },
    { $setOnInsert: normalizeIdentity(cacaoTcIdentity) },
    { upsert: true },
  );
}

async function checkHttpService({ id, name, role, url, path = "/", expectedStatuses = [200] }) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${url}${path}`, { signal: controller.signal });
    const healthy = expectedStatuses.includes(response.status);

    return {
      id,
      name,
      role,
      status: healthy ? "operational" : "degraded",
      url,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      details: `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      id,
      name,
      role,
      status: "down",
      url,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      details: error.message
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkMongoService() {
  const startedAt = Date.now();

  try {
    await client.db(MONGODB_DATABASE).command({ ping: 1 });

    return {
      id: "mongodb",
      name: "MongoDB",
      role: "SOARCA and NG-SOAR persistence",
      status: "operational",
      url: "mongodb://mongodb:27017",
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      details: `database=${MONGODB_DATABASE}`
    };
  } catch (error) {
    return {
      id: "mongodb",
      name: "MongoDB",
      role: "SOARCA and NG-SOAR persistence",
      status: "down",
      url: "mongodb://mongodb:27017",
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      details: error.message
    };
  }
}

function checkTcpService({ id, name, role, host, port }) {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const finish = (status, details) => {
      socket.destroy();
      resolve({
        id,
        name,
        role,
        status,
        url: `${host}:${port}`,
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        details
      });
    };

    socket.setTimeout(2500);
    socket.once("connect", () => finish("operational", "TCP connection accepted"));
    socket.once("timeout", () => finish("down", "TCP connection timed out"));
    socket.once("error", (error) => finish("down", error.message));
  });
}

async function getPlatformHealth() {
  const services = await Promise.all([
    checkHttpService({
      id: "soarca",
      name: "SOARCA API",
      role: "Playbook storage and execution engine",
      url: SOARCA_API_URL,
      path: "/status/ping"
    }),
    checkHttpService({
      id: "ng-soar-api",
      name: "NG-SOAR API",
      role: "Execution-summary persistence and platform extensions",
      url: `http://localhost:${PORT}`,
      path: "/health"
    }),
    checkHttpService({
      id: "cacao-roaster",
      name: "CACAO Roaster",
      role: "CACAO playbook authoring and export UI",
      url: CACAO_ROASTER_URL
    }),
    checkHttpService({
      id: "soarca-gui",
      name: "NG-SOAR frontend",
      role: "SOARCA-GUI extended as NG-SOAR interface",
      url: SOARCA_GUI_URL
    }),
    checkHttpService({
      id: "reverse-proxy",
      name: "Reverse proxy",
      role: "Single external entrypoint and route proxy",
      url: REVERSE_PROXY_URL
    }),
    checkMongoService(),
    checkTcpService({
      id: "mosquitto",
      name: "Mosquitto",
      role: "MQTT broker used by SOARCA",
      host: MQTT_HOST,
      port: MQTT_PORT
    })
  ]);

  const summary = services.every((service) => service.status === "operational")
    ? "operational"
    : services.some((service) => service.status === "operational")
      ? "degraded"
      : "down";

  return {
    status: summary,
    checkedAt: new Date().toISOString(),
    services
  };
}

async function upsertSummary(summary) {
  const summaries = await collection();
  const now = new Date().toISOString();
  const document = {
    ...summary,
    updatedAt: now
  };

  await summaries.updateOne(
    { id: summary.id },
    {
      $set: document,
      $setOnInsert: { createdAt: now }
    },
    { upsert: true }
  );

  return summaries.findOne({ id: summary.id });
}

async function syncSoarcaReporter() {
  const response = await fetch(`${SOARCA_API_URL}/reporter/`);
  if (!response.ok) {
    throw new Error(`SOARCA reporter sync failed: ${response.status} ${response.statusText}`);
  }

  const reports = asArray(await response.json());
  const normalized = reports
    .map((report) => normalizeExecutionSummary(report, "soarca"))
    .filter(Boolean);

  await Promise.all(normalized.map(upsertSummary));
  return normalized.length;
}

app.get("/health", async (_request, response) => {
  try {
    await client.db(MONGODB_DATABASE).command({ ping: 1 });
    response.json({ ok: true, database: "connected" });
  } catch (error) {
    response.status(503).json({ ok: false, error: error.message });
  }
});

app.get("/platform/health", async (_request, response) => {
  const platformHealth = await getPlatformHealth();
  response.status(platformHealth.status === "operational" ? 200 : 207).json(platformHealth);
});

app.get("/openapi.json", (_request, response) => {
  response.json(ngSoarOpenApi);
});

app.get("/swagger", (_request, response) => {
  response.redirect("/swagger/index.html");
});

app.get("/swagger/index.html", (_request, response) => {
  response.type("html").send(swaggerHtml({
    title: "NG-SOAR API Swagger UI",
    specUrl: "/api/ng-soar/openapi.json"
  }));
});

app.get("/swagger/soarca.html", (_request, response) => {
  response.type("html").send(swaggerHtml({
    title: "SOARCA API Swagger UI",
    specUrl: "/api/soarca/swagger/doc.json"
  }));
});

app.use("/swagger", express.static(swaggerUiAssetPath));

app.get("/execution-summaries", async (request, response) => {
  const playbookId = typeof request.query.playbookId === "string" ? request.query.playbookId : undefined;
  const summaries = await collection();
  const query = playbookId ? { playbookId } : {};
  const items = await summaries.find(query).sort(sortLastExecution()).limit(100).toArray();
  response.json(items.map(publicSummary));
});

app.get("/execution-summaries/:id", async (request, response) => {
  const summaries = await collection();
  const item = await summaries.findOne({ id: request.params.id });

  if (!item) {
    response.status(404).json({ error: "Execution summary not found" });
    return;
  }

  response.json(publicSummary(item));
});

app.get("/identities", async (_request, response) => {
  const identities = await identitiesCollection();
  const items = await identities.find({}).sort({ name: 1 }).limit(500).toArray();
  response.json(items.map(publicIdentity));
});

app.get("/identities/:id", async (request, response) => {
  const identities = await identitiesCollection();
  const item = await identities.findOne({ id: request.params.id });

  if (!item) {
    response.status(404).json({ error: "Identity not found" });
    return;
  }

  response.json(publicIdentity(item));
});

app.post("/identities", async (request, response) => {
  const identity = normalizeIdentity(request.body);

  if (!identity) {
    response.status(400).json({ error: "id and name are required" });
    return;
  }

  response.status(201).json(await upsertIdentity(identity));
});

app.put("/identities/:id", async (request, response) => {
  const identity = normalizeIdentity(request.body, request.params.id);

  if (!identity) {
    response.status(400).json({ error: "name is required" });
    return;
  }

  response.json(await upsertIdentity(identity));
});

app.delete("/identities/:id", async (request, response) => {
  const identities = await identitiesCollection();
  const result = await identities.deleteOne({ id: request.params.id });

  if (result.deletedCount === 0) {
    response.status(404).json({ error: "Identity not found" });
    return;
  }

  response.status(204).send();
});

app.post("/execution-summaries", async (request, response) => {
  const summary = normalizeExecutionSummary(request.body);

  if (!summary) {
    response.status(400).json({ error: "playbookId is required" });
    return;
  }

  response.status(201).json(publicSummary(await upsertSummary(summary)));
});

app.patch("/execution-summaries/:id", async (request, response) => {
  const summaries = await collection();
  const existing = await summaries.findOne({ id: request.params.id });

  if (!existing) {
    response.status(404).json({ error: "Execution summary not found" });
    return;
  }

  const summary = normalizeExecutionSummary({ ...existing, ...request.body, id: request.params.id });

  if (!summary) {
    response.status(400).json({ error: "playbookId is required" });
    return;
  }

  response.json(publicSummary(await upsertSummary(summary)));
});

app.get("/playbooks/:id/last-execution", async (request, response) => {
  const summaries = await collection();
  const item = await summaries.find({ playbookId: request.params.id }).sort(sortLastExecution()).limit(1).next();

  if (!item) {
    response.status(404).json({ error: "Last execution not found" });
    return;
  }

  response.json(publicSummary(item));
});

async function start() {
  await client.connect();
  const summaries = await collection();
  const identities = await identitiesCollection();
  await summaries.createIndex({ id: 1 }, { unique: true });
  await summaries.createIndex({ playbookId: 1, completedAt: -1, startedAt: -1, updatedAt: -1 });
  await identities.createIndex({ id: 1 }, { unique: true });
  await identities.createIndex({ name: 1 });
  await seedIdentities();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NG-SOAR API listening on ${PORT}`);
  });

  if (SYNC_INTERVAL_MS > 0) {
    const sync = async () => {
      try {
        const count = await syncSoarcaReporter();
        console.log(`Synced ${count} SOARCA execution summaries`);
      } catch (error) {
        console.warn(error.message);
      }
    };

    setTimeout(sync, 1000);
    setInterval(sync, SYNC_INTERVAL_MS);
  }
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
