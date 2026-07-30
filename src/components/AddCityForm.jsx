import { useState } from 'react'
import { usStates } from '../data/usStates'
import { createCustomCity } from '../api/customCities'
import { useEscapeKey } from '../hooks/useEscapeKey'

function AddCityForm({ onClose }) {
  const [name, setName] = useState('')
  const [stateAbbr, setStateAbbr] = useState('')
  const [image, setImage] = useState('')
  const [addedBy, setAddedBy] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEscapeKey(onClose)

  const canSave = name.trim().length > 0 && stateAbbr.length > 0 && !saving

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSave) return

    const state = usStates.find((s) => s.abbr === stateAbbr)

    setSaving(true)
    setError(null)

    try {
      await createCustomCity({
        name,
        state: state.name,
        stateAbbr: state.abbr,
        image,
        addedBy,
      })
      onClose()
    } catch {
      setError("Couldn't save this city right now. Please try again.")
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
        <h3 className="modal__title">Add a City</h3>

        <label className="field">
          <span className="field__label">City name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Bend"
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">State</span>
          <select value={stateAbbr} onChange={(event) => setStateAbbr(event.target.value)}>
            <option value="">Select a state…</option>
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
            {saving ? 'Saving…' : 'Add City'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCityForm
