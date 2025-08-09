import axios from 'axios' // adjust path if needed
import configs from '../configs';

export const getThreats = () => axios.get(`${configs.API_BASE_URL}/risks/threats`).then(res => res.data);
export const createThreat = (data) => axios.post(`${configs.API_BASE_URL}/risks/threats`, data)
export const updateThreat = (id, data) => axios.put(`${configs.API_BASE_URL}/risks/threats/${id}`, data)
export const deleteThreat = (id) => axios.delete(`${configs.API_BASE_URL}/risks/threats/${id}`)

export const getThreatsByAssetType = (assetTypeId) => axios.get(`${configs.API_BASE_URL}/asset-type-threat-link/by-asset-type/${assetTypeId}/by-name`).then(res => res.data);   
  
export const addThreatLink = async (payload) =>
  axios.post(`${configs.API_BASE_URL}/asset-type-threat-link/`, payload).then(r => r.data);
