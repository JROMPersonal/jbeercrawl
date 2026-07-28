import { useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import CityCard from './CityCard'
import AddCityForm from './AddCityForm'

function CitySidebar({ cities, selectedCityId, onSelectCity }) {
  const [showAddCity, setShowAddCity] = useState(false)
  const citiesWithCredit = cities.filter((city) => city.imageCredit)

  return (
    <aside className="city-sidebar">
      <h1 className="city-sidebar__title">Beer Crawl Planner</h1>
      <div className="city-sidebar__list">
        {cities.map((city) => (
          <CityCard
            key={city.id}
            city={city}
            isSelected={city.id === selectedCityId}
            onSelect={onSelectCity}
          />
        ))}
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

      {showAddCity && <AddCityForm onClose={() => setShowAddCity(false)} />}
    </aside>
  )
}

export default CitySidebar
