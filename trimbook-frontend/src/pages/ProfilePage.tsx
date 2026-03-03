import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Mail, User, Phone, MapPin, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, login } = useAuth(); // using login context update the locally stored user context optionally or just refresh
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [startTime, setStartTime] = useState(user?.workingHours?.startTime || '09:00');
  const [endTime, setEndTime] = useState(user?.workingHours?.endTime || '18:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const portfolioInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          phone, 
          location,
          workingHours: user?.role === 'barber' ? { startTime, endTime } : undefined 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      
      toast.success(data.message);
      // update context with new user data
      if (token) login(data.user, token);
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch('http://localhost:5000/api/uploads/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload avatar');
      
      toast.success(data.message);
      if (token) login(data.user, token);
    } catch (err: any) {
      toast.error(err.message || 'Error uploading avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPortfolio(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file: File) => {
        formData.append('images', file);
      });
      
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch('http://localhost:5000/api/uploads/portfolio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload portfolio');
      
      toast.success(data.message);
      if (token) login(data.user, token);
    } catch (err: any) {
      toast.error(err.message || 'Error uploading images');
    } finally {
      setIsUploadingPortfolio(false);
      if (portfolioInputRef.current) portfolioInputRef.current.value = '';
    }
  };

  const handleDeletePortfolioImage = async (imageUrl: string) => {
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch('http://localhost:5000/api/uploads/portfolio', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete image');
      
      toast.success(data.message);
      if (token) login(data.user, token);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting image');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Cover & Avatar Header */}
        <div className="h-32 bg-gradient-to-r from-primary/80 to-slate-900"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end mb-8">
            <div className="relative -mt-12 group">
              <div className="size-24 rounded-full border-4 border-white bg-gradient-to-br from-primary/80 to-slate-700 overflow-hidden shadow-md flex items-center justify-center">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                  : <span className="text-white text-2xl font-bold select-none">{user?.name?.charAt(0).toUpperCase() || '?'}</span>
                }
              </div>
              <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              <button 
                onClick={() => avatarInputRef.current?.click()} 
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 size-8 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
              >
                {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Camera className="w-4 h-4" />}
              </button>
            </div>
            <button 
              type="submit" 
              form="profile-form"
              disabled={isLoading}
              className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-md hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>

          <form id="profile-form" className="space-y-6" onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm text-slate-900" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address (Cannot change)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="email" value={user?.email || ""} disabled className="block w-full pl-10 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl sm:text-sm text-slate-500 cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm text-slate-900" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)} className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm text-slate-900" />
                </div>
              </div>

              {user?.role === 'barber' && (
                <>
                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">Business Hours</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-1 block">Opening Time</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm text-slate-900" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 mb-1 block">Closing Time</label>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm text-slate-900" />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">Portfolio Gallery</h4>
                      <input type="file" ref={portfolioInputRef} onChange={handlePortfolioUpload} accept="image/*" multiple className="hidden" />
                      <button 
                        type="button" 
                        onClick={() => portfolioInputRef.current?.click()}
                        disabled={isUploadingPortfolio}
                        className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        {isUploadingPortfolio ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload Photos'}
                      </button>
                    </div>
                    {user?.portfolioImages && user.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {user.portfolioImages.map((img, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 shadow-sm">
                            <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => handleDeletePortfolioImage(img)}
                              className="absolute top-1 right-1 size-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            >
                              <X className="w-3 h-3 font-bold" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-sm text-slate-500">No portfolio images uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Account Security</span>
              </h4>
              <button type="button" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                Change Password
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
