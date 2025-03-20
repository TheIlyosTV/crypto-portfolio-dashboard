"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import {
  selectTotalValue,
  selectPercentageChange,
  selectTotalAssets,
  selectBestPerformer,
} from "@/lib/features/portfolio/portfolioSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface PortfolioOverviewProps {
  isLoading: boolean;
}

export default function PortfolioOverview({
  isLoading,
}: PortfolioOverviewProps) {
  const totalValue = useAppSelector(selectTotalValue);
  const percentageChange = useAppSelector(selectPercentageChange);
  const totalAssets = useAppSelector(selectTotalAssets);
  const bestPerformer = useAppSelector(selectBestPerformer);

  const [isClient, setIsClient] = useState(false);
  const [formattedTotalValue, setFormattedTotalValue] = useState("0.00");
  const [safePercentageChange, setSafePercentageChange] = useState<
    number | null
  >(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setFormattedTotalValue(formatter.format(totalValue));
      setSafePercentageChange(percentageChange);
    }
  }, [totalValue, percentageChange, isLoading]);

  const cards = [
    {
      title: "Total Value",
      value: isLoading ? "Loading..." : `$${formattedTotalValue}`,
      icon: <DollarSign className="h-5 w-5 text-white" />,
      color: "from-blue-600 to-blue-400",
    },
    {
      title: "24h Change",
      value: isLoading
        ? "Loading..."
        : `${
            safePercentageChange !== null
              ? (safePercentageChange >= 0 ? "+" : "") +
                safePercentageChange.toFixed(2) +
                "%"
              : "N/A"
          }`,
      icon:
        isClient && safePercentageChange !== null ? (
          safePercentageChange >= 0 ? (
            <TrendingUp className="h-5 w-5 text-white" />
          ) : (
            <TrendingDown className="h-5 w-5 text-white" />
          )
        ) : null,
      color:
        safePercentageChange !== null && safePercentageChange >= 0
          ? "from-green-600 to-green-400"
          : "from-red-600 to-red-400",
    },
    {
      title: "Total Assets",
      value: isLoading ? "Loading..." : totalAssets.toString(),
      icon: <PieChart className="h-5 w-5 text-white" />,
      color: "from-purple-600 to-purple-400",
    },
    {
      title: "Best Performer",
      value: isLoading
        ? "Loading..."
        : bestPerformer
        ? `${bestPerformer?.symbol?.replace(
            "USDT",
            ""
          )} (${bestPerformer?.changePercent?.toFixed(2)}%)`
        : "N/A",
      icon: <TrendingUp className="h-5 w-5 text-white" />,
      color: "from-amber-600 to-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="bg-gray-800/50 border-gray-700 overflow-hidden"
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-white/80">
                  {card.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32 mt-1 bg-gray-700" />
                ) : (
                  <p className="text-2xl font-bold text-white mt-1">
                    {card.value}
                  </p>
                )}
              </div>
              {isClient && card.icon && (
                <div
                  className={`p-2 rounded-full bg-gradient-to-br ${card.color}`}
                >
                  {card.icon}
                </div>
              )}
            </div>
            {!isLoading && (
              <motion.div
                className={`h-1 mt-4 rounded-full bg-gradient-to-r ${card.color}`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
