import { useState } from 'react'
import { X, Send, AlertTriangle, CheckCircle } from 'lucide-react'
import { api } from '../../lib/api'
import '../../styles/ReportIssueModal.css'

export default function ReportIssueModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('bug')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please fill in all fields.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      await api('/reports', {
        method: 'POST',
        body: JSON.stringify({ title, category, description })
      })

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setTitle('')
        setCategory('bug')
        setDescription('')
        onClose()
      }, 2000)
    } catch (err) {
      console.error('[report-issue] submission failed:', err)
      setErrorMsg(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rim-overlay" onClick={onClose}>
      <div className="rim-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rim-header">
          <h3 className="rim-title">Report Camera or System Issue</h3>
          <button className="rim-close-btn" onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-400 mb-4 animate-bounce" />
            <p className="font-bold text-lg text-emerald-300">Ticket Submitted Successfully</p>
            <p className="text-xs text-[color:var(--muted)] mt-1">Our Super Admins are reviewing your report.</p>
          </div>
        ) : (
          <form className="rim-form" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="rim-group">
              <label className="rim-label">Issue Title</label>
              <input
                type="text"
                placeholder="e.g. Camera 3 Feed Black Screen"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rim-input"
                maxLength={80}
                required
              />
            </div>

            <div className="rim-group">
              <label className="rim-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rim-select"
              >
                <option value="bug">Software Bug / Crash</option>
                <option value="stream_failure">Camera Stream Failure</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>

            <div className="rim-group">
              <label className="rim-label">Description & Steps</label>
              <textarea
                placeholder="Please describe exactly what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rim-textarea"
                maxLength={400}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="rim-submit-btn">
              <Send className="h-4 w-4" />
              {loading ? 'Sending Report...' : 'Send Issue Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
