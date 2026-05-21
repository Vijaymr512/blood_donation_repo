import { Link } from 'react-router-dom';
import { Droplet, User as UserIcon, Bell } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-500 p-2 rounded-lg group-hover:bg-red-600 transition-colors">
              <Droplet className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">Blood<span className="text-red-500">Connect</span></span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-red-500 font-medium transition-colors">Dashboard</Link>
            <Link to="/about" className="text-gray-600 hover:text-red-500 font-medium transition-colors">About Us</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-red-500 font-medium transition-colors">Login</Link>
            <Link to="/signup" className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-md shadow-red-500/20">Sign Up</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
