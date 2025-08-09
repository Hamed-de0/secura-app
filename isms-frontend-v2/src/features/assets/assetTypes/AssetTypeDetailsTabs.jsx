// AssetTypeDetailsTabs.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
// import { getThreatsByAssetType, getControlsByAssetType, getVulnerabilitiesByAssetType } from './api'; // Adjust the import path as necessary
import { getVulnsByAssetType, addVulnLink } from '../../vulnerabilities/api';
import VulnerabilitiesList from '../../vulnerabilities/VulnerabilitiesList';
import VulnerabilityModal from '../../vulnerabilities/VulnerabilityModal';
import ThreatModal from '../../threats/ThreatModal';
import ThreatsList from '../../threats/ThreatsList';
import ControlModal from '../../controls/ControlModal';
import ControlsList from '../../controls/ControlsList';
import { getThreatsByAssetType, addThreatLink } from '../../threats/api';
import { getControlsByAssetType, addControlLink } from '../../controls/api';


export default function AssetTypeDetailsTabs({ assetType }) {
    const [tab, setTab] = useState(0);
    const [threats, setThreats] = useState([]);
    const [vulns, setVulns] = useState([]);
    const [controls, setControls] = useState([]);
    const [vulnModalOpen, setVulnModalOpen] = useState(false);
    const [threatModalOpen, setThreatModalOpen] = useState(false);
    const [controlModalOpen, setControlModalOpen] = useState(false);

  useEffect(() => {
    if (!assetType) return;
    loadAll();
        
  }, [assetType]);

    const handleOpenAddVuln = () => setVulnModalOpen(true);


    // Function to handle vulnerability selection
    const loadAll = async () => {
        if (!assetType) return;
        console.log('Loading threats and vulnerabilities for asset type:', assetType);
        const [t, v, c] = await Promise.all([
            getThreatsByAssetType(assetType.id).catch(() => []),
            getVulnsByAssetType(assetType.id).catch(() => []),
            getControlsByAssetType(assetType.id).catch(() => [])
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

    const linkedThreatIds = useMemo(
      () => new Set((threats || []).map(x => x.threat_id ?? x.id)),
      [threats]
    );
    const linkedControlIds = useMemo(
      () => new Set((controls || []).map(x => x.control_id ?? x.id)),
      [controls]
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

    const handleSelectThreat = async (threat) => {
      try {
        await addThreatLink({
          asset_type_id: assetType.id,
          threat_id: threat.id,
          score: 1,
          justification: 'Manually added by user'
        });
        await loadAll();
      } finally {
        setThreatModalOpen(false);
      }
    };

    const handleSelectControl = async (control) => {
      try {
        await addControlLink({
          asset_type_id: assetType.id,
          control_id: control.id,
          score: 1,
          justification: 'Manually added by user'
        });
        await loadAll();
      } finally {
        setControlModalOpen(false);
      }
    };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} sx={{ mb: 1 }}>
        <Tab label="Threats" />
        <Tab label="Vulnerabilities" />
        <Tab label="Controls" />
      </Tabs>
        {tab === 0 && (<>
          <ThreatsList
            rows={threats}
            onEdit={(row)=>{/* edit/unlink */}}
            onAddClick={() => setThreatModalOpen(true)}
          />
          <ThreatModal
            open={threatModalOpen}
            onClose={() => setThreatModalOpen(false)}
            onSelect={handleSelectThreat}
            linkedIds={linkedThreatIds}
          />
        </>)}
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
        {tab === 2 && (
          <>
            <ControlsList
              rows={controls}
              onEdit={(row)=>{/* edit/unlink */}}
              onAddClick={() => setControlModalOpen(true)}
            />
            <ControlModal
              open={controlModalOpen}
              onClose={() => setControlModalOpen(false)}
              onSelect={handleSelectControl}
              linkedIds={linkedControlIds}
            />
          </>
        )}
    </Box>
  );
}
