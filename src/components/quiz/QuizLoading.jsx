
import { Wifi } from 'lucide-react';

const QuizLoading = ({ isFetching }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Loading quiz questions...</p>
      {isFetching && <p className="text-sm text-gray-500">Fetching latest questions <Wifi size={16} className="inline-block animate-pulse" /></p>}
    </div>
  );
};

export default QuizLoading;
