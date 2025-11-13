import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductList from '../components/product/ProductList';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import ProductCard from '../components/product/ProductCard';
import AdCarousel from '../components/common/AdCarousel';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { useSearch } from '../hooks/useSearch';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { Product } from '../types';
import { GoogleGenAI } from '@google/genai';
import { calculateDistance } from '../utils/geolocation';
import Spinner from '../components/common/Spinner';

const HomePage: React.FC = () => {
  const { products, loading, error, refetchProducts } = useProducts();
  const { productCategories: categories } = useCategories();
  const { user } = useAuth();
  const { savedSearches, saveSearch } = useSearch();
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('latest');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used'>('all');
  
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('cat');
    const cond = searchParams.get('cond');

    if (cat) setSelectedCategory(cat);
    if (cond && ['all', 'new', 'used'].includes(cond)) {
        setConditionFilter(cond as 'all' | 'new' | 'used');
    } else {
        setConditionFilter('all');
    }
  }, [searchParams]);

  const { filteredAndSortedProducts, featuredProducts } = useMemo(() => {
    const now = new Date();
    const activeProducts = products.filter(p => p.listingEndDate && new Date(p.listingEndDate) > now);
    const featured = activeProducts.filter(product => product.isFeatured && product.featuredEndDate && new Date(product.featuredEndDate) > now);
    
    let filtered = activeProducts.filter(product => {
      const matchesCategory = selectedCategory ? product.category.id === selectedCategory : true;
      const matchesCondition = conditionFilter === 'all' ? true :
        conditionFilter === 'new' ? product.isNew === true : product.isNew === false;
      
      return matchesCategory && matchesCondition;
    });

    if (sortOption === 'distance-asc' && userLocation) {
        filtered.sort((a, b) => {
            if (!a.location) return 1;
            if (!b.location) return -1;

            const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
            return distA - distB;
        });
    } else {
        switch (sortOption) {
          case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'latest':
          default:
            // Already sorted by latest by default from context
            break;
        }
    }

    return { filteredAndSortedProducts: filtered, featuredProducts: featured };
  }, [products, selectedCategory, sortOption, conditionFilter, userLocation]);
  
  // Generate Recommendations Effect
  useEffect(() => {
    const generateRecommendations = async () => {
        if (!user || user.role !== 'BUYER' || products.length === 0 || loading) {
            return;
        }

        setIsGeneratingRecs(true);
        setRecommendations([]);

        try {
            const wishlistProducts = products.filter(p => wishlistItems.includes(p.id));
            const cartProducts = products.filter(p => cartItems.some(ci => ci.productId === p.id));

            const interestSummary = [
                wishlistProducts.length > 0 ? `منتجات في المفضلة: ${wishlistProducts.map(p => p.name).join(', ')}` : '',
                cartProducts.length > 0 ? `منتجات في السلة: ${cartProducts.map(p => p.name).join(', ')}` : '',
                savedSearches.length > 0 ? `عمليات بحث محفوظة: ${savedSearches.map(s => s.searchTerm).filter(Boolean).join(', ')}` : ''
            ].filter(Boolean).join('. ');

            if (!interestSummary) {
                setIsGeneratingRecs(false);
                return;
            }

            const productIdsInCartAndWishlist = new Set([...wishlistItems, ...cartItems.map(ci => ci.productId)]);
            const availableProductsForRecs = products.filter(p => !productIdsInCartAndWishlist.has(p.id));
            
            const productCatalog = availableProductsForRecs.map(p => 
                `id: "${p.id}", name: "${p.name}", category: "${p.category.name}", description: "${p.description.substring(0, 100)}"`
            ).join('\n');

            const prompt = `
أنت محرك توصيات خبير في سوق يمني إلكتروني اسمه "سوق مارب". مهمتك هي اقتراح منتجات وثيقة الصلة بالمستخدم بناءً على اهتماماته.

ملخص اهتمامات المستخدم الحالية:
${interestSummary}

قائمة المنتجات المتاحة في السوق (لا تقم بترشيح منتجات موجودة بالفعل في سلة المستخدم أو قائمته المفضلة):
${productCatalog}

بناءً على اهتمامات المستخدم والمنتجات المتاحة، قم بترشيح ما يصل إلى 5 معرفات منتجات (product IDs) من المرجح أن يهتم بها المستخدم.
يجب أن يكون الرد عبارة عن مصفوفة JSON من السلاسل النصية فقط، حيث تمثل كل سلسلة نصية معرف منتج. مثال: ["p3", "p6", "p21"]
إذا لم تجد توصيات مناسبة، أعد مصفوفة فارغة [].
`;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const textResponse = response.text.trim();
            
            let recommendedIds: string[] = [];
            try {
                const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                recommendedIds = JSON.parse(jsonString);
            } catch (e) {
                console.error("Failed to parse Gemini response as JSON:", textResponse, e);
            }

            if (Array.isArray(recommendedIds) && recommendedIds.length > 0) {
                const recommendedProducts = recommendedIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
                setRecommendations(recommendedProducts);
            }

        } catch (err) {
            console.error("Error generating recommendations:", err);
        } finally {
            setIsGeneratingRecs(false);
        }
    };

    generateRecommendations();
  }, [user, products, wishlistItems, cartItems, savedSearches, loading]);


  const handleSaveSearch = () => {
      const searchTerm = searchParams.get('q') || '';
      if(user && user.role === 'BUYER'){
        saveSearch(searchTerm, selectedCategory, conditionFilter);
      } else {
        showToast("يجب تسجيل الدخول كمشتري لحفظ البحث.", "info");
      }
  };

  const handleSortByDistance = () => {
    setLocationLoading(true);
    setLocationError(null);
    setUserLocation(null);

    if (!navigator.geolocation) {
        setLocationError('الموقع الجغرافي غير مدعوم في هذا المتصفح.');
        showToast('الموقع الجغرافي غير مدعوم في هذا المتصفح.', 'error');
        setLocationLoading(false);
        setSortOption('latest');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
            setLocationLoading(false);
            showToast('تم تحديد موقعك وترتيب المنتجات حسب القرب.', 'success');
        },
        (error) => {
            let message = 'حدث خطأ أثناء تحديد موقعك.';
            if (error.code === error.PERMISSION_DENIED) {
                message = 'يرجى السماح بالوصول إلى موقعك لترتيب المنتجات حسب القرب.';
            }
            setLocationError(message);
            showToast(message, 'error');
            setLocationLoading(false);
            setSortOption('latest');
        }
    );
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSortOption = e.target.value;
      setSortOption(newSortOption);
      if (newSortOption === 'distance-asc') {
          handleSortByDistance();
      } else {
          setUserLocation(null);
          setLocationError(null);
      }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const renderProductContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      );
    }
    
    if (locationLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <Spinner size="lg" />
                <span className="mr-4 text-lg text-[var(--color-text-muted)]">جاري تحديد موقعك...</span>
            </div>
        );
    }

    if (error) {
      return (
        <div className="text-center py-10 px-4 bg-red-500/10 border-2 border-dashed border-red-500/30 rounded-lg">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={refetchProducts}
            className="bg-red-500 text-white font-bold py-2 px-6 rounded-md hover:bg-red-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    if (filteredAndSortedProducts.length > 0) {
      return <ProductList products={filteredAndSortedProducts} />;
    }

    return <p className="text-center text-[var(--color-text-muted)] text-lg py-16">لا توجد منتجات تطابق بحثك.</p>;
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
        className="text-center bg-gradient-to-br from-[var(--color-primary)] to-sky-800 text-white py-20 px-6 rounded-xl shadow-lg"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">أكبر سوق مفتوح في اليمن</h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-sky-100">
          اعرض سلعك للبيع، أو ابحث عن كل ما تحتاجه في مكان واحد. جديد ومستعمل، كل شيء متوفر!
        </p>
      </motion.section>

      <motion.section variants={itemVariants}>
        <AdCarousel />
      </motion.section>
      
      {!loading && featuredProducts.length > 0 && (
        <motion.section variants={itemVariants}>
            <h2 className="text-3xl font-bold text-center mb-6">السلع المميزة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {featuredProducts.slice(0, 4).map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </motion.section>
      )}

      {user && user.role === 'BUYER' && (isGeneratingRecs || recommendations.length > 0) && (
        <motion.section variants={itemVariants}>
            <h2 className="text-3xl font-bold text-center mb-6">نوصي به لك</h2>
            {isGeneratingRecs ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                       <ProductCardSkeleton key={index} />
                   ))}
               </div>
            ) : recommendations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {recommendations.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </motion.section>
      )}

      <motion.section variants={itemVariants} className="bg-[var(--color-surface)] p-4 sm:p-6 rounded-xl shadow-md border border-transparent dark:border-[var(--color-border)]">
         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold text-center md:text-right">كل السلع</h2>
            <div className="flex items-center gap-2 justify-center md:justify-end flex-wrap">
              <span className="font-medium text-[var(--color-text-base)]">الحالة:</span>
              <button onClick={() => setConditionFilter('all')} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${conditionFilter === 'all' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'}`}>الكل</button>
              <button onClick={() => setConditionFilter('new')} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${conditionFilter === 'new' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'}`}>جديد</button>
              <button onClick={() => setConditionFilter('used')} className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${conditionFilter === 'used' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'}`}>مستعمل</button>
            </div>
         </div>
         <motion.div variants={itemVariants} className="bg-sky-50 dark:bg-sky-900/20 p-3 rounded-lg text-center border border-sky-200 dark:border-sky-800 mb-6">
            <p className="text-sm text-sky-800 dark:text-sky-200">
                💡 نصيحة: شارك موقعك لترتيب المنتجات والخدمات حسب الأقرب إليك! استخدم فلتر "الأقرب مني".
            </p>
        </motion.div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-t border-[var(--color-border)] pt-6">
            <div className="w-full sm:w-auto overflow-hidden">
                <div className="flex overflow-x-auto space-x-2 space-x-reverse pb-2 -mx-4 sm:mx-0 px-4 sm:px-0 sm:flex-wrap sm:gap-2 sm:space-x-0">
                    <button 
                        onClick={() => setSelectedCategory(null)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'}`}>
                        كل التصنيفات
                    </button>
                    {categories.map(category => (
                    <button 
                        key={category.id} 
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'}`}>
                        {category.name}
                    </button>
                    ))}
                </div>
            </div>
             <div className="flex items-center gap-2 justify-center md:justify-end flex-shrink-0">
              <label htmlFor="sort-by" className="font-medium text-[var(--color-text-base)]">الترتيب حسب:</label>
              <select 
                id="sort-by"
                value={sortOption}
                onChange={handleSortChange}
                className="bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-base)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] p-2"
              >
                <option value="latest">الأحدث</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="distance-asc">الأقرب مني</option>
              </select>
            </div>
          </div>
          {user && user.role === 'BUYER' && (searchParams.get('q') || selectedCategory) && (
             <div className="mb-6 text-center border-t border-[var(--color-border)] pt-4">
                <button onClick={handleSaveSearch} className="bg-green-500/10 text-green-700 dark:text-green-300 font-bold py-2 px-5 rounded-md hover:bg-green-500/20 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    حفظ هذا البحث
                </button>
             </div>
           )}
        
        {renderProductContent()}
      </motion.section>
    </motion.div>
  );
};

export default HomePage;