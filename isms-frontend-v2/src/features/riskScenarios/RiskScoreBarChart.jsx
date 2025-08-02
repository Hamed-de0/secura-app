// RiskScoreBarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const RiskScoreBarChart = ({ initialByDomain, residualByDomain }) => {
  const domains = Object.keys(initialByDomain).map(id => {
    switch (parseInt(id)) {
      case 1: return 'Confidentiality';
      case 2: return 'Integrity';
      case 3: return 'Availability';
      case 4: return 'Legal';
      case 5: return 'Reputation';
      default: return `Domain ${id}`;
    }
  });

  const data = {
    labels: domains,
    datasets: [
      {
        label: 'Initial',
        data: Object.values(initialByDomain),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderRadius: 10,
        barThickness: 12,
      },
      {
        label: 'Residual',
        data: Object.values(residualByDomain),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderRadius: 10,
        barThickness: 12,
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#222'
        }
      },
      y: {
        ticks: {
          color: '#333'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#555',
          boxWidth: 12
        }
      }
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.07)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '16px',
      height: '300px',
      color: 'white',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default RiskScoreBarChart;
