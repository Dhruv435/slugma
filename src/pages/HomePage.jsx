// HomePage.jsx
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Footer from '../components/Footer';

// --- Hero Section ---
const HeroSection = ({ scrollYProgress }) => {
  const navigate = useNavigate();
  const translateY = useTransform(scrollYProgress, [0, 1], ['0vh', '150vh']);

  return (
    <div className="relative w-full h-screen">
      <motion.div
        className="fixed top-0 left-0 w-full h-[120vh] z-0"
        style={{ y: translateY }}
      >
        <img
          src="src/assets/jordanbg.webp"
          alt="Luxury fashion and tech items"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </motion.div>

      <div className="relative z-10 h-screen flex flex-col justify-center items-center text-center px-6 md:px-12">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-white text-5xl md:text-7xl font-extrabold drop-shadow-2xl mb-6 leading-tight"
        >
          Elevate Your Lifestyle
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }}
          className="text-white/90 text-lg md:text-xl max-w-3xl mb-10"
        >
          Discover a world of premium fashion, cutting-edge technology, and exquisite lifestyle products, meticulously curated for the discerning individual.
        </motion.p>
        <motion.button
          // Updated onClick to navigate to /products
          onClick={() => document.getElementById('main-content').scrollIntoView({ behavior: 'smooth' })}
          className="px-12 py-5 bg-rose-700 text-white text-xl font-semibold rounded-full shadow-lg hover:bg-rose-800 transition-all duration-300 ease-in-out"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Collections
        </motion.button>
      </div>
    </div>
  );
};

// --- Blob Background (Subtle) ---
const BlobBackground = () => (
  <>
    <motion.div
      className="absolute top-[10%] left-[5%] w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"
      animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-[15%] right-[7%] w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 z-0"
      animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
      transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-100 rounded-full mix-blend-multiply filter blur-4xl opacity-20 -translate-x-1/2 -translate-y-1/2 z-0"
      animate={{ scale: [1, 1.05, 1], rotate: [0, 360, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    />
  </>
);

// --- Product Showcase (Top 3 Categories) ---
const ProductShowcase = ({ title, description, img, color, path, delay = 0 }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={`flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-xl backdrop-blur-md border border-${color}-200 transform hover:scale-[1.02] transition-transform duration-300 group`}
    >
      <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden mb-8 shadow-lg border-4 border-white group-hover:border-${color}-400 transition-colors duration-300">
        <img src={img} alt={title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" loading="lazy" />
      </div>
      <h3 className={`text-3xl font-bold text-gray-800 mb-4`}>{title}</h3>
      <p className="text-gray-600 max-w-xl mb-8 leading-relaxed">{description}</p>
      <button
        onClick={() => navigate('/products')}
        className={`px-10 py-4 bg-rose-700 text-white font-semibold rounded-full hover:bg-rose-800 transition-transform duration-300 transform hover:scale-105 active:scale-95 shadow-md`}
      >
        Shop Now
      </button>
    </motion.div>
  );
};

// --- Featured Category Card ---
const FeaturedCategoryCard = ({ title, img, path, delay }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer transform hover:scale-[1.03] transition-transform duration-300"
      onClick={() => navigate(`/category/${path}`)}
    >
      <img src={img} alt={title} className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white text-3xl font-bold p-4 text-center">
          {title}
        </h3>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white text-2xl font-semibold">
        {title}
      </div>
    </motion.div>
  );
};

// --- Spotlight Feature Block (Alternating Layout) ---
const FeatureBlock = ({ title, description, img, path, reverse = false, delay = 0 }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 bg-white rounded-3xl shadow-xl p-8 md:p-12 lg:p-16 ${reverse ? 'md:flex-row-reverse' : ''}`}
    >
      <div className="w-full md:w-1/2 flex-shrink-0">
        <img
          src={img}
          alt={title}
          className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-lg"
          loading="lazy"
        />
      </div>
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h3 className="text-4xl font-bold text-gray-800 mb-6 leading-tight">{title}</h3>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">{description}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-10 py-4 bg-rose-700 text-white font-semibold rounded-full hover:bg-rose-800 transition-transform duration-300 transform hover:scale-105 active:scale-95 shadow-md"
        >
          View Product
        </button>
      </div>
    </motion.div>
  );
};

// --- Product Card (for New Arrivals) ---
const ProductCard = ({ title, price, img, path, delay }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.03] transition-transform duration-300 group cursor-pointer"
      // Updated to navigate to a generic product page
      onClick={() => navigate(`/products`)}
    >
      <div className="relative w-full h-60 overflow-hidden">
        <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-lg font-semibold">${price}</p>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{title}</h3>
        <button className="mt-2 w-full bg-rose-700 text-white py-2 rounded-lg hover:bg-rose-800 transition-colors duration-300">
          Explore
        </button>
      </div>
    </motion.div>
  );
};

// --- Testimonial Card ---
const TestimonialCard = ({ quote, author, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center flex flex-col items-center"
  >
    <p className="text-gray-700 text-lg italic mb-4 leading-relaxed">"{quote}"</p>
    <p className="font-semibold text-rose-700 text-base">- {author}</p>
  </motion.div>
);

// --- Main HomePage Component ---
const HomePage = () => {
  const scrollContainerRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const categoriesSectionRef = useRef(null);

  const { scrollYProgress } = useScroll({ container: scrollContainerRef });

  const { scrollYProgress: aboutScrollProgress } = useScroll({
    target: aboutSectionRef,
    container: scrollContainerRef,
    offset: ['start end', 'end start'],
  });
  const aboutBgY = useTransform(aboutScrollProgress, [0, 1], ['-50%', '50%']);

  const { scrollYProgress: categoriesScrollProgress } = useScroll({
    target: categoriesSectionRef,
    container: scrollContainerRef,
    offset: ["start end", 'end start']
  });
  const categoriesBgY = useTransform(categoriesScrollProgress, [0, 1], ["-10vh", "10vh"]);

  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.body.style.overflowY = 'hidden';

    return () => {
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
    };
  }, []);

  return (
    <div ref={scrollContainerRef} className="relative w-screen h-screen overflow-y-scroll scroll-smooth bg-gray-50 font-inter">
      <div className="w-full h-screen relative z-10">
        <HeroSection scrollYProgress={scrollYProgress} />
      </div>

      <div id="main-content" className="relative z-10 overflow-hidden">
        <BlobBackground />

        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 py-24 px-6 relative z-10">
          <ProductShowcase
            title="Valentino Luxury Collection"
            description="Indulge in luxury, high fashion with Valentino's latest collection."
            img="src/assets/valentino.jpeg"
            color="rose"
            path="smart-tech"
          />
          <ProductShowcase
            title="Ommega watch Collection"
            description="Explore the depths and stars, always with timeless precision."
            img="src/assets/omega.jpg"
            color="blue"
            path="jewelry"
            delay={0.15}
          />
          <ProductShowcase
            title="Jordan shoes Collection"
            description="Unleash your inner legend with iconic style and athletic excellence."
            img="src/assets/jordangreen.jpeg"
            color="gray"
            path="fashion"
            delay={0.3}
          />
        </section>

        <section
          ref={categoriesSectionRef}
          id="featured-categories"
          className="relative py-24 px-6 overflow-hidden min-h-[600px] flex flex-col justify-center"
        >
          <div className='absolute inset-0 z-0'>
            <motion.div style={{y: categoriesBgY}} className='relative w-full h-[120%] -top-[10%]'>
                <img
                    src="src/assets/categories-bg.webp"
                    alt="Categories Background"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40"></div>
            </motion.div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto text-white">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center text-5xl md:text-6xl font-extrabold mb-16 leading-tight drop-shadow-lg"
              style={{ color: 'white' }}
            >
              Explore Our Diverse Categories
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeaturedCategoryCard
                title="Omega"
                img="src/assets/ooooo.png"
                path="electronics"
                delay={0}
              />
              <FeaturedCategoryCard
                title="Louis Vuitton"
                img="src/assets/lvbags.png"
                path="home-living"
                delay={0.15}
              />
              <FeaturedCategoryCard
                title="Valentino"
                img="src/assets/valentino.webp"
                path="beauty-care"
                delay={0.3}
              />
               <FeaturedCategoryCard
                title="Jordan"
                img="src/assets/jordanyellow.webp"
                path="sports-outdoors"
                delay={0.45}
              />
              <FeaturedCategoryCard
                title="Rado"
                img="src/assets/rado.webp"
                path="books-media"
                delay={0.6}
              />
              <FeaturedCategoryCard
                title="Gucci"
                img="src/assets/gucci.webp"
                path="kids-baby"
                delay={0.75}
              />
            </div>
          </div>
        </section>

        <section id="spotlight-collection" className="py-24 px-6 bg-gray-100">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center text-5xl font-extrabold text-gray-800 mb-8 leading-tight"
          >
            Curated For You: Our Spotlight Collection
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut'}}
            className="text-center text-xl text-gray-600 max-w-4xl mx-auto mb-20"
          >
            Discover exclusive pieces and limited editions that embody the essence of Luxora's commitment to quality and design excellence.
          </motion.p>
          <div className="max-w-7xl mx-auto grid gap-20">
            <FeatureBlock
              title="Louis Vuitton Collection"
              description="Experience the allure of Louis Vuitton. Discover exquisite designs and luxurious materials that define sophisticated travel and iconic personal style."
              img="src/assets/lv.png"
              path="horizon-smartwatch"
              delay={0}
            />
            <FeatureBlock
              title="Nike Jordan Collectin"
              description="Step into a legacy of innovation and performance with Jordan Brand. Discover designs that fuse groundbreaking technology with timeless aesthetics, inspired by the greatest to ever play."
              img="src/assets/jordanbg.jpg"
              path="artisan-leather-bag"
              reverse={true}
              delay={0.15}
            />
            <FeatureBlock
              title="Omega Watch Collection"
              description="Experience the legacy of Omega. From lunar expeditions to Olympic timekeeping, their iconic watches blend timeless elegance with cutting-edge technology, making every moment an adventure"
              img="src/assets/omega.jpg"
              path="lumina-desk-lamp"
              delay={0.3}
            />
          </div>
        </section>

        <section id="new-arrivals" className="py-24 px-6 bg-gray-50">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center text-5xl font-extrabold text-gray-800 mb-16 leading-tight"
          >
            Fresh Finds: New Arrivals
          </motion.h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard
              title="Jordan "
              price="179.99"
              img="src/assets/jordangreen.jpeg"
              path="wireless-earbuds-pro"
              delay={0}
            />
            <ProductCard
              title="Prada"
              price="89.99"
              img="src/assets/prada.jpeg"
              path="minimalist-wallet"
              delay={0.1}
            />
            <ProductCard
              title="Gucci"
              price="129.99"
              img="src/assets/gucci.webp"
              path="smart-camera"
              delay={0.2}
            />
            <ProductCard
              title="Omega"
              price="499.99"
              img="src/assets/ooooo.png"
              path="espresso-machine"
              delay={0.3}
            />
          </div>
        </section>

        <section id="testimonials" className="py-24 px-6 bg-rose-50">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center text-5xl font-extrabold text-gray-800 mb-16 leading-tight"
          >
            Voices of Luxury: What Our Clients Say
          </motion.h2>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <TestimonialCard
              quote="The **Jordan** collection from Slugma has truly elevated my athletic and casual style. The quality and comfort are unmatched."
              author="Michael J., Professional Athlete"
              delay={0}
            />
            <TestimonialCard
              quote="I'm consistently impressed by the precision and elegance of the **Omega** watches offered. A timepiece for every significant moment."
              author="Astronaut L. Armstrong, Explorer"
              delay={0.15}
            />
            <TestimonialCard
              quote="My **Louis Vuitton** handbag from Slugma is a statement piece. The craftsmanship and iconic design speak volumes about true luxury."
              author="Coco C., Fashion House CEO"
              delay={0.3}
            />

          </div>
        </section>

        <section className="py-24 px-6 bg-gray-800 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Join the Slugma Community</h2>
            <p className="text-lg md:text-xl mb-10">
              Subscribe to our newsletter for exclusive access to new collections, special promotions, and insider style tips.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full sm:w-96 px-6 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
              />
              <button className="w-full sm:w-auto px-8 py-4 bg-rose-700 text-white font-semibold rounded-full hover:bg-rose-800 transition-colors duration-300 shadow-md">
                Subscribe Now
              </button>
            </div>
          </motion.div>
        </section>

        <section
          ref={aboutSectionRef}
          className="relative py-24 px-6 overflow-hidden"
          style={{ minHeight: '650px' }}
        >
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(src/assets/omega.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              y: aboutBgY,
            }}
          >
            <div className="absolute inset-0 bg-black/65"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Our Commitment to Excellence</h2>
            <p className="text-lg md:text-xl leading-relaxed mb-10">
              At Slugma, our journey is driven by a passion for unparalleled quality and distinctive design. We meticulously source each product, ensuring it meets our rigorous standards for craftsmanship, innovation, and ethical production. Our mission is to enrich your life with items that are not only beautiful but also built to last, reflecting a commitment to sustainable luxury. Join us in discovering a world where every detail matters.
            </p>
            <button
              onClick={() => navigate('/about')}
              className="px-10 py-4 bg-rose-700 text-white font-semibold rounded-full hover:bg-rose-800 transition-transform duration-300 transform hover:scale-105 active:scale-95 shadow-md"
            >
              Discover Our Story
            </button>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;