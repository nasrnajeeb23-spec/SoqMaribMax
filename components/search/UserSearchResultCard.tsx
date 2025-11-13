import React from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../../types';
import StarRating from '../common/StarRating';

interface UserSearchResultCardProps {
    user: User;
}

const UserSearchResultCard: React.FC<UserSearchResultCardProps> = ({ user }) => {

    const roleTranslations: { [key in UserRole]?: string } = {
        SELLER: 'بائع',
        DELIVERY: 'مندوب توصيل',
    };
    
    const roleColors: { [key in UserRole]?: string } = {
        SELLER: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300',
        DELIVERY: 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300',
    };

    const linkTo = user.role === 'SELLER' && user.storeId ? `/stores/${user.storeId}` : `/profile`;

    return (
        <Link to={linkTo} className="block bg-[var(--color-surface)] p-4 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent dark:border-[var(--color-border)]">
            <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center font-bold text-[var(--color-primary)] text-2xl flex-shrink-0">
                    {user.name.charAt(0)}
                </div>
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-[var(--color-text-base)]">{user.name}</h3>
                        {user.verificationStatus === 'VERIFIED' && (
                             <span title="حساب موثوق" className="flex items-center text-green-600 dark:text-green-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            </span>
                        )}
                    </div>
                     <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                        {roleTranslations[user.role]}
                     </span>
                     <div className="flex items-center text-sm text-[var(--color-text-muted)] mt-1">
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        <span>{user.city}</span>
                     </div>
                      {user.averageRating !== undefined && user.averageRating > 0 && (
                        <div className="flex items-center mt-1">
                            <StarRating rating={user.averageRating} readOnly size="sm" />
                            <span className="text-xs text-[var(--color-text-muted)] mr-1">({user.averageRating.toFixed(1)})</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default UserSearchResultCard;