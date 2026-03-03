import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Scissors, LogIn, User, Phone, MapPin, ChevronDown, Crosshair, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'US/CA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+234', flag: '🇳🇬', name: 'NG' },
  { code: '+233', flag: '🇬🇭', name: 'GH' },
  { code: '+27', flag: '🇿🇦', name: 'ZA' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+61', flag: '🇦🇺', name: 'AU' },
  { code: '+86', flag: '🇨🇳', name: 'CN' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
  { code: '+39', flag: '🇮🇹', name: 'IT' },
  { code: '+34', flag: '🇪🇸', name: 'ES' },
  { code: '+55', flag: '🇧🇷', name: 'BR' },
  { code: '+52', flag: '🇲🇽', name: 'MX' },
  { code: '+54', flag: '🇦🇷', name: 'AR' },
  { code: '+57', flag: '🇨🇴', name: 'CO' },
  { code: '+56', flag: '🇨🇱', name: 'CL' },
  { code: '+51', flag: '🇵🇪', name: 'PE' },
  { code: '+254', flag: '🇰🇪', name: 'KE' },
  { code: '+20', flag: '🇪🇬', name: 'EG' },
  { code: '+212', flag: '🇲🇦', name: 'MA' },
  { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+966', flag: '🇸🇦', name: 'SA' },
  { code: '+972', flag: '🇮🇱', name: 'IL' },
  { code: '+90', flag: '🇹🇷', name: 'TR' },
  { code: '+7', flag: '🇷🇺', name: 'RU' },
  { code: '+380', flag: '🇺🇦', name: 'UA' },
  { code: '+48', flag: '🇵🇱', name: 'PL' },
  { code: '+46', flag: '🇸🇪', name: 'SE' },
  { code: '+47', flag: '🇳🇴', name: 'NO' },
  { code: '+45', flag: '🇩🇰', name: 'DK' },
  { code: '+358', flag: '🇫🇮', name: 'FI' },
  { code: '+31', flag: '🇳🇱', name: 'NL' },
  { code: '+32', flag: '🇧🇪', name: 'BE' },
  { code: '+41', flag: '🇨🇭', name: 'CH' },
  { code: '+43', flag: '🇦🇹', name: 'AT' },
  { code: '+30', flag: '🇬🇷', name: 'GR' },
  { code: '+351', flag: '🇵🇹', name: 'PT' },
  { code: '+353', flag: '🇮🇪', name: 'IE' },
  { code: '+64', flag: '🇳🇿', name: 'NZ' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+60', flag: '🇲🇾', name: 'MY' },
  { code: '+62', flag: '🇮🇩', name: 'ID' },
  { code: '+63', flag: '🇵🇭', name: 'PH' },
  { code: '+66', flag: '🇹🇭', name: 'TH' },
  { code: '+84', flag: '🇻🇳', name: 'VN' },
  { code: '+82', flag: '🇰🇷', name: 'KR' }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);

  // Autocomplete states
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  // Derived state for the selected country flag
  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  // Verification states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Location Autocomplete Effect
  useEffect(() => {
    if (!location || location.length < 3 || !showLocationMenu) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5`);
        const data = await res.json();
        setLocationSuggestions(data || []);
      } catch (err) {
        console.error('Failed to fetch locations', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [location, showLocationMenu]);

  const selectLocationSuggestion = (displayName: string) => {
    // Extract City, State or just standard short name to avoid excessively long addresses
    const parts = displayName.split(',').map(p => p.trim());
    const shortName = parts.length > 2 ? `${parts[0]}, ${parts[parts.length - 2]}` : displayName;
    
    setLocation(shortName);
    setShowLocationMenu(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state || '';
            setLocation([city, state].filter(Boolean).join(', '));
            toast.success('Location detected!');
          } else {
            toast.error('Could not determine city from coordinates');
          }
        } catch (err) {
          toast.error('Failed to parse location data');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        toast.error('Failed to get location. Please allow location access.');
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password } 
        : { name, email, password, role, phone: `${countryCode} ${phone}`, location };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 403 && data.requiresVerification) {
           toast.error(data.message);
           setShowVerification(true);
           return;
        }
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.requiresVerification) {
         toast.success(data.message);
         setShowVerification(true);
         return;
      }

      login(data.user, data.token);
      toast.success(data.message || 'Successfully authenticated!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('Code must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      login(data.user, data.token);
      toast.success(data.message || 'Successfully verified!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light">
      <div className="flex w-full max-w-[1200px] bg-white rounded-xl overflow-hidden shadow-2xl min-h-[700px]">
        {/* Left Side: High-quality Image */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
          <img
            alt="Premium grooming session"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1200"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="text-primary w-10 h-10" />
              <h2 className="text-3xl font-black tracking-tight">TrimBook</h2>
            </div>
            <p className="text-xl font-medium opacity-90 leading-relaxed">
              "The ultimate platform to scale your grooming business. Manage schedules, clients, and payments in one place."
            </p>
            <div className="mt-6 flex gap-2">
              <div className="h-1 w-12 bg-primary rounded-full"></div>
              <div className="h-1 w-4 bg-white/30 rounded-full"></div>
              <div className="h-1 w-4 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-[400px] mx-auto w-full"
          >
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="text-slate-500">
                {isLogin
                  ? 'Please enter your details to access your dashboard.'
                  : 'Join TrimBook today to book your next premium cut.'}
              </p>
            </div>

            {/* Toggle Tabs (hidden if verifying code) */}
            {!showVerification && (
              <div className="flex border-b border-slate-200 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${isLogin ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${!isLogin ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Form */}
            {showVerification ? (
              <form className="space-y-5" onSubmit={handleVerify}>
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-6">
                  <p className="text-sm text-primary font-medium text-center">
                    We sent a 6-digit verification code to <br /><strong>{email}</strong>
                  </p>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    Please check your inbox (and spam folder) for the code.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center text-xl font-bold tracking-[0.5em]"
                      placeholder="••••••"
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} // only allow numbers
                      required
                    />
                  </div>
                </div>

                <button
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                >
                  <span>{isLoading ? 'Verifying...' : 'Verify Email & Login'}</span>
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setShowVerification(false)}
                  className="w-full py-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Back to {isLogin ? 'Login' : 'Sign Up'}
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Account Type</label>
                      <div className="flex gap-4">
                        <label className={`flex-1 py-3 px-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${role === 'user' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <input type="radio" name="role" value="user" className="hidden" checked={role === 'user'} onChange={() => setRole('user')} />
                          <span className="font-bold text-sm">Client</span>
                        </label>
                        <label className={`flex-1 py-3 px-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${role === 'barber' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <input type="radio" name="role" value="barber" className="hidden" checked={role === 'barber'} onChange={() => setRole('barber')} />
                          <span className="font-bold text-sm">Barber</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="name">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          id="name"
                          placeholder="Alex Johnson"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="phone">
                        Phone Number
                      </label>
                      <div className="relative flex items-center">
                        {/* Custom Animated Country Extractor */}
                        <div className="absolute left-0 top-0 bottom-0 flex items-center">
                          <div 
                            className="relative flex items-center h-full px-4 cursor-pointer hover:bg-slate-200/50 rounded-l-xl transition-colors z-10 gap-2"
                            onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
                          >
                            <span>{selectedCountry.flag}</span>
                            <span className="font-bold text-slate-900">{selectedCountry.code}</span>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="w-px h-6 bg-slate-200"></div>

                          <AnimatePresence>
                            {isCountryMenuOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsCountryMenuOpen(false)}></div>
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute top-[110%] left-0 w-[260px] bg-white border border-slate-200 shadow-2xl rounded-xl z-50 overflow-hidden max-h-[300px] overflow-y-auto"
                                >
                                  {COUNTRY_CODES.map((c) => (
                                    <div 
                                      key={`${c.code}-${c.name}`}
                                      onClick={() => {
                                        setCountryCode(c.code);
                                        setIsCountryMenuOpen(false);
                                      }}
                                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors ${countryCode === c.code ? 'bg-primary/5 text-primary border-l-2 border-primary' : 'text-slate-700 border-l-2 border-transparent'}`}
                                    >
                                      <span className="text-xl">{c.flag}</span>
                                      <span className="w-12 font-bold">{c.code}</span>
                                      <span className="text-slate-500 text-sm truncate">{c.name}</span>
                                    </div>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        {/* Main Number Input */}
                        <input
                          className="w-full pl-[110px] pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-medium tracking-wide"
                          id="phone"
                          placeholder="555-0000"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="location">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          id="location"
                          placeholder="City, State"
                          type="text"
                          value={location}
                          onChange={(e) => {
                            setLocation(e.target.value);
                            setShowLocationMenu(true);
                          }}
                          onFocus={() => setShowLocationMenu(true)}
                          required={!isLogin}
                        />
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isGettingLocation}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 z-10"
                          title="Get current location"
                        >
                          {isGettingLocation ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          ) : (
                            <Crosshair className="w-5 h-5" />
                          )}
                        </button>

                        <AnimatePresence>
                          {showLocationMenu && (locationSuggestions.length > 0 || isSearchingLocation) && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowLocationMenu(false)}></div>
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-[110%] left-0 w-full bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden max-h-[250px] overflow-y-auto"
                              >
                                {isSearchingLocation ? (
                                  <div className="p-4 flex items-center justify-center text-slate-500 gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Searching...</span>
                                  </div>
                                ) : (
                                  locationSuggestions.map((loc, idx) => (
                                    <div
                                      key={loc.place_id || idx}
                                      onClick={() => selectLocationSuggestion(loc.display_name)}
                                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                                    >
                                      <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-slate-700">{loc.display_name}</span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      id="email"
                      placeholder="barber@trimbook.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" type="checkbox" />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                    </label>
                    <Link to="#" className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity">Forgot password?</Link>
                  </div>
                )}

                <button
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                >
                  <span>{isLoading ? 'Processing...' : (isLogin ? 'Login to Dashboard' : 'Create Account')}</span>
                  {!isLoading && <LogIn className="w-5 h-5" />}
                </button>
              </form>
            )}

            {/* Social Login Separator */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                <img alt="Google Logo" className="w-5 h-5" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" referrerPolicy="no-referrer" />
                <span className="text-sm font-semibold text-slate-700">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                <span className="text-sm font-semibold text-slate-700">Facebook</span>
              </button>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
