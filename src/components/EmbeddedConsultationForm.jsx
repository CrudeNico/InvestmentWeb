import React, { useState } from 'react'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Globe } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const EmbeddedConsultationForm = () => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consultationType: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showForm, setShowForm] = useState(false)

  const consultationTypes = [
    { id: 'general', label: 'General Consultation', duration: 30 },
    { id: 'portfolio', label: 'Portfolio Review', duration: 45 },
    { id: 'strategy', label: 'Investment Strategy', duration: 60 },
    { id: 'planning', label: 'Financial Planning', duration: 90 }
  ]

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    
    // Add empty days for padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i)
      const isToday = new Date().toDateString() === dayDate.toDateString()
      const isPast = dayDate < new Date(new Date().setHours(0, 0, 0, 0))
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6
      
      days.push({
        date: dayDate,
        day: i,
        isToday,
        isPast,
        isWeekend,
        isAvailable: !isPast && !isWeekend
      })
    }
    
    return days
  }

  const handleDateSelect = (day) => {
    if (day && day.isAvailable) {
      setSelectedDate(day.date)
      setSelectedTime('')
      setShowForm(false)
    }
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !formData.name || !formData.email) {
      return
    }

    setIsSubmitting(true)
    try {
      const consultationData = {
        ...formData,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(collection(db, 'consultations'), consultationData)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({ name: '', email: '', phone: '', message: '', consultationType: 'general' })
        setSelectedDate(null)
        setSelectedTime('')
        setShowForm(false)
      }, 3000)
    } catch (error) {
      console.error('Error booking consultation:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  if (isSuccess) {
    return (
      <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Booking Confirmed!</h3>
        <p className="text-white/70">
          Your consultation has been successfully booked. We'll send you a confirmation email shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto">
      <div className="text-center py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-1">BOOK AN APPOINTMENT</h2>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">
          Schedule Your
          <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent"> Appointment Now</span>
        </h3>
        <p className="text-gray-600 text-sm">Reserve your slot and receive an email confirmation shortly</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-0">
        {/* Left Column - Advisor Information */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full relative overflow-hidden bg-green-500 flex items-center justify-center">
              <img 
                src="/images/advisor-marcos.jpg" 
                alt="Advisor Marcos" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-green-500 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                <span className="text-white font-bold text-sm">A</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-gray-900">Investment Specialist</h3>
              <p className="text-xs text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Live
              </p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Speak to an advisor</h3>
          
          <div className="flex items-center mb-4">
            <Clock className="h-4 w-4 text-gray-600 mr-2" />
            <span className="text-sm text-gray-700">30 min</span>
          </div>

          <div className="space-y-2 mb-6 text-sm text-gray-700">
            <p>Our advisory services are designed to meet your needs at every stage of your financial journey. Whether you're looking for a general consultation to answer specific questions, a portfolio review to evaluate and optimize your current investments, an investment strategy tailored to your goals and risk profile, or a comprehensive financial planning session to structure your long-term future, our experts provide clear, actionable guidance to help you make confident decisions.</p>
          </div>
        </div>

        {/* Right Column - Calendar & Time Selection */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Select a Date & Time</h3>
          
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
            >
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h4 className="text-sm font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h4>
            <button
              onClick={nextMonth}
              className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
            >
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex gap-4">
            {/* Calendar Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="p-1 text-center text-xs font-medium text-gray-500 uppercase">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => (
                  <div key={index} className="p-0.5">
                    {day ? (
                      <button
                        onClick={() => handleDateSelect(day)}
                        disabled={!day.isAvailable}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-all relative ${
                          day.isToday
                            ? 'bg-blue-500 text-white'
                            : selectedDate && selectedDate.toDateString() === day.date.toDateString()
                            ? 'bg-blue-600 text-white'
                            : day.isAvailable
                            ? 'hover:bg-blue-100 text-gray-900'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {day.day}
                        {selectedDate && selectedDate.toDateString() === day.date.toDateString() && (
                          <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ) : (
                      <div className="w-8 h-8"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Time Zone Display */}
              <div className="mb-4">
                <div className="flex items-center text-xs text-gray-600">
                  <Globe className="h-3 w-3 text-gray-500 mr-2" />
                  <span>Central European Summer Time (CEST)</span>
                </div>
              </div>
            </div>

            {/* Time Slots - Appears to the right when date is selected */}
            {selectedDate && (
              <div className="w-32">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`w-full p-2 rounded text-xs font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form - Appears when time is selected */}
          {showForm && selectedTime && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-gray-200 pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Consultation Type
                </label>
                <select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                  {consultationTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label} ({type.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Additional Information
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={2}
                    className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about your investment goals..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || !formData.name || !formData.email || isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-3 w-3" />
                    <span>Book Appointment</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmbeddedConsultationForm
