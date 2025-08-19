import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import useGridView from '../lib/views/useGridView';

function TestHarness({ storageKeySuffix = '' }) {
  const location = useLocation();
  const gv = useGridView({
    key: `controls/effective@v1`,
    scopeKey: storageKeySuffix,
    defaults: {
      columns: { visible: ['code','title'], order: ['code','title'] },
      sort: [{ field: 'code', sort: 'asc' }],
      pagination: { pageSize: 10 },
      density: 'compact',
      filters: { q: '' },
    },
    filterSchema: { q: '' },
    columnIds: ['code','title','source'],
    syncQueryParamQ: true,
  });

  return (
    <div>
      <div data-testid="path">{location.search}</div>
      <button onClick={()=> gv.saveCurrentAs('A')}>save</button>
      <button onClick={()=> gv.setDefaultViewId(gv.views[0]?.id ?? null)}>setDefault</button>
      <button onClick={()=> gv.applySnapshot({ columns:{ visible:['title'], order:['title','code'] }, filters:{ q:'abc' }, density:'standard' })}>apply</button>
      <button onClick={()=> gv.resetFilters()}>resetFilters</button>
      <button onClick={()=> { const _ = gv.toShareableUrl(); }}>share</button>
      <div data-testid="visible">{JSON.stringify(gv.snapshot.columns.visible)}</div>
      <div data-testid="order">{JSON.stringify(gv.snapshot.columns.order)}</div>
      <div data-testid="density">{gv.snapshot.density}</div>
      <div data-testid="q">{gv.snapshot.filters.q ?? ''}</div>
    </div>
  );
}

function renderAt(url, storageKeySuffix = '') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/controls" element={<TestHarness storageKeySuffix={storageKeySuffix} />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('useGridView smoke', () => {
  it('applies snapshot and encodes to URL (?v=)', async () => {
    const { getByText, getByTestId } = renderAt('/controls?scope=a&versions=v1&q=','scope=a;versions=v1');
    fireEvent.click(getByText('apply'));
    await waitFor(() => {
      expect(getByTestId('visible').textContent).toContain('title');
      expect(getByTestId('q').textContent).toBe('abc');
    });
    fireEvent.click(getByText('share'));
    await waitFor(() => {
      expect(getByTestId('path').textContent).toMatch(/v=/);
    });
  });

  it('resets filters to defaults and syncs q', async () => {
    const { getByText, getByTestId } = renderAt('/controls?scope=a&versions=v1&q=zzz','scope=a;versions=v1');

    // URL is carrying q=zzz initially
    expect(getByTestId('path').textContent).toContain('q=zzz');

    // Reset should clear filters to defaults AND update ?q= in URL
    fireEvent.click(getByText('resetFilters'));

    await waitFor(() => {
      // Snapshot filter is empty string after reset
      expect(getByTestId('q').textContent).toBe('');
      // URL should no longer include q=
      expect(getByTestId('path').textContent).not.toContain('q=');
    });
  });

  it('persists per scope key', () => {
    // Save in scope A
    let r = renderAt('/controls?scope=a&versions=v1', 'scope=a;versions=v1');
    fireEvent.click(r.getByText('save'));
    r.unmount();
    // Scope B should not see scope A views
    r = renderAt('/controls?scope=b&versions=v1', 'scope=b;versions=v1');
    fireEvent.click(r.getByText('setDefault')); // no-op (no views for scope B)
    expect(r.getByTestId('density').textContent).toBe('compact'); // default applied
  });
});
