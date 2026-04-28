"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useLogs } from "./logs-context"
import { useChildren } from "./children-context"

interface PresenceSession {
  id: string
  startTime: Date
  targetDuration: number // in seconds
  elapsedTime: number // in seconds
  isRunning: boolean
  isComplete: boolean
}

interface PresenceContextType {
  session: PresenceSession | null
  startSession: (durationMinutes: number) => void
  pauseSession: () => void
  resumeSession: () => void
  stopSession: () => void
  completeSession: () => Promise<void>
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined)

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<PresenceSession | null>(null)
  const { addLog } = useLogs()
  const { activeChild } = useChildren()

  const startSession = useCallback((durationMinutes: number) => {
    const newSession: PresenceSession = {
      id: `presence-${Date.now()}`,
      startTime: new Date(),
      targetDuration: durationMinutes * 60,
      elapsedTime: 0,
      isRunning: true,
      isComplete: false,
    }
    setSession(newSession)
  }, [])

  const pauseSession = useCallback(() => {
    setSession((prev) => prev ? { ...prev, isRunning: false } : null)
  }, [])

  const resumeSession = useCallback(() => {
    setSession((prev) => prev ? { ...prev, isRunning: true } : null)
  }, [])

  const stopSession = useCallback(() => {
    setSession(null)
  }, [])

  const completeSession = useCallback(async () => {
    if (!session || !activeChild) return

    try {
      // Log as a play/presence activity
      await addLog("play", {
        presenceMode: true,
        duration: session.targetDuration,
        elapsedTime: session.elapsedTime,
        completedAt: new Date().toISOString(),
      })
      setSession((prev) =>
        prev ? { ...prev, isRunning: false, isComplete: true } : null
      )
    } catch (error) {
      console.error("Failed to log presence session:", error)
    }
  }, [session, activeChild, addLog])

  // Timer loop
  useEffect(() => {
    if (!session || !session.isRunning) return

    const interval = setInterval(() => {
      setSession((prev) => {
        if (!prev) return null

        const newElapsed = prev.elapsedTime + 1
        const isComplete = newElapsed >= prev.targetDuration

        if (isComplete) {
          // Auto-complete when time is up
          completeSession()
        }

        return {
          ...prev,
          elapsedTime: newElapsed,
          isComplete,
          isRunning: !isComplete,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session?.isRunning, completeSession])

  return (
    <PresenceContext.Provider
      value={{
        session,
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        completeSession,
      }}
    >
      {children}
    </PresenceContext.Provider>
  )
}

export function usePresence() {
  const context = useContext(PresenceContext)
  if (context === undefined) {
    throw new Error("usePresence must be used within PresenceProvider")
  }
  return context
}
