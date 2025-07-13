import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import AuthErrorBoundary from './components/auth/AuthErrorBoundary'
import QueryErrorBoundary from './components/ui/QueryErrorBoundary'
import QuizErrorBoundary from './components/quiz/QuizErrorBoundary'
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
          <AuthErrorBoundary authFlow="login">
            <Suspense fallback={<SplashScreen />}>
              <Login />
            </Suspense>
          </AuthErrorBoundary>
        } />
        <Route path="/signup" element={
          <AuthErrorBoundary authFlow="signup">
            <Suspense fallback={<SplashScreen />}>
              <SignUp />
            </Suspense>
          </AuthErrorBoundary>
        } />
        <Route path="/forgot-password" element={
          <AuthErrorBoundary authFlow="forgot-password">
            <Suspense fallback={<SplashScreen />}>
              <ForgotPassword />
            </Suspense>
          </AuthErrorBoundary>
        } />
        <Route path="/welcome" element={
          <AuthErrorBoundary authFlow="welcome">
            <Suspense fallback={<SplashScreen />}>
              <Welcome />
            </Suspense>
          </AuthErrorBoundary>
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
            <QueryErrorBoundary queryType="app-data">
              <Layout>
                <Suspense fallback={<LoadingIndicator />}>
                  <Routes>
                    <Route path="/" element={
                      <QueryErrorBoundary queryType="home-data">
                        <Home />
                      </QueryErrorBoundary>
                    } />
                    <Route path="/quiz" element={
                      <QueryErrorBoundary queryType="quiz-categories">
                        <QuizTab />
                      </QueryErrorBoundary>
                    } />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/quiz/:categoryId" element={
                      <QuizErrorBoundary quizType="quick-quiz">
                        <QuickQuiz />
                      </QuizErrorBoundary>
                    } />
                    <Route path="/profile" element={
                      <QueryErrorBoundary queryType="profile-data">
                        <Profile />
                      </QueryErrorBoundary>
                    } />
                    <Route path="/leaderboard" element={
                      <QueryErrorBoundary queryType="leaderboard-data">
                        <Leaderboard />
                      </QueryErrorBoundary>
                    } />
                    <Route path="/learn" element={
                      <QueryErrorBoundary queryType="learn-content">
                        <Learn />
                      </QueryErrorBoundary>
                    } />
                    <Route path="/quick-quiz" element={
                      <QuizErrorBoundary quizType="quick-quiz">
                        <QuickQuiz />
                      </QuizErrorBoundary>
                    } />
                    <Route path="/timed-test-setup" element={
                      <QuizErrorBoundary quizType="timed-test-setup">
                        <TimedTestSetup />
                      </QuizErrorBoundary>
                    } />
                    <Route path="/timed-test" element={
                      <QuizErrorBoundary quizType="timed-test">
                        <TimedTest />
                      </QuizErrorBoundary>
                    } />
                    <Route path="/custom-quiz" element={
                      <QuizErrorBoundary quizType="custom-quiz">
                        <CustomQuiz />
                      </QuizErrorBoundary>
                    } />
                    <Route path="/block-test" element={
                      <QuizErrorBoundary quizType="block-test">
                        <BlockTest />
                      </QuizErrorBoundary>
                    } />
                    <Route path="/results" element={
                      <QuizErrorBoundary quizType="results">
                        <Results />
                      </QuizErrorBoundary>
                    } />
                  </Routes>
                </Suspense>
              </Layout>
            </QueryErrorBoundary>
          </ProtectedRoute>
        } />
      </Routes>
    </ErrorBoundary>
  )
}

export default App