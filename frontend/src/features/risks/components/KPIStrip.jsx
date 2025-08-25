import React from 'react';
import { Box, Card, CardContent, Stack, Typography, Chip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';              // Risk Exposure
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'; // Appetite Breaches
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'; // Ownership & Action
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';   // Assurance Health
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';   // Improvement Trend


/* ================================
   KPI card
   ================================ */
  function MiniSpark({ data = [6,7,6,8,9,8,10], width = 120, height = 36 }) {
    const max = Math.max(...data, 1), min = Math.min(...data);
    const pad = 4;
    const pts = data.map((v, i) => {
      const x = pad + (i * (width - 2 * pad)) / (data.length - 1 || 1);
      const y = pad + (height - 2 * pad) * (1 - (v - min) / Math.max(1, max - min));
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={width} height={height} aria-label="spark">
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    );
  }

  function MetricTile({ title, color, icon: Icon, main, sub = [], spark, accent }) {
    // sub: [{ label: 'High/Critical', value: '7' }, ...]
    return (
      <Card
        sx={{
          borderRadius: 3,
          height: '100%',
          background: theme => `linear-gradient(135deg, ${
            alpha(color || theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12)
          } 0%, ${
            alpha(color || theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.36 : 0.22)
          } 100%)`,
          border: theme => `1px solid ${alpha(color || theme.palette.primary.main, 0.35)}`,
          boxShadow: '0 10px 24px rgba(0,0,0,.18)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
            <Box>
              <Typography variant="overline" sx={{ color: color, letterSpacing: 0.6 }}>
                {title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="baseline">
                <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>{main}</Typography>
                {accent && (
                  <Chip
                    size="small"
                    label={accent}
                    sx={{
                      bgcolor: theme => alpha(color || theme.palette.primary.main, 0.22),
                      color,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            </Box>
            {Icon && (
              <Box sx={{
                bgcolor: theme => alpha(color || theme.palette.primary.main, 0.22),
                color,
                p: 1,
                borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon sx={{ fontSize: 28 }} />
              </Box>
            )}
          </Stack>

          {sub?.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: spark ? 1 : 0 }}>
              {sub.map((s, i) => (
                <Chip key={i} size="small" label={`${s.label}: ${s.value}`}
                      sx={{ bgcolor: 'action.hover' }} />
              ))}
            </Stack>
          )}

          {spark && (
            <Box sx={{ color, mt: .5 }}>
              <MiniSpark data={spark} />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

const KPIStrip = ({data}) => {
  const theme = useTheme();
  // console.log('metrics',data);
  return (
    <Box
          sx={{
            p: 1,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' },
            //backgroundColor: 'lightblue'
          }}
        >
          {/* 1) Risk Exposure */}
          <MetricTile
            title="Risk Exposure"
            color={theme.palette.primary.main}
            icon={ShieldOutlinedIcon}
            main={data?.exposure?.total || 0}
            sub={[
              { label: 'High/Critical', value: data?.exposure?.highCritical || 0 },
              { label: 'Avg Residual', value: data?.exposure?.avgResidual || 0 },
            ]}
            //spark={[42, 44, 43, 47, 49, 48, 50, 51]}
          />

          {/* 2) Appetite Breaches */}
          <MetricTile
            title="Appetite Breaches"
            color={theme.palette.error.main}
            icon={ReportProblemOutlinedIcon}
            main={data?.appetite?.count}
            accent={`${data?.appetite?.percent}% of total`}
            sub={[
              { label: 'Exceptions (30d)', value: data?.appetite?.exceptions30 },
            ]}
          />

          {/* 3) Ownership & Action */}
          <MetricTile
            title="Ownership & Action"
            color={theme.palette.info.main}
            icon={PersonOutlineOutlinedIcon}
            main={data?.ownership?.withOwnerPct}
            sub={[
              { label: 'With Owner', value: data?.ownership?.withOwnerPct },
              { label: 'Mitigations', value: data?.ownership?.mitigations },
            ]}
          />

          {/* 4) Assurance Health */}
          <MetricTile
            title="Assurance Health"
            color={theme.palette.success.main}
            icon={VerifiedUserOutlinedIcon}
            main={data?.assurance?.evidencePct}
            sub={[
              
              { label: 'Review SLA', value: data?.assurance?.reviewPct },
            ]}
          />

          {/* 5) Improvement Trend */}
          <MetricTile
            title="Improvement Trend"
            color={theme.palette.warning.main}
            icon={TrendingDownOutlinedIcon}
            main={data?.improvement?.delta}
            accent={`${data?.improvement?.days} days`}
            //spark={[54, 53, 52, 50, 49, 47, 46, 45]}
            sub={[
              { label: 'Residual Δ', value: data?.improvement?.delta },
            ]}
          />
        </Box>
  );
};

export default KPIStrip;