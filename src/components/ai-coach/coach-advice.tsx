import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Check } from "lucide-react";

interface CoachAdviceProps {
  userId: number;
  context: {
    performanceHistory?: string;
    nutritionLogs?: string;
    injuries?: string;
  };
}

type AdviceResponse = {
  advice: string;
  suggestedActions: string[];
  confidence: number;
};

export function CoachAdvice({ userId, context }: CoachAdviceProps) {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  
  const getAdvice = async () => {
    if (!question.trim()) {
      toast({
        title: "Missing question",
        description: "Please enter a question for the AI coach",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/ai-coach/advice", {
        question,
        context
      });
      
      const data = await response.json();
      setAdvice(data);
      
      toast({
        title: "AI Coach Response",
        description: "New advice received",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to get advice from AI coach",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Ask Your AI Coach</h2>
        <p className="text-muted-foreground mb-4">
          Get personalized advice based on your performance data, nutrition logs, and injury history
        </p>
        
        <div className="space-y-4">
          <Textarea
            placeholder="Ask a question about training, nutrition, recovery, or performance..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={getAdvice} 
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Advice...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Get AI Advice
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {advice && (
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">AI Coach Advice</h3>
              <div className={`text-xs flex items-center ${getConfidenceColor(advice.confidence)}`}>
                Confidence: {Math.round(advice.confidence * 100)}%
              </div>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <p>{advice.advice}</p>
            </div>
            
            {advice.suggestedActions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Suggested Actions</h4>
                <ul className="space-y-2">
                  {advice.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {!advice && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 bg-card/50 rounded-lg border border-dashed border-border">
          <MessageSquare className="h-12 w-12 text-primary/50 mb-4" />
          <p className="text-muted-foreground text-center">
            Ask your AI coach a question to get personalized advice
          </p>
          <p className="text-muted-foreground text-center text-sm mt-2">
            Example: "How can I improve my sprint technique?" or "What should I eat before a competition?"
          </p>
        </div>
      )}
    </div>
  );
}
