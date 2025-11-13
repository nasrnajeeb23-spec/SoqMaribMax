
import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../hooks/useContent';

const AboutUsPage: React.FC = () => {
    const { getPageContent } = useContent();
    const content = getPageContent('about');

    if (!content) {
        return <div>جار تحميل المحتوى...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--color-surface)] p-8 rounded-lg shadow-lg max-w-4xl mx-auto"
        >
            <h1 className="text-4xl font-bold text-[var(--color-text-base)] text-center mb-6">{content.title}</h1>
            
            <div dangerouslySetInnerHTML={{ __html: content.body }} />
        </motion.div>
    );
};

export default AboutUsPage;