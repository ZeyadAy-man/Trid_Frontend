import styles from '../SellerDashboard/SellerDashboard.module.css';
import AdminCard from '../../Admin/Dashboard/AdminCard/AdminCard';
import ResponsivePieChart from '../../Admin/Dashboard/Charts/MyPieChart';
import { MonthlyChart } from '../../Admin/Dashboard/Charts/MonthlyChartComponent';
import ContinuousChart from '../../Admin/Dashboard/Charts/ContinouslyChartComponent';
import { 
    useState,
    useCallback,
    useEffect
} from 'react';
import { getUserProfile } from '../../Service/authService';

export default function SellerDashboard() {

    const [fullName, setFullName] = useState(``);
    const [email, setEmail] = useState(``);
    const [profilePicture, setProfilePicture] = useState("/unknown-person.png");

    const fetchUserProfile = useCallback(async () => {
        try {
            const { data, success } = await getUserProfile();
    
            if (success && data) {
                console.log(data);

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
        <div className={styles.containerOfPage} style={{display: 'flex', alignContent: 'center', flexDirection: 'column', alignItems: 'center', width: '100%', marginLeft: '40px'}}>
            <div className={styles.headerSection} style={{width: '100%'}}>
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

            <div className="containerOfDashboard" style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', height: '80vh'}}>
                <div className="containerOfCards" style={{display: 'flex', flexDirection: 'column', width: '30%'}}>
                    <AdminCard path={"/account"} profileImage={profilePicture} fullName={fullName} email={email}/>
                    <ResponsivePieChart/>
                </div>
                <div className="containerOfCharts" style={{display: 'flex', flexDirection: 'column', width: '80%', marginLeft: '40px'}}>
                    <MonthlyChart />
                    <ContinuousChart/>
                </div>
            </div>
        </div>
    )
}
