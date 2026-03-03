import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User,
  BookOpen,
  CalendarClock,
  Star,
  Clock,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [data, setData] = useState<{
    role: string;
    stats: { totalBookings: number; upcoming: number; highlightStat: string };
    upcomingAppointments: any[];
    bookingHistory: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch('http://localhost:5000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

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
      fetchDashboardData(); 
      window.dispatchEvent(new Event('booking_success')); 
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleSuccess = () => fetchDashboardData();
    window.addEventListener('booking_success', handleSuccess);

    return () => {
      window.removeEventListener('booking_success', handleSuccess);
    };
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const { role, stats, upcomingAppointments, bookingHistory } = data;
  const isBarber = role === 'barber';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatFullDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: BookOpen, label: "Total Appointments", value: stats.totalBookings.toString() },
          { icon: CalendarClock, label: "Upcoming", value: stats.upcoming.toString() },
          { icon: Star, label: isBarber ? "Top Client" : "Favorite Barber", value: stats.highlightStat }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1"
          >
            <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 truncate">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Appointments Card */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-primary w-5 h-5" />
            Upcoming Appointments
          </h3>
          <button onClick={fetchDashboardData} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
        <div className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500">
              No upcoming appointments found. Time for a cut!
            </div>
          ) : (
            upcomingAppointments.map((apt: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 min-w-[56px] rounded-lg bg-slate-100 flex flex-col items-center justify-center leading-none">
                    <span className="text-xs font-bold text-primary uppercase">{formatDate(apt.date).split(' ')[0]}</span>
                    <span className="text-xl font-black">{formatDate(apt.date).split(' ')[1]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{apt.service}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><User className="w-4 h-4" /> {isBarber ? apt.clientName : apt.barber}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(apt.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  {isBarber ? (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(apt._id, 'Cancelled')}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(apt._id, 'Completed')}
                        className="flex-1 sm:flex-none px-6 py-2 text-sm font-bold bg-primary text-white rounded-lg transition-all hover:scale-105 shadow-md"
                      >
                        Complete
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('open_booking_modal', { detail: apt }))}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(apt._id, 'Cancelled')}
                        className="flex-1 sm:flex-none px-6 py-2 text-sm font-bold bg-slate-900 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-105 shadow-md"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Booking History */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Recent Booking History</h3>
          <button className="text-sm font-medium text-primary hover:underline">View All</button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{isBarber ? 'Client' : 'Barber'}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookingHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Your history is completely empty.
                  </td>
                </tr>
              ) : (
                bookingHistory.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{row.service}</td>
                    <td className="px-6 py-4 text-slate-600">{isBarber ? row.clientName : row.barber}</td>
                    <td className="px-6 py-4 text-slate-600">{formatFullDate(row.date)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        row.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        row.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
