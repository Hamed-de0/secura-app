import axios from 'axios';
import configs from '../configs';

export const getControls = async () =>
  axios.get(`${configs.API_BASE_URL}/controls/controls`).then(r => r.data);

export const getControlsByAssetType = async (assetTypeId) =>
  axios.get(`${configs.API_BASE_URL}/asset-type-control-link/by-asset-type/${assetTypeId}/by-name`).then(r => r.data);

export const addControlLink = async (payload) =>
  axios.post(`${configs.API_BASE_URL}/asset-type-control-link/`, payload).then(r => r.data);
