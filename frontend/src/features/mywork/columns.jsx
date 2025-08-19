import * as React from 'react';
import { Chip, Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LinkIcon from '@mui/icons-material/Link';

const statusMeta = (theme) => ({
  new:         { color: theme.palette.info.main,      icon: <HourglassEmptyIcon fontSize="inherit" />, label: 'New' },
  in_progress: { color: theme.palette.primary.main,   icon: <AccessTimeIcon fontSize="inherit" />,    label: 'In progress' },
  blocked:     { color: theme.palette.warning.main,   icon: <BlockIcon fontSize="inherit" />,         label: 'Blocked' },
  overdue:     { color: theme.palette.error.main,     icon: <ErrorOutlineIcon fontSize="inherit" />,  label: 'Overdue' },
  done:        { color: theme.palette.success.main,   icon: <CheckCircleIcon fontSize="inherit" />,   label: 'Done' },
});

const typeLabel = {
  attestation: 'Attestation',
  evidence: 'Evidence',
  exception: 'Exception',
  mapping: 'Mapping',
  treatment: 'Treatment',
};

function StatusChip({ value, theme }) {
  const fallback = { color: theme.palette.text.secondary, icon: <AssignmentIcon fontSize="inherit" />, label: String(value ?? '') };
  const meta = statusMeta(theme)[value] || fallback;
  return (
    <Chip
      size="small"
      icon={meta.icon}
      label={meta.label}
      sx={{ color: meta.color, borderColor: meta.color }}
      variant="outlined"
    />
  );
}

function TypeChip({ value, theme }) {
  return (
    <Chip
      size="small"
      label={typeLabel[value] || String(value ?? '')}
      sx={{ color: theme.palette.text.secondary, borderColor: theme.palette.divider }}
      variant="outlined"
    />
  );
}

function DueCell({ value, theme }) {
  if (!value) return null;
  const due = new Date(value);
  if (Number.isNaN(due.getTime())) return null;
  const days = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
  const over = days < 0;
  return (
    <Tooltip title={due.toDateString()}>
      <Chip
        size="small"
        label={over ? `${Math.abs(days)}d overdue` : `${days}d`}
        color={over ? 'error' : 'default'}
        variant={over ? 'filled' : 'outlined'}
      />
    </Tooltip>
  );
}

export const columnsList = [
  { id: 'type',    label: 'Type' },
  { id: 'title',   label: 'Task' },
  { id: 'object',  label: 'Object' },
  { id: 'assignee',label: 'Assignee' },
  { id: 'dueDate', label: 'Due' },
  { id: 'status',  label: 'Status' },
];

export const defaultViewPreset = {
  columns: { visible: columnsList.map(c => c.id), order: columnsList.map(c => c.id) },
  sort: [{ field: 'dueDate', sort: 'asc' }],
  pagination: { pageSize: 10 },
  density: 'standard',
  filters: { q: '', type: null, status: null, scope: null },
};

export function buildColumns(theme) {
  const cols = [
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      sortable: true,
      renderCell: (params) => <TypeChip value={params?.row?.type} theme={theme} />,
    },
    {
      field: 'title',
      headerName: 'Task',
      flex: 1,
      minWidth: 220,
      sortable: true,
      renderCell: (params) => (
        <Tooltip title={params?.row?.details || ''}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <AssignmentIcon fontSize="small" />
            {params?.row?.title ?? ''}
          </span>
        </Tooltip>
      ),
    },
    {
      field: 'object',
      headerName: 'Object',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const r = params?.row || {};
        const a = r.objectType ?? '';
        const b = r.objectCode ?? '';
        return `${a} ${b}`.trim();
      },
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      width: 220,
      sortable: true,
      renderCell: (params) => params?.row?.assignee ?? '',
    },
    {
      field: 'dueDate',
      headerName: 'Due',
      width: 140,
      sortable: true,
      renderCell: (params) => <DueCell value={params?.row?.dueDate} theme={theme} />,
      sortComparator: (_a, _b, p1, p2) => {
        const d1 = new Date(p1?.row?.dueDate || 0).getTime();
        const d2 = new Date(p2?.row?.dueDate || 0).getTime();
        return d1 - d2;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      sortable: true,
      renderCell: (params) => <StatusChip value={params?.row?.status} theme={theme} />,
    },
    {
      field: 'link',
      headerName: '',
      width: 56,
      sortable: false,
      renderCell: (params) =>
        params?.row?.link ? (
          <a href={params.row.link} aria-label="Open linked item">
            <LinkIcon fontSize="small" />
          </a>
        ) : null,
      disableColumnMenu: true,
    },
  ];
  return Object.freeze([...cols]);
}
