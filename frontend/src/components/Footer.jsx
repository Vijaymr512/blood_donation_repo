import { Droplet } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Droplet className="text-red-500 w-5 h-5" />
          <span className="font-bold text-gray-900">Blood<span className="text-red-500">Connect</span></span>
        </div>
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} BloodConnect. Saving lives, one drop at a time.</p>
        <div className="flex gap-4">
          <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
