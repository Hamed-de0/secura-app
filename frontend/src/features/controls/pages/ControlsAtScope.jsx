import React, { useContext, useMemo, useState, useEffect } from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { ScopeContext } from "../../../store/scope/ScopeProvider.jsx";
import { useEffectiveControls } from "../hooks";
import ControlsFilters from "../components/ControlsFilters.jsx";
import EffectiveControlsGrid from "../components/EffectiveControlsGrid.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import ErrorState from "../../../components/ui/ErrorState.jsx";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

import ControlImpactDrawer from "../components/ControlImpactDrawer.jsx";
import { useAssuranceOverlay } from "../../evidence/hooks";

import SavedViewBar from "../../../components/SavedViewBar.jsx";
import useGridView from "../../../lib/views/useGridView";
import {
  buildColumns,
  defaultViewPreset,
  columnsList,
  presets,
} from "../../controls/columns.jsx";

import { addReqCounts } from "../adapters";
import controlsMock from "../../../mock/controls.json"; // <-- catalog lookup

export default function ControlsAtScope() {
  // ---- Hooks (fixed order)
  const { scope, versions: scopeVersions } = useContext(ScopeContext);
  const versions = Array.isArray(scopeVersions) ? scopeVersions : [];
  const { data: controls, isLoading, isError, error } = useEffectiveControls(scope);

  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(null);
  const [source, setSource] = useState(null);
  const [assurance, setAssurance] = useState(null);
  const q = params.get("q") ?? "";

  const scopeKey = useMemo(() => {
    const v = versions.length ? versions.join(",") : "current";
    const s = scope?.type ? `${scope.type}:${scope.id ?? "root"}` : "global";
    return `scope=${s};versions=${v}`;
  }, [scope?.type, scope?.id, versions.join(",")]);

  const gridView = useGridView({
    key: "controls/effective@v1",
    defaults: defaultViewPreset,
    filterSchema: { q: "", source: null, assurance: null },
    columnIds: columnsList.map((c) => c.id),
    scopeKey,
    syncQ: true,
  });

  const rawColumns = useMemo(() => buildColumns(), []);
  const columns = useMemo(
    () => gridView.orderColumns(rawColumns),
    [rawColumns, gridView.snapshot.columns.order] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useAssuranceOverlay();

  // --- JOIN: fill code/title from mock catalog if missing -------------------
  const catalog = controlsMock.catalog || controlsMock.controls || [];
  const byControlId = useMemo(
    () => new Map(catalog.map(c => [c.control_id ?? c.id, c])),
    [catalog]
  );

  const withNames = useMemo(() => {
    const src = controls || [];
    return src.map(r => {
      
      if (r.code && r.title) return r;
      const fb = byControlId.get(r.control_id) || {};
      return {
        ...r,
        code: r.code ?? fb.code ?? "",
        title: r.title ?? fb.title ?? "",
      };
    });
  }, [controls, byControlId]);

  // Add Req counts
  const itemsWithCounts = useMemo(
    () => addReqCounts(withNames, versions),
    [withNames, versions]
  );

  // Filtering (exact keys)
  const filtered = useMemo(() => {
    const _q = (q || "").toLowerCase();
    return (itemsWithCounts || []).filter((r) => {
      if (source && r.source !== source) return false;
      if (assurance && String(r.assurance_status || "").toLowerCase() !== assurance) return false;
      if (_q) {
        const hay = `${r.code ?? ""} ${r.title ?? ""}`.toLowerCase();
        if (!hay.includes(_q)) return false;
      }
      return true;
    });
  }, [itemsWithCounts, source, assurance, q]);

  useEffect(() => {
    gridView.setFilters({ q, source, assurance });
  }, [q, source, assurance]); // eslint-disable-line react-hooks/exhaustive-deps

  console.log('filtered', filtered);
  // ---- Render (single return → stable hooks)
  let body = null;
  if (isLoading) {
    body = <Skeleton variant="rounded" height={360} />;
  } else if (isError) {
    body = (
      <ErrorState
        icon={FilterAltIcon}
        title="Failed to load"
        description={error?.message || "Error"}
      />
    );
  } else if (!withNames || withNames.length === 0) {
    body = (
      <EmptyState
        title="No controls"
        description="No effective controls for current scope."
      />
    );
  } else {
    body = (
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <ControlsFilters
            q={q}
            onQ={(val) =>
              setParams((p) => {
                const n = new URLSearchParams(p);
                n.set("q", val);
                return n;
              })
            }
            source={source}
            onSource={setSource}
            assurance={assurance}
            onAssurance={setAssurance}
          />
        </Grid>

        <Grid item xs={12} md={9}>
          <EffectiveControlsGrid
            rows={filtered}
            loading={false}
            onRowClick={(row) => setSelected(row)}
            columns={columns}
            columnVisibilityModel={gridView.columnVisibilityModel}
            onColumnVisibilityModelChange={gridView.onColumnVisibilityModelChange}
            sortingModel={gridView.sortingModel}
            onSortingModelChange={gridView.onSortingModelChange}
            paginationModel={gridView.paginationModel}
            onPaginationModelChange={gridView.onPaginationModelChange}
            density={gridView.density}
          />
        </Grid>
      </Grid>
    );
  }
  
  return (
    <>
      <Box>
        <SavedViewBar
          title="Controls"
          gridView={gridView}
          columnsList={columnsList}
          presets={presets}
        />
        {body}
      </Box>

      <ControlImpactDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        control={selected}
      />
    </>
  );
}
