// RiskScenarioForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Tabs, Tab, Box, TextField, Typography, Button,
  MenuItem, Grid
} from '@mui/material';
import { getAssets, 
    getAssetGroups,
    getAssetTypes,
    getTags,
    getCategoriesWithSubcategories,
    getThreats,
    getVulnerabilities,
    getLifecycleEventTypes,
    createRiskScenario    
} from './api';

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}



const RiskScenarioForm = () => {
    const [tab, setTab] = useState(0);
    const [formData, setFormData] = useState({
        title_en: '',
        title_de: '',
        description_en: '',
        description_de: '',
        likelihood: 1,
        asset_id: null,
        asset_group_id: null,
        asset_type_id: null,
        tag_ids: [],
        lifecycle_states: [],
    });



    const [assets, setAssets] = useState([]);
    const [groups, setGroups] = useState([]);
    const [types, setTypes] = useState([]);
    const [tags, setTags] = useState([]);   
    const [lifecycleEventTypes, setLifecycleEventTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [threats, setThreats] = useState([]);
    const [vulnerabilities, setVulnerabilities] = useState([]);
    
    useEffect(() => {
        Promise.all([
            getAssets(),
            getAssetGroups(),
            getAssetTypes(),
            getTags(),
            getCategoriesWithSubcategories(),
            getThreats(),
            getVulnerabilities(),
            getLifecycleEventTypes(),
        ]).then(([assets, groups, types, tags, categories, threats, vulnerabilities, lifecycleEventTypes]) => {
            setAssets(assets);
            setGroups(groups);
            setTypes(types);
            setTags(tags);
            setCategories(categories);
            setThreats(threats);
            setVulnerabilities(vulnerabilities);
            setLifecycleEventTypes(lifecycleEventTypes)
        }).catch(console.error);
    }, []);

    

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
        // {
//   "title_en": "string",
//   "title_de": "string",
//   "description_en": "string",
//   "description_de": "string",
//   "likelihood": 0,
//   "threat_id": 0,
//   "vulnerability_id": 0,
//   "asset_id": 0,
//   "asset_group_id": 0,
//   "tag_ids": [
//     0
//   ],
//   "lifecycle_states": [
//     "string"
//   ],
//   "subcategory_id": 0
// }
    const payload = {
      title_de: formData.title_de,
      title_en: formData.title_en,
        description_de: formData.description_de,
        description_en: formData.description_en,
        likelihood: formData.likelihood,
        threat_id: formData.threat_id,
        vulnerability_id: formData.vulnerability_id,
        asset_id: formData.asset_id,
        asset_group_id: formData.asset_group_id,
        tag_ids: formData.tag_ids,
        lifecycle_states: formData.lifecycle_states,
        subcategory_id: formData.subcategory_id,
    }

    console.log('Submitting:', payload);
    // TODO: Call API here
    createRiskScenario(formData)
      .then(() => {
        console.log('Risk Scenario created successfully!');
        // Optionally, redirect or reset form
      })
      .catch(err => {
        console.error('Error creating risk scenario:', err);
        
      });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 3, display: 'block' }}>
      <Typography variant="h5" gutterBottom>New Risk Scenario</Typography>
      <style>{`
        .MuiGrid-container {
            display: flex !important;
            flex-direction: column !important;
        }
    `}</style>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Scenario Info" />
        <Tab label="Scope" />
        <Tab label="Threat & Vulnerability" />
        <Tab label="Extras" />
      </Tabs>

      {/* Tab 1 – Scenario Info */}
    <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <Typography variant="subtitle2">Title (English)</Typography>
            <TextField fullWidth name="title_en" value={formData.title_en} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
            <Typography variant="subtitle2">Title (German)</Typography>
            <TextField fullWidth name="title_de" value={formData.title_de} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
            <Typography variant="subtitle2">Description (English)</Typography>
            <TextField fullWidth multiline minRows={2} name="description_en" value={formData.description_en} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
            <Typography variant="subtitle2">Description (German)</Typography>
            <TextField fullWidth multiline minRows={2} name="description_de" value={formData.description_de} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
            <Typography variant="subtitle2">Likelihood (1–5)</Typography>
            <TextField
                select fullWidth name="likelihood" value={formData.likelihood} onChange={handleChange}
            >
                {[1, 2, 3, 4, 5].map((lvl) => (
                <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>
                ))}
            </TextField>
            </Grid>
        </Grid>
    </TabPanel>


      
    <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Asset</Typography>
            <TextField
                select
                fullWidth
                name="asset_id"
                value={formData.asset_id}
                onChange={handleChange}
            >
                {assets.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                ))}
            </TextField>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Asset Group</Typography>
            <TextField
                select
                fullWidth
                name="asset_group_id"
                value={formData.asset_group_id}
                onChange={handleChange}
            >
                {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                ))}
            </TextField>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Asset Type</Typography>
            <TextField
                select
                fullWidth
                name="asset_type_id"
                value={formData.asset_type_id}
                onChange={handleChange}
            >
                {types.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
            </TextField>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Lifecycle States</Typography>
            <TextField
                select
                fullWidth
                name="lifecycle_states"
                value={formData.lifecycle_states}
                onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, lifecycle_states: typeof value === 'string' ? value.split(',') : value }));
                }}
                SelectProps={{ multiple: true }}
            >
                {lifecycleEventTypes.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </TextField>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Tags</Typography>
            <TextField
                select
                fullWidth
                name="tag_ids"
                value={formData.tag_ids}
                onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, tag_ids: typeof value === 'string' ? value.split(',') : value }));
                }}
                SelectProps={{ multiple: true }}
            >
                {tags.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
            </TextField>
            </Grid>
        </Grid>
    </TabPanel>

    <TabPanel value={tab} index={2}>
        <Grid container spacing={3}>
            <Grid item xs={12}>
            <Typography variant="subtitle2">Category</Typography>
            <TextField
                select fullWidth name="category_id"
                value={formData.category_id}
                onChange={(e) => {
                setFormData(prev => ({
                    ...prev,
                    category_id: e.target.value,
                    subcategory_id: '', // Reset subcategory when category changes
                }));
                }}
            >
                {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name_en}</MenuItem>
                ))}
            </TextField>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="subtitle2">Subcategory</Typography>
            <TextField
                select fullWidth name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleChange}
                disabled={!formData.category_id}
            >
                {(categories.find(c => c.id === Number(formData.category_id))?.subcategories || []).map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>{sub.name_en}</MenuItem>
                ))}
            </TextField>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="subtitle2">Threat</Typography>
            <TextField
                select fullWidth name="threat_id"
                value={formData.threat_id}
                onChange={handleChange}
            >
                {threats.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
            </TextField>
            </Grid>

            <Grid item xs={12}>
            <Typography variant="subtitle2">Vulnerability</Typography>
            <TextField
                select fullWidth name="vulnerability_id"
                value={formData.vulnerability_id}
                onChange={handleChange}
            >
                {vulnerabilities.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                ))}
            </TextField>
            </Grid>
        </Grid>
    </TabPanel>

      
      <TabPanel value={tab} index={3}>
        <Typography>Extras tab coming next...</Typography>
      </TabPanel>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={handleSubmit}>Save Risk Scenario</Button>
      </Box>
    </Box>
  );
};

export default RiskScenarioForm;
