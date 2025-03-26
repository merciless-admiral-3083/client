import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertNutritionLogSchema } from "../schema";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

const formSchema = insertNutritionLogSchema
  .extend({
    date: z.coerce.date(),
  })
  .omit({ userId: true });

type FormData = z.infer<typeof formSchema>;

interface NutritionFormProps {
  userId: number;
  onSuccess?: () => void;
}

export function NutritionForm({ userId, onSuccess }: NutritionFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealType: "Breakfast",
      foodItems: "",
      date: new Date(),
    },
  });

  // Mutation for analyzing nutrition content
  const nutritionAnalysisMutation = useMutation({
    mutationFn: async (foodItems: string) => {
      const res = await apiRequest("POST", "/api/nutrition/analyze", { foodItems });
      return res.json();
    },
    onSuccess: (data) => {
      form.setValue("calories", data.calories);
      form.setValue("protein", data.protein);
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Watch for changes to the foodItems field
  const foodItems = form.watch("foodItems");

  // Analyze nutrition when food items change
  const handleFoodItemsChange = (value: string) => {
    form.setValue("foodItems", value);
    
    // Only trigger analysis if there's substantial input
    if (value.trim().length > 10) {
      // Add a small delay to avoid too many API calls while typing
      const timer = setTimeout(() => {
        nutritionAnalysisMutation.mutate(value);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/nutrition", {
        ...data,
        userId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition", userId.toString()] });
      toast({
        title: "Nutrition log saved",
        description: "Your nutrition log has been recorded",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };
  
  const mealTypes = [
    "Breakfast",
    "Morning Snack",
    "Lunch",
    "Afternoon Snack",
    "Dinner",
    "Evening Snack",
    "Pre-Workout",
    "Post-Workout",
    "Supplement"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="mealType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="foodItems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Items</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List the foods you ate (e.g., Grilled chicken, brown rice, vegetables)" 
                  value={field.value}
                  onChange={(e) => handleFoodItemsChange(e.target.value)}
                />
              </FormControl>
              {nutritionAnalysisMutation.isPending && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing nutrition content...
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="calories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calories (kcal)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Auto-calculated from food items"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein (g)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Auto-calculated from food items"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes about this meal" 
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Nutrition Log"}
        </Button>
      </form>
    </Form>
  );
}
