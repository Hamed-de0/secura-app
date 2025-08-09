// AssetTypeDetailsTabs.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
// import { getThreatsByAssetType, getControlsByAssetType, getVulnerabilitiesByAssetType } from './api'; // Adjust the import path as necessary
import ThreatsList from '../../threats/ThreatsList';
import { getThreatsByAssetType,  } from '../../threats/api';
import { getVulnsByAssetType, addVulnLink } from '../../vulnerabilities/api';
import VulnerabilitiesList from '../../vulnerabilities/VulnerabilitiesList';
import VulnerabilityModal from '../../vulnerabilities/VulnerabilityModal';

export default function AssetTypeDetailsTabs({ assetType }) {
    const [tab, setTab] = useState(0);
    const [threats, setThreats] = useState([]);
    const [vulns, setVulns] = useState([]);
    const [controls, setControls] = useState([]);
    const [vulnModalOpen, setVulnModalOpen] = useState(false);


  useEffect(() => {
    if (!assetType) return;
    loadAll();
    
    // getControlsByAssetType(assetType.id).then(setControls);
    // getVulnerabilitiesByAssetType(assetType.id).then(setVulns);
    
  }, [assetType]);

    const handleOpenAddVuln = () => setVulnModalOpen(true);


    // Function to handle vulnerability selection
    const loadAll = async () => {
        if (!assetType) return;
        console.log('Loading threats and vulnerabilities for asset type:', assetType);
        const [t, v, c] = await Promise.all([
            getThreatsByAssetType(assetType.id).catch(() => []),
            getVulnsByAssetType(assetType.id).catch(() => []),
            
        ]);
        console.log('Threats:', t, 'Vulnerabilities:', v, 'Controls:', c);
        setThreats(t);
        setVulns(v); 
        setControls(c);
    };

    const linkedVulnIds = useMemo(
        () => new Set((vulns || []).map(v => v.vulnerability_id ?? v.id)), 
        [vulns]
    );

    const handleSelectVuln = async (vuln) => {
        try {
            const payload = {
            asset_type_id: assetType.id,
            vulnerability_id: vuln.id,
            score: 1, // manuall add
            justification: 'Manually added by User', // optional: justification if you support it now
            // optional: score/justification if you support it now
            }
            console.log('Selected Vulnerability2:', payload);
            await addVulnLink(payload).then((res) => {
            console.log('Vulnerability link added successfully', res);    ;
            }).catch((error) => {
                console.error('Error adding vulnerability link:', error);
            });
            // setVulnModalOpen(false); // close modal
            // refresh(); // your custom logic to reload the list
            await loadAll();          // refresh table
        } finally {
            setVulnModalOpen(false);  // close modal
        }
    };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} sx={{ mb: 1 }}>
        <Tab label="Threats" />
        <Tab label="Vulnerabilities" />
        <Tab label="Controls" />
      </Tabs>
        {tab === 0 && <ThreatsList rows={threats} onEdit={(threat) => console.log('Edit threat:', threat)} />}
        {tab === 1 && (<>
            <VulnerabilitiesList 
                rows={vulns} 
                onEdit={(vuln) => console.log('Edit Vulnerability:', vuln) } 
                onAddClick={() => handleOpenAddVuln(true)}

            />

            <VulnerabilityModal
                open={vulnModalOpen}
                onClose={() => setVulnModalOpen(false)}
                onSelect={handleSelectVuln}      
                linkedIds={linkedVulnIds}

            />
        </>)}
      {/* {tab === 0 && <ThreatTable rows={threats} />}
      {tab === 1 && <VulnerabilityTable rows={vulns} />}
      {tab === 2 && <ControlTable rows={controls} />} */}
    </Box>
  );
}
