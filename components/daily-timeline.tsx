"use client"

import { Moon, Droplets, Baby, Ruler, BookOpen, Pencil, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogDrawer } from "@/components/log-drawer"
import { useLogs } from "@/lib/logs-context"

export interface TimelineEntry {
  id: string
  type: "sleep" | "feeding" | "play" | "growth" | "diary"
  title: string
  time: string
  details?: string
  tags?: string[]
  rawData?: Record<string, unknown>
}

const typeConfig = {
  sleep: {
    icon: Moon,
    color: "text-ring-sleep",
    bgColor: "bg-ring-sleep/10",
    borderColor: "border-ring-sleep/30"
  },
  feeding: {
    icon: Droplets,
    color: "text-ring-feeding",
    bgColor: "bg-ring-feeding/10",
    borderColor: "border-ring-feeding/30"
  },
  play: {
    icon: Baby,
    color: "text-ring-presence",
    bgColor: "bg-ring-presence/10",
    borderColor: "border-ring-presence/30"
  },
  growth: {
    icon: Ruler,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/30"
  },
  diary: {
    icon: BookOpen,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    borderColor: "border-chart-5/30"
  }
}

interface DailyTimelineProps {
  entries: TimelineEntry[]
}

export function DailyTimeline({ entries }: DailyTimelineProps) {
  const { deleteLog } = useLogs()

  const handleDelete = async (logId: string) => {
    const confirmed = window.confirm("Delete this activity?")
    if (!confirmed) return
    await deleteLog(logId)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground px-1">Today&apos;s Activity</h3>
      <div className="space-y-2">
        {entries.length === 0 ? (
          <Card className="p-8 border-dashed border-muted-foreground/30 bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="p-3 rounded-full bg-muted-foreground/10 mb-3">
              <Moon className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground text-center">No activities logged yet</p>
            <p className="text-xs text-muted-foreground/70 text-center mt-1">Start tracking your child&apos;s day</p>
          </Card>
        ) : (
          entries.map((entry, index) => {
            const config = typeConfig[entry.type]
            const Icon = config.icon

            return (
              <Card
                key={entry.id}
                className={`p-3 border ${config.borderColor} bg-card/50 backdrop-blur-sm transition-all hover:bg-card/80`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${config.bgColor}`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{entry.title}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{entry.time}</span>
                        <LogDrawer
                          trigger={
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" aria-label="Edit activity">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          }
                          initialLog={{
                            id: entry.id,
                            type: entry.type,
                            data: entry.rawData ?? {},
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-muted-foreground"
                          onClick={() => handleDelete(entry.id)}
                          aria-label="Delete activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {entry.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.details}</p>
                    )}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-secondary text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
