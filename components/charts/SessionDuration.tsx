"use client"
import { useEffect, useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type SessionData = {
  id: string;
  session_start: string;
  session_end: string | null;
  duration: string | null;
  user_id: string;
}

type ChartDataPoint = {
  date: string;
  lastWeek: number;
  lastTwoWeeks: number;
  lastMonth: number;
}

const chartConfig: ChartConfig = {
  lastWeek: {
    label: "Last Week",
    color: "hsl(var(--chart-1))",
  },
  lastTwoWeeks: {
    label: "Last 2 Weeks",
    color: "hsl(var(--chart-2))",
  },
  lastMonth: {
    label: "Last Month",
    color: "hsl(var(--chart-3))",
  },
}

export default function SessionDuration() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [trend, setTrend] = useState<number>(0)
  const supabase = useSupabaseClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: sessions, error } = await supabase
          .from('user_sessions')
          .select('session_start, duration') as { data: SessionData[], error: any }
        
        if (error) {
          console.error("Error fetching data:", error)
          return
        }

        // Process the data
        const lastMonth = new Date()
        lastMonth.setDate(lastMonth.getDate() - 30)
        const now = new Date()
        const dailyData: Record<string, number[]> = {}
        sessions.forEach(session => {
          const startDate = new Date(session.session_start)
          if (startDate >= lastMonth) {
            const dateString = startDate.toISOString().split('T')[0]
            if (!dailyData[dateString]) {
              dailyData[dateString] = []
            }
            
            let duration: number
            if (session.duration) {
              duration = parseIntervalToSeconds(session.duration)
            } else if (session.session_end) {
              duration = (new Date(session.session_end).getTime() - startDate.getTime()) / 1000
            } else {
              // Session is ongoing, calculate duration up to now
              duration = (now.getTime() - startDate.getTime()) / 1000
            }
            
            dailyData[dateString].push(duration)
          }
        })

        const processedData = Object.entries(dailyData).map(([date, durations]) => ({
          date,
          averageDuration: durations.reduce((sum, duration) => sum + duration, 0) / durations.length / 60 // Convert to minutes
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const chartData: ChartDataPoint[] = processedData.map(({ date }, index) => {
          const lastWeekData = processedData.slice(Math.max(0, index - 6), index + 1)
          const lastTwoWeeksData = processedData.slice(Math.max(0, index - 13), index + 1)
          const lastMonthData = processedData.slice(Math.max(0, index - 29), index + 1)

          return {
            date,
            lastWeek: lastWeekData.reduce((sum, d) => sum + d.averageDuration, 0) / lastWeekData.length,
            lastTwoWeeks: lastTwoWeeksData.reduce((sum, d) => sum + d.averageDuration, 0) / lastTwoWeeksData.length,
            lastMonth: lastMonthData.reduce((sum, d) => sum + d.averageDuration, 0) / lastMonthData.length,
          }
        })

        setChartData(chartData)
        console.log("Session duration data:", chartData)

        // Calculate trend
        if (chartData.length >= 2) {
          const lastDay = chartData[chartData.length - 1].lastWeek
          const previousDay = chartData[chartData.length - 2].lastWeek
          setTrend(((lastDay - previousDay) / previousDay) * 100)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
      }
    }
    
    fetchData()
  }, [supabase])

  function parseIntervalToSeconds(interval: string): number {
    const match = interval.match(/(\d+):(\d+):(\d+)/)
    if (!match) return 0
    const [_, hours, minutes, seconds] = match.map(Number)
    return hours * 3600 + minutes * 60 + seconds
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Duration</CardTitle>
        <CardDescription>Average duration in minutes over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 'dataMax']}
              tickFormatter={(value: number) => `${value.toFixed(1)} min`}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Line
              type="linear"
              dataKey="lastWeek"
              stroke={chartConfig.lastWeek.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="linear"
              dataKey="lastTwoWeeks"
              stroke={chartConfig.lastTwoWeeks.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="linear"
              dataKey="lastMonth"
              stroke={chartConfig.lastMonth.color}
              strokeWidth={2}
              dot={false}
            />
            <Legend />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend > 0 ? "Trending up" : "Trending down"} by {Math.abs(trend).toFixed(1)}% from previous day
          <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing average session duration over the last 30 days
        </div>
      </CardFooter>
    </Card>
  )
}