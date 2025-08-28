import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock data service to avoid network
vi.mock('../../../../api/services/risks', () => ({
  fetchRiskContexts: vi.fn(async () => ({ total: 0, items: [] })),
}));

// JSDOM URL helpers for blob download
beforeAll(() => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
});

afterAll(() => {
  URL.createObjectURL.mockRestore?.();
  URL.revokeObjectURL.mockRestore?.();
});

import RiskRegisterPage from '../RiskRegisterPage.jsx';

describe('RiskRegisterPage Saved Views + CSV', () => {
  test('renders SavedViewBar and CSV export button', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/risks/register', search: '' }]}>
        <RiskRegisterPage />
      </MemoryRouter>
    );

    // SavedViewBar control
    expect(await screen.findByText('Risk Register')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Views/i })).toBeInTheDocument();

    // CSV export exists and is clickable
    const btn = screen.getByRole('button', { name: /Export CSV/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });
});

