import { describe, it, expect } from 'vitest';
import { adaptHistoryChanges } from '../../adapters/history';

describe('history adapter', () => {
  it('builds change list from history items', () => {
    const history = [
      {
        created_at: '2024-01-01T00:00:00Z',
        initial_score: 10,
        residual_score: 8,
        initial_by_domain: { C:2,I:2,A:2,L:2,R:2 },
        residual_by_domain: { C:1,I:2,A:2,L:2,R:1 },
      },
      {
        created_at: '2024-01-02T00:00:00Z',
        initial_score: 12,
        residual_score: 6,
        initial_by_domain: { C:2,I:3,A:2,L:2,R:3 },
        residual_by_domain: { C:1,I:2,A:1,L:2,R:1 },
      }
    ];
    const changes = adaptHistoryChanges(history);
    // Expect at least residual and initial changes + some domains
    expect(changes.some(c => c.field === 'residual' && c.from === 8 && c.to === 6)).toBe(true);
    expect(changes.some(c => c.field === 'initial' && c.from === 10 && c.to === 12)).toBe(true);
    expect(changes.some(c => c.field === 'initial.I' && c.from === 2 && c.to === 3)).toBe(true);
    expect(changes.some(c => c.field === 'residual.A' && c.from === 2 && c.to === 1)).toBe(true);
  });
});

