// Import custom hooks and components
import { useLearnData } from '../hooks/useLearnData';
import LearnHeader from '../components/learn/LearnHeader';
import CategoriesGrid from '../components/learn/CategoriesGrid';
import StudyMaterialsGrid from '../components/learn/StudyMaterialsGrid';
import ProgressSidebar from '../components/learn/ProgressSidebar';

const Learn = () => {
  // Use custom hook for data management
  const {
    studyMaterials,
    categories,
    progressData,
    recentActivity,
    userStats,
    overallProgress
  } = useLearnData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <LearnHeader userStats={userStats} />

        {/* Desktop Layout: Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content - Study Materials */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Categories */}
            <CategoriesGrid categories={categories} />

            {/* Study Materials Grid */}
            <StudyMaterialsGrid studyMaterials={studyMaterials} />
          </div>

          {/* Right Sidebar - Progress & Stats */}
          <ProgressSidebar 
            progressData={progressData}
            recentActivity={recentActivity}
            overallProgress={overallProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default Learn 