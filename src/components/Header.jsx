import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Menu, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { MenuBar } from './MenuBar';
import { useAuth } from '../context/AuthContext';
import slugmaLogo from '../assets/slugma.png'; // <--- Import the image here

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const headerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Determine when to show the back button (on any page except home and login)
  const showBackButton = location.pathname !== '/' && location.pathname !== '/login';
  // Determine when to show the hamburger menu (on any page except login and signup)
  const showHamburger = location.pathname !== '/login' && location.pathname !== '/signup';

  // GSAP animation for initial header load
  useEffect(() => {
    if (window.gsap && headerRef.current) {
      // Set initial state: slightly off-screen, transparent, and scaled down
      window.gsap.set(headerRef.current, { y: -100, opacity: 0, scale: 0.8 });
      // Animate to final state: on-screen, fully opaque, and normal scale
      window.gsap.to(headerRef.current, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.75)' });
    }
  }, []);

  // Handles navigation to account profile or login page
  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  // Handles navigating back in browser history
  const handleBackButtonClick = () => {
    navigate(-1);
  };

  // Handles user logout and navigates to home page
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Toggles the mobile menu open/close state
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Path to the logo image - this line can now be removed or commented out
  // const luxoraLogo = "src/assets/slugma.png"; // Assuming this is the Luxora logo

  return (
    <motion.header
      ref={headerRef}
      className={`
        fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-8
        bg-white text-gray-800 shadow-lg
        rounded-bl-3xl rounded-br-3xl border-b-4 border-gray-200
        transition-all duration-300 ease-in-out
      `}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Left section: Hamburger menu or Back button */}
        <div className="flex items-center space-x-4">
          {showHamburger && (
            <motion.button
              onClick={toggleMenu}
              className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 shadow-md group"
              title="Open Menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={28} className="text-rose-700 group-hover:text-rose-800 transition-colors" />
            </motion.button>
          )}

          {showBackButton && (
            <motion.button
              onClick={handleBackButtonClick}
              className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 shadow-md group"
              title="Go Back"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={28} className="text-rose-700 group-hover:text-rose-800 transition-colors" />
            </motion.button>
          )}
        </div>

        {/* Center section: Logo and Site Title */}
        <motion.div
          className="flex items-center cursor-pointer relative z-10 p-1 rounded-full border-2 border-rose-500 hover:border-rose-600 transition-colors duration-300"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Use the imported variable directly */}
          <img
            id="slugma-logo" // You can set an ID here if needed
            src={slugmaLogo} // <--- Changed from luxoraLogo to slugmaLogo
            alt="Slugma Logo" // Changed alt text to match the image name
            className="w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-3 rounded-full shadow-md"
          />
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-lg text-gray-800">Slugma</span>
        </motion.div>

        {/* Right section: Account button and User info/Logout */}
        <div className="flex items-center space-x-3 md:space-x-5 relative z-10">
          <motion.button
            onClick={handleAccountClick}
            className="p-2 md:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 shadow-md group"
            title="Account"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User size={28} className="text-rose-700 group-hover:text-rose-800 transition-colors" />
          </motion.button>

          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="hidden md:flex items-center space-x-3 bg-rose-50 px-4 py-2 rounded-full shadow-lg border border-rose-200 text-gray-800"
            >
              <span className="text-md font-semibold">Hi, {user.username}</span>
              <motion.button
                onClick={handleLogout}
                className="bg-rose-700 text-white font-bold px-4 py-1.5 rounded-full hover:bg-rose-800 transition-colors duration-300 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
      {/* MenuBar component for mobile/hamburger menu functionality */}
      <MenuBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    </motion.header>
  );
};

export default Header;