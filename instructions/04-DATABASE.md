# 04 — Database Schema

> Supabase PostgreSQL via Prisma.
> Three models: AccessLog (immutable), DataToken (revocable), AgentSession (ephemeral).

---

## prisma/schema.prisma

```prisma
// MediPass — Database Schema
// Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── AccessLog ────────────────────────────────────────────────────────────────
// Immutable record of every T3N data access event.
// Never update. Never delete. Append-only.
model AccessLog {
  id             String   @id @default(cuid())
  patientId      String   // T3N user_id (number stored as string)
  patientDID     String   // did:key:z... of the patient
  doctorId       String   // session-based doctor identifier
  hospitalName   String?  // doctor-provided, optional
  fieldsAccessed String[] // e.g. ["blood_type", "allergies"]
  agentDID       String   // which MediAgent DID made the request
  vcId           String   // UUID of the VC used for presentation
  vcCID          String   // IPFS CID of the stored VC
  timestamp      DateTime @default(now()) @db.Timestamptz
  ipAddress      String?  // request IP for audit purposes

  @@index([patientId])
  @@index([timestamp])
}

// ─── DataToken ────────────────────────────────────────────────────────────────
// Authorization grant from patient to agent.
// Checked on every agent invocation before any T3N call.
model DataToken {
  id           String    @id @default(cuid())
  patientId    String    // T3N user_id
  patientDID   String    // did:key:z... of the patient
  agentDID     String    // authorized agent DID (our T3N_AGENT_DID)
  fields       String[]  // allowed MedicalField values
  allowedHosts String[]  // EHR endpoints (future use — empty in sandbox)
  expiresAt    DateTime  @db.Timestamptz
  revoked      Boolean   @default(false)
  revokedAt    DateTime? @db.Timestamptz
  createdAt    DateTime  @default(now()) @db.Timestamptz

  @@index([patientId])
  @@index([agentDID])
  @@index([patientDID])
}

// ─── AgentSession ─────────────────────────────────────────────────────────────
// Tracks an ongoing doctor-patient interaction session.
// Contains the Claude message history for multi-turn context.
model AgentSession {
  id          String   @id @default(cuid())
  sessionId   String   @unique @default(cuid())
  doctorId    String   // session-based doctor identifier
  patientDID  String   // patient being accessed
  messages    Json     // Anthropic CoreMessage[] array
  complete    Boolean  @default(false)
  createdAt   DateTime @default(now()) @db.Timestamptz
  updatedAt   DateTime @updatedAt @db.Timestamptz

  @@index([sessionId])
  @@index([doctorId])
}

// ─── PatientSession ───────────────────────────────────────────────────────────
// Links a logged-in patient to their T3N identity.
// Created during patient setup, referenced during token issuance.
model PatientSession {
  id          String   @id @default(cuid())
  email       String   @unique
  t3nUserId   Int      // T3N user_id (number)
  patientDID  String   @unique // did:key:z...
  vcId        String   // UUID of their MedicalIdentityVC
  vcCID       String   // IPFS CID
  createdAt   DateTime @default(now()) @db.Timestamptz
  updatedAt   DateTime @updatedAt @db.Timestamptz

  @@index([patientDID])
  @@index([t3nUserId])
}
```

---

## Apply Schema

```bash
# Push schema to Supabase (creates tables)
pnpm db:push

# Generate Prisma client
pnpm db:generate
```

---

## src/lib/db.ts — Prisma Client Singleton

```typescript
/**
 * MediPass — Prisma Client Singleton
 * Copyright (c) 2026 Uvin Vindula — IAMUVIN (iamuvin.com)
 *
 * Why singleton: Next.js hot reload creates new module instances in dev,
 * which would create multiple Prisma connections and exhaust the pool.
 * The global singleton pattern prevents this.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

---

## Database Operations — Key Patterns

### Write AccessLog (after every agent data access)

```typescript
import { db } from "@/lib/db";
import type { MedicalField } from "@/types/medical";

interface LogAccessParams {
  patientId: string;
  patientDID: string;
  doctorId: string;
  hospitalName?: string;
  fieldsAccessed: MedicalField[];
  agentDID: string;
  vcId: string;
  vcCID: string;
  ipAddress?: string;
}

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
```

### Check DataToken Before Agent Execution

```typescript
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type { MedicalField } from "@/types/medical";

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
```

### Revoke DataToken (patient dashboard action)

```typescript
export async function revokeDataToken(
  tokenId: string,
  patientId: string,
): Promise<void> {
  // Verify ownership before revoking
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
```

---

## Index Rationale

| Index | Reason |
|-------|--------|
| `AccessLog.patientId` | Patient dashboard queries all logs by their ID |
| `AccessLog.timestamp` | Sort by recency in dashboard |
| `DataToken.patientId` | Patient dashboard lists their tokens |
| `DataToken.agentDID` | Agent checks authorization by its own DID |
| `DataToken.patientDID` | Agent verifies patient identity |
| `AgentSession.sessionId` | Doctor portal loads session by ID |
| `PatientSession.patientDID` | Agent resolves patient T3N userId from DID |
