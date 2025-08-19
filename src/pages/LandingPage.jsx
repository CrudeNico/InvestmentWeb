import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Shield, Users, BarChart3, DollarSign, Calendar } from 'lucide-react'
import EmbeddedConsultationForm from '../components/EmbeddedConsultationForm'
import FloatingChat from '../components/FloatingChat'
import useScrollAnimation from '../hooks/useScrollAnimation'

const LandingPage = () => {
  const statsRef1 = useScrollAnimation()
  const statsRef2 = useScrollAnimation()
  const statsRef3 = useScrollAnimation()
  const statsRef4 = useScrollAnimation()

  // Simple scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const elements = document.querySelectorAll('.animate-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

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
              <Link to="/" className="text-white/80 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Home
              </Link>
              <Link to="/about" className="text-white/80 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                About
              </Link>
              <Link to="/calculator" className="text-white/80 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Calculator
              </Link>
              <Link to="/contact" className="text-white/80 hover:text-white transition-colors" onClick={() => window.scrollTo(0, 0)}>
                Contact
              </Link>
              <Link 
                to="/login" 
                className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-white/90 transition-colors flex items-center space-x-2"
                onClick={() => window.scrollTo(0, 0)}
              >
                <span>Login to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-10 leading-relaxed" style={{ lineHeight: '1.3' }}>
            Opessocius is redefining
            <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              portfolio management
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Opessocius is redefining portfolio management with live performance tracking and transparent monthly reporting — giving investors clarity and control like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-lg border border-blue-400"
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

      {/* Features Section */}
      <section className="py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 mt-8">Why Choose Opessocius</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Real-Time & Monthly Insights</h3>
              <p className="text-white/70">
                Track your portfolio with live performance data, advanced charts, and comprehensive analytics — monthly updates.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Shield className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Secure, Transparent & Certified</h3>
              <p className="text-white/70">
                Your capital is safeguarded with enterprise-grade security. All transactions, and payments are fully transparent and handled by certified Trading 212 ®.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Dedicated Advisor Support</h3>
              <p className="text-white/70">
                Every investor is provided with a personal advisor for tailored investment and direct communication through our integrated chat system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-on-scroll">
              <div className="text-3xl font-bold text-white mb-2">€350k+</div>
              <div className="text-white/70">Assets Under Management</div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-on-scroll">
              <div className="text-3xl font-bold text-white mb-2">23+</div>
              <div className="text-white/70">Active Investors</div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-on-scroll">
              <div className="text-3xl font-bold text-white mb-2">70.2%</div>
              <div className="text-white/70">Annual Return Record</div>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-on-scroll">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/70">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Booking Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Book a Free Consultation
            </h2>
            <p className="text-lg text-white/80">
              Schedule a personalized consultation with our investment experts to discuss your financial goals and explore our services.
            </p>
          </div>
          <EmbeddedConsultationForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of successful investors who trust Opessocius with their portfolios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all text-lg border border-blue-400"
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

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/50">
            © 2025 Opessocius. All rights reserved. Investment services provided under applicable regulatory licenses.
          </p>
        </div>
      </footer>

      {/* Floating Chat */}
      <FloatingChat />
    </div>
  )
}

export default LandingPage
