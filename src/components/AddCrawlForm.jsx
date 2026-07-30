import { useState } from 'react'
import { createCrawl } from '../api/crawls'
import BreweryPathList from './BreweryPathList'
import CrawlPickerMap from './CrawlPickerMap'

function AddCrawlForm({
  cityId,
  cityName,
  breweries,
  breweriesStatus,
  initialOrderedIds,
  initialTab,
  onClose,
  onCreated,
}) {
  const [name, setName] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [orderedIds, setOrderedIds] = useState(() => initialOrderedIds ?? [])
  const [activeTab, setActiveTab] = useState(initialTab ?? 'breweries')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const toggleBrewery = (id) => {
    setOrderedIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id],
    )
  }

  const orderedBreweries = orderedIds
    .map((id) => breweries.find((b) => b.id === id))
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
      const docRef = await createCrawl(cityId, {
        name,
        creatorName,
        breweries: selectedBreweries,
      })
      onCreated?.(docRef.id)
      onClose()
    } catch {
      setError("Couldn't save this crawl right now. Please try again.")
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal modal--add-crawl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3 className="modal__title">Add a JBeer Crawl</h3>
        {cityName && <p className="modal__subtitle">for {cityName}</p>}

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

        <div className="field crawl-form__tabs-field">
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
              className={`tab-bar__button${activeTab === 'map' ? ' tab-bar__button--active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              Map
            </button>
            <button
              type="button"
              className={`tab-bar__button${activeTab === 'path' ? ' tab-bar__button--active' : ''}`}
              onClick={() => setActiveTab('path')}
            >
              Brewery Path
            </button>
          </div>

          <div className="crawl-form__tab-panel">
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

            {activeTab === 'map' && (
              <>
                {breweriesStatus === 'loading' && (
                  <p className="city-panel__message">Loading breweries…</p>
                )}
                {breweriesStatus === 'error' && (
                  <p className="city-panel__message">Couldn't load the brewery list.</p>
                )}

                {breweriesStatus === 'ready' && (
                  <>
                    <p className="field__hint">
                      Click a brewery on the map to add or remove it from this crawl.
                    </p>
                    <CrawlPickerMap
                      breweries={breweries}
                      selectedIds={orderedIds}
                      onToggle={toggleBrewery}
                    />
                  </>
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
