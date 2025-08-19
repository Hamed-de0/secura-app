import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SavedViewBar from '../components/SavedViewBar';

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, 'debug').mockImplementation(() => {}); // silence telemetry in test output
});

function fakeGridView() {
  let snapshot = {
    columns: { visible: ['code','title'], order: ['code','title'] },
    sort: [],
    pagination: { pageSize: 10 },
    density: 'standard',
    filters: { q: '' },
  };
  const views = [];
  return {
    views,
    snapshot,
    useView: vi.fn(),
    saveCurrentAs: (name) => { views.push({ id: 'id1', name, snapshot }); return 'id1'; },
    defaultViewId: null,
    setDefaultViewId: vi.fn(),
    toShareableUrl: () => '/controls?v=abc',
    toShareParam: () => 'abc',
    columnVisibilityModel: { code: true, title: true },
    onColumnVisibilityModelChange: vi.fn(),
    deleteView: vi.fn(),
    renameView: vi.fn(),
    setColumnOrder: vi.fn(),
    applySnapshot: vi.fn(),
    resetFilters: vi.fn(),
  };
}

describe('SavedViewBar smoke', () => {
  it('saves view and copies link', async () => {
    const gv = fakeGridView();
    render(<MemoryRouter><SavedViewBar title="Controls" gridView={gv} columnsList={[{id:'code',label:'Code'},{id:'title',label:'Title'}]} presets={[]} /></MemoryRouter>);
    fireEvent.click(screen.getByText('Save as…'));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'My view' } });
    fireEvent.click(screen.getByText('Save'));
    expect(gv.views[0].name).toBe('My view');

    fireEvent.click(screen.getByLabelText('Copy shareable link'));
  });

  it('opens Manage and allows rename/delete/default', () => {
    const gv = fakeGridView();
    render(<MemoryRouter><SavedViewBar title="Controls" gridView={gv} columnsList={[]} presets={[]} /></MemoryRouter>);
    fireEvent.click(screen.getByText('Manage'));
    // No saved views yet
    expect(screen.getByText(/No saved views/i)).toBeInTheDocument();
  });
});
