// File: user/context/CartContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Cart Context
export const CartContext = createContext(null);

// Custom hook to use the Cart Context, providing a convenient way to access cart state and functions
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // Initialize cart items state from localStorage.
  // This ensures cart persists across page refreshes and browser sessions.
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCartItems = localStorage.getItem('cartItems');
      return storedCartItems ? JSON.parse(storedCartItems) : [];
    } catch (error) {
      console.error("Failed to parse cart items from localStorage", error);
      return []; // Return an empty array on error to prevent app crash
    }
  });

  // Effect hook to update localStorage whenever cartItems state changes.
  // This keeps the localStorage synchronized with the current cart state.
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart items to localStorage", error);
    }
  }, [cartItems]); // Dependency array: re-run effect when cartItems array changes

  /**
   * Adds a product to the cart or increases its quantity if it already exists.
   * @param {Object} product - The product object to add (must have an _id, name, price, image etc.).
   */
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item._id === product._id);

      if (existingItemIndex > -1) {
        // If item already exists in cart, create a new array with updated quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1 // Increment quantity by 1
        };
        return updatedItems;
      } else {
        // If item is new to the cart, add it with a quantity of 1
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  /**
   * Decreases the quantity of a product in the cart by one.
   * If the quantity becomes 0, the product is removed from the cart.
   * @param {string} productId - The ID of the product to remove or decrease quantity.
   */
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item._id === productId);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        if (updatedItems[existingItemIndex].quantity > 1) {
          // If quantity is more than 1, just decrement it
          updatedItems[existingItemIndex].quantity -= 1;
        } else {
          // If quantity is 1, remove the item completely from the array
          updatedItems.splice(existingItemIndex, 1);
        }
        return updatedItems;
      }
      return prevItems; // Return previous state if item not found
    });
  };

  /**
   * Removes a product completely from the cart, regardless of its quantity.
   * This is useful after a product has been checked out.
   * @param {string} productId - The ID of the product to remove completely.
   */
  const removeProductCompletely = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };


  /**
   * Calculates the total quantity of all items in the cart.
   * @returns {number} The total number of items (sum of quantities).
   */
  const getCartTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  /**
   * Clears all items from the cart.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // The value provided by the CartContext.Provider to all its consumers
  const cartContextValue = {
    cartItems,               // The current array of items in the cart
    addToCart,               // Function to add an item
    removeFromCart,          // Function to remove one quantity or item
    removeProductCompletely, // NEW: Function to remove an item entirely
    getCartTotalQuantity,    // Function to get total quantity
    clearCart,               // Function to clear the whole cart
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};
