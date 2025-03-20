import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/lib/store"

export interface Asset {
  id: string
  symbol: string
  quantity: number
  currentPrice: number
  priceChange24h: number
  lastUpdated: string
}

interface PortfolioState {
  assets: Asset[]
  initialTotalValue: number // For calculating percentage change
}

// Load state from localStorage if available
const loadState = (): PortfolioState => {
  if (typeof window === "undefined") {
    return { assets: [], initialTotalValue: 0 }
  }

  try {
    const savedState = localStorage.getItem("portfolio")
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (e) {
    console.error("Error loading state from localStorage", e)
  }

  return { assets: [], initialTotalValue: 0 }
}

const initialState: PortfolioState = loadState()

export const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Asset>) => {
      // Check if asset already exists
      const existingAssetIndex = state.assets.findIndex((asset) => asset.symbol === action.payload.symbol)

      if (existingAssetIndex >= 0) {
        // Update quantity if asset exists
        state.assets[existingAssetIndex].quantity += action.payload.quantity
      } else {
        // Add new asset
        state.assets.push(action.payload)
      }

      // Save to localStorage
      saveState(state)
    },
    removeAsset: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter((asset) => asset.id !== action.payload)

      // Save to localStorage
      saveState(state)
    },
    updateAssetPrice: (state, action: PayloadAction<{ symbol: string; price: number }>) => {
      const { symbol, price } = action.payload
      const asset = state.assets.find((a) => a.symbol === symbol)

      if (asset) {
        // Calculate price change if we have a previous price
        if (asset.currentPrice > 0) {
          asset.priceChange24h = price - asset.currentPrice
        }

        asset.currentPrice = price
        asset.lastUpdated = new Date().toISOString()

        // Update initial total value if it's 0 (first load)
        if (state.initialTotalValue === 0) {
          state.initialTotalValue = calculateTotalValue(state.assets)
        }
      }

      // Save to localStorage
      saveState(state)
    },
  },
})

// Helper function to calculate total value
const calculateTotalValue = (assets: Asset[]): number => {
  return assets.reduce((total, asset) => {
    return total + asset.quantity * asset.currentPrice
  }, 0)
}

// Helper function to save state to localStorage
const saveState = (state: PortfolioState) => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("portfolio", JSON.stringify(state))
  } catch (e) {
    console.error("Error saving state to localStorage", e)
  }
}

// Selectors
export const selectAssets = (state: RootState) => state.portfolio.assets
export const selectTotalValue = (state: RootState) =>
  state.portfolio.assets.reduce((total, asset) => {
    return total + asset.quantity * asset.currentPrice
  }, 0)
export const selectPercentageChange = (state: RootState) => {
  const currentValue = selectTotalValue(state)
  const initialValue = state.portfolio.initialTotalValue

  if (initialValue === 0) return 0

  return ((currentValue - initialValue) / initialValue) * 100
}
export const selectTotalAssets = (state: RootState) => state.portfolio.assets.length
export const selectBestPerformer = (state: RootState) => {
    const assets = state.portfolio.assets
    if (assets.length === 0) return null
  
    return assets.reduce((best, current) => {
      const bestChangePercent =
        best.priceChange24h !== 0 && best.currentPrice !== best.priceChange24h
          ? (best.priceChange24h / (best.currentPrice - best.priceChange24h)) * 100
          : 0
  
      const currentChangePercent =
        current.priceChange24h !== 0 && current.currentPrice !== current.priceChange24h
          ? (current.priceChange24h / (current.currentPrice - current.priceChange24h)) * 100
          : 0
  
      return currentChangePercent > bestChangePercent
        ? { ...current, changePercent: currentChangePercent }
        : { ...best, changePercent: bestChangePercent }
    }, { ...assets[0], changePercent: 0 })
  }
  
export const selectPortfolioData = (state: RootState) => {
  const assets = state.portfolio.assets
  const totalValue = selectTotalValue(state)

  if (totalValue === 0) return []

  return assets.map((asset) => {
    const value = asset.quantity * asset.currentPrice
    const percentage = (value / totalValue) * 100

    return {
      name: asset.symbol.replace("USDT", ""),
      value,
      percentage,
      color: getRandomColor(asset.symbol), // Generate a consistent color based on symbol
    }
  })
}

// Helper function to generate a consistent color based on a string
const getRandomColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#8b5cf6", // purple
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
  ]

  return colors[Math.abs(hash) % colors.length]
}

export const { addAsset, removeAsset, updateAssetPrice } = portfolioSlice.actions

export default portfolioSlice.reducer

