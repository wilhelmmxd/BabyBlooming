"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

export interface GoalOverrides {
  sleepGoal: number
  feedingGoal: number
  presenceGoal: number
}

type GoalOverridesByChild = Record<string, GoalOverrides>

interface SettingsContextType {
  goalOverridesByChild: GoalOverridesByChild
  getGoalsForChild: (childId: string) => GoalOverrides | null
  setGoalsForChild: (childId: string, goals: GoalOverrides) => void
  resetGoalsForChild: (childId: string) => void
}

const STORAGE_KEY = "baby-blooming-goal-overrides"

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

function readStoredGoals(): GoalOverridesByChild {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as GoalOverridesByChild
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [goalOverridesByChild, setGoalOverridesByChild] = useState<GoalOverridesByChild>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setGoalOverridesByChild(readStoredGoals())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goalOverridesByChild))
  }, [goalOverridesByChild, hydrated])

  const value = useMemo<SettingsContextType>(() => {
    return {
      goalOverridesByChild,
      getGoalsForChild: (childId: string) => goalOverridesByChild[childId] || null,
      setGoalsForChild: (childId: string, goals: GoalOverrides) => {
        setGoalOverridesByChild((current) => ({
          ...current,
          [childId]: goals,
        }))
      },
      resetGoalsForChild: (childId: string) => {
        setGoalOverridesByChild((current) => {
          if (!(childId in current)) return current

          const next = { ...current }
          delete next[childId]
          return next
        })
      },
    }
  }, [goalOverridesByChild])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}
