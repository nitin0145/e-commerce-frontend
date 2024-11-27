"use client"; // Enables client-side rendering

import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useRouter } from "next/router"; // Import useRouter for navigation
import io from "socket.io-client"; // Import socket.io-client for WebSocket
import Link from 'next/link'

export default function Home() {
  const [products, setProducts] = useState([]); // State for holding products
  const [cart, setCart] = useState([]); // State for managing cart items
  const [socket, setSocket] = useState(null); // State for storing socket instance
  const router = useRouter();

  // Fetch products when the component is mounted
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));

    // Set up socket connection when the component is mounted
    const socketConnection = io("http://localhost:5000"); // Connect to your server
    setSocket(socketConnection);

    // Listen for cart updates from the server
    socketConnection.on("cartUpdated", (updatedCartItem) => {
      setCart((prevCart) => {
        const index = prevCart.findIndex(
          (item) => item.product._id === updatedCartItem.product._id
        );
        if (index !== -1) {
          const newCart = [...prevCart];
          newCart[index] = updatedCartItem;
          return newCart;
        }
        return prevCart;
      });
    });

    // Listen for stock updates from the server
    socketConnection.on("stockUpdated", (data) => {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === data.productId
            ? { ...product, stock: data.updatedStock }
            : product
        )
      );
    });

    // Cleanup the socket connection when the component unmounts
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  // Function to handle adding a product to the cart
  const handleAddToCart = (product, quantity) => {
    // Update local cart state
    setCart((prevCart) => {
      const existingCartItem = prevCart.find((item) => item.product._id === product._id);
      if (existingCartItem) {
        return prevCart.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });

    // Send a request to the server to update the cart and stock
    axios
      .post("http://localhost:5000/api/cart/add-cart", {
        productId: product._id,
        quantity,
      })
      .then((response) => {
        alert(`${quantity} x ${product.name} added to cart!`);

        // Emit cart and stock updates to the server
        socket.emit("cartUpdated", response.data.cartItem);
        socket.emit("stockUpdated", {
          productId: product._id,
          updatedStock: response.data.updatedStock,
        });

        // Optionally, you can update the UI with the new stock
        product.stock = response.data.updatedStock;
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to add to cart. Please try again.");
      });
  };

  // Function to navigate to the cart page and save cart to localStorage
  const handleGoToCart = () => {
    localStorage.setItem("cart", JSON.stringify(cart)); // Save cart to localStorage
    router.push("/cart"); // Navigate to the cart page
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={handleAddToCart} // Pass the function to ProductCard
          />
        ))}
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={handleGoToCart}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Go to Cart ({cart.length})
        </button>
      </div>
    </div>
  );
}
