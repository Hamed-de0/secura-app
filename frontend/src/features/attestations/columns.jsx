import * as React from 'react';
import { Chip, Tooltip, LinearProgress, Box } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function StatusChip({ value }) {
  const map = {
    planned:  { color: 'default', label: 'Planned' },
    running:  { color: 'primary', label: 'Running' },
    overdue:  { color: 'error',   label: 'Overdue' },
    complete: { color: 'success', label: 'Complete' },
  };
  const m = map[value] || { color: 'default', label: value || '' };
  return <Chip size="small" color={m.color} variant="outlined" label={m.label} />;
}

function DueChip({ value }) {
  if (!value) return null;
  const due = new Date(value);
  const days = Math.ceil((due - new Date()) / 86400000);
  const over = days < 0;
  return (
    <Tooltip title={due.toDateString()}>
      <Chip
        size="small"
        icon={over ? <WarningAmberIcon/> : <EventIcon/>}
        color={over ? 'error' : 'default'}
        variant={over ? 'filled' : 'outlined'}
        label={over ? `${Math.abs(days)}d overdue` : `${days}d`}
      />
    </Tooltip>
  );
}

function Completion({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <Box sx={{ minWidth: 120 }}>
      <LinearProgress variant="determinate" value={pct} />
      <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>{pct}%</Box>
    </Box>
  );
}

export const columnsList = [
  { id: 'name', label: 'Campaign' },
  { id: 'status', label: 'Status' },
  { id: 'dueDate', label: 'Due' },
  { id: 'owners', label: 'Owners' },
  { id: 'controlsCount', label: 'Controls' },
  { id: 'completionPct', label: 'Completion' },
];

export const defaultViewPreset = {
  columns: { visible: columnsList.map(c=>c.id), order: columnsList.map(c=>c.id) },
  sort: [{ field: 'dueDate', sort: 'asc' }],
  pagination: { pageSize: 10 },
  density: 'standard',
  filters: { q: '', status: null },
};

export function buildColumns() {
  const cols = [
    { field: 'name', headerName: 'Campaign', flex: 1, minWidth: 240, renderCell: (p)=> p.row?.name ?? '' },
    { field: 'status', headerName: 'Status', width: 140, renderCell: (p)=> <StatusChip value={p.row?.status}/> },
    { field: 'dueDate', headerName: 'Due', width: 140, renderCell: (p)=> <DueChip value={p.row?.dueDate}/> },
    { field: 'owners', headerName: 'Owners', width: 220, renderCell: (p)=> (p.row?.owners||[]).join(', ') },
    { field: 'controlsCount', headerName: 'Controls', width: 110, renderCell: (p)=> p.row?.controlsCount ?? 0, sortable: true },
    { field: 'completionPct', headerName: 'Completion', width: 160, renderCell: (p)=> <Completion value={p.row?.completionPct}/> },
  ];
  return Object.freeze([...cols]);
}
