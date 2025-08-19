import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, Phone, Clock, MapPin, MessageCircle } from 'lucide-react'
import LiveChat from '../components/LiveChat'
import FloatingChat from '../components/FloatingChat'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showLiveChat, setShowLiveChat] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', phone: '', message: '' })
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Get in
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Ready to start your investment journey? Our team is here to help you 
            make informed decisions and achieve your financial goals.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Mail className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Email Us</h3>
              <p className="text-white/70 mb-4">Get in touch via email</p>
              <a href="mailto:support@opessocius.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@opessocius.com
              </a>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Phone className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Call Us</h3>
              <p className="text-white/70 mb-4">Speak with our experts</p>
              <a href="tel:+9715780714671" className="text-blue-400 hover:text-blue-300 transition-colors">
                +971-578-071-4671
              </a>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Clock className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Business Hours</h3>
              <p className="text-white/70 mb-4">When we're available</p>
              <p className="text-blue-400">Mon-Fri: 9AM-6PM</p>
              <p className="text-blue-400">Sat: 10AM-1PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Chat Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            Chat with Us Live
          </h2>
          
          <div className="text-center p-12 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                                    <div className="flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="h-16 w-16 text-slate-300" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-6">Get Instant Support</h3>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Have questions about our investment services? Chat directly with our expert team 
              and get immediate answers to all your queries.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-400 text-xl font-bold">⚡</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Instant Response</h4>
                <p className="text-white/60 text-sm">Get answers within seconds</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-400 text-xl font-bold">👨‍💼</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Expert Support</h4>
                <p className="text-white/60 text-sm">Chat with investment professionals</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 text-xl font-bold">🔒</span>
                </div>
                <h4 className="text-white font-semibold mb-2">Secure & Private</h4>
                <p className="text-white/60 text-sm">Your conversations are confidential</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowLiveChat(true)}
                                        className="inline-flex items-center space-x-3 bg-slate-800 text-white px-10 py-4 rounded-full font-semibold hover:bg-slate-700 transition-all text-lg shadow-lg hover:shadow-xl border border-slate-600"
            >
              <MessageCircle className="h-6 w-6" />
              <span>Start Live Chat</span>
            </button>
            
            <p className="text-white/50 text-sm mt-4">
              Available Monday - Friday, 9:00 AM - 6:00 PM EST
            </p>
          </div>
        </div>
      </section>

      {/* Office Location */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Our Office
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Located in the heart of Dubais financial district.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-6 w-6 text-blue-400 flex-shrink-0" />
                  <span className="text-white/90">673C+W8M - Dubai - United Arab Emirates</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.1234567890123!2d55.290293!3d25.225306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDEzJzMxLjEiTiA1NcKwMTcnMjUuMSJF!5e0!3m2!1sen!2sae!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '16px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Opessocius Office Location"
                ></iframe>
              </div>
            </div>
          </div>
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
            © 2024 Opessocius. All rights reserved. Professional investment management services.
          </p>
        </div>
      </footer>

      {/* Floating Chat */}
      <FloatingChat />
      
      {/* Live Chat Modal */}
      <LiveChat isOpen={showLiveChat} onClose={() => setShowLiveChat(false)} />
    </div>
  )
}

export default ContactPage
