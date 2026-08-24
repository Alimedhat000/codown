# ADR 0001: Defer auth token consolidation

- **Status:** Accepted (deferred)
- **Date:** 2026-08-23
- **Context:** Client Quality Initiative (`docs/superpowers/specs/2026-08-23-client-quality-design.md` §6)

## Context

During the client quality survey, the access-token lifecycle was found to be
spread across three stores simultaneously:

1. `AuthContext` React state (`context/auth/auth-provider.tsx`)
2. Module-level storage in `utils/token.ts` (read by the axios request interceptor)
3. Mutated axios defaults (`api.defaults.headers.common.Authorization`)

Additionally, a hidden `localStorage['wasLoggedOut']` flag drives mount-time
refresh behavior, and `lib/api.ts` contained an entire commented-out
401-refresh interceptor — a competing design for the same concern, left as
archaeology. Understanding "how does auth work" requires bouncing across four
or more files; no single module owns token lifecycle.

## Decision

Defer consolidation to a dedicated future initiative. The client-quality work
limited itself to deleting the dead interceptor code and documenting current
behavior honestly.

## Consequences

- Auth remains triplicated; changes to token handling must touch all three
  stores. Anyone touching auth should read `auth-provider.tsx`, `utils/token.ts`,
  and `lib/api.ts` together.
- The consolidation deserves its own spec: it alters login/refresh/logout flows
  with server-coupled behavior and cannot ride along a documentation initiative.
- Future architecture reviews should NOT re-flag this as a quick fix — it was
  assessed during 2026-08 and deliberately deferred (this record exists so the
  analysis isn't repeated).
