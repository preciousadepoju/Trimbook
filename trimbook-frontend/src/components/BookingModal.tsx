import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Scissors, User, MapPin, Clock, ChevronLeft, ChevronRight, ImageOff, Images, ZoomIn, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

// --- Portfolio Carousel Sub-Component ---
function PortfolioCarousel({ images, barberName }: { images: string[]; barberName: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const prev = () => setActiveIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveIdx(i => (i + 1) % images.length);

  return (
    <>
      <div className="relative bg-slate-900 overflow-hidden" style={{ height: '180px' }}>
        {/* Images */}
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            src={images[activeIdx]}
            alt={`${barberName} work ${activeIdx + 1}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setLightboxImg(images[activeIdx])}
          />
        </AnimatePresence>

        {/* Zoom hint overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black/50 rounded-full p-2">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Arrow Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 size-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-2 right-3 text-xs text-white/80 font-medium">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2.5 bg-white">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`rounded-full transition-all duration-200 ${
                i === activeIdx ? 'bg-primary w-4 h-2' : 'bg-slate-300 size-2 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setLightboxImg(null)}
          >
            <button
              className="absolute top-4 right-4 size-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setLightboxImg(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.img
              src={lightboxImg}
              alt="Portfolio fullscreen"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <p className="absolute bottom-4 text-white/60 text-sm">{barberName}'s Work</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
// --- End Portfolio Carousel ---

export function BookingModal({ isOpen, onClose, onSuccess, editData }: BookingModalProps) {
  const { user } = useAuth();
  const [service, setService] = useState('Classic Haircut & Beard Trim');
  const [barber, setBarber] = useState('');
  const [barbersList, setBarbersList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (editData) {
        setService(editData.service || '');
        setBarber(editData.barber || '');
        if (editData.date) {
            const tempDate = new Date(editData.date);
            setSelectedDate(tempDate.toISOString().split('T')[0]);
            const hours = tempDate.getHours().toString().padStart(2, '0');
            const mins = tempDate.getMinutes().toString().padStart(2, '0');
            setSelectedTime(`${hours}:${mins}`);
        }
      } else {
        setService('');
        setSelectedDate('');
        setSelectedTime('');
      }

      // Load all barbers
      fetch(`${API_BASE_URL}/api/users/barbers`)
        .then(res => res.json())
        .then(data => {
          setBarbersList(data);
          // Auto-select first barber only on new bookings
          if (data.length > 0 && !editData?.barber) {
            setBarber(data[0].name);
          }
        })
        .catch(err => console.error('Failed to load barbers:', err));
    }
  }, [isOpen, editData]);

  // Whenever the selected barber changes → fetch their specific services
  React.useEffect(() => {
    if (!barber || barbersList.length === 0) return;
    const selectedB = barbersList.find((b: any) => b.name === barber);
    if (!selectedB) return;

    setServicesList([]);
    fetch(`${API_BASE_URL}/api/services/barber/${selectedB._id}`)
      .then(res => res.json())
      .then(data => {
        setServicesList(Array.isArray(data) ? data : []);
        // Auto-select first service if not editing or service not set
        if (data.length > 0 && !editData?.service) {
          setService(data[0].title);
        }
      })
      .catch(err => console.error('Failed to load barber services:', err));
  }, [barber, barbersList]);

  React.useEffect(() => {
    if (!barber || !selectedDate) {
      setUnavailableTimes([]);
      return;
    }
    fetch(`${API_BASE_URL}/api/bookings/unavailable-slots?barberName=${encodeURIComponent(barber)}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setUnavailableTimes(data.bookedTimes || []);
      })
      .catch(err => console.error('Failed to load availability:', err));
  }, [barber, selectedDate]);

  const selectedBarber = barbersList.find(b => b.name === barber);
  const startTimeStr = selectedBarber?.workingHours?.startTime || "09:00";
  const endTimeStr = selectedBarber?.workingHours?.endTime || "18:00";
  
  const generateTimeSlots = () => {
    const slots = [];
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    
    let current = new Date();
    current.setHours(startH, startM, 0, 0);
    const end = new Date();
    end.setHours(endH, endM, 0, 0);
    
    while (current < end) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current.setMinutes(current.getMinutes() + 30); // 30 min intervals
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both a date and a time slot');
      return;
    }
    if (!barber) {
      toast.error('Please select a barber');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('trimbook_token');
      const isEditing = editData && editData._id;
      const url = isEditing 
        ? `${API_BASE_URL}/api/bookings/${editData._id}` 
        : `${API_BASE_URL}/api/bookings`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ service, barber, date: new Date(`${selectedDate}T${selectedTime}`).toISOString() })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save booking');
      }

      toast.success(isEditing ? 'Appointment rescheduled!' : 'Appointment booked successfully!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl z-10 overflow-hidden max-h-[95vh] flex flex-col mx-4 sm:mx-0"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editData && editData._id ? 'Reschedule Appointment' : 'Book Appointment'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="service">
                  Select Service
                </label>
                <div className="relative">
                  <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    id="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    disabled={!barber || servicesList.length === 0}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {!barber ? (
                      <option value="">Select a barber first</option>
                    ) : servicesList.length === 0 ? (
                      <option value="">This barber has no services yet</option>
                    ) : (
                      servicesList.map((s) => (
                        <option key={s._id} value={s.title}>
                          {s.title} ({s.price} - {s.duration})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="barber">
                  Select Barber
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    id="barber"
                    value={barber}
                    onChange={(e) => { setBarber(e.target.value); setService(''); }}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    {barbersList.length === 0 ? (
                      <option value="">No barbers available</option>
                    ) : (
                      barbersList.map((b) => {
                        const isMatch = user?.location && b.location && 
                           b.location.toLowerCase().includes(user.location.toLowerCase());
                        return (
                          <option key={b._id} value={b.name}>
                            {b.name} {b.location ? `(${b.location})` : ''} {isMatch ? '⭐ (Near You)' : ''}
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>
                {/* Barber Portfolio Card - shows whenever a barber is selected */}
                {selectedBarber && (
                  <motion.div
                    key={selectedBarber._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white"
                  >
                    {/* Barber Info Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                      <div className="size-10 rounded-full bg-gradient-to-br from-primary/80 to-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                        {selectedBarber.avatarUrl
                          ? <img src={selectedBarber.avatarUrl} alt={selectedBarber.name} className="w-full h-full object-cover" />
                          : <span className="text-white text-sm font-bold">{selectedBarber.name?.charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{selectedBarber.name}</p>
                        {selectedBarber.location && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />{selectedBarber.location}
                          </p>
                        )}
                        {/* Rating display */}
                        {selectedBarber.avgRating > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${
                                s <= Math.round(selectedBarber.avgRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-200 fill-slate-200'
                              }`} />
                            ))}
                            <span className="text-xs text-slate-500 ml-1">{selectedBarber.avgRating} ({selectedBarber.reviewCount})</span>
                          </div>
                        )}
                      </div>
                      {selectedBarber.portfolioImages?.length > 0 && (
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                          <Images className="w-3 h-3" />{selectedBarber.portfolioImages.length} photos
                        </span>
                      )}
                    </div>

                    {/* Portfolio Gallery */}
                    {selectedBarber.portfolioImages?.length > 0 ? (
                      <PortfolioCarousel images={selectedBarber.portfolioImages} barberName={selectedBarber.name} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
                        <ImageOff className="w-8 h-8 opacity-40" />
                        <p className="text-xs font-medium">No portfolio photos yet</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="date">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="time">
                    Available Slots
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <select
                      id="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      disabled={!selectedDate}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>Select a time</option>
                      {timeSlots.map(time => {
                        const isBooked = unavailableTimes.includes(time);
                        const isPast = selectedDate === new Date().toISOString().split('T')[0] && time < `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;
                        const isDisabled = isBooked || isPast;
                        
                        return (
                          <option key={time} value={time} disabled={isDisabled}>
                            {time} {isBooked ? '(Booked)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3 px-4 font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? ((editData && editData._id) ? 'Rescheduling...' : 'Booking...') : ((editData && editData._id) ? 'Confirm New Time' : 'Confirm Appointment')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
