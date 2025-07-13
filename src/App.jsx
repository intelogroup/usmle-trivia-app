import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import SplashScreen from './components/auth/SplashScreen'
import LoadingIndicator from './components/ui/LoadingIndicator'
import NotificationToast from './components/ui/NotificationToast'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const QuizTab = lazy(() => import('./pages/QuizTab'))
const Profile = lazy(() => import('./pages/Profile'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Learn = lazy(() => import('./pages/Learn'))
const QuickQuiz = lazy(() => import('./pages/QuickQuiz'))
const TimedTest = lazy(() => import('./pages/TimedTest'))
const TimedTestSetup = lazy(() => import('./pages/TimedTestSetup'))
const Results = lazy(() => import('./pages/Results'))
const CustomQuiz = lazy(() => import('./pages/CustomQuiz'))
const CustomQuizSetup = lazy(() => import('./pages/CustomQuizSetup'))
const BlockTest = lazy(() => import('./pages/BlockTest'))
const Login = lazy(() => import('./pages/auth/Login'))
const SignUp = lazy(() => import('./pages/auth/SignUp'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const Welcome = lazy(() => import('./pages/auth/Welcome'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Chat = lazy(() => import('./pages/Chat'))

function App() {
  return (
    <ErrorBoundary>
      <NotificationToast />
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={
          <Suspense fallback={<SplashScreen />}>
            <Login />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<SplashScreen />}>
            <SignUp />
          </Suspense>
        } />
        <Route path="/forgot-password" element={
          <Suspense fallback={<SplashScreen />}>
            <ForgotPassword />
          </Suspense>
        } />
        <Route path="/welcome" element={
          <Suspense fallback={<SplashScreen />}>
            <Welcome />
          </Suspense>
        } />
        
        {/* Legal pages */}
        <Route path="/privacy" element={
          <Suspense fallback={<LoadingIndicator />}>
            <Privacy />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<LoadingIndicator />}>
            <Terms />
          </Suspense>
        } />

        {/* Protected app routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingIndicator />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/quiz" element={<QuizTab />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/quiz/:categoryId" element={<QuickQuiz />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/quick-quiz" element={<QuickQuiz />} />
                  <Route path="/timed-test-setup" element={<TimedTestSetup />} />
                  <Route path="/timed-test" element={<TimedTest />} />
                  <Route path="/custom-quiz-setup" element={<CustomQuizSetup />} />
                  <Route path="/custom-quiz" element={<CustomQuiz />} />
                  <Route path="/block-test" element={<BlockTest />} />
                  <Route path="/results" element={<Results />} />
                </Routes>
              </Suspense>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </ErrorBoundary>
  )
}

export default App