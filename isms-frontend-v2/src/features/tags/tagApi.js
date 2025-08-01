import axios from 'axios';
import configs from '../../config/confing';

export const fetchTags = () => axios.get(`${configs.API_BASE_URL}/asset-tags/`);
export const createTag = (data) => axios.post(`${configs.API_BASE_URL}/asset-tags/`, data);
export const updateTag = (id, data) => axios.put(`${configs.API_BASE_URL}/asset-tags/${id}`, data);
export const deleteTag = (id) => axios.delete(`${configs.API_BASE_URL}/asset-tags/${id}`);
export const fetchAssignedTags = (assetId) => axios.get(`${configs.API_BASE_URL}/asset-tags/assets/${assetId}/tags`);

