"use client"

import { Baby } from "lucide-react"
import { motion } from "framer-motion"
import { Spinner } from "@/components/ui/spinner"

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.primary/12),transparent_42%),radial-gradient(circle_at_bottom,theme(colors.chart-2/10),transparent_38%)]" />
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.65, 0.45] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-1/4 right-[-3rem] h-52 w-52 rounded-full bg-chart-2/10 blur-3xl"
        animate={{ y: [0, -10, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative flex flex-col items-center gap-5 text-center"
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-border/60 bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur-xl">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Baby className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Baby Blooming</h1>
          <p className="text-sm text-muted-foreground">Loading your parenting dashboard</p>
        </div>
        <div className="rounded-full border border-border/60 bg-card/80 px-4 py-2 shadow-lg shadow-black/5 backdrop-blur-xl">
          <Spinner className="h-5 w-5 text-primary" />
        </div>
      </motion.div>
    </div>
  )
}
