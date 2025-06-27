import { Crown, Trophy, Medal } from 'lucide-react';

export const getRankIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Trophy className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
  }
};

export const getRankStyle = (rank, isCurrentUser = false) => {
  if (isCurrentUser) {
    return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/40 ring-1 ring-blue-500/30';
  }
  
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    case 2:
      return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30';
    case 3:
      return 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30';
    default:
      return 'bg-gray-800 border-gray-700';
  }
};

export const getRankTextColor = (isCurrentUser = false) => {
  if (isCurrentUser) {
    return 'text-blue-700 dark:text-blue-300';
  }
  return 'text-gray-800 dark:text-gray-200';
}; 