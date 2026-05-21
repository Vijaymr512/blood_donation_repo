import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', contactInfo: '', password: '', location: '', bloodGroup: 'O+'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
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
        setError(data.msg || 'Registration failed');
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
          <h2 className="text-3xl font-extrabold text-gray-900">Become a Donor</h2>
          <p className="mt-2 text-gray-500">Register to receive nearby blood requests</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" required 
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone or Email</label>
            <input 
              type="text" required 
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              value={formData.contactInfo} onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" required 
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (City)</label>
              <input 
                type="text" required 
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select 
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white"
                value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all mt-4"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already a donor? <Link to="/login" className="text-red-500 font-semibold hover:text-red-600">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
