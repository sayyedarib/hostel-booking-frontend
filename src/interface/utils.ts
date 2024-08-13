export type LogLevel = "info" | "warn" | "error";

export interface LogContext {
  [key: string]: any;
}
