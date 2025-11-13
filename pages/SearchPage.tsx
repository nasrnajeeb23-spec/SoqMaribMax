import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../hooks/useAuth';
import ProductList from '../components/product/ProductList';
import ServiceList from '../components/service/ServiceList';
import UserSearchResultCard from '../components/search/UserSearchResultCard';
import Spinner from '../components/common/Spinner';

type SearchTab = 'products' | 'services' | 'users';

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [activeTab, setActiveTab] = useState<SearchTab>('products');

    const { products, loading: productsLoading } = useProducts();
    const { services } = useServices();
    const { users } = useAuth();

    const searchResults = useMemo(() => {
        if (!query) {
            return { products: [], services: [], users: [] };
        }

        const lowerCaseQuery = query.toLowerCase();

        const filteredProducts = products.filter(p => {
            const seller = users.find(u => u.id === p.sellerId);
            return p.name.toLowerCase().includes(lowerCaseQuery) ||
                p.description.toLowerCase().includes(lowerCaseQuery) ||
                p.category.name.toLowerCase().includes(lowerCaseQuery) ||
                (seller && seller.name.toLowerCase().includes(lowerCaseQuery));
        });

        const filteredServices = services.filter(s =>
            s.title.toLowerCase().includes(lowerCaseQuery) ||
            s.description.toLowerCase().includes(lowerCaseQuery) ||
            s.category.name.toLowerCase().includes(lowerCaseQuery) ||
            s.provider.name.toLowerCase().includes(lowerCaseQuery)
        );

        const filteredUsers = users.filter(u =>
            (u.role === 'SELLER' || u.role === 'DELIVERY') &&
            u.name.toLowerCase().includes(lowerCaseQuery)
        );

        return { products: filteredProducts, services: filteredServices, users: filteredUsers };
    }, [query, products, services, users]);

    useEffect(() => {
        if (query) {
            if (searchResults.products.length > 0) {
                setActiveTab('products');
            } else if (searchResults.services.length > 0) {
                setActiveTab('services');
            } else if (searchResults.users.length > 0) {
                setActiveTab('users');
            } else {
                setActiveTab('products');
            }
        }
    }, [query, searchResults]);

    const noResults = !productsLoading && searchResults.products.length === 0 && searchResults.services.length === 0 && searchResults.users.length === 0;

    const renderContent = () => {
        if (productsLoading) {
            return (
                <div className="flex justify-center items-center py-16">
                    <Spinner size="lg" />
                    <span className="mr-4 text-lg text-[var(--color-text-muted)]">جاري البحث...</span>
                </div>
            );
        }
        if (noResults) {
            return (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-[var(--color-text-base)]">لا توجد نتائج بحث تطابق "{query}"</h3>
                    <p className="text-[var(--color-text-muted)] mt-2">حاول استخدام كلمات بحث مختلفة أو أكثر عمومية.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'products':
                return searchResults.products.length > 0 ? <ProductList products={searchResults.products} /> : <p className="text-center py-8 text-[var(--color-text-muted)]">لا توجد سلع تطابق بحثك.</p>;
            case 'services':
                return searchResults.services.length > 0 ? <ServiceList services={searchResults.services} /> : <p className="text-center py-8 text-[var(--color-text-muted)]">لا توجد خدمات تطابق بحثك.</p>;
            case 'users':
                return searchResults.users.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.users.map(user => <UserSearchResultCard key={user.id} user={user} />)}
                    </div>
                ) : <p className="text-center py-8 text-[var(--color-text-muted)]">لا يوجد بائعون أو مقدمو خدمات يطابقون بحثك.</p>;
            default:
                return null;
        }
    };
    
    return (
         <div className="space-y-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-base)]">
                نتائج البحث عن: <span className="text-[var(--color-primary)]">"{query}"</span>
            </h1>

            <div className="bg-[var(--color-surface)] p-4 sm:p-6 rounded-xl shadow-md border border-transparent dark:border-[var(--color-border)]">
                <div className="border-b border-[var(--color-border)]">
                    <nav className="-mb-px flex space-x-6 space-x-reverse overflow-x-auto" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`${activeTab === 'products' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            السلع ({searchResults.products.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`${activeTab === 'services' ? 'border-teal-500 text-teal-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            الخدمات ({searchResults.services.length})
                        </button>
                         <button
                            onClick={() => setActiveTab('users')}
                            className={`${activeTab === 'users' ? 'border-purple-500 text-purple-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            البائعون ومقدمو الخدمات ({searchResults.users.length})
                        </button>
                    </nav>
                </div>

                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                >
                    {renderContent()}
                </motion.div>
            </div>
         </div>
    );
};

export default SearchPage;