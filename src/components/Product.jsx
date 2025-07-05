import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Star, Info, Check, XCircle } from 'lucide-react';

// === CRUCIAL FIX: Updated API_BASE_URL to your deployed backend URL ===
const API_BASE_URL = 'https://slugma-backend.vercel.app'; 

const COLORS_MAP = {
  'Red': '#EF4444',
  'Blue': '#3B82F6',
  'Green': '#22C55E',
  'Black': '#1A202C',
  'White': '#FFFFFF',
  'Grey': '#6B7280',
  'Orange': '#F97316',
  'Pink': '#EC4899',
  'Purple': '#8B5CF6',
  'Yellow': '#FACC15',
  'Brown': '#8B5F42',
  'Beige': '#F5F5DC',
};

const Product = ({ product }) => {
  const navigate = useNavigate();
  const productRef = useRef(null);

  useEffect(() => {
    if (productRef.current && window.gsap) {
      gsap.fromTo(productRef.current,
        { opacity: 0, y: 60, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' }
      );
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const handleProductClick = () => {
    navigate(`/products/${product._id}`);
  };

  const cardVariants = {
    initial: {
      opacity: 0,
      y: 80,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 70,
        damping: 20,
        mass: 1,
        duration: 0.9,
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.18)",
      y: -12,
      transition: {
        type: 'spring',
        stiffness: 180,
        damping: 15,
      },
    },
    tap: {
      scale: 0.97,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.12)",
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.08,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const renderStars = useCallback((rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={16} fill="currentColor" className="text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(
        <Star 
          key="half" 
          size={16} 
          fill="currentColor" 
          className="text-yellow-400" 
          style={{ 
            clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)',
            display: 'inline-block',
            overflow: 'hidden'
          }}
        />
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />);
    }
    return stars;
  }, []);

  return (
    <motion.div
      ref={productRef}
      className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center text-center cursor-pointer
                 border border-gray-100 overflow-hidden relative group"
      onClick={handleProductClick}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
    >
      {/* Product Image */}
      {product.image ? (
        <motion.img
          src={`${API_BASE_URL}${product.image}`}
          alt={product.name}
          className="w-96 h-64 object-cover rounded-2xl mb-5 border-4 border-gray-200 shadow-lg group-hover:border-rose-400 transition-colors duration-300"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/320x288/E2E8F0/A0AEC0?text=No+Image"; }}
          variants={imageVariants}
        />
      ) : (
        <motion.img
          src="https://placehold.co/320x288/E2E8F0/A0AEC0?text=No+Image"
          alt="No Image Available"
          className="w-96 h-64 object-cover rounded-2xl mb-5 border-4 border-gray-200 shadow-lg group-hover:border-rose-400 transition-colors duration-300"
          variants={imageVariants}
        />
      )}

      {/* Product Name */}
      <motion.h3
        className="text-2xl font-extrabold text-gray-800 mb-1 leading-tight tracking-tight"
        variants={textVariants}
      >
        {product.name}
      </motion.h3>
      
      {/* Category */}
      <motion.span 
        className="text-sm font-semibold text-gray-500 mb-4"
        variants={textVariants}
      >
        {product.category}
      </motion.span>

      {/* Product Description (Concise) */}
      <motion.p
        className="text-gray-600 text-sm mb-5 line-clamp-3 h-14 overflow-hidden"
        variants={textVariants}
      >
        {product.description}
      </motion.p>

      {/* Price Section */}
      <div className="flex flex-col items-center w-full mb-6">
        {product.salePrice !== null && product.salePrice < product.price ? (
          <>
            <motion.span className="text-3xl font-extrabold text-rose-700 mb-1" variants={textVariants}>
              ₹{product.salePrice.toFixed(2)}
            </motion.span>
            <motion.span 
              className="text-lg font-semibold text-gray-500 line-through" 
              variants={textVariants}
            >
              ₹{product.price.toFixed(2)}
            </motion.span>
          </>
        ) : (
          <motion.span className="text-2xl font-bold text-gray-800" variants={textVariants}>
            ₹{product.price.toFixed(2)}
          </motion.span>
        )}
      </div>

      {/* Reviews and Stock Status - Grouped for better flow */}
      <div className="w-full text-left space-y-2 mt-auto pt-4 border-t border-gray-100">
        {product.reviewCount > 0 ? (
          <motion.div className="flex items-center text-sm text-gray-700" variants={textVariants}>
            <div className="flex items-center mr-1">
              {renderStars(product.averageRating)}
            </div>
            <span className="font-medium text-yellow-600 mr-1">{product.averageRating}</span>
            <span className="text-gray-500">({product.reviewCount} reviews)</span>
          </motion.div>
        ) : (
          <motion.p className="text-gray-500 text-sm" variants={textVariants}>No reviews yet</motion.p>
        )}

        <motion.div className="text-sm" variants={textVariants}>
          {product.stock > 10 ? (
              <span className="text-green-600 font-medium flex items-center">
                  <Check size={16} className="mr-1" /> In Stock
              </span>
          ) : product.stock > 0 ? (
              <span className="text-yellow-600 font-medium flex items-center">
                  <Info size={16} className="mr-1" /> Low Stock ({product.stock})
              </span>
          ) : (
              <span className="text-red-600 font-medium flex items-center">
                  <XCircle size={16} className="mr-1" /> Out of Stock
              </span>
          )}
        </motion.div>

        {/* Sizes and Colors - More compact presentation */}
        {product.size && product.size.length > 0 && (
          <motion.div className="flex items-center text-sm text-gray-800" variants={textVariants}>
            <span className="font-semibold mr-2">Sizes:</span>
            <div className="flex flex-wrap gap-1">
              {product.size.map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {product.colors && product.colors.length > 0 && (
          <motion.div className="flex items-center text-sm text-gray-800" variants={textVariants}>
            <span className="font-semibold mr-2">Colors:</span>
            <div className="flex flex-wrap gap-1">
              {product.colors.map((colorName, idx) => {
                const hex = COLORS_MAP[colorName];
                return hex ? (
                  <span
                    key={idx}
                    className={`w-5 h-5 rounded-full border border-gray-300`}
                    style={{ backgroundColor: hex }}
                    title={colorName}
                  ></span>
                ) : null;
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Dynamic Border Glow on Hover */}
      <motion.div
        className="absolute inset-0 rounded-3xl border-4 border-transparent pointer-events-none"
        initial={{ borderColor: 'rgba(0,0,0,0)' }}
        whileHover={{ borderColor: 'rgba(225, 29, 72, 0.5)' }} // Rose-500 with 50% opacity
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default Product;
