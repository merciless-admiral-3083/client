import { Card, CardContent } from "@/components/ui/card";
import { PerformanceMetric } from "server/schema";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PerformanceChartProps {
  metrics: PerformanceMetric[];
}

export function PerformanceChart({ metrics }: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  // Filter and format data based on selected time range
  const getFilteredData = () => {
    const currentDate = new Date();
    const filteredData = metrics.filter(metric => {
      const metricDate = new Date(metric.date);
      if (timeRange === "week") {
        // Last 7 days
        const weekAgo = new Date(currentDate);
        weekAgo.setDate(currentDate.getDate() - 7);
        return metricDate >= weekAgo;
      } else if (timeRange === "month") {
        // Last 30 days
        const monthAgo = new Date(currentDate);
        monthAgo.setDate(currentDate.getDate() - 30);
        return metricDate >= monthAgo;
      } else {
        // Last year
        const yearAgo = new Date(currentDate);
        yearAgo.setFullYear(currentDate.getFullYear() - 1);
        return metricDate >= yearAgo;
      }
    });

    // Format the data for the chart
    return filteredData.map(metric => ({
      date: new Date(metric.date).toLocaleDateString("en-US", { 
        weekday: "short", 
        month: timeRange === "week" ? undefined : "short",
        day: timeRange === "year" ? undefined : "numeric"
      }),
      value: metric.value,
      unit: metric.unit
    }));
  };

  const chartData = getFilteredData();

  // Use actual data, empty array if no metrics
  const data = chartData.length > 0 ? chartData : [];

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Performance Trends</h2>
          <div className="flex space-x-2">
            <Button 
              variant={timeRange === "week" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setTimeRange("week")}
              className="text-xs h-7 px-3 rounded-full"
            >
              Week
            </Button>
            <Button 
              variant={timeRange === "month" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setTimeRange("month")}
              className="text-xs h-7 px-3 rounded-full"
            >
              Month
            </Button>
            <Button 
              variant={timeRange === "year" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setTimeRange("year")}
              className="text-xs h-7 px-3 rounded-full"
            >
              Year
            </Button>
          </div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: "hsl(var(--muted-foreground))" }} 
                axisLine={{ stroke: "hsl(var(--muted))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))" }} 
                axisLine={{ stroke: "hsl(var(--muted))" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  color: "hsl(var(--card-foreground))"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fill="url(#performanceGradient)" 
                strokeWidth={2}
                dot={{ stroke: "hsl(var(--primary))", fill: "hsl(var(--primary))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
