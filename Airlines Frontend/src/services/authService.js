import axios from 'axios'

const API_URL = 'http://localhost:8080/api'

// Configure axios defaults
axios.defaults.withCredentials = true
axios.defaults.headers.common['Content-Type'] = 'application/json'

export const signup = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      email,
      password
    })
    return response.data
  } catch (error) {
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message
      if (errorMessage.includes('EMAIL_EXISTS')) {
        throw new Error('An account with this email already exists.')
      } else if (errorMessage.includes('INVALID_EMAIL')) {
        throw new Error('Please enter a valid email address.')
      } else if (errorMessage.includes('WEAK_PASSWORD')) {
        throw new Error('Password should be at least 6 characters long.')
      } else if (errorMessage.includes('MISSING_PASSWORD')) {
        throw new Error('Password is required.')
      } else if (errorMessage.includes('MISSING_EMAIL')) {
        throw new Error('Email is required.')
      } else {
        throw new Error('Registration failed. Please try again.')
      }
    } else {
      throw new Error('Registration failed. Please try again.')
    }
  }
}

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    })
    return response.data
  } catch (error) {
    // Handle the specific error response format from the backend
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message
      if (errorMessage.includes('INVALID_LOGIN_CREDENTIALS')) {
        throw new Error('Invalid email or password. Please try again.')
      } else if (errorMessage.includes('EMAIL_NOT_FOUND')) {
        throw new Error('No account found with this email address.')
      } else if (errorMessage.includes('INVALID_PASSWORD')) {
        throw new Error('Incorrect password. Please try again.')
      } else {
        throw new Error('Login failed. Please try again.')
      }
    } else {
      throw new Error('Login failed. Please try again.')
    }
  }
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
} 