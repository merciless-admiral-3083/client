
import { useAuth } from "..//hooks/use-auth";
import { AppLayout } from "..//components/layout/app-layout";
import { StatsCard } from "..//components/dashboard/stats-card";
import { PerformanceChart } from "..//components/dashboard/performance-chart";
import { NutritionOverview } from "..//components/dashboard/nutrition-overview";
import { ActivityLog } from "..//components/dashboard/activity-log";
import { AiCoachInsight } from "..//components/dashboard/ai-coach-insight";
import { InjuryTracker } from "..//components/dashboard/injury-tracker";
import { FinancialSummary } from "..//components/dashboard/financial-summary";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Scale, Calendar, Activity, Heart } from "lucide-react";
import { formatDistance } from "date-fns";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const {
    data: metrics = [],
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["/api/metrics", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  const {
    data: nutritionLogs = [],
    isLoading: isNutritionLoading,
    refetch: refetchNutrition,
  } = useQuery({
    queryKey: ["/api/nutrition", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  const {
    data: injuries = [],
    isLoading: isInjuriesLoading,
    refetch: refetchInjuries,
  } = useQuery({
    queryKey: ["/api/injuries", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  const {
    data: finances = [],
    isLoading: isFinancesLoading,
    refetch: refetchFinances,
  } = useQuery({
    queryKey: ["/api/finances", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  const isLoading = isMetricsLoading || isNutritionLoading || isInjuriesLoading || isFinancesLoading;
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const lastUpdated = formatDistance(
    new Date(
      Math.max(
        ...metrics.map(m => new Date(m.date).getTime())
      )
    ),
    new Date(),
    { addSuffix: true }
  );

  const nutritionData = [
    { name: "Protein", value: 30 },
    { name: "Carbs", value: 40 },
    { name: "Fats", value: 20 },
    { name: "Fiber", value: 10 }
  ];

  return (
    <AppLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold">Athlete Dashboard</h1>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <span className="text-muted-foreground">Last updated:</span>
            <span>{lastUpdated}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Weight"
            value="75 kg"
            icon={Scale}
            description="Last 30 days"
          />
          <StatsCard
            title="Workouts"
            value="12"
            icon={Activity}
            description="This month"
          />
          <StatsCard
            title="Active Days"
            value="18"
            icon={Calendar}
            description="This month"
          />
          <StatsCard
            title="Recovery"
            value="Good"
            icon={Heart}
            description="Current status"
          />
        </div>

        {/* Performance Chart and Nutrition Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <PerformanceChart metrics={metrics} />
          </div>
          <div>
            <NutritionOverview logs={nutritionLogs} />
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                        data={nutritionData}
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
                        labelStyle={{ fill: 'hsl(var(--foreground))' }}
                      >
                        {nutritionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${[215, 150, 45, 320, 180][index % 5]}, ${[70, 60, 80, 60, 70][index % 5]}%, ${[60, 50, 60, 60, 50][index % 5]}%)`}
                          />
                        ))}
                    </Pie>

                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity and AI Coach */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ActivityLog 
            metrics={metrics} 
            nutritionLogs={nutritionLogs} 
            injuries={injuries} 
          />
          <AiCoachInsight userId={user?.id || 0} />
        </div>

        {/* Injury Tracker and Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InjuryTracker 
            injuries={injuries} 
            userId={user?.id || 0}
            onAddInjury={() => refetchInjuries()}
          />
          <div className="md:col-span-2">
            <FinancialSummary 
              finances={finances} 
              userId={user?.id || 0}
              onAddFinance={() => refetchFinances()}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
