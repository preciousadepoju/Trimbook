import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  return (
    <nav className={`sticky top-0 z-50 border-b ${transparent ? 'bg-background-light/80 backdrop-blur-md border-slate-200' : 'bg-white border-slate-200'} transition-all`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="text-primary w-8 h-8" />
            <span className="text-2xl font-black tracking-tight text-slate-900">TrimBook</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="#" className="text-sm font-semibold hover:text-primary transition-colors">Explore</Link>
            <Link to="#" className="text-sm font-semibold hover:text-primary transition-colors">Services</Link>
            <Link to="#" className="text-sm font-semibold hover:text-primary transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-5 py-2 text-sm font-bold border border-transparent hover:border-slate-300 rounded-xl transition-all">Login</Link>
            <button className="px-6 py-2 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">Join Now</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-background-light py-20 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Scissors className="text-primary w-6 h-6" />
            <span className="text-xl font-black tracking-tight">TrimBook</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Redefining the grooming experience for the modern gentleman through technology and premium service.
          </p>
          <div className="flex gap-4">
            {/* Social icons would go here */}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6">Services</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><Link to="#" className="hover:text-primary transition-colors">Classic Cuts</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Beard Grooming</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Hair Styling</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Hot Towel Shave</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><Link to="#" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Our Barbers</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Partners</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li><Link to="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li className="flex items-center gap-2">
              hello@trimbook.app
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">© 2024 TrimBook. All rights reserved.</p>
      </div>
    </footer>
  );
}
