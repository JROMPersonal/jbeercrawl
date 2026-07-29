import { useState } from 'react'
import { useBreweries } from '../hooks/useBreweries'
import { useCrawls } from '../hooks/useCrawls'
import { deleteCrawl } from '../api/crawls'
import AddCrawlForm from './AddCrawlForm'
import EditCrawlForm from './EditCrawlForm'

function AdminCrawlsPanel({ cities }) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? '')
  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null
  const { breweries, status: breweriesStatus } = useBreweries(selectedCity)
  const { crawls, status: crawlsStatus } = useCrawls(selectedCity)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCrawl, setEditingCrawl] = useState(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (crawlId) => {
    setDeletingId(crawlId)
    try {
      await deleteCrawl(crawlId)
    } finally {
      setDeletingId(null)
      setConfirmingDeleteId(null)
    }
  }

  return (
    <div>
      <div className="admin-panel__toolbar">
        <label className="map-tab__route-select">
          <span>City:</span>
          <select
            value={selectedCityId}
            onChange={(event) => setSelectedCityId(event.target.value)}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.stateAbbr}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button"
          onClick={() => setShowAddForm(true)}
          disabled={!selectedCity}
        >
          + Add JBeer Crawl
        </button>
      </div>

      {crawlsStatus === 'unconfigured' && (
        <p className="city-panel__message">Firestore isn't configured.</p>
      )}
      {crawlsStatus === 'loading' && (
        <p className="city-panel__message">Loading JBeer Crawls…</p>
      )}
      {crawlsStatus === 'error' && (
        <p className="city-panel__message">Couldn't load JBeer Crawls right now.</p>
      )}

      {crawlsStatus === 'ready' && crawls.length === 0 && (
        <p className="city-panel__message">No JBeer Crawls yet for this city.</p>
      )}

      {crawlsStatus === 'ready' && crawls.length > 0 && (
        <ul className="admin-list">
          {crawls.map((crawl) => (
            <li key={crawl.id} className="admin-list__row">
              <span className="admin-list__label">
                {crawl.name}{' '}
                <span className="admin-list__meta">
                  by {crawl.creatorName || 'Anonymous'} · {crawl.breweries.length} stops
                </span>
              </span>
              <div className="admin-list__actions">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setEditingCrawl(crawl)}
                >
                  Edit
                </button>
                {confirmingDeleteId === crawl.id ? (
                  <>
                    <span className="admin-list__confirm">Delete?</span>
                    <button
                      type="button"
                      className="button button--danger"
                      onClick={() => handleDelete(crawl.id)}
                      disabled={deletingId === crawl.id}
                    >
                      {deletingId === crawl.id ? 'Deleting…' : 'Yes'}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      No
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="button button--danger"
                    onClick={() => setConfirmingDeleteId(crawl.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAddForm && selectedCity && (
        <AddCrawlForm
          cityId={selectedCity.id}
          breweries={breweries}
          breweriesStatus={breweriesStatus}
          onClose={() => setShowAddForm(false)}
        />
      )}
      {editingCrawl && (
        <EditCrawlForm
          crawl={editingCrawl}
          breweries={breweries}
          breweriesStatus={breweriesStatus}
          onClose={() => setEditingCrawl(null)}
        />
      )}
    </div>
  )
}

export default AdminCrawlsPanel
