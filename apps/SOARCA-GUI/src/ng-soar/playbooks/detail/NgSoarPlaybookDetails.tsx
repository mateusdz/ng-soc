import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { updatePlaybook } from "@/api/playbooks";
import { formatErrorForToast } from "@/api/utils";
import { getLastExecutionSummary } from "@/ng-soar/api/executionSummaries";
import {
  CacaoIdentity,
  createIdentityMap,
  getIdentities,
} from "@/ng-soar/api/identities";
import {
  executionStatusLabels,
  executionStatusVariant,
} from "@/ng-soar/playbooks/executions/executionStatus";
import {
  extractPlaybookMetadata,
  playbookTypeLabels,
} from "@/ng-soar/playbooks/playbookSearch";
import {
  ensurePlaybookProcessingSummary,
  hasPlaybookProcessingSummary,
  playbookSummaryDefinitions,
  playbookSummaryLabels,
} from "@/ng-soar/playbooks/playbookProcessingSummary";
import { getPlaybookVersionMetadata } from "@/ng-soar/playbooks/versioning/playbookVersions";
import {
  Badge,
  Button,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  FormLabel,
  Link,
  Text,
  ThemeVariant,
} from "@/components";
import { Playbook } from "@/types";
import { formatDateTime, formatDuration } from "@/utils";

import {
  CountGrid,
  CountItem,
  DetailGrid,
  DetailItem,
  DetailsStack,
  DetailValue,
  HeroDescription,
  HeroPanel,
  HeroTitle,
  InlineBadges,
  MeterFill,
  MeterTrack,
  MetricCard,
  MetricGrid,
  MetricHeader,
  MetricValue,
  MonoValue,
  MutedValue,
  ReferenceItem,
  ReferenceList,
  Section,
  SectionHeader,
  SectionTitle,
  SummaryDefinition,
  SummaryDefinitionGrid,
  SummaryStatus,
  Disclosure,
  ObjectPreview,
} from "./NgSoarPlaybookDetails.styles";

type NgSoarPlaybookDetailsProps = {
  playbook: Playbook;
};

type ExtendedPlaybook = Playbook & {
  playbook_activities?: string[];
  playbook_processing_summary?: Record<string, boolean | undefined>;
  revoked?: boolean;
  related_to?: string[];
  industry_sectors?: string[];
  signatures?: unknown[];
};

type CountDefinition = {
  label: string;
  count: number;
};

function countRecords(value?: Record<string, unknown>) {
  return value ? Object.keys(value).length : 0;
}

function displayType(type: string) {
  return playbookTypeLabels[type] ?? type;
}

function OptionalValue({ value }: { value?: string | number | boolean }) {
  if (value === undefined || value === null || value === "") {
    return <MutedValue>Not provided</MutedValue>;
  }

  return <>{String(value)}</>;
}

function IdentifierList({ values }: { values?: string[] }) {
  if (!values?.length) {
    return <MutedValue>Not provided</MutedValue>;
  }

  return (
    <ReferenceList>
      {values.map((value) => (
        <MonoValue key={value}>{value}</MonoValue>
      ))}
    </ReferenceList>
  );
}

function ObjectDisclosure({
  title,
  value,
  children,
}: {
  title: string;
  value: unknown;
  children?: React.ReactNode;
}) {
  return (
    <Disclosure>
      <summary>{title}</summary>
      {children}
      <ObjectPreview>{JSON.stringify(value, null, 2)}</ObjectPreview>
    </Disclosure>
  );
}

function RiskMetric({
  label,
  value,
  variant,
}: {
  label: string;
  value?: number;
  variant: "error" | "warning" | "info";
}) {
  const numericValue = typeof value === "number" ? value : undefined;

  return (
    <MetricCard>
      <MetricHeader>
        <span>{label}</span>
        <span>{numericValue === undefined ? "Unspecified" : `${numericValue}/100`}</span>
      </MetricHeader>
      <MetricValue>{numericValue ?? "—"}</MetricValue>
      <MeterTrack>
        <MeterFill $value={numericValue ?? 0} $variant={variant} />
      </MeterTrack>
    </MetricCard>
  );
}

function CountSection({ items }: { items: CountDefinition[] }) {
  return (
    <CountGrid>
      {items.map((item) => (
        <CountItem key={item.label}>
          <span>{item.label}</span>
          <strong>{item.count}</strong>
        </CountItem>
      ))}
    </CountGrid>
  );
}

export function NgSoarPlaybookDetails({ playbook }: NgSoarPlaybookDetailsProps) {
  const extendedPlaybook = playbook as ExtendedPlaybook;
  const queryClient = useQueryClient();
  const { data: identities = [] } = useQuery({
    queryKey: ["ng-soar-identities"],
    queryFn: getIdentities,
    refetchOnWindowFocus: false,
  });
  const identitiesById = createIdentityMap(identities);
  const authorIdentity: CacaoIdentity | undefined = metadataAuthor(playbook.created_by, identitiesById);
  const metadata = extractPlaybookMetadata(playbook, identitiesById);
  const versionMetadata = getPlaybookVersionMetadata(playbook);
  const { data: lastExecution, isLoading } = useQuery({
    queryKey: ["ng-soar-last-execution", playbook.id],
    queryFn: () => getLastExecutionSummary(playbook.id),
    refetchOnWindowFocus: false,
  });
  const populateSummaryMutation = useMutation({
    mutationFn: () =>
      updatePlaybook(playbook.id, ensurePlaybookProcessingSummary(playbook)),
    onSuccess: () => {
      toast.success("Playbook summary populated");
      queryClient.invalidateQueries({ queryKey: ["playbook", playbook.id] });
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
    },
    onError: (error: Error) => {
      toast.error(formatErrorForToast(error, "Failed to populate playbook summary"));
    },
  });

  const lastExecutionAt =
    lastExecution?.completedAt ?? lastExecution?.startedAt ?? lastExecution?.updatedAt;
  const summaryEntries = Object.entries(
    extendedPlaybook.playbook_processing_summary ?? {},
  ).filter(([, value]) => value === true);
  const summary = extendedPlaybook.playbook_processing_summary ?? {};
  const hasSummary = hasPlaybookProcessingSummary(playbook);
  const resourceCounts: CountDefinition[] = [
    { label: "Variables", count: countRecords(playbook.playbook_variables) },
    { label: "Agents", count: countRecords(playbook.agent_definitions) },
    { label: "Targets", count: countRecords(playbook.target_definitions) },
    {
      label: "Authentication",
      count: countRecords(playbook.authentication_info_definitions),
    },
    { label: "Extensions", count: countRecords(playbook.extension_definitions) },
    {
      label: "Data markings",
      count: countRecords(playbook.data_marking_definitions),
    },
    { label: "Signatures", count: extendedPlaybook.signatures?.length ?? 0 },
  ];

  return (
    <DetailsStack>
      <CardContainer>
        <CardHeader>
          <CardTitle>CACAO playbook metadata</CardTitle>
        </CardHeader>
        <CardBody>
          <HeroPanel>
            <InlineBadges>
              <Badge $variant={metadata.isValid ? ThemeVariant.Success : ThemeVariant.Error}>
                {metadata.isValid ? "Valid metadata" : "Invalid metadata"}
              </Badge>
              <Badge
                $variant={
                  metadata.isExecutable ? ThemeVariant.Info : ThemeVariant.Secondary
                }
              >
                {metadata.isExecutable ? "Executable" : "Not executable"}
              </Badge>
              {extendedPlaybook.revoked ? (
                <Badge $variant={ThemeVariant.Error}>Revoked</Badge>
              ) : (
                <Badge $variant={ThemeVariant.Success}>Not revoked</Badge>
              )}
            </InlineBadges>
            <HeroTitle>{playbook.name}</HeroTitle>
            <HeroDescription>
              {playbook.description || "No description has been provided for this playbook."}
            </HeroDescription>
            <InlineBadges>
              {playbook.labels?.length ? (
                playbook.labels.map((label) => (
                  <Badge key={label} $variant={ThemeVariant.Secondary}>
                    {label}
                  </Badge>
                ))
              ) : (
                <MutedValue>No labels provided</MutedValue>
              )}
            </InlineBadges>
          </HeroPanel>
        </CardBody>
      </CardContainer>

      <CardContainer>
        <CardHeader>
          <CardTitle>Processing summary and resources</CardTitle>
        </CardHeader>
        <CardBody>
          <DetailsStack>
            <Section>
              <SectionHeader>
                <SectionTitle>Playbook summary</SectionTitle>
                {!hasSummary ? (
                  <Button
                    $variant={ThemeVariant.Primary}
                    $ghost
                    onClick={() => populateSummaryMutation.mutate()}
                    disabled={populateSummaryMutation.isPending}
                  >
                    Populate summary
                  </Button>
                ) : null}
              </SectionHeader>
              <InlineBadges>
                {summaryEntries.length ? (
                  summaryEntries.map(([key]) => (
                    <Badge key={key} $variant={ThemeVariant.Secondary}>
                      {playbookSummaryLabels[key] ?? key.replaceAll("_", " ")}
                    </Badge>
                  ))
                ) : (
                  <MutedValue>No processing features detected</MutedValue>
                )}
              </InlineBadges>
              <SummaryDefinitionGrid>
                {playbookSummaryDefinitions.map((definition) => {
                  const isDetected = summary[definition.key] === true;

                  return (
                    <SummaryDefinition
                      key={definition.key}
                      aria-label={`${definition.label}: ${isDetected ? "Yes" : "No"}. ${definition.description}`}
                      data-tooltip={definition.description}
                      tabIndex={0}
                      title={definition.description}
                    >
                      <strong>{definition.label}</strong>
                      <SummaryStatus $detected={isDetected}>
                        {isDetected ? "Yes" : "No"}
                      </SummaryStatus>
                    </SummaryDefinition>
                  );
                })}
              </SummaryDefinitionGrid>
            </Section>
            <Section>
              <SectionTitle>Referenced resources</SectionTitle>
              <CountSection items={resourceCounts} />
            </Section>
          </DetailsStack>
        </CardBody>
      </CardContainer>

      <CardContainer>
        <CardHeader>
          <CardTitle>Identity and classification</CardTitle>
        </CardHeader>
        <CardBody>
          <DetailGrid>
            <DetailItem>
              <FormLabel>Spec version</FormLabel>
              <DetailValue>{playbook.spec_version}</DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Playbook ID</FormLabel>
              <MonoValue>{playbook.id}</MonoValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Author</FormLabel>
              {authorIdentity ? (
                <ObjectDisclosure
                  title={metadata.authorName ?? authorIdentity.name}
                  value={authorIdentity}
                />
              ) : (
                <DetailValue>{metadata.authorName ?? "Unknown author"}</DetailValue>
              )}
            </DetailItem>
            <DetailItem>
              <FormLabel>Playbook types</FormLabel>
              <InlineBadges>
                {playbook.playbook_types?.length ? (
                  playbook.playbook_types.map((type) => (
                    <Badge key={type} $variant={ThemeVariant.Info}>
                      {displayType(type)}
                    </Badge>
                  ))
                ) : (
                  <MutedValue>Not provided</MutedValue>
                )}
              </InlineBadges>
            </DetailItem>
            <DetailItem>
              <FormLabel>Playbook activities</FormLabel>
              <InlineBadges>
                {extendedPlaybook.playbook_activities?.length ? (
                  extendedPlaybook.playbook_activities.map((activity) => (
                    <Badge key={activity} $variant={ThemeVariant.Secondary}>
                      {activity}
                    </Badge>
                  ))
                ) : (
                  <MutedValue>Not provided</MutedValue>
                )}
              </InlineBadges>
            </DetailItem>
          </DetailGrid>
        </CardBody>
      </CardContainer>

      <CardContainer>
        <CardHeader>
          <CardTitle>Lifecycle and versioning</CardTitle>
        </CardHeader>
        <CardBody>
          <DetailGrid>
            <DetailItem>
              <FormLabel>Created</FormLabel>
              <DetailValue>{formatDateTime(playbook.created, true)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Modified</FormLabel>
              <DetailValue>{formatDateTime(playbook.modified, true)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Valid from</FormLabel>
              <DetailValue>{formatDateTime(playbook.valid_from, true)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Valid until</FormLabel>
              <DetailValue>{formatDateTime(playbook.valid_until, true)}</DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Lineage</FormLabel>
              <DetailValue>
                {versionMetadata.isDerivedVersion ? (
                  <InlineBadges>
                    <Badge $variant={ThemeVariant.Accent}>Derived</Badge>
                    <Badge $variant={ThemeVariant.Secondary}>
                      {versionMetadata.parentIds.length} parent
                      {versionMetadata.parentIds.length === 1 ? "" : "s"}
                    </Badge>
                  </InlineBadges>
                ) : (
                  <Badge $variant={ThemeVariant.Secondary}>Original playbook</Badge>
                )}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <FormLabel>Derived from</FormLabel>
              <IdentifierList values={playbook.derived_from} />
            </DetailItem>
            <DetailItem>
              <FormLabel>Related objects</FormLabel>
              <IdentifierList values={extendedPlaybook.related_to} />
            </DetailItem>
          </DetailGrid>
        </CardBody>
      </CardContainer>

      <CardContainer>
        <CardHeader>
          <CardTitle>Risk and execution readiness</CardTitle>
        </CardHeader>
        <CardBody>
          <DetailsStack>
            <MetricGrid>
              <RiskMetric label="Priority" value={playbook.priority} variant="warning" />
              <RiskMetric label="Severity" value={playbook.severity} variant="error" />
              <RiskMetric label="Impact" value={playbook.impact} variant="info" />
            </MetricGrid>
            <DetailGrid>
              <DetailItem>
                <FormLabel>Workflow steps</FormLabel>
                <DetailValue>{metadata.workflowStepCount}</DetailValue>
              </DetailItem>
              <DetailItem>
                <FormLabel>Manual input</FormLabel>
                <DetailValue>
                  <Badge
                    $variant={
                      metadata.hasManualSteps
                        ? ThemeVariant.Warning
                        : ThemeVariant.Success
                    }
                  >
                    {metadata.hasManualSteps ? "Manual steps present" : "Automated"}
                  </Badge>
                </DetailValue>
              </DetailItem>
              <DetailItem>
                <FormLabel>Last execution</FormLabel>
                <DetailValue>
                  {isLoading ? (
                    <MutedValue>Loading...</MutedValue>
                  ) : lastExecution ? (
                    <InlineBadges>
                      <Badge $variant={executionStatusVariant(lastExecution.status)}>
                        {executionStatusLabels[lastExecution.status]}
                      </Badge>
                      <Badge $variant={ThemeVariant.Secondary}>
                        {lastExecution.source}
                      </Badge>
                    </InlineBadges>
                  ) : (
                    <MutedValue>No persisted execution yet</MutedValue>
                  )}
                </DetailValue>
              </DetailItem>
              <DetailItem>
                <FormLabel>Last execution time</FormLabel>
                <DetailValue>
                  {lastExecutionAt ? (
                    formatDateTime(lastExecutionAt, true)
                  ) : (
                    <MutedValue>Not available</MutedValue>
                  )}
                </DetailValue>
              </DetailItem>
              <DetailItem>
                <FormLabel>Duration</FormLabel>
                <DetailValue>
                  {lastExecution?.durationMs !== undefined ? (
                    formatDuration(lastExecution.durationMs)
                  ) : (
                    <MutedValue>Not available</MutedValue>
                  )}
                </DetailValue>
              </DetailItem>
            </DetailGrid>
          </DetailsStack>
        </CardBody>
      </CardContainer>

      <CardContainer>
        <CardHeader>
          <CardTitle>Applicability and references</CardTitle>
        </CardHeader>
        <CardBody>
          <DetailsStack>
            <DetailGrid>
              <DetailItem>
                <FormLabel>Industry sectors</FormLabel>
                <InlineBadges>
                  {extendedPlaybook.industry_sectors?.length ? (
                    extendedPlaybook.industry_sectors.map((sector) => (
                      <Badge key={sector} $variant={ThemeVariant.Info}>
                        {sector}
                      </Badge>
                    ))
                  ) : (
                    <MutedValue>Not provided</MutedValue>
                  )}
                </InlineBadges>
              </DetailItem>
              <DetailItem>
                <FormLabel>Markings</FormLabel>
                <IdentifierList values={playbook.markings} />
              </DetailItem>
            </DetailGrid>
            <Section>
              <SectionTitle>External references</SectionTitle>
              {playbook.external_references?.length ? (
                <ReferenceList>
                  {playbook.external_references.map((reference, index) => (
                    <ObjectDisclosure
                      key={`${reference.name}-${index}`}
                      title={`${index + 1}. ${reference.name}`}
                      value={reference}
                    >
                      <ReferenceItem>
                        {reference.description ? (
                          <Text>{reference.description}</Text>
                        ) : null}
                        {reference.url ? (
                          <Link
                            $to={reference.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {reference.url}
                          </Link>
                        ) : null}
                        {reference.external_id || reference.reference_id || reference.source ? (
                          <MutedValue>
                            {[reference.source, reference.external_id, reference.reference_id]
                              .filter(Boolean)
                              .join(" · ")}
                          </MutedValue>
                        ) : null}
                      </ReferenceItem>
                    </ObjectDisclosure>
                  ))}
                </ReferenceList>
              ) : (
                <MutedValue>No external references provided</MutedValue>
              )}
            </Section>
          </DetailsStack>
        </CardBody>
      </CardContainer>
    </DetailsStack>
  );
}

function metadataAuthor(
  identityId: string | undefined,
  identitiesById: ReturnType<typeof createIdentityMap>,
) {
  return identityId ? identitiesById[identityId] : undefined;
}
