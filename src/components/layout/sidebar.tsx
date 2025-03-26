import { useAuth } from "../../hooks/use-auth";
import { cn } from "../../lib/utils";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Home, 
  Utensils,
  XCircle, 
  DollarSign, 
  Lightbulb, 
  Settings,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Performance", href: "/performance", icon: BarChart3 },
    { name: "Nutrition", href: "/nutrition", icon: Utensils },
    { name: "Injuries", href: "/injuries", icon: XCircle },
    { name: "Finances", href: "/finances", icon: DollarSign },
    { name: "AI Coach", href: "/ai-coach", icon: Lightbulb },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className={cn("hidden md:flex flex-col w-64 bg-sidebar border-r border-border", className)}>
      <div className="p-4 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h1 className="text-xl font-bold">AthleteTrack</h1>
      </div>
      
      <div className="px-4 py-2">
        <div className="bg-secondary/20 rounded-lg p-3 flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">
              {user?.name?.substring(0, 2).toUpperCase() || user?.username?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user?.name || user?.username}</div>
            <div className="text-xs text-muted-foreground">{user?.role || "Athlete"}</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 py-2 px-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 mt-auto border-t border-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 py-2 px-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
