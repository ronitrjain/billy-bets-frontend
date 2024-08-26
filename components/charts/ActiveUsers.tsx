"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

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

const chartConfig = {
  activeUsers: {
    label: "Active Users",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

function ActiveUsers() {
  const [chartData, setChartData] = useState([])
  const [trend, setTrend] = useState(0)
  const supabase = useSupabaseClient()

  useEffect(() => {
    async function fetchData() {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: queries, error } = await supabase
        .from('store-queries')
        .select('user_id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())

      if (error) {
        console.error("Error fetching data:", error)
        return
      }

      const userQueriesByDay = {}
      queries.forEach(query => {
        const date = new Date(query.created_at).toISOString().split('T')[0]
        if (!userQueriesByDay[date]) userQueriesByDay[date] = {}
        if (!userQueriesByDay[date][query.user_id]) userQueriesByDay[date][query.user_id] = 0
        userQueriesByDay[date][query.user_id]++
      })

      const chartData = Object.entries(userQueriesByDay).map(([date, users]) => ({
        date,
        activeUsers: Object.values(users).filter(count => count > 5).length
      })).sort((a, b) => new Date(a.date) - new Date(b.date))

      setChartData(chartData)

      // Calculate trend
      if (chartData.length >= 2) {
        const lastDay = chartData[chartData.length - 1].activeUsers
        const previousDay = chartData[chartData.length - 2].activeUsers
        setTrend(((lastDay - previousDay) / previousDay) * 100)
      }
    }

    fetchData()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Users</CardTitle>
        <CardDescription>
          Users asking more than 5 questions per day (Last 7 days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
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
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 'auto']}
              tickFormatter={(value) => Math.round(value)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="activeUsers"
              type="linear"
              stroke="hsl(var(--chart-1))"
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
          Showing active users for the last 7 days
        </div>
      </CardFooter>
    </Card>
  )
}

export default ActiveUsers