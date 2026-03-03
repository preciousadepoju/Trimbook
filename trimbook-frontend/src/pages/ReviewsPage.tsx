import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquare, TrendingUp, RefreshCw, Award } from 'lucide-react';
import API_BASE_URL from '../config/api';

interface Review {
  _id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ReviewStats {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
  breakdown: Record<number, number>;
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${cls} ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch(`${API_BASE_URL}/api/reviews/my-reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const { reviews = [], avgRating = 0, totalReviews = 0, breakdown = {} } = stats || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Avg Rating Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-6 text-white col-span-1 flex flex-col items-center justify-center shadow-lg shadow-yellow-200"
        >
          <p className="text-5xl font-black">{avgRating > 0 ? avgRating.toFixed(1) : '–'}</p>
          <StarDisplay rating={Math.round(avgRating)} size="lg" />
          <p className="text-sm font-semibold mt-2 opacity-90">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
        </motion.div>

        {/* Star breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm col-span-2"
        >
          <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Rating Breakdown
          </p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = breakdown[star] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-4 text-right">{star}</span>
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Achievement badge if avg >= 4.5 */}
      {avgRating >= 4.5 && totalReviews >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4"
        >
          <div className="size-10 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Top Rated Barber 🏆</p>
            <p className="text-xs text-slate-500">You're maintaining an excellent rating. Keep up the great work!</p>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Client Reviews
          </h3>
          <button onClick={fetchReviews} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <Star className="w-12 h-12 opacity-20" />
            <p className="font-semibold text-slate-500">No reviews yet</p>
            <p className="text-sm text-center max-w-xs">Once clients complete appointments and leave reviews, they'll show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary/80 to-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {review.clientAvatar
                      ? <img src={review.clientAvatar} alt={review.clientName} className="w-full h-full object-cover" />
                      : <span className="text-white text-sm font-bold">{review.clientName?.charAt(0).toUpperCase() || '?'}</span>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-slate-800 text-sm">{review.clientName}</p>
                      <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <StarDisplay rating={review.rating} size="sm" />
                    {review.comment && (
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">"{review.comment}"</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
