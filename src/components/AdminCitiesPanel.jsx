import { useState } from 'react'
import { deleteCustomCity } from '../api/customCities'
import AddCityForm from './AddCityForm'
import EditCityForm from './EditCityForm'

function AdminCitiesPanel({ cities }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCity, setEditingCity] = useState(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const builtInCities = cities.filter((city) => !city.isCustom)
  const customCities = cities.filter((city) => city.isCustom)

  const handleDelete = async (cityId) => {
    setDeletingId(cityId)
    try {
      await deleteCustomCity(cityId)
    } finally {
      setDeletingId(null)
      setConfirmingDeleteId(null)
    }
  }

  return (
    <div>
      <div className="admin-panel__toolbar">
        <button type="button" className="button" onClick={() => setShowAddForm(true)}>
          + Add City
        </button>
      </div>

      <h3 className="admin-panel__section-title">Community-added cities</h3>
      {customCities.length === 0 ? (
        <p className="city-panel__message">No community-added cities yet.</p>
      ) : (
        <ul className="admin-list">
          {customCities.map((city) => (
            <li key={city.id} className="admin-list__row">
              <span className="admin-list__label">
                {city.name}, {city.stateAbbr}
              </span>
              <div className="admin-list__actions">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => setEditingCity(city)}
                >
                  Edit
                </button>
                {confirmingDeleteId === city.id ? (
                  <>
                    <span className="admin-list__confirm">Delete?</span>
                    <button
                      type="button"
                      className="button button--danger"
                      onClick={() => handleDelete(city.id)}
                      disabled={deletingId === city.id}
                    >
                      {deletingId === city.id ? 'Deleting…' : 'Yes'}
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
                    onClick={() => setConfirmingDeleteId(city.id)}
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
        Built-in cities{' '}
        <span className="admin-panel__readonly-note">
          (Populated by Source Code.{' '}
          <a href="https://github.com/JROMPersonal/jbeercrawl/issues" target="_blank" rel="noreferrer">
            Make git issue
          </a>
          )
        </span>
      </h3>
      <ul className="admin-list admin-list--readonly">
        {builtInCities.map((city) => (
          <li key={city.id} className="admin-list__row">
            <span className="admin-list__label">
              {city.name}, {city.stateAbbr}
            </span>
          </li>
        ))}
      </ul>

      {showAddForm && <AddCityForm onClose={() => setShowAddForm(false)} />}
      {editingCity && <EditCityForm city={editingCity} onClose={() => setEditingCity(null)} />}
    </div>
  )
}

export default AdminCitiesPanel
