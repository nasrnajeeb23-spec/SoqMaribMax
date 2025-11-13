import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { useReviews } from '../hooks/useReviews';
import { useRating } from '../hooks/useRating';
import { useOffers } from '../hooks/useOffers';
import { useChat } from '../hooks/useChat';
import StarRating from '../components/common/StarRating';
import { useAuthPrompt } from '../hooks/useAuthPrompt';
import { useStoreStore } from '../store/storeStore';

// Auction Timer Component
const AuctionTimer: React.FC<{ endTime: string }> = ({ endTime }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endTime) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        if(typeof value !== 'number' || value < 0) return null;
        const translations: Record<string, string> = { days: 'أيام', hours: 'ساعات', minutes: 'دقائق', seconds: 'ثواني' };
        const unit = translations[interval];
        return (
            <div key={interval} className="flex flex-col items-center">
                <span className="text-2xl font-bold">{value.toString().padStart(2, '0')}</span>
                <span className="text-xs uppercase">{unit}</span>
            </div>
        );
    });
    
    const hasEnded = +new Date(endTime) < +new Date();

    return (
        <div className="bg-gray-100 dark:bg-slate-700/50 p-4 rounded-lg text-center">
            <h3 className="font-bold mb-2">{hasEnded ? 'المزاد انتهى' : 'الوقت المتبقي'}</h3>
            {hasEnded ? (
                 <p className="text-2xl font-bold text-red-600">انتهى</p>
            ) : (
                <div className="flex justify-center space-x-4 space-x-reverse text-[var(--color-text-base)]">
                    {timerComponents}
                </div>
            )}
        </div>
    );
};


const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { products, placeBid } = useProducts();
  const { user, users } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { getReviewsForProduct, addReview } = useReviews();
  const { getRatingsForUser } = useRating();
  const { createOffer } = useOffers();
  const { sendMessage, getConversationWithUser } = useChat();
  const { getStoreById } = useStoreStore();
  const prompt = useAuthPrompt();

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  
  const product = products.find(p => p.id === productId);
  const reviews = useMemo(() => product ? getReviewsForProduct(product.id) : [], [product, getReviewsForProduct]);
  
  const seller = useMemo(() => product ? users.find(u => u.id === product.sellerId) : undefined, [product, users]);
  const store = useMemo(() => product ? getStoreById(product.storeId) : undefined, [product, getStoreById]);

  const sellerRatings = useMemo(() => seller ? getRatingsForUser(seller.id) : [], [seller, getRatingsForUser]);
  const sellerAverageRating = useMemo(() => {
      if (!sellerRatings || sellerRatings.length === 0) return 0;
      const total = sellerRatings.reduce((acc, r) => acc + r.rating, 0);
      return total / sellerRatings.length;
  }, [sellerRatings]);


  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);
  
  const isAuction = product?.listingType === 'AUCTION';
  const auctionEnded = isAuction && new Date(product.auctionDetails!.endTime) < new Date();
  const highestBidder = isAuction ? users.find(u => u.id === product.auctionDetails!.highestBidderId) : null;


  if (!product || !seller || !store) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">عذراً، المنتج غير موجود!</h2>
        <Link to="/" className="text-[var(--color-primary)] hover:underline mt-4 inline-block">العودة للصفحة الرئيسية</Link>
      </div>
    );
  }
  
  const handleAddToCartAction = () => {
    if (product.stock > 0) {
      addToCart(product.id);
      showToast(`تمت إضافة "${product.name}" إلى السلة!`, 'success');
    }
  };
  
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating > 0 && newComment.trim() !== "") {
      addReview(product.id, newRating, newComment, showToast);
      showToast('شكراً لك، تم إرسال مراجعتك!', 'success');
      setNewRating(0);
      setNewComment('');
    } else {
      showToast('يرجى تحديد تقييم وكتابة تعليق.', 'error');
    }
  };

  const handlePlaceBidAction = () => {
    const amount = parseFloat(bidAmount);
    if (!isNaN(amount) && amount > 0) {
      placeBid(product.id, amount, showToast);
      setBidAmount('');
    } else {
        showToast('يرجى إدخال مبلغ صحيح للمزايدة.', 'error');
    }
  };

  const handleOfferSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerAmount);
    if (!isNaN(amount) && amount > 0 && amount < product.price) {
        createOffer(product.id, product.sellerId, amount, showToast);
        setShowOfferModal(false);
        setOfferAmount('');
    } else {
        showToast('يرجى إدخال مبلغ صحيح وأقل من السعر الأصلي.', 'error');
    }
  };
  
  const handleMessageSellerAction = () => {
    const existingConversation = getConversationWithUser(product.sellerId);
    if (!existingConversation) {
        const productLink = `/products/${product.id}`;
        const messageText = `استفسار بخصوص منتج: ${product.name}\n${window.location.origin}${window.location.pathname}#${productLink}`;
        sendMessage(product.sellerId, messageText);
    }
    navigate(`/chat/${product.sellerId}`);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);
  const canInteract = user?.id !== product.sellerId;
  
  const renderInteractionBlock = () => {
    if (isAuction) {
        if (auctionEnded) {
            return (
                 <div className="bg-green-500/10 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4" role="alert">
                    <p className="font-bold">المزاد انتهى!</p>
                    {highestBidder ? (
                        <p>{highestBidder.id === user?.id ? `لقد فزت بالمزاد بسعر ${formatPrice(product.auctionDetails!.currentBid)}` : `فاز ${highestBidder.name} بالمزاد.`}</p>
                    ) : (
                        <p>لم يتم وضع أي مزايدات.</p>
                    )}
                </div>
            )
        }
        if (canInteract) {
            return (
                <form onSubmit={(e) => { e.preventDefault(); prompt(handlePlaceBidAction, 'سجل دخولك أو أنشئ حساباً جديداً للمزايدة.')() }} className="space-y-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <span className="text-[var(--color-text-muted)]">ريال</span>
                        </div>
                        <input 
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={`مزايدتك (أعلى من ${formatPrice(product.auctionDetails!.currentBid)})`}
                            className="w-full block text-center bg-[var(--color-background)] border-2 border-[var(--color-border)] font-bold py-3 px-6 pl-16 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-lg"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full block text-center bg-[var(--color-primary)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors duration-300 text-lg">
                        زايد الآن
                    </button>
                </form>
            );
        }
    } else { // Fixed Price
         if (canInteract) {
             return (
                <div className="flex gap-3">
                    <button onClick={prompt(handleAddToCartAction, 'سجل دخولك لإضافة المنتجات إلى السلة.')} disabled={product.stock === 0} className="flex-1 block text-center bg-[var(--color-primary)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors duration-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {product.stock > 0 ? 'أضف إلى السلة' : 'نفدت الكمية'}
                    </button>
                    <button onClick={prompt(() => setShowOfferModal(true), 'سجل دخولك لتقديم عروض على المنتجات.')} disabled={product.stock === 0} className="flex-1 block text-center bg-gray-700 dark:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-500 transition-colors duration-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                        قدّم عرضاً
                    </button>
                </div>
             )
         }
    }
    return (
        <p className="text-center text-sm text-[var(--color-text-muted)] pt-4">{user && user.id === product.sellerId && 'لا يمكنك التفاعل مع منتجك.'}</p>
    )
  }

  return (
    <div className="space-y-12">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 md:p-8 border border-transparent dark:border-[var(--color-border)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div><img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-md" /></div>
          <div className="flex flex-col">
            <span className={`px-3 py-1 text-sm font-bold text-white rounded-full self-start ${product.isNew ? 'bg-green-500' : 'bg-blue-500'}`}>{product.isNew ? 'جديد' : 'مستعمل'}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold mt-4">{product.name}</h1>
            <div className="flex items-center mt-2 space-x-2 space-x-reverse">
              <StarRating rating={averageRating} readOnly={true} />
              <span className="text-[var(--color-text-muted)]">({reviews.length} مراجعات للمنتج)</span>
            </div>
            
            {isAuction ? (
                 <div className="my-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <p className="text-sm text-[var(--color-text-muted)]">السعر المبدئي</p>
                            <p className="text-xl font-bold">{formatPrice(product.auctionDetails!.startingPrice)}</p>
                        </div>
                        <div className="text-center p-3 bg-[var(--color-primary-light)] rounded-lg border border-[var(--color-primary)]/20">
                             <p className="text-sm text-[var(--color-primary)]">السعر الحالي</p>
                            <p className="text-xl font-bold text-[var(--color-primary)]">{formatPrice(product.auctionDetails!.currentBid)}</p>
                        </div>
                    </div>
                     <AuctionTimer endTime={product.auctionDetails!.endTime} />
                     <p className="text-sm text-center text-[var(--color-text-muted)]">أعلى مزايدة حالياً من: <span className="font-bold text-[var(--color-text-base)]">{highestBidder?.name || 'لا يوجد'}</span></p>
                </div>
            ) : (
                <p className="text-4xl font-bold text-[var(--color-primary)] my-6">{formatPrice(product.price)}</p>
            )}
            
            <div className="mt-auto pt-6 space-y-3">
               {renderInteractionBlock()}
               {canInteract && (
                <button onClick={prompt(handleMessageSellerAction, 'تواصل مباشرة مع البائعين عند تسجيل دخولك.')} className="w-full block text-center bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)] font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-light)] transition-colors duration-300 text-lg">
                  مراسلة البائع
                </button>
               )}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <h2 className="text-xl font-bold mb-2">الوصف</h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed">{product.description}</p>
            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
              <h3 className="text-xl font-bold mb-4">معلومات المتجر</h3>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 dark:bg-slate-600 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/stores/${store.id}`} className="font-bold hover:text-[var(--color-primary)] hover:underline">{store.name}</Link>
                    {seller.verificationStatus === 'VERIFIED' && (
                      <span title="هوية هذا البائع تم توثيقها من قبل إدارة المنصة" className="flex items-center bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full cursor-help">
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 10a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        موثوق
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">بإدارة: {seller.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <StarRating rating={sellerAverageRating} readOnly size="sm" />
                     <span className="text-xs text-[var(--color-text-muted)]">({sellerRatings.length} تقييمات)</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
      
       {isAuction && (
         <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 md:p-8 border border-transparent dark:border-[var(--color-border)]">
            <h2 className="text-2xl font-bold mb-6">سجل المزايدات ({product.auctionDetails?.bids.length})</h2>
             <div className="space-y-4 max-h-60 overflow-y-auto">
              {product.auctionDetails && product.auctionDetails.bids.length > 0 ? (
                [...product.auctionDetails.bids].reverse().map((bid, index) => {
                  const bidder = users.find(u => u.id === bid.userId);
                  return (
                  <div key={index} className="flex justify-between items-center p-3 bg-[var(--color-background)] rounded-md">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full mr-3 flex items-center justify-center text-sm font-bold text-white">{bidder?.name.charAt(0)}</div>
                        <div>
                            <p className="font-semibold">{bidder?.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{new Date(bid.date).toLocaleString('ar-EG')}</p>
                        </div>
                    </div>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatPrice(bid.amount)}</p>
                  </div>
                  )
                })
              ) : (
                <p className="text-center text-[var(--color-text-muted)]">كن أول من يزايد على هذا المنتج!</p>
              )}
            </div>
        </div>
       )}
      
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 md:p-8 border border-transparent dark:border-[var(--color-border)]">
        <h2 className="text-2xl font-bold mb-6">تقييمات المنتج</h2>
        {user?.role === 'BUYER' && user.id !== product.sellerId && (
          <div className="mb-8 border-b border-[var(--color-border)] pb-8">
            <h3 className="text-xl font-semibold mb-4">أضف مراجعتك للمنتج</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">تقييمك للمنتج</label>
                <StarRating rating={newRating} onRatingChange={setNewRating} size="lg" />
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-[var(--color-text-muted)]">تعليقك على المنتج</label>
                <textarea id="comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={4} required className="mt-1 block w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"></textarea>
              </div>
              <button type="submit" className="bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">إرسال المراجعة</button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="flex items-start space-x-4 space-x-reverse border-b border-[var(--color-border)] pb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center font-bold">{review.userName.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">{review.userName}</h4>
                    <span className="text-xs text-[var(--color-text-muted)]">{new Date(review.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <StarRating rating={review.rating} readOnly={true} size="sm" />
                  <p className="text-[var(--color-text-muted)] mt-2">{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-[var(--color-text-muted)]">لا توجد مراجعات لهذا المنتج حتى الآن.</p>
          )}
        </div>
      </div>

       {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 w-full max-w-md">
                 <h2 className="text-xl font-bold mb-4">تقديم عرض سعر</h2>
                 <form onSubmit={handleOfferSubmitAction} className="space-y-4">
                    <p className="text-sm text-[var(--color-text-muted)]">السعر الحالي للمنتج: <span className="font-bold text-[var(--color-text-base)]">{formatPrice(product.price)}</span></p>
                    <div>
                        <label htmlFor="offerAmount" className="block text-sm font-medium text-[var(--color-text-muted)]">مبلغ عرضك</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">ريال</span>
                            </div>
                            <input type="number" id="offerAmount" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} required min="1" max={product.price - 1} className="block w-full pl-12 pr-3 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setShowOfferModal(false)} className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                        <button type="submit" className="bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">إرسال العرض</button>
                    </div>
                 </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;