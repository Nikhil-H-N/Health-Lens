import React, { useState, useEffect, useRef } from "react";
import { Heart, FileText, Syringe, Target, MapPin, MessageSquare, Activity, LogOut, User, Menu, X, Plus, Trash2, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import ReactMarkdown from "react-markdown";


// ================= FOOD MASTER DATA =================
// Base calories per standard serving (grams)
const FOOD_DATA = {
  Breakfast: {
    Oatmeal: { calories: 150, grams: 40 },
    Eggs: { calories: 155, grams: 100 },
    Toast: { calories: 80, grams: 30 },
    Smoothie: { calories: 180, grams: 250 },
    Cereal: { calories: 120, grams: 30 }
  },

  Lunch: {
    "Rice Bowl": { calories: 200, grams: 150 },
    Salad: { calories: 120, grams: 200 },
    Sandwich: { calories: 300, grams: 180 },
    Pasta: { calories: 450, grams: 150 },
    Soup: { calories: 150, grams: 250 }
  },

  Dinner: {
    Chicken: { calories: 250, grams: 150 },
    Fish: { calories: 220, grams: 150 },
    Vegetables: { calories: 100, grams: 200 },
    Curry: { calories: 300, grams: 200 },
    Steak: { calories: 350, grams: 180 }
  },

  Snacks: {
    Fruits: { calories: 100, grams: 150 },
    Nuts: { calories: 180, grams: 30 },
    Yogurt: { calories: 120, grams: 100 },
    "Protein Bar": { calories: 200, grams: 60 },
    Chips: { calories: 160, grams: 30 }
  },

  Drinks: {
    Water: { calories: 0, grams: 250 },
    Juice: { calories: 120, grams: 250 },
    Coffee: { calories: 5, grams: 200 },
    Tea: { calories: 2, grams: 200 },
    Smoothie: { calories: 180, grams: 250 }
  }
};

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
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };


      const [reportsRes, diseasesRes, vaccinesRes, goalRes, clinicsRes, chatRes] =
        await Promise.all([
          fetch(`${API_URL}/reports`, { headers }),
          fetch(`${API_URL}/diseases`, { headers }),        // ✅ FIXED
          fetch(`${API_URL}/vaccination`, { headers }),    // ✅ FIXED
          fetch(`${API_URL}/fitness/goal`, { headers }),   // ✅ OK
          fetch(`${API_URL}/clinics`, { headers }),        // ✅ FIXED
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
              { id: 'chat', icon: MessageSquare, label: 'Health Chat' }, { id: 'profile', icon: User, label: 'Profile' },

            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === item.id ? 'bg-white text-blue-600' : 'hover:bg-blue-700'
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
          {currentPage === 'dashboard' && <Dashboard reports={reports} diseases={diseases} vaccinations={vaccinations} setVaccinations={setVaccinations} fitnessGoal={fitnessGoal} />}
          {currentPage === 'reports' && <Reports reports={reports} setReports={setReports} token={token} />}
          {currentPage === 'diseases' && <Diseases diseases={diseases} setDiseases={setDiseases} token={token} />}
          {currentPage === 'vaccinations' && <Vaccinations vaccinations={vaccinations} setVaccinations={setVaccinations} token={token} />}
          {currentPage === 'fitness' && <FitnessGoals goal={fitnessGoal} setGoal={setFitnessGoal} token={token} />}
          {currentPage === 'routine' && <DailyRoutine token={token} user={user} />}
          {currentPage === 'clinics' && <NearbyClinics />}
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
            className={`flex-1 py-2 rounded-lg font-semibold transition ${isLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${!isLogin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />

          {!isLogin && (
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Height (cm)"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
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
const Dashboard = ({ reports, diseases, vaccinations, setVaccinations, fitnessGoal }) => {
  const [updatingId, setUpdatingId] = useState(null);

  const handleRenew = async (vacId) => {
    try {
      // 🔹 mark as updating
      setUpdatingId(vacId);

      const res = await fetch(
        `${API_URL}/vaccination/${vacId}/renew`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (!res.ok) {
        setUpdatingId(null);
        return;
      }

      const updatedVaccination = await res.json();

      // ⏳ wait 5 seconds before removing from Upcoming
      setTimeout(() => {
        setVaccinations(prev =>
          prev.map(v =>
            v._id === updatedVaccination._id ? updatedVaccination : v
          )
        );

        // 🔹 clear updating state
        setUpdatingId(null);
      }, 5000);
    } catch (err) {
      console.error("Renew failed", err);
      setUpdatingId(null);
    }
  };

  // ✅ STEP 2A: filter only vaccinations with renewal date
  const upcomingVaccinations = vaccinations
    .filter(
      v =>
        v.nextDueDate &&            // has renewal date
        v.renewalCompleted !== true // ❌ not renewed
    )
    .sort(
      (a, b) =>
        new Date(a.nextDueDate) - new Date(b.nextDueDate)
    );
  const isOverdue = (vac) => {
    if (!vac.nextDueDate) return false;
    if (vac.renewalCompleted) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(vac.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  };
  const canRenew = (vac) => {
    if (!vac.nextDueDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(vac.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);

    // ✅ allow on or after renewal date
    return today >= dueDate;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={FileText} label="Total Reports" value={reports.length} color="blue" />
        <StatCard icon={Heart} label="Diseases Tracked" value={diseases.length} color="red" />
        <StatCard icon={Syringe} label="Vaccinations" value={vaccinations.length} color="green" />
        <StatCard icon={Target} label="Fitness Goal" value={!fitnessGoal ? "None" : fitnessGoal.status === "completed" ? "Completed" : "Active"} color="purple" />
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
          {upcomingVaccinations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No upcoming vaccinations
            </p>
          ) : (
            upcomingVaccinations.map((vac, idx) => (
              <div
                key={vac._id}
                className="flex justify-between items-center py-3 border-b last:border-b-0"
              >
                <div>
                  <p className="font-semibold">
                    {idx + 1}. {vac.vaccineName}
                  </p>

                  <p
                    className={`text-sm ${isOverdue(vac) ? "text-red-600 font-semibold" : "text-gray-500"
                      }`}
                  >
                    {new Date(vac.nextDueDate).toLocaleDateString()}
                    {isOverdue(vac) && " (Overdue)"}
                  </p>
                </div>

                {/* ✅ RENEW CHECKBOX */}
                {updatingId === vac._id ? (
                  <span className="text-sm text-blue-600 font-medium">
                    Updating…
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    checked={false}
                    disabled={!canRenew(vac)}
                    onChange={() => handleRenew(vac._id)}
                    className={`w-5 h-5 accent-green-600 ${canRenew(vac)
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-50"
                      }`}
                    title={
                      canRenew(vac)
                        ? "Mark as renewed"
                        : "You can mark this only on or after the renewal date"
                    }
                  />
                )}

              </div>

            ))
          )}
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
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    values: {},
    suggestions: [],                        // AI health warnings
    abnormalParameters: [],                 // Optional (future use)
    overallStatus: ''                       // Summary text
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
        body: JSON.stringify({
          type: formData.type,
          date: formData.date,
          values: formData.values,
          suggestions: ocrResult?.healthWarnings || []
        })

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;

    const res = await fetch(`${API_URL}/reports/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      setReports(prev => prev.filter(r => r._id !== id));
    }
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setOcrResult(null);

    const formDataObj = new FormData();
    formDataObj.append('image', file);
    formDataObj.append("reportType", formData.type);

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

        setFormData((prev) => ({
          ...prev,
          // ❌ do NOT auto-set report type
          values: data.extractedData || {},
          suggestions: data.healthWarnings || [],
          abnormalParameters: data.abnormalParameters || [],
          overallStatus: data.overallStatus || ""
        }));

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Report Type</option>
                  <option value="Blood">Blood Report</option>
                  <option value="Urine">Urine Report</option>
                </select>
              </div>

              {/* Report Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Date (Date Received)
                </label>
                <input
                  type="date"
                  value={formData.date}
                  max={new Date().toISOString().split("T")[0]} // ⛔ future dates blocked
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
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
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold cursor-pointer transition ${uploadingImage
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
            {/* 🔍 OCR Preview Section (Shown after scan) */}
            {ocrResult && (
              <div className="mt-6 space-y-4">

                {/* Overall Status */}
                {formData.overallStatus && (
                  <div className="p-4 rounded-lg border text-sm font-semibold
                                  bg-green-50 border-green-300 text-green-800">
                    {formData.overallStatus}
                  </div>
                )}

                {/* Extracted Values */}
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">
                    📊 Extracted Report Values
                  </h4>

                  {Object.keys(formData.values).length === 0 ? (
                    <p className="text-sm text-gray-500">No values detected</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(formData.values).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded border"
                        >
                          <span className="font-medium text-gray-700">{key}</span>
                          <span className="text-sm text-gray-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Abnormalities / Warnings */}
                {formData.suggestions.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-800 mb-2">
                      ⚠️ Abnormal Findings
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-900">
                      {formData.suggestions.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}

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
                    className={`p-3 rounded-lg border text-center font-bold text-sm ${ocrResult.healthWarnings && ocrResult.healthWarnings.length > 0
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                      : 'bg-green-50 border-green-300 text-green-800'
                      }`}
                  >
                    {ocrResult.overallStatus}
                  </div>
                )}
              </div>
            )}



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
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-4 py-2 rounded-lg ${filterType === "ALL" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
        >
          All
        </button>

        <button
          onClick={() => setFilterType("Blood")}
          className={`px-4 py-2 rounded-lg ${filterType === "Blood" ? "bg-red-600 text-white" : "bg-gray-200"
            }`}
        >
          Blood Reports
        </button>

        <button
          onClick={() => setFilterType("Urine")}
          className={`px-4 py-2 rounded-lg ${filterType === "Urine" ? "bg-yellow-600 text-white" : "bg-gray-200"
            }`}
        >
          Urine Reports
        </button>
      </div>

      {/* Saved reports grid (SUMMARY VIEW ONLY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports
          .filter(report => {
            if (filterType === "ALL") return true;
            if (filterType === "Blood") return report.type.toLowerCase().includes("blood");
            if (filterType === "Urine") return report.type.toLowerCase().includes("urine");
            return true;
          })
          .map(report => (
            <div
              key={report._id}
              onClick={() => setSelectedReport(report)}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{report.type}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-1 text-gray-600">
                    Status: {report.suggestions?.length > 0
                      ? `⚠ ${report.suggestions.length} abnormality(s)`
                      : "✅ Normal"}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 IMPORTANT: prevents modal opening
                    handleDelete(report._id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <p
                className={`text-sm font-semibold ${report.suggestions?.length > 0
                  ? "text-yellow-600"
                  : "text-green-600"
                  }`}
              >
                {report.suggestions?.length > 0
                  ? `⚠ ${report.suggestions.length} abnormalities`
                  : "✅ All parameters normal"}
              </p>
            </div>
          ))
        }
      </div>
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-1">
              {selectedReport.type}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {new Date(selectedReport.date).toLocaleDateString()}
            </p>

            {/* Extracted Values */}
            <div className="space-y-2">
              {Object.entries(selectedReport.values).map(([key, value]) => {
                const isAbnormal =
                  selectedReport.abnormalParameters?.includes(key);

                return (
                  <div
                    key={key}
                    className={`flex justify-between py-1 text-sm border-b ${isAbnormal
                      ? "text-red-600 font-semibold"
                      : "text-gray-700"
                      }`}
                  >
                    <span>{key}</span>
                    <span>{value}</span>
                  </div>
                );
              })}
            </div>

            {/* Warnings */}
            {selectedReport.suggestions?.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded">
                <h4 className="font-bold text-yellow-800 mb-2">⚠ Warnings</h4>
                <ul className="list-disc ml-4 text-sm text-yellow-700">
                  {selectedReport.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setSelectedReport(null)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Diseases Component
const Diseases = ({ diseases, setDiseases, token }) => {
  const [diseaseType, setDiseaseType] = useState("");
  const [availableDiseases, setAvailableDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState("");
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null);


  const fetchDiseasesByType = async (type) => {
    console.log("Fetching diseases for type:", type);

    const res = await fetch(`/api/diseases/list/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const text = await res.text();   // ✅ read raw response
    console.log("Raw response from backend:", text);

    try {
      const data = JSON.parse(text); // ✅ try parsing JSON
      setAvailableDiseases(data);
    } catch (err) {
      console.error("JSON parse failed. Backend did NOT return JSON.");
    }
  };


  const trackDisease = async () => {
    if (!diseaseType || !selectedDisease || !diagnosedDate) {
      alert("Please select disease type, disease, and date");
      return;
    }
    const res = await fetch("/api/diseases/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        diseaseId: selectedDisease,
        diagnosedDate,
        diseaseType
      })
    });

    if (res.ok) {
      fetchUserDiseases(); // refresh list
      setSelectedDisease("");
      setDiseaseType("");
      setDiagnosedDate("");
    }
  };

  const fetchUserDiseases = async () => {
    const res = await fetch("/api/diseases", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    setDiseases(data);
  };
  const resolveDisease = async (id) => {
    try {
      const res = await fetch(`${API_URL}/diseases/resolve/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        // remove from UI
        setDiseases(prev => prev.filter(d => d._id !== id));
      }
    } catch (err) {
      console.error("Failed to resolve disease", err);
    }
  };


  useEffect(() => {
    fetchUserDiseases();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Disease Tracking</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-lg">Track New Disease</h3>

        {/* Disease Type */}
        <select
          value={diseaseType}
          onChange={(e) => {
            const type = e.target.value;
            setDiseaseType(type);
            setSelectedDisease("");
            setAvailableDiseases([]);
            if (type) fetchDiseasesByType(type);
          }}

          className="w-full border px-4 py-2 rounded"
        >
          <option value="">Select Disease Type</option>
          <option value="Acute">Acute</option>
          <option value="Chronic">Chronic</option>
        </select>

        {/* Disease Name */}
        {availableDiseases.length > 0 && (
          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select Disease</option>
            {availableDiseases.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        )}

        {/* Diagnosed Date */}
        <input
          type="date"
          value={diagnosedDate}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDiagnosedDate(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        <button
          onClick={trackDisease}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Track Disease
        </button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseases.map(disease => (
          <div
            key={disease._id}
            className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${disease.diseaseType === "Chronic"
              ? "border-red-500"
              : "border-yellow-500"
              }`}
          >
            <Heart className="w-10 h-10 text-red-500 mb-3" />

            <h3 className="font-bold text-lg mb-1">
              {disease.diseaseId?.name || "Unknown"}
            </h3>

            <p className="text-sm text-gray-500">
              Diagnosed: {new Date(disease.diagnosedDate).toLocaleDateString()}
            </p>
            <button
              onClick={() => {
                setSelectedDiseaseId(disease._id);
                setShowResolveModal(true);
              }}
              className="mt-4 text-sm text-red-600 hover:underline"
            >
              Resolve Disease
            </button>

            {/* Acute / Chronic badge */}
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold ${disease.diseaseType === "Chronic"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {disease.diseaseType}
            </span>

          </div>
        ))}

        {diseases.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No diseases tracked yet
          </div>
        )}
      </div>
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Resolution
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to mark this disease as resolved?
              This action will update your daily routine.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedDiseaseId(null);
                }}
                className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  resolveDisease(selectedDiseaseId);
                  setShowResolveModal(false);
                  setSelectedDiseaseId(null);
                }}
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Vaccinations Component
const Vaccinations = ({ vaccinations, setVaccinations, token }) => {
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVaccinationId, setSelectedVaccinationId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    renewalDate: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // text fields
      data.append("name", formData.name);
      data.append("date", formData.date);
      data.append("renewalDate", formData.renewalDate);
      data.append("notes", formData.notes);

      // optional file
      if (file) {
        data.append("report", file); // MUST match upload.single("report")
      }

      const res = await fetch(`${API_URL}/vaccination/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` // ✅ ONLY auth header
        },
        body: data
      });

      if (res.ok) {
        const newVac = await res.json();
        setVaccinations([...vaccinations, newVac]);
        setShowForm(false);

        // reset form
        setFormData({
          name: "",
          date: new Date().toISOString().split("T")[0],
          renewalDate: "",
          notes: ""
        });
        setFile(null);
      }
    } catch (err) {
      console.error("Error adding vaccination:", err);
    }
  };
  const handleDelete = async (id) => {
    if (!id) return;

    setIsDeleting(true); // 🔒 lock UI

    try {
      const res = await fetch(`${API_URL}/vaccination/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        // ✅ remove from frontend immediately
        setVaccinations(prev =>
          prev.filter(v => v._id !== id)
        );

        // ✅ close modal
        setShowDeleteModal(false);
        setSelectedVaccinationId(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeleting(false); // 🔓 unlock UI
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
        <div className="relative bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold mb-4">New Vaccination</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Vaccine Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Notes (Optional)
              </label>

              <textarea
                rows={3}
                placeholder="What is this vaccination for?"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Date Administered</label>
                <input
                  type="date"
                  value={formData.date}
                  max={new Date().toISOString().split("T")[0]}   // ✅ BLOCK FUTURE DATES
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Renewal Date (Optional)</label>
                <input
                  type="date"
                  value={formData.renewalDate}
                  min={new Date().toISOString().split("T")[0]}   // ✅ BLOCK PAST DATES
                  onChange={(e) =>
                    setFormData({ ...formData, renewalDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Vaccination Report (Optional)
                </label>

                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Upload PDF or image (optional)
                </p>
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
          <div
            key={vac._id}
            className="relative bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between"
          >
            {/* Top Section */}
            <div>
              <Syringe className="w-10 h-10 text-green-500 mb-3" />
              <button
                onClick={() => {
                  setSelectedVaccinationId(vac._id);
                  setShowDeleteModal(true);
                }}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                title="Delete vaccination"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-lg">{vac.vaccineName}</h3>

              <p className="text-sm text-gray-500">
                Date: {new Date(vac.dateAdministered).toLocaleDateString()}
              </p>
              {vac.notes && (
                <p className="mt-2 text-sm text-gray-700 italic">
                  📝 {vac.notes}
                </p>
              )}

              {vac.nextDueDate && (
                <p className="text-sm mt-1">
                  <span
                    className={`${!vac.renewalCompleted &&
                      new Date(vac.nextDueDate) < new Date()
                      ? "text-red-600 font-semibold"
                      : "text-gray-600"
                      }`}
                  >
                    Renewal: {new Date(vac.nextDueDate).toLocaleDateString()}
                  </span>

                  {!vac.renewalCompleted &&
                    new Date(vac.nextDueDate) < new Date() && (
                      <span className="ml-2 text-red-600 font-semibold">
                        (Overdue)
                      </span>
                    )}

                  {vac.renewalCompleted && (
                    <span className="ml-2 text-green-600 font-semibold">
                      ✓ Renewed
                    </span>
                  )}
                </p>
              )}

            </div>

            {/* Bottom Section – Report Button */}
            {vac.reportFile && (
              <div className="mt-4 pt-3 border-t">
                <a
                  href={`http://localhost:5000/${vac.reportFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
          inline-flex items-center gap-2
          text-sm font-medium
          text-blue-600
          hover:text-blue-800
        "
                >
                  📄 View Report
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Delete Vaccination
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this vaccination?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedVaccinationId(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={isDeleting}
                onClick={() => handleDelete(selectedVaccinationId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};


// Daily Routine Component
const DailyRoutine = ({ diseases, token }) => {

  const [loading, setLoading] = useState(true);
  const [diseaseTasks, setDiseaseTasks] = useState([]);
  const [isGeneralRoutine, setIsGeneralRoutine] = useState(false);
  const [routineTitle, setRoutineTitle] = useState("General Healthy Daily Routine");

  useEffect(() => {
    fetchRoutine();
  }, []);

  const fetchRoutine = async () => {
    try {
      const res = await fetch(`${API_URL}/routine/daily`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) return;

      const data = await res.json();

      // 🟢 General routine ALWAYS visible
      setIsGeneralRoutine(true);

      // 🧠 Disease-specific tasks
      if (data.hasDiseases && data.tasks.length > 0) {
        const mappedTasks = data.tasks.map(task => ({
          ...task,
          completed: data.completedTaskIds.includes(task.id)
        }));

        setDiseaseTasks(mappedTasks);

        const diseaseNames = [
          ...new Set(mappedTasks.map(t => t.id.split("_")[0]))
        ];

        if (diseaseNames.length === 1) {
          const name = diseaseNames[0];
          setRoutineTitle(
            `Daily Routine for ${name.charAt(0).toUpperCase() + name.slice(1)}`
          );
        } else {
          const formatted = diseaseNames
            .map(n => n.charAt(0).toUpperCase() + n.slice(1))
            .join(" & ");

          setRoutineTitle(`Daily Routine for ${formatted}`);
        }
      } else {
        // No diseases
        setDiseaseTasks([]);
        setRoutineTitle("General Healthy Daily Routine");
      }

    } catch (err) {
      console.error("Error fetching routine:", err);
    } finally {
      setLoading(false);
    }
  };


  const resolveDisease = async (id) => {
    try {
      const res = await fetch(`${API_URL}/diseases/resolve/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        // 🔁 Re-generate routine
        fetchRoutine();
      }
    } catch (err) {
      console.error("Failed to resolve disease", err);
    }
  };
  const toggleTask = async (taskId) => {
    // optimistic UI update
    setDiseaseTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );

    try {
      await fetch(`${API_URL}/routine/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ taskId })
      });
    } catch (err) {
      // rollback on failure
      setDiseaseTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        )
      );
    }
  };

  // 🔢 Routine progress calculation
  const totalTasks = diseaseTasks.length;
  const completedTasks = diseaseTasks.filter(t => t.completed).length;

  const completionPercent = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // 😊 Mood emoji based on completion
  const getRoutineEmoji = () => {
    if (completionPercent === 100) return "😁";
    if (completionPercent >= 80) return "😄";
    if (completionPercent >= 60) return "🙂";
    if (completionPercent >= 40) return "😐";
    if (completionPercent >= 20) return "😕";
    return "😞";
  };


  if (loading) {
    return <div className="text-center py-8">Loading routine...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-green-700">
        📅 General Healthy Daily Routine
      </h2>


      {/* 🟢 General Healthy Routine */}
      {isGeneralRoutine && (
        <div className="py-12 bg-white rounded-xl shadow-sm px-6">
          <ul className="space-y-3 text-gray-600 text-sm list-disc list-inside">
            <li>💧 Drink at least <span className="font-semibold">2–3 liters of water</span> daily</li>
            <li>🥗 Eat balanced meals with fruits, vegetables, and proteins</li>
            <li>🚶‍♂️ Stay active with at least <span className="font-semibold">30 minutes of exercise</span></li>
            <li>😴 Maintain <span className="font-semibold">7–8 hours of quality sleep</span></li>
            <li>🧘‍♀️ Take short breaks to stretch or relax during the day</li>
            <li>🚫 Reduce junk food, sugar, and excessive screen time</li>
            <li>🌞 Spend some time outdoors for fresh air and sunlight</li>
            <li>🧠 Practice stress management using meditation or deep breathing</li>
          </ul>
        </div>
      )}
      {diseaseTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-blue-700 mt-8">
            ➕ Additional routine for{" "}
            {routineTitle.replace(/^Daily Routine for\s*/i, "")}
          </h3>


          {diseaseTasks.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{task.label}</h3>
                {task.target && (
                  <p className="text-sm text-gray-500">
                    Target: {task.target} {task.unit}
                  </p>
                )}
              </div>

              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-5 h-5 accent-green-600"
              />
            </div>
          ))}
          {/* 😊 Progress for disease routines */}
          {diseaseTasks.length > 0 && (
            <div className="flex items-center gap-3 mt-6">
              <div className="flex gap-1 text-lg">
                <span>😞</span>
                <span>😕</span>
                <span>😐</span>
                <span>🙂</span>
                <span>😁</span>
              </div>

              <div className="relative w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-2 bg-green-500 transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              <span className="text-xl">
                {getRoutineEmoji()}
              </span>
            </div>
          )}

        </div>
      )}


      {/* ⚪ No Routine */}
      {!isGeneralRoutine && diseaseTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Routine Generated
          </h3>
          <p className="text-gray-500">
            Add diseases to generate personalized daily tasks
          </p>
        </div>
      )}
    </div>
  );
};
// Nearby Clinics Component
const NearbyClinics = () => {
  // Change city if you want a fixed location
  const searchQuery = "clinics near me";

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    searchQuery
  )}&output=embed`;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">📍 Nearby Clinics</h2>

      <div className="bg-white rounded-xl shadow-md p-4 h-[500px]">
        <iframe
          title="Nearby Clinics Map"
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="text-sm text-gray-500 text-center">
        Showing clinics and hospitals near your location
      </p>
    </div>
  );
};

// Health Chat Component
const HealthChat = ({ chatHistory, setChatHistory, token }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [lastHistory, setLastHistory] = useState([]);
  const chatEndRef = useRef(null);
  const historyEndRef = useRef(null);

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
  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setLastHistory(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch chat history", err);
    }
  };
  const renderBotMessage = (text) => {
    if (!text) return null;

    return text
      .split("\n")
      .filter(line => line.trim() !== "")
      .map((line, i) => {
        // 🟢 Section headings
        if (
          /^\d+\.\s*\*\*/.test(line) ||
          /^\*\*.*\*\*:?$/.test(line)
        ) {
          return (
            <p key={i} className="font-bold mt-3">
              {line.replace(/\*\*/g, "").replace(/^\d+\.\s*/, "")}
            </p>
          );
        }

        // 🔵 Bullet points
        if (line.startsWith("-") || line.startsWith("•")) {
          return (
            <li key={i} className="ml-5 list-disc">
              {line.replace(/^[-•]\s*/, "")}
            </li>
          );
        }

        // ⚪ Normal text
        return <p key={i}>{line}</p>;
      });
  };
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);
  useEffect(() => {
    if (showHistoryModal && lastHistory.length > 0) {
      historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showHistoryModal, lastHistory]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">💬 Health Chat</h1>

        <button
          onClick={() => {
            setShowHistoryModal(true);
            fetchChatHistory();
          }}
          className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          View History
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 h-96 overflow-y-auto">
        {chatHistory.map((msg, idx) => {
          const messageText =
            typeof msg.content === "string"
              ? msg.content
              : typeof msg.text === "string"
                ? msg.text
                : "";

          const isUser = msg.role === "user" || msg.sender === "user";

          return (
            <div
              key={idx}
              className={`mb-4 ${isUser ? "text-right" : "text-left"}`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${isUser
                  ? "bg-blue-400 text-black"
                  : "bg-gray-200 text-gray"
                  }`}
              >
                {isUser ? (
                  // ✅ User messages → plain text only
                  <span>{messageText}</span>
                ) : (
                  // ✅ Bot messages → markdown (wrapped safely)
                  <div className="prose prose-sm max-w-none">
                    <div className="text-sm">
                      {renderBotMessage(messageText)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && <div className="text-center text-gray-500">Getting results...</div>}
        {/* 👇 Auto-scroll target */}
        <div ref={chatEndRef} />
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
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">🕘 Last 50 Messages</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {lastHistory.length === 0 && (
                <p className="text-gray-500 text-sm">No chat history</p>
              )}

              {lastHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-sm ${msg.sender === "user"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100 text-left"
                    }`}
                >
                  {msg.sender === "bot"
                    ? renderBotMessage(msg.text)
                    : <span>{msg.text}</span>}
                </div>
              ))}
              <div ref={historyEndRef} />
            </div>
          </div>
        </div>
      )}
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
            <p className="font-semibold text-green-600">
              {user?.healthScore}/100
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Fitness Goals Component with 3 Wellness Pillars
// Enhanced Fitness Goals Component with Activity Selection, Food Tracking & Meditation
const FitnessGoals = ({ goal, setGoal, token }) => {
  const [progress, setProgress] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showFoodTracker, setShowFoodTracker] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [exerciseMinutes, setExerciseMinutes] = useState("");
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [weekView, setWeekView] = useState("this");
  const [goalsCompletedThisWeek, setGoalsCompletedThisWeek] = useState([]);
  const [goalsCompletedLastWeek, setGoalsCompletedLastWeek] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodGrams, setFoodGrams] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);
  const [todayFoodLog, setTodayFoodLog] = useState([]);
  const [savedTodayFoodLog, setSavedTodayFoodLog] = useState([]);
  const [savedTodayCalories, setSavedTodayCalories] = useState(0);
  const [isEditingToday, setIsEditingToday] = useState(false);
  const [calorieView, setCalorieView] = useState("today"); // today | yesterday
  const [calorieItems, setCalorieItems] = useState([]);
  const [calorieTotal, setCalorieTotal] = useState(0);
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [selectedMeditation, setSelectedMeditation] = useState(null);
  const [meditationMinutes, setMeditationMinutes] = useState(0);
  const [isMeditating, setIsMeditating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [audio, setAudio] = useState(null);
  const timerRef = useRef(null);
  const timeLeftRef = useRef(0);
  const meditationStartedRef = useRef(false);
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [meditationView, setMeditationView] = useState("today"); // today | yesterday
  const [meditationLogs, setMeditationLogs] = useState([]);
  const [showMeditationComplete, setShowMeditationComplete] = useState(false);
  const [completedMeditation, setCompletedMeditation] = useState(null);
  // 🔥 live meditation update for calendar
  const [liveMeditation, setLiveMeditation] = useState(null);

  const [calorieForm, setCalorieForm] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activity: "moderate"
  });

  const [formData, setFormData] = useState({
    description: goal?.goal || '',
    targetValue: goal?.targetMinutes || '',
    unit: 'minutes',
    endDate: ''
  });
  const LITER_ITEMS = ["Water"];

  const requiresLiters = (foodName) => LITER_ITEMS.includes(foodName);
  const NO_GRAM_ITEMS = ["Coffee", "Tea", "Water", "Juice", "Smoothie"];

  const requiresGrams = (foodName) => {
    return !NO_GRAM_ITEMS.includes(foodName);
  };
  const isGoalCompleted = progress >= 100;
  const activeDots = Math.min(5, Math.ceil(progress / 20));
  const today = new Date().toISOString().split("T")[0];
  const consumed = savedTodayCalories;      // what user ate
  const target = calorieTarget;       // calculated target

  const difference = consumed - target;

  const isOverTarget = difference > 0;
  const isUnderTarget = difference < 0;
  const isOnTarget = difference === 0;

  const percentUsed = Math.min(
    100,
    Math.round((consumed / target) * 100)
  );


  const fetchProgress = async () => {
    try {
      const res = await fetch(`${API_URL}/fitness/progress`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      console.log("Progress data:", data);
      setProgress(data.progress || 0);
      setWeeklyMinutes(data.completedMinutes || 0);

      // 🔥 IF GOAL COMPLETED → REFRESH GOAL
      if (data.progress === 100) {
        const goalRes = await fetch(`${API_URL}/fitness/goal`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (goalRes.ok) {
          const updatedGoal = await goalRes.json();
          setGoal(updatedGoal); // ✅ THIS updates Dashboard
        }
      }

    } catch (err) {
      console.error("Failed to fetch progress", err);
    }
  };
  const logWorkout = async (activity, duration, date) => {
    try {
      await fetch(`${API_URL}/fitness/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          activity,
          duration,
          date: new Date().toISOString().split("T")[0] // 👈 FORCE DATE
        }),
      });
      setCalendarRefreshKey(prev => prev + 1);

      await fetchProgress();
      await fetchWeeklyStats();   // ✅ ADD THIS
    } catch (err) {
      console.error("Error logging workout", err);
    }
  };
  const fetchTodayFoodLogs = async () => {
    try {
      const res = await fetch(
        `${API_URL}/fitness/nutrition/logs/today`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const logs = await res.json();

      let calories = 0;
      let items = [];

      logs.forEach(log => {
        log.items.forEach(item => {
          calories += item.calories;
          items.push(item);
        });
      });

      setSavedTodayFoodLog(items);
      setSavedTodayCalories(calories);
    } catch (err) {
      console.error("Failed to fetch food logs", err);
    }
  };
  const fetchCalories = async (view) => {
    try {
      const endpoint =
        view === "today"
          ? "/fitness/nutrition/logs/today"
          : "/fitness/nutrition/logs/yesterday";

      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const logs = await res.json();
      if (!Array.isArray(logs)) return;

      let total = 0;
      let items = [];


      logs.forEach(log => {
        log.items.forEach(item => {
          total += Number(item.calories || 0);
          items.push(item);
        });
      });

      setCalorieTotal(total);
      setCalorieItems(items);

    } catch (err) {
      console.error("Failed to fetch calories", err);
    }
  };
  const calculateCalories = () => {
    const { gender, age, height, weight, activity } = calorieForm;

    if (!age || !height || !weight) {
      alert("Please fill all fields");
      return;
    }

    let bmr;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityFactor = {
      low: 1.2,
      moderate: 1.55,
      high: 1.725
    };

    const calories = Math.round(bmr * activityFactor[activity]);
    handleSaveCalorieTarget(calories);

    setCalorieTarget(calories);
    setShowCalorieModal(false);
  };
  const fetchMeditationStreak = async () => {
    const res = await fetch(`${API_URL}/fitness/meditation/streak`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setMeditationStreak(data.streak || 0);
  };
  const fetchMeditationLogs = async (view) => {
    const endpoint =
      view === "today"
        ? "/fitness/meditation/today"
        : "/fitness/meditation/yesterday";

    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    setMeditationLogs(data || []);
  };
  useEffect(() => {
    fetchMeditationStreak();
    fetchMeditationLogs(meditationView);
  }, []);

  useEffect(() => {
    fetchMeditationLogs(meditationView);
  }, [meditationView]);


  useEffect(() => {
    (async () => {
      await fetchProgress();
      await fetchWeeklyStats();
      await fetchTodayFoodLogs(); // ✅ ADD THIS
    })();
  }, []);
  useEffect(() => {
    fetchCalories(calorieView);
  }, [calorieView]);
  useEffect(() => {
    const fetchCalorieTarget = async () => {
      try {
        const res = await fetch(`${API_URL}/fitness/nutrition/target`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();

        if (data?.targetCalories) {
          setCalorieTarget(data.targetCalories);
        }
      } catch (err) {
        console.error("Failed to load calorie target");
      }
    };

    fetchCalorieTarget();
  }, []);


  const fetchWeeklyStats = async () => {
    try {
      const res = await fetch(`${API_URL}/fitness/weekly-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      setWorkoutsThisWeek(data.workoutsThisWeek || 0);
      setGoalsCompletedThisWeek(data.goalsCompletedThisWeek || []);
      setGoalsCompletedLastWeek(data.goalsCompletedLastWeek || []);

    } catch (err) {
      console.error("Weekly stats fetch failed", err);
    }
  };

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
    {
      name: "Breakfast",
      emoji: "🍳",
      items: [
        { name: "Oatmeal", calories: 150 },
        { name: "Eggs", calories: 140 },
        { name: "Toast", calories: 120 },
        { name: "Smoothie", calories: 250 },
        { name: "Cereal", calories: 180 }
      ]
    },
    {
      name: "Lunch",
      emoji: "🍱",
      items: [
        { name: "Rice Bowl", calories: 400 },
        { name: "Salad", calories: 220 },
        { name: "Sandwich", calories: 350 },
        { name: "Pasta", calories: 450 },
        { name: "Soup", calories: 180 }
      ]
    },
    {
      name: "Dinner",
      emoji: "🍽️",
      items: [
        { name: "Chicken", calories: 300 },
        { name: "Fish", calories: 280 },
        { name: "Vegetables", calories: 200 },
        { name: "Curry", calories: 350 },
        { name: "Steak", calories: 450 }
      ]
    },
    {
      name: "Snacks",
      emoji: "🍎",
      items: [
        { name: "Fruits", calories: 100 },
        { name: "Nuts", calories: 180 },
        { name: "Yogurt", calories: 120 },
        { name: "Protein Bar", calories: 220 },
        { name: "Chips", calories: 250 }
      ]
    },
    {
      name: "Drinks",
      emoji: "🥤",
      items: [
        { name: "Water", calories: 0 },
        { name: "Juice", calories: 120 },
        { name: "Coffee", calories: 50 },
        { name: "Tea", calories: 30 },
        { name: "Smoothie", calories: 250 }
      ]
    }
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

    if (!formData.description || !formData.targetValue) {
      alert("Please enter activity and target minutes");
      return;
    }
    if (new Date(formData.endDate) < new Date().setHours(0, 0, 0, 0)) {
      alert("Target date cannot be in the past");
      return;
    }


    try {
      const res = await fetch(`${API_URL}/fitness/goal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          goal: formData.description,
          targetMinutes: Number(formData.targetValue),
          endDate: formData.endDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend error:", data);
        alert(data.error || "Request failed");
        return;
      }

      setGoal(data);
      setProgress(0);
      setWeeklyMinutes(0);
      fetchProgress();
      setEditing(false);

    } catch (err) {
      console.error("Network error:", err);
      alert("Network error");
    }
  };
  const handleSaveFoodLog = async () => {
    try {
      // ✅ SAVE (UPSERT handles create + edit)
      await fetch(`${API_URL}/fitness/nutrition/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          category: "Mixed",
          items: todayFoodLog   // ✅ FINAL edited list
        })
      });


      // ✅ Update dashboard immediately
      const calories = todayFoodLog.reduce(
        (sum, i) => sum + Number(i.calories || 0),
        0
      );

      setSavedTodayFoodLog(todayFoodLog);
      setSavedTodayCalories(calories);
      // 🔥 FORCE CALENDAR UPDATE
      setCalendarRefreshKey(prev => prev + 1);
      // ✅ Refresh stats (today / yesterday dropdown)
      await fetchCalories(calorieView);

      // ✅ Close modal
      setShowFoodTracker(false);
      setIsEditingToday(false);

    } catch (err) {
      console.error("Food log save failed", err);
      alert("Failed to save food log");
    }
  };
  const handleSaveCalorieTarget = async (calculatedTarget) => {
    try {
      await fetch(`${API_URL}/fitness/nutrition/target`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          targetCalories: calculatedTarget,
        }),
      });

      // ✅ update UI instantly
      setCalorieTarget(calculatedTarget);
    } catch (err) {
      console.error("Failed to save calorie target", err);
    }
  };


  const deleteFoodItem = (index) => {
    const removedItem = todayFoodLog[index];

    // reduce calories
    setTotalCalories(prev => prev - removedItem.calories);

    // remove item from list
    setTodayFoodLog(prev =>
      prev.filter((_, i) => i !== index)
    );
  };
  const getProgressEmoji = (progress) => {
    if (progress === 0) return "😢";
    if (progress < 25) return "😟";
    if (progress < 50) return "🙂";
    if (progress < 75) return "😄";
    return "🤩";
  };

  const emojiLeftPosition = Math.min(progress, 100); // % based movement
  const startMeditation = () => {
    if (meditationStartedRef.current) return;

    meditationStartedRef.current = true;

    const totalSeconds = meditationMinutes * 60;
    timeLeftRef.current = totalSeconds;

    setTimeLeft(totalSeconds);
    setIsMeditating(true);

    const calmAudio = new Audio("/Meditation.mp3");
    calmAudio.play();
    setAudio(calmAudio);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;

      console.log("TICK:", timeLeftRef.current);

      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;

        calmAudio.pause();
        calmAudio.currentTime = 0;

        meditationStartedRef.current = false;
        stopMeditation(true);
      }
    }, 1000);
  };


  const stopMeditation = async (autoCompleted = false) => {
    meditationStartedRef.current = false;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    timeLeftRef.current = 0;
    setTimeLeft(0);
    setIsMeditating(false);
    setAudio(null);

    // ✅ ONLY IF COMPLETED
    if (autoCompleted) {

      // 🔥 create completed object ONCE
      const completed = {
        type: selectedMeditation.name,
        duration: meditationMinutes,
        date: new Date().toISOString()
      };

      // ✅ save to backend (existing behavior)
      await fetch(`${API_URL}/fitness/meditation/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(completed),
      });

      // 🔥 NEW: instant UI update (NO refresh needed)
      setLiveMeditation(completed);

      // 🔥 existing UI logic (unchanged)
      setCompletedMeditation({
        type: selectedMeditation.name,
        duration: meditationMinutes,
      });

      await refreshMeditationData();
      setCalendarRefreshKey(prev => prev + 1);

      setShowMeditationComplete(true);
    }

    if (!autoCompleted) {
      setSelectedMeditation(null);
      setShowMeditation(false);
    }
  };

  const cancelMeditation = () => {
    if (isMeditating) {
      stopMeditation(false);
    } else {
      setSelectedMeditation(null);
      setShowMeditation(false);
    }
  };
  const refreshMeditationData = async () => {
    await fetchMeditationStreak();
    await fetchMeditationLogs(meditationView);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  // 🔹 Last 5 completed meditation sessions (latest first)
  const lastFiveSessions = [...meditationLogs]
    .slice(-5)
    .reverse();


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
              <p className="text-2xl font-bold">
                {isGoalCompleted ? "🎉 Completed" : `${progress}%`}
              </p>

              <p className="text-xs opacity-80">
                {weeklyMinutes} / {goal?.targetMinutes} minutes
              </p>
              {goal?.endDate && (
                <div className="mt-2 bg-white bg-opacity-20 px-3 py-1 rounded-md text-xs">
                  🎯 Target by:{" "}
                  <span className="font-semibold">
                    {new Date(goal.endDate).toLocaleDateString()}
                  </span>
                </div>
              )}

            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">FITNESS</h3>
          <p className="text-orange-100 text-sm mb-4">
            {goal ? goal.goal : 'Choose your workout activity'}
          </p>
          {/* Progress Bar */}
          <div className="w-full mt-2">
            <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-xs text-white mt-1">
              {progress}% completed
            </p>
          </div>

          <div className="flex items-center justify-between">
            {showDurationModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-80">
                  <h3 className="text-xl font-bold mb-4">⏱ Workout Duration</h3>

                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    How many minutes did you work out?
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={exerciseMinutes}
                    onChange={(e) => setExerciseMinutes(e.target.value)}

                    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4
                              bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (!exerciseMinutes) {
                          alert("Please enter workout minutes");
                          return;
                        }
                        logWorkout(
                          goal.goal,
                          Number(exerciseMinutes),
                          new Date().toISOString().split("T")[0] // ✅ TODAY'S DATE
                        );
                        setShowDurationModal(false);
                        setExerciseMinutes("");
                      }}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setShowDurationModal(false)}
                      className="flex-1 bg-gray-200 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Action Buttons (Bottom aligned like Nutrition) */}
          <div className="flex flex-col gap-2 items-end mt-6">

            <button
              onClick={() => setShowDurationModal(true)}
              disabled={isGoalCompleted}
              className={`text-sm px-4 py-2 rounded-lg transition
                ${isGoalCompleted
                  ? "bg-white bg-opacity-10 cursor-not-allowed"
                  : "bg-white bg-opacity-20 hover:bg-opacity-30"
                }`}
            >
              {isGoalCompleted ? "Goal Completed" : "Track Now"}
            </button>

            <button
              onClick={() => setShowActivities(true)}
              className="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition"
            >
              {isGoalCompleted ? "Set Goal" : "Change Goal"}
            </button>

          </div>
          {/* Progress Emoji (Bottom Left) */}
          <div className="absolute bottom-10 left-4 text-4xl transition-all duration-300">
            {getProgressEmoji(progress)}
          </div>
        </div>

        {/* Diet / Nutrition Card */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all transform hover:scale-105">

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            {/* LEFT SIDE */}
            <div className="flex flex-col gap-2">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-4xl">🍎</span>
              </div>

              {/* 🎯 TOP-LEFT BUTTON */}
              <button
                onClick={() => setShowCalorieModal(true)}
                className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-md hover:bg-opacity-30 w-fit"
              >
                🎯 {calorieTarget ? "Recalculate Target" : "Set Calorie Target"}
              </button>
            </div>

            {/* RIGHT SIDE */}
            <div className="text-right">
              <p className="text-sm text-green-100">Calories</p>

              <p className="text-2xl font-bold">
                {savedTodayCalories}
                {calorieTarget && ` / ${calorieTarget}`} kcal
              </p>

              {calorieTarget && (
                <p className="text-xs text-green-100 mt-1">
                  Daily Target
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2">NUTRITION</h3>
          <p className="text-green-100 text-sm mb-4">
            Track your daily meals and calories
          </p>
          {/* 🔥 Calorie Progress Bar */}
          {calorieTarget && (
            <div className="mt-3">
              <div className="w-full h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${savedTodayCalories > calorieTarget
                    ? "bg-red-500"
                    : "bg-white"
                    }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((savedTodayCalories / calorieTarget) * 100)
                    )}%`
                  }}
                />
              </div>
            </div>
          )}
          {/* ⚠️ Over / Under Target Indicator */}
          {calorieTarget && (
            <p className="mt-2 text-xs font-semibold">
              {savedTodayCalories > calorieTarget && (
                <span className="text-red-100">
                  ⚠️ Over target by {savedTodayCalories - calorieTarget} kcal
                </span>
              )}

              {savedTodayCalories < calorieTarget && (
                <span className="text-green-100">
                  ✅ {calorieTarget - savedTodayCalories} kcal remaining
                </span>
              )}

              {savedTodayCalories === calorieTarget && (
                <span className="text-white">
                  🎯 Target achieved
                </span>
              )}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">

            {/* Progress dots */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white bg-opacity-30"
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 items-end">

              {/* ➕ Add Today’s Food (always visible) */}
              <button
                disabled={savedTodayFoodLog.length > 0}
                onClick={() => {
                  setIsEditingToday(false);
                  setTodayFoodLog([]);
                  setTotalCalories(0);
                  setShowFoodTracker(true);
                }}
                className={`text-sm px-4 py-2 rounded-lg transition
                  ${savedTodayFoodLog.length > 0
                    ? "bg-white bg-opacity-10 cursor-not-allowed"
                    : "bg-white bg-opacity-20 hover:bg-opacity-30"
                  }`}
              >
                ➕ Add Today’s Meals
              </button>

              {/* ✏️ Edit Today’s Food (only after saving once) */}
              {savedTodayFoodLog.length > 0 && (
                <button
                  onClick={() => {
                    setTodayFoodLog(savedTodayFoodLog);
                    setTotalCalories(savedTodayCalories);
                    setIsEditingToday(true);
                    setShowFoodTracker(true);
                  }}
                  className="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition"
                >
                  ✏️ Edit Today’s Meals
                </button>
              )}

            </div>
          </div>
        </div>

        {/* 🔥 PUT CALORIE CALCULATOR MODAL HERE 🔥 */}
        {showCalorieModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
              <h3 className="text-xl font-bold mb-4">
                🎯 Daily Calorie Target(BMR)
              </h3>

              <div className="space-y-3">
                <select
                  value={calorieForm.gender}
                  onChange={(e) =>
                    setCalorieForm({ ...calorieForm, gender: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Age"
                  value={calorieForm.age}
                  onChange={(e) => {
                    const value = Math.max(1, Number(e.target.value));
                    setCalorieForm({ ...calorieForm, age: value });
                  }}
                  className="w-full border px-3 py-2 rounded"
                />

                <input
                  type="number"
                  min="1"
                  placeholder="Height (cm)"
                  value={calorieForm.height}
                  onChange={(e) => {
                    const value = Math.max(1, Number(e.target.value));
                    setCalorieForm({ ...calorieForm, height: value });
                  }}
                  className="w-full border px-3 py-2 rounded"
                />

                <input
                  type="number"
                  min="1"
                  placeholder="Weight (kg)"
                  value={calorieForm.weight}
                  onChange={(e) => {
                    const value = Math.max(1, Number(e.target.value));
                    setCalorieForm({ ...calorieForm, weight: value });
                  }}
                  className="w-full border px-3 py-2 rounded"
                />

                <select
                  value={calorieForm.activity}
                  onChange={(e) =>
                    setCalorieForm({ ...calorieForm, activity: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="low">Low activity</option>
                  <option value="moderate">Moderate activity</option>
                  <option value="high">High activity</option>
                </select>

                <div className="flex gap-2 pt-3">
                  <button
                    onClick={calculateCalories}
                    className="flex-1 bg-green-600 text-white py-2 rounded"
                  >
                    Calculate
                  </button>

                  <button
                    onClick={() => setShowCalorieModal(false)}
                    className="flex-1 bg-gray-200 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              {[1, 2, 3, 4, 5].map(i => (
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

          {/* 🔥 Streak + Last Sessions (pushed down) */}
          <div className="mt-6 space-y-3">

            {/* 🔥 Streak Badge */}
            <div
              className="
      inline-flex items-center gap-2
      bg-white bg-opacity-20
      px-4 py-2
      rounded-full
      backdrop-blur-sm
    "
            >
              <span className="text-xl">
                {meditationStreak > 0 ? "🔥" : "🌱"}
              </span>

              <div className="leading-tight">
                <p className="text-sm font-bold text-white">
                  {meditationStreak > 0
                    ? `${meditationStreak} Day Streak`
                    : "Start Today"}
                </p>
                <p className="text-xs text-white opacity-80">
                  Mindfulness
                </p>
              </div>
            </div>

            {/* 😌 Last 5 Sessions */}
            <div className="w-full">
              <p className="text-xs text-white opacity-80 mb-1">
                Last 5 sessions
              </p>

              <div className="flex justify-between items-center">
                {lastFiveSessions.map((s, i) => (
                  <span key={i} className="text-xl">
                    {s.type === "Sleep"
                      ? "😴"
                      : s.duration < 5
                        ? "😢"
                        : s.duration < 10
                          ? "😌"
                          : s.duration < 20
                            ? "😊"
                            : "🧘‍♂️"}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4">📊 Wellness Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-500">{workoutsThisWeek}</p>
            <p className="text-sm text-gray-600">Goals completed this week</p>
            <select
              value={weekView}
              onChange={(e) => setWeekView(e.target.value)}
              className="border px-3 py-2 rounded text-sm mt-3"
            >
              <option value="this">This Week</option>
              <option value="last">Last Week</option>
            </select>
            {(weekView === "this"
              ? goalsCompletedThisWeek
              : goalsCompletedLastWeek
            ).length > 0 ? (
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm text-gray-700">
                {(weekView === "this"
                  ? goalsCompletedThisWeek
                  : goalsCompletedLastWeek
                ).map((g, i) => (
                  <li key={i}>
                    {i + 1} – {g.goal} ({g.targetMinutes} mins)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-3">
                No goals completed
              </p>
            )}
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-green-500">
              {calorieTotal}
            </p>

            <p className="text-sm text-gray-600">
              Calories tracked
            </p>

            {/* Dropdown */}
            <select
              value={calorieView}
              onChange={(e) => setCalorieView(e.target.value)}
              className="border px-3 py-2 rounded text-sm mt-3"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>

            {/* Food List */}
            {calorieItems.length > 0 ? (
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm text-gray-700 text-left">
                {calorieItems.map((item, i) => (
                  <li key={i}>
                    {item.name} – {item.calories} kcal
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 mt-3">
                No food logged
              </p>
            )}
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-500">
              {meditationStreak}
            </p>
            <p className="text-sm text-gray-600">Meditation streak</p>

            {/* Dropdown */}
            <select
              value={meditationView}
              onChange={(e) => setMeditationView(e.target.value)}
              className="border px-3 py-2 rounded text-sm mt-3"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>

            {/* Meditation list */}
            {meditationLogs.length > 0 ? (
              <ul className="list-disc ml-5 mt-3 space-y-1 text-sm text-gray-700 text-left">
                {meditationLogs.map((m, i) => (
                  <li key={i}>
                    {m.type} – {m.duration} min
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 mt-3">
                No meditation completed
              </p>
            )}
          </div>
        </div>

      </div>
      <FitnessCalendar
        token={token}
        refreshKey={calendarRefreshKey}
        liveMeditation={liveMeditation}
      />

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
                    setFormData({ ...formData, description: activity.name });
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
                        onClick={() => {
                          setSelectedFood({
                            name: item.name,
                            baseCalories: item.calories,
                            baseGrams: 100
                          });
                          setFoodGrams("");
                        }}
                        className="bg-white rounded-lg p-3 text-center hover:bg-green-100 transition border border-green-200"
                      >
                        <p className="text-sm font-semibold text-gray-800">
                          {item.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.calories} kcal
                        </p>

                        <p className="text-xs text-green-600 mt-1">Add +</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {todayFoodLog.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold mb-2">🍽 Today’s Food</h4>

                <ul className="space-y-1 text-sm text-gray-700">
                  {todayFoodLog.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center"
                    >
                      <span>
                        {item.name}
                        {item.grams ? ` (${item.grams}g)` : ""} – {item.calories} kcal
                      </span>

                      <button
                        onClick={() => {
                          setTodayFoodLog(prev =>
                            prev.filter((_, index) => index !== i)
                          );
                          setTotalCalories(prev => prev - item.calories);
                        }}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>

                <p className="mt-2 font-semibold">
                  Total: {totalCalories} kcal
                </p>
              </div>
            )}
            <button
              disabled={todayFoodLog.length === 0}
              onClick={handleSaveFoodLog}
              className={`w-full mt-4 py-3 rounded-lg text-white
                ${todayFoodLog.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {isEditingToday ? "Update Today’s Log" : "Save Today’s Log"}
            </button>
          </div>
        </div>
      )}
      {selectedFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">
              {selectedFood.name}
            </h3>

            <p className="text-sm text-gray-600 mb-3">
              {requiresGrams(selectedFood.name)
                ? `Base: ${selectedFood.baseCalories} kcal per ${selectedFood.baseGrams}g`
                : `Base: ${selectedFood.baseCalories} kcal`}
            </p>

            {requiresGrams(selectedFood.name) && (
              <input
                type="number"
                min="1"
                placeholder="Enter grams eaten"
                value={foodGrams}
                onChange={(e) =>
                  setFoodGrams(Math.max(1, Number(e.target.value)))
                }
                className="w-full border px-3 py-2 rounded mb-4"
              />
            )}

            {requiresLiters(selectedFood.name) && (
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Enter liters consumed"
                value={foodGrams}
                onChange={(e) =>
                  setFoodGrams(Math.max(0.1, Number(e.target.value)))
                }
                className="w-full border px-3 py-2 rounded mb-4"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (
                    (requiresGrams(selectedFood.name) ||
                      requiresLiters(selectedFood.name)) &&
                    !foodGrams
                  ) {
                    alert("Please enter quantity");
                    return;
                  }

                  let calories = 0;

                  if (requiresGrams(selectedFood.name)) {
                    calories =
                      (foodGrams / selectedFood.baseGrams) *
                      selectedFood.baseCalories;
                  } else if (requiresLiters(selectedFood.name)) {
                    calories = 0; // water = 0 kcal
                  } else {
                    calories = selectedFood.baseCalories;
                  }

                  const roundedCalories = Math.round(calories);

                  setTotalCalories(prev => prev + roundedCalories);

                  setTodayFoodLog(prev => [
                    ...prev,
                    {
                      name: selectedFood.name,
                      quantity: foodGrams,
                      unit: requiresLiters(selectedFood.name)
                        ? "L"
                        : requiresGrams(selectedFood.name)
                          ? "g"
                          : null,
                      calories: roundedCalories
                    }
                  ]);

                  setSelectedFood(null);
                  setFoodGrams("");
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded"
              >
                Add
              </button>

              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancel
              </button>
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
                  <button
                    onClick={() => {
                      setSelectedMeditation(type);
                      setMeditationMinutes(
                        Number(type.duration.replace(" min", "")) // default minutes
                      );
                    }}
                    className="w-full mt-3 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedMeditation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">
              🧘 {selectedMeditation.name}
            </h3>

            <p className="text-sm text-gray-600 mb-3">
              Default: {selectedMeditation.duration}
            </p>

            {!isMeditating && (
              <>
                <label className="block text-sm font-semibold mb-1">
                  Minutes (1–30)
                </label>

                <input
                  type="number"
                  min="1"
                  max="30"
                  value={meditationMinutes}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= 30) {
                      setMeditationMinutes(value);
                    }
                  }}
                  className="w-full border px-3 py-2 rounded mb-4"
                />
              </>
            )}

            {isMeditating && (
              <p className="text-center text-lg font-bold mb-3">
                ⏳ {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                {String(timeLeft % 60).padStart(2, "0")}
              </p>
            )}

            <div className="flex gap-2">
              {!isMeditating ? (
                <>
                  <button
                    onClick={startMeditation}
                    className="flex-1 bg-purple-600 text-white py-2 rounded"
                  >
                    Start
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMeditation(null);
                      setShowMeditation(false);
                    }}
                    className="flex-1 bg-gray-200 py-2 rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => stopMeditation(false)}
                  className="flex-1 bg-red-600 text-white py-2 rounded"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {showMeditationComplete && completedMeditation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-center">

            <div className="text-5xl mb-3">🎉</div>

            <h3 className="text-xl font-bold mb-2">
              Meditation Completed
            </h3>

            <p className="text-gray-600 mb-4">
              You completed
              <span className="font-semibold text-purple-600">
                {" "}{completedMeditation.type}
              </span>{" "}
              for{" "}
              <span className="font-semibold">
                {completedMeditation.duration} minutes
              </span>
            </p>

            <button
              onClick={() => {
                setShowMeditationComplete(false);
                setCompletedMeditation(null);
                setSelectedMeditation(null);
                setShowMeditation(false);
              }}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              Done
            </button>
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Target"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}   // ⛔ blocks past dates
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                  required
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
          Set specific, measurable goals for better results.
        </p>
      </div>
    </div>
  );
};

// ================= FITNESS CALENDAR =================
const FitnessCalendar = ({ token, refreshKey, liveMeditation }) => {
  const [view, setView] = useState("month"); // month | week1 | week2 | week3 | week4
  const [workouts, setWorkouts] = useState([]);
  const [weekView, setWeekView] = useState("this");
  const [goalsCompletedThisWeek, setGoalsCompletedThisWeek] = useState([]);
  const [goalsCompletedLastWeek, setGoalsCompletedLastWeek] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [meditationLogs, setMeditationLogs] = useState([]);
  const toKey = (d) => new Date(d).toLocaleDateString("en-CA");

  useEffect(() => {
    // Fetch workouts
    fetch(`${API_URL}/fitness/activity/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setWorkouts(data || []));

    // Fetch nutrition logs
    fetch(`${API_URL}/fitness/nutrition/logs/month`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setFoodLogs(data || []))
      .catch(err => console.error("Calendar fetch error:", err));
    // Fetch meditation logs
    fetch(`${API_URL}/fitness/meditation/month`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setMeditationLogs(data || []));
  }, [token, refreshKey]);
  useEffect(() => {
    if (!liveMeditation) return;

    setMeditationLogs(prev => [
      ...prev,
      {
        ...liveMeditation,
        date: new Date().toISOString()
      }
    ]);
  }, [liveMeditation]);

  const getWorkoutDetails = (dayKey) =>
    workouts.filter(w => toKey(w.date) === dayKey);

  const getFoodDetails = (dayKey) =>
    foodLogs.filter(f => toKey(f.date) === dayKey);

  const getMeditationDetails = (dayKey) =>
    meditationLogs.filter(m => toKey(m.date) === dayKey);


  // ✅ Group workouts by date (YYYY-MM-DD)
  const grouped = workouts.reduce((acc, w) => {
    const key = toKey(w.date);
    acc[key] = (acc[key] || 0) + Number(w.duration || 0);
    return acc;
  }, {});
  const groupedCalories = foodLogs.reduce((acc, log) => {
    const key = toKey(log.date); // YYYY-MM-DD

    const total = log.items.reduce(
      (sum, item) => sum + Number(item.calories || 0),
      0
    );

    acc[key] = (acc[key] || 0) + total;
    return acc;
  }, {});
  const groupedMeditation = meditationLogs.reduce((acc, m) => {
    const key = toKey(m.date);
    acc[key] = (acc[key] || 0) + Number(m.duration || 0);
    return acc;
  }, {});


  // ✅ Build weeks of current month (1–28 only, clean & predictable)
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // total days in current month (28–31)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = date.toLocaleDateString("en-CA");

    // ISO week number inside the month
    const weekOfMonth = Math.ceil(
      (day + new Date(year, month, 1).getDay()) / 7
    );

    if (!weeks[`week${weekOfMonth}`]) {
      weeks[`week${weekOfMonth}`] = [];
    }

    weeks[`week${weekOfMonth}`].push({
      date,
      key,
      minutes: grouped[key] || 0,
      calories: groupedCalories[key] || 0
    });
  }

  const barData =
    view !== "month"
      ? weeks[view]?.map(d => ({
        date: d.date.toLocaleDateString("en-US", { weekday: "short" }),
        workout: d.minutes || 0,
        nutrition: groupedCalories[d.key] || 0,
        meditation: groupedMeditation[d.key] || 0
      }))
      : [];


  // weekly totals
  const weeklyTotals = Object.keys(weeks).reduce((acc, w) => {
    acc[w] = weeks[w].reduce((s, d) => s + d.minutes, 0);
    return acc;
  }, {});
  const weeklyCalorieTotals = Object.keys(weeks).reduce((acc, w) => {
    acc[w] = weeks[w].reduce(
      (sum, d) => sum + (groupedCalories[d.key] || 0),
      0
    );
    return acc;
  }, {});
  const weeklyMeditationTotals = Object.keys(weeks).reduce((acc, w) => {
    acc[w] = weeks[w].reduce(
      (sum, d) => sum + (groupedMeditation[d.key] || 0),
      0
    );
    return acc;
  }, {});
  console.log("Food logs:", foodLogs);
  console.log("Grouped calories:", groupedCalories);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      {/* Header + Dropdown */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">📅 Workout Calendar</h3>

        <select
          value={view}
          onChange={e => setView(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          {Object.keys(weeks).map(w => (
            <option key={w} value={w}>
              {w.replace("week", "Week ")}
            </option>
          ))}
          <option value="month">Whole Month</option>
        </select>

      </div>

      {/* ✅ WEEK VIEW */}
      {view !== "month" && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-center">Workout (mins)</th>
                <th className="p-2 text-center">Nutrition (kcal)</th>
                <th className="p-2 text-center">Mindfulness</th>
              </tr>
            </thead>
            <tbody>
              {weeks[view]?.map(d => {
                const isToday =
                  d.key === toKey(new Date());

                return (
                  <tr
                    key={d.key}
                    className={`border-t ${isToday ? "bg-green-50 font-semibold" : ""
                      }`}
                  >
                    <td className="p-2">
                      {d.date.toLocaleDateString()}
                      {isToday && " 🟢"}
                    </td>
                    <td className="p-2 text-center">
                      <div className="relative group inline-block">
                        {d.minutes || "—"}

                        {d.minutes > 0 && (
                          <div className="hidden group-hover:block absolute z-50 bg-white shadow-lg border rounded p-2 text-xs text-left w-40">
                            <p className="font-semibold mb-1">🏋️ Workouts</p>
                            {getWorkoutDetails(d.key).map((w, i) => (
                              <p key={i}>
                                {w.activity} – {w.duration} min
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="relative group inline-block">
                        {groupedCalories[d.key] || "—"}

                        {groupedCalories[d.key] > 0 && (
                          <div className="hidden group-hover:block absolute z-50 bg-white shadow-lg border rounded p-2 text-xs text-left w-44">
                            <p className="font-semibold mb-1">🍎 Nutrition</p>
                            {getFoodDetails(d.key).map((log, i) =>
                              log.items.map((item, j) => (
                                <p key={`${i}-${j}`}>
                                  {item.name} – {item.calories} kcal
                                </p>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <div className="relative group inline-block">
                        {groupedMeditation[d.key] || "—"}

                        {groupedMeditation[d.key] > 0 && (
                          <div
                            className="
                            hidden group-hover:block
                            absolute z-50
                            bg-white shadow-lg border
                            rounded p-2
                            text-xs text-left
                            w-44
                            left-1/2 -translate-x-1/2
                          "
                          >
                            <p className="font-semibold mb-1">🧘 Meditation</p>

                            {meditationLogs
                              .filter(m => toKey(m.date) === d.key)
                              .map((m, i) => (
                                <p key={i} className="font-medium">
                                  {m.type} – {m.duration} min
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Weekly total */}
          <div className="mt-2 text-right text-sm font-semibold">
            Workout this week: {weeklyTotals[view] || 0} mins
          </div>
          <div className="mt-2 text-right text-sm font-semibold">
            Calories this week: {weeklyCalorieTotals[view] || 0} kcal
          </div>
          <div className="mt-2 text-right text-sm font-semibold">
            Meditation this week: {weeklyMeditationTotals[view] || 0} mins
          </div>
          {/* 📊 WEEKLY ACTIVITY BAR GRAPH */}
          {view !== "month" && barData?.length > 0 && (
            <div className="mt-10">
              <h4 className="text-lg font-bold mb-4">
                📊 Weekly Activity Overview
              </h4>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    {/* 🏋️ Workout */}
                    <Bar dataKey="workout" fill="#34D399" name="Workout (mins)" />

                    {/* 🍎 Nutrition */}
                    <Bar dataKey="nutrition" fill="#60A5FA" name="Nutrition (kcal)" />

                    {/* 🧘 Meditation */}
                    <Bar dataKey="meditation" fill="#A78BFA" name="Meditation (mins)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ MONTH VIEW */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-2 text-center text-sm mt-4">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(year, month, i + 1);
            const key = date.toLocaleDateString("en-CA");
            const minutes = grouped[key] || 0;
            const isToday =
              key === new Date().toISOString().split("T")[0];

            return (
              <div
                key={key}
                className={`p-3 rounded-lg font-semibold
                  ${minutes === 0
                    ? "bg-gray-100 text-gray-400"
                    : minutes < 30
                      ? "bg-orange-200 text-orange-800"
                      : "bg-green-300 text-green-900"}
                  ${isToday ? "ring-2 ring-green-600" : ""}
                `}
              >
                <div>{i + 1}</div>
                <div className="text-xs">{minutes}m</div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        🟩 High activity · 🟧 Low activity · ⬜ No workout
      </p>
    </div>
  );
};


export default HealthLensApp;