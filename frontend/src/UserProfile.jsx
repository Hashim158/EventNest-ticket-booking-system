import React, { useState, useEffect } from "react";
import { UserCircle, LogOut, Heart, Ticket, Calendar, Save } from "lucide-react";
import { Link } from "react-router-dom";
function UserProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    cnic: "",
    number: "",
    gender: "",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // extract token & userId once
  const token = localStorage.getItem("token");
  let userId = null;
  if (token) {
    try {
      userId = JSON.parse(atob(token.split(".")[1] || "")).userId;
    } catch {}
  }

  // load profile
  useEffect(() => {
    if (!token || !userId) return window.location.href = "/login";

    fetch(`http://localhost:9090/user/${userId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        setForm({
          name: data.username || "",
          email: data.email || "",
          cnic: data.cnic || "",
          number: data.number || "",
          gender: data.gender || "",
          address: data.address || ""
        });
      })
      .catch(err => console.error("Profile load failed:", err))
      .finally(() => setLoading(false));
  }, [token, userId]);

  // handle form field changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // submit update
  const handleSave = () => {
    setSaving(true);
    fetch(`http://localhost:9090/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        username: form.name,
        email: form.email,
        cnic: form.cnic,
        number: form.number,
        gender: form.gender,
        address: form.address
      })
    })
      .then(res => {
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
        return res.json();
      })
      .then(updated => {
        // reflect any normalized values
        setForm(f => ({
          ...f,
          name: updated.username,
          email: updated.email,
          cnic: updated.cnic,
          number: updated.number,
          gender: updated.gender,
          address: updated.address
        }));
        alert("Profile updated!");
      })
      .catch(err => {
        console.error(err);
        alert("Couldn't save profile.");
      })
      .finally(() => setSaving(false));
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  
  const nav = path => () => window.location.href = path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with glass effect */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-1">
              <span className="text-gray-800 font-bold text-4xl">Event</span>
              <span className="text-green-400 font-bold text-4xl">Nest</span>
            </Link>
            <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
              {[
                "Favorites",
                "My Tickets",
                "My Events",
              
              ].map((label) => (
                <Link
                  key={label}
                  to={`/${label.toLowerCase().replace(/\s/g, "-")}`}
                  className="hover:text-gray-900"
                >
                  {label}
                </Link>
              ))}
            </nav>
            
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl z-10">
        <div className="flex justify-around py-3">
          <button onClick={nav("/favorites")} className="flex flex-col items-center text-sm text-gray-600">
            <Heart size={20} className="text-pink-500 mb-1" />
            <span>Favorites</span>
          </button>
          <button onClick={nav("/my-tickets")} className="flex flex-col items-center text-sm text-gray-600">
            <Ticket size={20} className="text-amber-500 mb-1" />
            <span>Tickets</span>
          </button>
          <button onClick={nav("/my-events")} className="flex flex-col items-center text-sm text-gray-600">
            <Calendar size={20} className="text-indigo-500 mb-1" />
            <span>Events</span>
          </button>
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center p-6 md:p-12 mb-16 md:mb-0">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 transition-all duration-300 hover:shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-20 blur-lg"></div>
              <UserCircle size={90} className="text-emerald-500 relative" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Your Profile</h2>

          {loading ? (
            <div className="animate-pulse space-y-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <form className="space-y-5" onSubmit={e => { e.preventDefault(); handleSave(); }}>
              {[
                ["name", "Name", "text", "Enter your full name"],
                ["email", "Email Address", "email", "your@email.com"],
                ["cnic", "CNIC", "text", "XXXXX-XXXXXXX-X"],
                ["number", "Phone Number", "tel", "+1234567890"],
                ["gender", "Gender", "select", "Select your gender"],
                ["address", "Address", "textarea", "Your full address"]
              ].map(([key, label, type, placeholder]) => (
                <div key={key} className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-focus-within:text-emerald-600">{label}</label>
                  
                  {type === "select" ? (
                    <select
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                    >
                      <option value="">Select your gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : type === "textarea" ? (
                    <textarea
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                    />
                  ) : (
                    <input
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      type={type}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                    />
                  )}
                </div>
              ))}

              <div className="pt-6 space-y-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-medium shadow-md hover:from-emerald-600 hover:to-teal-600 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-all duration-300 disabled:opacity-70 flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full bg-white border border-red-500 text-red-500 py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-red-50 focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-all duration-300"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="bg-white py-4 shadow-inner text-center text-gray-600 text-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} EventNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default UserProfile;