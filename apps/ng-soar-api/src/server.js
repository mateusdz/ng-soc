import express from "express";
import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT ?? 3001);
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://root:rootpassword@mongodb:27017/?authSource=admin";
const MONGODB_DATABASE = process.env.MONGODB_DATABASE ?? "ng_soar";
const SOARCA_API_URL = (process.env.SOARCA_API_URL ?? "http://soarca:8080").replace(/\/$/, "");
const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS ?? 10000);

const client = new MongoClient(MONGODB_URI);
const app = express();

app.use(express.json({ limit: "1mb" }));

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
  await summaries.createIndex({ id: 1 }, { unique: true });
  await summaries.createIndex({ playbookId: 1, completedAt: -1, startedAt: -1, updatedAt: -1 });

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
