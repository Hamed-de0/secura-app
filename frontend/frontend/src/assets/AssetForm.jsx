import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import configs from '../configs';

const AssetForm = ({ onSuccess, parentAssetId, groupId }) => {
  const [types, setTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [parentAsset, setParentAsset] = useState(null);

  const [form, setForm] = useState({
    uuid: uuidv4(),
    name: '',
    type_id: '',
    group_id: '',
    description: '',
    parent_id: ''
  });

  useEffect(() => {
    if (parentAssetId) {
      axios.get(`${configs.API_BASE_URL}/assets/${parentAssetId}`)
        .then(res => setParentAsset(res.data))
        .catch(err => console.error("Failed to fetch parent asset", err));
    }
  }, [parentAssetId]);

  useEffect(() => {
  const fetchDropdowns = async () => {
    try {
      const [typeRes, groupRes] = await Promise.all([
        axios.get(`${configs.API_BASE_URL}/asset-types`),
        axios.get(`${configs.API_BASE_URL}/asset-groups`)
      ]);

      const types = typeRes.data || [];
      const groups = groupRes.data || [];

      setTypes(types);
      setGroups(groups);

      // Determine the correct group_id
      let resolvedGroupId = '';
      if (parentAsset?.group_id) {
        resolvedGroupId = parentAsset.group_id;
      } else if (groupId) {
        resolvedGroupId = Number(groupId);
      } else if (groups.length) {
        resolvedGroupId = groups[0].id;
      }

      setForm(prev => ({
        ...prev,
        type_id: types[0]?.id || '',
        group_id: resolvedGroupId
      }));
    } catch (error) {
      console.error("Error loading dropdown data", error);
    }
  };

  fetchDropdowns();
}, [parentAsset, groupId]);


  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   axios.post(`${configs.API_BASE_URL}/assets`, form)
  //     .then(() => {
  //       //alert('Asset created!');
  //       console.log('asset created', form)
  //       onSuccess?.();
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       alert('Error creating asset');
  //     });
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const assetRes = await axios.post(`${configs.API_BASE_URL}/assets/`, form);

      const newAsset = assetRes.data;

      // Optional: Show toast, reset form
      onSuccess?.();

      // If parentAssetId exists → link them
      if (parentAssetId) {
        await axios.post(`${configs.API_BASE_URL}/asset_relations/`, {
          asset_id: parentAssetId,         // the parent
          related_asset_id: newAsset.id,   // the child we just created
          relation_type: 'parent',
          description: 'Auto-linked on creation'
        });
      }

    } catch (err) {
      console.error("Error creating asset", err);
    }
  };


  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>Create Asset</Typography>

      <TextField
        label="Name *"
        name="name"
        fullWidth
        margin="normal"
        required
        value={form.name}
        onChange={handleChange}
      />

      <TextField
        label="Asset Type *"
        name="type_id"
        select
        fullWidth
        margin="normal"
        required
        value={form.type_id}
        onChange={handleChange}
      >
        {types.map(type => (
          <MenuItem key={type.id} value={type.id}>
            {type.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Asset Group *"
        name="group_id"
        select
        fullWidth
        margin="normal"
        required
        value={form.group_id}
        onChange={handleChange}
      >
        {groups.map(group => (
          <MenuItem key={group.id} value={group.id}>
            {group.name}
          </MenuItem>
        ))}
      </TextField>
        {parentAsset && (
          <TextField
            label="Parent Asset"
            value={parentAsset.name}
            fullWidth
            disabled
            margin="normal"
          />
        )}
      <TextField
        label="Description"
        name="description"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={form.description}
        onChange={handleChange}
      />

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

export default AssetForm;
