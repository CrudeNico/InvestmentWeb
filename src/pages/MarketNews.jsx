import React, { useEffect, useState } from 'react'
import { TrendingUp, ExternalLink, Newspaper, Globe, BarChart3, Edit, Save, X, Trash2, Plus, Image as ImageIcon, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { newsSourcesServices } from '../firebase/services'
import { defaultNewsSources } from '../config/newsSources'

const MarketNews = () => {
  const { getUserRole } = useAuth()
  const [newsSources, setNewsSources] = useState([])
  const [editingSource, setEditingSource] = useState(null)
  const [editForm, setEditForm] = useState({ 
    name: '', 
    description: '', 
    url: '', 
    icon: 'newspaper',
    imageUrl: '',
    author: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const isAdmin = getUserRole() === 'admin'

  // Load news sources
  useEffect(() => {
    const loadNewsSources = async () => {
      try {
        const sources = await newsSourcesServices.getNewsSources()
        setNewsSources(sources)
      } catch (error) {
        console.error('Error loading news sources:', error)
        setNewsSources([])
      } finally {
        setIsLoading(false)
      }
    }

    loadNewsSources()
  }, [])

  // Listen to news sources changes
  useEffect(() => {
    const unsubscribe = newsSourcesServices.onNewsSourcesChange((sources) => {
      setNewsSources(sources)
    })

    // Store unsubscribe function globally for access during clear operation
    window.newsSourcesUnsubscribe = unsubscribe

    return () => unsubscribe()
  }, [])

  const handleEdit = (source) => {
    setEditingSource(source.id)
    setEditForm({
      name: source.name,
      description: source.description,
      url: source.url,
      icon: source.icon || 'newspaper',
      imageUrl: source.imageUrl || '',
      author: source.author || '',
      date: source.date || new Date().toISOString().split('T')[0]
    })
    setImagePreview(source.imageUrl || null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (editingSource === 'new') {
        // Add new source
        await newsSourcesServices.addNewsSource(editForm)
      } else {
        // Update existing source
        await newsSourcesServices.updateNewsSource(editingSource, editForm)
      }
      setEditingSource(null)
      setEditForm({ 
        name: '', 
        description: '', 
        url: '', 
        icon: 'newspaper',
        imageUrl: '',
        author: '',
        date: new Date().toISOString().split('T')[0]
      })
      setImagePreview(null)
    } catch (error) {
      console.error('Error saving news source:', error)
      alert('Failed to save news source. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingSource(null)
    setEditForm({ 
      name: '', 
      description: '', 
      url: '', 
      icon: 'newspaper',
      imageUrl: '',
      author: '',
      date: new Date().toISOString().split('T')[0]
    })
    setImagePreview(null)
  }

  // Function to add new news source
  const handleAddNewSource = () => {
    setEditForm({ 
      name: '', 
      description: '', 
      url: '', 
      icon: 'newspaper',
      imageUrl: '',
      author: '',
      date: new Date().toISOString().split('T')[0]
    })
    setImagePreview(null)
    setEditingSource('new') // Use 'new' to indicate adding a new source
  }

  // Function to delete news source
  const handleDeleteSource = async (sourceId) => {
    if (!isAdmin) return
    
    if (window.confirm('Are you sure you want to delete this news source?')) {
      setDeletingId(sourceId)
      try {
        await newsSourcesServices.deleteNewsSource(sourceId)
        console.log('News source deleted')
      } catch (error) {
        console.error('Error deleting news source:', error)
        alert('Failed to delete news source. Please try again.')
      } finally {
        setDeletingId(null)
      }
    }
  }

  // Function to clear all news sources
  const handleClearAllSources = async () => {
    if (!isAdmin) return
    
    if (window.confirm('Are you sure you want to delete ALL news sources? This action cannot be undone.')) {
      try {
        console.log('Current sources before clearing:', newsSources.length)
        
        // Temporarily disable real-time listener
        const currentUnsubscribe = window.newsSourcesUnsubscribe
        if (currentUnsubscribe) {
          currentUnsubscribe()
        }
        
        await newsSourcesServices.clearAllNewsSources()
        console.log('All news sources cleared')
        
        // Force refresh the sources list
        setTimeout(async () => {
          const sources = await newsSourcesServices.getNewsSources()
          console.log('Sources after clearing:', sources.length)
          setNewsSources(sources)
          
          // Re-enable real-time listener
          if (currentUnsubscribe) {
            const newUnsubscribe = newsSourcesServices.onNewsSourcesChange((sources) => {
              setNewsSources(sources)
            })
            window.newsSourcesUnsubscribe = newUnsubscribe
          }
        }, 1000)
      } catch (error) {
        console.error('Error clearing news sources:', error)
      }
    }
  }

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'newspaper':
        return <Newspaper className="h-4 w-4" />
      case 'barChart3':
        return <BarChart3 className="h-4 w-4" />
      case 'globe':
        return <Globe className="h-4 w-4" />
      case 'trendingUp':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Newspaper className="h-4 w-4" />
    }
  }

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setEditForm({ ...editForm, imageUrl: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  // Load TradingView widget with lazy loading
  useEffect(() => {
    const loadWidget = () => {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => {
        if (window.TradingView) {
          try {
            new window.TradingView.widget({
              container_id: 'tradingview-market-news-widget',
              symbol: 'USOIL',
              interval: '60',
              timezone: 'Etc/UTC',
              theme: 'light',
              style: '1',
              locale: 'en',
              enable_publishing: false,
              allow_symbol_change: false,
              hide_side_toolbar: true,
              hide_top_toolbar: true,
              hide_legend: true,
              save_image: false,
              backgroundColor: 'rgba(255, 255, 255, 1)',
              gridColor: 'rgba(240, 243, 250, 0)',
              width: '100%',
              height: '500',
              studies: [],
              disabled_features: [
                'use_localstorage_for_settings',
                'volume_force_overlay',
                'create_volume_indicator_by_default',
                'header_symbol_search',
                'header_compare',
                'header_settings',
                'header_fullscreen_button',
                'header_screenshot',
                'timeframes_toolbar',
                'edit_buttons_in_legend',
                'context_menus',
                'border_around_the_chart',
                'header_saveload',
                'control_bar',
                'countdown',
                'display_market_status',
                'chart_property_page_background',
                'compare_symbol',
                'high_density_bars',
                'study_templates',
                'side_toolbar_in_fullscreen_mode',
                'tracking',
                'analytics',
                'snowplow_tracking'
              ],
              enabled_features: [
                'hide_left_toolbar_by_default'
              ],
              overrides: {
                'paneProperties.background': 'rgba(255, 255, 255, 1)',
                'paneProperties.vertGridProperties.color': 'rgba(240, 243, 250, 0.5)',
                'paneProperties.horzGridProperties.color': 'rgba(240, 243, 250, 0.5)'
              }
            })
          } catch (error) {
            console.warn('TradingView widget failed to load:', error)
          }
        }
      }
      document.head.appendChild(script)
    }

    // Lazy load the widget after a short delay
    const timeoutId = setTimeout(loadWidget, 100)

    return () => {
      clearTimeout(timeoutId)
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Market News</h1>
        <p className="text-gray-600">Real-time USOIL chart and oil market news sources</p>
      </div>

      {/* USOIL Chart */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">USOIL Real-Time Chart</h2>
          <p className="text-sm text-gray-500">Live 1-hour interval chart for US Oil</p>
        </div>
        <div className="h-[500px]">
          <div id="tradingview-market-news-widget" className="w-full h-full"></div>
        </div>
      </div>

      {/* Market News Sources */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Oil Market News Sources</h2>
              <p className="text-sm text-gray-500">
                {isAdmin ? 'Click edit icon to modify sources' : 'Click any source to open in a new tab'}
              </p>
            </div>
            {isAdmin && (
              <div className="flex space-x-2">
                <button
                  onClick={handleClearAllSources}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  title="Clear all news sources"
                >
                  Clear All
                </button>
                <button
                  onClick={handleAddNewSource}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors w-8 h-8 flex items-center justify-center"
                  title="Add new news source"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading news sources...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* New Source Card */}
            {editingSource === 'new' && (
              <div className="p-6 border border-primary-300 rounded-lg bg-primary-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Employee Visas and Sponsorship in Dubai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={editForm.author}
                      onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Anish Rajan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://www.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Click to upload image</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Add Source
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {newsSources.map((source) => (
              <div key={source.id} className="relative">
                {editingSource === source.id ? (
                  // Edit Mode
                  <div className="p-6 border border-primary-300 rounded-lg bg-primary-50">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Author
                        </label>
                        <input
                          type="text"
                          value={editForm.author}
                          onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website URL
                        </label>
                        <input
                          type="url"
                          value={editForm.url}
                          onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image
                        </label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id={`image-upload-${source.id}`}
                          />
                          <label
                            htmlFor={`image-upload-${source.id}`}
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors"
                          >
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-center">
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Click to upload image</span>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                          disabled={isSaving}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode - Card Layout
                  <div className="relative">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                    >
                      {/* Image */}
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        {source.imageUrl ? (
                          <img
                            src={source.imageUrl}
                            alt={source.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-500">
                            <Newspaper className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {source.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {source.author || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {source.date ? new Date(source.date).toLocaleDateString() : 'No date'}
                        </p>
                      </div>
                    </a>
                    
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEdit(source)
                          }}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors bg-white rounded-lg shadow-sm hover:shadow-md"
                          title="Edit news source"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteSource(source.id)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg shadow-sm hover:shadow-md"
                          title="Delete news source"
                          disabled={deletingId === source.id}
                        >
                          {deletingId === source.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketNews
