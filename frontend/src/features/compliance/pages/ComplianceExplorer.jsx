import * as React from "react";
import { Box, Grid, Skeleton, Stack, Typography, Chip } from "@mui/material";
import { useSearchParams, useParams } from "react-router-dom";
import SavedViewBar from "../../../components/SavedViewBar.jsx";
import useGridView from "../../../lib/views/useGridView";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import ErrorState from "../../../components/ui/ErrorState.jsx";
import RightPanelDrawer from "../../../components/rightpanel/RightPanelDrawer.jsx";

import RequirementsTable from "../components/RequirementsTable.jsx";
import RequirementDetailPanel from "../components/RequirementDetailPanel.jsx";
import RequirementTreePanel from "../components/RequirementTreePanel.jsx";

import { fetchRequirementsStatusPage, fetchEffectiveCoverage } from "../../../api/services/compliance";
import { adaptStatusPage, pickRequirementDetailFromCoverage } from "../../../api/adapters/compliance";
import { buildColumns, defaultViewPreset, registerColumnsList } from "../columns.jsx";

export default function ComplianceExplorer() {
  const { versionId: routeVersion } = useParams();
  const [sp, setSp] = useSearchParams();

  const versionId = Number(routeVersion || sp.get("version_id") || 1);
  const scopeType = sp.get("scope_type") || "org";
  const scopeId = Number(sp.get("scope_id") || 1);
  const ancestorId = sp.get("ancestor_id") || "";

  const scopeKey = `compliance-${versionId}-${scopeType}-${scopeId}`;
  const gridView = useGridView({
    id: `ComplianceExplorer-${scopeKey}`,
    viewPreset: defaultViewPreset,
    filterSchema: { q: "", status: "", ancestor_id: "" },
    columnIds: registerColumnsList.map(c => c.id),
    scopeKey,
  });

  // Data
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const sortField = gridView.sortingModel?.[0]?.field || 'code';
  const sortDir = gridView.sortingModel?.[0]?.sort === 'desc' ? 'desc' : 'asc';

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const page = await fetchRequirementsStatusPage({
        versionId, scopeType, scopeId,
        q: gridView.filters.q || undefined,
        ancestorId: ancestorId || gridView.filters.ancestor_id || undefined,
        status: gridView.filters.status || undefined,
        sortBy: sortField, sortDir: sortDir,
        page: (gridView.paginationModel?.page || 0) + 1,
        size: gridView.paginationModel?.pageSize || 25,
      });
      const adapted = adaptStatusPage(page);
      setRows(adapted.items);
      setTotal(adapted.total);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [versionId, scopeType, scopeId, gridView.filters, gridView.paginationModel, sortField, sortDir, ancestorId]);

  React.useEffect(() => { load(); }, [load]);

  // Selection + drawer
  const [sel, setSel] = React.useState(null);
  const [drawerData, setDrawerData] = React.useState(null);
  const [drawerLoading, setDrawerLoading] = React.useState(false);

  const openDrawerFor = async (row) => {
    setSel(row);
    setDrawerLoading(true);
    try {
      const cov = await fetchEffectiveCoverage({ versionId, scopeType, scopeId });
      const detail = pickRequirementDetailFromCoverage(cov, row?.requirement_id);
      setDrawerData(detail);
    } catch (e) {
      console.error(e);
      setDrawerData(null);
    } finally {
      setDrawerLoading(false);
    }
  };

  const onSelectTree = (id) => {
    const next = new URLSearchParams(sp);
    if (id) next.set("ancestor_id", id); else next.delete("ancestor_id");
    next.set("page", "1");
    setSp(next);
    gridView.onPaginationModelChange({ page: 0, pageSize: gridView.paginationModel?.pageSize || 25 });
  };

  const columns = React.useMemo(() => buildColumns(), []);

  return (
    <Box sx={{ p: 2, display: "grid", gridTemplateColumns: "320px 1fr", gap: 2 }}>
      {/* Left: Requirement tree */}
      <RequirementTreePanel versionId={versionId} selected={ancestorId} onSelect={onSelectTree} />

      {/* Right: Filters + Grid */}
      <Box>
        <SavedViewBar
          title="Requirements Explorer"
          viewId={gridView.viewId}
          onReload={load}
          filters={gridView.filters}
          onFiltersChange={gridView.onFiltersChange}
          sortingModel={gridView.sortingModel}
          onSortingModelChange={gridView.onSortingModelChange}
          columnVisibilityModel={gridView.columnVisibilityModel}
          onColumnVisibilityModelChange={gridView.onColumnVisibilityModelChange}
        />

        {error && <ErrorState title="Failed to load requirements" error={error} />}
        {!error && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RequirementsTable
                rows={rows}
                columns={columns}
                loading={loading}
                total={total}
                onRowClick={openDrawerFor}
                sortingModel={gridView.sortingModel}
                onSortingModelChange={gridView.onSortingModelChange}
                columnVisibilityModel={gridView.columnVisibilityModel}
                onColumnVisibilityModelChange={gridView.onColumnVisibilityModelChange}
                paginationModel={gridView.paginationModel}
                onPaginationModelChange={gridView.onPaginationModelChange}
                density={gridView.density}
              />
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Universal right panel drawer */}
      <RightPanelDrawer
        open={!!sel}
        onClose={() => { setSel(null); setDrawerData(null); }}
        title={sel ? `${sel.code} — ${sel.title || ''}` : 'Requirement'}
      >
        <RequirementDetailPanel loading={drawerLoading} detail={drawerData} />
      </RightPanelDrawer>
    </Box>
  );
}
