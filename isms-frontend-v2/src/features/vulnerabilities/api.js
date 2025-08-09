import axios from 'axios' // adjust path if needed
import configs from '../configs';

export const getVulnerabilities = () => axios.get(`${configs.API_BASE_URL}/risks/vulnerabilities`).then(res => res.data);
export const createVulnerability = (data) => axios.post(`${configs.API_BASE_URL}/risks/vulnerabilities`, data)
export const updateVulnerability = (id, data) => axios.put(`${configs.API_BASE_URL}/risks/vulnerabilities/${id}`, data)
export const deleteVulnerability = (id) => axios.delete(`${configs.API_BASE_URL}/risks/vulnerabilities/${id}`)


export const getVulnsByAssetType = (assetTypeId) => axios.get(`${configs.API_BASE_URL}/asset-type-vulnerability-link/by-asset-type/${assetTypeId}/by-name`).then(res => res.data);   
export const addVulnLink = (payload) => axios.post(`${configs.API_BASE_URL}/asset-type-vulnerability-link/`, payload).then(res => res.data);