import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { authApi } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  plan: string
  credits_remaining: number
  onboarding_completed?: boolean
  onboarding_data?: Record<string, string>
  diagnosis_completed?: boolean
  xp?: number
  level?: number
  badges?: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const fetchAttempts = useRef(0)
  const maxFetchAttempts = 3

  const fetchUser = useCallback(async (savedToken: string, retry = true): Promise<boolean> => {
    try {
      const response = await authApi.me(savedToken)
      setUser(response.user)
      fetchAttempts.current = 0 // Reset on success
      return true
    } catch (error: any) {
      // Only clear token on definitive auth failures, not on network errors
      const status = error?.response?.status
      
      if (status === 401) {
        // Token is definitely invalid
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        return false
      }
      
      // Network error or server error - retry if possible
      if (retry && fetchAttempts.current < maxFetchAttempts) {
        fetchAttempts.current++
        console.warn(`Auth fetch failed (attempt ${fetchAttempts.current}/${maxFetchAttempts}), retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * fetchAttempts.current))
        return fetchUser(savedToken, fetchAttempts.current < maxFetchAttempts)
      }
      
      // After max retries, preserve the token but clear user (will retry on next navigation)
      console.warn('Auth fetch failed after retries, preserving session')
      return false
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        await fetchUser(savedToken)
      }
      setLoading(false)
    }
    initAuth()
  }, [fetchUser])
  
  // Periodic session refresh - every 5 minutes if user is logged in
  useEffect(() => {
    if (!token || !user) return
    
    const refreshInterval = setInterval(async () => {
      const currentToken = localStorage.getItem('token')
      if (currentToken) {
        await fetchUser(currentToken, false) // Don't retry on periodic refresh
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(refreshInterval)
  }, [token, user, fetchUser])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setUser(response.user)
    return response // Retorna response para verificar diagnosis_completed no Login
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register({ email, password, name })
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setUser(response.user)
  }

  const logout = async () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const refetchUser = async () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      await fetchUser(savedToken)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
