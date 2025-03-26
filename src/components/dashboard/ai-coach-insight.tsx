import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Lightbulb } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";

interface AiCoachInsightProps {
  userId: number;
}

interface TrainingDay {
  day: string;
  focus: string;
  status: 'completed' | 'today' | 'upcoming';
}

export function AiCoachInsight({ userId }: AiCoachInsightProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState({
    topic: "Recovery Optimization",
    content: "Based on your recent training load and sleep patterns, your recovery is slightly compromised. Consider implementing active recovery techniques and focus on quality sleep this week.",
    actions: [
      "Increase hydration to 3-4 liters daily",
      "Schedule 20-minute mobility sessions",
      "Prioritize 8+ hours of sleep this week"
    ]
  });
  
  const [trainingFocus, setTrainingFocus] = useState<TrainingDay[]>([
    { day: "Monday", focus: "Strength: Lower body focus, 5x5 squats", status: "completed" },
    { day: "Wednesday", focus: "HIIT: 30 min session, 30s work/30s rest", status: "today" },
    { day: "Friday", focus: "Endurance: 45 min steady state cardio", status: "upcoming" }
  ]);

  const getNewAdvice = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai-coach/advice", {
        question: "What should I focus on to improve my performance this week?",
        context: {
          performanceHistory: "Recent training includes strength work and HIIT sessions",
          nutritionLogs: "Averaging 2500 calories with 150g protein daily",
          injuries: "Minor ankle discomfort"
        }
      });
      
      const data = await response.json();
      
      setAdvice({
        topic: "Weekly Performance Focus",
        content: data.advice,
        actions: data.suggestedActions
      });
      
      toast({
        title: "New coaching advice received",
        description: "Your personalized advice has been updated"
      });
    } catch (error) {
      toast({
        title: "Failed to get new advice",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">AI Coach Insights</h2>
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs text-primary p-0"
            onClick={getNewAdvice}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Get New Advice"}
          </Button>
        </div>
        
        <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium mb-2">{advice.topic}</h3>
              <p className="text-sm text-muted-foreground mb-2">{advice.content}</p>
              <div className="space-y-2">
                {advice.actions.map((action, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 text-primary mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="font-medium mb-3">This Week's Training Focus</h3>
        <div className="space-y-3">
          {trainingFocus.map((day, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{day.day}</h4>
                <StatusBadge status={day.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{day.focus}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: 'completed' | 'today' | 'upcoming' }) {
  switch(status) {
    case 'completed':
      return (
        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
          Completed
        </span>
      );
    case 'today':
      return (
        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
          Today
        </span>
      );
    case 'upcoming':
      return (
        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
          Upcoming
        </span>
      );
  }
}
