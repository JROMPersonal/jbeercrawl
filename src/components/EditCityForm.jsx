import { useState } from 'react'
import { usStates } from '../data/usStates'
import { updateCustomCity } from '../api/customCities'

function EditCityForm({ city, onClose }) {
  const [name, setName] = useState(city.name)
  const [stateAbbr, setStateAbbr] = useState(city.stateAbbr)
  const [image, setImage] = useState(city.image ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const canSave = name.trim().length > 0 && stateAbbr.length > 0 && !saving

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSave) return

    const state = usStates.find((s) => s.abbr === stateAbbr)

    setSaving(true)
    setError(null)

    try {
      await updateCustomCity(city.id, {
        name,
        state: state.name,
        stateAbbr: state.abbr,
        image,
      })
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
        <h3 className="modal__title">Edit City</h3>

        <label className="field">
          <span className="field__label">City name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">State</span>
          <select value={stateAbbr} onChange={(event) => setStateAbbr(event.target.value)}>
            {usStates.map((state) => (
              <option key={state.abbr} value={state.abbr}>
                {state.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Photo URL (optional)</span>
          <input
            type="text"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="https://…"
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

export default EditCityForm
