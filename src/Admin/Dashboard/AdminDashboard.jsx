import styles from './AdminDashboard.module.css';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../Service/authService';
import { getAllShops } from '../../Service/shopService';

import { User, ShoppingCart, Eye, Activity } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function Dashboard() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState("/unknown-person.png");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  const salesData = [
    { month: "Jan", sales: 4000 },
    { month: "Feb", sales: 3000 },
    { month: "Mar", sales: 5000 },
    { month: "Apr", sales: 4780 },
    { month: "May", sales: 5890 },
    { month: "Jun", sales: 4390 },
  ];

  const userGrowthData = [
    { month: "Jan", users: 200 },
    { month: "Feb", users: 400 },
    { month: "Mar", users: 650 },
    { month: "Apr", users: 900 },
    { month: "May", users: 1400 },
    { month: "Jun", users: 1800 },
  ];

  const fetchShops = useCallback(async (page = 0) => {
    setLoading(true);
    setError("");
    const response = await getAllShops(page, pageSize);
    
    if (response.success && response.data) {
      const { content, totalPages } = response.data;
      setShops(content || []);
      setTotalPages(totalPages || 1);
    } else {
      setError(response.error || "Failed to fetch shops.");
    }
    setLoading(false);
  }, [pageSize]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data, success } = await getUserProfile();
      if (success && data) {
        if (data.email) setEmail(data.email);
        if (data.firstName && data.lastName) {
          setFullName(`${data.firstName} ${data.lastName}`);
        }
        if (data.photoUrl) setProfilePicture(data.photoUrl);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchShops();
  }, [fetchUserProfile, fetchShops]);

  return (
    <div className={styles.dashboardContainer}>
            {/* KPI Section */}

            <div className={styles.headerSection} style={{width: '100%'}}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>Dashboard Management</h1>
            <p className={styles.pageSubtitle}>Manage your shop and track performance</p>
          </div>
        </div>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statCard}><User size={24} /> <h4>Users</h4><p>1,240</p></div>
        <div className={styles.statCard}><ShoppingCart size={24} /> <h4>Sales</h4><p>$23,420</p></div>
        <div className={styles.statCard}><Eye size={24} /> <h4>Visitors</h4><p>8,390</p></div>
        <div className={styles.statCard}><Activity size={24} /> <h4>Bounce Rate</h4><p>32%</p></div>
      </div>

            {/* Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h4>Monthly Sales</h4>
          <div className={styles.chartPlaceholder}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="url(#colorSales)" radius={[10, 10, 0, 0]} />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0dc1a3" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0d7377" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h4>User Growth</h4>
          <div className={styles.chartPlaceholder}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#0d7377"
                  strokeWidth={3}
                  dot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

            {/* Table / Activity */}
      <div className={styles.tableSection}>
        <h4>Shops Overview</h4>

        {loading && <p>Loading shops...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <div className={styles.shopsTableWrapper}>
            <table className={styles.shopsTable}>
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Category</th>
                  <th>Owner phone</th>
                  <th>Owner Email</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr
                    key={shop.id}
                    onClick={() => navigate(`/admin/shops/${shop.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{shop.name}</td>
                    <td>{shop.category}</td>
                    <td>{shop.phone}</td>
                    <td>{shop.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
