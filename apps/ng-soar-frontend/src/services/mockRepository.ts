import { mockPlaybooks } from "../data/mockPlaybooks";

export function listMockPlaybooks() {
  return mockPlaybooks;
}

export function getMockPlaybook(playbookId: string) {
  return mockPlaybooks.find((playbook) => playbook.id === playbookId);
}
