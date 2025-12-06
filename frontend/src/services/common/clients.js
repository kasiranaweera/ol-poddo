/**
 * Common HTTP Clients for API requests
 * Provides both authenticated (privateClient) and unauthenticated (publicClient) HTTP clients
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Extract error message from response
 */
function extractErrorMessage(data) {
  if (data.detail) {
    if (typeof data.detail === 'string') {
      return data.detail
    } else if (Array.isArray(data.detail)) {
      return data.detail.map(err => {
        if (typeof err === 'object' && err.msg) {
          return `${err.loc?.join('.')?.[1] || ''}: ${err.msg}`.trim()
        }
        return 'Validation error'
      }).join('; ')
    } else if (typeof data.detail === 'object' && data.detail.msg) {
      return data.detail.msg
    }
  } else if (data.message) {
    return data.message
  }
  return 'An error occurred'
}

/**
 * Private Client - For authenticated requests
 */
class PrivateClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken() {
    return localStorage.getItem('accessToken')
  }

  /**
   * Get stored refresh token from localStorage
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  /**
   * Store tokens in localStorage
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  /**
   * Clear tokens from localStorage
   */
  clearTokens() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  /**
   * Generic request method with authentication
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      ...options.headers,
    }

    // Only set Content-Type if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Add authorization header
    const token = this.getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.debug(`[API] Auth token found for request to ${endpoint}`)
    } else {
      console.warn(`[API] No auth token found for request to ${endpoint}`)
    }

    console.debug(`[API] ${options.method || 'GET'} ${url}`)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      let data = null
      
      // Try to parse response as JSON
      try {
        data = await response.json()
      } catch (parseError) {
        // If JSON parsing fails, use response text
        console.warn(`Failed to parse JSON response for ${endpoint}:`, parseError)
        data = { detail: await response.text() || 'Unknown error' }
      }

      if (!response.ok) {
        const errorMessage = extractErrorMessage(data)
        console.error(`[API] Error [${endpoint}] (${response.status}):`, errorMessage)
        throw new Error(errorMessage)
      }

      console.debug(`[API] Success [${endpoint}] (${response.status})`)
      return data
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error(`[API] Network Error [${endpoint}]: Failed to fetch - check CORS and server availability`)
        throw new Error('Network error: Unable to reach the server. Please check your internet connection and ensure the server is running.')
      }
      console.error(`[API] Error [${endpoint}]:`, error.message)
      throw error
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  post(endpoint, body, options = {}) {
    // Handle FormData (for file uploads)
    let requestBody = body
    if (!(body instanceof FormData)) {
      requestBody = JSON.stringify(body)
    }
    
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: requestBody,
    })
  }

  /**
   * PUT request
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAccessToken()
  }

  /**
   * Get stored user data
   */
  getStoredUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}

/**
 * Public Client - For unauthenticated requests
 */
class PublicClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Generic request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(extractErrorMessage(data))
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  /**
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  /**
   * PUT request
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// Create singleton instances
export const privateClient = new PrivateClient()
export const publicClient = new PublicClient()

export { PrivateClient, PublicClient }
