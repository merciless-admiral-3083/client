import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NutritionLog } from "server/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface NutritionOverviewProps {
  logs: NutritionLog[];
}

// Define color scheme
const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

// Calculate daily nutritional breakdown from logs
const calculateNutritionBreakdown = (logs: NutritionLog[]) => {
  if (logs.length === 0) {
    return [
      { name: "Protein", value: 40, color: COLORS[0] },
      { name: "Carbs", value: 30, color: COLORS[1] },
      { name: "Fats", value: 20, color: COLORS[2] },
      { name: "Others", value: 10, color: COLORS[3] },
    ];
  }
  return [
    { name: "Protein", value: 40, color: COLORS[0] },
    { name: "Carbs", value: 30, color: COLORS[1] },
    { name: "Fats", value: 20, color: COLORS[2] },
    { name: "Others", value: 10, color: COLORS[3] },
  ];
};

export function NutritionOverview({ logs }: NutritionOverviewProps) {
  const nutritionData = calculateNutritionBreakdown(logs);
  
  // Calculate calories
  const todaysCalories = logs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const dailyCalorieGoal = 2800;
  const remainingCalories = dailyCalorieGoal - todaysCalories;

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Nutrition Overview</h2>
          <Button variant="link" size="sm" className="text-xs text-primary p-0">
            View All
          </Button>
        </div>
        <div className="h-[200px] mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nutritionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name} (${value}%)`}
              >
                {nutritionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, "Percentage"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-2">
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-muted-foreground">Daily Calorie Goal</span>
            <span className="font-semibold">{dailyCalorieGoal} kcal</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-muted-foreground">Consumed Today</span>
            <span className="font-semibold">{todaysCalories} kcal</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-semibold text-primary">{remainingCalories} kcal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
