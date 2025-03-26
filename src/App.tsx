import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster.tsx";
import NotFound from "@/pages/not-found.tsx";
import AuthPage from "@/pages/auth-page.tsx";
import { AuthProvider } from "@/hooks/use-auth.tsx";
import { ProtectedRoute } from "@/lib/protected-route.tsx";
import DashboardPage from "@/pages/dashboard-page.tsx";
import PerformancePage from "@/pages/performance-page.tsx";
import NutritionPage from "@/pages/nutrition-page.tsx";
import InjuriesPage from "@/pages/injuries-page.tsx";
import FinancesPage from "@/pages/finances-page.tsx";
import AiCoachPage from "@/pages/ai-coach-page.tsx";
import SettingsPage from "@/pages/settings-page.tsx";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/performance" component={PerformancePage} />
      <ProtectedRoute path="/nutrition" component={NutritionPage} />
      <ProtectedRoute path="/injuries" component={InjuriesPage} />
      <ProtectedRoute path="/finances" component={FinancesPage} />
      <ProtectedRoute path="/ai-coach" component={AiCoachPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
