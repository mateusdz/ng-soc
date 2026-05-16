import { Playbook } from "@/types";
import { ensurePlaybookProcessingSummary } from "@/ng-soar/playbooks/playbookProcessingSummary";
import {
  deleteToApi,
  fetchFromApi,
  HttpMutationMethod,
  mutationToApi,
} from "./utils";

export const getPlaybooks = () => fetchFromApi<Playbook[]>(`/api/playbook/`);

export const getPlaybookById = (playbookId: string) =>
  fetchFromApi<Playbook>(`/api/playbook/${playbookId}`);

export const createPlaybook = (playbook: Partial<Playbook>) =>
  mutationToApi<Playbook>(
    HttpMutationMethod.POST,
    `/api/playbook/`,
    ensurePlaybookProcessingSummary(playbook as Playbook),
  );

export const updatePlaybook = (playbookId: string, patch: Partial<Playbook>) =>
  mutationToApi<Playbook>(
    HttpMutationMethod.PUT,
    `/api/playbook/${playbookId}`,
    ensurePlaybookProcessingSummary(patch as Playbook),
  );

export const deletePlaybook = (playbookId: string) =>
  deleteToApi(`/api/playbook/${playbookId}`);
