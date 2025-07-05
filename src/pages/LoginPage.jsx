import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const luxoraLogo = "https://marriland.com/wp-content/plugins/marriland-core/images/pokemon/sprites/home/full/slugma.png";

  // Animation variants for smoother transitions
  const pageVariants = {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 18, mass: 0.8 } },
    exit: { opacity: 0, y: -100, transition: { type: 'spring', stiffness: 50, damping: 18, mass: 0.8 } }
  };

  const formVariants = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.15, type: 'spring', stiffness: 60, damping: 16, mass: 0.7 } }
  };

  const inputVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      setMessage(result.message);
      navigate('/');
    } else {
      setMessage(result.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!');
      setLoading(false);
      return;
    }
    if (parseInt(age) < 16) {
      setMessage('You must be at least 16 years old to sign up.');
      setLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber)) {
      setMessage('Mobile number must be 10 digits.');
      setLoading(false);
      return;
    }

    const result = await signup(username, password, age, mobileNumber);
    setLoading(false);
    if (result.success) {
      setMessage(result.message + ' Please log in.');
      setIsLoginView(true);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setAge('');
      setMobileNumber('');
    } else {
      setMessage(result.message);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 font-inter bg-gray-50"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className={`bg-white rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md border-4 border-gray-200 ${isLoginView ? 'mt-12' : 'mt-28'}`}
        variants={formVariants}
      >
        <div className="flex flex-col items-center mb-8">
          <motion.img
            src={luxoraLogo}
            alt="Luxora Logo"
            className="w-24 h-24 mb-4 rounded-full border-4 border-gray-200 shadow-lg object-cover"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />
          <motion.h2
            className="text-4xl sm:text-5xl font-extrabold text-center mb-2 text-gray-800 drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {isLoginView ? 'Welcome Back!' : 'Join Luxora'}
          </motion.h2>
          <motion.p
            className="text-md sm:text-lg text-center text-gray-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {isLoginView ? 'Securely log in to your account' : 'Create your new account today!'}
          </motion.p>
        </div>

        {message && (
          <motion.div
            className={`p-3 mb-5 rounded-lg text-center font-semibold border-l-4 ${message.includes('match') || message.includes('digits') || message.includes('old') ? 'bg-red-100 text-red-800 border-red-500' : 'bg-green-100 text-green-800 border-green-500'} shadow-md`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.div>
        )}

        {isLoginView ? (
          <motion.form onSubmit={handleLoginSubmit} className="space-y-5" variants={formVariants} initial="initial" animate="animate">
            <motion.div variants={inputVariants}>
              <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                id="login-username"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 transition-all duration-300 shadow-sm text-gray-900 placeholder-gray-400 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="off"
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="login-password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 transition-all duration-300 shadow-sm text-gray-900 placeholder-gray-400 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="off"
              />
            </motion.div>
            <motion.button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-lg shadow-md transition duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed bg-rose-700 text-white hover:bg-rose-800"
              disabled={loading}
              variants={buttonVariants}
            >
              {loading ? 'Logging In...' : 'Login'}
            </motion.button>
            <p className="mt-4 text-center text-gray-700">
              Don't have an account?{' '}
              <motion.button
                type="button"
                onClick={() => setIsLoginView(false)}
                className="text-rose-600 hover:text-rose-800 font-semibold underline"
                variants={buttonVariants}
              >
                Sign Up
              </motion.button>
            </p>
          </motion.form>
        ) : (
          <motion.form onSubmit={handleSignupSubmit} className="space-y-5" variants={formVariants} initial="initial" animate="animate">
            <motion.div variants={inputVariants}>
              <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                id="signup-username"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 transition-all duration-300 shadow-sm text-gray-900 placeholder-gray-400 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                autoComplete="off"
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="signup-password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 transition-all duration-300 shadow-sm text-gray-900 placeholder-gray-400 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                autoComplete="off"
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 transition-all duration-300 shadow-sm text-gray-900 placeholder-gray-400 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                autoComplete="off"
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age (Min 16)</label>
              <input
                type="number"
                id="age"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 transition-all duration-300 shadow-sm text-gray-900 placeholder-gray-400 outline-none"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Your age"
                required
                min="16"
                autoComplete="off"
              />
            </motion.div>
            <motion.div variants={inputVariants}>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (10 digits)</label>
              <input
                type="tel"
                id="mobileNumber"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 transition-all duration-300 shadow-sm text-gray-900 placeholder-gray-400 outline-none"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength="10"
                pattern="\d{10}"
                title="Mobile number must be 10 digits"
                placeholder="Your 10-digit mobile number"
                required
                autoComplete="off"
              />
            </motion.div>
            <motion.button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-lg shadow-md transition duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed bg-rose-700 text-white hover:bg-rose-800"
              disabled={loading}
              variants={buttonVariants}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </motion.button>
            <p className="mt-4 text-center text-gray-700">
              Already have an account?{' '}
              <motion.button
                type="button"
                onClick={() => setIsLoginView(true)}
                className="text-rose-600 hover:text-rose-800 font-semibold underline"
                variants={buttonVariants}
              >
                Login
              </motion.button>
            </p>
          </motion.form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
