// File: user/pages/CartPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MinusCircleIcon, PlusCircleIcon, TrashIcon, ShoppingCartIcon, ArrowRightCircleIcon, TagIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer'; // Import the Footer component

const API_BASE_URL = 'http://localhost:3001';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, getCartTotalQuantity, clearCart } = useCart();
  const [selectedItems, setSelectedItems] = useState({});

  useEffect(() => {
    const initialSelection = {};
    cartItems.forEach(item => {
      initialSelection[item._id] = true;
    });
    setSelectedItems(initialSelection);
  }, [cartItems]);

  const itemsToCheckout = cartItems.filter(item => selectedItems[item._id]);
  const totalItemsInCart = getCartTotalQuantity();
  const totalPriceOfSelected = itemsToCheckout.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckboxChange = (productId) => {
    setSelectedItems(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleProceedToCheckout = () => {
    if (itemsToCheckout.length === 0) {
      // Using a custom modal/message box instead of alert()
      // For simplicity, using a state variable for a temporary message here.
      // In a real app, you'd have a proper modal component.
      alert('Please select at least one item to proceed to checkout.');
      return;
    }
    navigate('/checkout', { state: { selectedCartItems: itemsToCheckout } });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10 lg:p-12 border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Your Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <motion.div
              className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 shadow-md"
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <ShoppingCartIcon className="h-24 w-24 mx-auto text-gray-400 mb-6" />
              <p className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty!</p>
              <p className="text-lg text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-rose-700 text-white font-bold rounded-full shadow-lg hover:bg-rose-800 transition-all duration-300 transform hover:-translate-y-1"
              >
                <ShoppingCartIcon className="h-6 w-6 mr-3" />
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Cart Items List */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <AnimatePresence>
                  {cartItems.map(item => (
                    <motion.div
                      key={item._id}
                      className="flex items-center bg-gray-50 rounded-2xl p-5 shadow-md border border-gray-200 relative"
                      variants={itemVariants}
                      layout
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems[item._id]}
                        onChange={() => handleCheckboxChange(item._id)}
                        className="form-checkbox h-6 w-6 text-rose-600 rounded focus:ring-rose-500 mr-4"
                      />
                      <img
                        src={`${API_BASE_URL}${item.image}`}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300 mr-5"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/96x96/E2E8F0/A0AEC0?text=No+Image"; }}
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-sm text-gray-500">
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedSize && item.selectedColor && ', '}
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                          </p>
                        )}
                        <div className="flex items-center mt-3">
                          <motion.button
                            onClick={() => removeFromCart(item._id, 1)}
                            className="p-1 rounded-full text-gray-600 hover:text-rose-600 transition-colors duration-200 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <MinusCircleIcon className="h-7 w-7" />
                          </motion.button>
                          <span className="mx-3 text-lg font-bold text-gray-800">{item.quantity}</span>
                          <motion.button
                            onClick={() => addToCart(item)}
                            className="p-1 rounded-full text-gray-600 hover:text-rose-600 transition-colors duration-200 disabled:opacity-50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <PlusCircleIcon className="h-7 w-7" />
                          </motion.button>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => removeFromCart(item._id, item.quantity)} // Remove all of this product
                        className="absolute top-4 right-4 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors duration-200 shadow-sm"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Remove item"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Cart Summary */}
              <motion.div
                className="lg:col-span-1 bg-gray-50 rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col h-full"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <TagIcon className="h-7 w-7 mr-3 text-rose-600" /> Order Summary
                </h2>
                <div className="space-y-4 text-lg text-gray-700 flex-1">
                  <div className="flex justify-between">
                    <span>Total Items in Cart:</span>
                    <span className="font-semibold text-gray-900">{totalItemsInCart}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Items:</span>
                    <span className="font-semibold text-gray-900">{itemsToCheckout.length}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4 font-bold text-xl text-gray-800">
                    <span>Total Price:</span>
                    <span className="text-rose-700">₹{totalPriceOfSelected.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 mt-8">
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-rose-700 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-rose-800 transition-all duration-300 shadow-md transform hover:-translate-y-1 flex items-center justify-center group"
                  >
                    Proceed to Checkout
                    <ArrowRightCircleIcon className="h-7 w-7 ml-3 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-red-500 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-red-600 transition-all duration-300 shadow-md flex items-center justify-center group"
                  >
                    <TrashIcon className="h-7 w-7 mr-3 group-hover:scale-105 transition-transform duration-200" />
                    Clear All Items
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="flex justify-center mt-16">
              <Link
                to="/products"
                className="inline-flex items-center px-10 py-4 bg-gray-800 text-white font-bold rounded-lg shadow-lg hover:bg-gray-900 transition-all duration-300 transform hover:-translate-y-1"
              >
                <ShoppingCartIcon className="h-6 w-6 mr-3" />
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
