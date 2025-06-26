import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Calendar, Users } from 'lucide-react'

const Leaderboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  // Hardcoded user data for UI building purposes
  const leaderboardData = [
    { id: 1, name: 'Sarah Johnson', country: 'US', flag: 'https://flagcdn.com/h20/us.png', score: 2850, questionsAnswered: 485, accuracy: 94, streak: 12, avatar: 'https://i.pravatar.cc/150?img=1', school: 'Harvard Medical School', year: '3rd Year', subjects: [{ name: 'Anatomy', score: 95 }, { name: 'Physiology', score: 93 }] },
    { id: 2, name: 'Ahmed Hassan', country: 'EG', flag: 'https://flagcdn.com/h20/eg.png', score: 2720, questionsAnswered: 402, accuracy: 91, streak: 8, avatar: 'https://i.pravatar.cc/150?img=2', school: 'Cairo University', year: '2nd Year', subjects: [{ name: 'Pathology', score: 92 }, { name: 'Pharmacology', score: 89 }] },
    { id: 3, name: 'Maria Rodriguez', country: 'ES', flag: 'https://flagcdn.com/h20/es.png', score: 2650, questionsAnswered: 378, accuracy: 89, streak: 15, avatar: 'https://i.pravatar.cc/150?img=3', school: 'Universidad Complutense', year: '4th Year', subjects: [{ name: 'Cardiology', score: 91 }, { name: 'Neurology', score: 87 }] },
    { id: 4, name: 'David Chen', country: 'CN', flag: 'https://flagcdn.com/h20/cn.png', score: 2580, questionsAnswered: 445, accuracy: 87, streak: 6, avatar: 'https://i.pravatar.cc/150?img=4', school: 'Peking University', year: '1st Year', subjects: [{ name: 'Biochemistry', score: 88 }, { name: 'Anatomy', score: 86 }] },
    { id: 5, name: 'Priya Sharma', country: 'IN', flag: 'https://flagcdn.com/h20/in.png', score: 2520, questionsAnswered: 395, accuracy: 92, streak: 9, avatar: 'https://i.pravatar.cc/150?img=5', school: 'AIIMS Delhi', year: '3rd Year', subjects: [{ name: 'Anatomy', score: 85 }, { name: 'Physiology', score: 84 }] },
    { id: 6, name: 'James Wilson', country: 'GB', flag: 'https://flagcdn.com/h20/gb.png', score: 2460, questionsAnswered: 412, accuracy: 88, streak: 7, avatar: 'https://i.pravatar.cc/150?img=6', school: 'Oxford University', year: '2nd Year', subjects: [{ name: 'Pharmacology', score: 90 }, { name: 'Pathology', score: 86 }] },
    { id: 7, name: 'jim kali', country: 'US', flag: 'https://flagcdn.com/h20/us.png', score: 500, questionsAnswered: 125, accuracy: 78, streak: 0, avatar: 'https://i.pravatar.cc/150?img=7', school: 'Local Medical School', year: '2nd Year', subjects: [{ name: 'Anatomy', score: 78 }, { name: 'Physiology', score: 82 }], isCurrentUser: true },
    { id: 8, name: 'Anna Kowalski', country: 'PL', flag: 'https://flagcdn.com/h20/pl.png', score: 2390, questionsAnswered: 365, accuracy: 90, streak: 11, avatar: 'https://i.pravatar.cc/150?img=8', school: 'Medical University Warsaw', year: '3rd Year', subjects: [{ name: 'Microbiology', score: 89 }, { name: 'Immunology', score: 91 }] },
    { id: 9, name: 'Mohammed Al-Rashid', country: 'AE', flag: 'https://flagcdn.com/h20/ae.png', score: 2320, questionsAnswered: 388, accuracy: 86, streak: 5, avatar: 'https://i.pravatar.cc/150?img=9', school: 'UAE University', year: '4th Year', subjects: [{ name: 'Surgery', score: 87 }, { name: 'Medicine', score: 85 }] },
    { id: 10, name: 'Emily Thompson', country: 'CA', flag: 'https://flagcdn.com/h20/ca.png', score: 2280, questionsAnswered: 425, accuracy: 85, streak: 13, avatar: 'https://i.pravatar.cc/150?img=10', school: 'University of Toronto', year: '1st Year', subjects: [{ name: 'Biochemistry', score: 84 }, { name: 'Cell Biology', score: 86 }] },
    { id: 11, name: 'Roberto Silva', country: 'BR', flag: 'https://flagcdn.com/h20/br.png', score: 2210, questionsAnswered: 356, accuracy: 89, streak: 4, avatar: 'https://i.pravatar.cc/150?img=11', school: 'University of São Paulo', year: '3rd Year', subjects: [{ name: 'Cardiology', score: 88 }, { name: 'Respiratory', score: 90 }] },
    { id: 12, name: 'Fatima Al-Zahra', country: 'SA', flag: 'https://flagcdn.com/h20/sa.png', score: 2180, questionsAnswered: 342, accuracy: 87, streak: 8, avatar: 'https://i.pravatar.cc/150?img=12', school: 'King Saud University', year: '2nd Year', subjects: [{ name: 'Pathology', score: 86 }, { name: 'Pharmacology', score: 88 }] },
    { id: 13, name: 'Kevin Murphy', country: 'IE', flag: 'https://flagcdn.com/h20/ie.png', score: 2150, questionsAnswered: 398, accuracy: 84, streak: 6, avatar: 'https://i.pravatar.cc/150?img=13', school: 'Trinity College Dublin', year: '4th Year', subjects: [{ name: 'Surgery', score: 85 }, { name: 'Emergency Med', score: 83 }] },
    { id: 14, name: 'Lisa Andersson', country: 'SE', flag: 'https://flagcdn.com/h20/se.png', score: 2120, questionsAnswered: 375, accuracy: 88, streak: 9, avatar: 'https://i.pravatar.cc/150?img=14', school: 'Karolinska Institute', year: '3rd Year', subjects: [{ name: 'Neurology', score: 87 }, { name: 'Psychiatry', score: 89 }] },
    { id: 15, name: 'Hiroshi Tanaka', country: 'JP', flag: 'https://flagcdn.com/h20/jp.png', score: 2090, questionsAnswered: 423, accuracy: 82, streak: 7, avatar: 'https://i.pravatar.cc/150?img=15', school: 'University of Tokyo', year: '1st Year', subjects: [{ name: 'Anatomy', score: 81 }, { name: 'Physiology', score: 83 }] },
    { id: 16, name: 'Sophie Martin', country: 'FR', flag: 'https://flagcdn.com/h20/fr.png', score: 2060, questionsAnswered: 368, accuracy: 86, streak: 10, avatar: 'https://i.pravatar.cc/150?img=16', school: 'Université Paris Descartes', year: '2nd Year', subjects: [{ name: 'Biochemistry', score: 85 }, { name: 'Molecular Biology', score: 87 }] },
    { id: 17, name: 'Carlos Mendoza', country: 'MX', flag: 'https://flagcdn.com/h20/mx.png', score: 2030, questionsAnswered: 391, accuracy: 83, streak: 5, avatar: 'https://i.pravatar.cc/150?img=17', school: 'UNAM Mexico', year: '4th Year', subjects: [{ name: 'Medicine', score: 82 }, { name: 'Pediatrics', score: 84 }] },
    { id: 18, name: 'Ingrid Nielsen', country: 'DK', flag: 'https://flagcdn.com/h20/dk.png', score: 2000, questionsAnswered: 334, accuracy: 87, streak: 12, avatar: 'https://i.pravatar.cc/150?img=18', school: 'University of Copenhagen', year: '3rd Year', subjects: [{ name: 'Pharmacology', score: 86 }, { name: 'Toxicology', score: 88 }] },
    { id: 19, name: 'Marco Bianchi', country: 'IT', flag: 'https://flagcdn.com/h20/it.png', score: 1980, questionsAnswered: 356, accuracy: 85, streak: 3, avatar: 'https://i.pravatar.cc/150?img=19', school: 'University of Milan', year: '2nd Year', subjects: [{ name: 'Pathology', score: 84 }, { name: 'Histology', score: 86 }] },
    { id: 20, name: 'Aisha Patel', country: 'ZA', flag: 'https://flagcdn.com/h20/za.png', score: 1950, questionsAnswered: 378, accuracy: 84, streak: 8, avatar: 'https://i.pravatar.cc/150?img=20', school: 'University of Cape Town', year: '1st Year', subjects: [{ name: 'Anatomy', score: 83 }, { name: 'Cell Biology', score: 85 }] }
  ]

  // Get top 3 performers for podium display
  const topThree = leaderboardData.slice(0, 3)
  const currentUserData = leaderboardData.find(user => user.isCurrentUser)
  const currentUserRank = leaderboardData.findIndex(user => user.isCurrentUser) + 1

  const periods = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ]

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>
    }
  }

  const getRankStyle = (rank, isCurrentUser = false) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/40 ring-1 ring-blue-500/30'
    }
    
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30'
      case 2:
        return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30'
      case 3:
        return 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30'
      default:
        return 'bg-gray-800 border-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 md:p-3 rounded-xl">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white">Leaderboard</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">See who's leading the way</p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 w-full md:w-auto">
              {periods.map(period => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`flex-1 md:flex-initial py-2 px-3 md:px-6 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period.value
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Desktop Layout: Grid with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Sidebar - Top Performers & Current User Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Top 3 Podium */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-4">Top Performers</h3>
              <div className="flex justify-center items-end gap-4">
                {/* 2nd Place */}
                {topThree[1] && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                      <img 
                        src={topThree[1].avatar} 
                        alt={topThree[1].name}
                        className="w-full h-full rounded-full object-cover border-2 border-gray-300"
                      />
                      <img 
                        src={topThree[1].flag} 
                        alt={topThree[1].country}
                        className="absolute -bottom-1 -right-1 w-4 h-3 md:w-5 md:h-4 rounded-sm border border-white"
                      />
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                      <Trophy className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">{topThree[1].name}</p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{topThree[1].score}</p>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <motion.div
                    initial={{ y: 30, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-center"
                  >
                    <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-2">
                      <img 
                        src={topThree[0].avatar} 
                        alt={topThree[0].name}
                        className="w-full h-full rounded-full object-cover border-4 border-yellow-300"
                      />
                      <img 
                        src={topThree[0].flag} 
                        alt={topThree[0].country}
                        className="absolute -bottom-1 -right-1 w-5 h-4 md:w-6 md:h-5 rounded-sm border-2 border-yellow-300"
                      />
                    </div>
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-4 rounded-lg text-white">
                      <Crown className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1" />
                      <p className="text-sm md:text-base font-bold">{topThree[0].name}</p>
                      <p className="text-xs md:text-sm opacity-90">{topThree[0].score}</p>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                  >
                    <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                      <img 
                        src={topThree[2].avatar} 
                        alt={topThree[2].name}
                        className="w-full h-full rounded-full object-cover border-2 border-amber-600"
                      />
                      <img 
                        src={topThree[2].flag} 
                        alt={topThree[2].country}
                        className="absolute -bottom-1 -right-1 w-4 h-3 md:w-5 md:h-4 rounded-sm border border-white"
                      />
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                      <Medal className="w-4 h-4 md:w-5 md:h-5 text-amber-600 mx-auto mb-1" />
                      <p className="text-xs md:text-sm font-bold text-amber-800 dark:text-amber-300">{topThree[2].name}</p>
                      <p className="text-xs md:text-sm text-amber-600 dark:text-amber-400">{topThree[2].score}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Current User Stats - Only on Desktop */}
            {currentUserData && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="hidden lg:block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-6"
              >
                <h3 className="text-base md:text-lg font-bold text-blue-700 dark:text-blue-300 mb-4">Your Performance</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16">
                    <img 
                      src={currentUserData.avatar} 
                      alt={currentUserData.name}
                      className="w-full h-full rounded-full object-cover border-2 border-blue-300"
                    />
                    <img 
                      src={currentUserData.flag} 
                      alt={currentUserData.country}
                      className="absolute -bottom-1 -right-1 w-5 h-4 rounded-sm border border-white"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentUserData.school}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rank</span>
                    <span className="font-bold text-lg text-blue-700 dark:text-blue-300">#{currentUserRank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
                    <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
                    <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.accuracy}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Questions</span>
                    <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.questionsAnswered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                    <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{currentUserData.streak} days</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Rankings List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white">All Rankings</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{leaderboardData.length} participants</span>
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
                      <p className={`font-medium text-sm truncate ${
                        user.isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {user.name}
                        {user.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{user.school}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        user.isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {user.score}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{user.questionsAnswered} Qs</p>
                    </div>
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
                        <p className={`font-medium text-base ${
                          user.isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                        }`}>
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
                      <p className={`font-bold text-xl ${
                        user.isCurrentUser ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {user.score}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard 