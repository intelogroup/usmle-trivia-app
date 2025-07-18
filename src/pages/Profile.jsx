import { motion } from 'framer-motion';
import ProfileHeader from '../components/profile/ProfileHeader';
import UserStats from '../components/profile/UserStats';
import Achievements from '../components/profile/Achievements';
import SettingsComponent from '../components/profile/SettingsComponent';
import AccountInfo from '../components/profile/AccountInfo';
import AnalyticsWidget from '../components/analytics/AnalyticsWidget';


const Profile = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <ProfileHeader />
      <UserStats />
      <AnalyticsWidget />
      <Achievements />
      <SettingsComponent />
      <AccountInfo />

    </motion.div>
  );
};

export default Profile;
