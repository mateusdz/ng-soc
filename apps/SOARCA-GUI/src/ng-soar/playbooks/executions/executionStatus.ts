import { ThemeVariant } from "@/components";
import { ExecutionSummaryStatus } from "@/ng-soar/api/executionSummaries";

export const executionStatusLabels: Record<ExecutionSummaryStatus, string> = {
  successfully_executed: "Successfully executed",
  failed: "Failed",
  ongoing: "Ongoing",
  await_user_input: "Awaiting input",
  server_side_error: "Server error",
  client_side_error: "Client error",
  timeout_error: "Timeout",
  exception_condition_error: "Exception condition",
  unknown: "Unknown",
};

export const executionStatusOptions = Object.entries(executionStatusLabels).map(
  ([value, label]) => ({ label, value }),
);

export function executionStatusVariant(status?: ExecutionSummaryStatus) {
  switch (status) {
    case "successfully_executed":
      return ThemeVariant.Success;
    case "failed":
    case "server_side_error":
    case "client_side_error":
    case "timeout_error":
    case "exception_condition_error":
      return ThemeVariant.Error;
    case "ongoing":
      return ThemeVariant.Info;
    case "await_user_input":
      return ThemeVariant.Warning;
    default:
      return ThemeVariant.Secondary;
  }
}
