import axios from 'axios' // adjust path if needed
import configs from '../configs';

export const getVulnerabilities = () => axios.get(`${configs.API_BASE_URL}/risks/vulnerabilities`)
export const createVulnerability = (data) => axios.post(`${configs.API_BASE_URL}/risks/vulnerabilities`, data)
export const updateVulnerability = (id, data) => axios.put(`${configs.API_BASE_URL}/risks/vulnerabilities/${id}`, data)
export const deleteVulnerability = (id) => axios.delete(`${configs.API_BASE_URL}/risks/vulnerabilities/${id}`)
