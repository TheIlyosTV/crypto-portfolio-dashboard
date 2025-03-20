"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch } from "@/lib/hooks";
import { addAsset, type Asset } from "@/lib/features/portfolio/portfolioSlice";
import { addSymbolToStream } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Common cryptocurrencies
const popularCryptos = [
  { symbol: "BTCUSDT", name: "Bitcoin", image: "/icons/btc.png" },
  { symbol: "ETHUSDT", name: "Ethereum", image: "/icons/eth.png" },
  { symbol: "BNBUSDT", name: "Binance Coin", image: "/icons/bnb.png" },
  { symbol: "ADAUSDT", name: "Cardano", image: "/icons/ada.png" },
  { symbol: "SOLUSDT", name: "Solana", image: "/icons/sol.png" },
  { symbol: "DOGEUSDT", name: "Dogecoin", image: "/icons/doge.png" },
  { symbol: "XRPUSDT", name: "Ripple", image: "/icons/xrp.png" },
  { symbol: "DOTUSDT", name: "Polkadot", image: "/icons/dot.png" },
  { symbol: "AVAXUSDT", name: "Avalanche", image: "/icons/avax.png" },
  { symbol: "MATICUSDT", name: "Polygon", image: "/icons/matic.png" },
  { symbol: "LINKUSDT", name: "Chainlink", image: "/icons/link.png" },
  { symbol: "UNIUSDT", name: "Uniswap", image: "/icons/uni.png" },
  { symbol: "SHIBUSDT", name: "Shiba Inu", image: "/icons/shib.png" },
  { symbol: "LTCUSDT", name: "Litecoin", image: "/icons/ltc.png" },
  { symbol: "ATOMUSDT", name: "Cosmos", image: "/icons/atom.png" },
  { symbol: "NEARUSDT", name: "NEAR Protocol", image: "/icons/near.png" },
  { symbol: "ALGOUSDT", name: "Algorand", image: "/icons/algo.png" },
  { symbol: "ICPUSDT", name: "Internet Computer", image: "/icons/icp.png" },
  { symbol: "FILUSDT", name: "Filecoin", image: "/icons/fil.png" },
  { symbol: "VETUSDT", name: "VeChain", image: "/icons/vet.png" },
];

export default function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<{
    symbol: string;
    name: string;
  } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter cryptocurrencies based on search term
  const filteredCryptos = popularCryptos.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCrypto) {
      setError("Please select a cryptocurrency");
      return;
    }

    if (!quantity || Number.parseFloat(quantity) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    setIsLoading(true);

    // Create new asset
    const newAsset: Asset = {
      id: uuidv4(),
      symbol: selectedCrypto.symbol,
      quantity: Number.parseFloat(quantity),
      currentPrice: 0, // Will be updated by WebSocket
      priceChange24h: 0,
      lastUpdated: new Date().toISOString(),
    };

    // Add asset to portfolio
    dispatch(addAsset(newAsset));

    // Add symbol to WebSocket stream
    addSymbolToStream(selectedCrypto.symbol.toLowerCase());

    // Reset form and close modal
    setSelectedCrypto(null);
    setQuantity("");
    setError("");
    setSearchTerm("");
    setIsLoading(false);
    onClose();
  };

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedCrypto(null);
      setQuantity("");
      setError("");
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {selectedCrypto ? (
            <div className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3 overflow-hidden">
                  <Image
                    src={`/icons/${selectedCrypto.symbol
                      .replace("USDT", "")
                      .toLowerCase()}.png`}
                    alt={selectedCrypto.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Agar rasm topilmasa, fallback tasvir qo'yiladi
                      const target = e.target as HTMLImageElement;
                      target.src = "/icons/default.png"; // O'zingizning fallback tasviringiz
                    }}
                  />
                </div>

                <div>
                  <div className="font-medium">{selectedCrypto.name}</div>
                  <div className="text-xs text-gray-400">
                    {selectedCrypto.symbol}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-200"
                onClick={() => setSelectedCrypto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="crypto-search">Select Cryptocurrency</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="crypto-search"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600"
                />
              </div>

              <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-700 bg-gray-800/50">
                <AnimatePresence>
                  {filteredCryptos.length > 0 ? (
                    <ul className="py-2">
                      {filteredCryptos.map((crypto) => (
                        <motion.li
                          key={crypto.symbol}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                        >
                          <button
                            type="button"
                            className="flex w-full items-center px-4 py-2 hover:bg-gray-700/50 text-left"
                            onClick={() => setSelectedCrypto(crypto)}
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3 overflow-hidden">
                              <Image
                                src={`/icons/${crypto.symbol
                                  .replace("USDT", "")
                                  .toLowerCase()}.png`}
                                alt={crypto.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/icons/default.png"; 
                                }}
                              />
                            </div>

                            <div>
                              <div className="font-medium">{crypto.name}</div>
                              <div className="text-xs text-gray-400">
                                {crypto.symbol}
                              </div>
                            </div>
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      No cryptocurrencies found
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="any"
              min="0"
              className="bg-gray-700/50 border-gray-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedCrypto || !quantity}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 rounded-full bg-blue-400/30 mr-2 animate-pulse" />
                  Adding...
                </div>
              ) : (
                "Add Asset"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
