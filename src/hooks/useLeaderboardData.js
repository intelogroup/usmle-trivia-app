import { useState, useMemo } from 'react';

// Hardcoded leaderboard data for now - could be replaced with API call
const LEADERBOARD_DATA = [
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
];

export const useLeaderboardData = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Time period options
  const periods = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  // Processed data based on selected period
  const processedData = useMemo(() => {
    // In a real app, you would filter data based on period
    // For now, we'll use the same data for all periods
    const leaderboardData = LEADERBOARD_DATA;
    
    // Extract key information
    const topThree = leaderboardData.slice(0, 3);
    const currentUserData = leaderboardData.find(user => user.isCurrentUser);
    const currentUserRank = leaderboardData.findIndex(user => user.isCurrentUser) + 1;
    
    return {
      leaderboardData,
      topThree,
      currentUserData,
      currentUserRank,
      totalParticipants: leaderboardData.length
    };
  }, [selectedPeriod]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    periods,
    ...processedData
  };
}; 