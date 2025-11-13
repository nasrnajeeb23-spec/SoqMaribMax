import React from 'react';

interface SellerStatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const SellerStatCard: React.FC<SellerStatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-md flex items-center space-x-4 space-x-reverse border-r-4 border-[var(--color-primary)]">
      <div className="bg-[var(--color-primary-light)] p-3 rounded-full text-[var(--color-primary)]">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{title}</h3>
        <p className="mt-1 text-2xl font-bold text-[var(--color-text-base)]">{value}</p>
      </div>
    </div>
  );
};

export default SellerStatCard;
