import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "../firebase/auth";
import { oauth } from '../config/oauth';
import { Calendar, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AuthForm() {
  console.log("NEW AUTHFORM LOADED!"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (isLogin) {
        await signIn(email, password);
        console.log("Logged in successfully!");
        navigate('/dashboard');
      } else {
        await signUp(email, password, name);
        console.log("Account created!");
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("BUTTON CLICKED!"); // Debug line
    setLoading(true);
    setError("");
    
    try {
      await oauth.loginWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Google sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-10 w-10 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Slotify</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Join Slotify today'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (only for signup) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : null}
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              className="w-5 h-5 mr-2" 
            />
            Continue with Google
          </button>
        </div>

        {/* Toggle Login/Signup */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setName("");
              setEmail("");
              setPassword("");
            }}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        {/* Features Preview */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">What you'll get:</p>
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Smart AI-powered scheduling
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Google Calendar integration
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Team collaboration tools
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}