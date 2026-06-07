/**
 * MediPass — Database Operations
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * AccessLog writes (append-only), DataToken validation + revocation.
 *
 * @author Uvin Vindula (IAMUVIN)
 * @website https://iamuvin.com
 * @company Terra Labz — terralabz.io
 */

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { MedicalField } from "@/types/medical";

interface LogAccessParams {
  patientId: string;
  patientDID: string;
  doctorId: string;
  // Optionals are explicitly `| undefined` to satisfy exactOptionalPropertyTypes
  // when callers forward agent-supplied (possibly-undefined) values.
  hospitalName?: string | undefined;
  fieldsAccessed: MedicalField[];
  agentDID: string;
  vcId: string;
  vcCID: string;
  ipAddress?: string | undefined;
}

/**
 * Writes an immutable AccessLog entry.
 * Append-only — never updated, never deleted.
 */
export async function logDataAccess(params: LogAccessParams): Promise<void> {
  await db.accessLog.create({
    data: {
      patientId: params.patientId,
      patientDID: params.patientDID,
      doctorId: params.doctorId,
      hospitalName: params.hospitalName ?? null,
      fieldsAccessed: params.fieldsAccessed,
      agentDID: params.agentDID,
      vcId: params.vcId,
      vcCID: params.vcCID,
      ipAddress: params.ipAddress ?? null,
    },
  });
}

/**
 * Validates a patient's DataToken before any T3N data access.
 *
 * Throws AGENT_TOKEN_EXPIRED if no active, non-revoked, unexpired token exists.
 * Throws AGENT_TOKEN_REVOKED if requested fields exceed the token's grant.
 */
export async function validateDataToken(
  patientDID: string,
  agentDID: string,
  requestedFields: MedicalField[],
): Promise<void> {
  const token = await db.dataToken.findFirst({
    where: {
      patientDID,
      agentDID,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    throw new AppError("AGENT_TOKEN_EXPIRED", { patientDID, agentDID });
  }

  const unauthorizedFields = requestedFields.filter(
    (f) => !token.fields.includes(f),
  );

  if (unauthorizedFields.length > 0) {
    throw new AppError("AGENT_TOKEN_REVOKED", {
      patientDID,
      unauthorized: unauthorizedFields,
      allowed: token.fields,
    });
  }
}

/**
 * Revokes a DataToken. Verifies ownership before revoking.
 */
export async function revokeDataToken(
  tokenId: string,
  patientId: string,
): Promise<void> {
  const token = await db.dataToken.findFirst({
    where: { id: tokenId, patientId },
  });

  if (!token) {
    throw new AppError("UNAUTHORIZED", { tokenId, patientId });
  }

  await db.dataToken.update({
    where: { id: tokenId },
    data: { revoked: true, revokedAt: new Date() },
  });
}
