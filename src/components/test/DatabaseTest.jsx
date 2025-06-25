import { useState, useEffect } from 'react';
import { QuestionService } from '../../services/questionService';
import { testConnection } from '../../lib/supabase';

const DatabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runTests = async () => {
      try {
        // Test 1: Basic connection
        console.log('Testing database connection...');
        const connectionTest = await testConnection();
        setConnectionStatus(connectionTest);

        if (!connectionTest.success) {
          throw new Error(connectionTest.message);
        }

        // Test 2: Fetch categories
        console.log('Testing categories fetch...');
        const categoriesData = await QuestionService.fetchCategories();
        setCategories(categoriesData);
        console.log('Categories fetched:', categoriesData.length);

        // Test 3: Fetch sample questions
        if (categoriesData.length > 0) {
          console.log('Testing questions fetch...');
          const questionsData = await QuestionService.fetchQuestions('mixed', 5);
          setQuestions(questionsData);
          console.log('Questions fetched:', questionsData.length);
        }

      } catch (err) {
        console.error('Database test error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-bold mb-4">Testing Database Connection...</h3>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <h3 className="text-lg font-bold mb-4">Database Connection Test</h3>
      
      {/* Connection Status */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Connection Status:</h4>
        <div className={`p-3 rounded ${connectionStatus?.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connectionStatus?.message || 'Unknown'}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-red-600">Error:</h4>
          <div className="p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Categories Test */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Categories ({categories.length}):</h4>
        <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded">
          {categories.length > 0 ? (
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id} className="text-sm">
                  <span className="font-medium">{category.name}</span> 
                  <span className="text-gray-600"> ({category.type})</span>
                  {category.question_tags && (
                    <span className="text-blue-600"> - {category.question_tags.length} questions</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No categories found</p>
          )}
        </div>
      </div>

      {/* Questions Test */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Sample Questions ({questions.length}):</h4>
        <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded">
          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-2">
                  <p className="text-sm font-medium">
                    Q{index + 1}: {question.question_text.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-600">
                    Difficulty: {question.difficulty} | 
                    Correct Answer: {question.correct_option_id} |
                    Options: {question.options?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No questions found</p>
          )}
        </div>
      </div>

      {/* Success Summary */}
      {connectionStatus?.success && categories.length > 0 && questions.length > 0 && (
        <div className="bg-green-100 text-green-800 p-4 rounded">
          <h4 className="font-semibold">✅ All Tests Passed!</h4>
          <p className="text-sm mt-1">
            Database is properly connected and questions are being fetched successfully.
          </p>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest; 