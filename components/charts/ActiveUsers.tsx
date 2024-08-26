"use client"

import { useEffect, useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

type QueryData = {
  user_id: string;
  created_at: string;
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
    color: "hsl(141.9, 69.2%, 58%)",
  },
  lastTwoWeeks: {
    label: "Last 2 Weeks",
    color: "hsl(198.4, 93.2%, 59.6%)",
  },
  lastMonth: {
    label: "Last Month",
    color: "hsl(270, 95.2%, 75.3%)",
  },
}

export default function ActiveUsers() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [trend, setTrend] = useState<number>(0)
  const supabase = useSupabaseClient()
  useEffect(() => {
    async function fetchData() {
      const { data: queries } = await supabase.from('store-queries').select('user_id, created_at') as { data: QueryData[] }

      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const dailyData: Record<string, { lastWeek: Set<string>, lastTwoWeeks: Set<string>, lastMonth: Set<string> }> = {}

      queries.forEach(query => {
        const date = new Date(query.created_at)
        console.log("Dates", date)
        const dateString = date.toISOString().split('T')[0]

        if (!dailyData[dateString]) {
          dailyData[dateString] = { lastWeek: new Set(), lastTwoWeeks: new Set(), lastMonth: new Set() }
        }

        if (date >= oneWeekAgo) dailyData[dateString].lastWeek.add(query.user_id)
        if (date >= twoWeeksAgo) dailyData[dateString].lastTwoWeeks.add(query.user_id)
        if (date >= oneMonthAgo) dailyData[dateString].lastMonth.add(query.user_id)
      })

      const processedData: ChartDataPoint[] = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          lastWeek: data.lastWeek.size > 5 ? data.lastWeek.size : 0,
          lastTwoWeeks: data.lastTwoWeeks.size > 5 ? data.lastTwoWeeks.size : 0,
          lastMonth: data.lastMonth.size > 5 ? data.lastMonth.size : 0,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setChartData(processedData)

      console.log('Active users data:', processedData)

      // Calculate trend
      if (processedData.length >= 2) {
        const lastDay = processedData[processedData.length - 1].lastWeek
        const previousDay = processedData[processedData.length - 2].lastWeek
        setTrend(((lastDay - previousDay) / previousDay) * 100)
      }
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Users</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="lastWeek" fill={chartConfig.lastWeek.color} radius={4} />
            <Bar dataKey="lastTwoWeeks" fill={chartConfig.lastTwoWeeks.color} radius={4} />
            <Bar dataKey="lastMonth" fill={chartConfig.lastMonth.color} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend > 0 ? "Trending up" : "Trending down"} by {Math.abs(trend).toFixed(1)}% from previous day
          <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing active users (>5 entries) for the last 1 month, 2 weeks, 1 week
        </div>
      </CardFooter>
    </Card>
  )
}