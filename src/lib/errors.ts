/**
 * MediPass — Structured Error Types
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

export type ErrorCode =
  | "T3N_REQUEST_FAILED"
  | "T3N_USER_CREATE_FAILED"
  | "T3N_DID_REGISTER_FAILED"
  | "T3N_VC_STORE_FAILED"
  | "T3N_VC_PRESENT_FAILED"
  | "T3N_WALLET_FETCH_FAILED"
  | "AGENT_TOOL_FAILED"
  | "AGENT_TOKEN_EXPIRED"
  | "AGENT_TOKEN_REVOKED"
  | "AGENT_DID_NOT_FOUND"
  | "CANARY_SEND_FAILED"
  | "NOTIFICATION_FAILED"
  | "DB_WRITE_FAILED"
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly context: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    context: Record<string, unknown> = {},
    message?: string,
  ) {
    super(message ?? code);
    this.code = code;
    this.context = context;
    this.name = "AppError";
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
