import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { FinanceForm } from "@/components/forms/finance-form";
import { Finance } from "server/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Loader2, Plus, DollarSign, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format, subDays, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";

export default function FinancesPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch finances
  const {
    data: finances = [],
    isLoading,
    refetch,
  } = useQuery<Finance[]>({
    queryKey: ["/api/finances", user?.id.toString()],
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
  
  // Filter finances based on time range and category
  const getFilteredFinances = () => {
    const today = new Date();
    const pastDate = new Date();
    
    // Set date range
    if (timeRange === "30") {
      pastDate.setDate(today.getDate() - 30);
    } else if (timeRange === "90") {
      pastDate.setDate(today.getDate() - 90);
    } else if (timeRange === "365") {
      pastDate.setDate(today.getDate() - 365);
    } else if (timeRange === "month") {
      // Current month
      return finances.filter(f => 
        isWithinInterval(new Date(f.date), {
          start: startOfMonth(today),
          end: endOfMonth(today)
        }) && (selectedCategory === "All" || f.category === selectedCategory)
      );
    }
    
    return finances.filter(f => 
      new Date(f.date) >= pastDate && 
      (selectedCategory === "All" || f.category === selectedCategory)
    );
  };
  
  const filteredFinances = getFilteredFinances();
  
  // Get unique categories
  const categories = ["All", ...Array.from(new Set(finances.map(f => f.category)))];
  
  // Calculate financial summary
  const calculateSummary = () => {
    const expenses = filteredFinances
      .filter(f => !f.isIncome)
      .reduce((sum, f) => sum + f.amount, 0);
    
    const income = filteredFinances
      .filter(f => f.isIncome)
      .reduce((sum, f) => sum + f.amount, 0);
    
    const balance = income - expenses;
    
    // Category breakdown
    const categoryBreakdown = filteredFinances
      .filter(f => !f.isIncome) // Only expenses
      .reduce((acc, finance) => {
        if (!acc[finance.category]) {
          acc[finance.category] = 0;
        }
        acc[finance.category] += finance.amount;
        return acc;
      }, {} as Record<string, number>);
    
    // Daily spending trend
    const days = 7; // Show last 7 days
    const dailyTrend = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - i - 1);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayFinances = filteredFinances.filter(f => 
        new Date(f.date).toISOString().split('T')[0] === dateStr
      );
      
      const expenses = dayFinances
        .filter(f => !f.isIncome)
        .reduce((sum, f) => sum + f.amount, 0);
      
      const income = dayFinances
        .filter(f => f.isIncome)
        .reduce((sum, f) => sum + f.amount, 0);
      
      return {
        date: format(date, 'EEE'),
        expenses,
        income
      };
    });
    
    return {
      expenses,
      income,
      balance,
      categoryBreakdown,
      dailyTrend
    };
  };
  
  const summary = calculateSummary();
  
  // Chart colors for categories
  const categoryColors: Record<string, string> = {
    'Equipment': 'hsl(var(--chart-1))',
    'Nutrition': 'hsl(var(--chart-2))',
    'Training': 'hsl(var(--chart-3))',
    'Medical': 'hsl(var(--chart-4))',
    'Competition': 'hsl(var(--chart-5))',
    'Travel': 'hsl(var(--primary))',
    'Other': 'hsl(var(--muted))'
  };
  
  // Format category for display with badge color
  const getCategoryBadge = (category: string) => {
    const colorClass = `bg-${
      category === 'Equipment' ? 'primary' :
      category === 'Nutrition' ? 'chart-2' :
      category === 'Training' ? 'chart-3' :
      category === 'Medical' ? 'chart-4' :
      category === 'Competition' ? 'chart-5' :
      'muted'
    }/20 text-${
      category === 'Equipment' ? 'primary' :
      category === 'Nutrition' ? 'chart-2' :
      category === 'Training' ? 'chart-3' :
      category === 'Medical' ? 'chart-4' :
      category === 'Competition' ? 'chart-5' :
      'muted-foreground'
    }`;
    
    return (
      <span className={`text-xs ${colorClass} px-2 py-0.5 rounded-full`}>
        {category}
      </span>
    );
  };
  
  // Format financial values as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Category breakdown for pie chart
  const categoryPieData = Object.entries(summary.categoryBreakdown).map(([name, value]) => ({ 
    name, 
    value,
    color: categoryColors[name] || 'hsl(var(--muted))'
  }));
  
  const handleNewFinance = () => {
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Financial Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze your athletic expenses and income
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 flex items-center" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Financial Transaction</DialogTitle>
              </DialogHeader>
              <FinanceForm userId={user?.id || 0} onSuccess={handleNewFinance} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-card/50 border">
            <CardHeader className="pb-2">
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                Financial overview for selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <DollarSign className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Balance</div>
                  <div className="text-3xl font-bold">{formatCurrency(summary.balance)}</div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3 bg-card rounded-lg border border-border">
                  <div className="flex items-center text-green-500 mb-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Income</span>
                  </div>
                  <div className="text-xl font-semibold">{formatCurrency(summary.income)}</div>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border">
                  <div className="flex items-center text-red-500 mb-1">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Expenses</span>
                  </div>
                  <div className="text-xl font-semibold">{formatCurrency(summary.expenses)}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Select value={timeRange} onValueChange={setTimeRange} className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="365">This Year</SelectItem>
                </SelectContent>
              </Select>
            </CardFooter>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Daily Trend</CardTitle>
                
                <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                  <div className="flex items-center text-xs space-x-2">
                    <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                    <span>Expenses</span>
                  </div>
                  <div className="flex items-center text-xs space-x-2">
                    <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                    <span>Income</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={summary.dailyTrend}
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
                      formatter={(value) => [formatCurrency(value as number), ""]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="hsl(var(--chart-4))" 
                      dot={{ fill: "hsl(var(--chart-4))" }}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="hsl(var(--chart-2))" 
                      dot={{ fill: "hsl(var(--chart-2))" }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {categoryPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))"
                        }}
                        formatter={(value) => [formatCurrency(value as number), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No expense data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Recent financial records
                  </CardDescription>
                </div>
                
                <div className="mt-2 sm:mt-0 flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFinances.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Description</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Type</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFinances
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map(finance => (
                          <tr key={finance.id} className="border-b border-border">
                            <td className="py-3 text-sm">{new Date(finance.date).toLocaleDateString()}</td>
                            <td className="py-3">{getCategoryBadge(finance.category)}</td>
                            <td className="py-3 text-sm">{finance.description || '-'}</td>
                            <td className="py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                finance.isIncome 
                                  ? 'bg-green-500/20 text-green-500' 
                                  : 'bg-red-500/20 text-red-500'
                              }`}>
                                {finance.isIncome ? 'Income' : 'Expense'}
                              </span>
                            </td>
                            <td className="py-3 text-sm text-right font-medium">
                              <span className={finance.isIncome ? 'text-green-500' : 'text-red-500'}>
                                {finance.isIncome ? '+' : '-'}{formatCurrency(finance.amount)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center bg-card/50 rounded-lg border border-dashed border-border">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No financial records for this period</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Record Your First Transaction
                  </Button>
                </div>
              )}
            </CardContent>
            {filteredFinances.length > 10 && (
              <CardFooter>
                <Button variant="outline" className="w-full">View All Transactions</Button>
              </CardFooter>
            )}
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
            <CardDescription>
              Expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {Object.keys(summary.categoryBreakdown).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      Object.entries(summary.categoryBreakdown)
                        .map(([category, amount]) => ({
                          category,
                          amount
                        }))
                    }
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="category" 
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
                      formatter={(value) => [formatCurrency(value as number), ""]}
                    />
                    <Bar 
                      dataKey="amount" 
                      name="Amount" 
                      radius={[4, 4, 0, 0]}
                    >
                      {
                        Object.entries(summary.categoryBreakdown)
                          .map(([category], index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={categoryColors[category] || 'hsl(var(--muted))'}
                            />
                          ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">No expense data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
