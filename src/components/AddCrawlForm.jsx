import { useState } from 'react'
import { createCrawl } from '../api/crawls'

function AddCrawlForm({ cityId, breweries, breweriesStatus, onClose }) {
  const [name, setName] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const toggleBrewery = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const canSave = name.trim().length > 0 && selectedIds.size > 0 && !saving

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSave) return

    setSaving(true)
    setError(null)

    const selectedBreweries = breweries
      .filter((b) => selectedIds.has(b.id))
      .map((b) => ({ id: b.id, name: b.name, breweryType: b.brewery_type ?? null }))

    try {
      await createCrawl(cityId, {
        name,
        creatorName,
        breweries: selectedBreweries,
      })
      onClose()
    } catch {
      setError("Couldn't save this crawl right now. Please try again.")
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
        <h3 className="modal__title">Add a Beer Crawl</h3>

        <label className="field">
          <span className="field__label">Crawl name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Eastside Hop Tour"
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">Your name (optional)</span>
          <input
            type="text"
            value={creatorName}
            onChange={(event) => setCreatorName(event.target.value)}
            placeholder="Anonymous"
          />
        </label>

        <div className="field">
          <span className="field__label">
            Breweries ({selectedIds.size} selected)
          </span>

          {breweriesStatus === 'loading' && (
            <p className="city-panel__message">Loading breweries…</p>
          )}
          {breweriesStatus === 'error' && (
            <p className="city-panel__message">Couldn't load the brewery list.</p>
          )}

          {breweriesStatus === 'ready' && (
            <div className="brewery-picker">
              {breweries.map((brewery) => (
                <label key={brewery.id} className="brewery-picker__item">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(brewery.id)}
                    onChange={() => toggleBrewery(brewery.id)}
                  />
                  {brewery.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button" disabled={!canSave}>
            {saving ? 'Saving…' : 'Save Crawl'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCrawlForm
