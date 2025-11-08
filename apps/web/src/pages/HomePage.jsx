import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const PricingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Pricing</h3>
        <p className="text-gray-600 mb-6">
          We're working hard to bring you the best scheduling experience. 
          Our pricing plans are coming soon and will be designed to fit your needs!
        </p>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 mb-4">Coming Soon!</p>
          <p className="text-sm text-gray-500 mb-6">Stay tuned for our competitive pricing plans</p>
        </div>
        <button
          onClick={() => setShowPricingModal(false)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  const AboutModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">About Slotify</h3>
        <div className="space-y-4 text-gray-600">
          <p>
            <strong className="text-gray-900">Slotify</strong> is your intelligent scheduling companion that transforms 
            calendar chaos into organized efficiency. We help professionals, teams, and businesses manage their time better.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Smart Scheduling</h4>
                <p className="text-sm">Automatically find the best meeting times based on everyone's availability</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Team Collaboration</h4>
                <p className="text-sm">Seamlessly coordinate with team members and external stakeholders</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900">Time Management</h4>
                <p className="text-sm">Track your productivity and optimize your schedule for maximum efficiency</p>
              </div>
            </div>
          </div>
          
          <p className="border-t pt-4">
            Our mission is to help you focus on what matters most by taking the complexity out of scheduling. 
            Whether you're a freelancer, consultant, or part of a large organization, Slotify adapts to your workflow.
          </p>
        </div>
        
        <button
          onClick={() => setShowAboutModal(false)}
          className="w-full mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Slotify</span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-10">
              <a className="text-base font-medium text-gray-500 hover:text-gray-900 cursor-pointer">Features</a>
              <button 
                onClick={() => setShowPricingModal(true)}
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Pricing
              </button>
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                About
              </button>
            </nav>
            
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium cursor-pointer">Features</a>
              <button 
                onClick={() => setShowPricingModal(true)}
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left"
              >
                Pricing
              </button>
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left"
              >
                About
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-500 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 text-white block px-3 py-2 text-base font-medium w-full text-left rounded-md"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Schedule smarter, <span className="text-blue-600">not harder</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Transform your calendar chaos into organized efficiency. Slotify helps you 
            manage meetings, track availability, and boost productivity with intelligent 
            scheduling.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-lg font-semibold flex items-center justify-center transition-colors"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 text-lg font-semibold transition-colors">
              Watch Demo
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Secure & Reliable
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage your time
            </h2>
            <p className="text-xl text-gray-600 mb-16">
              Powerful features designed to streamline your scheduling workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Calendar</h3>
              <p className="text-gray-600">
                Intelligent scheduling that automatically finds the best meeting times for everyone involved.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Seamlessly coordinate with team members and external stakeholders across time zones.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Analytics</h3>
              <p className="text-gray-600">
                Track your productivity and get insights to optimize your schedule for maximum efficiency.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-white rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to take control of your calendar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who've transformed their scheduling workflow with Slotify.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 text-lg font-semibold inline-flex items-center transition-colors"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </main>

      {/* Modals */}
      {showPricingModal && <PricingModal />}
      {showAboutModal && <AboutModal />}
    </div>
  );
};

export default HomePage;