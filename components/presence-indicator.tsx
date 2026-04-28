"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePresence } from "@/lib/presence-context"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PresenceIndicator() {
  const { session, pauseSession, resumeSession, stopSession } = usePresence()

  if (!session) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (session.elapsedTime / session.targetDuration) * 100
  const timeRemaining = session.targetDuration - session.elapsedTime

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed bottom-24 right-4 z-40 max-w-xs"
      >
        <div className="bg-card border border-ring-presence/40 rounded-3xl p-3 shadow-lg shadow-ring-presence/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Progress circle */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="var(--chart-grid)"
                  strokeWidth="2"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="oklch(0.75 0.12 55)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <Heart className="absolute inset-0 w-5 h-5 m-auto text-ring-presence" />
            </div>

            {/* Time info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Presence Mode</p>
              <p className="text-lg font-semibold text-foreground">
                {formatTime(timeRemaining)}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-ring-presence hover:bg-ring-presence/10"
                onClick={session.isRunning ? pauseSession : resumeSession}
                aria-label={session.isRunning ? "Pause" : "Resume"}
              >
                {session.isRunning ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={stopSession}
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
