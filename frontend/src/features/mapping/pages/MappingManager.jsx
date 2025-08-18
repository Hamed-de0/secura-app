import React, { useContext, useMemo, useState } from 'react';
import { Box, Grid, Skeleton, Typography, Stack, Button } from '@mui/material';
import { ScopeContext } from '../../../store/scope/ScopeProvider.jsx';
import coverageMock from '../../../mock/coverage.json';
import { useFrameworkVersions } from '../../../lib/mock/useRbac';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useMappings, useControlsCatalog } from '../hooks';
import MappedControlsGrid from '../components/MappedControlsGrid.jsx';
import ControlsCatalog from '../components/ControlsCatalog.jsx';
import MappingTotals from '../components/MappingTotals.jsx';
import MappingDiffBanner from '../components/MappingDiffBanner.jsx';

function useRequirementsForVersion(versionId) {
    return useMemo(() => {
        if (!versionId) return { rows: [], isLoading: false };
        const v = coverageMock.versions[String(versionId)];
        const rows = (v?.requirements || []).map(r => ({
            id: r.requirement_id,
            requirement_id: r.requirement_id,
            code: r.code,
            title: r.title,
            score: r.score,
            // for later: mapped_count, hits_count (we’ll fill with mock mappings in P1-2)
        }));
        return { rows, isLoading: false };
    }, [versionId]);
}

export default function MappingManager() {
    const { versions } = useContext(ScopeContext);
    const { data: allVersions } = useFrameworkVersions();
    const versionId = versions?.[0]; // MVP: primary version = first selected
    const { rows, isLoading } = useRequirementsForVersion(versionId);
    const [selectedReq, setSelectedReq] = useState(null);

    const mm = useMappings(versionId); // mappings manager (local draft)
    const mappedRows = selectedReq ? mm.getForRequirement(selectedReq.requirement_id) : [];
    const mappedIds = mappedRows.map(m => m.control_id);
    const total = selectedReq ? mm.totalWeight(selectedReq.requirement_id) : 0;

    const handleAdd = (controlId) => {
        if (!selectedReq) return;
        mm.addMapping(selectedReq.requirement_id, controlId, 100);
    };
    const handleWeight = (controlId, w) => {
        if (!selectedReq) return;
        mm.updateWeight(selectedReq.requirement_id, controlId, w);
    };
    const handleRemove = (controlId) => {
        if (!selectedReq) return;
        mm.removeMapping(selectedReq.requirement_id, controlId);
    };


    const vCode = useMemo(() => {
        const map = new Map((allVersions || []).map(v => [v.id, v.code]));
        return versionId ? (map.get(versionId) || `v${versionId}`) : '—';
    }, [allVersions, versionId]);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
                Mapping Manager — {vCode}
            </Typography>

            <Grid container spacing={2} sx={{ minHeight: 520 }}>
                {/* LEFT: Requirements list */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Requirements</Typography>
                    {isLoading && <Skeleton variant="rounded" height={520} />}
                    {!isLoading && rows.length === 0 && (
                        <EmptyState
                            icon={<LibraryBooksIcon />}
                            title="No requirements for this version"
                            description="Select another version in the header."
                        />
                    )}
                    {!isLoading && rows.length > 0 && (
                        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
                            {/* simple list for now; DataGrid comes when we add counts */}
                            {rows.map(r => (
                                <Box
                                    key={r.id}
                                    onClick={() => setSelectedReq(r)}
                                    sx={{
                                        p: 1,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        bgcolor: selectedReq?.id === r.id ? 'action.selected' : 'transparent',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <Typography variant="body2" noWrap>
                                        {r.code} — {r.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        mapped: {mm.getForRequirement(r.requirement_id).length}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Grid>

                {/* MIDDLE: Mapping panel placeholder */}
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Mappings</Typography>
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, minHeight: 420 }}>
                        {selectedReq ? (
                            <>
                                {selectedReq && (
                                    <MappingDiffBanner
                                        diff={mm.diffForRequirement(selectedReq.requirement_id)}
                                        onReset={() => mm.resetDraft()}
                                        onExport={() => mm.exportJSON()}
                                    />
                                )}

                                <MappingTotals totalWeight={total} count={mappedRows.length} />
                                <MappedControlsGrid
                                    rows={mappedRows}
                                    totalWeight={total}
                                    onWeight={handleWeight}
                                    onRemove={handleRemove}
                                />
                            </>
                        ) : (
                            <EmptyState title="Pick a requirement" description="Choose a requirement on the left to manage mappings." />
                        )}
                    </Box>
                </Grid>

                {/* RIGHT: Controls catalog placeholder */}


                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Controls catalog</Typography>
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, minHeight: 420 }}>
                        <ControlsCatalog mappedIds={mappedIds} onAdd={handleAdd} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
