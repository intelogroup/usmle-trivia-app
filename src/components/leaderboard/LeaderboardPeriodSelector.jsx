const LeaderboardPeriodSelector = ({ 
  periods, 
  selectedPeriod, 
  onPeriodChange 
}) => {
  return (
    <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 w-full md:w-auto">
      {periods.map(period => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
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
  );
};

export default LeaderboardPeriodSelector; 