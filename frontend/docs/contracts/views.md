# Saved Views Contract (v1)

**Scope**: Controls, Risks, Providers, Compliance Requirements  
**Status**: Stable (front-end only) • Version: `1`

## Snapshot schema

```ts
type Snapshot = {
  ver: 1;
  columns: { visible: string[]; order: string[] };
  sort: Array<{ field: string; sort: 'asc' | 'desc' }>;
  pagination: { pageSize: 10 | 25 | 50 | 100 };
  density: 'compact' | 'standard' | 'comfortable';
  filters: Record<string, unknown>;
};
