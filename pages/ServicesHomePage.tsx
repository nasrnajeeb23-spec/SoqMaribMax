import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ServiceList from '../components/service/ServiceList';
import { useServices } from '../hooks/useServices';
import { useCategories } from '../hooks/useCategories';
import ServiceCard from '../components/service/ServiceCard';

const ServicesHomePage: React.FC = () => {
  const { services } = useServices(); // Assuming loading/error is handled within context or not needed for this mock
  const { serviceCategories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { filteredServices, featuredServices } = useMemo(() => {
    const now = new Date();
    const activeServices = services; // Assuming services don't expire like products
    
    const featured = activeServices.filter(s => s.isFeatured && s.featuredEndDate && new Date(s.featuredEndDate) > now);

    let filtered = activeServices.filter(service => {
      const matchesCategory = selectedCategory ? service.category.id === selectedCategory : true;
      const matchesSearch = searchTerm.trim() === '' ? true :
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    
    return { filteredServices: filtered, featuredServices: featured };
  }, [services, searchTerm, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={itemVariants}
        className="text-center bg-teal-600 text-white py-12 px-6 rounded-lg shadow-lg"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">سوق الخدمات الاحترافية</h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-teal-100">
          ابحث عن أفضل مقدمي الخدمات المحليين لتلبية احتياجاتك. من التصميم إلى الصيانة، كل شيء هنا.
        </p>
      </motion.section>

      {featuredServices.length > 0 && (
        <motion.section variants={itemVariants}>
            <h2 className="text-3xl font-bold text-center mb-6">الخدمات المميزة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {featuredServices.slice(0, 4).map(service => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        </motion.section>
      )}

      <motion.section variants={itemVariants} className="bg-white p-6 rounded-lg shadow-md">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="ابحث عن خدمة، مقدم خدمة، أو مدينة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pr-12 text-lg border-2 border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <div className="absolute left-0 top-0 mt-2 ml-3 h-12 w-12 flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6 border-t pt-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              كل الخدمات
            </button>
            {serviceCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants}>
        <h2 className="text-3xl font-bold text-center mb-8">كل الخدمات</h2>
        {filteredServices.length > 0 ? (
          <ServiceList services={filteredServices} />
        ) : (
          <p className="text-center text-gray-500 text-lg">لا توجد خدمات تطابق بحثك.</p>
        )}
      </motion.section>
    </motion.div>
  );
};

export default ServicesHomePage;