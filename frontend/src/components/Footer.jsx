import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles';

const Footer = () => {
    const theme = useTheme();
    return (        
            <Box sx={{ height: 48, textAlign: 'center', padding: '0.5rem', 
            backgroundColor: theme.palette.background.paper, 
            borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption">© 2025 H&H Communication Lab GmbH – All rights reserved.</Typography>
        </Box>
        );
}

export default Footer
