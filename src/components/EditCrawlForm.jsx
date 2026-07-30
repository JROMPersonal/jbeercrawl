import { useState } from 'react'
import { updateCrawl } from '../api/crawls'
import BreweryPathList from './BreweryPathList'
import { useEscapeKey } from '../hooks/useEscapeKey'

function EditCrawlForm({ crawl, breweries, breweriesStatus, onClose }) {
  const [name, setName] = useState(crawl.name)
  const [creatorName, setCreatorName] = useState(crawl.creatorName ?? '')
  const [orderedIds, setOrderedIds] = useState(crawl.breweries.map((b) => b.id))
  const [activeTab, setActiveTab] = useState('breweries')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEscapeKey(onClose)

  const toggleBrewery = (id) => {
    setOrderedIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id],
    )
  }

  // Fall back to the crawl's own saved snapshot for stops that have since
  // disappeared from the live brewery list (e.g. removed from the API).
  const orderedBreweries = orderedIds
    .map((id) => {
      const live = breweries.find((b) => b.id === id)
      if (live) return live
      const snapshot = crawl.breweries.find((b) => b.id === id)
      return snapshot
        ? { id: snapshot.id, name: snapshot.name, brewery_type: snapshot.breweryType }
        : null
    })
    .filter(Boolean)

  const canSave = name.trim().length > 0 && orderedIds.length > 0 && !saving

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSave) return

    setSaving(true)
    setError(null)

    const selectedBreweries = orderedBreweries.map((b) => ({
      id: b.id,
      name: b.name,
      breweryType: b.brewery_type ?? null,
    }))

    try {
      await updateCrawl(crawl.id, { name, creatorName, breweries: selectedBreweries })
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
        <h3 className="modal__title">Edit JBeer Crawl</h3>

        <label className="field">
          <span className="field__label">Crawl name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">Creator name</span>
          <input
            type="text"
            value={creatorName}
            onChange={(event) => setCreatorName(event.target.value)}
            placeholder="Anonymous"
          />
        </label>

        <div className="field">
          <div className="tab-bar tab-bar--modal">
            <button
              type="button"
              className={`tab-bar__button${activeTab === 'breweries' ? ' tab-bar__button--active' : ''}`}
              onClick={() => setActiveTab('breweries')}
            >
              Breweries ({orderedIds.length} selected)
            </button>
            <button
              type="button"
              className={`tab-bar__button${activeTab === 'path' ? ' tab-bar__button--active' : ''}`}
              onClick={() => setActiveTab('path')}
            >
              Brewery Path
            </button>
          </div>

          {activeTab === 'breweries' && (
            <>
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
                        checked={orderedIds.includes(brewery.id)}
                        onChange={() => toggleBrewery(brewery.id)}
                      />
                      {brewery.name}
                    </label>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'path' &&
            (orderedBreweries.length === 0 ? (
              <p className="city-panel__message">
                Select breweries first, then drag to set the crawl order here.
              </p>
            ) : (
              <BreweryPathList
                orderedBreweries={orderedBreweries}
                onReorder={setOrderedIds}
              />
            ))}
        </div>

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

export default EditCrawlForm
