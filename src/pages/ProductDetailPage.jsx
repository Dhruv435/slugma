// File: user/pages/ProductDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingCart, Check, XCircle, Info } from 'lucide-react';
import StarRating from '../components/StarRating';
import Footer from '../components/Footer';
import Product from '../components/Product'; // Corrected import path

const API_BASE_URL = 'https://slugma-backend.vercel.app'; 

// Predefined colors for display (must match AddProduct.jsx)
const COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Black', hex: '#1A202C' },
  { name: 'White', hex: '#FFFFFF', border: true }, // Add border for white color button
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Brown', hex: '#8B5F42' },
  { name: 'Beige', hex: '#F5F5DC' },
];


const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  // Review System States
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [canUserReview, setCanUserReview] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);


  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productResponse = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (!productResponse.ok) {
        throw new Error('Failed to fetch product details.');
      }
      const productData = await productResponse.json();
      setProduct(productData);

      // Set initial selected size/color if product has only one option or pre-select first
      if (productData.size && productData.size.length === 1) setSelectedSize(productData.size[0]);
      if (productData.colors && productData.colors.length === 1) setSelectedColor(productData.colors[0]);

      // Fetch all products for related items (for simplicity, in a real app, use a dedicated API)
      const allProductsResponse = await fetch(`${API_BASE_URL}/api/products`);
      if (!allProductsResponse.ok) {
        console.warn('Failed to fetch all products for related items.');
        setRelatedProducts([]);
      } else {
        const allProductsData = await allProductsResponse.json();
        const filteredRelated = allProductsData
          .filter(p => p._id !== id) // Exclude the current product
          .sort(() => 0.5 - Math.random()) // Shuffle them
          .slice(0, 6); // Take up to 6 related products
        setRelatedProducts(filteredRelated);
      }


      if (isAuthenticated && user?._id) {
        // Check if current user has already reviewed this product
        const foundReview = productData.reviews.some(review => review.userId === user._id);
        setHasUserReviewed(foundReview);

        // Check if user has purchased and confirmed receipt of this product
        try {
            const orderCheckRes = await fetch(`${API_BASE_URL}/api/orders/user/${user._id}?status=history`);
            if (orderCheckRes.ok) {
                const userOrders = await orderCheckRes.json();
                const purchasedAndConfirmed = userOrders.some(order =>
                    order.orderStatus === 'Delivered & Confirmed' &&
                    order.products.some(item => item.productId === id)
                );
                setCanUserReview(purchasedAndConfirmed);
            } else {
                console.warn('Could not verify user purchase history for review eligibility.');
                setCanUserReview(false);
            }
        } catch (orderErr) {
            console.error('Error verifying purchase history:', orderErr);
            setCanUserReview(false); // Default to false on error
        }
      } else {
        setHasUserReviewed(false);
        setCanUserReview(false);
      }

    } catch (err) {
      console.error('Error fetching product:', err);
      setError(`Failed to load product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      if (product && value > product.stock) {
        setQuantity(product.stock);
        setMessage(`Only ${product.stock} items are available in stock.`);
      } else {
        setQuantity(value);
        setMessage('');
      }
    } else if (value < 1) {
        setQuantity(1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock === 0) {
        setMessage('❌ This product is currently out of stock.');
        return;
    }
    if (quantity > product.stock) {
        setMessage(`❌ Cannot add ${quantity} to cart. Only ${product.stock} items available.`);
        return;
    }
    // Only require selection if there are multiple options
    if (product.size && product.size.length > 0 && !selectedSize) {
        setMessage('❌ Please select a size before adding to cart.');
        return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
        setMessage('❌ Please select a color before adding to cart.');
        return;
    }

    const productToAdd = {
        ...product,
        quantity: quantity,
        selectedSize: selectedSize,
        selectedColor: selectedColor
    };

    addToCart(productToAdd);
    setMessage('✅ Product added to cart!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmittingReview(true);

    if (!isAuthenticated || !user?._id) {
      setMessage('❌ You must be logged in to submit a review.');
      setIsSubmittingReview(false);
      return;
    }
    if (!canUserReview) {
      setMessage('❌ You can only review products you have purchased and confirmed receipt of.');
      setIsSubmittingReview(false);
      return;
    }
    if (userRating === 0) {
      setMessage('❌ Please provide a star rating.');
      setIsSubmittingReview(false);
      return;
    }
    if (hasUserReviewed) {
      setMessage('❌ You have already submitted a review for this product.');
      setIsSubmittingReview(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          userId: user._id,
          rating: userRating,
          comment: userComment,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit review.');
      }

      setMessage('✅ Your review has been submitted successfully!');
      setUserRating(0);
      setUserComment('');
      setHasUserReviewed(true);
      fetchProductDetails(); // Re-fetch product details to update reviews and average rating
    } catch (err) {
      console.error('Error submitting review:', err);
      setMessage(`❌ Error submitting review: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center text-rose-500 font-semibold text-lg flex items-center justify-center">
          <svg className="animate-spin inline-block mr-3 h-5 w-5 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading product details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[500px] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-center text-center">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[500px] bg-white rounded-lg shadow-md flex items-center justify-center text-center p-4">
        <p className="text-gray-700 text-lg">Product not found.</p>
      </div>
    );
  }

  const currentCartQuantity = cartItems.find(item => item._id === product._id)?.quantity || 0;
  const maxAddToCartQuantity = product.stock - currentCartQuantity;


  return (
    <div className="min-h-screen flex flex-col mt-32"> {/* Added flex-col to enable footer stick to bottom */}
      <main className="flex-grow p-6 py-8 max-w-6xl mx-auto bg-white rounded-lg shadow-lg"> {/* Added py-8 for top/bottom padding */}
        {message && (
          <div className={`p-3 mb-4 rounded-md ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image Section */}
          <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg shadow-inner">
            <img
              src={`${API_BASE_URL}${product.image}`}
              alt={product.name}
              className="max-w-full h-auto max-h-[400px] object-contain rounded-md"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x400/E2E8F0/A0AEC0?text=No+Image"; }}
            />
          </div>

          {/* Product Details Section (Right Column - Main Info) */}
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.description}</p>

            {/* Price Display */}
            <div className="flex items-baseline space-x-3">
              {product.salePrice !== null && product.salePrice < product.price ? (
                <>
                  <span className="text-rose-600 font-bold text-3xl">₹{product.salePrice.toFixed(2)}</span>
                  <span className="text-gray-500 line-through text-xl">₹{product.price.toFixed(2)}</span>
                  <span className="text-sm text-red-500 ml-2">(Save {(100 - (product.salePrice / product.price) * 100).toFixed(0)}%)</span>
                </>
              ) : (
                <span className="text-gray-900 font-bold text-3xl">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            {/* Average Rating & Review Count */}
            {product.reviewCount > 0 ? (
              <div className="flex items-center text-lg">
                <StarRating rating={product.averageRating} size={24} />
                <span className="font-semibold text-yellow-600 ml-2 mr-1">{product.averageRating}</span>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
            )}

            {/* Stock Availability */}
            <div className="text-base">
              {product.stock > 10 ? (
                  <span className="text-green-600 font-medium flex items-center">
                      <Check size={20} className="mr-1" /> In Stock
                  </span>
              ) : product.stock > 0 ? (
                  <span className="text-yellow-600 font-medium flex items-center">
                      <Info size={20} className="mr-1" /> Low Stock ({product.stock} available)
                  </span>
              ) : (
                  <span className="text-red-600 font-medium flex items-center">
                      <XCircle size={20} className="mr-1" /> Out of Stock
                  </span>
              )}
            </div>

            {/* Available Colors Display - Now for selection */}
            {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <p className="text-md font-medium text-gray-700 mb-2">Available Colors:</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.filter(c => product.colors.includes(c.name)).map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2
                        ${selectedColor === color.name ? 'border-rose-600 ring-2 ring-rose-500' : (color.border ? 'border-gray-300' : 'border-transparent hover:border-gray-400')}`
                      }
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor === color.name && (
                        <Check size={20} className="text-white drop-shadow-[0_0px_3px_rgba(0,0,0,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Sizes Display - Now for selection */}
            {product.size && Array.isArray(product.size) && product.size.length > 0 && (
              <div>
                <p className="text-md font-medium text-gray-700 mb-2">Available Sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {product.size.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-md border transition-colors duration-200
                        ${selectedSize === s
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart - Moved below colors/sizes */}
            <div className="flex items-center space-x-4 mt-6"> {/* Added mt-6 for spacing */}
              <label htmlFor="quantity" className="text-md font-medium text-gray-700">Quantity:</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={maxAddToCartQuantity}
                className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-rose-500 focus:border-rose-500"
              />
              <button
                onClick={handleAddToCart}
                className={`flex items-center px-8 py-4 rounded-full font-bold text-lg shadow-xl transition duration-300 ease-in-out
                  ${product.stock === 0 || maxAddToCartQuantity === 0
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-rose-700 text-white hover:bg-rose-800 transform hover:-translate-y-1'
                  }`}
                disabled={product.stock === 0 || maxAddToCartQuantity === 0}
              >
                <ShoppingCart size={24} className="mr-3" />
                {product.stock === 0 ? 'Out of Stock' : (maxAddToCartQuantity === 0 ? 'Item in Cart' : 'Add to Cart')}
              </button>
            </div>

          </div>
        </div>

        {/* Full Product Details Section (Bottom Section with two columns) */}
        <div className="mt-12 p-6 border-t border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">More Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Key Features - Moved to the left column */}
            <div className="space-y-4">
              {product.moreDescription && Array.isArray(product.moreDescription) && product.moreDescription.length > 0 && (
                  <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Key Features:</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {product.moreDescription.map((item, index) => (
                              <li key={index}>{item}</li>
                          ))}
                      </ul>
                  </div>
              )}
              {(!product.moreDescription || product.moreDescription.length === 0) && (
                  <div className="text-gray-500 text-sm italic">No key features listed for this product.</div>
              )}
              {product.brand && <p className="text-lg text-gray-700"><span className="font-semibold">Brand:</span> {product.brand}</p>}
              {product.material && <p className="text-lg text-gray-700"><span className="font-semibold">Material:</span> {product.material}</p>}
              {product.sku && <p className="text-lg text-gray-700"><span className="font-semibold">SKU:</span> {product.sku}</p>}
            </div>
            <div className="space-y-4">
              
              {(product.dimensions?.length > 0 || product.dimensions?.width > 0 || product.dimensions?.height > 0) && (
                <p className="text-lg text-gray-700"><span className="font-semibold">Dimensions (LxWxH):</span> {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm</p>
              )}
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Added On:</span> {new Date(product.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-gray-900">You Might Also Like</h2>
              <Link to="/products" className="text-rose-600 hover:text-rose-800 font-semibold text-lg transition-colors duration-200">
                Find More &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Changed to lg:grid-cols-3 */}
              {relatedProducts.map(relatedProduct => (
                <Product key={relatedProduct._id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}

        {/* Review Section */}
        <div className="mt-12 p-6 border-t border-gray-200">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Customer Reviews</h2>
          
          {product.reviewCount > 0 ? (
              <div className="flex items-center mb-6">
                  <StarRating rating={product.averageRating} size={32} />
                  <span className="text-3xl font-bold text-yellow-600 ml-4 mr-2">{product.averageRating}</span>
                  <span className="text-xl text-gray-600">({product.reviewCount} Reviews)</span>
              </div>
          ) : (
              <p className="text-gray-500 text-lg mb-6">No reviews yet for this product.</p>
          )}

          {/* User Review Submission Form */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Write a Review</h3>
            {!isAuthenticated ? (
              <p className="text-rose-600">Please <Link to="/login" className="underline font-semibold">log in</Link> to submit a review.</p>
            ) : hasUserReviewed ? (
              <p className="text-gray-600">You have already submitted a review for this product. Thank you!</p>
            ) : !canUserReview ? (
              <p className="text-red-600">You can only review products you have purchased and confirmed receipt of.</p>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Your Rating:</label>
                  <StarRating
                    rating={userRating}
                    onRatingChange={setUserRating}
                    editable={true}
                    size={28}
                  />
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Your Comment (Optional):</label>
                  <textarea
                    id="comment"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    rows="4"
                    maxLength="1000"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500 resize-y"
                    placeholder="Share your thoughts about this product..."
                  />
                  <p className="text-right text-xs text-gray-500">{userComment.length}/1000 characters</p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-rose-600 text-white py-2 rounded-md font-semibold hover:bg-rose-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={userRating === 0 || isSubmittingReview}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>

          {/* Display Existing Reviews */}
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">All Reviews ({product.reviewCount})</h3>
          {product.reviews.length === 0 ? (
            <p className="text-gray-500 italic">No customer reviews yet. Be the first to share your experience!</p>
          ) : (
            <div className="space-y-6">
              {/* Show up to 4 reviews directly */}
              {product.reviews.slice(0, 4).map(review => (
                <div key={review._id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating} size={20} />
                    <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {review.username}
                  </p>
                  {review.comment && <p className="text-gray-700 italic">{review.comment}</p>}
                  {!review.comment && <p className="text-gray-500 italic text-sm">No comment provided.</p>}
                </div>
              ))}
              {product.reviews.length > 4 && (
                <div className="text-center mt-6">
                  <p className="text-gray-600 font-medium">And {product.reviewCount - 4} more reviews.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer /> {/* Render the Footer component here */}
    </div>
  );
};

export default ProductDetailPage;
