import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Shield, Users, Star, Award, Target, Zap, BarChart3, DollarSign, Clock, Quote } from 'lucide-react'
import EmbeddedConsultationForm from '../components/EmbeddedConsultationForm'
import FloatingChat from '../components/FloatingChat'

const AboutPage = () => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  const reviews = [
    {
      id: 1,
      name: "Sarah Jansen",
      role: "Retirement Investor",
      rating: 5,
      text: "Opessocius has transformed my retirement planning. The transparency and consistent returns have given me confidence in my financial future. I've seen my portfolio grow steadily month after month.",
      avatar: "SJ",
      image: "/images/InvestorSara.jpg"
    },
    {
      id: 2,
      name: "Jaime Garcia",
      role: "Tech Entrepreneur",
      rating: 5,
      text: "As someone who's always been skeptical of investment platforms, Opessocius has completely changed my perspective. The real-time tracking and professional approach make all the difference.",
      avatar: "JG",
      image: "/images/InvestorJaime.jpg"
    },
    {
      id: 3,
      name: "Manuel Lopez",
      role: "Small Business Owner",
      rating: 5,
      text: "I was looking for a reliable investment partner for my business profits. Opessocius delivered beyond my expectations. The monthly reports are detailed and the growth has been impressive.",
      avatar: "ML",
      image: "/images/InvestorManuel.jpg"
    },
    {
      id: 4,
      name: "Ali Khan",
      role: "Real Estate Investor",
      rating: 5,
      text: "After trying several investment platforms, Opessocius stands out for its transparency and performance. The compound interest strategy has significantly boosted my returns.",
      avatar: "AK",
      image: "/images/InvestorToby.jpg"
    },
    {
      id: 5,
      name: "Elias Mulder",
      role: "Healthcare Professional",
      rating: 5,
      text: "The passive investment option with Opessocius has been perfect for my busy schedule. I can focus on my career while knowing my money is working hard for me.",
      avatar: "EM",
      image: "/images/Investorelias.jpg"
    },
    {
      id: 6,
      name: "Elmira Ortez",
      role: "Retired Teacher",
      rating: 5,
      text: "I was worried about investing at my age, but Opessocius made it simple and secure. The regular updates and professional support have given me peace of mind.",
      avatar: "EO",
      image: "/images/InvestorElmira.jpg"
    }
  ]

  // Auto-shuffle reviews - faster cycle (3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [reviews.length])

  // Scroll animation for Core Values and Expertise sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('Section in view:', entry.target)
            // Find all animate-on-scroll elements within this section
            const animatedElements = entry.target.querySelectorAll('.animate-on-scroll')
            animatedElements.forEach((el, index) => {
              setTimeout(() => {
                console.log('Animating element:', el)
                el.classList.add('in-view')
              }, index * 200) // Stagger the animations
            })
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    // Observe the section containers
    if (coreValuesRef.current) {
      console.log('Observing Core Values section')
      observer.observe(coreValuesRef.current)
    }
    if (expertiseRef.current) {
      console.log('Observing Expertise section')
      observer.observe(expertiseRef.current)
    }

    return () => {
      if (coreValuesRef.current) observer.unobserve(coreValuesRef.current)
      if (expertiseRef.current) observer.unobserve(expertiseRef.current)
    }
  }, [])

  const currentReview = reviews[currentReviewIndex]
  
  // Refs for animation sections
  const coreValuesRef = useRef(null)
  const expertiseRef = useRef(null)

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
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            About
            <span className="block bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              Opessocius
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            We are a leading investment management platform dedicated to providing transparent, 
            data-driven investment strategies for discerning investors worldwide.
          </p>
        </div>
      </section>

      {/* Investor Reviews Section - Moved before Mission */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">What Our Investors Say</h2>
          
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 relative overflow-hidden">
            {/* Review Content */}
            <div className="text-center relative z-10">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(currentReview.rating)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Review Text */}
              <blockquote className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed italic">
                "{currentReview.text}"
              </blockquote>
              
              {/* Reviewer Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                  {currentReview.image ? (
                    <img 
                      src={currentReview.image} 
                      alt={currentReview.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center" style={{ display: currentReview.image ? 'none' : 'flex' }}>
                    <span className="text-white font-bold text-sm">{currentReview.avatar}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">{currentReview.name}</div>
                  <div className="text-white/70 text-sm">{currentReview.role}</div>
                </div>
              </div>
            </div>
            
            {/* Review Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReviewIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentReviewIndex 
                      ? 'bg-white' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Review Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-white/70 text-sm">Average Rating</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-2">23+</div>
              <div className="text-white/70 text-sm">Happy Investors</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-white mb-2">98%</div>
              <div className="text-white/70 text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Our Mission</h2>
          <p className="text-xl text-white/80 leading-relaxed">
            To redefine individual investing by delivering the precision, transparency, and strategic insight 
            once reserved for institutions, enabling clients to navigate markets with clarity and achieve lasting success.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section ref={coreValuesRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow animate-on-scroll">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Award className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Excellence</h3>
              <p className="text-white/70">
                We pursue excellence in every aspect — from our investment strategies to customer service and platform development — outperforming industry standards.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow animate-on-scroll">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Shield className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Transparency</h3>
              <p className="text-white/70">
                We maintain complete transparency in our operations, performance metrics, and investment decisions, supported by active social media engagement.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow animate-on-scroll">
              <div className="flex items-center justify-center mx-auto mb-6">
                <Zap className="h-12 w-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Innovation</h3>
              <p className="text-white/70">
                We continually advance our platform and strategies, integrating AI-powered trading bots to deliver cutting-edge solutions that keep our investors ahead in the market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section ref={expertiseRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">Our Expertise</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow animate-on-scroll">
              <div className="text-4xl font-bold text-slate-300 mb-4">7+</div>
              <h3 className="text-xl font-bold text-white mb-2">Years Experience</h3>
              <p className="text-white/70">In investment management</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow animate-on-scroll">
              <div className="text-4xl font-bold text-slate-300 mb-4">5+</div>
              <h3 className="text-xl font-bold text-white mb-2">Investment Experts</h3>
              <p className="text-white/70">Certified professionals</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover-lift hover-glow animate-on-scroll">
              <div className="text-4xl font-bold text-slate-300 mb-4">95%</div>
              <h3 className="text-xl font-bold text-white mb-2">Investor Retention Rate</h3>
              <p className="text-white/70">Clients who continue investing with us</p>
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

export default AboutPage
