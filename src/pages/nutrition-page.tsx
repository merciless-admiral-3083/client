import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { AppLayout } from "../components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
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
import { NutritionForm } from "../components/forms/nutrition-form";
import { NutritionLog } from "../components/schema";
import { 
  PieChart, 
  Pie, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Loader2, Plus, Utensils, Calendar, ArrowRight } from "lucide-react";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isToday } from "date-fns";

export default function NutritionPage() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<"calendar" | "list">("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch nutrition logs
  const {
    data: nutritionLogs = [],
    isLoading,
    refetch,
  } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition", user?.id.toString()],
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
  
  // Filter logs by selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const logsForSelectedDate = nutritionLogs.filter(
    log => new Date(log.date).toISOString().split('T')[0] === selectedDateStr
  );
  
  // Get current week days
  const currentWeekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  });
  
  // Calculate total calories for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLogs = nutritionLogs.filter(
    log => new Date(log.date).toISOString().split('T')[0] === todayStr
  );
  const totalCaloriesToday = todaysLogs.reduce(
    (sum, log) => sum + (log.calories || 0), 0
  );
  
  // Calculate calories trend for the week
  const caloriesTrendData = currentWeekDays.map(day => {
    const dayStr = day.toISOString().split('T')[0];
    const logsForDay = nutritionLogs.filter(
      log => new Date(log.date).toISOString().split('T')[0] === dayStr
    );
    const totalCalories = logsForDay.reduce(
      (sum, log) => sum + (log.calories || 0), 0
    );
    
    return {
      day: format(day, 'EEE'),
      calories: totalCalories,
      isToday: isToday(day)
    };
  });
  
  // Calculate nutrition breakdown for selected date
  const calculateNutritionBreakdown = () => {
    if (logsForSelectedDate.length === 0) {
      return [
        { name: "Protein", value: 40, color: "hsl(var(--chart-1))" },
        { name: "Carbs", value: 30, color: "hsl(var(--chart-2))" },
        { name: "Fats", value: 20, color: "hsl(var(--chart-3))" },
        { name: "Others", value: 10, color: "hsl(var(--chart-4))" },
      ];
    }
    
    // This is a simplified example. In a real app, you would calculate
    // the actual nutritional breakdown based on food items
    const totalCalories = logsForSelectedDate.reduce(
      (sum, log) => sum + (log.calories || 0), 0
    );
    
    const totalProtein = logsForSelectedDate.reduce(
      (sum, log) => sum + (log.protein || 0), 0
    );
    
    // Rough estimation for demo purposes
    const proteinCalories = totalProtein * 4; // 4 calories per gram of protein
    const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100) || 30;
    
    return [
      { name: "Protein", value: proteinPercentage, color: "hsl(var(--chart-1))" },
      { name: "Carbs", value: Math.round((100 - proteinPercentage) * 0.6), color: "hsl(var(--chart-2))" },
      { name: "Fats", value: Math.round((100 - proteinPercentage) * 0.3), color: "hsl(var(--chart-3))" },
      { name: "Others", value: Math.round((100 - proteinPercentage) * 0.1), color: "hsl(var(--chart-4))" },
    ];
  };
  
  const nutritionBreakdown = calculateNutritionBreakdown();
  
  // Calculate meal distribution
  const mealDistribution = Array.from(
    nutritionLogs.reduce((acc, log) => {
      if (!acc.has(log.mealType)) {
        acc.set(log.mealType, 0);
      }
      acc.set(log.mealType, acc.get(log.mealType)! + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));
  
  const handleNewNutritionLog = () => {
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Nutrition Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your food intake and nutritional information
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 flex items-center" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Log Meal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Nutrition</DialogTitle>
              </DialogHeader>
              <NutritionForm userId={user?.id || 0} onSuccess={handleNewNutritionLog} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Nutrition Logs</CardTitle>
                  <CardDescription>
                    {nutritionLogs.length} meals recorded
                  </CardDescription>
                </div>
                
                <Tabs value={selectedView} onValueChange={setSelectedView as any} className="w-[150px] mt-4 sm:mt-0">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="calendar" className="text-xs">Calendar</TabsTrigger>
                    <TabsTrigger value="list" className="text-xs">List</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {selectedView === "calendar" ? (
                <div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {currentWeekDays.map((day, i) => (
                      <div 
                        key={i} 
                        className={`text-center p-2 rounded-md cursor-pointer transition-colors
                          ${selectedDate.toDateString() === day.toDateString() 
                            ? 'bg-primary text-primary-foreground' 
                            : isToday(day)
                              ? 'bg-secondary/50 text-secondary-foreground'
                              : 'hover:bg-secondary/30'
                          }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                        <div className="text-sm">{format(day, 'd')}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">
                      Meals for {format(selectedDate, 'MMMM d, yyyy')}
                    </h3>
                    
                    {logsForSelectedDate.length > 0 ? (
                      <div className="space-y-4">
                        {logsForSelectedDate.map(log => (
                          <div key={log.id} className="flex items-start p-3 bg-card rounded-lg border border-border">
                            <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-4">
                              <Utensils className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{log.mealType}</h4>
                                <div className="flex items-center space-x-2">
                                  {log.calories && (
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                      {log.calories} kcal
                                    </span>
                                  )}
                                  {log.protein && (
                                    <span className="text-xs bg-chart-2/20 text-chart-2 px-2 py-0.5 rounded-full">
                                      {log.protein}g protein
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm mt-1">{log.foodItems}</p>
                              {log.notes && (
                                <p className="text-xs text-muted-foreground mt-2">{log.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center bg-card/50 rounded-lg border border-dashed border-border">
                        <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">No meals recorded for this day</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Log a Meal
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  {nutritionLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                            <th className="text-left py-2 font-medium text-muted-foreground">Meal Type</th>
                            <th className="text-left py-2 font-medium text-muted-foreground">Food Items</th>
                            <th className="text-left py-2 font-medium text-muted-foreground">Calories</th>
                            <th className="text-left py-2 font-medium text-muted-foreground">Protein</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nutritionLogs
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map(log => (
                              <tr key={log.id} className="border-b border-border">
                                <td className="py-3 text-sm">{new Date(log.date).toLocaleDateString()}</td>
                                <td className="py-3">
                                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                                    {log.mealType}
                                  </span>
                                </td>
                                <td className="py-3 text-sm">{log.foodItems}</td>
                                <td className="py-3 text-sm">{log.calories || '-'} kcal</td>
                                <td className="py-3 text-sm">{log.protein || '-'} g</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Utensils className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No nutrition data recorded yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        Log Your First Meal
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Calories</span>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold">{totalCaloriesToday}</span>
                      <span className="text-muted-foreground ml-1">/ 2,800 kcal</span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, (totalCaloriesToday / 2800) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-muted-foreground">Protein</span>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold">
                        {todaysLogs.reduce((sum, log) => sum + (log.protein || 0), 0)}
                      </span>
                      <span className="text-muted-foreground ml-1">/ 150 g</span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-chart-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (todaysLogs.reduce((sum, log) => sum + (log.protein || 0), 0) / 150) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Log Today's Meal <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Weekly Calories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={caloriesTrendData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="day" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted))" }}
                      />
                      <YAxis 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted))" }}
                      />
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))"
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorCalories)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Nutrition Breakdown</CardTitle>
                <CardDescription>
                  For {format(selectedDate, 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nutritionBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {nutritionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))"
                        }}
                        formatter={(value) => [`${value}%`, 'Percentage']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Meal Distribution</CardTitle>
            <CardDescription>
              Frequency by meal type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {mealDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mealDistribution}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="name" 
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
                      dataKey="value" 
                      fill="hsl(var(--chart-2))" 
                      radius={[4, 4, 0, 0]} 
                      name="Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No meal data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
