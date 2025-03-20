import { configureStore } from "@reduxjs/toolkit"
import portfolioReducer from "./features/portfolio/portfolioSlice"

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
  },
  // Add middleware for dev tools in development
  devTools: process.env.NODE_ENV !== "production",
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

