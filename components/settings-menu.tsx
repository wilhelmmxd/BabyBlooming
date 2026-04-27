"use client"

import { useEffect, useMemo, useState } from "react"
import { Cog, MoonStar, Palette, PersonStanding, RotateCcw } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useChildren } from "@/lib/children-context"
import { getAgeInMonths, getGoalsForAge } from "@/lib/caregiving-goals"
import { useSettings, type GoalOverrides } from "@/lib/settings-context"
import { useLogs } from "@/lib/logs-context"
import { useToast } from "@/hooks/use-toast"

function clampGoal(value: number) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(50, Math.round(value)))
}

export function SettingsMenu() {
  const { user, sendPasswordReset } = useAuth()
  const { activeChild } = useChildren()
  const { sleepGoal, feedingGoal, presenceGoal } = useLogs()
  const { getGoalsForChild, setGoalsForChild, resetGoalsForChild } = useSettings()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [sleepInput, setSleepInput] = useState("0")
  const [feedingInput, setFeedingInput] = useState("0")
  const [presenceInput, setPresenceInput] = useState("0")
  const [savingGoals, setSavingGoals] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  const childGoals = useMemo(() => {
    if (!activeChild?.birthDate) return { ...getGoalsForAge(0) }

    return {
      ...getGoalsForAge(getAgeInMonths(activeChild.birthDate)),
    }
  }, [activeChild?.birthDate])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!goalsOpen) return

    const current = activeChild?.id ? getGoalsForChild(activeChild.id) : null
    const nextGoals = current ?? {
      sleepGoal: sleepGoal,
      feedingGoal: feedingGoal,
      presenceGoal: presenceGoal,
    }

    setSleepInput(String(nextGoals.sleepGoal))
    setFeedingInput(String(nextGoals.feedingGoal))
    setPresenceInput(String(nextGoals.presenceGoal))
  }, [goalsOpen, activeChild?.id, getGoalsForChild, sleepGoal, feedingGoal, presenceGoal])

  const handleSaveGoals = async () => {
    if (!activeChild?.id) return

    const nextGoals: GoalOverrides = {
      sleepGoal: clampGoal(Number(sleepInput)),
      feedingGoal: clampGoal(Number(feedingInput)),
      presenceGoal: clampGoal(Number(presenceInput)),
    }

    setSavingGoals(true)
    try {
      setGoalsForChild(activeChild.id, nextGoals)
      toast({
        title: "Goals saved",
        description: `Custom goals updated for ${activeChild.name}.`,
      })
      setGoalsOpen(false)
    } finally {
      setSavingGoals(false)
    }
  }

  const handleResetGoals = () => {
    if (!activeChild?.id) return

    const fallback = getGoalsForAge(activeChild.birthDate ? getAgeInMonths(activeChild.birthDate) : 0)
    resetGoalsForChild(activeChild.id)
    setSleepInput(String(fallback.sleepGoal))
    setFeedingInput(String(fallback.feedingGoal))
    setPresenceInput(String(fallback.playGoal))
    toast({
      title: "Goals reset",
      description: `Age-based goals restored for ${activeChild.name}.`,
    })
  }

  const handleResetPassword = async () => {
    if (!user?.email) return

    setResettingPassword(true)
    try {
      await sendPasswordReset(user.email)
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for a link to reset your password.",
      })
      setProfileOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset email"
      toast({
        title: "Reset failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setResettingPassword(false)
    }
  }

  const currentTheme = mounted ? resolvedTheme ?? theme : "light"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" aria-label="Settings">
            <Cog className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setProfileOpen(true)} className="cursor-pointer">
            <PersonStanding className="w-4 h-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setGoalsOpen(true)} className="cursor-pointer">
            <Palette className="w-4 h-4" />
            Goals
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setThemeOpen(true)} className="cursor-pointer">
            <MoonStar className="w-4 h-4" />
            Theme
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>View your account email and send a password reset link.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground">
                {user?.email || "No email available"}
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              We can’t show or recover your current password. Use the reset link below to create a new one.
            </p>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setProfileOpen(false)}>
              Close
            </Button>
            <Button onClick={handleResetPassword} disabled={!user?.email || resettingPassword}>
              {resettingPassword ? "Sending..." : "Send reset email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Goals</DialogTitle>
            <DialogDescription>
              Set custom daily goals for {activeChild?.name || "the active child"}. These override the age-based defaults.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sleep-goal">Sleep goals</Label>
                <Input
                  id="sleep-goal"
                  type="number"
                  min="0"
                  step="1"
                  value={sleepInput}
                  onChange={(e) => setSleepInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeding-goal">Feeding goals</Label>
                <Input
                  id="feeding-goal"
                  type="number"
                  min="0"
                  step="1"
                  value={feedingInput}
                  onChange={(e) => setFeedingInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="presence-goal">Presence goals</Label>
                <Input
                  id="presence-goal"
                  type="number"
                  min="0"
                  step="1"
                  value={presenceInput}
                  onChange={(e) => setPresenceInput(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-3 text-xs text-muted-foreground leading-relaxed">
              Current age-based suggestion: {childGoals.sleepGoal} sleep, {childGoals.feedingGoal} feeding, {childGoals.playGoal} presence.
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={handleResetGoals} disabled={!activeChild?.id}>
              Reset to age default
            </Button>
            <Button variant="secondary" onClick={() => setGoalsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGoals} disabled={!activeChild?.id || savingGoals}>
              {savingGoals ? "Saving..." : "Save goals"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={themeOpen} onOpenChange={setThemeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Theme</DialogTitle>
            <DialogDescription>Choose between the current warm default and a darker theme.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`rounded-2xl border p-4 text-left transition-colors ${currentTheme === "light" ? "border-primary bg-primary/10" : "border-border bg-card/50 hover:bg-card"}`}
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Default</p>
                <p className="text-xs text-muted-foreground">The current warm, light theme.</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`rounded-2xl border p-4 text-left transition-colors ${currentTheme === "dark" ? "border-primary bg-primary/10" : "border-border bg-card/50 hover:bg-card"}`}
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Dark mode</p>
                <p className="text-xs text-muted-foreground">A deeper theme for low-light use.</p>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setThemeOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
