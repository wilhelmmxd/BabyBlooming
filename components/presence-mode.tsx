"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Play, Pause, Square, X } from "lucide-react"
import { usePresence } from "@/lib/presence-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

const AFFIRMATIONS = [
  "Every moment with your child matters.",
  "You're building memories that last a lifetime.",
  "Presence is the greatest gift you can give.",
  "These moments will become your most treasured memories.",
  "Your child feels your love and attention.",
  "Quality time over quantity—you're doing great.",
  "Be here now. That's all that matters.",
  "Your presence is enough.",
]

const PRESETS = [
  { label: "3 min", duration: 3 },
  { label: "10 min", duration: 10 },
  { label: "30 min", duration: 30 },
]

export function PresenceMode() {
  const {
    session,
    isFullscreen,
    startSession,
    pauseSession,
    resumeSession,
    minimizeSession,
    stopSession,
    completeSession,
  } = usePresence()
  const [showDialog, setShowDialog] = useState(false)
  const [customMinutes, setCustomMinutes] = useState(15)
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0])
  const [showComplete, setShowComplete] = useState(false)

  useEffect(() => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartSession = (duration: number) => {
    startSession(duration)
    setShowDialog(false)
  }

  const handleComplete = async () => {
    await completeSession()
    setShowComplete(true)
    setTimeout(() => {
      setShowComplete(false)
    }, 3000)
  }

  // Show full screen for active session (running or paused)
  if (session && !session.isComplete && isFullscreen) {
    const progress = (session.elapsedTime / session.targetDuration) * 100
    const timeRemaining = session.targetDuration - session.elapsedTime

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-ring-presence/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <motion.div
            className="text-center space-y-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Heart className="w-8 h-8 text-ring-presence mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-light text-foreground">Presence Mode</h2>
            <p className="text-sm text-muted-foreground italic">{affirmation}</p>
          </motion.div>

          {/* Circular progress */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="var(--chart-grid)"
                strokeWidth="8"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="oklch(0.75 0.12 55)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <motion.div
              className="text-center"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-6xl font-light text-foreground">{formatTime(timeRemaining)}</span>
              <p className="text-sm text-muted-foreground mt-2">remaining</p>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <Button
              size="icon"
              className="h-14 w-14 rounded-full bg-ring-presence text-background hover:bg-ring-presence/90"
              onClick={session.isRunning ? pauseSession : resumeSession}
              aria-label={session.isRunning ? "Pause" : "Resume"}
            >
              {session.isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={stopSession}
              aria-label="Stop"
            >
              <Square className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={minimizeSession}
              aria-label="Minimize"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center max-w-xs">
            You can exit this screen and the timer will continue running in the background.
          </p>
        </div>
      </div>
    )
  }

  // Show completion overlay
  if (showComplete) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="text-center space-y-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6 }}>
              <Heart className="w-16 h-16 text-ring-presence mx-auto fill-ring-presence" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-foreground">Session Complete!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              You invested quality time with your child. That moment will stay with them forever.
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Show card when no active session
  if (!session) {
    return (
      <>
        <Card
          className="p-4 bg-gradient-to-br from-ring-presence/20 to-ring-presence/5 border-ring-presence/30 cursor-pointer hover:from-ring-presence/25 hover:to-ring-presence/10 transition-colors"
          onClick={() => setShowDialog(true)}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-ring-presence/20">
              <Heart className="w-6 h-6 text-ring-presence" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Presence Mode</h3>
              <p className="text-xs text-muted-foreground">Put your phone away, be present</p>
            </div>
            <Play className="w-5 h-5 text-ring-presence" />
          </div>
        </Card>

        {/* Duration picker dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="w-full max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-ring-presence" />
                Start Presence Mode
              </DialogTitle>
              <DialogDescription>Choose how long you'd like to be fully present with your child.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Quick presets */}
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.duration}
                    variant="secondary"
                    onClick={() => handleStartSession(preset.duration)}
                    className="h-12 text-base"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {/* Custom duration */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-sm font-medium text-foreground">Custom Duration</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring-presence/50"
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
                <Button
                  onClick={() => handleStartSession(customMinutes)}
                  className="w-full bg-ring-presence text-background hover:bg-ring-presence/90"
                >
                  Start {customMinutes} min Session
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Show paused state card
  return (
    <Card className="p-4 bg-gradient-to-br from-ring-presence/20 to-ring-presence/5 border-ring-presence/30">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-ring-presence/20">
          <Heart className="w-6 h-6 text-ring-presence" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Presence Mode</h3>
          <p className="text-xs text-muted-foreground">Paused • {formatTime(session.targetDuration - session.elapsedTime)} remaining</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-ring-presence"
          onClick={resumeSession}
          aria-label="Resume"
        >
          <Play className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  )
}
