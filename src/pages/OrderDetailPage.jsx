// File: user/pages/OrderDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// ❗❗❗ IMPORTANT: ADJUST THESE IMPORT PATHS BASED ON YOUR ACTUAL PROJECT STRUCTURE ❗❗❗
// Example: If OrderDetailPage.jsx is in 'src/user/pages/' and AuthContext.jsx is in 'src/context/',
// you will likely need '../../context/AuthContext' instead of '../context/AuthContext'.
// Similarly for Footer.
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer'; // Add this import
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://localhost:3001';

const deliveryOptions = [
  'Option 1 - 5 days to delivery',
  'Option 2 - 3 days to delivery',
  'Option 3 - 2 days to delivery',
  'Option 4 - 1 day to delivery',
  'Option 5 - Arriving Today'
];

const getDeliveryStepColor = (index, currentOption, orderStatus) => {
  const currentIndex = deliveryOptions.indexOf(currentOption);
  if (orderStatus === 'Cancelled') {
    return 'bg-red-500 text-white';
  } else if (orderStatus === 'Delivered & Confirmed') {
    return 'bg-green-500 text-white';
  } else if (index < currentIndex) {
    return 'bg-green-500 text-white';
  } else if (index === currentIndex) {
    return 'bg-blue-500 text-white';
  }
  return 'bg-gray-300 text-gray-600';
};

const getDeliveryEmoji = (option) => {
  switch (option) {
    case 'Option 1 - 5 days to delivery': return '⏳';
    case 'Option 2 - 3 days to delivery': return '📦';
    case 'Option 3 - 2 days to delivery': return '🚚';
    case 'Option 4 - 1 day to delivery': return '💨';
    case 'Option 5 - Arriving Today': return '🏠';
    default: return '✔️';
  }
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalMessage, setModalMessage] = useState('');

  const canCancelOrder = order &&
    ['Option 1 - 5 days to delivery', 'Option 2 - 3 days to delivery'].includes(order.deliveryOption) &&
    order.orderStatus !== 'Cancelled' &&
    order.orderStatus !== 'Delivered' &&
    order.orderStatus !== 'Delivered & Confirmed' &&
    order.orderStatus !== 'Shipped';

  const showConfirmReceivedButton = order &&
    order.deliveryOption === 'Option 5 - Arriving Today' &&
    order.orderStatus !== 'Delivered & Confirmed' &&
    order.orderStatus !== 'Cancelled';

  const showDownloadReceiptButton = order && order.orderStatus === 'Delivered & Confirmed';

  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated || !user || !user._id) {
        setError('You must be logged in to view order details.');
        setLoading(false);
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);
      setMessage('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data.userId._id !== user._id) {
          setError('You do not have permission to view this order.');
          setLoading(false);
          navigate('/my-orders', { replace: true });
          return;
        }
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(`Failed to load order details: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    } else {
      setError('No order ID provided.');
      setLoading(false);
    }
  }, [id, user, isAuthenticated, navigate]);

  const handleConfirmAction = async () => {
    setShowConfirmModal(false);
    if (modalAction === 'confirmReceived') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${order._id}/confirm-received`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to confirm receipt.');
        }

        const updatedOrder = await response.json();
        setOrder(updatedOrder.order);
        setMessage('✅ Product receipt confirmed! This order is now in your history.');

      } catch (err) {
          console.error('Error confirming product receipt:', err);
          setMessage(`❌ Error confirming product receipt: ${err.message}`);
      }
    } else if (modalAction === 'cancelOrder') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${order._id}/cancel`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to cancel order.');
        }

        const updatedOrder = await response.json();
        setOrder(updatedOrder.order);
        setMessage('✅ Order cancelled successfully.');

      } catch (err) {
          console.error('Error cancelling order:', err);
          setMessage(`❌ Error cancelling order: ${err.message}`);
      }
    }
  };

  const openConfirmModal = (action) => {
    setModalAction(action);
    if (action === 'confirmReceived') {
      setModalMessage('Are you sure you want to confirm that you have received this product? This action cannot be undone.');
    } else if (action === 'cancelOrder') {
      setModalMessage('Are you sure you want to cancel this order? This action cannot be undone.');
    }
    setShowConfirmModal(true);
  };

  const generateReceiptContent = (order) => {
    let content = `
      <html>
      <head>
          <title>Order Receipt #${order._id.substring(0, 8)}</title>
          <style>
              body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 20px; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              h1, h2, h3 { color: #2C3E50; }
              .header { text-align: center; margin-bottom: 30px; }
              .order-summary, .shipping-info, .payment-info { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
              .order-summary table { width: 100%; border-collapse: collapse; }
              .order-summary th, .order-summary td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
              .order-summary th { background-color: #f9f9f9; }
              .total-row { font-weight: bold; }
              .total-row td { padding-top: 10px; border-top: 2px solid #ddd; }
              .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Order Receipt</h1>
                  <p><strong>Order ID:</strong> #${order._id}</p>
                  <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>

              <div class="order-summary">
                  <h2>Order Summary</h2>
                  <table>
                      <thead>
                          <tr>
                              <th>Product</th>
                              <th>Qty</th>
                              <th>Price</th>
                              <th>Subtotal</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${order.products.map(item => `
                              <tr>
                                  <td>${item.name}</td>
                                  <td>${item.quantity}</td>
                                  <td>₹${item.price.toFixed(2)}</td>
                                  <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                          `).join('')}
                          <tr class="total-row">
                              <td colspan="3">Total:</td>
                              <td>₹${order.totalPrice.toFixed(2)}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>

              <div class="shipping-info">
                  <h2>Shipping Information</h2>
                  <p><strong>Name:</strong> ${order.shippingAddress.personName}</p>
                  <p><strong>Mobile:</strong> ${order.shippingAddress.mobileNumber}</p>
                  <p><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.pincode}</p>
                  <p><strong>State:</strong> ${order.shippingAddress.state}</p>
              </div>

              <div class="payment-info">
                  <h2>Payment Method</h2>
                  <p>${order.paymentMethod}</p>
              </div>

              <div class="footer">
                  <p>Thank you for your purchase!</p>
              </div>
          </div>
      </body>
      </html>
    `;
    return content;
  };

  const handleDownloadReceipt = () => {
    if (order) {
      const content = generateReceiptContent(order);
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order_receipt_${order._id.substring(0, 8)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center text-blue-600">
      <svg className="animate-spin -ml-1 mr-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading order details...
    </div>
  );

  const CustomModal = ({ show, message, onConfirm, onCancel }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-blue-600"
        >
          <p className="text-xl font-semibold text-gray-800 mb-6">{message}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onConfirm}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 transform hover:scale-105"
            >
              Yes
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 transform hover:scale-105"
            >
              No
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const pageTransition = { type: 'spring', stiffness: 100, damping: 15 };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-blue-600">
              <span className="text-red-500 text-6xl block mb-4">🔒</span>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Login Required</h2>
              <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
              <Link to="/login" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-lg">
                  Login Now
              </Link>
          </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-red-600">
          <span className="text-red-600 text-6xl block mb-4">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Order</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-gray-600">
          <span className="text-gray-600 text-6xl block mb-4">🔍</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-700 mb-6">The order you are looking for does not exist or you do not have permission to view it.</p>
          <button onClick={() => navigate('/my-orders')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105">
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={{
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 }
      }}
      transition={pageTransition}
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 font-inter" // Removed py-12 px-4 here
    >
      <div className="flex-grow py-12 px-4"> {/* Padding moved here */}
        <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-t-8 border-blue-700">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-purple-700 drop-shadow-lg">
            Order Details #{order._id.substring(0, 8)}...
          </h2>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`p-4 mb-6 rounded-lg text-center font-semibold border-l-4 ${message.startsWith('✅') ? 'bg-green-100 text-green-800 border-green-500' : 'bg-red-100 text-red-800 border-red-500'} shadow-md`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Status & Delivery Progress Bar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...pageTransition }}
            className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
              <span className="mr-3 text-blue-700">📦</span> Delivery Status: <span className="ml-2 text-blue-700">{order.orderStatus}</span>
            </h3>
            <div className="relative flex justify-between items-center text-center px-4 md:px-8 overflow-x-auto pb-4 no-scrollbar">
              {deliveryOptions.map((option, index) => (
                <div key={index} className="flex-1 flex flex-col items-center min-w-[80px] z-10 mx-2">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-500 text-2xl font-bold ${getDeliveryStepColor(index, order.deliveryOption, order.orderStatus)}`}
                  >
                    {getDeliveryEmoji(option)}
                  </div>
                  <p className={`mt-3 text-xs font-medium text-center ${
                      index <= deliveryOptions.indexOf(order.deliveryOption) && order.orderStatus !== 'Cancelled' ? 'text-gray-800' : 'text-gray-600'
                  }`}>
                      {option.split(' - ')[0]}
                  </p>
                </div>
              ))}
              <div className="absolute h-1 bg-gray-300 w-[calc(100%-80px)] top-1/2 left-10 -translate-y-1/2 z-0 rounded-full"></div>
              {(order.orderStatus !== 'Cancelled') && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(deliveryOptions.indexOf(order.deliveryOption) + 1) / deliveryOptions.length * (100 - (80 / 400) * 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`absolute h-1 ${order.orderStatus === 'Delivered & Confirmed' ? 'bg-green-500' : 'bg-blue-500'} top-1/2 left-10 -translate-y-1/2 z-0 rounded-full`}
                ></motion.div>
              )}
              {order.orderStatus === 'Cancelled' && (
                <div className="absolute h-1 bg-red-500 w-[calc(100%-80px)] top-1/2 left-10 -translate-y-1/2 z-0 rounded-full"></div>
              )}
            </div>

            {order.adminMessage && (
                <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700 mb-2">Admin Message:</p>
                    <p className="text-gray-800 italic text-md">{order.adminMessage}</p>
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {showConfirmReceivedButton && (
                    <motion.button
                        onClick={() => openConfirmModal('confirmReceived')}
                        whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)' }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                        ✔️ Confirm Received
                    </motion.button>
                )}

                {canCancelOrder && (
                    <motion.button
                        onClick={() => openConfirmModal('cancelOrder')}
                        whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)' }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                        ❌ Cancel Order
                    </motion.button>
                )}

                {showDownloadReceiptButton && (
                    <motion.button
                        onClick={handleDownloadReceipt}
                        whileHover={{ scale: 1.03, boxShadow: '0 8px 16px rgba(147, 51, 234, 0.3)' }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center"
                    >
                        ⬇️ Download Receipt
                    </motion.button>
                )}
            </div>
          </motion.div>

          {/* Order Details: Products, Shipping, Payment, Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, ...pageTransition }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><span className="mr-2 text-blue-600">🛍️</span> Products in Order</h3>
              <ul className="space-y-4">
                {order.products.map(item => (
                  <li key={item.productId._id || item.productId} className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                    <img
                      src={`${API_BASE_URL}${item.image}`}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md mr-4 border border-gray-100"
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/E2E8F0/A0AEC0?text=No+Image"; }}
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      {item.selectedSize && <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>}
                      {item.selectedColor && <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>}
                    </div>
                    <p className="text-lg font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t-2 border-blue-200 flex justify-between items-center text-xl font-extrabold text-gray-900">
                <span>Order Total:</span>
                <span className="text-blue-700">₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, ...pageTransition }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><span className="mr-2 text-blue-600">🏠</span> Shipping Address</h3>
                <div className="text-gray-700 space-y-1">
                  <p><span className="font-semibold">Name:</span> {order.shippingAddress.personName}</p>
                  <p><span className="font-semibold">Mobile:</span> {order.shippingAddress.mobileNumber}</p>
                  <p><span className="font-semibold">Address:</span> {order.shippingAddress.address}, {order.shippingAddress.pincode}</p>
                  <p><span className="font-semibold">State:</span> {order.shippingAddress.state}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, ...pageTransition }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><span className="mr-2 text-blue-600">💳</span> Payment Method</h3>
                <p className="text-lg font-semibold text-gray-700">{order.paymentMethod}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, ...pageTransition }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><span className="mr-2 text-blue-600">ℹ️</span> Order Information</h3>
                <div className="text-gray-700 space-y-1">
                  <p><span className="font-semibold">Order Placed:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Last Updated:</span> {new Date(order.updatedAt).toLocaleDateString()}</p>
                  {order.deliveredAt && <p><span className="font-semibold">Delivered:</span> {new Date(order.deliveredAt).toLocaleDateString()}</p>}
                  {order.cancelledAt && <p><span className="font-semibold text-red-600">Cancelled On:</span> {new Date(order.cancelledAt).toLocaleDateString()}</p>}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <CustomModal
            show={showConfirmModal}
            message={modalMessage}
            onConfirm={handleConfirmAction}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
      </AnimatePresence>
      {/* Footer component now outside the main content's padding and fixed to the bottom */}
      <Footer className="fixed bottom-0 left-0 right-0 w-full z-50" />
    </motion.div>
  );
};

export default OrderDetailPage;
