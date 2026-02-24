# kluvs-api

Public API contract for the [Kluvs](https://kluvs.com) platform — a multi-server Discord book club manager.

**Interactive API Reference → [docs.kluvs.com](https://docs.kluvs.com)**

---

## What's in this repo

| Path | Description |
|------|-------------|
| `openapi.json` | OpenAPI 3.0 specification (canonical source) |
| `schemas/` | Standalone JSON Schema files per entity |
| `endpoint-docs/` | Human-readable endpoint reference |
| `docs/` | GitHub Pages site (Scalar API Reference at docs.kluvs.com) |
| `tools/validate-openapi.ts` | Spec validation tool |

## Endpoints

| Endpoint | Description |
|----------|-------------|
| [`/server`](endpoint-docs/server.md) | Discord server registration |
| [`/club`](endpoint-docs/club.md) | Book club management |
| [`/member`](endpoint-docs/member.md) | Member management |
| [`/session`](endpoint-docs/session.md) | Reading session management |
| [`/book`](endpoint-docs/book.md) | Book search (Google Books) and registration |

## Schemas

| Schema | Description |
|--------|-------------|
| [`Server`](schemas/server.json) | Discord server |
| [`Club`](schemas/club.json) | Book club |
| [`Member`](schemas/member.json) | Club member |
| [`Session`](schemas/session.json) | Reading session |
| [`Book`](schemas/book.json) | Book |
| [`Discussion`](schemas/discussion.json) | Discussion event |
| [`Error`](schemas/error.json) | Error response |

## How this repo is updated

The `openapi.json` spec is generated automatically from the backend implementation.

```
kluvs-backend (merge to main)
  │
  ▼  GitHub Action: generate-docs.ts
  │
  ▼  Pull request opened here with updated openapi.json
  │
kluvs-api (PR merged)
  │
  ▼  GitHub Pages rebuilds docs.kluvs.com
```

The spec in this repo reflects what the live API actually does. Do not edit `openapi.json` or `docs/openapi.json` directly — they will be overwritten by the next automated update.

## Validate the spec locally

```bash
deno task validate
```

Requires [Deno](https://deno.land/).

## Authentication

All endpoints require a Bearer token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://<project-ref>.supabase.co/functions/v1` |
| Local dev | `http://localhost:54321/functions/v1` |
