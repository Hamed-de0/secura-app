# Saved Views — Persistence Endpoints (v1, proposal)

**Purpose**: server-side persistence for Saved Views used by Controls, Risks, Providers, and Compliance pages.  
**Status**: draft; aligns 1:1 with the front-end provider interface in `src/lib/views/storage.js`.

Base path: **`/api/v1/saved-views`**  
Auth: **Bearer** token (required)  
Tenancy (optional): `X-Org-Id: <orgId>` header (if your backend scopes by org)

---

## Data shapes

```ts
// Snapshot matches /docs/contracts/views.md
type Snapshot = {
  ver: 1;
  columns: { visible: string[]; order: string[] };
  sort: Array<{ field: string; sort: 'asc' | 'desc' }>;
  pagination: { pageSize: 10 | 25 | 50 | 100 };
  density: 'compact' | 'standard' | 'comfortable';
  filters: Record<string, unknown>;
};

type View = {
  id: string;           // uuid
  name: string;
  snapshot: Snapshot;   // sanitized server-side (drop unknown columns, repair order)
  page_key: string;     // e.g. "controls/effective@v1"
  scope: string;        // e.g. "prod" | "global"
  versions: string;     // e.g. "current" | "v2"
  created_at: string;   // ISO-8601
  updated_at: string;   // ISO-8601
};
