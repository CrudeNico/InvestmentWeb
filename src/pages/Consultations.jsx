import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, XCircle, Clock as ClockIcon, Eye, X, Send, Link as LinkIcon } from 'lucide-react'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import emailService from '../firebase/emailService'

const Consultations = () => {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [filter, setFilter] = useState('all')
  const [meetLinkData, setMeetLinkData] = useState({
    email: '',
    meetLink: '',
    consultationId: ''
  })
  const [sendingMeetLink, setSendingMeetLink] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const consultationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setConsultations(consultationsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleStatusUpdate = async (consultationId, newStatus) => {
    try {
      // Find the consultation to get user details
      const consultation = consultations.find(c => c.id === consultationId)
      
      // Update the status in Firestore
      await updateDoc(doc(db, 'consultations', consultationId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      })

      // Send confirmation email if status is changed to 'confirmed'
      if (newStatus === 'confirmed' && consultation) {
        try {
          const consultationDetails = {
            type: consultationTypes[consultation.consultationType] || consultation.consultationType,
            date: formatDate(consultation.date),
            time: formatTime(consultation.time)
          }
          
          await emailService.sendConsultationConfirmation(
            consultation.email,
            consultation.name,
            consultationDetails
          )
        } catch (emailError) {
          console.error('Failed to send consultation confirmation email:', emailError)
          // Don't block status update if email fails
        }
      }
    } catch (error) {
      console.error('Error updating consultation status:', error)
    }
  }

  const handleSendMeetLink = async () => {
    if (!meetLinkData.email || !meetLinkData.meetLink || !meetLinkData.consultationId) {
      alert('Please fill in all fields')
      return
    }

    setSendingMeetLink(true)
    try {
      const consultation = consultations.find(c => c.id === meetLinkData.consultationId)
      if (!consultation) {
        throw new Error('Consultation not found')
      }

      const consultationDetails = {
        type: consultationTypes[consultation.consultationType] || consultation.consultationType,
        date: formatDate(consultation.date),
        time: formatTime(consultation.time)
      }

      await emailService.sendGoogleMeetLink(
        meetLinkData.email,
        consultation.name,
        consultationDetails,
        meetLinkData.meetLink
      )

      alert('Google Meet link sent successfully!')
      setMeetLinkData({ email: '', meetLink: '', consultationId: '' })
    } catch (error) {
      console.error('Error sending Google Meet link:', error)
      alert('Failed to send Google Meet link: ' + error.message)
    } finally {
      setSendingMeetLink(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const consultationTypes = {
    general: 'General Consultation',
    portfolio: 'Portfolio Review',
    strategy: 'Investment Strategy',
    planning: 'Financial Planning'
  }

  const filteredConsultations = consultations.filter(consultation => {
    if (filter === 'all') return true
    return consultation.status === filter
  })

  const formatDate = (date) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString()
    }
    if (date instanceof Date) {
      return date.toLocaleDateString()
    }
    return 'N/A'
  }

  const formatTime = (time) => {
    return time || 'N/A'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
            <p className="text-gray-600">Manage consultation bookings</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-600">Manage consultation bookings and schedules</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Consultations</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Meet Link Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Send Google Meet Link</h3>
          <p className="text-sm text-gray-600">Send meeting link 5 minutes before consultation</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Consultation</label>
              <select
                value={meetLinkData.consultationId}
                onChange={(e) => {
                  const consultation = consultations.find(c => c.id === e.target.value)
                  setMeetLinkData(prev => ({
                    ...prev,
                    consultationId: e.target.value,
                    email: consultation ? consultation.email : ''
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Select a consultation...</option>
                {consultations.filter(c => c.status === 'confirmed').map(consultation => (
                  <option key={consultation.id} value={consultation.id}>
                    {consultation.name} - {formatDate(consultation.date)} {formatTime(consultation.time)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={meetLinkData.email}
                onChange={(e) => setMeetLinkData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Meet Link</label>
              <input
                type="url"
                value={meetLinkData.meetLink}
                onChange={(e) => setMeetLinkData(prev => ({ ...prev, meetLink: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSendMeetLink}
              disabled={sendingMeetLink || !meetLinkData.email || !meetLinkData.meetLink || !meetLinkData.consultationId}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendingMeetLink ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Google Meet Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredConsultations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
              <p className="text-gray-600">No consultation bookings match your current filter.</p>
            </div>
          ) : (
            filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {consultation.name}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                          {getStatusIcon(consultation.status)}
                          <span className="ml-1 capitalize">{consultation.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {consultation.email}
                        </span>
                        {consultation.phone && (
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {consultation.phone}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(consultation.date)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(consultation.time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {consultationTypes[consultation.consultationType] || consultation.consultationType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedConsultation(consultation)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {consultation.status === 'pending' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleStatusUpdate(consultation.id, 'confirmed')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
                          className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {consultation.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(consultation.id, 'completed')}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Consultation Details</h2>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedConsultation.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedConsultation.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedConsultation.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                  <p className="text-gray-900">
                    {consultationTypes[selectedConsultation.consultationType] || selectedConsultation.consultationType}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{formatDate(selectedConsultation.date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <p className="text-gray-900">{formatTime(selectedConsultation.time)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedConsultation.status)}`}>
                    {getStatusIcon(selectedConsultation.status)}
                    <span className="ml-1 capitalize">{selectedConsultation.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booked On</label>
                  <p className="text-gray-900">{formatDate(selectedConsultation.createdAt)}</p>
                </div>
              </div>
              
              {selectedConsultation.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedConsultation.message}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedConsultation(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {selectedConsultation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedConsultation.id, 'confirmed')
                        setSelectedConsultation(null)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedConsultation.id, 'cancelled')
                        setSelectedConsultation(null)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {selectedConsultation.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedConsultation.id, 'completed')
                      setSelectedConsultation(null)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Consultations
