"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ComponentType } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingAction {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
}

interface FloatingActionMenuProps {
  actions: FloatingAction[]
  open: boolean
  onOpenChange: (open: boolean) => void
  anchorSelector?: string
  anchorOffsetY?: number
  anchorPosition?: "center" | "top"
}

export function FloatingActionMenu({
  actions,
  open,
  onOpenChange,
  anchorSelector,
  anchorOffsetY = -20,
  anchorPosition = "center",
}: FloatingActionMenuProps) {
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null)
  const isBottomNavAnchor = anchorSelector === "#bottom-nav"

  const positions = useMemo(() => {
    const radius = 116
    const arc = 170
    const horizontalSpread = 1.08
    const verticalLift = 1.2
    const startAngle = 90 - arc / 2
    const step = actions.length > 1 ? arc / (actions.length - 1) : 0

    return actions.map((_, index) => {
      const angle = (startAngle + step * index) * (Math.PI / 180)
      return {
        x: Math.cos(angle) * radius * horizontalSpread,
        y: -Math.sin(angle) * radius * verticalLift,
      }
    })
  }, [actions])

  const updateAnchor = useCallback(() => {
    if (typeof window === "undefined") return

    if (!anchorSelector) {
      setAnchor(null)
      return
    }

    const element = document.querySelector(anchorSelector)
    if (!element) {
      setAnchor(null)
      return
    }

    const rect = element.getBoundingClientRect()
    const baseY = anchorPosition === "top" ? rect.top : rect.top + rect.height / 2
    setAnchor({
      x: rect.left + rect.width / 2,
      y: baseY + anchorOffsetY,
    })
  }, [anchorSelector, anchorOffsetY, anchorPosition])

  useLayoutEffect(() => {
    updateAnchor()
  }, [updateAnchor])

  useEffect(() => {
    updateAnchor()
  }, [open, updateAnchor])

  useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener("resize", updateAnchor)
    window.addEventListener("scroll", updateAnchor, true)
    return () => {
      window.removeEventListener("resize", updateAnchor)
      window.removeEventListener("scroll", updateAnchor, true)
    }
  }, [updateAnchor])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const handleActionClick = (action: FloatingAction) => {
    onOpenChange(false)
    action.onClick()
  }

  const containerClassName = anchor
    ? "fixed z-50 h-14 w-14 -translate-x-1/2 -translate-y-1/2"
    : isBottomNavAnchor
      ? "fixed left-1/2 -translate-x-1/2 z-50 h-14 w-14"
      : "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 h-14 w-14"

  const containerStyle = anchor
    ? { left: anchor.x, top: anchor.y }
    : isBottomNavAnchor
      ? { bottom: "calc(env(safe-area-inset-bottom, 0px) + 2.25rem)" }
      : undefined

  return (
    <div
      className={containerClassName}
      style={containerStyle}
    >
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close actions"
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              onClick={() => onOpenChange(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="menu"
              aria-label="Log actions"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              {actions.map((action, index) => {
                const Icon = action.icon
                const position = positions[index]

                return (
                  <motion.button
                    key={action.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleActionClick(action)}
                    className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
                    animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
                    exit={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.04 }}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border text-foreground shadow-lg">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-medium text-foreground/80">{action.label}</span>
                  </motion.button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        type="button"
        aria-label="Add log entry"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
        className="relative z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:scale-105 transition-all"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
