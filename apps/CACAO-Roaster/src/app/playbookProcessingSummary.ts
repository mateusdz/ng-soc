import type { Playbook } from '../../lib/cacao2-js/src/Playbook';

type SummaryPlaybook = Playbook & {
	playbook_processing_summary?: Record<string, boolean | undefined>;
	signatures?: unknown[];
};

const processingSummaryKeys = [
	'manual_playbook',
	'external_playbooks',
	'parallel_processing',
	'if_logic',
	'while_logic',
	'switch_logic',
	'temporal_logic',
	'data_markings',
	'digital_signatures',
	'countersigned_signatures',
	'extensions',
] as const;

function workflowSteps(playbook: SummaryPlaybook) {
	return playbook.workflow ? Object.values(playbook.workflow as Record<string, any>) : [];
}

function recordCount(value?: Record<string, unknown>) {
	return value ? Object.keys(value).length : 0;
}

function containsText(value: unknown, pattern: RegExp): boolean {
	if (typeof value === 'string') return pattern.test(value);
	if (Array.isArray(value)) return value.some((item) => containsText(item, pattern));
	if (!value || typeof value !== 'object') return false;

	return Object.entries(value).some(
		([key, nested]) => pattern.test(key) || containsText(nested, pattern),
	);
}

function isStartOrEndStep(step: any) {
	return /^(start|end)(?:-|_|\b)/i.test(step.type);
}

function isManualStep(step: any) {
	return (
		Boolean(step.commands?.length) &&
		step.commands.every((command: any) => command.type === 'manual')
	) || containsText(step, /manual|human|user[-_ ]?input/i);
}

function hasExtensionUse(playbook: SummaryPlaybook) {
	return (
		recordCount(playbook.extension_definitions as Record<string, unknown>) > 0 ||
		recordCount(playbook.playbook_extensions as Record<string, unknown>) > 0 ||
		workflowSteps(playbook).some(
			(step) => recordCount(step.step_extensions as Record<string, unknown>) > 0,
		)
	);
}

function inferPlaybookProcessingSummary(playbook: SummaryPlaybook) {
	const steps = workflowSteps(playbook);
	const processingSteps = steps.filter((step) => !isStartOrEndStep(step));

	const summary = {
		manual_playbook:
			processingSteps.length > 0 && processingSteps.every(isManualStep),
		external_playbooks: steps.some(
			(step) => Boolean(step.playbook_id) || step.type === 'playbook-action',
		),
		parallel_processing: steps.some(
			(step) =>
				/parallel/i.test(step.type) ||
				Boolean(step.next_steps && step.next_steps.length > 1),
		),
		if_logic: steps.some(
			(step) => /if/i.test(step.type) || Boolean(step.condition || step.on_true || step.on_false),
		),
		while_logic: steps.some((step) => /while/i.test(step.type)),
		switch_logic: steps.some(
			(step) => /switch/i.test(step.type) || Boolean(step.switch || step.cases),
		),
		temporal_logic: steps.some((step) => Boolean(step.delay || step.timeout)),
		data_markings:
			Boolean(playbook.markings?.length) ||
			recordCount(playbook.data_marking_definitions as Record<string, unknown>) > 0,
		digital_signatures: Boolean(playbook.signatures?.length),
		countersigned_signatures: containsText(playbook.signatures, /countersign|counter[-_ ]?signature/i),
		extensions: hasExtensionUse(playbook),
	};

	return Object.fromEntries(
		processingSummaryKeys
			.filter((key) => summary[key] === true)
			.map((key) => [key, true]),
	);
}

export function ensurePlaybookProcessingSummary(playbook: Playbook): Playbook {
	const summaryPlaybook = playbook as SummaryPlaybook;
	const existingSummary = summaryPlaybook.playbook_processing_summary ?? {};
	summaryPlaybook.playbook_processing_summary = {
		...Object.fromEntries(
			processingSummaryKeys
				.filter((key) => existingSummary[key] === true)
				.map((key) => [key, true]),
		),
		...inferPlaybookProcessingSummary(summaryPlaybook),
	};

	if (Object.keys(summaryPlaybook.playbook_processing_summary).length === 0) {
		const optionalSummaryPlaybook = summaryPlaybook as {
			playbook_processing_summary?: Record<string, boolean | undefined>;
		};
		delete optionalSummaryPlaybook.playbook_processing_summary;
	}

	return playbook;
}
