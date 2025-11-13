import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Service, ServicePricingModel } from '../../types';
import StarRating from '../common/StarRating';

interface ServiceCardProps {
  service: Service;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const pricingModelTranslations: Record<ServicePricingModel, string> = {
      FIXED: 'مقطوع',
      HOURLY: 'بالساعة',
      PER_PROJECT: 'للمشروع'
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out group flex flex-col"
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.03, shadow: 'xl' }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Link to={`/services/${service.id}`} className="block">
        <div className="relative">
          <img className="w-full h-56 object-cover" src={service.imageUrl} alt={service.title} />
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            <span className="px-2 py-1 text-xs font-bold text-white rounded-md bg-teal-600">
              خدمة
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4 flex flex-col h-full flex-grow">
        <p className="text-sm text-gray-500">{service.category.name}</p>
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300 mt-1">
          <Link to={`/services/${service.id}`} className="block truncate">{service.title}</Link>
        </h3>
        <div className="flex items-center mt-2">
            <StarRating rating={service.averageRating} readOnly size="sm" />
            <span className="text-xs text-gray-500 mr-2">({service.averageRating.toFixed(1)})</span>
        </div>
        <div className="flex-grow"></div>
        <div className="mt-4 pt-4 border-t">
             <div className="flex items-center justify-between">
                <div>
                   <span className="text-xs text-gray-500 block">تبدأ من</span>
                   <p className="text-xl font-extrabold text-teal-600">{formatPrice(service.price)}</p>
                </div>
                 <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{pricingModelTranslations[service.pricingModel]}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-2">
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                <span>{service.city}</span>
            </div>
        </div>
      </div>
       <div className="p-4 pt-0">
          <Link 
            to={`/services/${service.id}`} 
            className="w-full text-center block bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors duration-300"
          >
            عرض التفاصيل والحجز
          </Link>
      </div>
    </motion.div>
  );
};

export default ServiceCard;