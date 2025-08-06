// useRiskScenarioContextData.js
import { useEffect, useState } from "react";
import axios from "axios"; // Adjust based on your actual axios wrapper
import configs from '../configs';

export default function useRiskScenarioContextData() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);         // 0-based for MUI
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    search: "",
    scopeType: "All",
    status: "All",
  });

  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${configs.API_BASE_URL}/risks/risk_scenario_contexts/expanded/manage`, {
        params: {
          page: page + 1, // convert to 1-based for backend
          page_size: pageSize,
          search: filters.search,
          scope_type: filters.scopeType !== "All" ? filters.scopeType : undefined,
          status: filters.status !== "All" ? filters.status : undefined,
        },
      });
      setData(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching risk scenario contexts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this risk scenario context?")) return;
    try {
      await axios.delete(`${configs.API_BASE_URL}/risks/risk_scenario_contexts/${id}`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete context:", error);
    }
  };

  const onFilterChange = (newFilters) => {
    console.log("Filter change:", newFilters);
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0); 
  };

  return {
    data,
    loading,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
    handleDelete,
    onFilterChange,
  };
}
