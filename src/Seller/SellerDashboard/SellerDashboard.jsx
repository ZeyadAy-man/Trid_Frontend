import styles from './SellerDashboard.module.css'
import { getUserProfile } from '../../Service/authService';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts';
import { User, ShoppingCart, Eye, Activity } from "lucide-react";
import { Store, Mail, User2, Star } from "lucide-react";
import { 
    useState,
    useEffect,
    useCallback
 } from 'react';
import { useNavigate } from 'react-router-dom';
export default function SellerDashboard() {

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

    const shops = [
        {
            name: "Alpha Store",
            review: "4.5 / 5",
            owner: "Rawan Adel",
            email: "Rawan@alpha.com"
        },
        {
            name: "Beta Bazaar",
            review: "4.2 / 5",
            owner: "Mohammed Ragab",
            email: "Ragbola@beta.com"
        },
        {
            name: "Gamma Mart",
            review: "3.9 / 5",
            owner: "3ab 3al",
            email: "3al@gamma.com"
        },
        {
            name: "Denvers",
            review: "3.9 / 5",
            owner: "Mazen Ramadan",
            email: "Zoon@gamma.com"
        },
                {
            name: "Shoes",
            review: "3.9 / 5",
            owner: "Zeyad Ayman",
            email: "DaUnknown@gamma.com"
        },
        {
            name: "Gamma Mart",
            review: "3.9 / 5",
            owner: "Mostafa khafagy",
            email: "8yboba@gamma.com"
        },
    ];

    const [fullName, setFullName] = useState(``);
    const [email, setEmail] = useState(``);
    const [profilePicture, setProfilePicture] = useState("/unknown-person.png");
    const navigate = useNavigate();

    const fetchUserProfile = useCallback(async () => {
        try {
            const { data, success } = await getUserProfile();
    
            if (success && data) {

                if(data.email){
                    setEmail(data.email);
                }
                if(data.firstName && data.lastName){
                    setFullName(data.firstName + " " + data.lastName);
                }

                if (data.photoUrl) {
                    setProfilePicture(data.photoUrl);
                }
            }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
    }, []);
    
    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    return (
        <div className={styles.dashboardContainer}>
            {/* KPI Section */}

            <div className={styles.headerSection}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <div>
                            <h1 className={styles.pageTitle}>Dashboard Management</h1>
                            <p className={styles.pageSubtitle}>
                                Manage your shop and track performance
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.statsSection}>
                <div className={styles.statCard}>
                    <User size={24} /> <h4>Users</h4><p>1,240</p>
                </div>
                <div className={styles.statCard}>
                    <ShoppingCart size={24} /> <h4>Sales</h4><p>$23,420</p>
                </div>
                <div className={styles.statCard}>
                    <Eye size={24} /> <h4>Visitors</h4><p>8,390</p>
                </div>
                <div className={styles.statCard}>
                    <Activity size={24} /> <h4>Bounce Rate</h4><p>32%</p>
                </div>
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
        </div>
    )
}
