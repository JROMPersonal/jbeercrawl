import CityCard from './CityCard'

function CitySidebar({ cities, selectedCityId, onSelectCity }) {
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

      <p className="city-sidebar__credits">
        Photos:{' '}
        {cities.map((city, i) => (
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
    </aside>
  )
}

export default CitySidebar
