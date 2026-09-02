import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showNumber = true,
  reviewCount,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold'
  };

  const stars = [];
  const normalizedRating = Math.max(0, Math.min(maxStars, rating));

  for (let i = 1; i <= maxStars; i++) {
    if (normalizedRating >= i) {
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} fill-amber-400 text-amber-400`}
        />
      );
    } else if (normalizedRating >= i - 0.5) {
      stars.push(
        <StarHalf
          key={i}
          className={`${sizeClasses[size]} fill-amber-400 text-amber-400`}
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} text-slate-200 fill-slate-100`}
        />
      );
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">{stars}</div>
      {showNumber && (
        <span className={`text-slate-900 ${textSizes[size]}`}>
          {normalizedRating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500 font-normal">
          ({reviewCount.toLocaleString()} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
