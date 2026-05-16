import { RotateCcw } from "lucide-react";

import {
  Button,
  Icon,
  Input,
  Select,
  ThemeSize,
  ThemeVariant,
} from "@/components";

import { useNgSoarPlaybookSearch } from "./playbookSearch";
import { executionStatusOptions } from "./executions/executionStatus";
import {
  FilterField,
  FilterGrid,
  FilterSummary,
  PlaybookToolbar,
} from "./PlaybookFiltersToolbar.styles";

type PlaybookSearchState = ReturnType<typeof useNgSoarPlaybookSearch>;

type PlaybookFiltersToolbarProps = {
  search: PlaybookSearchState;
};

export function NgSoarPlaybookFiltersToolbar({ search }: PlaybookFiltersToolbarProps) {
  const {
    authorOptions,
    filters,
    resetFilters,
    searchRecords,
    setFilter,
    sortedRecords,
    typeOptions,
  } = search;

  return (
    <PlaybookToolbar>
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
            $options={typeOptions}
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
          Rust Execution Status
          <Select
            $value={filters.executionStatus}
            $onChange={(value) => setFilter("executionStatus", value)}
            $placeholder="Any status"
            $options={executionStatusOptions}
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
