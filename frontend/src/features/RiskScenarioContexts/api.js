import axios from "axios"; // Adjust based on your actual axios wrapper
import configs from '../configs';

export const getScenarioContext = () => axios.get(`${configs.API_BASE_URL}/risks/risk_scenario_contexts/?skip=0&limit=100/`).then(res => res.data);
