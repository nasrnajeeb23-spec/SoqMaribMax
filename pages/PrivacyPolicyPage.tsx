
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useContent } from '../hooks/useContent';

const PrivacyPolicyPage: React.FC = () => {
    const { getPageContent } = useContent();
    const content = getPageContent('privacy');

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
            
            <div className="prose prose-lg max-w-none text-justify prose-headings:font-bold prose-headings:text-gray-700 dark:prose-invert">
                <h2>7. اتصل بنا</h2>
                <p>
                    إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى <Link to="/contact" className="text-[var(--color-primary)] hover:underline">التواصل معنا</Link>.
                </p>
            </div>
        </motion.div>
    );
};

export default PrivacyPolicyPage;