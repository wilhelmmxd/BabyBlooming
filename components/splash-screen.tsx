"use client"

import { Baby } from "lucide-react"
import { motion } from "framer-motion"

export function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
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
        className="relative flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="flex h-28 w-28 items-center justify-center rounded-[2.5rem] border border-border/60 bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur-xl"
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear"
          }}
        >
          <motion.div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Baby className="h-12 w-12 text-primary" />
          </motion.div>
        </motion.div>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-foreground"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Baby Blooming
        </motion.h1>
      </motion.div>
    </motion.div>
  )
}
