import React, { useState, useEffect } from 'react';
import { Heart, FileText, Syringe, Target, MapPin, MessageSquare, Activity, LogOut, User, Menu, X, Plus, Trash2, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api'; // Change this to your backend URL

// ✅ Add these helper functions here
function getMoodKey(progress) {
  if (progress === 0) return "very_low";
  if (progress > 0 && progress < 50) return "medium";
  if (progress >= 50 && progress < 90) return "high";
  if (progress >= 90) return "very_high";
}

function getMoodEmoji(progress) {
  if (progress === 0) return "😵‍💫";
  if (progress > 0 && progress < 25) return "😞";
  if (progress >= 25 && progress < 50) return "😕";
  if (progress >= 50 && progress < 75) return "😐";
  if (progress >= 75 && progress < 100) return "🙂";
  if (progress === 100) return "😄";
}


const HealthLensApp = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states
  const [reports, setReports] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [fitnessGoal, setFitnessGoal] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [reportsRes, diseasesRes, vaccinesRes, goalRes, clinicsRes, chatRes] = await Promise.all([
        fetch(`${API_URL}/reports`, { headers }),
        fetch(`${API_URL}/diseases`, { headers }),
        fetch(`${API_URL}/vaccinations`, { headers }),
        fetch(`${API_URL}/fitness/goal`, { headers }),
        fetch(`${API_URL}/clinics/nearby`, { headers }),
        fetch(`${API_URL}/chat`, { headers })
      ]);

      if (reportsRes.ok) setReports(await reportsRes.json());
      if (diseasesRes.ok) setDiseases(await diseasesRes.json());
      if (vaccinesRes.ok) setVaccinations(await vaccinesRes.json());
      if (goalRes.ok) setFitnessGoal(await goalRes.json());
      if (clinicsRes.ok) setClinics(await clinicsRes.json());
      if (chatRes.ok) {
        const data = await chatRes.json();
        setChatHistory(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!token) {
    return <AuthPage setToken={setToken} setUser={setUser} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Health Lens</h1>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Activity, label: 'Dashboard' },
              { id: 'reports', icon: FileText, label: 'Reports' },
              { id: 'diseases', icon: Heart, label: 'Diseases' },
              { id: 'vaccinations', icon: Syringe, label: 'Vaccinations' },
              { id: 'fitness', icon: Target, label: 'Fitness Goals' },
               { id: 'routine', icon: Calendar, label: 'Daily Routine' },
              { id: 'clinics', icon: MapPin, label: 'Nearby Clinics' },
              { id: 'chat', icon: MessageSquare, label: 'Health Chat' },{ id: 'profile', icon: User, label: 'Profile' },

            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id ? 'bg-white text-blue-600' : 'hover:bg-blue-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-6 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
           <div className="flex items-center gap-3">
  <button 
    onClick={() => setCurrentPage('profile')}
    className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition cursor-pointer"
  >
    <User className="w-6 h-6 text-white" />
  </button>
</div>

          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {currentPage === 'dashboard' && <Dashboard reports={reports} diseases={diseases} vaccinations={vaccinations} fitnessGoal={fitnessGoal} />}
          {currentPage === 'reports' && <Reports reports={reports} setReports={setReports} token={token} />}
          {currentPage === 'diseases' && <Diseases diseases={diseases} setDiseases={setDiseases} token={token} />}
          {currentPage === 'vaccinations' && <Vaccinations vaccinations={vaccinations} setVaccinations={setVaccinations} token={token} />}
          {currentPage === 'fitness' && <FitnessGoals goal={fitnessGoal} setGoal={setFitnessGoal} token={token} />}
          {currentPage === 'routine' && <DailyRoutine token={token} user={user} />}  
          {currentPage === 'clinics' && <Clinics clinics={clinics} />}
          {currentPage === 'chat' && <HealthChat chatHistory={chatHistory} setChatHistory={setChatHistory} token={token} />}
          {currentPage === 'profile' && <Profile token={token} user={user} setUser={setUser} />}

        </main>
      </div>
    </div>
  );
};

// Auth Page Component
const AuthPage = ({ setToken, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', height: '', weight: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        // Fetch full user profile including moodPhotos
  try {
    const userRes = await fetch(`${API_URL}/user/me`, {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
    const userData = await userRes.json();
    setUser(userData);  // now includes moodPhotos
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    setUser(data.user);  // fallback to login response user
  }
      } else {
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Health Lens</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              isLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />

          {!isLogin && (
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Height (cm)"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {error && (
            <div className={`p-3 rounded-lg ${error.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ reports, diseases, vaccinations, fitnessGoal }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileText} label="Total Reports" value={reports.length} color="blue" />
        <StatCard icon={Heart} label="Diseases Tracked" value={diseases.length} color="red" />
        <StatCard icon={Syringe} label="Vaccinations" value={vaccinations.length} color="green" />
        <StatCard icon={Target} label="Fitness Goal" value={fitnessGoal ? 'Active' : 'None'} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Recent Reports
          </h3>
          {reports.slice(0, 5).map((report, idx) => (
            <div key={idx} className="flex justify-between items-center py-3 border-b last:border-b-0">
              <div>
                <p className="font-semibold">{report.type}</p>
                <p className="text-sm text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
              </div>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
          ))}
          {reports.length === 0 && <p className="text-gray-500 text-center py-4">No reports yet</p>}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            Upcoming Vaccinations
          </h3>
          {vaccinations.slice(0, 5).map((vac, idx) => (
            <div key={idx} className="flex justify-between items-center py-3 border-b last:border-b-0">
              <div>
                <p className="font-semibold">{vac.name}</p>
                <p className="text-sm text-gray-500">{new Date(vac.renewalDate || vac.date).toLocaleDateString()}</p>
              </div>
              <Syringe className="w-5 h-5 text-gray-400" />
            </div>
          ))}
          {vaccinations.length === 0 && <p className="text-gray-500 text-center py-4">No vaccinations recorded</p>}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`${colors[color]} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Reports Component
const Reports = ({ reports, setReports, token }) => {
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    values: {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/reports/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const newReport = await res.json();
        setReports([newReport, ...reports]);
        setShowForm(false);
        setFormData({ type: '', date: new Date().toISOString().split('T')[0], values: {} });
        setOcrResult(null);
      }
    } catch (err) {
      console.error('Error uploading report:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const res = await fetch(`${API_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setReports(reports.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setOcrResult(null);

    const formDataObj = new FormData();
    formDataObj.append('image', file);

    try {
      const res = await fetch(`${API_URL}/ocr/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      const data = await res.json();

      if (res.ok) {
        setOcrResult(data);
        setFormData({
          ...formData,
          type: formData.type || 'Blood Test',
          values: data.extractedData || {}
        });
      } else {
        alert('Failed to extract text: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Error: Make sure backend is running on port 5000');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Health Reports</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add Report
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">New Report</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type + date */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Report Type (e.g., Blood Test)"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* OCR Scan Button */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="file"
                id="ocr-upload"
                accept="image/*,application/pdf"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
              <label
                htmlFor="ocr-upload"
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold cursor-pointer transition ${
                  uploadingImage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                {uploadingImage ? 'Scanning...' : 'Scan Report'}
              </label>
              <span className="text-sm text-gray-600">
                Click to upload and scan a medical report image or PDF
              </span>
            </div>

            {/* Processing indicator */}
            {uploadingImage && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Processing file...</p>
                  <p className="text-xs text-gray-500">Extracting text using OCR technology</p>
                </div>
              </div>
            )

            }

            {/* OCR result: values + warnings + overall status */}
            {ocrResult && (
              <div className="space-y-3">
                {/* Scan summary + detected values */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-green-700 font-semibold mb-2">✓ Scan Complete!</p>
                      <p className="text-sm text-gray-600 mb-3">
                        Extracted {Object.keys(ocrResult.extractedData || {}).length} values from the report
                      </p>

                      {/* Show Raw Text */}
                      {ocrResult.rawText && (
                        <details className="mb-3">
                          <summary className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700">
                            📄 View extracted text
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded text-xs max-h-40 overflow-y-auto border border-gray-200">
                            <pre className="whitespace-pre-wrap font-mono">{ocrResult.rawText}</pre>
                          </div>
                        </details>
                      )}

                      {/* Detected values */}
                      {Object.keys(ocrResult.extractedData || {}).length > 0 ? (
                        <div className="bg-white p-3 rounded border border-green-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">✅ Detected Values:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(ocrResult.extractedData).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                <span className="text-gray-600 font-medium">{key}:</span>
                                <span className="font-semibold text-gray-800">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                          <p className="text-xs text-yellow-800 font-medium">
                            ⚠️ No medical values auto-detected.
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Click "View extracted text" above to see what was read, or manually enter values below.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Health warnings */}
                {ocrResult.healthWarnings && ocrResult.healthWarnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="font-bold text-yellow-800 mb-2">⚠️ Health Alerts</h4>
                        <div className="space-y-2">
                          {ocrResult.healthWarnings.map((warning, index) => (
                            <div key={index} className="p-2 bg-yellow-100 rounded border-l-4 border-yellow-500">
                              <p className="text-sm text-yellow-900">{warning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overall status */}
                {ocrResult.overallStatus && (
                  <div
                    className={`p-3 rounded-lg border text-center font-bold text-sm ${
                      ocrResult.healthWarnings && ocrResult.healthWarnings.length > 0
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                        : 'bg-green-50 border-green-300 text-green-800'
                    }`}
                  >
                    {ocrResult.overallStatus}
                  </div>
                )}
              </div>
            )}

            {/* Manual JSON edit */}
            <textarea
              placeholder='Report Values (JSON format, e.g., {"RBC": "4.5", "WBC": "7000"})'
              value={JSON.stringify(formData.values)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, values: JSON.parse(e.target.value) });
                } catch {}
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="4"
            />

            {/* Buttons */}
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Save Report
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setOcrResult(null); }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Saved reports grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map(report => (
          <div key={report._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{report.type}</h3>
                <p className="text-sm text-gray-500">{new Date(report.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(report._id)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(report.values).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Diseases Component
const Diseases = ({ diseases, setDiseases, token }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Disease Tracking</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseases.map(disease => (
          <div key={disease._id} className="bg-white rounded-xl shadow-sm p-6">
            <Heart className="w-10 h-10 text-red-500 mb-3" />
            <h3 className="font-bold text-lg mb-2">{disease.diseaseId?.name || 'Unknown'}</h3>
            <p className="text-sm text-gray-500">Diagnosed: {new Date(disease.diagnosedDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600 mt-2">Type: {disease.type}</p>
          </div>
        ))}
        {diseases.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No diseases tracked yet
          </div>
        )}
      </div>
    </div>
  );
};

// Vaccinations Component
const Vaccinations = ({ vaccinations, setVaccinations, token }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    renewalDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${API_URL}/vaccinations/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const newVac = await res.json();
        setVaccinations([...vaccinations, newVac]);
        setShowForm(false);
        setFormData({ name: '', date: new Date().toISOString().split('T')[0], renewalDate: '' });
      }
    } catch (err) {
      console.error('Error adding vaccination:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Vaccinations</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Add Vaccination
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">New Vaccination</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Vaccine Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Date Administered</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Renewal Date (Optional)</label>
                <input
                  type="date"
                  value={formData.renewalDate}
                  onChange={(e) => setFormData({...formData, renewalDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Save
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaccinations.map(vac => (
          <div key={vac._id} className="bg-white rounded-xl shadow-sm p-6">
            <Syringe className="w-10 h-10 text-green-500 mb-3" />
            <h3 className="font-bold text-lg mb-2">{vac.name}</h3>
            <p className="text-sm text-gray-500">Date: {new Date(vac.date).toLocaleDateString()}</p>
            {vac.renewalDate && (
              <p className="text-sm text-gray-600 mt-1">Renewal: {new Date(vac.renewalDate).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Fitness Goals Component

// Daily Routine Component
const DailyRoutine = ({ diseases, token }) => {
  const [routine, setRoutine] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutine();
  }, [diseases]);

  const fetchRoutine = async () => {
    try {
      const res = await fetch(`${API_URL}/routine`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRoutine(data);
      }
    } catch (err) {
      console.error('Error fetching routine:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading routine...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">📅 Daily Routine</h2>

      {routine.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Routine Generated</h3>
          <p className="text-gray-500">Add diseases to generate personalized daily tasks</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {routine.map((task, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{task.task}</h3>
                  <p className="text-gray-600 text-sm mt-1">{task.time}</p>
                  {task.notes && (
                    <p className="text-gray-500 text-sm mt-2 italic">{task.notes}</p>
                  )}
                </div>
                <button className="text-green-500 hover:text-green-700">
                  <CheckCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// Nearby Clinics Component
const Clinics = ({ clinics, token }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">📍 Nearby Clinics</h2>

      {clinics.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Clinics Found</h3>
          <p className="text-gray-500">Search for clinics near you</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clinics.map((clinic, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg">{clinic.name}</h3>
              <p className="text-gray-600">{clinic.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Health Chat Component
const HealthChat = ({ chatHistory, setChatHistory, token }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', content: message };
    setChatHistory([...chatHistory, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">💬 Health Chat</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 h-96 overflow-y-auto">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-gray-500">Typing...</div>}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a health question..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Profile Component
const Profile = ({ user, token }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">👤 Profile</h2>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold">{user?.name}</h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Member since</p>
            <p className="font-semibold">2025</p>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Health Score</p>
            <p className="font-semibold text-green-600">85/100</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Fitness Goals Component with 3 Wellness Pillars
// Enhanced Fitness Goals Component with Activity Selection, Food Tracking & Meditation
const FitnessGoals = ({ goal, setGoal, token }) => {
  const [editing, setEditing] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showFoodTracker, setShowFoodTracker] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [formData, setFormData] = useState(goal || {
    description: '',
    targetValue: '',
    unit: '',
    endDate: ''
  });

  // Fitness Activities
  const fitnessActivities = [
    { name: 'Running', emoji: '🏃', calories: '300-600', duration: '30 min' },
    { name: 'Jogging', emoji: '🏃‍♀️', calories: '200-400', duration: '30 min' },
    { name: 'Cycling', emoji: '🚴', calories: '250-500', duration: '30 min' },
    { name: 'Swimming', emoji: '🏊', calories: '400-700', duration: '30 min' },
    { name: 'Yoga', emoji: '🧘‍♀️', calories: '150-300', duration: '45 min' },
    { name: 'Gym', emoji: '🏋️', calories: '300-600', duration: '60 min' },
    { name: 'Walking', emoji: '🚶', calories: '150-250', duration: '30 min' },
    { name: 'Dancing', emoji: '💃', calories: '200-400', duration: '30 min' },
    { name: 'Jump Rope', emoji: '🤸', calories: '350-500', duration: '20 min' },
    { name: 'Hiking', emoji: '🥾', calories: '400-600', duration: '60 min' },
  ];

  // Food Categories
  const foodCategories = [
    { name: 'Breakfast', emoji: '🍳', items: ['Oatmeal', 'Eggs', 'Toast', 'Smoothie', 'Cereal'] },
    { name: 'Lunch', emoji: '🍱', items: ['Rice Bowl', 'Salad', 'Sandwich', 'Pasta', 'Soup'] },
    { name: 'Dinner', emoji: '🍽️', items: ['Chicken', 'Fish', 'Vegetables', 'Curry', 'Steak'] },
    { name: 'Snacks', emoji: '🍎', items: ['Fruits', 'Nuts', 'Yogurt', 'Protein Bar', 'Chips'] },
    { name: 'Drinks', emoji: '🥤', items: ['Water', 'Juice', 'Coffee', 'Tea', 'Smoothie'] },
  ];

  // Meditation Types
  const meditationTypes = [
    { name: 'Breathing', emoji: '🌬️', duration: '5 min', benefit: 'Reduces stress' },
    { name: 'Mindfulness', emoji: '🧠', duration: '10 min', benefit: 'Improves focus' },
    { name: 'Body Scan', emoji: '🧘', duration: '15 min', benefit: 'Relaxes muscles' },
    { name: 'Sleep', emoji: '😴', duration: '20 min', benefit: 'Better sleep' },
    { name: 'Gratitude', emoji: '🙏', duration: '5 min', benefit: 'Positive mood' },
    { name: 'Visualization', emoji: '✨', duration: '10 min', benefit: 'Clarity' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/fitness/goal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updated = await res.json();
        setGoal(updated);
        setEditing(false);
      }
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">🏥 Your Wellness Journey</h2>
      <p className="text-gray-600">Track all aspects of your health in one place</p>

      {/* 3-Card Wellness Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Fitness Card */}
        <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl">💪</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-100">Progress</p>
              <p className="text-2xl font-bold">{goal ? '50%' : '0%'}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">FITNESS</h3>
          <p className="text-orange-100 text-sm mb-4">
            {goal ? goal.description : 'Choose your workout activity'}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${i <= 2 ? 'bg-white' : 'bg-white bg-opacity-30'}`}></div>
              ))}
            </div>
            <button 
              onClick={() => setShowActivities(true)}
              className="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition"
            >
              Set Goal →
            </button>
          </div>
        </div>

        {/* Diet/Nutrition Card */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🍎</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100">Calories</p>
              <p className="text-2xl font-bold">0%</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">NUTRITION</h3>
          <p className="text-green-100 text-sm mb-4">
            Track your daily meals and calories
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-white bg-opacity-30"></div>
              ))}
            </div>
            <button 
              onClick={() => setShowFoodTracker(true)}
              className="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition"
            >
              Track Now →
            </button>
          </div>
        </div>

        {/* Mental Wellness Card */}
        <div className="bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🧘</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100">Mood</p>
              <p className="text-2xl font-bold">😌</p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">MINDFULNESS</h3>
          <p className="text-purple-100 text-sm mb-4">
            Meditation, sleep & mental health
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-white bg-opacity-30"></div>
              ))}
            </div>
            <button 
              onClick={() => setShowMeditation(true)}
              className="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition"
            >
              Meditate →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4">📊 Wellness Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-500">0</p>
            <p className="text-sm text-gray-600">Workouts this week</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-green-500">0</p>
            <p className="text-sm text-gray-600">Calories tracked</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-500">0</p>
            <p className="text-sm text-gray-600">Meditation streak</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-500">--</p>
            <p className="text-sm text-gray-600">Sleep quality</p>
          </div>
        </div>
      </div>

      {/* Activity Selection Modal */}
      {showActivities && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">💪 Choose Your Activity</h3>
              <button onClick={() => setShowActivities(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {fitnessActivities.map((activity, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setFormData({...formData, description: activity.name});
                    setShowActivities(false);
                    setEditing(true);
                  }}
                  className="bg-orange-50 rounded-xl p-4 text-center cursor-pointer hover:bg-orange-100 transition transform hover:scale-105"
                >
                  <div className="text-5xl mb-2">{activity.emoji}</div>
                  <h4 className="font-bold text-gray-800">{activity.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{activity.duration}</p>
                  <p className="text-xs text-orange-600 font-semibold">{activity.calories} cal</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Food Tracker Modal */}
      {showFoodTracker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">🍎 Track Your Food</h3>
              <button onClick={() => setShowFoodTracker(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {foodCategories.map((category, idx) => (
                <div key={idx} className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="text-2xl">{category.emoji}</span>
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {category.items.map((item, i) => (
                      <button
                        key={i}
                        className="bg-white rounded-lg p-3 text-center hover:bg-green-100 transition border border-green-200"
                      >
                        <p className="text-sm font-semibold text-gray-800">{item}</p>
                        <p className="text-xs text-gray-500 mt-1">Add +</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Meditation Modal */}
      {showMeditation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">🧘 Choose Meditation</h3>
              <button onClick={() => setShowMeditation(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meditationTypes.map((type, idx) => (
                <div 
                  key={idx}
                  className="bg-purple-50 rounded-xl p-6 cursor-pointer hover:bg-purple-100 transition transform hover:scale-105"
                >
                  <div className="text-5xl mb-3 text-center">{type.emoji}</div>
                  <h4 className="font-bold text-center text-gray-800 mb-2">{type.name}</h4>
                  <p className="text-sm text-center text-purple-600 font-semibold mb-1">{type.duration}</p>
                  <p className="text-xs text-center text-gray-600">{type.benefit}</p>
                  <button className="w-full mt-3 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fitness Goal Editor (Modal) */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Set Fitness Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Goal Description (e.g., Running)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Target"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
                  Save Goal
                </button>
                <button type="button" onClick={() => setEditing(false)} className="flex-1 bg-gray-200 px-6 py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Motivational Tip */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm font-semibold text-blue-800">💡 Quick Tip</p>
        <p className="text-sm text-blue-700 mt-1">
          Set specific, measurable goals for better results. Track your progress in Daily Routine!
        </p>
      </div>
    </div>
  );
};



export default HealthLensApp;