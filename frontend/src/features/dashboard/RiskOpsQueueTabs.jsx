import * as React from 'react';
import { Box, Tabs, Tab, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { fetchRiskContexts, fetchContextControls, fetchContextEvidence } from '../../api/services/risks';
import { fetchExceptions } from '../../api/services/exceptions';
import { mapOverAppetite, mapReviewsDue, mapExceptionsExpiring, mapRecentChanges } from '../../api/adapters/queues';
import { adaptContextControlsResponse } from '../../api/adapters/controlsContext';
import { adaptEvidenceResponse } from '../../api/adapters/evidence';
import { useLocation, useNavigate } from 'react-router-dom';
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
    { field: 'residual', headerName: 'Residual', width: 100, valueFormatter: (p) => (p?.row?.residualDisplay ?? p?.value ?? '—') },
    { field: 'targetResidual', headerName: 'Target', width: 100, valueFormatter: (p) => (p?.row?.targetResidualDisplay ?? (p && p.value != null ? p.value : '—')) },
    { field: 'greenMax', headerName: 'G', width: 70 },
    { field: 'amberMax', headerName: 'A', width: 70 },
    { field: 'deltaAbove', headerName: '+Δ', width: 80 },
    { field: 'owner', headerName: 'Owner', width: 160 },
    { field: 'nextReview', headerName: 'Next Review', width: 140 },
    { field: 'updatedAt', headerName: 'Updated', width: 140 },
  ],
  reviewsDue: [
    { field: 'contextId', headerName: 'ID', width: 72 },
    { field: 'scenarioTitle', headerName: 'Scenario', flex: 1.3, minWidth: 200 },
    { field: 'scope', headerName: 'Scope', flex: 1.0, minWidth: 160 },
    { field: 'owner', headerName: 'Owner', width: 160 },
    { field: 'nextReview', headerName: 'Next Review', width: 140, valueFormatter: (p) => (p?.value ? new Date(p.value).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' }) : '—') },
    { field: 'slaFlag', headerName: 'SLA', width: 110 },
    { field: 'updatedAt', headerName: 'Updated', width: 140, valueFormatter: (p) => (p?.value ? new Date(p.value).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : '—') },
  ],
  evidenceOverdue: [
    { field: 'contextId', headerName: 'Context', width: 90 },
    { field: 'scope', headerName: 'Scope', flex: 1.0, minWidth: 160 },
    { field: 'control', headerName: 'Control', flex: 1.4, minWidth: 220 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'freshness', headerName: 'Freshness', width: 120 },
    { field: 'lastEvidenceAt', headerName: 'Last Evidence', width: 160, valueFormatter: (p) => (p?.value ? new Date(p.value).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : '—') },
    { field: 'owner', headerName: 'Owner', width: 160 },
  ],
  controlsAwaitingVerification: [
    { field: 'contextId', headerName: 'Context', width: 90 },
    { field: 'control', headerName: 'Control', flex: 1.4, minWidth: 220 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'verification', headerName: 'Verification', width: 140 },
    { field: 'coverage', headerName: 'Coverage', width: 110, valueFormatter: (p) => (p?.value == null ? '—' : `${p.value}%`) },
    { field: 'confidence', headerName: 'Confidence', width: 120, valueFormatter: (p) => (p?.value == null ? '—' : `${p.value}%`) },
    { field: 'lastEvidenceAt', headerName: 'Last Evidence', width: 160, valueFormatter: (p) => (p?.value ? new Date(p.value).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : '—') },
  ],
  exceptionsExpiring: [
    { field: 'contextId', headerName: 'Context', width: 90 },
    { field: 'reference', headerName: 'Reference', flex: 1.4, minWidth: 220 },
    { field: 'endDate', headerName: 'End Date', width: 140, valueFormatter: (p) => (p?.value ? new Date(p.value).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' }) : '—') },
    { field: 'owner', headerName: 'Owner', width: 160 },
  ],
  newChanged: [
    { field: 'contextId', headerName: 'Context', width: 90 },
    { field: 'scenarioTitle', headerName: 'Scenario', flex: 1.3, minWidth: 200 },
    { field: 'scope', headerName: 'Scope', flex: 1.0, minWidth: 160 },
    { field: 'owner', headerName: 'Owner', width: 160 },
    { field: 'updatedAt', headerName: 'Updated', width: 160, valueFormatter: (p) => (p?.value ? new Date(p.value).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : '—') },
  ],
};

export default function RiskOpsQueueTabs() {
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Over Appetite state
  const [oaRows, setOaRows] = React.useState([]);
  const [oaLoading, setOaLoading] = React.useState(false);
  const [oaModel, setOaModel] = React.useState({ page: 0, pageSize: 10 });
  // Reviews Due state
  const [rdRows, setRdRows] = React.useState([]);
  const [rdLoading, setRdLoading] = React.useState(false);
  const [rdModel, setRdModel] = React.useState({ page: 0, pageSize: 10 });
  // Evidence Overdue state
  const [evRows, setEvRows] = React.useState([]);
  const [evLoading, setEvLoading] = React.useState(false);
  const [evModel, setEvModel] = React.useState({ page: 0, pageSize: 10 });

  // Drawer for context detail
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeContextId, setActiveContextId] = React.useState(null);
  const [drawerTitle, setDrawerTitle] = React.useState('Risk Context');
  // Controls Awaiting Verification state
  const [cvRows, setCvRows] = React.useState([]);
  const [cvLoading, setCvLoading] = React.useState(false);
  const [cvModel, setCvModel] = React.useState({ page: 0, pageSize: 10 });
  // Exceptions Expiring state
  const [exRows, setExRows] = React.useState([]);
  const [exLoading, setExLoading] = React.useState(false);
  // New/Changed state
  const [ncRows, setNcRows] = React.useState([]);
  const [ncLoading, setNcLoading] = React.useState(false);
  const [ncModel, setNcModel] = React.useState({ page: 0, pageSize: 10 });

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

  React.useEffect(() => {
    if (value !== 1) return; // only fetch when Reviews Due tab is active
    let alive = true;
    (async () => {
      setRdLoading(true);
      try {
        const resp = await fetchRiskContexts({
          offset: rdModel.page * rdModel.pageSize,
          limit: rdModel.pageSize,
          sort: 'next_review',
          sort_dir: 'asc',
        });
        if (!alive) return;
        const items = Array.isArray(resp?.items) ? resp.items : (Array.isArray(resp) ? resp : []);
        setRdRows(mapReviewsDue(items, { horizonDays: 30 }));
      } finally {
        if (alive) setRdLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [value, rdModel.page, rdModel.pageSize]);

  React.useEffect(() => {
    if (value !== 2) return; // only fetch when Evidence Overdue tab is active
    let alive = true;
    (async () => {
      setEvLoading(true);
      try {
        // a) fetch a page of contexts
        const resp = await fetchRiskContexts({
          offset: evModel.page * evModel.pageSize,
          limit: evModel.pageSize,
          sort: 'updated_at',
          sort_dir: 'desc',
        });
        if (!alive) return;
        const contexts = Array.isArray(resp?.items) ? resp.items : (Array.isArray(resp) ? resp : []);
        const metaById = new Map(contexts.map((c) => {
          const id = c.contextId ?? c.id;
          const scope = c.scopeName || c.scopeDisplay || c.scope || c.scopeRef?.label || '—';
          const owner = c.owner || c.owner_name || 'Unassigned';
          return [id, { scope, owner }];
        }));

        const ctxIds = Array.from(metaById.keys());
        // b) for each context, fetch evidence, filter warn/overdue
        const maxConcurrency = Math.min(8, ctxIds.length || 0);
        let index = 0;
        const out = [];
        async function worker() {
          while (index < ctxIds.length) {
            const i = index++;
            const id = ctxIds[i];
            try {
              const eResp = await fetchContextEvidence(id, { limit: 100, offset: 0, sort_by: 'captured_at', sort_dir: 'desc' });
              const items = adaptEvidenceResponse(eResp) || [];
              const flagged = items.filter((ev) => ev.freshness === 'warn' || ev.freshness === 'overdue');
              const meta = metaById.get(id) || { scope: '—', owner: 'Unassigned' };
              const mapped = flagged.map((ev) => ({
                id: `${id}-${ev.id}`,
                contextId: id,
                scope: meta.scope,
                control: ev.controlId ? `#${ev.controlId}` : '—',
                type: ev.type,
                freshness: ev.freshness,
                lastEvidenceAt: ev.capturedAt,
                owner: meta.owner,
              }));
              out.push(...mapped);
            } catch (_) {
              // ignore individual failures
            }
          }
        }
        await Promise.all(Array.from({ length: Math.max(1, maxConcurrency) }, () => worker()));
        if (!alive) return;
        setEvRows(out);
      } finally {
        if (alive) setEvLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [value, evModel.page, evModel.pageSize]);

  React.useEffect(() => {
    if (value !== 3) return; // only fetch when Controls Awaiting Verification is active
    let alive = true;
    (async () => {
      setCvLoading(true);
      try {
        // 1) Fetch a slice of contexts
        const resp = await fetchRiskContexts({
          offset: cvModel.page * cvModel.pageSize,
          limit: cvModel.pageSize,
          sort: 'updated_at',
          sort_dir: 'desc',
        });
        if (!alive) return;
        const ctxItems = Array.isArray(resp?.items) ? resp.items : (Array.isArray(resp) ? resp : []);
        const ctxIds = ctxItems.map((c) => c.contextId ?? c.id).filter(Boolean);

        // 2) For each context, fetch controls with limited concurrency
        const maxConcurrency = Math.min(8, ctxIds.length || 0);
        let index = 0;
        const acc = [];
        async function worker() {
          while (index < ctxIds.length) {
            const i = index++;
            const id = ctxIds[i];
            try {
              const cResp = await fetchContextControls(id, { include: 'summary', limit: 100, offset: 0, sort_by: 'status', sort_dir: 'asc' });
              const rows = adaptContextControlsResponse(cResp) || [];
              const filtered = rows.filter((r) => {
                const s = String(r.status || '').trim().toLowerCase().replace(/\s+/g, '');
                const v = String(r.verification || '').trim().toLowerCase().replace(/\s+/g, '');
                return s === 'implemented' || v === 'design';
              });
              const mapped = filtered.map((r) => ({
                id: `${id}-${r.linkId || r.controlId || r.code}`,
                contextId: id,
                code: r.code,
                title: r.title,
                control: `${r.code || ''} — ${r.title || ''}`,
                status: r.status,
                verification: r.verification,
                coverage: r.coverage,
                confidence: r.confidence,
                lastEvidenceAt: r.lastEvidenceAt,
              }));
              acc.push(...mapped);
            } catch (_) {
              // ignore failed context control fetches to keep UI responsive
            }
          }
        }
        await Promise.all(Array.from({ length: Math.max(1, maxConcurrency) }, () => worker()));
        if (!alive) return;
        setCvRows(acc);
      } finally {
        if (alive) setCvLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [value, cvModel.page, cvModel.pageSize]);

  React.useEffect(() => {
    if (value !== 4) return; // Exceptions Expiring
    let alive = true;
    (async () => {
      setExLoading(true);
      try {
        const list = await fetchExceptions({});
        if (!alive) return;
        setExRows(mapExceptionsExpiring(Array.isArray(list) ? list : [], { horizonDays: 30 }));
      } finally {
        if (alive) setExLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [value]);

  React.useEffect(() => {
    if (value !== 5) return; // New/Changed
    let alive = true;
    (async () => {
      setNcLoading(true);
      try {
        const resp = await fetchRiskContexts({
          offset: ncModel.page * ncModel.pageSize,
          limit: ncModel.pageSize,
          sort: 'updated_at',
          sort_dir: 'desc',
        });
        if (!alive) return;
        const items = Array.isArray(resp?.items) ? resp.items : (Array.isArray(resp) ? resp : []);
        setNcRows(mapRecentChanges(items, { days: 7 }));
      } finally {
        if (alive) setNcLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [value, ncModel.page, ncModel.pageSize]);

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
        <Box sx={{ height: 340 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, color: 'text.secondary' }}>
            <Tooltip title="Residual = current effective residual (server-gated if provided). Target = planned/implemented residual; '—' if not provided.">
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Residual vs Target (server-gated)</Typography>
              </Box>
            </Tooltip>
          </Box>
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
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Box sx={{ height: 320 }}>
          <DataGrid
            columns={COLUMNS.reviewsDue}
            rows={rdRows}
            loading={rdLoading}
            getRowId={(r) => r.id}
            paginationModel={rdModel}
            onPaginationModelChange={setRdModel}
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
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Box sx={{ height: 320 }}>
          <DataGrid
            columns={COLUMNS.evidenceOverdue}
            rows={evRows}
            loading={evLoading}
            getRowId={(r) => r.id}
            paginationModel={evModel}
            onPaginationModelChange={setEvModel}
            pageSizeOptions={[10, 25, 50]}
            disableColumnMenu
            density="compact"
            onRowClick={(p) => {
              const id = p?.row?.contextId || p?.row?.id;
              if (!id) return;
              // focus Evidence tab in drawer
              try {
                const sp = new URLSearchParams(location.search);
                sp.set('tab', 'evidence');
                navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
              } catch {}
              setActiveContextId(id);
              setDrawerOpen(true);
              setDrawerTitle(p?.row?.control || 'Risk Context');
            }}
          />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Box sx={{ height: 320 }}>
          <DataGrid
            columns={COLUMNS.controlsAwaitingVerification}
            rows={cvRows}
            loading={cvLoading}
            getRowId={(r) => r.id}
            paginationModel={cvModel}
            onPaginationModelChange={setCvModel}
            pageSizeOptions={[10, 25, 50]}
            disableColumnMenu
            density="compact"
            onRowClick={(p) => {
              const id = p?.row?.contextId || p?.row?.id;
              if (!id) return;
              // navigate to set ?tab=controls to focus Controls inside the drawer
              try {
                const sp = new URLSearchParams(location.search);
                sp.set('tab', 'controls');
                navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
              } catch {}
              setActiveContextId(id);
              setDrawerOpen(true);
              setDrawerTitle(p?.row?.control || 'Risk Context');
            }}
          />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={4}>
        <Box sx={{ height: 320 }}>
          <DataGrid
            columns={COLUMNS.exceptionsExpiring}
            rows={exRows}
            loading={exLoading}
            getRowId={(r) => r.id}
            disableColumnMenu
            density="compact"
            onRowClick={(p) => {
              const id = p?.row?.contextId || p?.row?.id;
              if (!id) return;
              try {
                const sp = new URLSearchParams(location.search);
                sp.set('tab', 'overview');
                navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
              } catch {}
              setActiveContextId(id);
              setDrawerOpen(true);
              setDrawerTitle('Exception');
            }}
          />
        </Box>
      </TabPanel>
      <TabPanel value={value} index={5}>
        <Box sx={{ height: 320 }}>
          <DataGrid
            columns={COLUMNS.newChanged}
            rows={ncRows}
            loading={ncLoading}
            getRowId={(r) => r.id}
            paginationModel={ncModel}
            onPaginationModelChange={setNcModel}
            pageSizeOptions={[10, 25, 50]}
            disableColumnMenu
            density="compact"
            onRowClick={(p) => {
              const id = p?.row?.contextId || p?.row?.id;
              if (!id) return;
              try {
                const sp = new URLSearchParams(location.search);
                sp.set('tab', 'history');
                navigate(`${location.pathname}?${sp.toString()}`, { replace: true });
              } catch {}
              setActiveContextId(id);
              setDrawerOpen(true);
              setDrawerTitle(p?.row?.scenarioTitle || 'Risk Context');
            }}
          />
        </Box>
      </TabPanel>
      {/* Shared drawer for all tabs */}
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
    </Box>
  );
}
