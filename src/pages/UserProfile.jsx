import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ListOrdered, Edit, Mail, Phone, Cake } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:3001';

const UserProfile = () => {
  const { user, isAuthenticated, logout, checkUserExists } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user || !user._id) {
        setError('No user logged in. Please log in to view your profile.');
        setLoading(false);
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch profile data.');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(`Failed to load profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-inter">
        <p className="text-gray-700 text-xl">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-inter">
        <p className="text-red-600 text-xl">Error: {error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-inter">
        <p className="text-gray-700 text-xl">Profile data not available.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 font-inter flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 mt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-3xl border border-gray-100 flex flex-col items-center"
        variants={cardVariants}
      >
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <User size={120} className="text-gray-700 bg-gray-100 p-6 rounded-full border-4 border-gray-200 shadow-md" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-2">{profileData.username}</h2>
          <p className="text-lg text-gray-600">Welcome to your personalized dashboard.</p>
        </div>

        <div className="w-full space-y-8 mb-10">
          {/* Personal Information Card */}
          <motion.div
            className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                <User size={28} className="mr-3 text-rose-600" />
                Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-lg">
              <div className="flex items-center p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <User size={20} className="mr-3 text-gray-500" />
                <p><strong>Username:</strong> {profileData.username}</p>
              </div>
              <div className="flex items-center p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <Mail size={20} className="mr-3 text-gray-500" />
                <p><strong>Email:</strong> {profileData.email || 'N/A'}</p>
              </div>
              <div className="flex items-center p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <Phone size={20} className="mr-3 text-gray-500" />
                <p><strong>Mobile:</strong> {profileData.mobileNumber || 'N/A'}</p>
              </div>
              <div className="flex items-center p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <Cake size={20} className="mr-3 text-gray-500" />
                <p><strong>Age:</strong> {profileData.age || 'N/A'}</p>
              </div>
            </div>
            <motion.button
              onClick={() => { /* Implement edit profile functionality */ }}
              className="mt-8 w-full bg-rose-700 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-rose-800 transition duration-300 shadow-md flex items-center justify-center"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Edit size={20} className="mr-2" /> Edit Profile
            </motion.button>
          </motion.div>

          {/* My Orders Card */}
          <motion.div
            className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                <ListOrdered size={28} className="mr-3 text-rose-600" />
                <Link to="/my-orders" className="text-rose-600 hover:text-rose-800 transition-colors duration-200">
                  View My Orders
                </Link>
            </h3>
            <p className="text-gray-700 text-lg mb-6 text-center">Track active orders and view your complete purchase history.</p>
            <motion.button
              onClick={() => navigate('/my-orders')}
              className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-gray-900 transition duration-300 shadow-md flex items-center justify-center"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <ListOrdered size={20} className="mr-2" /> Go to Orders
            </motion.button>
          </motion.div>
        </div>

        {/* Logout button - positioned at the bottom of the main card */}
        <motion.button
          onClick={handleLogout}
          className="mt-auto w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-red-700 transition duration-300 shadow-md flex items-center justify-center"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Logout
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;