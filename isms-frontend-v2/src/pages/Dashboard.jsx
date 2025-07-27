import { Typography, Box, Button } from '@mui/material'

const Dashboard = () => (
    <Box sx={{  margin: '2rem auto' }}>
        <Typography variant="h4" gutterBottom>
            Welcome to the ISMS Dashboard
        </Typography>
        <Typography variant="body1" paragraph>
            This is your central hub to manage assets, threats, risks, controls, and compliance.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mb: 3 }}>
            Go to Asset Inventory
        </Button>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 2 }}>
            <Box sx={{ flex: 1, minWidth: 220, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="h6">Assets</Typography>
                <Typography variant="body2">Track and manage your information assets.</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 220, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="h6">Threats</Typography>
                <Typography variant="body2">Identify and assess potential threats to your assets.</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 220, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="h6">Risks</Typography>
                <Typography variant="body2">Evaluate and prioritize risks for mitigation.</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 220, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="h6">Controls</Typography>
                <Typography variant="body2">Implement controls to reduce risks and improve security.</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 220, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                <Typography variant="h6">Compliance</Typography>
                <Typography variant="body2">Monitor compliance with standards and regulations.</Typography>
            </Box>
        </Box>
    </Box>
)

export default Dashboard
