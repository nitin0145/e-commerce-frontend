// hooks/useSocket.js
import { useEffect } from "react";
import io from "socket.io-client";

let socket;

const useSocket = (onCartUpdate, onStockUpdate) => {
  useEffect(() => {
    // Connect to the backend Socket.IO server
    socket = io("http://localhost:5000"); // Replace with your backend server URL

    // Listen for cart updates
    socket.on("cartUpdated", (data) => {
      if (onCartUpdate) onCartUpdate(data);
    });

    // Listen for stock updates
    socket.on("stockUpdated", (data) => {
      if (onStockUpdate) onStockUpdate(data);
    });

    // Clean up when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [onCartUpdate, onStockUpdate]);

  return socket;
};

export default useSocket;
