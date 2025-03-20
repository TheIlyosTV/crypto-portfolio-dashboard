// WebSocket connection to Binance
let socket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
const RECONNECT_DELAY = 5000;

// Typing for price update callback
type PriceUpdateCallback = (symbol: string, price: number) => void;
let priceUpdateCallback: PriceUpdateCallback | null = null;

// Interface for portfolio assets
interface Asset {
  symbol: string;
}

// Connect WebSocket to Binance
export const connectWebSocket = (callback: PriceUpdateCallback) => {
  // Store callback for reconnects
  priceUpdateCallback = callback;

  // Close existing WebSocket connection if it exists
  if (socket) {
    socket.close();
  }

  // Retrieve symbols from localStorage (if available)
  let symbols: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const savedState = localStorage.getItem("portfolio");
      if (savedState) {
        const portfolio = JSON.parse(savedState) as { assets: Asset[] };
        symbols = portfolio.assets.map((asset) => asset.symbol.toLowerCase());
      }
    } catch (e) {
      console.error("Error loading symbols from localStorage", e);
    }
  }

  // Default symbols if none are found in localStorage
  if (symbols.length === 0) {
    symbols = ["btcusdt", "ethusdt", "bnbusdt", "adausdt", "dogeusdt"];
  }

  // Generate WebSocket URL with symbols
  const streams = symbols.map((symbol) => `${symbol}@ticker`).join("/");
  const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

  // Create WebSocket connection
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("WebSocket connection established");

    // Clear reconnect timeout if it exists
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.data) {
        const ticker = data.data;
        const symbol = ticker.s; // Symbol
        const price = Number.parseFloat(ticker.c); // Current price

        // Call the callback function with updated price
        if (priceUpdateCallback) {
          priceUpdateCallback(symbol, price);
        }
      }
    } catch (e) {
      console.error("Error parsing WebSocket message", e);
    }
  };

  socket.onclose = (event) => {
    console.log("WebSocket connection closed", event.code, event.reason);

    // Attempt to reconnect if the closure was not clean
    if (!event.wasClean && priceUpdateCallback) {
      console.log(`Reconnecting in ${RECONNECT_DELAY / 1000} seconds...`);

      // Store the callback function before reconnecting
      const callback = priceUpdateCallback;

      reconnectTimeout = setTimeout(() => {
        connectWebSocket(callback);
      }, RECONNECT_DELAY);
    }
  };

  socket.onerror = (event) => {
    console.error("WebSocket error occurred:", event);
  };
};

// Disconnect WebSocket
export const disconnectWebSocket = () => {
  // Clear reconnect timeout if it exists
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Close WebSocket connection
  if (socket) {
    socket.close();
    socket = null;
  }

  // Clear callback function
  priceUpdateCallback = null;
};

// Function to add a new symbol dynamically
export const addSymbolToStream = (symbol: string) => {
  if (!symbol.trim()) return;

  // Check if WebSocket is already connected
  if (socket && priceUpdateCallback) {
    console.log(`Adding new symbol: ${symbol.toUpperCase()}`);
    connectWebSocket(priceUpdateCallback);
  }
};
