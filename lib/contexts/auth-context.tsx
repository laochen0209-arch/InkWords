"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getUserData, setUserData } from "@/lib/user-data"

interface User {
  name?: string
  avatar?: string
  id?: string
}

interface AuthContextType {
  user: User | null
  updateUserProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = getUserData()
    if (userData) {
      setUser({
        name: userData.nickname,
        avatar: userData.avatarUrl,
        id: userData.userId
      })
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "inkwords_user_data") {
        const userData = getUserData()
        if (userData) {
          setUser({
            name: userData.nickname,
            avatar: userData.avatarUrl,
            id: userData.userId
          })
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const updateUserProfile = (data: Partial<User>) => {
    setUser(prev => {
      const updated = { ...prev, ...data }
      setUserData(updated)
      return updated
    })
  }

  const value: AuthContextType = {
    user,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
