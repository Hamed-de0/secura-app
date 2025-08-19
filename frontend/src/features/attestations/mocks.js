export const sampleCampaigns = [
  {
    id: 'att-1001',
    name: 'Q3 Access Review — Engineering',
    scope: 'prod', versions: 'current',
    status: 'running', // planned | running | overdue | complete
    dueDate: '2025-09-30',
    owners: ['you@company.com','lead@company.com'],
    controlsCount: 18,
    completionPct: 62,
  },
  {
    id: 'att-1002',
    name: 'Quarterly Admin Review — Finance',
    scope: 'a', versions: 'v1',
    status: 'planned',
    dueDate: '2025-10-15',
    owners: ['finance@company.com'],
    controlsCount: 8,
    completionPct: 0,
  },
  {
    id: 'att-1003',
    name: 'Annual Key Management Review',
    scope: 'global', versions: 'current',
    status: 'overdue',
    dueDate: '2025-08-10',
    owners: ['secops@company.com'],
    controlsCount: 5,
    completionPct: 40,
  },
];
