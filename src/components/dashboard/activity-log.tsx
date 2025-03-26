import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PerformanceMetric, NutritionLog, Injury } from "server/schema";
import { BarChart3, Utensils, ClipboardCheck } from "lucide-react";

interface ActivityLogProps {
  metrics: PerformanceMetric[];
  nutritionLogs: NutritionLog[];
  injuries: Injury[];
}

interface Activity {
  id: number;
  type: 'performance' | 'nutrition' | 'measurement';
  title: string;
  description: string;
  time: string;
  rating?: number;
  tags?: { text: string; color: string }[];
  change?: { value: string; positive: boolean };
}

export function ActivityLog({ metrics, nutritionLogs, injuries }: ActivityLogProps) {
  // Build activity list from the various data sources
  const buildActivityList = (): Activity[] => {
    const activities: Activity[] = [];
    
    // Add performance metrics as activities
    metrics.slice(0, 3).forEach((metric, index) => {
      activities.push({
        id: metric.id,
        type: 'performance',
        title: metric.metricType,
        description: `Recorded ${metric.value} ${metric.unit}${metric.notes ? ` - ${metric.notes}` : ''}`,
        time: formatTime(new Date(metric.date)),
        rating: 8.5, // This would be dynamic in a real app
      });
    });
    
    // Add nutrition logs as activities
    nutritionLogs.slice(0, 3).forEach((log) => {
      activities.push({
        id: log.id,
        type: 'nutrition',
        title: `${log.mealType} Log`,
        description: log.foodItems,
        time: formatTime(new Date(log.date)),
        tags: [
          { text: `${log.calories || 0} kcal`, color: 'bg-chart-3/20 text-chart-3' },
          { text: `${log.protein || 0}g protein`, color: 'bg-primary/20 text-primary' },
        ],
      });
    });
    
    // Add a sample measurement activity
    activities.push({
      id: 0,
      type: 'measurement',
      title: 'Weight Measurement',
      description: 'Recorded morning weight: 82.5 kg',
      time: 'Yesterday',
      change: { value: '0.5 kg', positive: true },
    });
    
    // Sort activities by time (most recent first)
    return activities.sort((a, b) => {
      if (a.time === b.time) return 0;
      if (a.time === 'Now') return -1;
      if (b.time === 'Now') return 1;
      if (a.time === 'Today') return -1;
      if (b.time === 'Today') return 1;
      if (a.time === 'Yesterday') return -1;
      if (b.time === 'Yesterday') return 1;
      return 0;
    });
  };
  
  const activities = buildActivityList();
  
  // Helper to format time
  function formatTime(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  }
  
  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'nutrition':
        return <Utensils className="h-4 w-4" />;
      case 'measurement':
        return <ClipboardCheck className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };
  
  // Get color for activity icon background
  const getActivityIconBg = (type: string) => {
    switch (type) {
      case 'performance':
        return 'bg-primary/20 text-primary';
      case 'nutrition':
        return 'bg-chart-3/20 text-chart-3';
      case 'measurement':
        return 'bg-chart-5/20 text-chart-5';
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Recent Activity</h2>
          <Button variant="link" size="sm" className="text-xs text-primary p-0">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-border">
              <div className={`h-8 w-8 rounded-full ${getActivityIconBg(activity.type)} flex items-center justify-center`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{activity.title}</h4>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                
                {activity.rating && (
                  <div className="mt-1 flex items-center">
                    <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-chart-2 rounded-full" 
                        style={{ width: `${(activity.rating / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-muted-foreground">{activity.rating}/10</span>
                  </div>
                )}
                
                {activity.tags && (
                  <div className="mt-1 flex items-center text-xs space-x-2">
                    {activity.tags.map((tag, idx) => (
                      <span key={idx} className={`${tag.color} px-2 py-0.5 rounded-full`}>
                        {tag.text}
                      </span>
                    ))}
                  </div>
                )}
                
                {activity.change && (
                  <div className="mt-1 text-xs flex items-center">
                    <span className={activity.change.positive ? "text-green-500 flex items-center" : "text-red-500 flex items-center"}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3 w-3 mr-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d={activity.change.positive 
                            ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                            : "M19 14l-7 7m0 0l-7-7m7 7V3"
                          } 
                        />
                      </svg>
                      {activity.change.value}
                    </span>
                    <span className="text-muted-foreground ml-2">from last week</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
