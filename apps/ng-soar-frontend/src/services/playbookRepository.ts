import { mockPlaybooks } from "../data/mockPlaybooks";
import type { PlaybookCard } from "../types/playbook";
import { extractPlaybookCard } from "./playbookMetadata";
import { getPlaybook, listPlaybooks } from "./soarcaApi";

export type PlaybookSource = "soarca" | "mock-fallback";

export type PlaybookListResult = {
  playbooks: PlaybookCard[];
  source: PlaybookSource;
  error?: string;
};

export async function loadPlaybooks(): Promise<PlaybookListResult> {
  try {
    const rawPlaybooks = await listPlaybooks();
    return {
      playbooks: rawPlaybooks.map(extractPlaybookCard),
      source: "soarca"
    };
  } catch (error) {
    return {
      playbooks: mockPlaybooks,
      source: "mock-fallback",
      error: error instanceof Error ? error.message : "Unknown SOARCA error"
    };
  }
}

export async function loadPlaybook(playbookId: string): Promise<PlaybookCard | undefined> {
  try {
    return extractPlaybookCard(await getPlaybook(playbookId));
  } catch {
    return mockPlaybooks.find((playbook) => playbook.id === playbookId);
  }
}
