import { useState } from 'react'
import { createReport } from '../api/reports'
import { useEscapeKey } from '../hooks/useEscapeKey'

const REPORT_TYPES = [
  { value: 'city_request', label: 'Request city' },
  { value: 'bug', label: 'Bug report' },
  { value: 'update_request', label: 'Request an update' },
  { value: 'removal_request', label: 'Request removal' },
  { value: 'other', label: 'Other' },
]

function ReportForm({ onClose }) {
  const [type, setType] = useState('city_request')
  const [message, setMessage] = useState('')
  const [about, setAbout] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEscapeKey(onClose)

  const canSave = message.trim().length > 0 && !saving

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSave) return

    setSaving(true)
    setError(null)

    try {
      await createReport({ type, message, about, contactEmail })
      setSubmitted(true)
    } catch {
      setError("Couldn't submit this right now. Please try again.")
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(event) => event.stopPropagation()}>
          <h3 className="modal__title">Thanks!</h3>
          <p className="city-panel__message">Your report was submitted.</p>
          <div className="modal__actions">
            <button type="button" className="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="modal__title">Report an Issue</h3>

        <label className="field">
          <span className="field__label">Type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {REPORT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">What's this about? (optional)</span>
          <input
            type="text"
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            placeholder="e.g. Breakside Brewery in Portland"
          />
        </label>

        <label className="field">
          <span className="field__label">Message</span>
          <textarea
            className="field__textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe the bug, update, or removal you're requesting…"
            rows={4}
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">Your email (optional, so we can follow up)</span>
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>

        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button" disabled={!canSave}>
            {saving ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReportForm
