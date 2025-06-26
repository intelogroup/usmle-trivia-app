import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingIndicator from './components/ui/LoadingIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QuizProvider } from './context/QuizContext';
// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// --- Lazy-loaded Page Components ---

// Main Pages
const Home = lazy(() => import('./pages/Home'));
const QuickQuiz = lazy(() => import('./pages/QuickQuiz'));
const TimedTest = lazy(() => import('./pages/TimedTest'));
const QuizTab = lazy(() => import('./pages/QuizTab'));
const Results = lazy(() => import('./pages/Results'));

// Non-critical Pages
const Profile = lazy(() => import('./pages/Profile'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Learn = lazy(() => import('./pages/Learn'));
const DatabaseTest = lazy(() => import('./pages/DatabaseTest'));

// Auth Pages
const Welcome = lazy(() => import('./pages/auth/Welcome'));
const Login = lazy(() => import('./pages/auth/Login'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Legal Pages
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// Demo/Showcase Pages
const IconShowcase = lazy(() => import('./components/ui/IconShowcase'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-expo-950 scrollbar-hide">
            <Suspense fallback={<LoadingIndicator />}>
              <Routes>
              {/* Public Authentication Routes */}
              <Route path="/auth/welcome" element={<Welcome />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<SignUp />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />

              {/* Legal Pages */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Protected App Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/categories" element={<QuizTab />} />
                      <Route path="/quick-quiz" element={
                        <ErrorBoundary>
                          <QuizProvider><QuickQuiz /></QuizProvider>
                        </ErrorBoundary>
                      } />
                      <Route path="/timed-test" element={
                        <ErrorBoundary>
                          <QuizProvider><TimedTest /></QuizProvider>
                        </ErrorBoundary>
                      } />
                      <Route path="/quiz/:categoryId" element={
                        <ErrorBoundary>
                          <QuizProvider><QuickQuiz /></QuizProvider>
                        </ErrorBoundary>
                      } />
                      <Route path="/quiz" element={
                        <ErrorBoundary>
                          <QuizProvider><QuickQuiz /></QuizProvider>
                        </ErrorBoundary>
                      } />
                      <Route path="/results" element={<Results />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/learn" element={<Learn />} />
                      <Route path="/stats" element={<div className="p-6 text-center text-gray-600 dark:text-gray-300">Stats page coming soon!</div>} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/database-test" element={<DatabaseTest />} />
                      <Route path="/icons" element={<IconShowcase />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Catch all route - redirect to welcome */}
              <Route path="*" element={<Navigate to="/auth/welcome" replace />} />
              </Routes>
            </Suspense>
          </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;