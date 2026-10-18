export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  
  // Format as Indian Rupee Crores (Cr) or Lakhs (L) for large sums
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(1);
    return `₹${cr} Cr`;
  }
  if (amount >= 100000) {
    const l = (amount / 100000).toFixed(0);
    return `₹${l}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndianNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

export interface WorkloadStatus {
  label: 'Unallocated' | 'Available' | 'High Workload' | 'Fully Allocated' | 'Overallocated';
  badgeClass: string;
  barColor: string;
}

export function getWorkloadStatus(percentage: number): WorkloadStatus {
  if (percentage === 0) {
    return {
      label: 'Unallocated',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      barColor: '#94a3b8',
    };
  }
  if (percentage > 0 && percentage <= 80) {
    return {
      label: 'Available',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      barColor: '#10b981',
    };
  }
  if (percentage > 80 && percentage < 100) {
    return {
      label: 'High Workload',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      barColor: '#f59e0b',
    };
  }
  if (percentage === 100) {
    return {
      label: 'Fully Allocated',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      barColor: '#3b82f6',
    };
  }
  return {
    label: 'Overallocated',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    barColor: '#ef4444',
  };
}

export function calculateBudgetUtilization(budget: number, spent: number): {
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
} {
  if (!budget || budget <= 0) {
    return {
      percentage: spent > 0 ? 100 : 0,
      remaining: -spent,
      isOverBudget: spent > 0,
    };
  }
  const percentage = Math.min(100, Math.round((spent / budget) * 100));
  const remaining = Math.max(0, budget - spent);
  return {
    percentage,
    remaining,
    isOverBudget: spent > budget,
  };
}
