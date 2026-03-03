import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Sparkles, Droplets, Check, Plus, Loader2, X, Trash2, MapPin, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [bestSeller, setBestSeller] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/services');
      if (!res.ok) throw new Error('Failed to load services');
      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      toast.error(err.message || 'Error loading services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, duration, price, description, bestSeller })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create service');
      
      toast.success('Service created!');
      setIsModalOpen(false);
      // reset form
      setTitle(''); setDuration(''); setPrice(''); setDescription(''); setBestSeller(false);
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete service');
      toast.success('Service deleted');
      fetchServices();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };

  const isBarber = user?.role === 'barber';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {isBarber && (
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Your Salon Services</h3>
            <p className="text-slate-500 text-sm">Create and manage the services you offer to clients.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> Add Service
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-2xl border border-slate-200 shadow-sm">
          <Scissors className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No Services Available</h3>
          <p className="text-slate-500 mt-2">Check back later or if you belong to a barber, add a service!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col"
            >
              {service.bestSeller && (
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 z-10">
                  <Star className="w-3 h-3 fill-yellow-800" /> Best Seller
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Scissors className="w-6 h-6" />
                </div>
                {user?.id === service.barber?._id && (
                  <button onClick={() => handleDelete(service._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">{service.title}</h3>
              
              {/* Barber Info on Card */}
              <div className="flex items-center gap-2 mb-4 bg-slate-50 p-2 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {service.barber?.avatarUrl
                    ? <img src={service.barber.avatarUrl} className="w-full h-full object-cover" alt="barber" />
                    : <span className="text-white text-xs font-bold select-none">{service.barber?.name?.charAt(0).toUpperCase() || 'B'}</span>
                  }
                </div>
                <div className="text-xs truncate">
                  <span className="font-bold text-slate-700 block truncate">{service.barber?.name || "Independent"}</span>
                  <span className="text-slate-500 flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /> {service.barber?.location || "N/A"}</span>
                  {service.barber?.avgRating > 0 && (
                    <span className="flex items-center gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-2.5 h-2.5 ${
                          s <= Math.round(service.barber?.avgRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-200 fill-slate-200'
                        }`} />
                      ))}
                      <span className="text-slate-400 text-[10px] ml-0.5">{service.barber?.avgRating}</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">{service.description}</p>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-slate-100">
                <div>
                  <p className="text-2xl font-black text-slate-900">{service.price}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{service.duration}</p>
                </div>
                {isBarber ? (
                  <button 
                    onClick={() => toast.success('Boost feature coming soon!')} 
                    className="px-6 py-2.5 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-200 transition-colors"
                  >
                    Boost Visibility
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('open_booking_modal', { 
                          detail: { service: service.title, barber: service.barber?.name, _isNewBooking: true } 
                        })
                      );
                    }}
                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-primary transition-colors hover:shadow-lg hover:shadow-primary/30"
                  >
                    Book Now
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Add New Service</h3>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateService} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">Service Title</label>
                  <input type="text" placeholder="e.g. Classic Haircut" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-1">Price</label>
                    <input type="text" placeholder="e.g. $45" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-1">Duration</label>
                    <input type="text" placeholder="e.g. 45 Min" value={duration} onChange={e => setDuration(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1">Description</label>
                  <textarea placeholder="Describe the service..." value={description} onChange={e => setDescription(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none"></textarea>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="bestSeller" checked={bestSeller} onChange={e => setBestSeller(e.target.checked)} className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded" />
                  <label htmlFor="bestSeller" className="text-sm font-bold text-slate-700 cursor-pointer">Mark as Best Seller</label>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Service
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
