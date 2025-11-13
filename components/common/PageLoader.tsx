import React from 'react';
import Spinner from './Spinner';

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[calc(100vh-20rem)] w-full">
    <div className="text-center">
      <Spinner size="lg" className="text-[var(--color-primary)] mx-auto" />
      <p className="mt-4 text-lg text-[var(--color-text-muted)]">جاري تحميل الصفحة...</p>
    </div>
  </div>
);

export default PageLoader;
