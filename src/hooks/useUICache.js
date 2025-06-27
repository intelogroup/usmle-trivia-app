import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for caching complete UI state for instant page renders
 * Saves both data and UI state to provide immediate visual feedback
 */
export const useUICache = (cacheKey, initialData = null) => {
  const [data, setData] = useState(initialData)
  const [isFromCache, setIsFromCache] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const cacheRef = useRef(null)

  // Load from cache immediately on mount
  useEffect(() => {
    if (!cacheKey) return

    const cached = localStorage.getItem(`ui_cache_${cacheKey}`)
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached)
        const now = Date.now()
        
        // Check if cache is still valid (default: 5 minutes)
        const maxAge = 5 * 60 * 1000 // 5 minutes
        if (now - parsedCache.timestamp < maxAge) {
          setData(parsedCache.data)
          setIsFromCache(true)
          cacheRef.current = parsedCache
        } else {
          // Cache expired, remove it
          localStorage.removeItem(`ui_cache_${cacheKey}`)
        }
      } catch (error) {
        console.warn('Failed to parse UI cache:', error)
        localStorage.removeItem(`ui_cache_${cacheKey}`)
      }
    }
  }, [cacheKey])

  // Function to update data and cache
  const updateData = (newData, metadata = {}) => {
    setData(newData)
    setIsFromCache(false)
    setIsRefreshing(false)

    if (cacheKey && newData) {
      const cacheData = {
        data: newData,
        timestamp: Date.now(),
        metadata: {
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          ...metadata
        }
      }

      try {
        localStorage.setItem(`ui_cache_${cacheKey}`, JSON.stringify(cacheData))
        cacheRef.current = cacheData
      } catch (error) {
        console.warn('Failed to cache UI data:', error)
      }
    }
  }

  // Function to refresh data (sets refreshing state)
  const refreshData = () => {
    setIsRefreshing(true)
  }

  // Function to clear cache
  const clearCache = () => {
    if (cacheKey) {
      localStorage.removeItem(`ui_cache_${cacheKey}`)
      cacheRef.current = null
    }
  }

  // Function to get cache info
  const getCacheInfo = () => {
    if (!cacheRef.current) return null
    
    return {
      age: Date.now() - cacheRef.current.timestamp,
      isExpired: Date.now() - cacheRef.current.timestamp > 5 * 60 * 1000,
      metadata: cacheRef.current.metadata
    }
  }

  return {
    data,
    isFromCache,
    isRefreshing,
    updateData,
    refreshData,
    clearCache,
    getCacheInfo
  }
}

/**
 * Hook specifically for page-level UI caching with loading states
 */
export const usePageCache = (pageKey, userId = null) => {
  const fullCacheKey = userId ? `${pageKey}_${userId}` : pageKey
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const cache = useUICache(fullCacheKey)

  // If we have cached data, we're not loading
  useEffect(() => {
    if (cache.data) {
      setLoading(false)
    }
  }, [cache.data])

  // Function to handle async data fetching with cache
  const fetchWithCache = async (fetchFunction, options = {}) => {
    const { 
      skipCache = false,
      onCacheHit = null,
      onFreshData = null 
    } = options

    try {
      // If we have cache and not skipping, use it immediately
      if (cache.data && !skipCache) {
        setLoading(false)
        setError(null)
        if (onCacheHit) onCacheHit(cache.data)
      } else {
        setLoading(true)
      }

      // Always fetch fresh data in background
      cache.refreshData()
      const freshData = await fetchFunction()
      
      // Update cache and state with fresh data
      cache.updateData(freshData, {
        fetchedAt: new Date().toISOString(),
        pageKey,
        userId
      })
      
      setLoading(false)
      setError(null)
      
      if (onFreshData) onFreshData(freshData)
      
      return freshData
    } catch (err) {
      setError(err.message || 'An error occurred')
      setLoading(false)
      throw err
    }
  }

  return {
    ...cache,
    loading,
    error,
    fetchWithCache,
    setLoading,
    setError
  }
} 