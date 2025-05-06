import React from "react";
import { useNavigate } from "react-router-dom";
import AdminCard from "../Components/AdminCard";
import ContinuousChart from "../Components/ContinouslyChartComponent";
import { MonthlyChart } from "../Components/MonthlyChartComponent";
import '../Styles/Dashboard.css';
import '../Components/LineChart'
import ResponsivePieChart from "../Components/MyPieChart";

function AdminDashboard() {
  const navigate = useNavigate();



  return (
    <div className="containerOfPage">
      <div className="containerOfDashboard">
          <div className="containerOfCards">
              <AdminCard/>
              <ResponsivePieChart/>
          </div>
          <div className="containerOfCharts">
              <MonthlyChart />
              <ContinuousChart/>
          </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
