import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAds } from '../../hooks/useAds';
import { Advertisement } from '../../types';
import { Link } from 'react-router-dom';

const AdCarousel: React.FC = () => {
  const { activeAds } = useAds();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeAds.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeAds.length);
    }, 5000); // Change ad every 5 seconds

    return () => clearInterval(interval);
  }, [activeAds.length]);

  if (activeAds.length === 0) {
    return null; // Don't render anything if there are no active ads
  }

  const currentAd = activeAds[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? activeAds.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex((currentIndex + 1) % activeAds.length);
  };
  
  const slideVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="relative w-full h-64 md:h-80 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          variants={slideVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <Link to={currentAd.link} target="_blank" rel="noopener noreferrer">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 right-0 p-4 md:p-6 text-white">
              <h3 className="text-xl md:text-2xl font-bold">{currentAd.title}</h3>
              {currentAd.type === 'user' && (
                <p className="text-sm md:text-base">إعلان بواسطة: {currentAd.advertiserName}</p>
              )}
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Buttons */}
       <button onClick={goToPrevious} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button onClick={goToNext} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {activeAds.map((_, index) => (
            <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/50'}`}></button>
        ))}
      </div>
    </div>
  );
};

export default AdCarousel;
