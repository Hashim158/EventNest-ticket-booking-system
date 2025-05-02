import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
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
      }, 25000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setNotification({ show: false, type: '', message: '' });
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:9090/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
        
        setNotification({
          show: true,
          type: 'success',
          message: 'Account created successfully! Redirecting to dashboard...'
        });
        
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (res.status === 400) {
        setNotification({
          show: true,
          type: 'info',
          message: 'User already registered. Redirecting to login...'
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error('Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setNotification({
        show: true,
        type: 'error',
        message: 'Something went wrong. Please try again.'
      });
    } finally {
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
            EventNest
          </h1>
          <p className="text-gray-600">Create your account to start hosting events</p>
        </div>

        {error && !notification.show && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <User size={18} />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
                placeholder="Enter your username"
              />
            </div>
          </div>

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
                onChange={e => setEmail(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50"
                placeholder="Create a password"
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
              w-full py-3 rounded-lg text-white font-medium transition duration-200 mt-4
              ${isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'}
            `}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to EventNest's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;