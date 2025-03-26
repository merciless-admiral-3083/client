import { useState } from "react";
import { useAuth } from "..//hooks/use-auth";
import { AppLayout } from "..//components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "..//components/ui/card";
import { CoachAdvice } from "..//components/ai-coach/coach-advice";
import { TrainingPlan } from "..//components/ai-coach/training-plan";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "..//components/ui/tabs";
import { PerformanceMetric, NutritionLog, Injury } from "../components/schema";
import { Loader2, Lightbulb, Dumbbell, Brain } from "lucide-react";

export default function AiCoachPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("advice");
  
  // Fetch data for context
  const { data: metrics = [], isLoading: isMetricsLoading } = useQuery<PerformanceMetric[]>({
    queryKey: ["/api/metrics", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  const { data: nutritionLogs = [], isLoading: isNutritionLoading } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  const { data: injuries = [], isLoading: isInjuriesLoading } = useQuery<Injury[]>({
    queryKey: ["/api/injuries", user?.id.toString()],
    enabled: !!user?.id,
  });
  
  const isLoading = isMetricsLoading || isNutritionLoading || isInjuriesLoading;
  
  // Prepare context data for AI
  const preparePerformanceContext = () => {
    if (metrics.length === 0) return "No performance data recorded yet.";
    
    return metrics
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(m => `${m.metricType}: ${m.value} ${m.unit} on ${new Date(m.date).toLocaleDateString()}`)
      .join("; ");
  };
  
  const prepareNutritionContext = () => {
    if (nutritionLogs.length === 0) return "No nutrition data recorded yet.";
    
    return nutritionLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(log => {
        let text = `${log.mealType} on ${new Date(log.date).toLocaleDateString()}: ${log.foodItems}`;
        if (log.calories) text += `, ${log.calories} calories`;
        if (log.protein) text += `, ${log.protein}g protein`;
        return text;
      })
      .join("; ");
  };
  
  const prepareInjuryContext = () => {
    if (injuries.length === 0) return "No injury data recorded yet.";
    
    return injuries
      .map(injury => {
        return `${injury.injuryType} (${injury.bodyPart}): ${injury.status}, severity: ${injury.severity}, occurred on ${new Date(injury.dateOccurred).toLocaleDateString()}`;
      })
      .join("; ");
  };
  
  const context = {
    performanceHistory: preparePerformanceContext(),
    nutritionLogs: prepareNutritionContext(),
    injuries: prepareInjuryContext()
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Coach</h1>
          <p className="text-muted-foreground mt-1">
            Get personalized advice and training plans powered by AI
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <CardTitle>AI Coach</CardTitle>
                </div>
                <CardDescription>
                  Your personal AI-powered athletic coach
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  The AI Coach uses advanced machine learning to provide personalized advice and
                  training plans based on your performance data, nutrition logs, and injury history.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-primary/20 p-1 rounded mr-2 mt-0.5">
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Personalized Advice</span>
                      <p className="text-muted-foreground">Get tailored recommendations based on your data</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/20 p-1 rounded mr-2 mt-0.5">
                      <Dumbbell className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Custom Training Plans</span>
                      <p className="text-muted-foreground">Generate workout schedules optimized for your goals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Snapshot</CardTitle>
                <CardDescription>
                  Information used by the AI
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Performance Metrics</h3>
                  <p className="text-muted-foreground">
                    {metrics.length === 0 
                      ? "No performance data recorded yet" 
                      : `${metrics.length} metrics recorded`}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Nutrition Logs</h3>
                  <p className="text-muted-foreground">
                    {nutritionLogs.length === 0 
                      ? "No nutrition data recorded yet" 
                      : `${nutritionLogs.length} meals recorded`}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Injury Records</h3>
                  <p className="text-muted-foreground">
                    {injuries.length === 0 
                      ? "No injuries recorded yet" 
                      : `${injuries.length} injuries recorded (${injuries.filter(i => i.status === "Active").length} active)`}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                More data leads to more personalized advice from your AI coach
              </CardFooter>
            </Card>
          </div>
          
          <div className="md:w-2/3">
            <Card className="h-full">
              <CardHeader>
                <div className="w-full">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
                      <TabsTrigger value="advice" className="flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Get Advice
                      </TabsTrigger>
                      <TabsTrigger value="training" className="flex items-center">
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Training Plan
                      </TabsTrigger>
                    </TabsList>
                  
                    <div className="p-0 mt-6">
                      <TabsContent value="advice" className="p-6 m-0 border rounded-lg">
                        <CoachAdvice 
                          userId={user?.id || 0} 
                          context={context}
                        />
                      </TabsContent>
                      <TabsContent value="training" className="p-6 m-0 border rounded-lg">
                        <TrainingPlan 
                          userId={user?.id || 0}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Content moved inside Tabs component */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
