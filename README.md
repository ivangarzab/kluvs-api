# kluvs-api

Public API contract for the [Kluvs](https://kluvs.com) platform — a multi-server Discord book club manager.

**Interactive API Reference → [docs.kluvs.com](https://docs.kluvs.com)**

---

## What's in this repo

| Path | Description |
|------|-------------|
| `openapi.json` | OpenAPI 3.0 specification (canonical source) |
| `docs/` | GitHub Pages site (Scalar API Reference at docs.kluvs.com) |
| `tools/validate-openapi.ts` | Spec validation tool |

## How this repo is updated

The spec is generated and dispatched automatically from `kluvs-backend` on every merge to `main`.

Do not edit `openapi.json` or `docs/openapi.json` directly — they will be overwritten by the next automated update.

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
