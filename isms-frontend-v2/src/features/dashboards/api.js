import axios from "axios";
import configs from "../configs";


export const getSummary = () => axios.get(`${configs.API_BASE_URL}/dashboards/main/summary/`).then(res => res.data);
