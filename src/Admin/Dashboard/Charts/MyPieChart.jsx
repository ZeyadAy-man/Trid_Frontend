import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import './MyPieChart.css';
ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Red", "Blue", "Yellow"],
  datasets: [
    {
      data: [30, 50, 20],
      backgroundColor: ["#FF5733", "#3498DB", "#FFC300"],
      hoverBackgroundColor: ["#FF3210", "#2182C3", "#FFA000"],
      borderWidth: 2,
      borderColor: "#fff",
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: { color: "#00ffff", font: { size: 14 } },
    },
    datalabels: {
      formatter: (value, context) => {
        let total = context.dataset.data.reduce((acc, val) => acc + val, 0);
        let percentage = ((value / total) * 100).toFixed(1) + "%";
        return percentage;
      },
      color: "#00ff00",
      font: { weight: "bold", size: 14 },
    }
  },
};

const ResponsivePieChart = () => {
  return (
    <section className="containerOfPieChart" aria-label="Pie Chart">
      <h2 className="visually-hidden">Pie Chart Data</h2>
      <Pie data={data} options={options} aria-label="Pie chart visualization" />
    </section>
  );
};

export default ResponsivePieChart;