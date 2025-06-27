import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Hook for smooth view transitions using the View Transition API
 * Falls back gracefully on browsers that don't support it
 */
export const useViewTransitions = () => {
  const navigate = useNavigate()

  const transitionTo = useCallback((path, options = {}) => {
    const { 
      replace = false, 
      state = null,
      transitionName = 'page-transition',
      duration = 300 
    } = options

    // Check if View Transition API is supported
    if (!document.startViewTransition) {
      // Fallback: regular navigation
      navigate(path, { replace, state })
      return
    }

    // Add transition class for styling
    document.documentElement.classList.add(`transition-${transitionName}`)

    // Start view transition
    const transition = document.startViewTransition(() => {
      navigate(path, { replace, state })
    })

    // Clean up transition class when done
    transition.finished.finally(() => {
      document.documentElement.classList.remove(`transition-${transitionName}`)
    })

    return transition
  }, [navigate])

  const transitionToQuiz = useCallback((categoryId, categoryName, options = {}) => {
    return transitionTo('/quiz', {
      state: { categoryId, categoryName, ...options },
      transitionName: 'quiz-enter'
    })
  }, [transitionTo])

  const transitionToHome = useCallback(() => {
    return transitionTo('/', {
      transitionName: 'home-enter'
    })
  }, [transitionTo])

  const transitionToProfile = useCallback(() => {
    return transitionTo('/profile', {
      transitionName: 'profile-enter'
    })
  }, [transitionTo])

  return {
    transitionTo,
    transitionToQuiz,
    transitionToHome,
    transitionToProfile,
    isSupported: !!document.startViewTransition
  }
}

/**
 * Hook for preloading routes and their data
 */
export const useRoutePreloader = () => {
  const preloadRoute = useCallback(async (routePath, preloadData = null) => {
    try {
      // Preload the route component
      switch (routePath) {
        case '/quiz':
          await import('../pages/QuizTab')
          break
        case '/profile':
          await import('../pages/Profile')
          break
        case '/leaderboard':
          await import('../pages/Leaderboard')
          break
        case '/learn':
          await import('../pages/Learn')
          break
        default:
          break
      }

      // Preload data if function provided
      if (preloadData && typeof preloadData === 'function') {
        await preloadData()
      }
    } catch (error) {
      console.warn('Failed to preload route:', routePath, error)
    }
  }, [])

  const preloadQuizTab = useCallback(() => {
    return preloadRoute('/quiz', async () => {
      const { prefetchQueries } = await import('../lib/queryClient')
      prefetchQueries.categories()
    })
  }, [preloadRoute])

  return {
    preloadRoute,
    preloadQuizTab
  }
} 