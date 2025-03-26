import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, change, className }: StatsCardProps) {
  return (
    <Card className={cn("bg-card shadow-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{value}</span>
          {change && (
            <div className="flex items-center mt-1">
              <span className={cn(
                "text-sm flex items-center",
                change.isPositive ? "text-green-500" : "text-red-500"
              )}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={change.isPositive 
                      ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                      : "M19 14l-7 7m0 0l-7-7m7 7V3"
                    } 
                  />
                </svg>
                {change.value}
              </span>
              <span className="text-xs text-muted-foreground ml-2">{change.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
