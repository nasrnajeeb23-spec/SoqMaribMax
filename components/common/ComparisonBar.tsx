

import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useComparison } from '../../hooks/useComparison';
import { useProducts } from '../../hooks/useProducts';

const ComparisonBar: React.FC = () => {
  const { comparisonItems, toggleComparison, clearComparison } = useComparison();
  const { products } = useProducts();

  const itemsToCompare = products.filter(p => comparisonItems.includes(p.id));
  const showBar = itemsToCompare.length > 0;

  return (
    <AnimatePresence>
      {showBar && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-4 shadow-2xl z-40"
        >
          <div className="container mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-grow overflow-x-auto">
              <span className="font-bold text-lg hidden sm:block">للمقارنة:</span>
              {itemsToCompare.map(item => (
                <div key={item.id} className="relative flex-shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-500" />
                  <button
                    onClick={() => toggleComparison(item.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600"
                    aria-label={`إزالة ${item.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <button 
                  onClick={clearComparison}
                  className="text-sm text-slate-400 hover:text-white hover:underline"
                >
                    مسح الكل
                </button>
                <Link
                  to="/compare"
                  className={`px-6 py-2 rounded-md font-bold transition-colors ${
                    itemsToCompare.length < 2
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                  }`}
                  onClick={(e) => itemsToCompare.length < 2 && e.preventDefault()}
                  aria-disabled={itemsToCompare.length < 2}
                >
                  قارن الآن ({itemsToCompare.length})
                </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComparisonBar;