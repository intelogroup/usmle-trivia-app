import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileHeader = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = user?.id === profile?.id;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center border border-gray-50 dark:border-gray-700"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
        )}
      </motion.div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-dark-50 mb-1">
        {profile?.display_name ||
          user?.user_metadata?.full_name ||
          "USMLE Student"}
      </h2>
      <p className="text-gray-600 dark:text-dark-300 text-sm">
        {profile?.school_of_medicine || "USMLE Step 1 Candidate"}
      </p>
      <div className="mt-4 flex justify-center">
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
          {profile?.achievement_grades?.name || "Beginner"}
        </span>
      </div>
      {profile?.countries && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-xl">{profile.countries.flag_emoji}</span>
          <span className="text-sm text-gray-600 dark:text-dark-300">
            {profile.countries.name}
          </span>
        </div>
      )}
      {!isOwnProfile && profile?.id && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
          onClick={async () => {
            const chatId = await startChatWithUser(profile.id);
            navigate(`/chat?chatId=${chatId}`);
          }}
        >
          Chat
        </button>
      )}
    </motion.div>
  );
};

export default ProfileHeader;
