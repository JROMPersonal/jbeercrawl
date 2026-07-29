import { useState } from 'react'
import { useBreweries } from '../hooks/useBreweries'
import { deleteCustomBrewery } from '../api/customBreweries'
import AddBreweryForm from './AddBreweryForm'
import EditBreweryForm from './EditBreweryForm'

function AdminBreweriesPanel({ cities }) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? '')
  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null
  const { breweries, status } = useBreweries(selectedCity)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBrewery, setEditingBrewery] = useState(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const customBreweries = breweries.filter((brewery) => brewery.source === 'custom')
  const apiBreweries = breweries.filter((brewery) => brewery.source !== 'custom')

  const handleDelete = async (breweryId) => {
    setDeletingId(breweryId)
    try {
      await deleteCustomBrewery(breweryId)
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
          + Add Brewery
        </button>
      </div>

      {status === 'loading' && <p className="city-panel__message">Loading breweries…</p>}
      {status === 'error' && (
        <p className="city-panel__message">Couldn't load breweries right now.</p>
      )}

      {status === 'ready' && (
        <>
          <h3 className="admin-panel__section-title">Community-added breweries</h3>
          {customBreweries.length === 0 ? (
            <p className="city-panel__message">No community-added breweries yet for this city.</p>
          ) : (
            <ul className="admin-list">
              {customBreweries.map((brewery) => (
                <li key={brewery.id} className="admin-list__row">
                  <span className="admin-list__label">{brewery.name}</span>
                  <div className="admin-list__actions">
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setEditingBrewery(brewery)}
                    >
                      Edit
                    </button>
                    {confirmingDeleteId === brewery.id ? (
                      <>
                        <span className="admin-list__confirm">Delete?</span>
                        <button
                          type="button"
                          className="button button--danger"
                          onClick={() => handleDelete(brewery.id)}
                          disabled={deletingId === brewery.id}
                        >
                          {deletingId === brewery.id ? 'Deleting…' : 'Yes'}
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
                        onClick={() => setConfirmingDeleteId(brewery.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h3 className="admin-panel__section-title">
            Open Brewery DB breweries{' '}
            <span className="admin-panel__readonly-note">
              (Populated by{' '}
              <a href="https://www.openbrewerydb.org/" target="_blank" rel="noreferrer">
                API
              </a>
              )
            </span>
          </h3>
          {apiBreweries.length === 0 ? (
            <p className="city-panel__message">None found via the API for this city.</p>
          ) : (
            <ul className="admin-list admin-list--readonly">
              {apiBreweries.map((brewery) => (
                <li key={brewery.id} className="admin-list__row">
                  <span className="admin-list__label">{brewery.name}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {showAddForm && selectedCity && (
        <AddBreweryForm city={selectedCity} onClose={() => setShowAddForm(false)} />
      )}
      {editingBrewery && (
        <EditBreweryForm brewery={editingBrewery} onClose={() => setEditingBrewery(null)} />
      )}
    </div>
  )
}

export default AdminBreweriesPanel
