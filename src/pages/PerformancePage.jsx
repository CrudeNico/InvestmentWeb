import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, BarChart3, DollarSign, Calendar, Target, Zap, Shield, Users } from 'lucide-react'
import PerformanceGraph from '../components/PerformanceGraph'
import EmbeddedConsultationForm from '../components/EmbeddedConsultationForm'
import FloatingChat from '../components/FloatingChat'

const PerformancePage = () => {



  
  // Sample performance data for demonstration
  const performanceData = [
    { year: 2020, return: 22.5, benchmark: 18.2 },
    { year: 2021, return: 38.7, benchmark: 21.1 },
    { year: 2022, return: 45.3, benchmark: 26.8 },
    { year: 2023, return: 42.1, benchmark: 32.4 },
    { year: 2024, return: 75.2, benchmark: 45.7 }
  ]



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-white">Opessocius</Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-white/80 hover:text-white transition-colors">
                About
              </Link>
              <Link to="/calculator" className="text-white/80 hover:text-white transition-colors">
                Calculator
              </Link>
              <Link to="/contact" className="text-white/80 hover:text-white transition-colors">
                Contact
              </Link>
              <Link 
                to="/login" 
                className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-white/90 transition-colors flex items-center space-x-2"
              >
                <span>Login to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Investment
            <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Performance
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Discover our track record of consistent, above-market returns. 
            Transparent performance data that speaks for itself.
          </p>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-12 w-12 text-slate-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">41.5%</div>
              <div className="text-white/70">Average Annual Return</div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-12 w-12 text-slate-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">+12%</div>
              <div className="text-white/70">vs Market Benchmark</div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-12 w-12 text-slate-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">€300k+</div>
              <div className="text-white/70">Assets Under Management</div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-12 w-12 text-slate-300" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">3+</div>
              <div className="text-white/70">Years Track Record</div>
            </div>
          </div>
        </div>
      </section>

      {/* Annual Performance */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            Annual Performance
          </h2>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-6">
                {performanceData.map((data, index) => (
                  <div key={data.year} className="flex items-center justify-between p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{data.year}</span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{data.year}</div>
                        <div className="text-white/60 text-sm">vs Benchmark</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">+{data.return}%</div>
                      <div className="text-white/60 text-sm">Benchmark: +{data.benchmark}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <PerformanceGraph />
            </div>
          </div>
        </div>
      </section>



      {/* Investment Strategy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Our Investment Strategy
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                We employ a diversified, data-driven approach that combines traditional investment principles with advanced AI and machine learning–driven trading systems, real-time market status monitoring, and rigorous market analysis.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                  <span className="text-white/90">Diversified portfolio allocation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                  <span className="text-white/90">Risk-adjusted return optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                  <span className="text-white/90">Real-time market monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-slate-700 rounded-full"></div>
                  <span className="text-white/90">Dynamic rebalancing strategies</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Target className="h-24 w-24 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Access Your Personal Dashboard?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Get real-time access to your portfolio performance, detailed analytics, and expert insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center space-x-2 bg-slate-800 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-700 transition-all text-lg border border-slate-600"
            >
              <span>Get Started Today</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center space-x-2 bg-white text-slate-800 px-8 py-4 rounded-full font-semibold hover:bg-slate-100 transition-all text-lg border border-slate-200"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Consultation Booking Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <EmbeddedConsultationForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/50">
            © 2024 Opessocius. All rights reserved. Professional investment management services.
          </p>
        </div>
      </footer>

      {/* Floating Chat */}
      <FloatingChat />
    </div>
  )
}

export default PerformancePage
