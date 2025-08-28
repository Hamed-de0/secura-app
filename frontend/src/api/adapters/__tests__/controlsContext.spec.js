import { describe, it, expect } from 'vitest';
import { adaptContextControl, adaptContextControlsResponse } from '../../adapters/controlsContext';

describe('controlsContext adapter', () => {
  it('maps a full item', () => {
    const api = {
      id: 5,
      control_id: 12,
      code: 'A.5.1',
      title_en: 'Information security policies',
      status: 'Implemented',
      verification: 'Verified',
      coverage: 0.8,
      confidence: 90,
      effect: 0.5,
      last_evidence: '2024-01-02T10:00:00Z',
    };
    const ui = adaptContextControl(api);
    expect(ui).toEqual({
      linkId: 5,
      controlId: 12,
      code: 'A.5.1',
      title: 'Information security policies',
      status: 'Implemented',
      verification: 'Verified',
      coverage: 80,
      confidence: 90,
      effect: 50,
      lastEvidenceAt: '2024-01-02T10:00:00.000Z',
    });
  });

  it('handles missing fields gracefully', () => {
    const api = { id: 'x' };
    const ui = adaptContextControl(api);
    expect(ui.code).toBe('');
    expect(ui.title).toBe('');
    expect(ui.coverage).toBeNull();
    expect(ui.confidence).toBeNull();
    expect(ui.effect).toBeNull();
    expect(ui.lastEvidenceAt).toBeNull();
  });

  it('maps response envelopes and arrays', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    const env = { items: [{ id: 3 }] };
    expect(adaptContextControlsResponse(arr).length).toBe(2);
    expect(adaptContextControlsResponse(env).length).toBe(1);
  });
});

