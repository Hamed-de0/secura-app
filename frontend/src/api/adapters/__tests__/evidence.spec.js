import { describe, it, expect } from 'vitest';
import { adaptEvidenceItem, adaptEvidenceResponse } from '../../adapters/evidence';

describe('evidence adapter', () => {
  it('maps a full item', () => {
    const api = {
      id: 7,
      control_id: 12,
      evidence_type: 'url',
      evidence_url: 'https://example.com',
      collected_at: '2024-01-01T12:00:00Z',
      freshness: 'warn',
      description: 'note',
    };
    const ui = adaptEvidenceItem(api);
    expect(ui).toEqual({
      id: 7,
      controlId: 12,
      type: 'url',
      ref: 'https://example.com',
      capturedAt: '2024-01-01T12:00:00.000Z',
      freshness: 'warn',
      notes: 'note',
    });
  });

  it('normalizes type and defaults freshness', () => {
    const api = { id: 'x', type: 'PDF file', ref: '/tmp/a.pdf' };
    const ui = adaptEvidenceItem(api);
    expect(ui.type).toBe('doc');
    expect(ui.freshness).toBe('ok');
  });

  it('maps array and envelope', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    const env = { items: [{ id: 3 }] };
    expect(adaptEvidenceResponse(arr).length).toBe(2);
    expect(adaptEvidenceResponse(env).length).toBe(1);
  });
});

