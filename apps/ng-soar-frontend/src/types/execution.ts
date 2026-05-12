export type ExecutionStatus =
  | "successfully_executed"
  | "failed"
  | "ongoing"
  | "await_user_input"
  | "server_side_error"
  | "client_side_error"
  | "timeout_error"
  | "exception_condition_error"
  | "unknown";
