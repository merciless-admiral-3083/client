import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Injury } from "server/schema";
import { XCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InjuryForm } from "@/components/forms/injury-form";

interface InjuryTrackerProps {
  injuries: Injury[];
  userId: number;
  onAddInjury: () => void;
}

export function InjuryTracker({ injuries, userId, onAddInjury }: InjuryTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const activeInjuries = injuries.filter(injury => injury.status === "Active");
  const recoveredInjuries = injuries.filter(injury => injury.status === "Recovered");
  
  // Combine and limit to 3 items for display
  const displayInjuries = [...activeInjuries, ...recoveredInjuries].slice(0, 3);
  
  const handleInjuryAdded = () => {
    setIsDialogOpen(false);
    onAddInjury();
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Injury Tracker</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs">Record</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Injury</DialogTitle>
              </DialogHeader>
              <InjuryForm userId={userId} onSuccess={handleInjuryAdded} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-3">
          {displayInjuries.length > 0 ? (
            displayInjuries.map((injury) => (
              <div 
                key={injury.id} 
                className={`flex items-center justify-between p-3 rounded-lg border
                  ${injury.status === "Active" 
                    ? "bg-red-500/10 border-red-500/30" 
                    : "bg-card border-border"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center
                    ${injury.status === "Active" 
                      ? "bg-red-500/20 text-red-500" 
                      : "bg-green-500/20 text-green-500"
                    }`}
                  >
                    {injury.status === "Active" ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <div>{injury.injuryType} - {injury.bodyPart}</div>
                    <span className="text-xs text-muted-foreground">
                      Reported: {new Date(injury.dateOccurred).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full
                  ${injury.status === "Active" 
                    ? "bg-red-500/20 text-red-500" 
                    : "bg-green-500/20 text-green-500"
                  }`}
                >
                  {injury.status}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No injuries recorded</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsDialogOpen(true)}
              >
                Record your first injury
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
