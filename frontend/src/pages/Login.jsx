import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ contactInfo: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/profile');
      } else {
        setError(data.msg || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <Droplet className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-500">Log in to view blood requests nearby</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone or Email</label>
            <input 
              type="text" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your contact info"
              value={formData.contactInfo}
              onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all"
          >
            Sign In <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="text-red-500 font-semibold hover:text-red-600">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
