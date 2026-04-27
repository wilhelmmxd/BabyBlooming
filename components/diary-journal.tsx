"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogDrawer } from "@/components/log-drawer"
import { useLogs } from "@/lib/logs-context"
import { BookOpen, Calendar, ChevronRight, Filter, Pencil, Trash2, X } from "lucide-react"
import { DIARY_TAGS, getDiaryTagStyle } from "@/lib/diary-tags"

export interface DiaryEntry {
  id: string
  date: string
  title: string
  preview: string
  note: string
  tags: string[]
  rawData?: Record<string, unknown>
}

interface DiaryJournalProps {
  entries: DiaryEntry[]
}

export function DiaryJournal({ entries }: DiaryJournalProps) {
  const { deleteLog } = useLogs()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const availableTags = useMemo(() => {
    const tagsInEntries = new Set<string>()
    entries.forEach((entry) => entry.tags.forEach((tag) => tagsInEntries.add(tag)))
    return DIARY_TAGS.filter((tag) => tagsInEntries.has(tag))
  }, [entries])

  const filteredEntries = useMemo(() => {
    if (!selectedTag) return entries
    return entries.filter((entry) => entry.tags.includes(selectedTag))
  }, [entries, selectedTag])

  const handleDelete = async (logId: string) => {
    const confirmed = window.confirm("Delete this diary entry?")
    if (!confirmed) return
    await deleteLog(logId)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Journal
        </h3>
        <div className="flex items-center gap-2">
          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1 rounded-full border border-border bg-card/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" aria-label="Filter diary entries">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setSelectedTag(null)} className="cursor-pointer">
                All entries
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {availableTags.map((tag) => (
                <DropdownMenuItem key={tag} onClick={() => setSelectedTag(tag)} className="cursor-pointer">
                  {tag}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        <button
          type="button"
          onClick={() => setSelectedTag(null)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selectedTag === null ? "bg-primary text-primary-foreground border-primary" : "bg-card/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}
        >
          All
        </button>
        {availableTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setSelectedTag((current) => (current === tag ? null : tag))}
            className={`border px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${getDiaryTagStyle(tag, selectedTag === tag)}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredEntries.length === 0 ? (
          <Card className="p-8 border-dashed border-muted-foreground/30 bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="p-3 rounded-full bg-muted-foreground/10 mb-3">
              <BookOpen className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground text-center">
              {selectedTag ? `No journal entries with the ${selectedTag} tag` : "No journal entries yet"}
            </p>
            <p className="text-xs text-muted-foreground/70 text-center mt-1">
              {selectedTag ? "Try another tag or clear the filter" : "Save precious moments and memories"}
            </p>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground mb-1">{entry.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{entry.preview}</p>
                  {entry.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${getDiaryTagStyle(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                  <LogDrawer
                    trigger={
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" aria-label="Edit journal entry">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    }
                    initialLog={{
                      id: entry.id,
                      type: "diary",
                      data: entry.rawData ?? { note: entry.note, tags: entry.tags },
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground"
                    onClick={() => handleDelete(entry.id)}
                    aria-label="Delete journal entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
