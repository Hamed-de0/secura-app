import React from 'react';
import { Box, Typography } from '@mui/material';

const heatmapData = [
  [1, 2, 3, 4, 5],
  [2, 4, 6, 8, 10],
  [3, 6, 9, 12, 15],
  [4, 8, 12, 16, 20],
  [5, 10, 15, 20, 25],
];

const getColor = (value) => {
  if (value >= 15) return '#f44336'; // red
  if (value >= 6) return '#ffeb3b';  // yellow
  return '#4caf50';                 // green
};

const RiskHeatmap = () => (
  <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto', mt: 1 }}>
    <Typography variant="h6" mb={1}>
      Risk Heatmap
    </Typography>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(5, 1fr)',
        gridTemplateRows: '60px repeat(6, 1fr)',
        gap: 0.1,
        width: '100%',
      }}
    >
      {/* Top Row: Impact Labels */}
      <Box />
      {[1, 2, 3, 4, 5].map((col) => (
        <Box key={`impact-${col}`} sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {col}
        </Box>
      ))}

      {/* Rows with Likelihood + Heatmap Cells */}
      {heatmapData.map((row, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          <Box sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            {rowIndex + 1}
          </Box>
          {row.map((value, colIndex) => (
            <Box
              key={`cell-${rowIndex}-${colIndex}`}
              sx={{
                backgroundColor: getColor(value),
                height: 50,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: 'black',
              }}
            >
              {value}
            </Box>
          ))}
        </React.Fragment>
      ))}
    </Box>
  </Box>
);

export default RiskHeatmap;
