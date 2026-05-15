import { RotateCcw } from "lucide-react";

import {
  Button,
  Icon,
  Input,
  Select,
  ThemeSize,
  ThemeVariant,
} from "@/components";

import { savedViews, useNgSoarPlaybookSearch } from "./playbookSearch";
import { executionStatusOptions } from "./executions/executionStatus";
import {
  FilterField,
  FilterGrid,
  FilterSummary,
  PlaybookToolbar,
  SavedViewButton,
  SavedViewRow,
} from "./PlaybookFiltersToolbar.styles";

type PlaybookSearchState = ReturnType<typeof useNgSoarPlaybookSearch>;

type PlaybookFiltersToolbarProps = {
  search: PlaybookSearchState;
};

export function NgSoarPlaybookFiltersToolbar({ search }: PlaybookFiltersToolbarProps) {
  const {
    authorOptions,
    filters,
    labelOptions,
    resetFilters,
    searchRecords,
    setFilter,
    sortedRecords,
    typeOptions,
  } = search;

  return (
    <PlaybookToolbar>
      <SavedViewRow>
        {savedViews.map((view) => (
          <SavedViewButton
            key={view.value}
            $active={filters.view === view.value}
            onClick={() => setFilter("view", view.value)}
            type="button"
          >
            {view.label}
          </SavedViewButton>
        ))}
      </SavedViewRow>

      <FilterGrid>
        <FilterField>
          Search
          <Input
            value={filters.query}
            onChange={(event) => setFilter("query", event.target.value)}
            placeholder="Search metadata or CACAO JSON"
          />
        </FilterField>
        <FilterField>
          Mode
          <Select
            $value={filters.searchMode}
            $onChange={(value) => setFilter("searchMode", value)}
            $options={[
              { label: "Contains", value: "contains" },
              { label: "Exact", value: "exact" },
            ]}
          />
        </FilterField>
        <FilterField>
          Author
          <Select
            $value={filters.author}
            $onChange={(value) => setFilter("author", value)}
            $placeholder="Any author"
            $options={authorOptions}
          />
        </FilterField>
        <FilterField>
          Type
          <Select
            $value={filters.playbookType}
            $onChange={(value) => setFilter("playbookType", value)}
            $placeholder="Any type"
            $options={typeOptions.map((type) => ({
              label: type,
              value: type,
            }))}
          />
        </FilterField>
        <FilterField>
          Label
          <Select
            $value={filters.label}
            $onChange={(value) => setFilter("label", value)}
            $placeholder="Any label"
            $options={labelOptions.map((label) => ({
              label,
              value: label,
            }))}
          />
        </FilterField>
        <FilterField>
          Manual step
          <Select
            $value={filters.manualStep}
            $onChange={(value) => setFilter("manualStep", value)}
            $placeholder="Any"
            $options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ]}
          />
        </FilterField>
        <FilterField>
          Last execution
          <Select
            $value={filters.executionStatus}
            $onChange={(value) => setFilter("executionStatus", value)}
            $placeholder="Any status"
            $options={executionStatusOptions}
          />
        </FilterField>
        <FilterField>
          Modified from
          <Input
            type="date"
            value={filters.modifiedFrom}
            onChange={(event) => setFilter("modifiedFrom", event.target.value)}
          />
        </FilterField>
        <FilterField>
          Modified to
          <Input
            type="date"
            value={filters.modifiedTo}
            onChange={(event) => setFilter("modifiedTo", event.target.value)}
          />
        </FilterField>
      </FilterGrid>

      <FilterSummary>
        Showing {sortedRecords.length} of {searchRecords.length} playbooks
        <Button
          $variant={ThemeVariant.Secondary}
          $size={ThemeSize.Small}
          $ghost
          onClick={resetFilters}
        >
          <Icon $icon={RotateCcw} $size={ThemeSize.Medium} />
          Reset filters
        </Button>
      </FilterSummary>
    </PlaybookToolbar>
  );
}

export function NgSoarNoPlaybookMatches() {
  return <FilterSummary>No playbooks match the current filters.</FilterSummary>;
}
