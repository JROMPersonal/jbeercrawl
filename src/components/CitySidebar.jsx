import { useEffect, useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import CityCard from './CityCard'
import AddCityForm from './AddCityForm'

function CitySidebar({ cities, search, onSearchChange, selectedCityId, onSelectCity, isOpen, onClose }) {
  const [showAddCity, setShowAddCity] = useState(false)
  const citiesWithCredit = cities.filter((city) => city.imageCredit)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const query = search.trim().toLowerCase()
  const filteredCities = query
    ? cities.filter(
        (city) =>
          city.name.toLowerCase().includes(query) ||
          city.state.toLowerCase().includes(query) ||
          city.stateAbbr.toLowerCase().includes(query),
      )
    : cities

  return (
    <>
      {isOpen && (
        <div className="city-sidebar__backdrop" onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`city-sidebar${isOpen ? ' city-sidebar--open' : ''}`}>
        <button
          type="button"
          className="city-sidebar__close"
          onClick={onClose}
          aria-label="Close city list"
        >
          ✕
        </button>

        <div className="city-sidebar__search-wrap">
          <input
            type="search"
            className="city-sidebar__search"
            placeholder="Search cities…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="city-sidebar__body">
          <div className="city-sidebar__list">
            {filteredCities.length === 0 ? (
              <p className="city-sidebar__no-results">No cities match your search.</p>
            ) : (
              filteredCities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  isSelected={city.id === selectedCityId}
                  onSelect={onSelectCity}
                />
              ))
            )}
          </div>

          {isFirebaseConfigured && (
            <button
              type="button"
              className="add-city-button"
              onClick={() => setShowAddCity(true)}
            >
              + Add City
            </button>
          )}

          {citiesWithCredit.length > 0 && (
            <p className="city-sidebar__credits">
              Photos:{' '}
              {citiesWithCredit.map((city, i) => (
                <span key={city.id}>
                  {i > 0 && ', '}
                  <a href={city.imageCredit.url} target="_blank" rel="noreferrer">
                    {city.imageCredit.text}
                  </a>{' '}
                  (
                  <a href={city.imageCredit.licenseUrl} target="_blank" rel="noreferrer">
                    {city.imageCredit.license}
                  </a>
                  )
                </span>
              ))}
            </p>
          )}
        </div>

        {showAddCity && <AddCityForm onClose={() => setShowAddCity(false)} />}
      </aside>
    </>
  )
}

export default CitySidebar
