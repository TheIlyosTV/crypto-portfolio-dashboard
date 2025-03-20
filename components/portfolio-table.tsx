"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { Trash2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  selectAssets,
  removeAsset,
  type Asset,
} from "@/lib/features/portfolio/portfolioSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PortfolioTableProps {
  isLoading: boolean;
}

export default function PortfolioTable({ isLoading }: PortfolioTableProps) {
  const dispatch = useAppDispatch();
  const assets = useAppSelector(selectAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const tableRef = useRef<HTMLTableSectionElement>(null);

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) =>
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [assets, searchTerm]
  );

  useEffect(() => {
    if (tableRef.current) {
      gsap.fromTo(
        tableRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }
      );
    }
  }, [filteredAssets]);

  const handleRemoveAsset = (asset: Asset) => {
    setAssetToDelete(asset);
  };

  const confirmRemoveAsset = () => {
    if (assetToDelete) {
      gsap.to(`#row-${assetToDelete.id}`, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        onComplete: () => {
          dispatch(removeAsset(assetToDelete.id));
          setAssetToDelete(null);
        },
      });
    }
  };

  // Check for loading state or empty assets
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">No assets found</h3>
        <p className="mt-2 text-sm text-gray-400">
          Add your first cryptocurrency asset to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs bg-gray-700/50 border-gray-600 focus:border-blue-500"
        />
      </div>

      <div className="rounded-md border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800/70">
            <TableRow>
              <TableHead className="text-gray-300">Asset</TableHead>
              <TableHead className="text-gray-300">Quantity</TableHead>
              <TableHead className="text-gray-300">Price</TableHead>
              <TableHead className="text-gray-300">Value</TableHead>
              <TableHead className="text-gray-300">24h Change</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody ref={tableRef}>
            {filteredAssets.map((asset) => (
              <TableRow
                key={asset.id}
                id={`row-${asset.id}`}
                className="border-b border-gray-700/50"
              >
                <TableCell className="font-medium tex-white">{asset.symbol}</TableCell>
                <TableCell>{asset.quantity}</TableCell>
                <TableCell>${asset.currentPrice.toFixed(2)}</TableCell>
                <TableCell>
                  ${(asset.quantity * asset.currentPrice).toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className={asset.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}>
                    {asset.priceChange24h >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {asset.priceChange24h.toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-gray-700/50"
                    onClick={() => handleRemoveAsset(asset)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {assetToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium text-white">Remove Asset</h3>
            <p className="text-gray-400 mt-2">
              Are you sure you want to remove {assetToDelete.symbol}?
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAssetToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmRemoveAsset}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
