import * as React from "react";
import { useParams, useSearchParams, Link as RouterLink } from "react-router-dom";
import { Box, Grid, Card, CardContent, Stack, Typography, Chip, Divider, Link, Skeleton } from "@mui/material";
import RightPanelDrawer from "../../../components/rightpanel/RightPanelDrawer.jsx";
import { fetchRequirementOverview, fetchRequirementTimeline } from "../../../api/services/compliance";
import ActionsRail from "./ActionsRail.jsx";
import RequirementHeader from "./sections/RequirementHeader.jsx";
import ScopeUsage from "./sections/ScopeUsage.jsx";
import MappingsControls from "./sections/MappingsControls.jsx";
import EvidencePanel from "./sections/EvidencePanel.jsx";
import ExceptionsPanel from "./sections/ExceptionsPanel.jsx";
import LifecycleAudit from "./sections/LifecycleAudit.jsx";
import OwnersAndMeta from "./sections/OwnersAndMeta.jsx";
import SuggestedControls from "./sections/SuggestedControls.jsx";

const STATUS_COLOR = { met:"#2e7d32", partial:"#ed6c02", gap:"#d32f2f", unknown:"#9e9e9e" };

export default function RequirementPage() {
  const { requirementId: reqIdParam } = useParams();
  const [sp, setSp] = useSearchParams();

  const requirementId = Number(reqIdParam);
  const versionId = Number(sp.get("version_id"));
  const scopeType = sp.get("scope_type") || undefined;
  const scopeId = sp.get("scope_id") ? Number(sp.get("scope_id")) : undefined;

  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Right panel controller
  const [panel, setPanel] = React.useState({ open:false, key:null, title:"", props:{} });
  const openPanel = (key, props, title) => setPanel({ open:true, key, props:props||{}, title: title || "" });
  const closePanel = () => setPanel(p => ({ ...p, open:false }));

  // Fetch overview
  React.useEffect(() => {
    let alive = true;
    if (!requirementId || !versionId) return;
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetchRequirementOverview({
          requirementId, versionId, scopeType, scopeId,
          include: "usage,mappings,evidence,exceptions,lifecycle,owners,suggested_controls"
        });
        if (alive) setData(res?.data ?? res);
      } catch (e) {
        console.error("Failed to fetch requirement overview:", e);
        if (alive) setError(e);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [requirementId, versionId, scopeType, scopeId]);

  if (!versionId || !requirementId) {
    return <Box p={2}><Typography color="error">Missing version_id or requirementId in URL.</Typography></Box>;
  }
  if (loading) return <PageSkeleton />;
  if (error) return <Box p={2}><Typography color="error">Failed to load requirement overview.</Typography></Box>;
  if (!data) return <Box p={2}><Typography>No data.</Typography></Box>;

  const { header, status_summary, usage, mappings, evidence, exceptions, lifecycle, owners, suggested_controls } = data;

  // Scope filter setter
  const setScopeFilter = (t, id) => {
    const next = new URLSearchParams(sp);
    if (t) next.set("scope_type", t); else next.delete("scope_type");
    if (id != null) next.set("scope_id", String(id)); else next.delete("scope_id");
    setSp(next, { replace:true });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <RequirementHeader
            header={header}
            owners={owners}
            statusSummary={status_summary}
            scopeType={scopeType}
            scopeId={scopeId}
            onAssignOwner={() => openPanel("assign-owner", { requirementId, scopeType, scopeId }, "Assign Owner")}
            onOpenExplorer={() => window.open(`/compliance/versions/${versionId}?scope_type=${scopeType||""}&scope_id=${scopeId||""}&hl_req=${requirementId}`, "_blank")}
          />
          <Divider sx={{ my: 1 }} />
          <ScopeUsage usage={usage} active={{ scopeType, scopeId }} onPick={setScopeFilter} />
        </CardContent>
      </Card>

      <Grid container spacing={2} alignItems="stretch">
        {/* Main column */}
        <Grid item xs={12} md={8}>
          {/* Controls */}
          <Card id="controls" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Controls</Typography>
              <MappingsControls
                mappings={mappings}
                onAddEvidence={(ctxLinkId) => openPanel("add-evidence", { contextLinkId: ctxLinkId }, "Add Evidence")}
              />
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card id="evidence" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Evidence</Typography>
              <EvidencePanel
                evidence={evidence}
                mappings={mappings}
                activeScope={{ scopeType, scopeId }}
                onVerify={(evidenceId) => openPanel("verify-evidence", { evidenceId }, "Verify Evidence")}
                onUpload={(evidenceId) => openPanel("upload-artifact", { evidenceId }, "Upload Artifact")}
              />
            </CardContent>
          </Card>

          {/* Exceptions */}
          <Card id="exceptions" sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="overline" color="text.secondary">Exceptions</Typography>
                <Link component="button" onClick={() => openPanel("create-exception", { requirementId, scopeType, scopeId }, "Create Exception")}>
                  Create exception
                </Link>
              </Stack>
              <ExceptionsPanel exceptions={exceptions} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card id="timeline" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Timeline</Typography>
              <LifecycleAudit
                requirementId={requirementId}
                versionId={versionId}
                scopeType={scopeType}
                scopeId={scopeId}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Actions rail */}
        <Grid item xs={12} md={4}>
          <ActionsRail
            requirementId={requirementId}
            versionId={versionId}
            scopeType={scopeType}
            scopeId={scopeId}
            onAddEvidence={() => openPanel("add-evidence", { scopeType, scopeId }, "Add Evidence")}
            onCreateException={() => openPanel("create-exception", { requirementId, scopeType, scopeId }, "Create Exception")}
            onAssignOwner={() => openPanel("assign-owner", { requirementId, scopeType, scopeId }, "Assign Owner")}
            onExport={() => openPanel("export-report", { requirementId, versionId }, "Export")}
            suggestions={<SuggestedControls items={suggested_controls} onAddMapping={(controlId) => openPanel("add-mapping", { requirementId, controlId }, "Add Mapping")} />}
          />
        </Grid>
      </Grid>

      {/* Right panel (stubs for now; you already have forms you can wire later) */}
      <RightPanelDrawer
        open={panel.open}
        title={panel.title}
        onClose={closePanel}
      >
        <Box p={2}>
          <Typography variant="body2" color="text.secondary">
            TODO form: <strong>{panel.key}</strong>
          </Typography>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(panel.props, null, 2)}</pre>
        </Box>
      </RightPanelDrawer>
    </Box>
  );
}

function PageSkeleton() {
  return (
    <Box p={2}>
      <Skeleton height={32} width="60%" />
      <Skeleton height={20} width="40%" />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" height={280} />
          <Box height={12} />
          <Skeleton variant="rectangular" height={280} />
          <Box height={12} />
          <Skeleton variant="rectangular" height={240} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={480} />
        </Grid>
      </Grid>
    </Box>
  );
}
