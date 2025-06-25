import DatabaseTest from '../components/test/DatabaseTest';

const DatabaseTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Database Connection Test</h1>
        <DatabaseTest />
      </div>
    </div>
  );
};

export default DatabaseTestPage; 