import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id: string;
    barber: string;
    service: string;
  };
  onSuccess: () => void;
}

export function RatingModal({ isOpen, onClose, booking, onSuccess }: RatingModalProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const starLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
  const starColors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-500', 'text-green-500'];

  const handleSubmit = async () => {
    if (!selectedStar) {
      toast.error('Please select a star rating');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          rating: selectedStar,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');

      toast.success('Review submitted! Thank you ⭐');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedStar(0);
      setHoveredStar(0);
      setComment('');
      onClose();
    }
  };

  const displayStar = hoveredStar || selectedStar;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-primary/90 to-slate-800 px-6 pt-8 pb-12 text-center">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 size-8 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              </div>
              <h2 className="text-xl font-bold text-white">Rate Your Experience</h2>
              <p className="text-white/70 text-sm mt-1">
                {booking.service} with <strong className="text-white">{booking.barber}</strong>
              </p>
            </div>

            {/* Content — overlaps the gradient */}
            <div className="-mt-6 bg-white rounded-t-3xl px-6 pb-6 pt-6">
              {/* Stars */}
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setSelectedStar(star)}
                    className="p-1 transition-all"
                  >
                    <Star
                      className={`w-10 h-10 transition-all duration-150 ${
                        star <= displayStar
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                          : 'text-slate-200 fill-slate-200'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Star label */}
              <motion.p
                key={displayStar}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-center text-sm font-bold mb-4 h-5 ${starColors[displayStar] || 'text-slate-400'}`}
              >
                {displayStar ? starLabels[displayStar] : 'Tap a star to rate'}
              </motion.p>

              {/* Comment */}
              <div className="relative mb-5">
                <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  rows={3}
                  maxLength={500}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <span className="absolute bottom-3 right-3 text-xs text-slate-400">{comment.length}/500</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedStar}
                  className="flex-[2] py-3 rounded-2xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <><Star className="w-4 h-4 fill-current" /> Submit Review</>
                  }
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
