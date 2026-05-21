import { useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, Activity, Search } from 'lucide-react';

const Home = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  
  // Tracking state
  const [searchId, setSearchId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/requests/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setSuccess(true);
        setTrackingId(data.request._id);
        setFile(null);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    setTrackError('');
    setTrackResult(null);
    try {
      const res = await fetch(`http://localhost:5000/api/requests/track/${searchId}`);
      if (res.ok) {
        const data = await res.json();
        setTrackResult(data);
      } else {
        setTrackError('Request not found. Please check your Tracking ID.');
      }
    } catch (err) {
      setTrackError('Error connecting to server.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Every drop counts. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">
            Be someone's hero today.
          </span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Upload a blood requirement document (prescription, lab report) to instantly notify potential donors in your area. 
          Our system automatically matches and alerts registered heroes nearby.
        </p>
      </div>

      {/* Upload Section */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl shadow-red-100/50 p-8 md:p-12 border border-red-50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Request Blood</h2>
          <p className="text-gray-500 mt-2">Upload your requirement document (PDF, JPG, PNG, CSV)</p>
        </div>

        <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-500 ${file ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-300 bg-gray-50'}`}>
          {!success && (
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          )}
          
          {!file && !success && (
            <div className="flex flex-col items-center pointer-events-none">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium text-lg">Click to browse or drag and drop</p>
              <p className="text-gray-500 text-sm mt-2">Maximum file size: 10MB</p>
            </div>
          )}

          {file && !success && (
            <div className="flex flex-col items-center pointer-events-none">
              <FileText className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-700 font-medium text-lg">{file.name}</p>
              <p className="text-red-500 text-sm mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center pointer-events-none text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-green-700 font-bold text-xl">Upload Successful!</p>
              <p className="text-green-600 mt-2">Donors in your area have been notified.</p>
              <div className="mt-6 bg-white border border-green-200 p-4 rounded-xl shadow-sm w-full max-w-sm pointer-events-auto">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Your Tracking ID</p>
                <p className="text-lg font-mono text-gray-900 bg-gray-50 py-2 rounded-lg select-all">{trackingId}</p>
                <p className="text-xs text-gray-400 mt-2 mb-4">Save this ID to track your request status.</p>
                <button 
                  onClick={(e) => {
                    setSearchId(trackingId);
                    handleTrack(e);
                    // smooth scroll down to track section
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" /> View Status Now
                </button>
              </div>
            </div>
          )}
        </div>

        {!success && (
          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${
                !file || uploading 
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 hover:shadow-red-500/30 hover:-translate-y-0.5'
              }`}
            >
              {uploading ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        )}
      </div>

      {/* Tracking Section */}
      <div className="max-w-2xl mx-auto mt-12 bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Search className="w-6 h-6 text-red-500" /> Track Request
        </h2>
        <form onSubmit={handleTrack} className="flex gap-4 mb-6">
          <input 
            type="text"
            placeholder="Enter Tracking ID"
            className="flex-grow px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-mono"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Track
          </button>
        </form>

        {trackError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium animate-pulse">
            {trackError}
          </div>
        )}

        {trackResult && (
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-2xl shadow-red-100/50 transform transition-all duration-500 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
              <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Live Status</span>
              <span className={`px-6 py-2 rounded-full text-sm font-bold shadow-sm transition-all duration-300 ${
                trackResult.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 shadow-yellow-100 animate-pulse' :
                trackResult.status === 'Accepted' ? 'bg-orange-100 text-orange-800 shadow-orange-100' :
                'bg-green-100 text-green-800 shadow-green-100'
              }`}>
                {trackResult.status === 'Pending' && <Activity className="w-4 h-4 inline mr-2 -mt-0.5" />}
                {trackResult.status === 'Accepted' && <CheckCircle2 className="w-4 h-4 inline mr-2 -mt-0.5" />}
                {trackResult.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Hospital Name</p>
                <p className="font-semibold text-gray-900">{trackResult.hospitalName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Hospital Address</p>
                <p className="font-semibold text-gray-900">{trackResult.hospitalAddress}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Contact Person</p>
                <p className="font-semibold text-gray-900">{trackResult.contactPerson}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl">
                <p className="text-xs text-red-400 uppercase font-bold tracking-wider mb-2">Blood Required</p>
                <p className="font-semibold text-lg text-gray-900">{trackResult.unitsRequired} Units of <span className="text-red-600 font-bold text-xl">{trackResult.bloodGroupRequired}</span></p>
              </div>
              {trackResult.priority && (
                <div className="col-span-1 md:col-span-2 bg-orange-50 p-4 rounded-2xl">
                  <p className="text-xs text-orange-600 uppercase font-bold tracking-wider mb-2">Priority Level</p>
                  <p className="font-bold text-orange-700 text-lg">{trackResult.priority}</p>
                </div>
              )}
            </div>
            {trackResult.status === 'Accepted' && (
              <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100 shadow-inner">
                <p className="text-red-800 font-bold flex items-center gap-3 text-lg">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-200">
                    <CheckCircle2 className="w-5 h-5 text-red-600" />
                  </span>
                  A hero has accepted your request!
                </p>
                <p className="text-red-600 mt-2 ml-11 font-medium">Please ensure the hospital point of contact is ready to receive the donor.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
