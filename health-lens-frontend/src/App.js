import React, { useState, useEffect } from 'react';
import { Heart, FileText, Syringe, Target, MapPin, MessageSquare, Activity, LogOut, User, Menu, X, Plus, Trash2, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api'; // Change this to your backend URL

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
              { id: 'clinics', icon: MapPin, label: 'Nearby Clinics' },
              { id: 'chat', icon: MessageSquare, label: 'Health Chat' },
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
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
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
          {currentPage === 'clinics' && <Clinics clinics={clinics} />}
          {currentPage === 'chat' && <HealthChat chatHistory={chatHistory} setChatHistory={setChatHistory} token={token} />}
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
        setUser(data.user);
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
const FitnessGoals = ({ goal, setGoal, token }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(goal || {
    description: '',
    targetValue: '',
    unit: '',
    endDate: ''
  });

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
      <h2 className="text-3xl font-bold text-gray-800">Fitness Goals</h2>

      {!goal && !editing ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Target className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Fitness Goal Set</h3>
          <p className="text-gray-500 mb-6">Set a goal to track your fitness progress</p>
          <button
            onClick={() => setEditing(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Set Your Goal
          </button>
        </div>
      ) : editing ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">Set Fitness Goal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Goal Description (e.g., Run 5km daily)"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Target Value"
                value={formData.targetValue}
                onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Unit (e.g., km)"
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
              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                Save Goal
              </button>
              <button type="button" onClick={() => setEditing(false)} className="bg-gray-200 px-6 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{goal.description}</h3>
              <p className="text-gray-500">Target: {goal.targetValue} {goal.unit}</p>
              {goal.endDate && <p className="text-gray-500">End Date: {new Date(goal.endDate).toLocaleDateString()}</p>}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Edit Goal
            </button>
          </div>
          {goal.achieved ? (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Goal Achieved!</span>
            </div>
          ) : (
            <div className="bg-blue-100 text-blue-700 p-4 rounded-lg">
              <span className="font-semibold">Keep going! You're working towards your goal.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Clinics Component
const Clinics = ({ clinics }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Nearby Clinics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map(clinic => (
          <div key={clinic._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            <MapPin className="w-10 h-10 text-blue-500 mb-3" />
            <h3 className="font-bold text-lg mb-2">{clinic.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
            {clinic.contactNumber && (
              <p className="text-sm text-blue-600">📞 {clinic.contactNumber}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">{clinic.type}</p>
          </div>
        ))}
        {clinics.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No clinics found nearby
          </div>
        )}
      </div>
    </div>
  );
};

// Health Chat Component
const HealthChat = ({ chatHistory, setChatHistory, token }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMsg = { sender: 'user', text: message, timestamp: new Date() };
    const updatedHistory = [...chatHistory, newMsg];
    setChatHistory(updatedHistory);
    setMessage('');
    setSending(true);

    // Simulate bot response (you can integrate actual AI API here)
    setTimeout(() => {
      const botMsg = { sender: 'bot', text: 'Thank you for your message. I am here to help with your health queries!', timestamp: new Date() };
      const finalHistory = [...updatedHistory, botMsg];
      setChatHistory(finalHistory);
      
      // Save to backend
      fetch(`${API_URL}/chat/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: [newMsg, botMsg] })
      });
      
      setSending(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Health Assistant</h2>
      
      <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                <p>{msg.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <p className="text-gray-600">Typing...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your health..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Send
            </button>s
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthLensApp;