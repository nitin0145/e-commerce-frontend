import React, { useState } from "react";

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    const value = Math.max(1, Math.min(product.stock, Number(e.target.value)));
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= product.stock) {
      onAddToCart(product, quantity); // Call the parent's function to add the product to the cart
    }
  };

  return (
    <div className="border p-4 rounded shadow hover:shadow-lg transition">
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p>{product.description}</p>
      <p className="font-bold text-lg">${product.price}</p>
      <p className="text-sm text-gray-600">Stock: {product.stock}</p>
      {product.stock > 0 && (
        <div className="mt-2">
          <label htmlFor={`quantity-${product._id}`} className="block text-sm">
            Quantity:
          </label>
          <input
            id={`quantity-${product._id}`}
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            max={product.stock}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
      )}
      <button
        className={`mt-2 ${
          product.stock > 0
            ? "bg-blue-500 text-white"
            : "bg-gray-400 text-gray-800"
        } px-4 py-2 rounded hover:bg-blue-600`}
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}
