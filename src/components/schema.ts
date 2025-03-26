import { pgTable, text, serial, integer, date, timestamp, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").default("Athlete"),
  role: text("role").default("Athlete"),
  weight: doublePrecision("weight").default(0),
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000),
  heightCm: integer("height_cm").default(175),
  age: integer("age").default(30),
  gender: text("gender").default("Not specified"),
  activityLevel: text("activity_level").default("Moderate"),
  state: text("state"),
  sport: text("sport"),
  academyAffiliation: text("academy_affiliation"),
  nationalLevel: boolean("national_level").default(false),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull().default(sql`CURRENT_DATE`),
  metricType: text("metric_type").notNull(),
  value: doublePrecision("value").notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
});

export const nutritionLogs = pgTable("nutrition_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull().default(sql`CURRENT_DATE`),
  mealType: text("meal_type").notNull(),
  foodItems: text("food_items").notNull(),
  calories: integer("calories"),
  protein: integer("protein"),
  notes: text("notes"),
});

export const injuries = pgTable("injuries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  injuryType: text("injury_type").notNull(),
  bodyPart: text("body_part").notNull(),
  dateOccurred: date("date_occurred").notNull().default(sql`CURRENT_DATE`),
  status: text("status").notNull().default("Active"),
  severity: text("severity").notNull(),
  notes: text("notes"),
});

export const finances = pgTable("finances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull().default(sql`CURRENT_DATE`),
  category: text("category").notNull(),
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  isIncome: boolean("is_income").notNull().default(false),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  weight: true,
  dailyCalorieGoal: true,
  heightCm: true,
  age: true,
  gender: true,
  activityLevel: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).pick({
  userId: true,
  date: true,
  metricType: true,
  value: true,
  unit: true,
  notes: true,
});

export const insertNutritionLogSchema = createInsertSchema(nutritionLogs).pick({
  userId: true,
  date: true,
  mealType: true,
  foodItems: true,
  calories: true,
  protein: true,
  notes: true,
});

export const insertInjurySchema = createInsertSchema(injuries).pick({
  userId: true,
  injuryType: true,
  bodyPart: true,
  dateOccurred: true,
  status: true,
  severity: true,
  notes: true,
});

export const insertFinanceSchema = createInsertSchema(finances).pick({
  userId: true,
  date: true,
  category: true,
  amount: true,
  description: true,
  isIncome: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;

export type InsertNutritionLog = z.infer<typeof insertNutritionLogSchema>;
export type NutritionLog = typeof nutritionLogs.$inferSelect;

export type InsertInjury = z.infer<typeof insertInjurySchema>;
export type Injury = typeof injuries.$inferSelect;

export type InsertFinance = z.infer<typeof insertFinanceSchema>;
export type Finance = typeof finances.$inferSelect;

// Helper function to generate SQL for default date values
function sql(strings: TemplateStringsArray): string {
  return strings[0];
}
