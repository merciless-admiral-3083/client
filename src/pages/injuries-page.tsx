import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { InjuryForm } from "@/components/forms/injury-form";
import { Injury } from "server/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Loader2, Plus, XCircle, CheckCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function InjuriesPage() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "recovered">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch injuries
  const {
    data: injuries = [],
    isLoading,
    refetch,
  } = useQuery<Injury[]>({
    queryKey: ["/api/injuries", user?.id.toString()],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  // Filter injuries by selected status
  const filteredInjuries = selectedStatus === "all"
    ? injuries
    : injuries.filter(injury => 
        selectedStatus === "active" 
          ? injury.status === "Active" 
          : injury.status === "Recovered"
      );
  
  // Injury statistics
  const activeInjuries = injuries.filter(i => i.status === "Active").length;
  const recoveredInjuries = injuries.filter(i => i.status === "Recovered").length;
  const totalInjuries = injuries.length;
  
  // Body part distribution
  const bodyPartData = Array.from(
    injuries.reduce((acc, injury) => {
      if (!acc.has(injury.bodyPart)) {
        acc.set(injury.bodyPart, 0);
      }
      acc.set(injury.bodyPart, acc.get(injury.bodyPart)! + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));
  
  // Injury type distribution
  const injuryTypeData = Array.from(
    injuries.reduce((acc, injury) => {
      if (!acc.has(injury.injuryType)) {
        acc.set(injury.injuryType, 0);
      }
      acc.set(injury.injuryType, acc.get(injury.injuryType)! + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));
  
  // Severity distribution
  const severityData = Array.from(
    injuries.reduce((acc, injury) => {
      if (!acc.has(injury.severity)) {
        acc.set(injury.severity, 0);
      }
      acc.set(injury.severity, acc.get(injury.severity)! + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));
  
  // Status distribution for pie chart
  const statusData = [
    { name: "Active", value: activeInjuries, color: "hsl(var(--chart-4))" },
    { name: "Recovered", value: recoveredInjuries, color: "hsl(var(--chart-2))" }
  ];
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "bg-yellow-500/20 text-yellow-500";
      case "moderate":
        return "bg-orange-500/20 text-orange-500";
      case "severe":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  const getStatusColor = (status: string) => {
    return status === "Active" 
      ? "bg-red-500/20 text-red-500" 
      : "bg-green-500/20 text-green-500";
  };
  
  const getStatusIcon = (status: string) => {
    return status === "Active" 
      ? <XCircle className="h-5 w-5" /> 
      : <CheckCircle className="h-5 w-5" />;
  };
  
  const handleNewInjury = () => {
    setIsDialogOpen(false);
    refetch();
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Injury Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your injuries and recovery progress
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0 flex items-center" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Record Injury
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Injury</DialogTitle>
              </DialogHeader>
              <InjuryForm userId={user?.id || 0} onSuccess={handleNewInjury} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Injury Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Active Injuries</div>
                  <div className="text-3xl font-bold">{activeInjuries}</div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-card/50 rounded-lg border border-border">
                  <div className="text-muted-foreground text-xs">Recovered</div>
                  <div className="text-xl font-semibold">{recoveredInjuries}</div>
                </div>
                <div className="p-3 bg-card/50 rounded-lg border border-border">
                  <div className="text-muted-foreground text-xs">Total</div>
                  <div className="text-xl font-semibold">{totalInjuries}</div>
                </div>
              </div>
              
              <div className="mt-4 h-[140px]">
                {totalInjuries > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        label
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No injury data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Injury Records</CardTitle>
                  <CardDescription>
                    {filteredInjuries.length} injuries
                  </CardDescription>
                </div>
                
                <Tabs value={selectedStatus} onValueChange={setSelectedStatus as any} className="w-[250px] mt-4 sm:mt-0">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                    <TabsTrigger value="recovered" className="text-xs">Recovered</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInjuries.length > 0 ? (
                <div className="space-y-4">
                  {filteredInjuries
                    .sort((a, b) => {
                      // Sort by status first (Active first)
                      if (a.status !== b.status) {
                        return a.status === "Active" ? -1 : 1;
                      }
                      // Then by date (most recent first)
                      return new Date(b.dateOccurred).getTime() - new Date(a.dateOccurred).getTime();
                    })
                    .map(injury => (
                      <div 
                        key={injury.id} 
                        className={`p-4 rounded-lg border ${
                          injury.status === "Active" 
                            ? "bg-red-500/5 border-red-500/30" 
                            : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                            getStatusColor(injury.status)
                          }`}>
                            {getStatusIcon(injury.status)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between">
                              <div>
                                <h3 className="font-medium">{injury.injuryType}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {injury.bodyPart} • Occurred {formatDistanceToNow(new Date(injury.dateOccurred), { addSuffix: true })}
                                </p>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
                                <Badge variant="outline" className={getStatusColor(injury.status)}>
                                  {injury.status}
                                </Badge>
                                <Badge variant="outline" className={getSeverityColor(injury.severity)}>
                                  {injury.severity}
                                </Badge>
                              </div>
                            </div>
                            
                            {injury.notes && (
                              <p className="text-sm mt-2 bg-background/50 p-2 rounded">
                                {injury.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center bg-card/50 rounded-lg border border-dashed border-border">
                  <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No injuries recorded</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Record Your First Injury
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Body Part Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {bodyPartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bodyPartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted))" }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted))" }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))"
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 4, 4, 0]} 
                        name="Count"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Injury Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {injuryTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={injuryTypeData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted))" }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted))" }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))"
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--chart-3))" 
                        radius={[0, 4, 4, 0]} 
                        name="Count"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {severityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={severityData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted))" }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted))" }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))"
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--chart-4))" 
                        radius={[0, 4, 4, 0]} 
                        name="Count"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
