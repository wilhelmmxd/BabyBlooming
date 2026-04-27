"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Scale, Ruler } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts"

export interface GrowthDataPoint {
  id?: string
  date: string
  weight?: number
  height?: number
  weightPercentile?: number
  heightPercentile?: number
  rawData?: Record<string, unknown>
}

interface GrowthChartProps {
  data: GrowthDataPoint[]
  currentWeight?: number
  currentHeight?: number
  currentWeightPercentile?: number
  currentHeightPercentile?: number
}

export function GrowthChart({ data, currentWeight, currentHeight, currentWeightPercentile, currentHeightPercentile }: GrowthChartProps) {
  const [activeMetric, setActiveMetric] = useState<"weight" | "height">("weight")

  const toOrdinal = (value: number) => {
    const mod100 = value % 100
    if (mod100 >= 11 && mod100 <= 13) return `${value}th`
    const mod10 = value % 10
    if (mod10 === 1) return `${value}st`
    if (mod10 === 2) return `${value}nd`
    if (mod10 === 3) return `${value}rd`
    return `${value}th`
  }

  const chartConfig = {
    weight: {
      label: "Weight",
      unit: "lb",
      color: "oklch(0.72 0.12 145)",
      icon: Scale
    },
    height: {
      label: "Height",
      unit: "in",
      color: "oklch(0.70 0.15 220)",
      icon: Ruler
    }
  }

  const config = chartConfig[activeMetric]
  const Icon = config.icon

  const renderTooltip = ({ label, payload }: { label?: string; payload?: Array<{ value?: number }> }) => {
    const value = payload?.[0]?.value
    if (value == null) return null

    return (
      <div
        style={{
          margin: 0,
          padding: 10,
          backgroundColor: "var(--chart-bg)",
          border: "1px solid var(--chart-border)",
          whiteSpace: "nowrap",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {label && (
          <p style={{ margin: 0, color: "var(--foreground)", fontWeight: 500 }}>{label}</p>
        )}
        <div style={{ paddingTop: 4, color: config.color }}>
          {config.label}: {value}
          {config.unit}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Growth Tracker
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={activeMetric === "weight" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setActiveMetric("weight")}
            >
              <Scale className="w-3 h-3 mr-1" />
              Weight
            </Button>
            <Button
              variant={activeMetric === "height" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setActiveMetric("height")}
            >
              <Ruler className="w-3 h-3 mr-1" />
              Height
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <div className="h-48 w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-secondary/20">
            <div className="p-3 rounded-full bg-muted-foreground/10 mb-3">
              <Scale className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground text-center">No measurements yet</p>
            <p className="text-xs text-muted-foreground/70 text-center mt-1">Add growth data to track your child&apos;s progress</p>
          </div>
        ) : (
          <>
            {/* Current Stats */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
                <p className="text-xl font-semibold text-foreground mt-1">
                  {activeMetric === "weight" ? currentWeight : currentHeight}
                  <span className="text-sm font-normal text-muted-foreground ml-1">{config.unit}</span>
                </p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-chart-3" />
                  <span className="text-xs text-muted-foreground">Percentile</span>
                </div>
                <p className="text-xl font-semibold text-foreground mt-1">
                  {activeMetric === "weight" && currentWeightPercentile != null
                    ? toOrdinal(currentWeightPercentile)
                    : activeMetric === "height" && currentHeightPercentile != null
                      ? toOrdinal(currentHeightPercentile)
                      : "-"}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--chart-grid)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--chart-text)" }}
                    axisLine={{ stroke: "var(--chart-grid)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--chart-text)" }}
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
                  <Tooltip
                    content={renderTooltip}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeMetric}
                    stroke="transparent"
                    fill="url(#colorGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={config.color}
                    strokeWidth={2}
                    dot={{ fill: config.color, strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: config.color }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
