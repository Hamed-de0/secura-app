import React, { useContext, useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { ScopeContext } from '../../../store/scope/ScopeProvider.jsx';
import { useActivities } from '../hooks';
import ActivityFilters from '../components/ActivityFilters.jsx';
import ActivityList from '../components/ActivityList.jsx';
import ActivityDrawer from '../components/ActivityDrawer.jsx';

export default function ActivitiesPage() {
  const { scope } = useContext(ScopeContext);
  const [q, setQ] = useState('');
  const [types, setTypes] = useState([]);
  const filters = { q, types };
  const { data: items, isLoading } = useActivities(scope, filters);
  const [selected, setSelected] = useState(null);

  return (
    <Box sx={{ p: 2 }}>
      <ActivityFilters q={q} setQ={setQ} types={types} setTypes={setTypes} />
      {isLoading ? <Skeleton variant="rounded" height={520} /> :
        <ActivityList items={items} onOpen={setSelected} />}
      <ActivityDrawer open={!!selected} onClose={()=> setSelected(null)} event={selected} />
    </Box>
  );
}
