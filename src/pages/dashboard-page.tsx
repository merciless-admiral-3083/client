import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { NutritionOverview } from "@/components/dashboard/nutrition-overview";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { AiCoachInsight } from "@/components/dashboard/ai-coach-insight";
import { InjuryTracker } from "@/components/dashboard/injury-tracker";
import { FinancialSummary } from "@/components/dashboard/financial-summary";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Scale, Calendar, Activity, Heart } from "lucide-react";
import { formatDistance } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch performance metrics
  const {
    data: metrics = [],
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["/api/metrics", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  // Fetch nutrition logs
  const {
    data: nutritionLogs = [],
    isLoading: isNutritionLoading,
    refetch: refetchNutrition,
  } = useQuery({
    queryKey: ["/api/nutrition", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  // Fetch injuries
  const {
    data: injuries = [],
    isLoading: isInjuriesLoading,
    refetch: refetchInjuries,
  } = useQuery({
    queryKey: ["/api/injuries", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  // Fetch finances
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
  
  // Format date for the last updated info
  const lastUpdated = formatDistance(
    new Date(
      Math.max(
        ...metrics.map(m => new Date(m.date).getTime()),
        ...nutritionLogs.map(n => new Date(n.date).getTime()),
        ...injuries.map(i => new Date(i.dateOccurred).getTime()),
        ...finances.map(f => new Date(f.date).getTime()),
        Date.now() - 86400000 // Default to yesterday if no data
      )
    ),
    new Date(),
    { addSuffix: true }
  );

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

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Current Weight"
            value={`${metrics.filter(m => m.metricType === "Weight").slice(-1)[0]?.value || 82.5} kg`}
            icon={Scale}
            change={{
              value: "1.2%",
              isPositive: true,
              label: "vs last week"
            }}
          />
          
          <StatsCard
            title="Training Sessions"
            value={metrics.filter(m => new Date(m.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            icon={Calendar}
            change={{
              value: "8.3%",
              isPositive: true,
              label: "this month"
            }}
          />
          
          <StatsCard
            title="Avg. Performance"
            value={metrics.length > 0 
              ? (metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length).toFixed(1) 
              : "8.4"}
            icon={Activity}
            change={{
              value: "2.1%",
              isPositive: false,
              label: "vs last month"
            }}
          />
          
          <StatsCard
            title="Recovery Score"
            value="87%"
            icon={Heart}
            change={{
              value: "5.4%",
              isPositive: true,
              label: "vs yesterday"
            }}
          />
        </div>

        {/* Performance Chart and Nutrition Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <PerformanceChart metrics={metrics} />
          </div>
          <NutritionOverview logs={nutritionLogs} />
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
