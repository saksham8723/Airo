import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => {
        console.log('Logging in user:', userData)
        set({ user: userData, isAuthenticated: true })
      },
      logout: () => {
        console.log('Logging out user')
        set({ user: null, isAuthenticated: false })
      },
      updateProfile: (profileData) => {
        set((state) => ({
          user: { ...state.user, ...profileData }
        }))
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        console.log('Auth state rehydrated:', state)
      },
    }
  )
)

export { useAuthStore } 