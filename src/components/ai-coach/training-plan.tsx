import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Dumbbell, 
  Calendar, 
  Check, 
  ChevronRight, 
  AlertCircle,
  Clock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrainingPlanProps {
  userId: number;
}

type TrainingPlanResponse = {
  plan: string;
  schedule: {
    [key: string]: {
      focus: string;
      exercises: string[];
      duration: string;
      intensity: string;
    }
  };
  guidelines: string[];
};

export function TrainingPlan({ userId }: TrainingPlanProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlanResponse | null>(null);
  
  // Form state
  const [level, setLevel] = useState("intermediate");
  const [goals, setGoals] = useState("");
  const [constraints, setConstraints] = useState("");
  
  const generatePlan = async () => {
    if (!goals.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your training goals",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const constraintsList = constraints
        .split('\n')
        .filter(line => line.trim().length > 0);
      
      const response = await apiRequest("POST", "/api/ai-coach/training-plan", {
        level,
        goals,
        constraints: constraintsList
      });
      
      const data = await response.json();
      setTrainingPlan(data);
      
      toast({
        title: "Training Plan Generated",
        description: "Your personalized training plan is ready",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate training plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    const intensityLower = intensity.toLowerCase();
    if (intensityLower.includes("high")) return "bg-red-500/20 text-red-500";
    if (intensityLower.includes("medium")) return "bg-yellow-500/20 text-yellow-500";
    if (intensityLower.includes("low")) return "bg-green-500/20 text-green-500";
    return "bg-blue-500/20 text-blue-500";
  };

  return (
    <div>
      {!trainingPlan ? (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Generate Training Plan</h2>
          <p className="text-muted-foreground mb-4">
            Get a personalized training plan based on your fitness level, goals, and constraints
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fitness Level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your fitness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Your Training Goals</label>
              <Textarea
                placeholder="E.g., Improve 10k run time, increase strength, prepare for competition..."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Constraints (one per line, optional)
              </label>
              <Textarea
                placeholder="E.g., Limited to 4 sessions per week&#10;No heavy weights due to back injury&#10;Access to gym on weekdays only"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                List any time constraints, equipment limitations, or injuries
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={generatePlan} 
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Generate Training Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Your Training Plan</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setTrainingPlan(null)}
            >
              Create New Plan
            </Button>
          </div>
          
          <Card className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                <p>{trainingPlan.plan}</p>
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Weekly Schedule
                </h3>
                
                {Object.entries(trainingPlan.schedule).map(([day, workout], index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-lg">{day}</h4>
                      <Badge 
                        variant="outline" 
                        className={getIntensityColor(workout.intensity)}
                      >
                        {workout.intensity} Intensity
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{workout.duration}</span>
                    </div>
                    
                    <div className="mb-2 font-medium">{workout.focus}</div>
                    
                    <ul className="space-y-1">
                      {workout.exercises.map((exercise, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-primary" />
                          <span>{exercise}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              {trainingPlan.guidelines.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-primary" />
                    Important Guidelines
                  </h3>
                  <ul className="space-y-2">
                    {trainingPlan.guidelines.map((guideline, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground text-center">
            Generating your personalized training plan...
          </p>
          <p className="text-muted-foreground text-center text-sm mt-2">
            This may take a moment as your AI coach creates the optimal program for your goals
          </p>
        </div>
      )}
    </div>
  );
}
