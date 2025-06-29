import { motion } from 'framer-motion';
import { getRankIcon, getRankTextColor } from '../../utils/leaderboardUtils.jsx';
import { useNavigate } from 'react-router-dom';
import { startChatWithUser } from '../../services/chatService';

const LeaderboardTable = ({ leaderboardData, totalParticipants }) => {
  const navigate = useNavigate();
  const currentUserId = leaderboardData.find(u => u.isCurrentUser)?.id;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white">All Rankings</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{totalParticipants} participants</span>
      </div>
      
      {/* Desktop Table Header - Only visible on larger screens */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400">
        <div className="col-span-1">Rank</div>
        <div className="col-span-5">Student</div>
        <div className="col-span-2 text-center">Stats</div>
        <div className="col-span-2 text-center">Performance</div>
        <div className="col-span-2 text-right">Score</div>
      </div>
      
      <div className="space-y-2">
        {leaderboardData.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.05 }}
            className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 rounded-lg transition-colors ${
              user.isCurrentUser 
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {/* Mobile Layout */}
            <div className="md:hidden flex items-center gap-3">
              <div className="flex-shrink-0 w-8 flex justify-center">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="relative w-10 h-10 flex-shrink-0">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <img 
                  src={user.flag} 
                  alt={user.country}
                  className="absolute -bottom-1 -right-1 w-4 h-3 rounded-sm border border-white"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${getRankTextColor(user.isCurrentUser)}`}>
                  {user.name}
                  {user.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{user.school}</p>
              </div>
              
              <div className="text-right">
                <p className={`font-bold text-sm ${getRankTextColor(user.isCurrentUser)}`}>
                  {user.score}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{user.questionsAnswered} Qs</p>
              </div>
              {!user.isCurrentUser && (
                <button
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  onClick={async () => {
                    const chatId = await startChatWithUser(user.id);
                    navigate(`/chat?chatId=${chatId}`);
                  }}
                >
                  Chat
                </button>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:contents">
              <div className="col-span-1 flex items-center justify-center">
                {getRankIcon(index + 1)}
              </div>
              
              <div className="col-span-5 flex items-center gap-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <img 
                    src={user.flag} 
                    alt={user.country}
                    className="absolute -bottom-1 -right-1 w-5 h-4 rounded-sm border border-white"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-base ${getRankTextColor(user.isCurrentUser)}`}>
                    {user.name}
                    {user.isCurrentUser && <span className="text-sm ml-2">(You)</span>}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{user.school} • {user.year}</p>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center justify-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Questions</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{user.questionsAnswered}</p>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center justify-center gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Accuracy</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{user.accuracy}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Streak</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{user.streak}d</p>
                </div>
              </div>
              
              <div className="col-span-2 flex items-center justify-end">
                <p className={`font-bold text-xl ${getRankTextColor(user.isCurrentUser)}`}>
                  {user.score}
                </p>
                {!user.isCurrentUser && (
                  <button
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600"
                    onClick={async () => {
                      const chatId = await startChatWithUser(user.id);
                      navigate(`/chat?chatId=${chatId}`);
                    }}
                  >
                    Chat
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LeaderboardTable; 