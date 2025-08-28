import { describe, test, expect, vi } from 'vitest';
import * as risksSvc from '../../../../api/services/risks';

describe('bulkAssignRiskContextOwner', () => {
  test('fans out per-row updates and aggregates results', async () => {
    const calls = [];
    vi.spyOn(risksSvc, 'updateRiskContextOwner').mockImplementation(async (id, ownerId) => {
      calls.push({ id, ownerId });
      if (id === 2) throw new Error('boom');
      return { ok: true };
    });

    const { updated, failed } = await risksSvc.bulkAssignRiskContextOwner([1, 2, 3], 42);
    expect(updated).toBe(2);
    expect(failed).toBe(1);
    expect(risksSvc.updateRiskContextOwner).toHaveBeenCalledTimes(3);
    expect(calls.map(c => c.id)).toEqual([1, 2, 3]);
  });

  test('handles empty selection', async () => {
    const spy = vi.spyOn(risksSvc, 'updateRiskContextOwner').mockResolvedValue({ ok: true });
    const res = await risksSvc.bulkAssignRiskContextOwner([], 99);
    expect(res).toEqual({ updated: 0, failed: 0 });
    expect(spy).not.toHaveBeenCalled();
  });
});

