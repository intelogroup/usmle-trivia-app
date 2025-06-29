import { motion } from 'framer-motion';
import ProfileHeader from '../components/profile/ProfileHeader';
import UserStats from '../components/profile/UserStats';
import Achievements from '../components/profile/Achievements';
import SettingsComponent from '../components/profile/SettingsComponent';
import AccountInfo from '../components/profile/AccountInfo';
import DatabaseConnection from '../components/profile/DatabaseConnection';

const Profile = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <ProfileHeader />
      <UserStats />
      <Achievements />
      <SettingsComponent />
      <AccountInfo />
      <DatabaseConnection />
    </motion.div>
  );
};

export default Profile;
