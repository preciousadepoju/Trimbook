import { motion } from 'motion/react';
import { Clock, User as UserIcon, CheckCircle2, XCircle, RefreshCw, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RatingModal } from '../components/RatingModal';

export default function MyBookingsPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'past' ? 'past' : 'upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(new Set());
  const [ratingTarget, setRatingTarget] = useState<any>(null);
  const { user } = useAuth();

  const isBarber = user?.role === 'barber';

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch('http://localhost:5000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data);

      // Check which completed bookings have already been reviewed
      if (!isBarber) {
        const completedIds = data
          .filter((b: any) => b.status === 'Completed')
          .map((b: any) => b._id);

        const reviewChecks = await Promise.all(
          completedIds.map((id: string) =>
            fetch(`http://localhost:5000/api/reviews/booking/${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()).then(d => ({ id, reviewed: d.reviewed }))
          )
        );
        const reviewed = new Set<string>(
          reviewChecks.filter(r => r.reviewed).map(r => r.id)
        );
        setReviewedBookingIds(reviewed);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const handleSuccess = () => fetchBookings();
    window.addEventListener('booking_success', handleSuccess);
    return () => window.removeEventListener('booking_success', handleSuccess);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      toast.success(data.message);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };

  if (isLoading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const now = new Date();
  const upcomingBookings = bookings.filter((b) => new Date(b.date) > now && b.status === 'Upcoming');
  const pastBookings = bookings.filter((b) => new Date(b.date) <= now || b.status !== 'Upcoming');
  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Upcoming Bookings
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Past Bookings
        </button>
        <div className="ml-auto pb-4">
          <button onClick={fetchBookings} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {currentBookings.map((apt, i) => {
          const alreadyReviewed = reviewedBookingIds.has(apt._id);
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              key={apt._id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-xl bg-slate-100 flex flex-col items-center justify-center leading-none shadow-inner min-w-[64px]">
                  <span className="text-xs font-bold text-primary uppercase">{formatDate(apt.date).split(' ')[0]}</span>
                  <span className="text-2xl font-black text-slate-900">{formatDate(apt.date).split(' ')[1]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-bold text-lg text-slate-900">{apt.service}</h4>
                    {apt.status === 'Completed' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3" /> Completed</span>}
                    {apt.status === 'Cancelled' && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Cancelled</span>}
                    {/* Already reviewed badge */}
                    {!isBarber && alreadyReviewed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                        <Star className="w-3 h-3 fill-current" /> Reviewed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><UserIcon className="w-4 h-4" /> {isBarber ? apt.clientName : apt.barber}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatTime(apt.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {activeTab === 'upcoming' ? (
                  <>
                    {isBarber ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'Cancelled')}
                          className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-red-600 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'Completed')}
                          className="px-6 py-2 text-sm font-bold bg-primary hover:bg-primary/90 text-white rounded-lg transition-all shadow-md"
                        >
                          Complete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('open_booking_modal', { detail: apt }))}
                          className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'Cancelled')}
                          className="px-6 py-2 text-sm font-bold bg-slate-900 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-105 shadow-md"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Rate button for clients on completed bookings */}
                    {!isBarber && apt.status === 'Completed' && !alreadyReviewed && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRatingTarget(apt)}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg transition-all shadow-md shadow-yellow-200"
                      >
                        <Star className="w-4 h-4 fill-current" />
                        Rate Barber
                      </motion.button>
                    )}
                    {/* Book Again */}
                    {!isBarber && apt.status === 'Completed' && (
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open_booking_modal'))}
                        className="px-5 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Book Again
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {currentBookings.length === 0 && !isLoading && (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <p className="text-slate-500 font-medium">No {activeTab} bookings found.</p>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingTarget && (
        <RatingModal
          isOpen={!!ratingTarget}
          booking={ratingTarget}
          onClose={() => setRatingTarget(null)}
          onSuccess={() => {
            setReviewedBookingIds(prev => new Set([...prev, ratingTarget._id]));
            setRatingTarget(null);
          }}
        />
      )}
    </div>
  );
}
