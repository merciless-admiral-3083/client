import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Finance } from "../schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { FinanceForm } from "../../components/forms/finance-form";

interface FinancialSummaryProps {
  finances: Finance[];
  userId: number;
  onAddFinance: () => void;
}

export function FinancialSummary({ finances, userId, onAddFinance }: FinancialSummaryProps) {
  const [timeRange, setTimeRange] = useState("30");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter finances based on selected time range
  const getFilteredFinances = () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - parseInt(timeRange));
    
    return finances.filter(finance => new Date(finance.date) >= pastDate);
  };

  const filteredFinances = getFilteredFinances();
  
  // Calculate summary metrics
  const calculateSummary = () => {
    const expenses = filteredFinances.filter(f => !f.isIncome).reduce((sum, f) => sum + f.amount, 0);
    const income = filteredFinances.filter(f => f.isIncome).reduce((sum, f) => sum + f.amount, 0);
    const balance = income - expenses;
    
    // In a real app, these percentages would be calculated from previous periods
    return {
      expenses: {
        amount: expenses,
        percentChange: 12.3,
        isPositive: false
      },
      income: {
        amount: income,
        percentChange: 5.2,
        isPositive: true
      },
      balance: {
        amount: balance,
        percentChange: 2.8,
        isPositive: true
      }
    };
  };

  const summary = calculateSummary();
  
  const handleFinanceAdded = () => {
    setIsDialogOpen(false);
    onAddFinance();
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Financial Summary</h2>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">This Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs">Add Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Financial Transaction</DialogTitle>
                </DialogHeader>
                <FinanceForm userId={userId} onSuccess={handleFinanceAdded} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Finance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FinanceSummaryCard 
            title="Total Expenses" 
            amount={summary.expenses.amount} 
            percentChange={summary.expenses.percentChange}
            isPositive={summary.expenses.isPositive}
          />
          
          <FinanceSummaryCard 
            title="Income" 
            amount={summary.income.amount} 
            percentChange={summary.income.percentChange}
            isPositive={summary.income.isPositive}
          />
          
          <FinanceSummaryCard 
            title="Balance" 
            amount={summary.balance.amount} 
            percentChange={summary.balance.percentChange}
            isPositive={summary.balance.isPositive}
          />
        </div>
        
        {/* Expenses List */}
        <h3 className="font-medium mb-3">Recent Expenses</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-muted-foreground text-xs">
                <th className="pb-2">Date</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredFinances.length > 0 ? (
                filteredFinances
                  .filter(finance => !finance.isIncome)  // Only show expenses here
                  .slice(0, 5)  // Limit to 5 items
                  .map((finance) => (
                    <tr key={finance.id} className="border-t border-border">
                      <td className="py-3 text-sm">{new Date(finance.date).toISOString().split('T')[0]}</td>
                      <td className="py-3">
                        <CategoryBadge category={finance.category} />
                      </td>
                      <td className="py-3 text-sm">{finance.description || 'N/A'}</td>
                      <td className="py-3 text-sm text-right">${finance.amount.toFixed(2)}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No expenses recorded in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function FinanceSummaryCard({ 
  title, 
  amount, 
  percentChange, 
  isPositive 
}: { 
  title: string; 
  amount: number; 
  percentChange: number; 
  isPositive: boolean; 
}) {
  return (
    <div className="p-3 bg-card rounded-lg border border-border">
      <div className="text-muted-foreground text-sm">{title}</div>
      <div className="text-xl font-bold mt-1">${amount.toFixed(2)}</div>
      <div className={`text-xs mt-1 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
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
            d={isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
          />
        </svg>
        {percentChange}% vs previous period
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  // Map categories to colors
  const categoryColors: Record<string, string> = {
    'Equipment': 'bg-primary/20 text-primary',
    'Nutrition': 'bg-chart-5/20 text-chart-5',
    'Training': 'bg-chart-3/20 text-chart-3',
    'Medical': 'bg-chart-4/20 text-chart-4',
    'Competition': 'bg-chart-2/20 text-chart-2',
    'Travel': 'bg-chart-1/20 text-chart-1',
    'Other': 'bg-muted text-muted-foreground'
  };
  
  const colorClass = categoryColors[category] || categoryColors.Other;
  
  return (
    <span className={`text-xs ${colorClass} px-2 py-0.5 rounded-full`}>
      {category}
    </span>
  );
}
