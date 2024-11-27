"use client"; // Enable client-side rendering

import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket"; // Import the custom socket hook

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch initial cart data
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/cart");
      setCart(response.data);
      calculateTotal(response.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  // Update cart quantity
  const updateQuantity = async (id, quantity) => {
    try {
      await axios.patch(`http://localhost:5000/api/cart/${id}`, { quantity });
      fetchCartItems(); // Fetch updated cart data
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Remove item from cart
  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${id}`);
      fetchCartItems(); // Fetch updated cart data
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Handle cart update from Socket.IO event
  const handleCartUpdate = (updatedCartItem) => {
    setCart((prevCart) => {
      const index = prevCart.findIndex(
        (item) => item._id === updatedCartItem._id
      );
      if (index !== -1) {
        const newCart = [...prevCart];
        newCart[index] = updatedCartItem;
        return newCart;
      }
      return prevCart;
    });
    calculateTotal(cart); // Recalculate the total price
  };

  // Handle stock update from Socket.IO event
  const handleStockUpdate = (data) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product._id === data.productId
          ? { ...item, product: { ...item.product, stock: data.updatedStock } }
          : item
      )
    );
  };

  // Set up socket to listen for real-time updates
  useSocket(handleCartUpdate, handleStockUpdate);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center p-4 border-b"
            >
              <div>
                <h2 className="text-xl">{item.product.name}</h2>
                <p>${item.product.price}</p>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() =>
                    updateQuantity(item._id, Math.max(item.quantity - 1, 1))
                  }
                  className="bg-gray-200 px-2 rounded-l"
                >
                  -
                </button>
                <span className="px-4">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(
                      item._id,
                      Math.min(item.quantity + 1, item.product.stock)
                    )
                  }
                  className="bg-gray-200 px-2 rounded-r"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item._id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="mt-4">
            <h2 className="text-2xl">Total: ${totalPrice.toFixed(2)}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
