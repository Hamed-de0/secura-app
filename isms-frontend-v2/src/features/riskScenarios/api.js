// src/features/riskScenarios/RiskScenarioService.js
import axios from 'axios'; // or axios directly if you're not using a wrapper
import configs from '../configs';

export const getGroupedRiskScenarios = async () => {
  const res = await axios.get(`${configs.API_BASE_URL}/risks/risk-scenarios/manage/grouped`);
  return res.data;
};

export const getAssets = () => axios.get(`${configs.API_BASE_URL}/assets/`).then(res => res.data);
export const getAssetGroups = () => axios.get(`${configs.API_BASE_URL}/asset-groups/`).then(res => res.data);
export const getAssetTypes = () => axios.get(`${configs.API_BASE_URL}/asset-types/`).then(res => res.data);
export const getTags = () => axios.get(`${configs.API_BASE_URL}/asset-tags/`).then(res => res.data);
export const getCategoriesWithSubcategories = () => axios.get(`${configs.API_BASE_URL}/risks/risk-scenarios/risk-scenario-categories/with-subcategories`).then(res => res.data);
export const getThreats = () => axios.get(`${configs.API_BASE_URL}/risks/threats/`).then(res => res.data);
export const getVulnerabilities = () => axios.get(`${configs.API_BASE_URL}/risks/vulnerabilities/`).then(res => res.data);
export const getLifecycleEventTypes = () => axios.get(`${configs.API_BASE_URL}/lifecycle-event-types/`).then(res => res.data);

export const createRiskScenario = (payload) => axios.post(`${configs.API_BASE_URL}/risks/risk-scenarios/`, payload);

export const getRiskScenarioById = (id) => axios.get(`${configs.API_BASE_URL}/risks/risk-scenarios/${id}`).then(res => res.data);

export const updateRiskScenario = (id, payload) => axios.put(`${configs.API_BASE_URL}/risks/risk-scenarios/${id}`, payload);

export const getImpactDomains = () => axios.get(`${configs.API_BASE_URL}/risks/impact-domains/`).then(res => res.data);
export const updateImpactRatings = (payload) => axios.post(`${configs.API_BASE_URL}/risks/impact-ratings/batch`, payload).then(res => res.data);

export const getImpactRatings = (scenarioId) => {
  return axios.get(`${configs.API_BASE_URL}/risks/impact-ratings/by-scenario/${scenarioId}`).then(res => res.data);
};

export const getAllControls = () => axios.get(`${configs.API_BASE_URL}/controls/controls/`).then(res => res.data);
export const getControlLinksByScenario = (scenarioId) => axios.get(`${configs.API_BASE_URL}/controls/control-risk-links/by-scenario/${scenarioId}`).then(res => res.data);
export const createOrUpdateControlLink = (payload) => axios.post(`${configs.API_BASE_URL}/controls/control-risk-links/`, payload); // for now using POST always
export const deleteControlLink = (linkId) => axios.delete(`${configs.API_BASE_URL}/controls/control-risk-links/${linkId}`);




