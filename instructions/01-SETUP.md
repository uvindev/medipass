# 01 — Project Setup

> Read this first. Every command here is production-verified.
> Do not skip steps. Do not reorder them.

---

## Git Identity — Set Before Anything Else

```bash
git config user.name "Uvin Vindula"
git config user.email "uvin95dev@gmail.com"

# Verify
git config user.name && git config user.email
# Expected:
# Uvin Vindula
# uvin95dev@gmail.com
```

---

## Scaffold

```bash
npx create-next-app@latest medipass \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

cd medipass
```

When prompted:
- "Would you like to use Turbopack?" → **No** (stability over speed for this build)

---

## Install All Dependencies

```bash
# AI + Agent
pnpm add ai @ai-sdk/anthropic

# T3N Crypto — verified current API from @noble/curves v1.x
pnpm add @noble/curves @noble/hashes

# JWT validation (for T3N access tokens)
pnpm add jose

# Multibase/multicodec for did:key generation
pnpm add multiformats

# Database
pnpm add @prisma/client
pnpm add -D prisma

# Auth
pnpm add next-auth@beta

# Email
pnpm add resend

# Validation (already good but add Zod explicitly)
pnpm add zod

# QR codes
pnpm add qrcode
pnpm add -D @types/qrcode

# Dev
pnpm add -D tsx
```

**Why these exact packages:**
- `@noble/curves` — 6 security audits, zero dependencies, the standard for Ed25519 in TS
- `multiformats` — W3C-compliant multicodec/multibase for correct `did:key` encoding
- `ai` + `@ai-sdk/anthropic` — Vercel AI SDK v5, `streamText` + `useChat` for streaming
- `jose` — JWT validation for T3N token verification (JWKS endpoint)
- `tsx` — run TypeScript scripts without compile step (for `setup-agent-did.ts`)

---

## Verify Node Version

```bash
node --version   # must be >= 22.x
pnpm --version   # must be >= 9.x
```

---

## Directory Structure

Create these directories:

```bash
mkdir -p src/lib/t3n
mkdir -p src/lib/agent
mkdir -p src/lib/crypto
mkdir -p src/types
mkdir -p src/components/ui
mkdir -p src/components/patient
mkdir -p src/components/doctor
mkdir -p src/components/shared
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/register
mkdir -p src/app/patient/setup
mkdir -p src/app/patient/dashboard
mkdir -p src/app/patient/qr
mkdir -p src/app/doctor
mkdir -p src/app/api/agent
mkdir -p src/app/api/canary
mkdir -p src/app/api/t3n/user
mkdir -p src/app/api/t3n/did
mkdir -p src/app/api/t3n/credential
mkdir -p src/app/api/t3n/present
mkdir -p src/app/api/token
mkdir -p prisma
mkdir -p scripts
mkdir -p hooks
```

---

## tsconfig.json — Strict Mode

Replace the generated `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Why `noUncheckedIndexedAccess: true`:** Array/object index access returns `T | undefined`.
Forces you to handle the case where data may not exist. Prevents runtime crashes.

---

## package.json Scripts

Add to the `scripts` section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "setup:agent": "tsx scripts/setup-agent-did.ts"
  }
}
```

---

## Environment Setup

```bash
cp .env.example .env.local
```

Fill in `.env.local` with real values. The T3N API key is already in `.env.example`.

**Generate `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

---

## Git Hook — Copyright Protection

```bash
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## Prisma Init

```bash
# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql
```

Then replace `prisma/schema.prisma` with the full schema from `04-DATABASE.md`.

After adding the schema:
```bash
pnpm db:generate
pnpm db:push
```

---

## First Commit — Establishes Legal Timestamp

```bash
git add .
git commit -m "feat(init): MediPass scaffold — T3N Agent Dev Kit bounty submission"
git push origin main
```

This commit timestamp is your authorship proof. Push it before writing any component code.

---

## Verify Setup

```bash
pnpm typecheck   # must pass with zero errors
pnpm lint        # must pass with zero errors
pnpm dev         # must start on http://localhost:3000
```

If all three pass — setup complete. Move to `02-CRYPTO.md`.
