"use client"
import { useEffect, useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts"
import { format, subDays } from 'date-fns'

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
  created_at: string;
  correct: string;
  bucket: string;
}

type ChartDataPoint = {
  date: string; // Keep date as string
  total: number; // Total is a number
  [bucket: string]: number | string; // Allow dynamic properties as number or string
}


export default function AccuracyOverTime() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [trend, setTrend] = useState<number>(0)
  const supabase = useSupabaseClient()

  const generateDateLabels = () => {
    const today = new Date()
    return Array(7).fill(0).map((_, i) => format(subDays(today, 6 - i), 'MMM d'))
  }

  const dateLabels = generateDateLabels()

  useEffect(() => {
    async function fetchData() {
      const { data: queries } = await supabase.from('store-queries').select() as { data: QueryData[] }

      // Process the data
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
      const processedData = queries
        .filter(query => new Date(query.created_at) >= oneWeekAgo)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      const buckets = Array.from(new Set(queries.map(q => q.bucket)))
  
      const chartData: ChartDataPoint[] = dateLabels.map((label, index) => {
        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() - 6 + index)
        const currentDateString = currentDate.toISOString().split('T')[0]
  
        const dailyData = processedData.filter(q => new Date(q.created_at).toISOString().split('T')[0] === currentDateString)
  
        const calculateAccuracy = (data: QueryData[], bucket?: string) => {
          const filteredData = bucket ? data.filter(q => q.bucket === bucket) : data
          const total = filteredData.length
          const correct = filteredData.filter(q => q.correct === 'true').length
          return total > 0 ? (correct / total) * 100 : 0
        }

        const dataPoint: ChartDataPoint = {
          date: label,
          total: calculateAccuracy(dailyData)
        }

        buckets.forEach(bucket => {
          dataPoint[bucket] = calculateAccuracy(dailyData, bucket)
        })

        return dataPoint
      })
      
      setChartData(chartData)
  
      // Calculate trend
      if (chartData.length >= 2) {
        const lastDay = chartData[chartData.length - 1].total
        const previousDay = chartData[chartData.length - 2].total
        setTrend(((lastDay - previousDay) / previousDay) * 100)
      }
    }
  
    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accuracy</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}}>
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
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Line
              dataKey="total"
              type="linear"
              stroke={`hsl(var(--chart-5))`}
              strokeWidth={2}
              dot={false}
            />
            {Object.keys(chartData[0] || {}).filter(key => key !== "date" && key !== "total" && key !== "null").map((bucket, index) => (
              <Line
                key={bucket}
                dataKey={bucket}
                type="linear"
                stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                strokeWidth={2}
                dot={false}
              />
            ))}
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
          Showing accuracy for the last 7 days
        </div>
      </CardFooter>
    </Card>
  )
}