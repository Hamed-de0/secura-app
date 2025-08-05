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
import configs from '../../configs';
import GroupSelectModal from '../assetGroups/GroupSelectModal';
import JsonDetailsEditor from '../../../components/JsonDetailsEditor';
import { useNavigate } from 'react-router-dom'; 
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';


const AssetForm = ({ assetId, onSuccess, parentAssetId, groupId }) => {
  const [types, setTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [parentAsset, setParentAsset] = useState(null);
  const [loading, setLoading] = useState(!!assetId);
  const navigate = useNavigate();
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [form, setForm] = useState({
    uuid: uuidv4(),
    name: '',
    type_id: '',
    group_id: '',
    description: '',
    parent_id: '',
    location: '',
    details: {}
  });

  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const fetchAsset = async () => {
    if (!assetId) return;
    try {
      const res = await axios.get(`${configs.API_BASE_URL}/assets/${assetId}`);
      const asset = res.data;

      setForm({
        uuid: asset.uuid || '',
        name: asset.name || '',
        type_id: asset.type_id || '',
        group_id: asset.group_id || '',
        description: asset.description || '',
        location: asset.location || '',
        details: asset.details || {},
      });
    } catch (err) {
      console.error('Failed to fetch asset', err);
    } finally {
      setLoading(false);
    }
  };

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
  fetchAsset();
}, [assetId, parentAsset, groupId]);


  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let assetRes;
      if (assetId) {
        assetRes = await axios.put(`${configs.API_BASE_URL}/assets/${assetId}`, form);
      } else {
        assetRes = await axios.post(`${configs.API_BASE_URL}/assets/`, form);
      }

      const newAsset = assetRes.data;
      

      if (parentAssetId) {
        await axios.post(`${configs.API_BASE_URL}/asset_relations/`, {
          asset_id: parentAssetId,         // the parent
          related_asset_id: newAsset.id,   // the child we just created
          relation_type: 'parent',
          description: 'Auto-linked on creation'
        });
      }

      onSuccess?.();
      setSuccessModalOpen(true);

    } catch (err) {
      console.error("Error creating asset", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

        <Button
          variant="outlined"
          onClick={() => setGroupModalOpen(true)}
          sx={{ height: '56px', minWidth: '40px', mt: '16px' }}
        >
          🌳
        </Button>
      </Box>



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
            label="Location"
            name='location'
            value={form.location}
            fullWidth
            margin="normal"
        onChange={handleChange}
      />
      <JsonDetailsEditor
        value={form.details}
        onChange={(newDetails) => setForm(prev => ({ ...prev, details: newDetails }))}
      />
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
      <Button onClick={()=>{ navigate("/assetgroups/tree")}} sx={{ mt: 2, mr: 1 }}>
        To List
      </Button>
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Submit
      </Button>

      <GroupSelectModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        groups={groups}
        onSelect={(selected) => {
          setForm(prev => ({ ...prev, group_id: selected.id }));
          setGroupModalOpen(false);
        }}
      />

      <Dialog open={successModalOpen} onClose={() => setSuccessModalOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>Asset saved successfully!</DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessModalOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AssetForm;
