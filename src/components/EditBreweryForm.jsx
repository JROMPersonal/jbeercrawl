import { useState } from 'react'
import { updateCustomBrewery } from '../api/customBreweries'
import { isSafeUrl } from '../utils/safeUrl'

const BREWERY_TYPES = [
  'micro',
  'brewpub',
  'regional',
  'large',
  'taproom',
  'contract',
  'proprietor',
  'other',
]

function EditBreweryForm({ brewery, onClose }) {
  const [name, setName] = useState(brewery.name)
  const [breweryType, setBreweryType] = useState(brewery.brewery_type ?? '')
  const [street, setStreet] = useState(brewery.street ?? '')
  const [phone, setPhone] = useState(brewery.phone ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(brewery.website_url ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const canSave = name.trim().length > 0 && !saving

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSave) return

    if (websiteUrl.trim() && !isSafeUrl(websiteUrl.trim())) {
      setError('Website must be a valid http:// or https:// URL.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await updateCustomBrewery(brewery.id, { name, breweryType, street, phone, websiteUrl })
      onClose()
    } catch {
      setError("Couldn't save changes right now. Please try again.")
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="modal__title">Edit Brewery</h3>

        <label className="field">
          <span className="field__label">Brewery name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">Type (optional)</span>
          <select value={breweryType} onChange={(event) => setBreweryType(event.target.value)}>
            <option value="">Not specified</option>
            {BREWERY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Street address (optional)</span>
          <input
            type="text"
            value={street}
            onChange={(event) => setStreet(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Phone (optional)</span>
          <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>

        <label className="field">
          <span className="field__label">Website (optional)</span>
          <input
            type="text"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
          />
        </label>

        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button" disabled={!canSave}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditBreweryForm
