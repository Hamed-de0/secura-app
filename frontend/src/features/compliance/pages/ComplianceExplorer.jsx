import React, { useMemo, useState } from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import RequirementsTable from "../components/RequirementsTable.jsx";
import RequirementDrawer from "../components/RequirementDrawer.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import ErrorState from "../../../components/ui/ErrorState.jsx";
import ArticleIcon from "@mui/icons-material/Article";
import { useVersionRequirements } from "../hooks";
import { useLocation, useSearchParams, useParams } from "react-router-dom";

// NEW
import SavedViewBar from "../../../components/SavedViewBar.jsx";
import useGridView from "../../../lib/views/useGridView";
import {
  buildColumns,
  defaultViewPreset,
  columnsList,
  presets,
} from "../../compliance/columns.jsx";

export default function ComplianceExplorer() {
  const location = useLocation();
  const [params] = useSearchParams();

  const scopeKey = React.useMemo(() => {
    const sc = params.get("scope") || "global";
    const ver = params.get("versions") || "current";
    return `scope=${sc};versions=${ver}`;
  }, [location.key]);

  const { versionId } = useParams();
  const versionNum = Number(versionId);
  const {
    data: rows,
    isLoading,
    isError,
    error,
  } = useVersionRequirements(versionNum);
  const [selected, setSelected] = useState(null);

  const gridView = useGridView({
    key: "compliance/requirements@v1",
    defaults: defaultViewPreset,
    filterSchema: {},
    columnIds: columnsList.map((c) => c.id),
    scopeKey,
  });

  // 🔧 Build columns BEFORE early returns (stable hook order)
  const rawColumns = React.useMemo(() => buildColumns(), []);
  const columns = React.useMemo(
    () => gridView.orderColumns(rawColumns),
    [rawColumns, gridView.snapshot.columns.order]
  );

  if (isLoading) return <Skeleton variant="rounded" height={360} />;
  if (isError)
    return (
      <ErrorState
        icon={ArticleIcon}
        title="Failed to load"
        description={error?.message || "Error"}
      />
    );
  if (!rows || rows.length === 0)
    return (
      <EmptyState
        title="No requirements"
        description="Nothing to show for this version."
      />
    );

  return (
    <Box>
      <SavedViewBar
        title="Requirements"
        gridView={gridView}
        columnsList={columnsList}
        presets={presets}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <RequirementsTable
            rows={rows}
            onRowClick={(row) => setSelected(row)}
            loading={false}
            columns={columns}
            columnVisibilityModel={gridView.columnVisibilityModel}
            onColumnVisibilityModelChange={
              gridView.onColumnVisibilityModelChange
            }
            sortingModel={gridView.sortingModel}
            onSortingModelChange={gridView.onSortingModelChange}
            paginationModel={gridView.paginationModel}
            onPaginationModelChange={gridView.onPaginationModelChange}
            density={gridView.density}
          />
        </Grid>
      </Grid>
      <RequirementDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        requirement={selected}
      />
    </Box>
  );
}
