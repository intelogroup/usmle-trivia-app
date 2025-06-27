import { useState, useMemo } from 'react';
import { FileText, Video, Headphones, BookOpen, Brain, Book, TrendingUp, Award } from 'lucide-react';

// Static data - could be replaced with API calls
const STUDY_MATERIALS = [
  {
    id: 1,
    title: 'USMLE Step 1 Complete Guide',
    type: 'PDF Guide',
    icon: FileText,
    duration: '45 min read',
    rating: 4.8,
    color: 'bg-gradient-to-br from-primary-500 to-secondary-600',
    description: 'Comprehensive preparation guide covering all major topics',
    chapters: 12,
    lastAccessed: '2 days ago'
  },
  {
    id: 2,
    title: 'Cardiology Video Series',
    type: 'Video Course',
    icon: Video,
    duration: '2.5 hours',
    rating: 4.9,
    color: 'bg-gradient-to-br from-red-500 to-pink-600',
    description: 'In-depth video lectures on cardiovascular medicine',
    chapters: 8,
    lastAccessed: 'Yesterday'
  },
  {
    id: 3,
    title: 'Pharmacology Audio Notes',
    type: 'Audio Course',
    icon: Headphones,
    duration: '3 hours',
    rating: 4.7,
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    description: 'Audio lessons covering essential drug mechanisms',
    chapters: 15,
    lastAccessed: '1 week ago'
  },
  {
    id: 4,
    title: 'Medical Terminology',
    type: 'Interactive',
    icon: BookOpen,
    duration: '1.5 hours',
    rating: 4.6,
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    description: 'Master medical terminology with interactive exercises',
    chapters: 10,
    lastAccessed: '3 days ago'
  },
  {
    id: 5,
    title: 'Neurology Case Studies',
    type: 'Case Study',
    icon: Brain,
    duration: '2 hours',
    rating: 4.8,
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    description: 'Real patient cases for clinical reasoning practice',
    chapters: 20,
    lastAccessed: '5 days ago'
  },
  {
    id: 6,
    title: 'Anatomy 3D Models',
    type: 'Interactive',
    icon: Book,
    duration: '1 hour',
    rating: 4.9,
    color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    description: 'Interactive 3D anatomical models and quizzes',
    chapters: 25,
    lastAccessed: 'Never'
  }
];

const CATEGORIES = [
  {
    name: 'High Yield Topics',
    icon: TrendingUp,
    count: 24,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Most frequently tested topics'
  },
  {
    name: 'Practice Exams',
    icon: FileText,
    count: 12,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Full-length mock exams'
  },
  {
    name: 'Study Guides',
    icon: BookOpen,
    count: 18,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Comprehensive review materials'
  },
  {
    name: 'Achievement Badges',
    icon: Award,
    count: 6,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Track your milestones'
  }
];

const PROGRESS_DATA = [
  { subject: 'Cardiology', progress: 75, color: 'from-red-500 to-pink-600', trend: '+5%' },
  { subject: 'Pharmacology', progress: 60, color: 'from-green-500 to-emerald-600', trend: '+12%' },
  { subject: 'Anatomy', progress: 40, color: 'from-purple-500 to-indigo-600', trend: '+3%' },
  { subject: 'Pathology', progress: 85, color: 'from-blue-500 to-cyan-600', trend: '+8%' },
  { subject: 'Biochemistry', progress: 55, color: 'from-yellow-500 to-orange-600', trend: '+15%' }
];

const RECENT_ACTIVITY = [
  { 
    activity: 'Completed Cardiology Ch. 5', 
    time: '2 hours ago', 
    color: 'bg-green-500' 
  },
  { 
    activity: 'Started Pharmacology Audio', 
    time: 'Yesterday', 
    color: 'bg-blue-500' 
  },
  { 
    activity: 'Achieved 7-day streak!', 
    time: '3 days ago', 
    color: 'bg-purple-500' 
  }
];

export const useLearnData = () => {
  const [filter, setFilter] = useState('all');

  // User statistics
  const userStats = useMemo(() => ({
    hoursStudied: 156,
    coursesStarted: 42,
    coursesCompleted: 12
  }), []);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalProgress = PROGRESS_DATA.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / PROGRESS_DATA.length);
  }, []);

  // Filter study materials based on current filter
  const filteredMaterials = useMemo(() => {
    if (filter === 'all') return STUDY_MATERIALS;
    return STUDY_MATERIALS.filter(material => 
      material.type.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  return {
    // Data
    studyMaterials: filteredMaterials,
    categories: CATEGORIES,
    progressData: PROGRESS_DATA,
    recentActivity: RECENT_ACTIVITY,
    userStats,
    overallProgress,
    
    // Filter state
    filter,
    setFilter
  };
}; 