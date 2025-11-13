import React from 'react';
import { motion } from 'framer-motion';
import { Service } from '../../types';
import ServiceCard from './ServiceCard';

interface ServiceListProps {
  services: Service[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </motion.div>
  );
};

export default ServiceList;
