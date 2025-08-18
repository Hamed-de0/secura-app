import React, { useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Skeleton, Typography } from '@mui/material';
import { ScopeContext } from '../../../store/scope/ScopeProvider.jsx';
import { useCoverageVersion } from '../../coverage/hooks'; // returns mock in MOCK_MODE
import { useVersionRequirements, useRequirementDetail } from '../hooks';
import RequirementsTable from '../components/RequirementsTable.jsx';
import RequirementDrawer from '../components/RequirementDrawer.jsx';

export default function ComplianceExplorer() {
  const { versionId: versionIdParam } = useParams();
  const versionId = Number(versionIdParam);
  const { scope } = useContext(ScopeContext);
  const { data: versionDetail, isLoading: loadingDetail } = useCoverageVersion(versionId, scope);
  const { data: reqRows } = useVersionRequirements(versionId);

  const [selectedReqId, setSelectedReqId] = useState(null);
  const { data: selectedReq } = useRequirementDetail(versionId, selectedReqId);

  if (!versionId) {
    return <Box sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">Select a framework version.</Typography></Box>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {loadingDetail && <Skeleton variant="rounded" height={560} />}
          {!loadingDetail && (
            <RequirementsTable
              rows={reqRows}
              loading={false}
              onRowClick={(row) => setSelectedReqId(row.requirement_id)}
            />
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {loadingDetail ? (
            <Skeleton variant="rounded" height={180} />
          ) : (
            <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Version snapshot</Typography>
              <Typography variant="body2">Version ID: {versionId}</Typography>
              <Typography variant="body2">Scope: {scope.type}:{scope.id}</Typography>
              <Typography variant="body2">Score: {Math.round((versionDetail?.score ?? 0)*100)}%</Typography>
              <Typography variant="body2">Requirements: {versionDetail?.requirements?.length ?? 0}</Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      <RequirementDrawer
        open={!!selectedReqId}
        onClose={() => setSelectedReqId(null)}
        requirement={selectedReq}
      />
    </Box>
  );
}
