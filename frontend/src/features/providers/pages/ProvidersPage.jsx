import React, { useMemo, useState } from "react";
import { Box, Grid, Skeleton, TextField, Stack } from "@mui/material";
import { useProvidersList, useProviderDetail } from "../hooks";
import ProviderList from "../components/ProviderList.jsx";
import ProviderDetail from "../components/ProviderDetail.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import ErrorState from "../../../components/ui/ErrorState.jsx";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import { useLocation, useSearchParams } from "react-router-dom";

// NEW
import SavedViewBar from "../../../components/SavedViewBar.jsx";
import useGridView from "../../../lib/views/useGridView";

export default function ProvidersPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const scopeKey = React.useMemo(() => {
    const sc = params.get("scope") || "global";
    const ver = params.get("versions") || "current";
    return `scope=${sc};versions=${ver}`;
  }, [location.key]);

  const { data: items, isLoading, isError, error } = useProvidersList();
  const [selectedId, setSelectedId] = useState(items?.[0]?.id || null);
  const { data: svc } = useProviderDetail(selectedId);

  const gridView = useGridView({
    key: "providers/list@v1",
    defaults: {
      pagination: { pageSize: 10 },
      columns: { visible: [], order: [] },
      sort: [],
      density: "standard",
      filters: { q: "" },
    },
    filterSchema: { q: "" },
    scopeKey,
  });

  // make sure selection updates when list loads
  React.useEffect(() => {
    if (items && items.length > 0 && !selectedId) setSelectedId(items[0].id);
  }, [items]);

  const q = gridView.snapshot?.filters?.q || "";
  const filtered = useMemo(() => {
    const _q = (q || "").toLowerCase();
    return (items || []).filter((s) =>
      _q
        ? `${s.name ?? ""} ${s.description ?? ""}`.toLowerCase().includes(_q)
        : true
    );
  }, [items, q]);

  if (isLoading) return <Skeleton variant="rounded" height={360} />;
  if (isError)
    return (
      <ErrorState
        icon={CloudSyncIcon}
        title="Failed to load"
        description={error?.message || "Error"}
      />
    );

  return (
    <Box>
      <SavedViewBar title="Providers" gridView={gridView} />

      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        <TextField
          size="small"
          placeholder="Search providers…"
          value={q}
          onChange={(e) =>
            gridView.setFilters({
              ...gridView.snapshot.filters,
              q: e.target.value,
            })
          }
          sx={{ minWidth: 260 }}
        />
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {isLoading && <Skeleton variant="rounded" height={320} />}
          {!isLoading && filtered?.length === 0 && (
            <EmptyState
              title="No services"
              description="No services to show."
            />
          )}
          {!isLoading && filtered?.length > 0 && (
            <ProviderList
              items={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </Grid>
        <Grid item xs={12} md={8}>
          {isLoading && <Skeleton variant="rounded" height="100%" />}
          {!isLoading && filtered?.length === 0 && (
            <EmptyState
              title="Select a service"
              description="No services to show at this scope."
            />
          )}
          {!isLoading && filtered?.length > 0 && (
            <ProviderDetail service={svc} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
