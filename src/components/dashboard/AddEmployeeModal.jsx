import { useState, useRef, useCallback } from 'react'
import { X, UserPlus, Upload, ImagePlus, Trash2, Sparkles } from 'lucide-react'
import { cn } from '../../lib/ui'
import { useDashboard } from '../../context/useDashboard'
import { useNavigate } from 'react-router-dom'

export function AddEmployeeModal({ isOpen, onClose }) {
  const { addEmployee } = useDashboard()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    supervisor: '',
    shift: 'Morning (8:00 AM - 4:00 PM)',
  })


  const handlePhotoSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB')
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5 MB')
        return
      }
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPhotoPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }, [])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    handlePhotoSelect(file)
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const generatedId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`

    // If there's a photo, upload it first
    let photoUrl = null
    if (photoFile) {
      try {
        const uploadData = new FormData()
        uploadData.append('photo', photoFile)
        uploadData.append('employeeId', generatedId)
        
        const token = localStorage.getItem('shinka-token')
        const uploadRes = await fetch('/api/employees/upload-photo', {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: uploadData,
        })
        
        if (uploadRes.ok) {
          const uploadResult = await uploadRes.json()
          photoUrl = uploadResult.photoUrl
        }
      } catch (err) {
        console.error('Photo upload failed:', err)
        // Continue without photo
      }
    }

    const newEmployee = {
      name: formData.name,
      role: formData.role,
      score: 85,
      delta: '+0',
      strengths: 'New employee',
      photoUrl,
      metrics: {
        facialExpression: 85,
        verbalExpression: 85,
        greetingBehavior: 85,
        responseTime: '10s',
      },
      info: {
        interactionsToday: 0,
        riskLevel: 'Low',
        peakStation: 'N/A',
        lastCoaching: 'N/A',
        customerSatisfaction: 'N/A',
        issueResolutionRate: 'N/A',
        averageHandlingTime: 'N/A',
      },
      profile: {
        employeeId: generatedId,
        shift: formData.shift,
        tenure: '0 months',
        supervisor: formData.supervisor,
        certifications: [],
        weeklyScores: [
          { day: 'Mon', score: 85 },
          { day: 'Tue', score: 85 },
          { day: 'Wed', score: 85 },
          { day: 'Thu', score: 85 },
          { day: 'Fri', score: 85 },
        ],
        recentSessions: [],
      },
    }
    
    await addEmployee(newEmployee)
    setIsSubmitting(false)
    onClose()
    navigate(`/employees/${generatedId}`)
    
    // Reset form
    setFormData({ name: '', role: '', supervisor: '', shift: 'Morning (8:00 AM - 4:00 PM)' })
    setPhotoPreview(null)
    setPhotoFile(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const inputClass = 'w-full rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-strong)] px-4 py-3 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent-blue)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-blue)] transition'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-[color:var(--line)] bg-[color:var(--bg-panel)] shadow-2xl overflow-hidden animate-[modalSlideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--line)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--accent-blue-soft)]">
              <UserPlus className="h-4.5 w-4.5 text-[color:var(--accent-blue)]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[color:var(--text)]">
                Add New Employee
              </h2>
              <p className="text-xs text-[color:var(--muted)]">Fill in the details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[color:var(--muted)] hover:bg-[color:var(--bg-strong)] hover:text-[color:var(--text)] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Photo Upload */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                Employee Photo
                <span className="ml-2 text-xs font-normal text-[color:var(--muted)]">
                  Used for AI facial recognition
                </span>
              </label>
              
              {photoPreview ? (
                /* Photo Preview */
                <div className="relative group">
                  <div className="flex items-center gap-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--bg-strong)] p-3 transition">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      <img 
                        src={photoPreview} 
                        alt="Employee preview" 
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[color:var(--text)] truncate">
                        {photoFile?.name}
                      </p>
                      <p className="text-xs text-[color:var(--muted)] mt-1">
                        {(photoFile?.size / 1024).toFixed(1)} KB · Ready for upload
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          AI Processing Ready
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-lg p-2 text-[color:var(--muted)] hover:bg-red-500/10 hover:text-red-500 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Zone */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all duration-200',
                    isDragging 
                      ? 'border-[color:var(--accent-blue)] bg-[color:var(--accent-blue-soft)] scale-[1.02]' 
                      : 'border-[color:var(--line)] bg-[color:var(--bg-strong)] hover:border-[color:var(--accent-blue)] hover:bg-[color:var(--accent-blue-soft)]'
                  )}
                >
                  <div className={cn(
                    'grid h-12 w-12 place-items-center rounded-full transition-colors',
                    isDragging
                      ? 'bg-[color:var(--accent-blue)] text-white'
                      : 'bg-[color:var(--bg-panel)] text-[color:var(--muted)]'
                  )}>
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[color:var(--text)]">
                      {isDragging ? 'Drop image here' : 'Upload employee photo'}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">
                      Drag & drop or click to browse · PNG, JPG up to 5 MB
                    </p>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Name & Role row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sarah Johnson"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                  Role
                </label>
                <input
                  type="text"
                  required
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="e.g. Cashier"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Supervisor */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                Supervisor
              </label>
              <input
                type="text"
                required
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                placeholder="e.g. Michael Chen"
                className={inputClass}
              />
            </div>

            {/* Shift Selection */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[color:var(--text)]">
                Shift Assignment
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'Morning (8:00 AM - 4:00 PM)', label: 'Morning', time: '8 AM – 4 PM', icon: '🌅' },
                  { value: 'Midday (10:00 AM - 6:00 PM)', label: 'Midday', time: '10 AM – 6 PM', icon: '☀️' },
                  { value: 'Evening (1:00 PM - 9:00 PM)', label: 'Evening', time: '1 PM – 9 PM', icon: '🌙' },
                ].map((shift) => (
                  <button
                    key={shift.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, shift: shift.value }))}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 transition',
                      formData.shift === shift.value
                        ? 'border-[color:var(--accent-blue)] bg-[color:var(--accent-blue-soft)] text-[color:var(--accent-blue)]'
                        : 'border-[color:var(--line)] bg-[color:var(--bg-strong)] text-[color:var(--muted)] hover:border-[color:var(--text)]'
                    )}
                  >
                    <span className="text-lg">{shift.icon}</span>
                    <span className="text-xs font-bold">{shift.label}</span>
                    <span className="text-[10px] opacity-70">{shift.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-[color:var(--text)] transition hover:bg-[color:var(--bg-strong)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-[color:var(--accent-blue)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal animation keyframes (injected inline) */}
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  )
}
