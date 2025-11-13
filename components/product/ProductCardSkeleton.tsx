import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
      <div className="w-full h-56 bg-slate-200"></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="flex-grow"></div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="h-10 bg-slate-200 rounded-md"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
