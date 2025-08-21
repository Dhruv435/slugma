import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Info, Check, XCircle, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Product from '../components/Product'; // Corrected import path for Product component
import Footer from '../components/Footer';

// === CRUCIAL FIX: Updated API_BASE_URL to your deployed backend URL ===
const API_BASE_URL = 'http://localhost:3001';

// If you ever run this frontend locally again, you might need to change this back to 'http://localhost:3001'
// or use environment variables (recommended for production).

const CATEGORIES = ['All', 'Shoes', 'Watch', 'Perfume', 'Belt', 'Bag'];

const COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Black', hex: '#1A202C' },
  { name: 'White', hex: '#FFFFFF', border: true },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Brown', hex: '#8B5F42' },
  { name: 'Beige', hex: '#F5F5DC' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const LUXURY_BRANDS_BY_CATEGORY = {
    'Bag': ['Louis Vuitton', 'Gucci', 'Chanel', 'Hermes', 'Prada'],
    'Watch': ['Rado', 'Omega', 'Rolex', 'Tag Heuer', 'Cartier'],
    'Perfume': ['Valentino', 'Dior', 'Chanel', 'Tom Ford', 'Creed'],
    'Belt': ['Hermes', 'Gucci', 'Louis Vuitton', 'Versace', 'Salvatore Ferragamo'],
    'Shoes': ['Nike', 'Adidas', 'Puma', 'Gucci', 'Prada'],
};


const ProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState(0);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // The fetch call will now go to your deployed Vercel backend
        const response = await fetch(`${API_BASE_URL}/api/products`);
        
        if (!response.ok) {
          // Attempt to parse error message from backend if available
          const errorData = await response.json().catch(() => ({})); // Safe parse
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data);

      } catch (err) {
          console.error('❌ ProductPage: Error fetching products:', err);
          setError(`Failed to load products: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on component mount

  const filteredBrandsForDisplay = useMemo(() => {
    let brands = new Set();
    
    if (selectedCategory === 'All') {
      products.forEach(p => {
        if (p.brand) brands.add(p.brand);
      });
    } else {
      products.filter(p => p.category === selectedCategory).forEach(p => {
        if (p.brand) brands.add(p.brand);
      });
      const luxuryBrands = LUXURY_BRANDS_BY_CATEGORY[selectedCategory] || [];
      luxuryBrands.forEach(b => brands.add(b));
    }
    
    const sortedBrands = Array.from(brands).sort((a, b) => {
        if (a === '' ) return 1; // Empty string brands at the end
        if (b === '' ) return -1;
        return a.localeCompare(b);
    });

    return ['All', ...sortedBrands];
  }, [products, selectedCategory]);

  useEffect(() => {
    // Reset selected brand if the current category no longer contains it
    if (selectedBrand !== 'All' && !filteredBrandsForDisplay.includes(selectedBrand)) {
      setSelectedBrand('All');
    }
  }, [selectedCategory, selectedBrand, filteredBrandsForDisplay]);


  const filteredProducts = useMemo(() => {
    let tempProducts = [...products];

    if (selectedCategory && selectedCategory !== 'All') {
      tempProducts = tempProducts.filter(product => product.category === selectedCategory);
    }

    if (selectedBrand && selectedBrand !== 'All') {
      tempProducts = tempProducts.filter(product => product.brand === selectedBrand);
    }

    const parsedMinPrice = parseFloat(minPrice);
    const parsedMaxPrice = parseFloat(maxPrice);

    if (!isNaN(parsedMinPrice)) {
      tempProducts = tempProducts.filter(product => {
        const effectivePrice = product.salePrice !== null ? product.salePrice : product.price;
        return effectivePrice >= parsedMinPrice;
      });
    }
    if (!isNaN(parsedMaxPrice)) {
      tempProducts = tempProducts.filter(product => {
        const effectivePrice = product.salePrice !== null ? product.salePrice : product.price;
        return effectivePrice <= parsedMaxPrice;
      });
    }

    if (selectedColors.length > 0) {
      tempProducts = tempProducts.filter(product =>
        product.colors && product.colors.some(color => selectedColors.includes(color))
      );
    }

    if (selectedSizes.length > 0) {
      tempProducts = tempProducts.filter(product =>
        product.size && product.size.some(s => selectedSizes.includes(s))
      );
    }

    if (selectedRating > 0) {
      tempProducts = tempProducts.filter(product => product.averageRating >= selectedRating);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().startsWith(lowerCaseSearchTerm) ||
        product.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        (product.brand && product.brand.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm)))
      );
    }
    
    return tempProducts;
  }, [products, searchTerm, selectedCategory, selectedRating, minPrice, maxPrice, selectedBrand, selectedColors, selectedSizes]);


  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
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

  const renderFilterStars = useCallback(() => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={`filter-star-${i}`}
          size={28}
          fill={selectedRating >= i ? "currentColor" : "none"}
          className={`${selectedRating >= i ? "text-yellow-500" : "text-gray-300"} cursor-pointer transition-colors duration-200 hover:text-yellow-400`}
          onClick={() => setSelectedRating(i === selectedRating ? 0 : i)}
        />
      );
    }
    return stars;
  }, [selectedRating]);

  const handleToggleColorFilter = (colorName) => {
    setSelectedColors(prev => prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  const handleToggleSizeFilter = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedRating(0);
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrand('All');
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  // Animation variants for sidebar
  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.3 } }
  };

  // Animation variants for main content
  const mainContentVariants = {
    shifted: { filter: 'blur(4px)', scale: 0.98, transition: { duration: 0.3 } },
    normal: { filter: 'blur(0px)', scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col mt-28">
      {/* Main Content Area */}
      <motion.div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${showFilterSidebar ? 'md:ml-72' : ''}`}
        variants={showFilterSidebar ? mainContentVariants.shifted : mainContentVariants.normal}
        animate={showFilterSidebar ? 'shifted' : 'normal'}
      >
        {/* Search and Filter Bar */}
        <div className="bg-white shadow-md p-4 sticky top-0 z-40  border-4 border-rose-100 hover:border-rose-200 rounded-xl transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-2"> {/* Added px-2 for 5px equivalent spacing */}
            <div className={`relative flex-grow sm:flex-grow-0`} style={{ width: '360px' }}> {/* Fixed width for search bar */}
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all duration-300 ease-in-out text-gray-800 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setIsSearchActive(false)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end"> {/* Adjusted gap to 2 (8px) for category buttons */}
              {/* Category Buttons in Header */}
              <div className="flex flex-wrap gap-3 pr-4">
                {CATEGORIES.map(category => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 border
                      ${selectedCategory === category
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400' // Added ring for emphasis
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-rose-400' // Changed border color
                      }`
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => setShowFilterSidebar(!showFilterSidebar)}
                className="p-2 rounded-full bg-rose-700 text-white shadow-md hover:bg-rose-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 border border-rose-700" // Added border
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Toggle Filters"
              >
                <Filter size={24} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-6 lg:p-8">
          {loading && (
            <div className="text-center py-10 text-gray-600">Loading products...</div>
          )}
          {error && (
            <div className="text-center py-10 text-red-600">{error}</div>
          )}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-10 text-gray-600">No products found matching your criteria.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {showFilterSidebar && (
          <motion.aside
            className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl p-7 z-50 flex flex-col rounded-r-xl border-r-4 border-gray-200"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-extrabold text-gray-800">Filters</h3>
              <motion.button
                onClick={() => setShowFilterSidebar(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 border border-gray-300" // Added border
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Close Filters"
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 pl-2"> {/* Added overflow-y-auto and adjusted padding/margin for scrollbar */}
              {/* Category Filter in Sidebar */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(category => (
                          <motion.button
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 border
                                  ${selectedCategory === category
                                      ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400' // Added ring for emphasis
                                      : 'bg-gray-100 text-gray-700 border-rose-300 hover:bg-gray-200 hover:border-rose-400' // Changed border color
                                  }`
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                          >
                              {category}
                          </motion.button>
                      ))}
                  </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Price Range</h4>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-gray-800" // Improved focus border
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-gray-800" // Improved focus border
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Customer Rating</h4>
                <div className="flex items-center gap-1">
                  {renderFilterStars()}
                  <span className="ml-2 text-gray-600">{selectedRating > 0 ? `${selectedRating} Stars & Up` : 'Any Rating'}</span>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Brand</h4>
                <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-2 border border-rose-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none shadow-sm appearance-none pr-8" // Improved border and added appearance-none for custom arrow
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                >
                    {filteredBrandsForDisplay.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                    ))}
                </select>
              </div>

              {/* Color Filter */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <motion.button
                      key={color.name}
                      onClick={() => handleToggleColorFilter(color.name)}
                      className={`w-8 h-8 rounded-full border-2 ${color.border ? 'border-gray-400' : 'border-transparent'} flex items-center justify-center transition-all duration-200
                        ${selectedColors.includes(color.name) ? 'ring-2 ring-rose-500 ring-offset-1' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {selectedColors.includes(color.name) && (
                        <Check size={18} className={`${color.name === 'White' ? 'text-gray-800' : 'text-white'}`} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Sizes</h4>
                    <div className="flex flex-wrap gap-2">
                        {SIZES.map(s => (
                            <motion.button
                                key={s}
                                onClick={() => handleToggleSizeFilter(s)}
                                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 border border-rose-300
                                    ${selectedSizes.includes(s)
                                        ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-rose-400'
                                    }`
                                }
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {s}
                                {selectedSizes.includes(s) && <Check size={16} className="inline-block ml-2" />}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div> {/* End of scrollable filter content */}

            <div className="mt-auto pt-6 border-t border-gray-200 text-center">
                <motion.button
                    onClick={() => { clearAllFilters(); setShowFilterSidebar(false); }}
                    className="px-8 py-3 bg-rose-700 text-white font-semibold rounded-full shadow-lg hover:bg-rose-800 transition-colors duration-300 border border-rose-700" // Added border
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Clear All Filters
                </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default ProductPage;
