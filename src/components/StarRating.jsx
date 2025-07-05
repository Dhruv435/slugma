import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({ rating, onRatingChange, editable = false, size = 24, filledColor = "text-yellow-400", emptyColor = "text-gray-300" }) => {
  const stars = [];
  const maxStars = 5;

  const starVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 10 } },
    hover: { scale: 1.2, color: 'currentColor' },
    tap: { scale: 0.9 }
  };

  for (let i = 1; i <= maxStars; i++) {
    if (editable) {
      stars.push(
        <motion.div
          key={i}
          variants={starVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => onRatingChange(i)}
          className={`cursor-pointer transition-colors duration-150 ${i <= rating ? filledColor : emptyColor}`}
        >
          <Star
            size={size}
            fill={i <= rating ? "currentColor" : "none"}
          />
        </motion.div>
      );
    } else {
      const fullStarsToRender = Math.floor(rating);
      const hasPartialStar = rating % 1 !== 0;

      if (i <= fullStarsToRender) {
        stars.push(
          <motion.div
            key={i}
            variants={starVariants}
            initial="initial"
            animate="animate"
          >
            <Star size={size} fill="currentColor" className={filledColor} />
          </motion.div>
        );
      } else if (i === fullStarsToRender + 1 && hasPartialStar) {
        stars.push(
          <motion.div
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
            variants={starVariants}
            initial="initial"
            animate="animate"
          >
            <Star size={size} fill="currentColor" className={filledColor} />
            <div
              className="absolute top-0 right-0 overflow-hidden"
              style={{
                width: `${(1 - (rating % 1)) * 100}%`,
                height: '100%'
              }}
            >
              <Star size={size} fill="currentColor" className={emptyColor} />
            </div>
          </motion.div>
        );
      } else {
        stars.push(
          <motion.div
            key={i}
            variants={starVariants}
            initial="initial"
            animate="animate"
          >
            <Star size={size} className={emptyColor} />
          </motion.div>
        );
      }
    }
  }

  return <div className="flex items-center">{stars}</div>;
};

export default StarRating;