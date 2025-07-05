// File: components/Footer.jsx

import React from 'react';
import { Mail, Send, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import slugmaLogo from '../assets/slugma.png'; // Import the image here

const Footer = () => {


  const currentYear = new Date().getFullYear();

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.footer
      className="bg-gray-800 text-gray-300 py-16 px-6 md:px-12 lg:px-24 mt-52"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      }}
      style={{ paddingTop: '100px', paddingBottom: '0px' }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-700">
        {/* Company Info Section */}
        <motion.div className="space-y-6" variants={sectionVariants}>
          {/* Use the imported variable directly */}
          <img
            id="footer-slugma-logo"
            src={slugmaLogo} 
            alt="Luxora Logo"
            className="h-16 w-16 mb-4 rounded-full shadow-lg"
          />
          <p className="text-gray-400 leading-relaxed">
            Slugma offers a curated selection of premium products, blending quality, style, and innovation. Discover your next favorite item with us.
          </p>
        </motion.div>

        {/* Quick Links Section */}
        <motion.div className="space-y-4" variants={sectionVariants}>
          <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-rose-500 pb-2 inline-block">Quick Links</h3>
          <ul className="space-y-2">
            <motion.li variants={itemVariants}><a href="#" className="hover:text-rose-300 transition-colors duration-200">About Us</a></motion.li>
            <motion.li variants={itemVariants}><a href="#" className="hover:text-rose-300 transition-colors duration-200">Our Products</a></motion.li>
            <motion.li variants={itemVariants}><a href="#" className="hover:text-rose-300 transition-colors duration-200">Blog</a></motion.li>
            <motion.li variants={itemVariants}><a href="#" className="hover:text-rose-300 transition-colors duration-200">Careers</a></motion.li>
          </ul>
        </motion.div>

        {/* Customer Service Section */}
        <motion.div className="space-y-4" variants={sectionVariants}>
          <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-rose-500 pb-2 inline-block">Customer Service</h3>
          <ul className="space-y-2">
            <motion.li variants={itemVariants}><a href="#" className="hover:text-rose-300 transition-colors duration-200">FAQs</a></motion.li>
            <motion.li variants={itemVariants}><a href="#" className="hover:text-rose-300 transition-colors duration-200">Shipping Information</a></motion.li>
            <motion.li variants={itemVariants}><a href="#" className="hover:text-rose-300 transition-colors duration-200">Returns & Refunds</a></motion.li>
            <motion.li variants={itemVariants}><a href="#" className="hover:text-rose-300 transition-colors duration-200">Privacy Policy</a></motion.li>
          </ul>
        </motion.div>

        {/* Newsletter & Social Media Section */}
        <motion.div className="space-y-6" variants={sectionVariants}>
          <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-rose-500 pb-2 inline-block">Stay Connected</h3>
          <p className="text-gray-400">Subscribe to our newsletter for exclusive offers and updates!</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="Your email address"
                className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <motion.button
              className="flex-shrink-0 bg-rose-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-rose-800 transition-colors duration-300 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit <Send size={18} className="ml-2" />
            </motion.button>
          </div>

          <div className="flex space-x-6 pt-4">
            <motion.a href="#" className="text-gray-400 hover:text-rose-300 transition-colors duration-200" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
              <Facebook size={28} />
            </motion.a>
            <motion.a href="#" className="text-gray-400 hover:text-rose-300 transition-colors duration-200" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
              <Instagram size={28} />
            </motion.a>
            <motion.a href="#" className="text-gray-400 hover:text-rose-300 transition-colors duration-200" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
              <Twitter size={28} />
            </motion.a>
            <motion.a href="#" className="text-gray-400 hover:text-rose-300 transition-colors duration-200" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
              <Linkedin size={28} />
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-gray-500 text-sm pt-8">
        © {currentYear} Slugma. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;