import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllControls, getControlLinksByScenario, createOrUpdateControlLink, deleteControlLink } from './api';
import EditButton from '@mui/icons-material/Edit';

const statusOptions = ['Implemented', 'Planned', 'Not Applicable'];
const effectOptions = ['Likelihood', 'Impact', 'Both'];

const ControlImpactTable = ({ scenarioId }) => {
  const [allControls, setAllControls] = useState([]);
  const [linkedControls, setLinkedControls] = useState([]);
  const [newControlId, setNewControlId] = useState('');

  const [editMode, setEditMode] = useState(null); // null or 'add' or 'edit'
const [editingLink, setEditingLink] = useState(null); // object being edited or null
const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    getAllControls().then(setAllControls);
    fetchLinks();
  }, [scenarioId]);

  const fetchLinks = () => {
    getControlLinksByScenario(scenarioId).then(setLinkedControls);
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
        console.log('Saved!');
        fetchLinks(); 
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
      <Typography variant="h6" gutterBottom>Control Impact on Risk</Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Filter by Control Category</Typography>
        <Button variant="contained" onClick={handleAdd}>Add</Button>
        <TextField
            select
            fullWidth
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
        >
            <MenuItem value="All">All</MenuItem>
            {[...new Set(allControls.map(c => c.category))].sort().map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
        </TextField>

        <Select
          value={newControlId}
          onChange={(e) => setNewControlId(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>Select Control</MenuItem>
          {filteredControls.map(c => (
            <MenuItem key={c.id} value={c.id}>
              {c.reference_code} {c.title_en}
            </MenuItem>
          ))}
        </Select>
        
    </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        
        
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

    <TextField
      fullWidth type="number" sx={{ mb: 2 }}
      label="Residual Score"
      value={editingLink?.residual_score || ''}
      onChange={(e) => setEditingLink({ ...editingLink, residual_score: parseInt(e.target.value) })}
      inputProps={{ min: 0, max: 10 }}
    />

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
