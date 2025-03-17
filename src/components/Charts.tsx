'use client';

import React, { ErrorInfo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface YearlyDataItem {
  name: string;
  income: number;
  expense: number;
}

interface MonthlyDataItem {
  name: string;
  value: number;
}

interface PieChartDataItem {
  name: string;
  value: number;
}

interface PredictionDataItem {
  month: string;
  income: number;
  expense: number;
  saving: number;
  cumulativeSaving: number;
}

// Error boundary for chart components
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Chart rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg p-4">
          <p className="text-gray-500">Unable to display chart</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export function YearlyBarChart({ data }: { data: YearlyDataItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#4F46E5" />
        <Bar dataKey="expense" fill="#EF4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyLineChart({ data }: { data: MonthlyDataItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#4F46E5" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimplePieChart({ 
  data, 
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'],
  height = "100%"
}: { 
  data: PieChartDataItem[],
  colors?: string[],
  height?: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value.toLocaleString()} (${((value / total) * 100).toFixed(2)}%)`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function IncomeExpenseChart({ 
  data,
  height = "100%"
}: {
  data: PredictionDataItem[],
  height?: string
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available for chart</p>
      </div>
    );
  }

  return (
    <ChartErrorBoundary>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#4F46E5" strokeWidth={2} />
          <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} />
          <Line type="monotone" dataKey="cumulativeSaving" name="Cumulative Saving" stroke="#10B981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
}

export function SavingAreaChart({ 
  data,
  height = "100%"
}: {
  data: PredictionDataItem[],
  height?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="cumulativeSaving" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ScenariosChart({ 
  expected,
  optimistic,
  pessimistic,
  height = "100%"
}: {
  expected: PredictionDataItem[],
  optimistic: PredictionDataItem[],
  pessimistic: PredictionDataItem[],
  height?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" allowDuplicatedCategory={false} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line data={pessimistic} type="monotone" dataKey="cumulativeSaving" name="Pessimistic" stroke="#EF4444" strokeWidth={2} />
        <Line data={expected} type="monotone" dataKey="cumulativeSaving" name="Expected" stroke="#4F46E5" strokeWidth={2} />
        <Line data={optimistic} type="monotone" dataKey="cumulativeSaving" name="Optimistic" stroke="#10B981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
} 