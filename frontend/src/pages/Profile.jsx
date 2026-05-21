import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, Clock, MapPin, User, LogOut } from 'lucide-react';

const Profile = () => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [matchingIdInput, setMatchingIdInput] = useState('');
  const [completionMessage, setCompletionMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchNotifications(token);
  }, [navigate]);

  const fetchNotifications = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/requests/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/requests/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Request Accepted! Your Matching ID is: ${data.matchingId}`);
        fetchNotifications(token); // Refresh
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/requests/complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ matchingId: matchingIdInput })
      });
      const data = await res.json();
      if (res.ok) {
        setCompletionMessage('Donation verified! Thank you for saving a life.');
        setMatchingIdInput('');
        fetchNotifications(token); // Refresh
      } else {
        setCompletionMessage(data.msg);
      }
    } catch (err) {
      console.error(err);
      setCompletionMessage('Server Error');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hello, {user.name}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {user.location} | Blood Group: <span className="font-bold text-red-500">{user.bloodGroup}</span>
          </p>
        </div>
        <button onClick={logout} className="text-gray-500 hover:text-red-500 flex items-center gap-2 transition-colors">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notifications Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-500" /> Notifications & Requests
          </h2>
          
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-500">No new requests in your area.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-gray-800 text-lg mb-4">{notif.message}</p>
                {notif.requestId && notif.requestId.status === 'Pending' && (
                  <button 
                    onClick={() => handleAccept(notif.requestId._id)}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-md shadow-red-500/20"
                  >
                    Accept Request
                  </button>
                )}
                {notif.requestId && notif.requestId.status === 'Accepted' && notif.requestId.donorId === user.id && (
                  <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="text-orange-800 font-semibold flex items-center gap-2"><Clock className="w-4 h-4"/> Accepted</p>
                      <p className="text-sm text-orange-600 mt-1">Please head to the hospital. Your Matching ID: <span className="font-bold">{notif.requestId.matchingId}</span></p>
                    </div>
                  </div>
                )}
                 {notif.requestId && notif.requestId.status === 'Completed' && (
                  <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-semibold">Completed</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Verification Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl shadow-red-100/30">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" /> Verify Donation
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Once you have reached the location and completed the donation, ask the receiver for the Matching ID or use yours to verify completion.
            </p>
            
            <form onSubmit={handleComplete}>
              <input 
                type="text" 
                required 
                placeholder="Enter Matching ID (e.g., A1B2C3)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all uppercase tracking-widest text-center font-bold mb-4"
                value={matchingIdInput}
                onChange={(e) => setMatchingIdInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all"
              >
                Confirm Donation
              </button>
            </form>

            {completionMessage && (
              <div className="mt-4 p-3 rounded-lg bg-gray-50 text-center text-sm font-medium text-gray-700 border border-gray-200">
                {completionMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
