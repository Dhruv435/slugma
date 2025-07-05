// MenuBar.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Package, Home, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MenuBar = ({ menuOpen, setMenuOpen }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('home');

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavigation = (page, path) => {
    setCurrentPage(page);
    navigate(path);
    setTimeout(() => {
      toggleMenu();
    }, 120);
  };

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Cart', icon: ShoppingCart, path: '/cart' },
    { name: 'Orders', icon: ReceiptText, path: '/my-orders' },
  ];

  // Color definitions for Luxury Light Theme
  const menuBg = 'bg-white'; // Main menu background
  const menuBorder = 'border-gray-200'; // Subtle border for menu
  const menuTextColor = 'text-gray-800'; // Main text color for menu items and title
  const accentColor = 'rose-700'; // Primary accent for icons, active states
  const accentHoverColor = 'rose-800'; // Darker accent for hover states
  const buttonBg = 'bg-gray-100'; // Background for interactive buttons (like close)
  const buttonHoverBg = 'hover:bg-gray-200'; // Hover background for interactive buttons
  const ringFocusColor = 'focus:ring-rose-500'; // Focus ring color

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.aside
          key="menu-bar-panel"
          className={`fixed inset-y-0 left-0 w-72 ${menuBg} ${menuTextColor} z-[100] shadow-2xl p-8 flex flex-col justify-between rounded-r-xl border-r-4 ${menuBorder}`}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{
            duration: 0.28,
            ease: "easeOut"
          }}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 150, damping: 20 }}
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className={`text-4xl font-extrabold ${menuTextColor}`}>Menu</h2>
            </div>
            <nav className="flex flex-col gap-6 text-xl">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  className={`flex items-center gap-5 py-4 px-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out
                    ${buttonBg} ${buttonHoverBg} ${menuTextColor} border-2 border-gray-200
                    ${currentPage === item.name.toLowerCase()
                      ? `ring-2 ${ringFocusColor} ring-opacity-50 border-${accentColor}`
                      : ''
                    }`}
                  onClick={() => handleNavigation(item.name.toLowerCase(), item.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon size={26} className={`text-${accentColor}`} /> <span className="font-semibold">{item.name}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>

          <motion.div
            className="flex justify-center mt-10"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 20 }}
          >
            <motion.button
              onClick={toggleMenu}
              className={`p-4 rounded-full shadow-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${ringFocusColor} focus:ring-opacity-50 ${buttonBg} ${buttonHoverBg} border-2 border-gray-200`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={32} className={`text-${accentColor}`} />
            </motion.button>
          </motion.div>

          <motion.div
            className="text-sm text-gray-500 text-center border-t border-gray-200 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
              © 2023 Slugma. All rights reserved.
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
