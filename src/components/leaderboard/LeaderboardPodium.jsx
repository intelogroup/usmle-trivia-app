import { motion } from 'framer-motion';
import { Crown, Trophy, Medal } from 'lucide-react';

const LeaderboardPodium = ({ topThree }) => {
  if (!topThree || topThree.length === 0) {
    return null;
  }

  const renderPosition = (user, position, delay) => {
    const icons = {
      1: <Crown className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1" />,
      2: <Trophy className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mx-auto mb-1" />,
      3: <Medal className="w-4 h-4 md:w-5 md:h-5 text-amber-600 mx-auto mb-1" />
    };

    const styles = {
      1: {
        container: "text-center",
        avatar: "relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-2",
        avatarImg: "w-full h-full rounded-full object-cover border-4 border-yellow-300",
        flag: "absolute -bottom-1 -right-1 w-5 h-4 md:w-6 md:h-5 rounded-sm border-2 border-yellow-300",
        card: "bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 rounded-lg text-white",
        name: "text-sm md:text-base font-bold",
        score: "text-xs md:text-sm opacity-90"
      },
      2: {
        container: "text-center",
        avatar: "relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-2",
        avatarImg: "w-full h-full rounded-full object-cover border-2 border-gray-300",
        flag: "absolute -bottom-1 -right-1 w-4 h-3 md:w-5 md:h-4 rounded-sm border border-white",
        card: "bg-gray-200 dark:bg-gray-700 p-3 rounded-lg",
        name: "text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300",
        score: "text-xs md:text-sm text-gray-500 dark:text-gray-400"
      },
      3: {
        container: "text-center",
        avatar: "relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-2",
        avatarImg: "w-full h-full rounded-full object-cover border-2 border-amber-600",
        flag: "absolute -bottom-1 -right-1 w-4 h-3 md:w-5 md:h-4 rounded-sm border border-white",
        card: "bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg",
        name: "text-xs md:text-sm font-bold text-amber-800 dark:text-amber-300",
        score: "text-xs md:text-sm text-amber-600 dark:text-amber-400"
      }
    };

    const style = styles[position];

    return (
      <motion.div
        initial={{ y: 30, opacity: 0, scale: position === 1 ? 0.9 : 1 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ 
          delay, 
          type: position === 1 ? "spring" : "tween",
          stiffness: position === 1 ? 200 : undefined
        }}
        className={style.container}
      >
        <div className={style.avatar}>
          <img 
            src={user.avatar} 
            alt={user.name}
            className={style.avatarImg}
          />
          <img 
            src={user.flag} 
            alt={user.country}
            className={style.flag}
          />
        </div>
        <div className={style.card}>
          {icons[position]}
          <p className={style.name}>{user.name}</p>
          <p className={style.score}>{user.score}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-4">Top Performers</h3>
      <div className="flex justify-center items-end gap-4">
        {/* 2nd Place */}
        {topThree[1] && renderPosition(topThree[1], 2, 0.3)}
        
        {/* 1st Place */}
        {topThree[0] && renderPosition(topThree[0], 1, 0.4)}
        
        {/* 3rd Place */}
        {topThree[2] && renderPosition(topThree[2], 3, 0.2)}
      </div>
    </motion.div>
  );
};

export default LeaderboardPodium; 