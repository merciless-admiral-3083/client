import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { AppLayout } from "../components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../components/ui/dialog";
import { PerformanceForm } from "../components/forms/performance-form";
import { PerformanceMetric } from "../components/schema";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Loader2, Plus, Activity } from "lucide-react";

export default function PerformancePage() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<"chart" | "list">("chart");
  const [selectedMetricType, setSelectedMetricType] = useState<string>("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch performance metrics
  const {
    data: metrics = [],
    isLoading,
    refetch,
  } = useQuery<PerformanceMetric[]>({
    queryKey: ["/api/metrics", user?.id.toString()],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  // Get unique metric types
  const metricTypes = ["All", ...Array.from(new Set(metrics.map(m => m.metricType)))];
  
  // Filter metrics by selected type
  const filteredMetrics = selectedMetricType === "All" 
    ? metrics 
    : metrics.filter(m => m.metricType === selectedMetricType);
  
  // Group metrics by date for chart
  const getChartData = () => {
    const groupedData: Record<string, Record<string, number>> = {};
    
    filteredMetrics.forEach(metric => {
      const date = new Date(metric.date).toLocaleDateString();
      
      if (!groupedData[date]) {
        groupedData[date] = { date };
      }
      
      // Use metric type as the key
      groupedData[date][metric.metricType] = metric.value;
    });
    
    return Object.values(groupedData).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const chartData = getChartData();
  
  // Get all metric types for chart
  const chartMetricTypes = Array.from(new Set(metrics.map(m => m.metricType)));
  
  // Generate random color for each metric type (consistent colors)
  const getColorForMetricType = (metricType: string) => {
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))"
    ];
    
    const index = chartMetricTypes.indexOf(metricType) % colors.length;
    return colors[index];
  };
  
  const handleNewPerformance = () => {
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Performance Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze your athletic performance metrics
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 flex items-center" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Record Performance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Performance Metric</DialogTitle>
              </DialogHeader>
              <PerformanceForm userId={user?.id || 0} onSuccess={handleNewPerformance} />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  {filteredMetrics.length} metrics recorded
                </CardDescription>
              </div>
              
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <Tabs value={selectedMetricType} onValueChange={setSelectedMetricType} className="w-[180px]">
                  <TabsList className="grid grid-cols-3">
                    {metricTypes.slice(0, 3).map(type => (
                      <TabsTrigger key={type} value={type} className="text-xs">
                        {type}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {metricTypes.length > 3 && (
                    <div className="mt-1">
                      <select 
                        className="w-full text-xs bg-card border border-border rounded py-1 px-2"
                        value={selectedMetricType}
                        onChange={(e) => setSelectedMetricType(e.target.value)}
                      >
                        {metricTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </Tabs>
                
                <Tabs value={selectedView} onValueChange={setSelectedView as any} className="w-[120px]">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
                    <TabsTrigger value="list" className="text-xs">List</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedView === "chart" ? (
              <div className="h-[400px] mt-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
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
                          color: "hsl(var(--foreground))"
                        }}
                      />
                      <Legend />
                      {chartMetricTypes.map(metricType => (
                        (selectedMetricType === "All" || selectedMetricType === metricType) && (
                          <Line
                            key={metricType}
                            type="monotone"
                            dataKey={metricType}
                            name={metricType}
                            stroke={getColorForMetricType(metricType)}
                            activeDot={{ r: 8 }}
                          />
                        )
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No performance data recorded yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Record Your First Metric
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                {filteredMetrics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-2 font-medium text-muted-foreground">Metric Type</th>
                          <th className="text-left py-2 font-medium text-muted-foreground">Value</th>
                          <th className="text-left py-2 font-medium text-muted-foreground">Unit</th>
                          <th className="text-left py-2 font-medium text-muted-foreground">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMetrics
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(metric => (
                            <tr key={metric.id} className="border-b border-border">
                              <td className="py-3 text-sm">{new Date(metric.date).toLocaleDateString()}</td>
                              <td className="py-3">
                                <span 
                                  className="inline-block px-2 py-1 rounded-full text-xs"
                                  style={{ backgroundColor: `${getColorForMetricType(metric.metricType)}20` }}
                                >
                                  {metric.metricType}
                                </span>
                              </td>
                              <td className="py-3 text-sm">{metric.value}</td>
                              <td className="py-3 text-sm">{metric.unit}</td>
                              <td className="py-3 text-sm">{metric.notes || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No performance data recorded yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Record Your First Metric
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
              <CardDescription>
                Breakdown by metric type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {metrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(
                        metrics.reduce((acc, metric) => {
                          if (!acc[metric.metricType]) acc[metric.metricType] = 0;
                          acc[metric.metricType]++;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => ({ type, count }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis 
                        dataKey="type" 
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
                          color: "hsl(var(--foreground))"
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                        name="Number of Records"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Progress</CardTitle>
              <CardDescription>
                Value changes in last 10 records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {metrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metrics
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(-10)
                        .map(m => ({
                          date: new Date(m.date).toLocaleDateString(),
                          value: m.value,
                          metricType: m.metricType
                        }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
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
                          color: "hsl(var(--foreground))"
                        }}
                        formatter={(value, name, props) => [value, props.payload.metricType]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--chart-2))" 
                        dot={{ fill: "hsl(var(--chart-2))" }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
