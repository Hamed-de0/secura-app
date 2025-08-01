// src/features/riskScenarios/RiskScenarioTable.jsx
import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getGroupedRiskScenarios } from './api';
import { useNavigate } from 'react-router-dom';

const RiskScenarioTable = () => {
  const [groupedData, setGroupedData] = useState([]);
    const navigate = useNavigate();

  useEffect(() => {
    getGroupedRiskScenarios()
      .then(setGroupedData)
      .catch((err) => console.error('Error fetching grouped risk scenarios:', err));
  }, []);

  return (
    <Paper style={{ padding: 16 }}>
      <Typography variant="h5" gutterBottom>
        Risk Scenarios (Grouped by Category and Subcategory)
      </Typography>
        <Button
            variant="contained"
            onClick={() => navigate('/risk-scenarios/new')}
            style={{ marginBottom: '16px' }}
            >
            Add New Risk Scenario
        </Button>
      {groupedData.map((category) => (
        <Accordion key={category.category_id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              {category.category_name_en} / {category.category_name_de}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            {category.subcategories.map((sub) => (
              <Accordion key={sub.subcategory_id} style={{ marginBottom: 8 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{sub.subcategory_name_en} / {sub.subcategory_name_de}</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Asset</TableCell>
                        <TableCell>Threat</TableCell>
                        <TableCell>Vulnerability</TableCell>
                        <TableCell>Likelihood</TableCell>
                        <TableCell>Lifecycle</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sub.scenarios.map((s) => (
                        <TableRow key={s.id}>
                          
                          <TableCell>
                            <Link
                                component={RouterLink}
                                to={`/risk-scenarios/edit/${s.id}`}
                                underline="hover"
                                color="primary"
                            >
                                {s.title_en}
                            </Link>
                            </TableCell>
                          <TableCell>{s.asset_name || '–'}</TableCell>
                          <TableCell>{s.threat_name || '–'}</TableCell>
                          <TableCell>{s.vulnerability_name || '–'}</TableCell>
                          <TableCell>{s.likelihood}</TableCell>
                          <TableCell>{(s.lifecycle_states || []).join(', ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default RiskScenarioTable;
