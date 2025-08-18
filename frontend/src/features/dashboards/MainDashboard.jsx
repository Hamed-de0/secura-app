import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Paper, Avatar, Skeleton
} from '@mui/material';
import { Pie, Line } from 'react-chartjs-2';
import DevicesIcon from '@mui/icons-material/Devices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GppGoodIcon from '@mui/icons-material/GppGood';
import 'chart.js/auto';

import { ScopeContext } from '../../store/scope/ScopeProvider.jsx';
import { useCoverageSummary, useCoverageVersion } from '../../features/coverage/hooks';
import { useEffectiveControls } from '../../features/controls/hooks';

import { useFrameworkVersions } from '../../lib/mock/useRbac';
import CoverageCard from './components/CoverageCard.jsx';
import WeakestRequirementsTable from './components/WeakestRequirementsTable.jsx';
import ProviderSummary from './components/ProviderSummary.jsx';

import { getSummary } from './api';



const MainDashboard = () => {
  const navigate = useNavigate();

  const { scope, versions } = useContext(ScopeContext);
  const firstVersion = versions?.[0];
  const { data: summary, isLoading: loadingSummary } = useCoverageSummary(scope, versions);
  const { data: vDetail, isLoading: loadingDetail } = useCoverageVersion(firstVersion, scope);
  const { data: controls, isLoading: loadingControls } = useEffectiveControls(scope);
  const { data: allVersions } = useFrameworkVersions();

  const codeById = new Map((allVersions || []).map(v => [v.id, v.code]));


  
  useEffect(() => {
    console.log('[DASH] scope', scope, 'versions', versions);
  }, [scope, versions]);

  useEffect(() => {
    console.log('[DASH] coverage summary', summary);
  }, [summary]);

  useEffect(() => {
    console.log('[DASH] effective controls', controls);
  }, [controls]);

  useEffect(() => {
    console.log('[DASH] version detail', firstVersion, vDetail);
  }, [firstVersion, vDetail]);

  

  const dashboardCards = summary ? [
    {
      title: 'Assets',
      value: summary ? summary.assets : 0,
      icon: <DevicesIcon />,
      color: '#1976d2',
      description: 'Tracked information assets'
    },
    {
      title: 'Threats',
      value: summary ? summary.threats : 0,
      icon: <WarningAmberIcon />,
      color: '#d32f2f',
      description: 'Identified potential threats'
    },
    {
      title: 'Risks',
      value: summary ? summary.risks : 0,
      icon: <SecurityIcon />,
      color: '#f57c00',
      description: 'Total risk scenarios'
    },
    {
      title: 'Controls',
      value: summary ? summary.controls : 0,
      icon: <VerifiedUserIcon />,
      color: '#388e3c',
      description: 'Available security controls'
    }
  ] : [];



  

    

 
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        ISMS Dashboard 1q
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Overview of your information security program
      </Typography>
      <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* Coverage summary cards */}
        {(loadingSummary ? Array.from({ length: (versions?.length || 2) }) : summary || []).map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={item?.version_id || idx}>
            {loadingSummary ? (
              <Skeleton variant="rounded" height={140} />
            ) : (
              <CoverageCard
                code={codeById.get(item.version_id) || `Version ${item.version_id}`}
                score={item.score}
                onClick={() => navigate(`/compliance/versions/${item.version_id}`)}
              />
            )}
          </Grid>
        ))}

        {/* Weakest requirements (first selected version) */}
        <Grid item xs={12} md={8}>
          {loadingDetail ? (
            <Skeleton variant="rounded" height={420} />
          ) : (
            <WeakestRequirementsTable versionDetail={vDetail} loading={loadingDetail} />
          )}
        </Grid>

        {/* Provider summary */}
        <Grid item xs={12} md={4}>
          {loadingControls ? (
            <Skeleton variant="rounded" height={180} />
          ) : (
            <ProviderSummary controls={controls} />
          )}
        </Grid>
      </Grid>
    </Box>
      <Grid container spacing={4}>
        {dashboardCards.map((card, index) => (
          <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: card.color, mr: 2 }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">{card.title}</Typography>
                <Typography variant="h6" sx={{ color: card.color }}>{card.value}</Typography>
                <Typography variant="body2" color="text.secondary">{card.description}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Security Posture
        </Typography>
        <GppGoodIcon sx={{ fontSize: 50, color: '#388e3c' }} />
        <Typography variant="body1" color="text.secondary">
          Your current security posture is strong.
        </Typography>
      </Box>
    </Box>
  );
};

export default MainDashboard;
