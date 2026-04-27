"use client"

import { useMemo } from "react"
import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useChildren } from "@/lib/children-context"
import { getAgeInMonths } from "@/lib/caregiving-goals"
import { DISCOVER_AGE_BANDS, getDiscoverAgeBand, getDiscoverTipIndex } from "@/lib/discover-tips"

function getDaySeed() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const dayMs = 24 * 60 * 60 * 1000

  return Math.floor((now.getTime() - startOfYear.getTime()) / dayMs)
}

export function TipsForToday() {
  const { children } = useChildren()

  const tipCards = useMemo(() => {
    const daySeed = getDaySeed()
    const bandMap = new Map<string, { bandId: string; label: string; accentClass: string; childNames: string[] }>()

    for (const child of children) {
      if (!child.birthDate) continue

      const ageInMonths = getAgeInMonths(child.birthDate)
      const band = getDiscoverAgeBand(ageInMonths)
      if (!band) continue

      const existing = bandMap.get(band.id)
      if (existing) {
        if (!existing.childNames.includes(child.name)) {
          existing.childNames.push(child.name)
        }
        continue
      }

      bandMap.set(band.id, {
        bandId: band.id,
        label: band.label,
        accentClass: band.accentClass,
        childNames: [child.name],
      })
    }

    return Array.from(bandMap.values()).map((entry) => {
      const band = DISCOVER_AGE_BANDS.find((item) => item.id === entry.bandId)
      if (!band) return null

      const tipIndex = getDiscoverTipIndex(daySeed, band.id, band.tips.length)
      return {
        ...entry,
        tip: band.tips[tipIndex],
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)
  }, [children])

  const hasBirthDates = children.some((child) => child.birthDate)

  if (!hasBirthDates) {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Tips for Today
        </h3>
        <div className="p-4 rounded-2xl bg-card/60 border border-border text-sm text-muted-foreground">
          Add a birth date to a child profile to unlock age-specific tips here.
        </div>
        <p className="px-1 text-[10px] leading-relaxed text-muted-foreground/70">
          These tips are for general informational purposes only and are not medical advice. If you have concerns about your child’s health, please contact a pediatrician or other qualified professional.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Tips for Today
      </h3>

      <div className="space-y-3">
        {tipCards.length > 0 ? (
          tipCards.map((card) => (
            <Card
              key={`${card.bandId}-${card.tip.title}`}
              className={`p-4 rounded-2xl bg-gradient-to-br ${card.accentClass}`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {card.label}
                    </p>
                    <h4 className="text-sm font-semibold text-foreground mt-1">{card.tip.title}</h4>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {card.childNames.length === 1 ? card.childNames[0] : `${card.childNames.length} children`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.tip.body}</p>
              </div>
            </Card>
          ))
        ) : (
          <div className="p-4 rounded-2xl bg-card/60 border border-border text-sm text-muted-foreground">
            No age-matched tips available yet.
          </div>
        )}
      </div>

      <p className="px-1 text-[10px] leading-relaxed text-muted-foreground/70">
        These tips are for general informational purposes only and are not medical advice. If you have concerns about your child’s health, please contact a pediatrician or other qualified professional.
      </p>
    </section>
  )
}
