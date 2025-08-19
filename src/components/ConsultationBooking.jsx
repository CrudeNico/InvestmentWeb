import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, X, CheckCircle, Globe } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

const ConsultationBooking = ({ isOpen, onClose }) => {
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
    }
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
        onClose()
        setIsSuccess(false)
        setFormData({ name: '', email: '', phone: '', message: '', consultationType: 'general' })
        setSelectedDate(null)
        setSelectedTime('')
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

  if (!isOpen) return null

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your consultation has been successfully booked. We'll send you a confirmation email shortly.
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center py-8 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">BOOK AN APPOINTMENT</h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Schedule Your
            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent"> Appointment Now</span>
          </h2>
          <p className="text-gray-600">Reserve your slot and receive an email confirmation shortly</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Column - Advisor Information */}
          <div className="p-8 bg-gray-50">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">O</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full"></div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Opessocius Investment</h3>
                <p className="text-gray-600">Professional Investment Management</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Speak to an advisor</h3>
            
            <div className="flex items-center mb-6">
              <Clock className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-gray-700">30 min</span>
            </div>

            <div className="space-y-3 mb-8">
              <p className="text-gray-700">Microsoft Teams for outside UAE and</p>
              <p className="text-gray-700">6th Floor, Meydan Hotel</p>
              <p className="text-gray-700">Meydan Racecourse Al Meydan Road, Nad Al Sheba - Dubai - United Arab Emirates</p>
            </div>

            <div className="text-sm text-blue-600">
              <a href="#" className="hover:underline">Cookie settings</a>
            </div>
          </div>

          {/* Right Column - Calendar & Form */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Select a Date & Time</h3>
            
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h4 className="text-lg font-semibold text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h4>
              <button
                onClick={nextMonth}
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 uppercase">
                  {day}
                </div>
              ))}
              {days.map((day, index) => (
                <div key={index} className="p-1">
                  {day ? (
                    <button
                      onClick={() => handleDateSelect(day)}
                      disabled={!day.isAvailable}
                      className={`w-full h-10 rounded-full text-sm font-medium transition-all relative ${
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
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  ) : (
                    <div className="w-full h-10"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Time Zone Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time zone</label>
              <div className="flex items-center p-3 border border-gray-300 rounded-lg bg-white">
                <Globe className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-gray-900">Asia/Dubai (GMT+4)</span>
                <svg className="h-4 w-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Available Times for {selectedDate.toLocaleDateString()}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Type
                </label>
                <select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {consultationTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label} ({type.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about your investment goals..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || !formData.name || !formData.email || isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5" />
                    <span>Book Appointment</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

export default ConsultationBooking
