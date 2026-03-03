import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  User,
  Settings,
  Bell,
  Plus,
  LogOut,
  CheckCheck,
  X,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from './BookingModal';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('trimbook_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        return data.notifications || [];
      }
    } catch (_) {}
    return [];
  }, []);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    const runFetch = async () => {
      const notifs = await fetchNotifications() as Notification[];

      // Show rating reminder toasts for unread booking_completed notifications (clients only)
      if (user?.role !== 'barber' && notifs) {
        const ratingReminders = notifs.filter(
          (n: Notification) => n.type === 'booking_completed' && !n.isRead
        );

        // Show one toast per unread rating reminder (max 2 to avoid spam)
        ratingReminders.slice(0, 2).forEach((notif: Notification, idx: number) => {
          setTimeout(() => {
            toast.custom(
              (t) => (
                <div className={`${
                  t.visible ? 'animate-enter' : 'animate-leave'
                } flex items-start gap-3 max-w-sm bg-white shadow-xl rounded-2xl border border-yellow-200 p-4 pointer-events-auto`}>
                  <div className="size-10 bg-yellow-400 rounded-xl flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm">{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <button
                      onClick={() => {
                        navigate('/dashboard/bookings?tab=past');
                        handleMarkOneRead(notif._id);
                        toast.dismiss(t.id);
                      }}
                      className="mt-2 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Rate Now →
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      handleMarkOneRead(notif._id);
                      toast.dismiss(t.id);
                    }}
                    className="text-slate-300 hover:text-slate-500 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ),
              { duration: 12000, id: `rating-${notif._id}` }
            );
          }, idx * 1200); // Stagger so they don't all pop at once
        });
      }
    };
    runFetch();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, user?.role]);

  // Refresh on new booking
  useEffect(() => {
    const handleSuccess = () => { setTimeout(fetchNotifications, 1500); };
    window.addEventListener('booking_success', handleSuccess);
    return () => window.removeEventListener('booking_success', handleSuccess);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('trimbook_token');
    if (!token) return;
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (_) {}
  };

  const handleMarkOneRead = async (id: string) => {
    const token = localStorage.getItem('trimbook_token');
    if (!token) return;
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Open booking modal via event
  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEditData(customEvent.detail || null);
      setIsBookingModalOpen(true);
    };
    window.addEventListener('open_booking_modal', handleOpenModal);
    return () => window.removeEventListener('open_booking_modal', handleOpenModal);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: `Welcome back, ${user?.name?.split(' ')[0] || 'Alex'}`, subtitle: "Here's what's happening with your grooming schedule." };
      case '/dashboard/bookings':
        return { title: "My Bookings", subtitle: "Manage your upcoming and past appointments." };
      case '/dashboard/services':
        return { title: "Services", subtitle: "Explore our premium grooming services." };
      case '/dashboard/profile':
        return { title: "Profile", subtitle: "Manage your personal information." };
      case '/dashboard/settings':
        return { title: "Settings", subtitle: "Configure your account preferences." };
      case '/dashboard/reviews':
        return { title: "My Reviews", subtitle: "See what clients are saying about your work." };
      default:
        return { title: "Dashboard", subtitle: "" };
    }
  };

  const { title, subtitle } = getPageTitle();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen overflow-hidden bg-background-light">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#1a1a1a] text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
            <Scissors className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TrimBook</h1>
            <p className="text-xs text-slate-400">Premium Grooming</p>
          </div>
        </div>
        <nav className="flex-1 mt-6">
          <div className="space-y-1">
            <Link to="/dashboard" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/dashboard') ? 'sidebar-item-active text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/dashboard/bookings" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/dashboard/bookings') ? 'sidebar-item-active text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <CalendarDays className="w-5 h-5" />
              <span className="font-medium">My Bookings</span>
            </Link>
            <Link to="/dashboard/services" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/dashboard/services') ? 'sidebar-item-active text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Scissors className="w-5 h-5" />
              <span className="font-medium">Services</span>
            </Link>
            <Link to="/dashboard/profile" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/dashboard/profile') ? 'sidebar-item-active text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <Link to="/dashboard/settings" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/dashboard/settings') ? 'sidebar-item-active text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
            {/* Reviews link — barbers only */}
            {user?.role === 'barber' && (
              <Link to="/dashboard/reviews" className={`flex items-center gap-3 px-6 py-3 transition-colors ${isActive('/dashboard/reviews') ? 'sidebar-item-active text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <Star className="w-5 h-5" />
                <span className="font-medium">My Reviews</span>
              </Link>
            )}
            <button onClick={logout} className="w-full flex items-center gap-3 px-6 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors text-left mt-auto">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </nav>
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gradient-to-br from-primary/80 to-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
                : <span className="text-white text-sm font-bold select-none">{user?.name?.charAt(0).toUpperCase() || '?'}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10 w-full">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-4">

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifPanel(prev => !prev); if (!showNotifPanel && unreadCount > 0) {} }}
                className="size-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 relative hover:bg-slate-200 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {showNotifPanel && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-600" />
                      <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} title="Mark all as read" className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors">
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setShowNotifPanel(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                        <Bell className="w-8 h-8 opacity-30" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => { if (!notif.isRead) handleMarkOneRead(notif._id); }}
                          className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 size-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${!notif.isRead ? 'text-slate-800' : 'text-slate-600'}`}>{notif.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-10 w-px bg-slate-200 mx-2"></div>
            {user?.role !== 'barber' && (
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Book New Appointment</span>
                <span className="sm:hidden">Book</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-8">
          <div className="w-full mx-auto">
            <Outlet context={{ refreshTimestamp: Date.now() }} />
          </div>
        </div>
      </main>
      <BookingModal
        isOpen={isBookingModalOpen}
        editData={editData}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event('booking_success'));
        }}
      />
    </div>
  );
}

