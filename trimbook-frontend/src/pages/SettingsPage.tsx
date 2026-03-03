import { motion } from 'motion/react';
import { Bell, Shield, Wallet, Smartphone, Globe, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('trimbook_token');
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete account');
      
      toast.success("Account permanently deleted");
      logout();
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while deleting account');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
            <p className="text-sm text-slate-500">Manage how you receive alerts and updates.</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Email Updates</p>
              <p className="text-sm text-slate-500">Receive booking confirmations and reminders via email.</p>
            </div>
            <Toggle checked={emailNotifications} onChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">SMS Reminders</p>
              <p className="text-sm text-slate-500">Get text messages 2 hours before your appointment.</p>
            </div>
            <Toggle checked={smsNotifications} onChange={setSmsNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Marketing & Promotional</p>
              <p className="text-sm text-slate-500">Updates about new services, barbers, and special offers.</p>
            </div>
            <Toggle checked={marketingEmails} onChange={setMarketingEmails} />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Privacy & Data</h3>
            <p className="text-sm text-slate-500">Control your privacy settings and connected apps.</p>
          </div>
        </div>
        <div className="p-6 space-y-0 divide-y divide-slate-100">
          <div className="py-4 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Cookie Preferences</span>
            </div>
            <button className="text-sm font-bold text-slate-400 hover:text-primary transition-colors px-3 py-1 rounded-md hover:bg-slate-50">Manage</button>
          </div>
          <div className="py-4 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Connected Devices</span>
            </div>
            <button className="text-sm font-bold text-slate-400 hover:text-primary transition-colors px-3 py-1 rounded-md hover:bg-slate-50">View All</button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-red-100 flex items-center gap-3 bg-red-50/50">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
            <p className="text-sm text-red-500/80">Irreversible, destructive actions for your account.</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">Delete Account</p>
              <p className="text-sm text-slate-500">Permanently remove your account and all associated data.</p>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20"
            >
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Confirm Deletion</h3>
              <button 
                onClick={() => !isDeleting && setShowDeleteModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-6 font-medium">
                Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex gap-3 justify-end mt-4">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Toggle Component
function Toggle({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      className={`${checked ? 'bg-primary' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}
