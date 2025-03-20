"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface PortfolioChartProps {
  data: ChartData[];
  isLoading: boolean;
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

// Custom tooltip for the PieChart
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-md border border-gray-700 shadow-lg">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm text-gray-300">
          $
          {payload[0].value?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-sm text-gray-400">
          {payload[0].payload.percentage.toFixed(2)}% of portfolio
        </p>
      </div>
    );
  }

  return null;
};

export default function PortfolioChart({ data, isLoading }: PortfolioChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="h-64 w-64 rounded-full bg-gray-700" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1000}
            animationBegin={200}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{
                backgroundColor: entry.color || COLORS[index % COLORS.length],
              }}
            />
            <div>
              <div className="text-sm font-medium text-white">{entry.name}</div>
              <div className="text-xs text-gray-400">
                {entry.percentage.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
