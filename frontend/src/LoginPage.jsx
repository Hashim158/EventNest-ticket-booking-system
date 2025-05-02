import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNotification({ show: false, type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:9090/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Login failed, please check your credentials'
        });
        setIsLoading(false);
        return;
      }

      const { token } = await response.json();
      const username = email.split('@')[0];
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('email', email);

      setNotification({
        show: true,
        type: 'success',
        message: 'Login successful! Redirecting to dashboard...'
      });

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error during login:', err);
      setNotification({
        show: true,
        type: 'error',
        message: 'Login failed, please check your credentials'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-200 rounded-full opacity-20"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-200 rounded-full opacity-20"></div>
        
        {/* Notification system */}
        {notification.show && (
          <div className={`
            absolute top-4 left-0 right-0 mx-auto w-11/12 p-3 rounded-lg shadow-md transition-all duration-300 transform 
            flex items-center justify-between
            ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
              notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 
              'bg-blue-50 text-blue-800 border border-blue-200'}
          `}>
            <div className="flex items-center">
              {notification.type === 'success' ? <CheckCircle size={18} className="text-green-500 mr-2" /> : 
               notification.type === 'error' ? <AlertCircle size={18} className="text-red-500 mr-2" /> : 
               <AlertCircle size={18} className="text-blue-500 mr-2" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification({...notification, show: false})}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">Log in to your EventNest account</p>
        </div>

        {error && !notification.show && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>



          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3 rounded-lg text-white font-medium transition duration-200 mt-4 flex items-center justify-center
              ${isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'}
            `}
          >
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            New to EventNest?{' '}
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            By logging in, you agree to EventNest's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;