import * as React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { fetchRiskContexts } from '../../api/services/risks';
import { mapOverAppetite } from '../../api/adapters/queues';
import RightPanelDrawer from '../../components/rightpanel/RightPanelDrawer';
import ContextDetail from '../risks/components/ContextDetail';

function a11yProps(index) {
  return { id: `riskops-tab-${index}`, 'aria-controls': `riskops-tabpanel-${index}` };
}

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`riskops-tabpanel-${index}`}
      aria-labelledby={`riskops-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const commonGridProps = {
  rows: [],
  getRowId: (r) => r.id,
  loading: false,
  disableColumnMenu: true,
  density: 'compact',
};

const COLUMNS = {
  overAppetite: [
    { field: 'contextId', headerName: 'ID', width: 72 },
    { field: 'scenarioTitle', headerName: 'Scenario', flex: 1.4, minWidth: 220 },
    { field: 'scope', headerName: 'Scope', flex: 1.0, minWidth: 160 },
    { field: 'residual', headerName: 'Residual', width: 100 },
    { field: 'targetResidual', headerName: 'Target', width: 100, valueFormatter: (p) => (p && p.value != null ? p.value : '—') },
    { field: 'greenMax', headerName: 'G', width: 70 },
    { field: 'amberMax', headerName: 'A', width: 70 },
    { field: 'deltaAbove', headerName: '+Δ', width: 80 },
    { field: 'owner', headerName: 'Owner', width: 160 },
    { field: 'nextReview', headerName: 'Next Review', width: 140 },
    { field: 'updatedAt', headerName: 'Updated', width: 140 },
  ],
  reviewsDue: [
    { field: 'scenario', headerName: 'Scenario', flex: 1.2, minWidth: 180 },
    { field: 'scope', headerName: 'Scope', flex: 1.0, minWidth: 160 },
    { field: 'nextReview', headerName: 'Next Review', width: 140 },
    { field: 'owner', headerName: 'Owner', width: 160 },
    { field: 'status', headerName: 'Status', width: 120 },
  ],
  evidenceOverdue: [
    { field: 'control', headerName: 'Control', flex: 1.2, minWidth: 180 },
    { field: 'context', headerName: 'Context', flex: 1.0, minWidth: 160 },
    { field: 'owner', headerName: 'Owner', width: 160 },
    { field: 'overdue', headerName: 'Overdue (days)', width: 140 },
    { field: 'updated', headerName: 'Updated', width: 120 },
  ],
  controlsAwaitingVerification: [
    { field: 'control', headerName: 'Control', flex: 1.2, minWidth: 180 },
    { field: 'context', headerName: 'Context', flex: 1.0, minWidth: 160 },
    { field: 'submittedBy', headerName: 'Submitted By', width: 160 },
    { field: 'submittedAt', headerName: 'Submitted At', width: 140 },
    { field: 'status', headerName: 'Status', width: 120 },
  ],
  exceptionsExpiring: [
    { field: 'exception', headerName: 'Exception', flex: 1.2, minWidth: 180 },
    { field: 'context', headerName: 'Context', flex: 1.0, minWidth: 160 },
    { field: 'expiresAt', headerName: 'Expires', width: 140 },
    { field: 'owner', headerName: 'Owner', width: 160 },
    { field: 'status', headerName: 'Status', width: 120 },
  ],
  newChanged: [
    { field: 'scenario', headerName: 'Scenario', flex: 1.2, minWidth: 180 },
    { field: 'context', headerName: 'Context', flex: 1.0, minWidth: 160 },
    { field: 'changeType', headerName: 'Change', width: 140 },
    { field: 'changedAt', headerName: 'Changed At', width: 140 },
    { field: 'owner', headerName: 'Owner', width: 160 },
  ],
};

export default function RiskOpsQueueTabs() {
  const [value, setValue] = React.useState(0);

  // Over Appetite state
  const [oaRows, setOaRows] = React.useState([]);
  const [oaLoading, setOaLoading] = React.useState(false);
  const [oaModel, setOaModel] = React.useState({ page: 0, pageSize: 10 });

  // Drawer for context detail
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeContextId, setActiveContextId] = React.useState(null);
  const [drawerTitle, setDrawerTitle] = React.useState('Risk Context');

  React.useEffect(() => {
    if (value !== 0) return; // only fetch for Over Appetite tab when active
    let alive = true;
    (async () => {
      setOaLoading(true);
      try {
        const resp = await fetchRiskContexts({
          offset: oaModel.page * oaModel.pageSize,
          limit: oaModel.pageSize,
          sort: 'residual',
          sort_dir: 'desc',
          over_appetite: true, // server-side filter if supported
        });
        if (!alive) return;
        const items = Array.isArray(resp?.items) ? resp.items : (Array.isArray(resp) ? resp : []);
        setOaRows(mapOverAppetite(items));
      } finally {
        if (alive) setOaLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [value, oaModel.page, oaModel.pageSize]);

  return (
    <Box>
      <Tabs
        value={value}
        onChange={(_, v) => setValue(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab label="Over Appetite" {...a11yProps(0)} />
        <Tab label="Reviews Due" {...a11yProps(1)} />
        <Tab label="Evidence Overdue" {...a11yProps(2)} />
        <Tab label="Controls Awaiting Verification" {...a11yProps(3)} />
        <Tab label="Exceptions Expiring" {...a11yProps(4)} />
        <Tab label="New/Changed" {...a11yProps(5)} />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Box sx={{ height: 320 }}>
          <DataGrid
            columns={COLUMNS.overAppetite}
            rows={oaRows}
            loading={oaLoading}
            getRowId={(r) => r.id}
            paginationModel={oaModel}
            onPaginationModelChange={setOaModel}
            pageSizeOptions={[10, 25, 50]}
            disableColumnMenu
            density="compact"
            onRowClick={(p) => {
              const id = p?.row?.contextId || p?.row?.id;
              if (!id) return;
              setActiveContextId(id);
              setDrawerOpen(true);
              setDrawerTitle(p?.row?.scenarioTitle || 'Risk Context');
            }}
          />
        </Box>
        <RightPanelDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={drawerTitle}
          initialWidth={600}
          minWidth={420}
          maxWidth={1100}
        >
          {activeContextId ? (
            <ContextDetail
              contextId={activeContextId}
              onLoadedTitle={(t) => setDrawerTitle(t || 'Risk Context')}
            />
          ) : null}
        </RightPanelDrawer>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={{ height: 320 }}>
          <DataGrid columns={COLUMNS.reviewsDue} {...commonGridProps} />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Box sx={{ height: 320 }}>
          <DataGrid columns={COLUMNS.evidenceOverdue} {...commonGridProps} />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Box sx={{ height: 320 }}>
          <DataGrid columns={COLUMNS.controlsAwaitingVerification} {...commonGridProps} />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Box sx={{ height: 320 }}>
          <DataGrid columns={COLUMNS.exceptionsExpiring} {...commonGridProps} />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={5}>
        <Box sx={{ height: 320 }}>
          <DataGrid columns={COLUMNS.newChanged} {...commonGridProps} />
        </Box>
      </TabPanel>
    </Box>
  );
}
