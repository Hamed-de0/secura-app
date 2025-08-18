import React, { useContext, useMemo, useState } from 'react';
import { Box, Tabs, Tab, Typography, Stack, Chip, Divider, Skeleton } from '@mui/material';
import { ScopeContext } from '../../../store/scope/ScopeProvider.jsx';
import { useAssetEffective } from '../hooks';
import EffectiveControlsGrid from '../../controls/components/EffectiveControlsGrid.jsx';
import RiskTable from '../../risks/components/RiskTable.jsx';
import { useFrameworkVersions } from '../../../lib/mock/useRbac';
import { useNavigate } from 'react-router-dom';

function a11yProps(i){ return { id:`asset-tab-${i}`, 'aria-controls': `asset-tabpanel-${i}` }; }

export default function AssetRightPane() {
  const { scope, versions } = useContext(ScopeContext);
  const { data, isLoading } = useAssetEffective(scope);
  const { data: allVersions } = useFrameworkVersions();
  const vCode = new Map((allVersions || []).map(v => [v.id, v.code]));
  const [tab, setTab] = useState(0);
  const navigate = useNavigate()
  if (!scope) return null;

  const impacted = useMemo(() => {
    const blocks = data?.impacted_requirements || [];
    // only show currently selected versions
    return blocks.filter(b => (versions || []).includes(b.version_id))
                 .map(b => ({ ...b, code: vCode.get(b.version_id) || `v${b.version_id}` }));
  }, [data, versions, allVersions]);

  return (
    <Box sx={{ p: 0, height: '100%', display:'flex', flexDirection:'column' }}>
      <Box sx={{ px:2, pt:1 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {scope.type}:{scope.id}
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_,v)=> setTab(v)} variant="fullWidth">
        <Tab label="Effective Controls" {...a11yProps(0)} />
        <Tab label="Related Risks" {...a11yProps(1)} />
        <Tab label="Impact on Requirements" {...a11yProps(2)} />
      </Tabs>

      <Box role="tabpanel" id="asset-tabpanel-0" hidden={tab!==0} sx={{ p:2, flex:1, overflow:'auto', minHeight: 380 }}>
        {
          tab == 0 && (<EffectiveControlsGrid 
            rows={data?.effective_controls || []} 
            loading={false}
            onRowClick={(row) => navigate(`/controls?q=${encodeURIComponent(row.code || row.title || '')}`)}
            />)
        }
      </Box>

      <Box role="tabpanel" id="asset-tabpanel-1" hidden={tab!==1} sx={{ p:2, flex:1, overflow:'auto', minHeight: 380 }}>
        { tab == 1 && (
          <RiskTable rows={data?.related_risks || []} loading={false} />
        )}
      </Box>

      <Box role="tabpanel" id="asset-tabpanel-2" hidden={tab!==2} sx={{ p:2, flex:1, overflow:'auto', minHeight: 380 }}>
        { tab == 3 &&
          (impacted.length === 0
            ? <Typography variant="body2" color="text.secondary">No impacted requirements for selected version(s).</Typography>
            : impacted.map(block => (
                <Box key={block.version_id} sx={{ mb: 2, p:1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{block.code}</Typography>
                  <Stack spacing={0.75}>
                    {block.items.map(it => (
                      <Box key={it.requirement_id} sx={{ display:'flex', alignItems:'baseline', gap:1 }}>
                        <Typography variant="body2" sx={{ minWidth: 96 }}>{it.code}</Typography>
                        <Typography variant="body2" sx={{ flex: 1 }}>{it.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          contrib {Math.round((it.contribution || 0)*100)}%
                        </Typography>
                        {Array.isArray(it.via) && <Chip size="small" label={`via ${it.via.join(', ')}`} />}
                      </Box>
                    ))}
                  </Stack>
                </Box>
            )))}
      </Box>
    </Box>
  );
}
