import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, Grid,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllControls, getControlLinksByScenario, createOrUpdateControlLink, deleteControlLink, 
    getImpactDomains, saveControlEffectRatings , getControlEffectRatings} from './api';
import EditButton from '@mui/icons-material/Edit';


const ControlImpactTable = ({ scenarioId }) => {
  const [allControls, setAllControls] = useState([]);
  const [linkedControls, setLinkedControls] = useState([]);
  
  const [editMode, setEditMode] = useState(null); // null or 'add' or 'edit'
const [editingLink, setEditingLink] = useState(null); // object being edited or null
const [selectedCategory, setSelectedCategory] = useState('All');
const [impactDomains, setImpactDomains] = useState([]);
const [domainScores, setDomainScores] = useState({}); // domain_id => score
const [controlEffects, setControlEffects] = useState([]);

    useEffect(() => {
        getImpactDomains().then(setImpactDomains);
    }, []);
     
  useEffect(() => {
    getAllControls().then(setAllControls);
    fetchLinks();
  }, [scenarioId]);

  useEffect(() => {
  if (editMode === 'edit' && editingLink?.control_id && controlEffects.length) {
    const scoresForControl = controlEffects.filter(e => e.control_id === editingLink.control_id);
    const initial = {};
    for (const entry of scoresForControl) {
      initial[entry.domain_id] = entry.score;
    }
    setDomainScores(initial);
  }
}, [editMode, editingLink, controlEffects]);
    
    const fetchLinks = () => {
        getControlLinksByScenario(scenarioId).then(setLinkedControls);
        getControlEffectRatings(scenarioId).then(setControlEffects);
    };

  const filteredControls = allControls
        .filter(c => selectedCategory === 'All' || c.category === selectedCategory)
        .sort((a, b) => a.reference_code.localeCompare(b.reference_code));

  const handleEdit = (link) => {
  setEditMode('edit');
  setEditingLink(link);
};
const handleAdd = () => {
  setEditMode('add');
  setEditingLink({
    control_id: '', effect_type: '', status: '', residual_score: '', justification: ''
  });
};
  
  const handleSave = (link) => {
    const payload = { ...link, risk_scenario_id: scenarioId}
    createOrUpdateControlLink(payload).then(() => {
        
        const effectPayload = impactDomains.map(d => ({
            control_id: editingLink.control_id,
            risk_scenario_id: scenarioId,
            domain_id: d.id,
            score: domainScores[d.id] ?? 0,
        }));
        saveControlEffectRatings(effectPayload).then(() => {
            // console.log('Control effects saved!');
            fetchLinks(); // refresh links
        });  // new API call
        // console.log('Saved!');
        // fetchLinks(); 
        setEditMode(null); 
    }).catch(err => {
      console.error('Error saving control link:', err);
    });
  };

  const handleDelete = (linkId) => {
    deleteControlLink(linkId).then(() =>
      setLinkedControls(prev => prev.filter(link => link.id !== linkId))
    );
  };

  const getControlInfo = (id) => {
    return allControls.find(c => c.id === id) || {};
  };

  return (
    <>
    <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="h6" gutterBottom>Control Impact on Risk</Typography>
          <Button variant="contained" onClick={handleAdd}>Add</Button>

        </Box>
     

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ref#</TableCell>
              <TableCell>Control</TableCell>
              <TableCell>Affects</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Residual Score</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {linkedControls.map((link, idx) => {
              const control = getControlInfo(link.control_id);
              return (
                <TableRow key={link.id}>
                  <TableCell>{control.reference_code || '—'}</TableCell>
                  <TableCell>{control.title_en || '—'}</TableCell>
                  <TableCell>{link.effect_type || '—'}</TableCell>
                  <TableCell>{link.status || '—'}</TableCell>
                  <TableCell>{link.residual_score || '—'}</TableCell>
                  <TableCell>                  
                    <IconButton onClick={() => handleEdit(link)}><EditButton/></IconButton>
                    <IconButton onClick={() => handleDelete(link.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    <Dialog open={!!editMode} onClose={() => setEditMode(null)} maxWidth="sm" fullWidth>
    <DialogTitle>{editMode === 'add' ? 'Add Control Link' : 'Edit Control Link'}</DialogTitle>
    <DialogContent dividers>

        <TextField
        select fullWidth sx={{ mb: 2 }}
        label="Control" name="control_id"
        value={editingLink?.control_id || ''}
        onChange={(e) => setEditingLink({ ...editingLink, control_id: e.target.value })}
        disabled={editMode === 'edit'} // prevent changing linked control on edit
        >
        {allControls.map(c => (
            <MenuItem key={c.id} value={c.id}>
            {c.reference_code} – {c.title_en}
            </MenuItem>
        ))}
        </TextField>

        <TextField
        select fullWidth sx={{ mb: 2 }}
        label="Effect Type" name="effect_type"
        value={editingLink?.effect_type || ''}
        onChange={(e) => setEditingLink({ ...editingLink, effect_type: e.target.value })}
        >
        {['Likelihood', 'Impact', 'Both'].map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
        </TextField>

        <TextField
        select fullWidth sx={{ mb: 2 }}
        label="Status" name="status"
        value={editingLink?.status || ''}
        onChange={(e) => setEditingLink({ ...editingLink, status: e.target.value })}
        >
        {['Planned', 'Implemented', 'Partial'].map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
        </TextField>

        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Control Effect per Domain
            </Typography>
            <Grid container spacing={2} fullWidth sx={{ mb: 2 }}>
                {impactDomains.map(domain => (
                <Grid key={domain.id} item xs={6}>
                    <TextField
                    sx={{ minWidth: 160 }}
                    select fullWidth
                    label={domain.name}
                    value={domainScores[domain.id] ?? ''}
                    onChange={(e) =>
                        setDomainScores(prev => ({
                        ...prev,
                        [domain.id]: parseInt(e.target.value),
                        }))
                    }
                    >
                    {[0, 1, 2, 3, 4, 5].map(score => (
                        <MenuItem key={score} value={score}>{score}</MenuItem>
                    ))}
                    </TextField>
                </Grid>
                ))}
            </Grid>
            </Box>


        <TextField
        multiline fullWidth minRows={2}
        label="Justification"
        value={editingLink?.justification || ''}
        onChange={(e) => setEditingLink({ ...editingLink, justification: e.target.value })}
        />
    </DialogContent>

    <DialogActions>
        <Button onClick={() => setEditMode(null)}>Cancel</Button>
        <Button
        variant="contained"
        onClick={() => {
            handleSave(editingLink);
            
            setEditMode(null);
            setEditingLink(null);
        }}
        >
        Save
        </Button>
    </DialogActions>
    </Dialog>
    </>
  );
};

export default ControlImpactTable;
