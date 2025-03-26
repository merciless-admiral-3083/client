import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Home, 
  Utensils,
  XCircle, 
  DollarSign, 
  Lightbulb, 
  Settings,
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
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

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <header className="md:hidden bg-sidebar p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h1 className="text-lg font-bold">AthleteTrack</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-muted-foreground hover:text-foreground">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Mobile menu (overlay) */}
      <div className={cn(
        "md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 left-0 w-3/4 max-w-xs bg-sidebar p-4 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h1 className="text-lg font-bold">AthleteTrack</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="mb-6 p-3 bg-secondary/20 rounded-lg">
            <div className="font-medium">
              {user?.name || user?.username}
            </div>
            <div className="text-xs text-muted-foreground">
              {user?.role || "Athlete"}
            </div>
          </div>

          <nav className="flex flex-col space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
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

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 py-2 px-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
