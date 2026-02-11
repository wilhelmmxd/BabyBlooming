"use client"

import { useState } from "react"
import { ParentingRings } from "@/components/parenting-rings"
import { DailyTimeline, type TimelineEntry } from "@/components/daily-timeline"
import { GrowthChart, type GrowthDataPoint } from "@/components/growth-chart"
import { DiaryJournal, type DiaryEntry } from "@/components/diary-journal"
import { AgesStages } from "@/components/ages-stages"
import { PresenceMode } from "@/components/presence-mode"
import { LogDrawer } from "@/components/log-drawer"
import { BottomNav } from "@/components/bottom-nav"
import { Baby, Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample data
const timelineEntries: TimelineEntry[] = [
  {
    id: "1",
    type: "sleep",
    title: "Morning Nap",
    time: "9:30 AM",
    details: "1h 45min - Slept peacefully",
  },
  {
    id: "2",
    type: "feeding",
    title: "Bottle Feed",
    time: "11:15 AM",
    details: "150ml formula",
  },
  {
    id: "3",
    type: "play",
    title: "Tummy Time",
    time: "12:00 PM",
    details: "15 minutes of play",
  },
  {
    id: "4",
    type: "diary",
    title: "First Smile Today!",
    time: "2:30 PM",
    tags: ["Milestone", "Memory"],
  },
]

const growthData: GrowthDataPoint[] = [
  { date: "Week 1", weight: 3.5, height: 50 },
  { date: "Week 4", weight: 4.2, height: 52 },
  { date: "Week 8", weight: 5.1, height: 55 },
  { date: "Week 12", weight: 5.8, height: 58 },
  { date: "Week 16", weight: 6.5, height: 61 },
  { date: "Week 20", weight: 7.0, height: 63 },
  { date: "Week 24", weight: 7.4, height: 65 },
]

const diaryEntries: DiaryEntry[] = [
  {
    id: "1",
    date: "Today",
    title: "First real giggle!",
    preview: "During playtime today, Emma let out her first real giggle. It was the most beautiful sound...",
    tags: ["Milestone", "Memory"],
  },
  {
    id: "2",
    date: "Yesterday",
    title: "4-month checkup",
    preview: "Doctor said everything looks great. Weight and height are on track. Next vaccines scheduled...",
    tags: ["Health", "Appointment"],
  },
  {
    id: "3",
    date: "Jan 18",
    title: "Trying rice cereal",
    preview: "First time trying solid food! Most of it ended up on her bib but she seemed curious...",
    tags: ["Milestone"],
  },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home")

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Parenting Rings */}
            <section className="pt-2">
              <ParentingRings
                sleepProgress={78}
                feedingProgress={92}
                presenceProgress={45}
              />
            </section>

            {/* Presence Mode Card */}
            <section>
              <PresenceMode />
            </section>

            {/* Daily Timeline */}
            <section>
              <DailyTimeline entries={timelineEntries} />
            </section>
          </div>
        )

      case "growth":
        return (
          <div className="space-y-6">
            <GrowthChart
              data={growthData}
              currentWeight={7.4}
              currentHeight={65}
            />
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">Recent Measurements</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-card/50 border border-border">
                  <p className="text-xs text-muted-foreground">Last Weight</p>
                  <p className="text-2xl font-semibold text-foreground">7.4 <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                  <p className="text-xs text-primary mt-1">+0.4kg from last month</p>
                </div>
                <div className="p-4 rounded-2xl bg-card/50 border border-border">
                  <p className="text-xs text-muted-foreground">Last Height</p>
                  <p className="text-2xl font-semibold text-foreground">65 <span className="text-sm font-normal text-muted-foreground">cm</span></p>
                  <p className="text-xs text-primary mt-1">+2cm from last month</p>
                </div>
              </div>
            </section>
          </div>
        )

      case "diary":
        return (
          <div className="space-y-6">
            <DiaryJournal entries={diaryEntries} />
          </div>
        )

      case "discover":
        return (
          <div className="space-y-6">
            <AgesStages />
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-1">Tips for Today</h3>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                <h4 className="text-sm font-semibold text-foreground mb-2">Tummy Time Tip</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Try placing a colorful toy just out of reach during tummy time. This encourages your baby to lift their head and eventually reach for the toy, strengthening their neck and arm muscles.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-ring-feeding/20 to-ring-feeding/5 border border-ring-feeding/30">
                <h4 className="text-sm font-semibold text-foreground mb-2">Sleep Schedule</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  At 4-6 months, most babies need 14-16 hours of sleep per day, including 2-3 naps. Watch for sleep cues like yawning and eye rubbing.
                </p>
              </div>
            </section>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Baby className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Emma</h1>
              <p className="text-xs text-muted-foreground">4 months old</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 max-w-md mx-auto">
        {renderContent()}
      </div>

      {/* Log Button */}
      <LogDrawer />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}
