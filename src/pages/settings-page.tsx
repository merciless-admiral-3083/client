import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ThemeProvider, useTheme } from "@/components/ui/theme-provider";
import { Settings, User, Moon, Sun, BellRing, BellOff, Lock, Mail } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const notificationsFormSchema = z.object({
  performanceUpdates: z.boolean().default(true),
  nutritionReminders: z.boolean().default(true),
  injuryAlerts: z.boolean().default(true),
  financialReports: z.boolean().default(false),
  aiCoachInsights: z.boolean().default(true),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme } = useTheme();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: "athlete@example.com", // Placeholder, would come from user object in a real app
    },
  });

  // Notifications form
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      performanceUpdates: true,
      nutritionReminders: true,
      injuryAlerts: true,
      financialReports: false,
      aiCoachInsights: true,
    },
  });

  function onProfileSubmit(data: ProfileFormValues) {
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated.",
    });
  }

  function onNotificationsSubmit(data: NotificationsFormValues) {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-6">
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-primary" />
                  <CardTitle>Your Settings</CardTitle>
                </div>
                <CardDescription>
                  Customize your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant={activeTab === "notifications" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <BellRing className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button
                    variant={activeTab === "appearance" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("appearance")}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Appearance
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground">{user?.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">March 2025</p>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3">
            <Card className="h-full">
              <CardContent className="p-6">
                {activeTab === "profile" && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Profile Information</h2>
                    <p className="text-muted-foreground mb-6">
                      Update your personal information and contact details
                    </p>

                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormDescription>
                                This is your full name displayed on your profile.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="username" {...field} />
                              </FormControl>
                              <FormDescription>
                                Your unique username for the platform.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="email@example.com" {...field} />
                              </FormControl>
                              <FormDescription>
                                Email address used for notifications and account recovery.
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        <Button type="submit">Save Changes</Button>
                      </form>
                    </Form>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
                    <p className="text-muted-foreground mb-6">
                      Customize which notifications you receive
                    </p>

                    <Form {...notificationsForm}>
                      <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                        <FormField
                          control={notificationsForm.control}
                          name="performanceUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <FormLabel>Performance Updates</FormLabel>
                                <FormDescription>
                                  Receive notifications about your performance metrics
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationsForm.control}
                          name="nutritionReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <FormLabel>Nutrition Reminders</FormLabel>
                                <FormDescription>
                                  Get reminders to log your meals and nutrition
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationsForm.control}
                          name="injuryAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <FormLabel>Injury Alerts</FormLabel>
                                <FormDescription>
                                  Receive alerts about injury recovery progress
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationsForm.control}
                          name="financialReports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <FormLabel>Financial Reports</FormLabel>
                                <FormDescription>
                                  Receive monthly financial summary reports
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationsForm.control}
                          name="aiCoachInsights"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
                              <div className="space-y-0.5">
                                <FormLabel>AI Coach Insights</FormLabel>
                                <FormDescription>
                                  Get notifications when your AI coach has new insights
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button type="submit">Save Preferences</Button>
                      </form>
                    </Form>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Appearance Settings</h2>
                    <p className="text-muted-foreground mb-6">
                      Customize the appearance and theme of your dashboard
                    </p>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Theme</h3>
                        <p className="text-sm text-muted-foreground">
                          Select your preferred theme for the application
                        </p>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant={theme === "light" ? "default" : "outline"}
                            className="flex items-center"
                            onClick={() => setTheme("light")}
                          >
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </Button>
                          <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            className="flex items-center"
                            onClick={() => setTheme("dark")}
                          >
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </Button>
                          <Button
                            variant={theme === "system" ? "default" : "outline"}
                            className="flex items-center"
                            onClick={() => setTheme("system")}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            System
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}