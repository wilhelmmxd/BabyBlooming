"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import { auth } from "./firebase"
import { isPlaywrightE2E, PLAYWRIGHT_E2E_UID } from "./e2e-playwright"

interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  sendPasswordReset: (email?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isPlaywrightE2E()) {
      setUser({
        uid: PLAYWRIGHT_E2E_UID,
        email: "e2e@playwright.local",
        emailVerified: true,
      } as User)
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string) => {
    if (isPlaywrightE2E()) return
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const login = async (email: string, password: string) => {
    if (isPlaywrightE2E()) return
    await signInWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = async () => {
    if (isPlaywrightE2E()) return
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    if (isPlaywrightE2E()) return
    await signOut(auth)
  }

  const sendPasswordReset = async (email?: string) => {
    const targetEmail = email ?? auth.currentUser?.email
    if (!targetEmail) {
      throw new Error("No email address available for password reset")
    }

    await sendPasswordResetEmail(auth, targetEmail)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, loginWithGoogle, logout, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
