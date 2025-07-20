import axios from 'axios';
import configs from '../configs';

export const fetchAssetsTree = () => {
  return axios.get(`${configs.API_BASE_URL}/assets?include_children=true`);
};

export const fetchAssets = () => {
  return axios.get(`${configs.API_BASE_URL}/assets`);
};

export const deleteAsset = (id) => {
    return axios.delete(`${configs.API_BASE_URL}/assets/${id}`);
};

export const deleteAssetCascade = (id) => {
    return axios.delete(`${configs.API_BASE_URL}/assets/${id}/cascade`);
};

export const getAssetGroupsTree = () => {
    return axios.get(`${configs.API_BASE_URL}/asset-groups/manage/tree`);
};



// Asset Groups
export const fetchAssetGroups = () => {
  return axios.get(`${configs.API_BASE_URL}/asset-groups`);
};

export const createAssetGroup = (data) => {
  return axios.post(`${configs.API_BASE_URL}/asset-groups/`, data);
};

export const updateAssetGroup = (id, data) => {
  return axios.put(`${configs.API_BASE_URL}/asset-groups/${id}`, data);
};

export const deleteAssetGroup = (id) => {
    return axios.delete(`${configs.API_BASE_URL}/asset-groups/${id}`);
};




// Asset Types
export const fetchAssetTypes = () => {
  return axios.get(`${configs.API_BASE_URL}/asset-types/`);
};

export const createAssetType = (data) => {
  return axios.post(`${configs.API_BASE_URL}/asset-types/`, data);
};

export const updateAssetType = (id, data) => {
  return axios.put(`${configs.API_BASE_URL}/asset-types/${id}`, data);
};