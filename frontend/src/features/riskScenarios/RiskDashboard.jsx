import { Box, Container, Grid, Paper, Typography, Button, TextField, Select, MenuItem, Avatar } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';

import { Pie, Line } from 'react-chartjs-2';
import { DataGrid } from '@mui/x-data-grid';
import DevicesIcon from '@mui/icons-material/Devices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GppGoodIcon from '@mui/icons-material/GppGood';

import RiskHeatmap from './RiskHeatmap';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);
const riskData = [
  { id: '1.1.1', name: 'Unpatched Software Vulnerability', category: 'Technical', severity: 'High', likelihood: 'Medium', status: 'Mitigated' },
  { id: '2.3.5', name: 'Data Breach', category: 'Organizational', severity: 'Medium', likelihood: 'High', status: 'Open' },
  { id: '3.2.7', name: 'Loss of Key Personnel', category: 'Environmental', severity: 'Low', likelihood: 'Medium', status: 'Mitigated' },
  { id: '1.2.4', name: 'Insider Threat', category: 'Organizational', severity: 'High', likelihood: 'Medium', status: 'Planned' },
  { id: '2.1.7', name: 'Configuration Errors', category: 'Technical', severity: 'Medium', likelihood: 'Low', status: 'Partial' },
];

const riskLevelData = {
  labels: ['High', 'Medium', 'Low'],
  datasets: [{
    data: [1, 2, 2],
    backgroundColor: ['#f44336', '#ffca28', '#4caf50'],
  }]
};


  const trendLineData = {
    labels: ['Aug', 'Sep', 'Feb', 'Apr', 'Jun', 'Jan'],
    datasets: [
      {
        label: 'Mitigated',
        data: [5, 10, 20, 30, 40, 50],
        fill: false,
        borderColor: '#e91e63',
        tension: 0.4,
      },
      {
        label: 'Open',
        data: [40, 45, 30, 28, 20, 15],
        fill: false,
        borderColor: '#2196f3',
        tension: 0.4,
      },
    ],
  };


const dashboardCards = [
  {
    title: 'Total Risks',
    value: 42,
    icon: <SecurityIcon />,
    color: '#f57c00',
    description: 'Tracked information assets'
  },
  {
    title: 'Open Risks',
    value: 21,
    icon: <WarningAmberIcon />,
    color: '#d32f2f',
    description: 'Identified potential threats'
  },
  {
    title: 'Applied Controls',
    value: 93,
    icon: <VerifiedUserIcon />,
    color: '#388e3c',
    description: 'Available security controls'
  }
];




const RiskDashboard = () => {
  return (
    <Container maxWidth="xl">
    <Box>
        <Box mb={2} sx={{ backgroundColor: 'white', p: 2, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={9} size={9}>
                    <Box sx={{ backgroundColor: 'whitesmoke', p: 2, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h4">ISMS Risk Dashboard</Typography>
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
                    </Box>

                    <Box mt={2} sx={{ backgroundColor: 'whitesmoke', p: 2, borderRadius: 2, height: '100%' }}>
                    {/* Right Chart */}
                        <Grid item xs={12} md={8} size={12}>
                            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6">Mitigation Trend</Typography>
                            <Box sx={{ height: 480 }}> {/* Optional: control fixed chart height */}
                                <Line data={trendLineData} options={{ maintainAspectRatio: false }} />
                            </Box>
                            <Box textAlign="right" mt={1}>
                                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>View All</Typography>
                            </Box>
                            </Paper>
                        </Grid>
                    </Box>
                    
                </Grid>
                <Grid item xs={12} md={3} size={3}>
                    <Box
                    sx={{
                            backgroundColor: 'whitesmoke',
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            // alignItems: 'flex-start',    // this affects internal content
                            height: '100%',
                        }}
                    >
                        <Grid item xs={12} md={3}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6">Risk Distribution</Typography>
                                <Pie data={riskLevelData} />
                            </Paper>
                        </Grid>
                    </Box>

                    <Box mt={1} sx={{ backgroundColor: 'whitesmoke', p: 2, borderRadius: 2, height: '100%' }}>
                        <RiskHeatmap />

                    </Box>
                </Grid>
            </Grid>
        </Box>
      <Box mt={4} sx={{ backgroundColor: 'lightgray', p: 2, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h5" mb={2}>Risk Overview</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={12} size={12}>
                            <Paper elevation={3} sx={{ p: 2 }}>
                                <TextField label="Search" size="small" sx={{ mr: 2 }} />
                                <Select size="small" defaultValue="all" sx={{ mr: 2 }}>
                                <MenuItem value="all">All statuses</MenuItem>
                                <MenuItem value="open">Open</MenuItem>
                                <MenuItem value="mitigated">Mitigated</MenuItem>
                                </Select>
                                <Button variant="contained">+ Add Risk</Button>

                                <Box mt={2}>
                                <DataGrid
                                    autoHeight
                                    rows={riskData}
                                    columns={[
                                    { field: 'id', headerName: 'ID', width: 100 },
                                    { field: 'name', headerName: 'Name', flex: 1 },
                                    { field: 'category', headerName: 'Category', width: 140 },
                                    { field: 'severity', headerName: 'Severity', width: 120 },
                                    { field: 'likelihood', headerName: 'Likelihood', width: 120 },
                                    { field: 'status', headerName: 'Status', width: 120 },
                                    ]}
                                    hideFooter
                                />
                                </Box>
                            </Paper>
                            </Grid>

                            
                        </Grid>
                        </Box>
    </Box>
    </Container>
  );
};

export default RiskDashboard;
