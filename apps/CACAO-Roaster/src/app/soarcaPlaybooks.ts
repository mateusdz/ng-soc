import type { Playbook } from '../../lib/cacao2-js/src/Playbook';
import { ensurePlaybookProcessingSummary } from './playbookProcessingSummary';

const DEFAULT_SOARCA_API_BASE = '/api/soarca';

function getSoarcaApiBase(): string {
	const configuredBase =
		process.env.SOARCA_PLAYBOOK_API_BASE || process.env.SOARCA_END_POINT || '';
	const apiBase = configuredBase || DEFAULT_SOARCA_API_BASE;
	return apiBase.replace(/\/+$/, '');
}

async function getErrorMessage(response: Response): Promise<string> {
	try {
		const payload = await response.json();
		return payload.error || payload.message || response.statusText;
	} catch {
		return response.statusText;
	}
}

export async function fetchSoarcaPlaybook(playbookId: string): Promise<Playbook> {
	const response = await fetch(
		`${getSoarcaApiBase()}/playbook/${encodeURIComponent(playbookId)}`,
	);

	if (!response.ok) {
		throw new Error(await getErrorMessage(response));
	}

	const payload = await response.json();
	return payload.playbook || payload;
}

export async function createSoarcaPlaybook(playbook: Playbook): Promise<Playbook> {
	const response = await fetch(`${getSoarcaApiBase()}/playbook/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(ensurePlaybookProcessingSummary(playbook)),
	});

	if (!response.ok) {
		throw new Error(await getErrorMessage(response));
	}

	return response.json();
}
