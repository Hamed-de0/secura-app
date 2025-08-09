import axios from "axios";
import configs from "../../configs";


export const getAssetTypes = () => axios.get(`${configs.API_BASE_URL}/asset-types/`).then(res => res.data);

// export const getThreatsByAssetType = (assetTypeId) => axios.get(`${configs.API_BASE_URL}/asset-type-threat-link/by-asset-type/${assetTypeId}`).then(res => res.data);
// export const getVulnerabilitiesByAssetType = (assetTypeId) => axios.get(`${configs.API_BASE_URL}/asset-type-vulnerability-link/by-asset-type/${assetTypeId}`).then(res => res.data);
// export const getControlsByAssetType = (assetTypeId) => axios.get(`${configs.API_BASE_URL}/asset-type-control-link/by-asset-type/${assetTypeId}`).then(res => res.data);

