import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPerformanceMetricSchema } from "server/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertPerformanceMetricSchema
  .extend({
    date: z.coerce.date(),
  })
  .omit({ userId: true });

type FormData = z.infer<typeof formSchema>;

interface PerformanceFormProps {
  userId: number;
  onSuccess?: () => void;
}

export function PerformanceForm({ userId, onSuccess }: PerformanceFormProps) {
  const { toast } = useToast();
  const [metricType, setMetricType] = useState("Strength");
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metricType: "Strength",
      value: 0,
      unit: "kg",
      date: new Date(),
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/metrics", {
        ...data,
        userId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metrics", userId.toString()] });
      toast({
        title: "Performance recorded",
        description: "Your performance metric has been saved",
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
  
  // Define metric types with their default units
  const metricTypes = [
    { value: "Strength", units: ["kg", "lbs", "reps"] },
    { value: "Endurance", units: ["km", "miles", "minutes"] },
    { value: "Speed", units: ["km/h", "mph", "m/s"] },
    { value: "Flexibility", units: ["cm", "inches", "degrees"] },
    { value: "Power", units: ["watts", "joules"] },
  ];
  
  // Update units when metric type changes
  const handleMetricTypeChange = (value: string) => {
    setMetricType(value);
    const selectedType = metricTypes.find(type => type.value === value);
    if (selectedType && selectedType.units.length > 0) {
      form.setValue("unit", selectedType.units[0]);
    }
  };
  
  // Get available units for the selected metric type
  const getUnitsForMetricType = () => {
    const selectedType = metricTypes.find(type => type.value === metricType);
    return selectedType ? selectedType.units : [];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="metricType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metric Type</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleMetricTypeChange(value);
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {metricTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getUnitsForMetricType().map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  placeholder="Any additional notes about this performance" 
                  {...field}
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
          {mutation.isPending ? "Saving..." : "Save Performance"}
        </Button>
      </form>
    </Form>
  );
}
