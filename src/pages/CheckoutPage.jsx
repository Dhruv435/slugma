// File: user/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Importing heroicons for better visuals
import {
  CheckCircleIcon, XCircleIcon, ShoppingBagIcon, MapPinIcon, CreditCardIcon,
  UserCircleIcon, DevicePhoneMobileIcon, HomeModernIcon, BuildingLibraryIcon, BuildingOffice2Icon,
  CubeTransparentIcon, ArrowPathIcon, ChevronDoubleRightIcon, LockClosedIcon, ShoppingCartIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';

const API_BASE_URL = 'https://slugma-backend.vercel.app'; 

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, removeProductCompletely } = useCart();

  const itemsToProcess = location.state?.selectedCartItems || cartItems;

  const [shippingAddress, setShippingAddress] = useState({
    personName: user?.username || '',
    mobileNumber: user?.mobileNumber || '',
    address: '',
    pincode: '',
    state: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const totalItemsToProcess = itemsToProcess.reduce((total, item) => total + item.quantity, 0);
  const totalPriceOfSelected = itemsToProcess.reduce((total, item) => total + (item.price * item.quantity), 0);

  useEffect(() => {
    if (!isAuthenticated) {
      setMessage('Please log in to proceed with checkout.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    if (itemsToProcess.length === 0) {
      setMessage('❌ Your cart is empty. Please add items before checking out.');
      setIsSubmitting(false);
      return;
    }

    if (!shippingAddress.personName || !shippingAddress.mobileNumber || !shippingAddress.address || !shippingAddress.pincode || !shippingAddress.state) {
      setMessage('❌ Please fill in all shipping address details.');
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
        setMessage('❌ Pincode must be a 6-digit number.');
        setIsSubmitting(false);
        return;
    }

    try {
      const orderProducts = itemsToProcess.map(item => ({
        productId: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }));

      const orderData = {
        userId: user._id,
        products: orderProducts,
        shippingAddress,
        paymentMethod,
        totalPrice: totalPriceOfSelected,
        orderStatus: 'Pending',
      };

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order.');
      }

      setMessage('✅ Order placed successfully!');
      // Clear items from cart that were part of this order
      itemsToProcess.forEach(item => removeProductCompletely(item._id));

      setTimeout(() => {
        navigate('/my-orders');
      }, 2000);

    } catch (err) {
      console.error('Error placing order:', err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col mt-20">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10 lg:p-12 border border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Checkout</h1>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 mb-6 rounded-lg font-semibold text-center ${message.includes('❌') ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 'bg-green-100 text-green-800 border-l-4 border-green-500'} shadow-md`}
            >
              {message}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Order Summary */}
            <motion.section
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-md flex flex-col h-full"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <ShoppingBagIcon className="h-7 w-7 mr-3 text-rose-600" /> Order Summary
              </h2>
              <div className="flex-1 space-y-4 mb-6 max-w-full overflow-y-auto max-h-96 pr-0">
                {itemsToProcess.length === 0 ? (
                  <p className="text-gray-600 italic">No items selected for checkout.</p>
                ) : (
                  itemsToProcess.map(item => (
                    <div key={item._id} className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                      <img
                        src={`${API_BASE_URL}${item.image}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md border border-gray-200"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/64x64/E2E8F0/A0AEC0?text=No+Image"; }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ₹{item.price.toFixed(2)}</p>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-xs text-gray-500">
                            {item.selectedSize && `Size: ${item.selectedSize}`}
                            {item.selectedSize && item.selectedColor && ', '}
                            {item.selectedColor && `Color: ${item.selectedColor}`}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-4 border-t border-gray-200 text-lg font-bold flex justify-between items-center mt-auto">
                <span className="text-gray-800">Total ({totalItemsToProcess} items):</span>
                <span className="text-rose-700">₹{totalPriceOfSelected.toFixed(2)}</span>
              </div>
            </motion.section>

            {/* Shipping and Payment Forms */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <motion.section
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <MapPinIcon className="h-7 w-7 mr-3 text-rose-600" /> Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="personName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="personName"
                        name="personName"
                        value={shippingAddress.personName}
                        onChange={handleInputChange}
                        className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-gray-800"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <div className="relative">
                      <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={shippingAddress.mobileNumber}
                        onChange={handleInputChange}
                        className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-gray-800"
                        placeholder="9876543210"
                        maxLength="10"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <div className="relative">
                      <HomeModernIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleInputChange}
                        className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-gray-800"
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <div className="relative">
                      <BuildingLibraryIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={shippingAddress.pincode}
                        onChange={handleInputChange}
                        className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-gray-800"
                        placeholder="123456"
                        maxLength="6"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <div className="relative">
                      <BuildingOffice2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-gray-800"
                        placeholder="California"
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Payment Method */}
              <motion.section
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <CreditCardIcon className="h-7 w-7 mr-3 text-rose-600" /> Payment Method
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio h-5 w-5 text-rose-600 border-gray-300 focus:ring-rose-500"
                    />
                    <span className="ml-3 text-lg font-semibold text-gray-800">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-not-allowed opacity-60 bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit/Debit Card"
                      checked={paymentMethod === 'Credit/Debit Card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio h-5 w-5 text-rose-600 border-gray-300 focus:ring-rose-500"
                      disabled
                    />
                    <span className="ml-3 text-lg font-semibold text-gray-600">Credit/Debit Card (Coming Soon)</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-not-allowed opacity-60 bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Google Pay"
                      checked={paymentMethod === 'Google Pay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio h-5 w-5 text-rose-600 border-gray-300 focus:ring-rose-500"
                      disabled
                    />
                    <span className="ml-3 text-lg font-semibold text-gray-600">Google Pay (Coming Soon)</span>
                  </label>
                </div>
              </motion.section>

              {/* Place Order Button */}
              <motion.button
                type="submit"
                className="w-full py-4 rounded-lg font-bold text-xl shadow-lg transition duration-300 ease-in-out mt-auto
                           bg-rose-700 text-white
                           hover:bg-rose-800 transform hover:-translate-y-1 hover:shadow-xl
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                disabled={isSubmitting || !isAuthenticated || totalItemsToProcess === 0}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="animate-spin mr-3 h-7 w-7" /> Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-7 w-7 mr-3 group-hover:scale-110 transition-transform duration-200" /> Place Order
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
