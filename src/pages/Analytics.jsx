import React from 'react';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

/**
 * Analytics Page Component
 * Displays comprehensive user analytics and performance metrics
 */
const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;