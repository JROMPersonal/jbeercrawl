import { useState } from 'react'
import { createCustomBrewery } from '../api/customBreweries'
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

function AddBreweryForm({ city, onClose }) {
  const [name, setName] = useState('')
  const [breweryType, setBreweryType] = useState('')
  const [street, setStreet] = useState('')
  const [phone, setPhone] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [addedBy, setAddedBy] = useState('')
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
      await createCustomBrewery(city, { name, breweryType, street, phone, websiteUrl, addedBy })
      onClose()
    } catch {
      setError("Couldn't save this brewery right now. Please try again.")
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
        <h3 className="modal__title">Add a Brewery in {city.name}</h3>

        <label className="field">
          <span className="field__label">Brewery name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Grass Valley Brewing Co."
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
            placeholder="141 E Main St"
          />
        </label>

        <label className="field">
          <span className="field__label">Phone (optional)</span>
          <input
            type="text"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="(530) 555-0100"
          />
        </label>

        <label className="field">
          <span className="field__label">Website (optional)</span>
          <input
            type="text"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="https://…"
          />
        </label>

        <label className="field">
          <span className="field__label">Your name (optional)</span>
          <input
            type="text"
            value={addedBy}
            onChange={(event) => setAddedBy(event.target.value)}
            placeholder="Anonymous"
          />
        </label>

        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button" disabled={!canSave}>
            {saving ? 'Saving…' : 'Add Brewery'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBreweryForm
