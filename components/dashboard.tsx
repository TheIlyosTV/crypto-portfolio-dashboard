"use client";

import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectPortfolioData,
} from "@/lib/features/portfolio/portfolioSlice";
import PortfolioOverview from "./portfolio-overview";
import PortfolioChart from "./portfolio-chart";
import PortfolioTable from "./portfolio-table";
import AddAssetButton from "./add-asset-button";
import { connectWebSocket, disconnectWebSocket } from "@/lib/websocket";
import { updateAssetPrice } from "@/lib/features/portfolio/portfolioSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Memoize these components to prevent unnecessary re-renders
const MemoizedPortfolioOverview = memo(PortfolioOverview);
const MemoizedPortfolioChart = memo(PortfolioChart);
const MemoizedPortfolioTable = memo(PortfolioTable);

export default function Dashboard() {
  const dispatch = useAppDispatch();
  // const totalValue = useAppSelector(selectTotalValue);
  const portfolioData = useAppSelector(selectPortfolioData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize WebSocket connection
    connectWebSocket((symbol, price) => {
      dispatch(updateAssetPrice({ symbol, price }));
    });

    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Cleanup WebSocket on unmount
    return () => {
      clearTimeout(timer);
      disconnectWebSocket();
    };
  }, [dispatch]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">Crypto Portfolio</h1>
              <p className="text-gray-400">Track your assets in real-time</p>
            </div>
            <AddAssetButton />
          </motion.div>

          <motion.div variants={itemVariants}>
            <MemoizedPortfolioOverview isLoading={isLoading} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
              </TabsList>
              <TabsContent value="portfolio" className="mt-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white">
                      Portfolio Assets
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Your cryptocurrency holdings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MemoizedPortfolioTable isLoading={isLoading} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="charts" className="mt-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle>Portfolio Distribution</CardTitle>
                    <CardDescription className="text-gray-400">
                      Asset allocation breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <MemoizedPortfolioChart
                        data={portfolioData}
                        isLoading={isLoading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
