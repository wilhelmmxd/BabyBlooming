"use client"

import { useEffect, useState, type ReactNode } from "react"
import { Moon, Droplets, Baby, Ruler, BookOpen, X, Plus, Minus, AlertCircle, UserRoundPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { AddChildDialog } from "@/components/add-child-dialog"
import { FloatingActionMenu } from "@/components/floating-action-menu"
import { useLogs } from "@/lib/logs-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { DIARY_TAGS, getDiaryTagStyle } from "@/lib/diary-tags"
import { cmToIn, flOzToMl, inToCm, kgToLb, lbToKg, mlToFlOz, roundTo } from "@/lib/measurement"

type LogType = "feeding" | "sleep" | "play" | "growth" | "diary"

interface LogOption {
  type: LogType
  label: string
  icon: typeof Moon
  color: string
  bgColor: string
}

const logOptions: LogOption[] = [
  { type: "feeding", label: "Feeding", icon: Droplets, color: "text-ring-feeding", bgColor: "bg-ring-feeding/10" },
  { type: "sleep", label: "Sleep", icon: Moon, color: "text-ring-sleep", bgColor: "bg-ring-sleep/10" },
  { type: "play", label: "Play", icon: Baby, color: "text-ring-presence", bgColor: "bg-ring-presence/10" },
  { type: "growth", label: "Growth", icon: Ruler, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  { type: "diary", label: "Diary", icon: BookOpen, color: "text-chart-5", bgColor: "bg-chart-5/10" },
]

interface LogDrawerProps {
  trigger?: ReactNode
  initialLog?: { id: string; type: LogType; data: Record<string, unknown> }
}

export function LogDrawer({ trigger, initialLog }: LogDrawerProps) {
  const { user } = useAuth()
  const { addLog, updateLog } = useLogs()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [addChildOpen, setAddChildOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<LogType | null>(initialLog?.type ?? null)
  const [feedingAmount, setFeedingAmount] = useState(4)
  const [sleepStart, setSleepStart] = useState("")
  const [sleepEnd, setSleepEnd] = useState("")
  const [presenceMode, setPresenceMode] = useState(false)
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [diaryNote, setDiaryNote] = useState("")
  const [diaryTags, setDiaryTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const isEdit = Boolean(initialLog)
  const activeType = selectedType ?? initialLog?.type ?? null

  const resetForm = () => {
    setFeedingAmount(4)
    setSleepStart("")
    setSleepEnd("")
    setPresenceMode(false)
    setWeight("")
    setHeight("")
    setDiaryNote("")
    setDiaryTags([])
  }

  useEffect(() => {
    if (!open) return

    if (initialLog) {
      const data = initialLog.data ?? {}
      setSelectedType(initialLog.type)
      setFeedingAmount(roundTo(mlToFlOz(Number(data.amount ?? 120)), 1))
      setSleepStart(String(data.startTime ?? ""))
      setSleepEnd(String(data.endTime ?? ""))
      setPresenceMode(Boolean(data.presenceMode))
      setWeight(data.weight != null ? String(roundTo(kgToLb(Number(data.weight)), 1)) : "")
      setHeight(data.height != null ? String(roundTo(cmToIn(Number(data.height)), 1)) : "")
      setDiaryNote(String(data.note ?? ""))
      setDiaryTags(Array.isArray(data.tags) ? (data.tags as string[]) : [])
      return
    }

    if (selectedType === null) {
      resetForm()
    }
  }, [open, initialLog, selectedType])

  useEffect(() => {
    if (open) {
      setMenuOpen(false)
    }
  }, [open])

  const handleSave = async () => {
    if (!activeType || !user) return

    setValidationError(null)

    // Validation
    let error: string | null = null

    switch (activeType) {
      case "feeding":
        if (feedingAmount < 0 || feedingAmount > 34) {
          error = "Feeding amount must be between 0 and 34 fl oz"
        }
        break
      case "sleep":
        if (!sleepStart.trim() || !sleepEnd.trim()) {
          error = "Both start and end times are required"
        } else if (sleepStart >= sleepEnd) {
          error = "End time must be after start time"
        }
        break
      case "growth":
        if (weight && (parseFloat(weight) < 0 || parseFloat(weight) > 110)) {
          error = "Weight must be between 0 and 110 lb"
        }
        if (height && (parseFloat(height) < 0 || parseFloat(height) > 79)) {
          error = "Height must be between 0 and 79 in"
        }
        if (!weight && !height) {
          error = "At least one measurement (weight or height) is required"
        }
        break
      case "diary":
        if (!diaryNote.trim()) {
          error = "Please write a note for your memory"
        }
        break
    }

    if (error) {
      setValidationError(error)
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      })
      return
    }

    const data: Record<string, unknown> = {}

    switch (activeType) {
      case "feeding":
        data.amount = Math.round(flOzToMl(feedingAmount))
        break
      case "sleep":
        data.startTime = sleepStart
        data.endTime = sleepEnd
        break
      case "play":
        data.presenceMode = presenceMode
        break
      case "growth":
        data.weight = weight ? roundTo(lbToKg(parseFloat(weight)), 2) : 0
        data.height = height ? roundTo(inToCm(parseFloat(height)), 2) : 0
        break
      case "diary":
        data.note = diaryNote
        data.tags = diaryTags
        break
    }

    try {
      setIsSaving(true)
      if (initialLog) {
        await updateLog(initialLog.id, data)
        toast({
          title: "Success",
          description: "Log updated successfully",
        })
      } else {
        await addLog(activeType, data)
        toast({
          title: "Success",
          description: "Log saved successfully",
        })
      }
      resetForm()
      setSelectedType(null)
      setOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save log"
      console.error("Error saving log:", err)
      setValidationError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderLogForm = () => {
    switch (activeType) {
      case "feeding":
        return (
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Amount (fl oz)</Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setFeedingAmount(roundTo(Math.max(0, feedingAmount - 0.5), 1))}
                aria-label="Decrease feeding amount"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <div className="text-4xl font-light text-foreground w-24 text-center">
                {feedingAmount}
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setFeedingAmount(roundTo(feedingAmount + 0.5, 1))}
                aria-label="Increase feeding amount"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )

      case "sleep":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sleep-start" className="text-sm text-muted-foreground">Start Time</Label>
              <Input
                id="sleep-start"
                type="time"
                inputMode="numeric"
                enterKeyHint="next"
                value={sleepStart}
                onChange={(e) => setSleepStart(e.target.value)}
                className="bg-secondary border-0 h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep-end" className="text-sm text-muted-foreground">End Time</Label>
              <Input
                id="sleep-end"
                type="time"
                inputMode="numeric"
                enterKeyHint="done"
                value={sleepEnd}
                onChange={(e) => setSleepEnd(e.target.value)}
                className="bg-secondary border-0 h-12 text-lg"
              />
            </div>
          </div>
        )

      case "play":
        return (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary">
            <div>
              <p className="text-sm font-medium text-foreground">Presence Mode</p>
              <p className="text-xs text-muted-foreground">Start a focused play session</p>
            </div>
            <Switch
              checked={presenceMode}
              onCheckedChange={setPresenceMode}
            />
          </div>
        )

      case "growth":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm text-muted-foreground">Weight (lb)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                inputMode="decimal"
                enterKeyHint="next"
                placeholder="e.g., 16.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-secondary border-0 h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm text-muted-foreground">Height (in)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                inputMode="decimal"
                enterKeyHint="done"
                placeholder="e.g., 26.0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-secondary border-0 h-12 text-lg"
              />
            </div>
          </div>
        )

      case "diary":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diary-note" className="text-sm text-muted-foreground">Note</Label>
              <Textarea
                id="diary-note"
                placeholder="Write about today's moments..."
                value={diaryNote}
                onChange={(e) => setDiaryNote(e.target.value)}
                className="bg-secondary border-0 min-h-24 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diary-tags" className="text-sm text-muted-foreground">Tags</Label>
              <div id="diary-tags" className="flex flex-wrap gap-2">
                {DIARY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setDiaryTags(
                        diaryTags.includes(tag)
                          ? diaryTags.filter((t) => t !== tag)
                          : [...diaryTags, tag]
                      )
                    }}
                    className={`border px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${getDiaryTagStyle(tag, diaryTags.includes(tag))}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return null
  }

  const handleActionSelect = (type: LogType) => {
    setSelectedType(type)
    setOpen(true)
    setMenuOpen(false)
  }

  const triggerContent = trigger ?? null

  const handleAddChildSelect = () => {
    setMenuOpen(false)
    setAddChildOpen(true)
  }

  return (
    <>
      {!triggerContent && (
        <FloatingActionMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          anchorSelector="#bottom-nav"
          anchorPosition="top"
          anchorOffsetY={0}
          actions={[
            { id: "add-child", label: "Child", icon: UserRoundPlus, onClick: handleAddChildSelect },
            { id: "feeding", label: "Feeding", icon: Droplets, onClick: () => handleActionSelect("feeding") },
            { id: "sleep", label: "Sleep", icon: Moon, onClick: () => handleActionSelect("sleep") },
            { id: "play", label: "Play", icon: Baby, onClick: () => handleActionSelect("play") },
            { id: "growth", label: "Growth", icon: Ruler, onClick: () => handleActionSelect("growth") },
            { id: "diary", label: "Diary", icon: BookOpen, onClick: () => handleActionSelect("diary") },
          ]}
        />
      )}
      <AddChildDialog open={addChildOpen} onOpenChange={setAddChildOpen} />
      <Drawer open={open} onOpenChange={setOpen}>
        {triggerContent && (
          <DrawerTrigger asChild>
            {triggerContent}
          </DrawerTrigger>
        )}
        <DrawerContent className="bg-popover border-border">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="relative">
            <DrawerTitle className="text-center text-foreground">
              {activeType
                ? `${isEdit ? "Edit" : "Log"} ${logOptions.find((o) => o.type === activeType)?.label}`
                : "Log Activity"}
            </DrawerTitle>
            {activeType && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
                aria-label="Go back"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <DrawerClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" aria-label="Close log drawer">
              <X className="w-5 h-5" />
            </DrawerClose>
          </DrawerHeader>

          <div className="p-4 pb-8">
            {activeType ? (
              <div className="space-y-6">
                {renderLogForm()}
                {validationError && (
                  <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{validationError}</p>
                  </div>
                )}
                <Button
                  className="w-full h-12 rounded-2xl font-medium"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : isEdit ? "Update Entry" : "Save Entry"}
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Choose an action from the center + menu to start logging.</p>
              </div>
            )}
          </div>
        </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

