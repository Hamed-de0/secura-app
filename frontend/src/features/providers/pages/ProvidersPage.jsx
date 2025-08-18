import React, { useMemo, useState } from 'react';
import { Box, Grid, Skeleton } from '@mui/material';
import { useProvidersList, useProviderDetail } from '../hooks';
import ProviderList from '../components/ProviderList.jsx';
import ProviderDetail from '../components/ProviderDetail.jsx';

export default function ProvidersPage() {
  const { data: items, isLoading } = useProvidersList();
  const [selectedId, setSelectedId] = useState(items?.[0]?.id || null);
  const { data: svc } = useProviderDetail(selectedId);

  // make sure selection updates when list loads
  React.useEffect(() => {
    if (!selectedId && items?.length) setSelectedId(items[0].id);
  }, [items, selectedId]);

  return (
    <Box sx={{ p: 0, height: 'calc(100vh - 64px - 48px)' }}>
      <Grid container sx={{ height: '100%' }}>
        <Grid item xs={12} md={4} lg={3} sx={{ height: '100%' }}>
          {isLoading ? <Skeleton variant="rounded" height="100%" /> :
            <ProviderList items={items} selectedId={selectedId} onSelect={setSelectedId} />}
        </Grid>
        <Grid item xs={12} md={8} lg={9} sx={{ height: '100%', borderLeft: 1, borderColor: 'divider' }}>
          {isLoading ? <Skeleton variant="rounded" height="100%" /> :
            <ProviderDetail service={svc} />}
        </Grid>
      </Grid>
    </Box>
  );
}
