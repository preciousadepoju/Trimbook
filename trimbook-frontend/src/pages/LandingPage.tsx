import { motion } from 'motion/react';
import { Calendar, Scissors, ShieldCheck, Timer, Star, Clock, MapPin } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

// Fallback barbershop images for services that have no image
const SERVICE_FALLBACK = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400';

export default function LandingPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [topBarbers, setTopBarbers] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingBarbers, setIsLoadingBarbers] = useState(true);

  // Fetch all services (combined from all barbers)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        // Show max 4 on landing page
        setServices(Array.isArray(data) ? data.slice(0, 4) : []);
      })
      .catch(() => setServices([]))
      .finally(() => setIsLoadingServices(false));
  }, []);

  // Fetch barbers and sort by highest avg rating — top 3
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/users/barbers`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return setTopBarbers([]);
        const sorted = [...data]
          .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
          .slice(0, 3);
        setTopBarbers(sorted);
      })
      .catch(() => setTopBarbers([]))
      .finally(() => setIsLoadingBarbers(false));
  }, []);

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    const rounded = Math.round(rating);
    return [1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        className={`${size} ${s <= rounded ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen">
      <Navbar transparent />

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/60 to-transparent z-10"></div>
          <img
            alt="Hero Background"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1920"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-4 lg:mb-6">
              Book Your <span className="text-primary">Perfect</span> Cut
            </h1>
            <p className="text-base md:text-xl text-slate-200 mb-8 lg:mb-10 leading-relaxed opacity-90">
              Experience effortless grooming with the finest barbers in town. Your next look is just a few taps away.
            </p>
            <div className="flex flex-wrap gap-3 lg:gap-4">
              <Link to="/login" className="px-6 lg:px-8 py-3 lg:py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Book Appointment
              </Link>
              <Link to="/login" className="px-6 lg:px-8 py-3 lg:py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Three Simple Steps</h2>
          <p className="text-slate-600 max-w-xl mx-auto">Getting your perfect cut has never been easier. We've streamlined the process for the modern man.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12">
          {[
            { icon: Scissors, title: "Choose Service", desc: "Select from our wide range of premium grooming services tailored to your style." },
            { icon: Timer, title: "Select Time", desc: "Pick a slot that fits your busy schedule with your favorite master barber." },
            { icon: ShieldCheck, title: "Get Confirmation", desc: "Receive instant booking confirmation and timely reminders for your visit." }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="flex flex-col items-center text-center p-8 rounded-xl bg-white border border-slate-100 shadow-sm"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <step.icon className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Services — Live from DB */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-2">Popular Services</h2>
              <p className="text-slate-600">Our most requested premium grooming experiences.</p>
            </div>
            <Link to="/login" className="hidden md:block text-primary font-bold hover:underline">View All Services</Link>
          </div>

          {isLoadingServices ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-8 bg-slate-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Scissors className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No services available yet.</p>
              <Link to="/login" className="mt-4 inline-block text-primary font-bold hover:underline">Sign up as a barber to add services</Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
              {services.map((service, i) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group flex flex-col w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[240px] max-w-[300px]"
                >
                  {/* Service image — uses barber portfolio or fallback */}
                  <div className="h-48 overflow-hidden bg-slate-100">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={service.barber?.portfolioImages?.[0] || SERVICE_FALLBACK}
                      alt={service.title}
                      referrerPolicy="no-referrer"
                      onError={(e: any) => { e.target.src = SERVICE_FALLBACK; }}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold mb-1 truncate">{service.title}</h3>
                    {/* Barber name */}
                    {service.barber?.name && (
                      <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                        <Scissors className="w-3 h-3" /> {service.barber.name}
                        {service.barber.location && (
                          <><MapPin className="w-3 h-3 ml-1" /> {service.barber.location}</>
                        )}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <Clock className="w-4 h-4" /> {service.duration}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-black text-primary">{service.price}</span>
                      <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:scale-105 transition-all hover:bg-primary"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top Rated Barbers — Live from DB */}
      <section className="py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Top Rated Barbers</h2>
            <p className="text-slate-600">Ranked by client reviews — the best of the best.</p>
          </div>

          {isLoadingBarbers ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-slate-100 animate-pulse">
                  <div className="w-32 h-32 rounded-full bg-slate-200 mx-auto mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto mb-3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : topBarbers.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold">No barbers found yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8">
              {topBarbers.map((barber, i) => (
                <motion.div
                  key={barber._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow w-full max-w-[320px] min-w-[260px] flex-1"
                >
                  {/* Rank badge */}
                  {i === 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs font-black px-3 py-1 rounded-full shadow">
                      🏆 Top Rated
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="mb-5 relative mx-auto w-32 h-32">
                    {barber.avatarUrl ? (
                      <img
                        className="w-full h-full object-cover rounded-full border-4 border-primary/20"
                        src={barber.avatarUrl}
                        alt={barber.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full border-4 border-primary/20 bg-gradient-to-br from-primary/80 to-slate-700 flex items-center justify-center">
                        <span className="text-white text-4xl font-black">
                          {barber.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Online indicator */}
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{barber.name}</h3>

                  {/* Location */}
                  {barber.location && (
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> {barber.location}
                    </p>
                  )}

                  {/* Stars + rating */}
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {renderStars(barber.avgRating || 0)}
                  </div>
                  <p className="text-slate-700 font-bold text-sm mb-1">
                    {barber.avgRating > 0
                      ? <>{barber.avgRating.toFixed(1)} <span className="text-slate-400 font-normal">({barber.reviewCount} {barber.reviewCount === 1 ? 'review' : 'reviews'})</span></>
                      : <span className="text-slate-400 font-normal">No reviews yet</span>
                    }
                  </p>

                  <div className="mt-5">
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-3 bg-slate-100 text-slate-900 font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
                    >
                      Book with {barber.name.split(' ')[0]}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
