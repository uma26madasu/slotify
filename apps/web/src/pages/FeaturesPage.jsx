// File Path: src/pages/FeaturesPage.jsx
// Create this NEW file in your pages folder

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Zap, Shield, Globe, BarChart3, Bell, ArrowRight } from 'lucide-react';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered scheduling that finds the perfect time for everyone automatically.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'See real-time availability across multiple calendars and time zones.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Coordinate meetings with teams and manage group availability effortlessly.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Zap,
      title: 'Quick Booking',
      description: 'One-click booking with automatic calendar integration and notifications.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with end-to-end encryption for all your data.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Globe,
      title: 'Global Time Zones',
      description: 'Seamlessly schedule across multiple time zones with automatic conversion.',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Get detailed insights into your meeting patterns and productivity metrics.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Intelligent reminders and notifications that adapt to your preferences.',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  const benefits = [
    {
      title: 'Save Time',
      description: 'Reduce scheduling time by 90% with automated conflict detection and resolution.',
      stat: '90%',
      statLabel: 'Time Saved'
    },
    {
      title: 'Increase Productivity',
      description: 'Focus on what matters most while we handle the scheduling complexity.',
      stat: '3x',
      statLabel: 'More Productive'
    },
    {
      title: 'Better Collaboration',
      description: 'Seamless team coordination across different time zones and calendars.',
      stat: '50%',
      statLabel: 'Better Coordination'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Slotify</h1>
            </div>
            <div className="space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Everything you need to manage your schedule efficiently and collaborate seamlessly with your team.
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center text-lg font-medium"
          >
            Try Free for 14 Days
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Scheduling Solution</h2>
            <p className="text-lg text-gray-600">
              From basic scheduling to advanced team coordination, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Teams Choose Slotify</h2>
            <p className="text-lg text-gray-600">
              Real results from real teams who've transformed their scheduling workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{benefit.stat}</div>
                <div className="text-sm text-gray-500 mb-4">{benefit.statLabel}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Slotify Works</h2>
            <p className="text-lg text-gray-600">
              Get started in minutes with our simple 3-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect Your Calendar</h3>
              <p className="text-gray-600">
                Securely connect your Google, Outlook, or Apple calendar in one click.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Set Your Availability</h3>
              <p className="text-gray-600">
                Define your working hours, break times, and scheduling preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Scheduling</h3>
              <p className="text-gray-600">
                Let AI find the perfect times and automatically handle conflicts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Integrates With Your Favorite Tools</h2>
          <p className="text-lg text-gray-600 mb-8">
            Seamlessly connect with the tools you already use every day.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-600">📅 Google</span>
            </div>
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-600">📨 Outlook</span>
            </div>
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-600">🍎 Apple</span>
            </div>
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl font-bold text-gray-600">💬 Slack</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams who've already made scheduling effortless.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center text-lg font-medium"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors text-lg font-medium"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-xl font-bold">Slotify</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 Slotify. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;