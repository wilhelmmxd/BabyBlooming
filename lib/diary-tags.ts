export const DIARY_TAGS = [
  "Health",
  "Milestone",
  "Appointment",
  "Behavior",
  "Memory",
] as const

export type DiaryTag = (typeof DIARY_TAGS)[number]

const TAG_STYLES: Record<DiaryTag, { base: string; selected: string }> = {
  Health: {
    base: "bg-ring-sleep/15 text-ring-sleep border-ring-sleep/30",
    selected: "bg-ring-sleep/25 text-ring-sleep border-ring-sleep/50",
  },
  Milestone: {
    base: "bg-chart-3/15 text-chart-3 border-chart-3/30",
    selected: "bg-chart-3/25 text-chart-3 border-chart-3/50",
  },
  Appointment: {
    base: "bg-chart-4/15 text-chart-4 border-chart-4/30",
    selected: "bg-chart-4/25 text-chart-4 border-chart-4/50",
  },
  Behavior: {
    base: "bg-chart-5/15 text-chart-5 border-chart-5/30",
    selected: "bg-chart-5/25 text-chart-5 border-chart-5/50",
  },
  Memory: {
    base: "bg-ring-feeding/15 text-ring-feeding border-ring-feeding/30",
    selected: "bg-ring-feeding/25 text-ring-feeding border-ring-feeding/50",
  },
}

export function getDiaryTagStyle(tag: string, active = false) {
  const mappedTag = DIARY_TAGS.includes(tag as DiaryTag) ? (tag as DiaryTag) : null

  if (!mappedTag) {
    return active
      ? "bg-secondary text-secondary-foreground border-border"
      : "bg-secondary/70 text-secondary-foreground border-border"
  }

  return active ? TAG_STYLES[mappedTag].selected : TAG_STYLES[mappedTag].base
}
