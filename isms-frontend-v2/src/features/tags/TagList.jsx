import { useEffect, useState } from 'react';
import { fetchTags, deleteTag } from './tagApi';
import {
  Box, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import TagForm from './TagForm';

export default function TagList() {
  const [tags, setTags] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  const loadTags = async () => {
    const res = await fetchTags();
    setTags(res.data);
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleDelete = async (id) => {
    await deleteTag(id);
    loadTags();
  };

  return (
    <Box p={3}>
      <Typography variant="h5">Tag Management</Typography>
      <Button variant="contained" onClick={() => setOpenForm(true)} sx={{ my: 2 }}>
        Add Tag
      </Button>

      {tags.map((tag) => (
        <Box key={tag.id} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography>{tag.name}</Typography>
          <Box>
            <IconButton onClick={() => { setEditingTag(tag); setOpenForm(true); }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(tag.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}

      <TagForm
        open={openForm}
        onClose={() => { setOpenForm(false); setEditingTag(null); }}
        tag={editingTag}
        onSuccess={loadTags}
      />
    </Box>
  );
}
