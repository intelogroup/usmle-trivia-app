const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  debug: (message, data = null) => {
    if (isDevelopment) {
      if (data) {
        console.log(`🔍 ${message}`, data)
      } else {
        console.log(`🔍 ${message}`)
      }
    }
  },
  
  info: (message, data = null) => {
    if (isDevelopment) {
      if (data) {
        console.log(`ℹ️ ${message}`, data)
      } else {
        console.log(`ℹ️ ${message}`)
      }
    }
  },
  
  warn: (message, data = null) => {
    if (data) {
      console.warn(`⚠️ ${message}`, data)
    } else {
      console.warn(`⚠️ ${message}`)
    }
  },
  
  error: (message, data = null) => {
    if (data) {
      console.error(`❌ ${message}`, data)
    } else {
      console.error(`❌ ${message}`)
    }
  },
  
  success: (message, data = null) => {
    if (isDevelopment) {
      if (data) {
        console.log(`✅ ${message}`, data)
      } else {
        console.log(`✅ ${message}`)
      }
    }
  }
} 