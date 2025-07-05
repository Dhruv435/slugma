// File: user/pages/MyOrdersPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBagIcon, ClockIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline'; // Importing heroicons

const API_BASE_URL = 'http://localhost:3001';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user || !user._id) {
        setError('You must be logged in to view your orders.');
        setLoading(false);
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const activeOrdersRes = await fetch(`${API_BASE_URL}/api/orders/user/${user._id}?status=active`);
        if (!activeOrdersRes.ok) {
          const errorData = await activeOrdersRes.json();
          throw new Error(errorData.message || 'Failed to fetch active orders');
        }
        const activeData = await activeOrdersRes.json();
        setActiveOrders(activeData);
      } catch (err) {
        console.error('Error fetching active orders:', err);
        setError(`Failed to load active orders: ${err.message}.`);
      }

      try {
        const historyOrdersRes = await fetch(`${API_BASE_URL}/api/orders/user/${user._id}?status=history`);
        if (!historyOrdersRes.ok) {
          const errorData = await historyOrdersRes.json();
          throw new Error(errorData.message || 'Failed to fetch order history');
        }
        const historyData = await historyOrdersRes.json();
        setHistoryOrders(historyData);
      } catch (err) {
        console.error('Error fetching order history:', err);
        setError(prev => prev ? `${prev} Also failed to load order history: ${err.message}.` : `Failed to load order history: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      <div className="container mx-auto px-4 py-12 lg:py-16 flex-1">
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-6 md:p-10 lg:p-12 mb-12 border border-gray-100"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">My Orders</h1>

          {error && (
            <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-800 font-semibold text-center border-l-4 border-red-500 shadow-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-gray-600 text-lg">Loading your orders...</div>
          ) : (
            <>
              <div className="flex justify-center gap-4 mb-8">
                <motion.button
                  onClick={() => setShowHistory(false)}
                  className={`px-8 py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300
                    ${!showHistory ? 'bg-rose-700 text-white hover:bg-rose-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ClockIcon className="h-6 w-6 inline-block mr-2" /> Active Orders
                </motion.button>
                <motion.button
                  onClick={() => setShowHistory(true)}
                  className={`px-8 py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300
                    ${showHistory ? 'bg-rose-700 text-white hover:bg-rose-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArchiveBoxIcon className="h-6 w-6 inline-block mr-2" /> Order History
                </motion.button>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                {showHistory ? 'Order History' : 'Active Orders'}
              </h2>

              <ul className="space-y-6">
                <AnimatePresence mode="wait">
                  {(showHistory ? historyOrders : activeOrders).length === 0 ? (
                    <motion.li
                      key="no-orders"
                      className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600 italic text-lg shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {showHistory ? 'No past orders found.' : 'No active orders found.'}
                    </motion.li>
                  ) : (
                    (showHistory ? historyOrders : activeOrders).map(order => (
                      <motion.li
                        key={order._id}
                        className="bg-gray-50 rounded-2xl p-6 shadow-md border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <div className="flex items-center gap-4">
                          <ShoppingBagIcon className="h-10 w-10 text-gray-600" />
                          <div>
                            <p className="text-lg font-bold text-gray-800 mb-1">Order ID: {order._id.substring(0, 8)}...</p>
                            <Link to={`/orders/${order._id}`} className="text-md text-rose-600 hover:underline">
                              View {order.products.length} Items
                            </Link>
                            <p className="text-md text-gray-700 mb-1">Status: <span className="font-semibold text-rose-700">{order.orderStatus}</span></p>
                            <p className="text-md text-gray-700 mb-1">Total: <span className="font-bold text-green-600">₹{order.totalPrice ? order.totalPrice.toFixed(2) : 'N/A'}</span></p>
                            <p className="text-sm text-gray-500">
                              {order.deliveredAt ? `Delivered on: ${new Date(order.deliveredAt).toLocaleDateString()}` : `Placed on: ${new Date(order.createdAt).toLocaleDateString()}`}
                            </p>
                            {order.cancelledAt && <p className="text-sm text-red-600 font-semibold">Cancelled on: {new Date(order.cancelledAt).toLocaleDateString()}</p>}
                          </div>
                        </div>
                        <Link
                          to={`/orders/${order._id}`}
                          className="mt-4 sm:mt-0 bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold text-md hover:bg-gray-900 transition duration-300 shadow-md transform hover:scale-105"
                        >
                          View Details
                        </Link>
                      </motion.li>
                    ))
                  )}
                </AnimatePresence>
              </ul>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default MyOrdersPage;
