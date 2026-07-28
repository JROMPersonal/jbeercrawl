import BreweryCard from './BreweryCard'

function BreweriesTab({ breweries, status }) {
  if (status === 'loading') {
    return <p className="city-panel__message">Loading breweries…</p>
  }

  if (status === 'error') {
    return (
      <p className="city-panel__message">
        Couldn't load breweries right now. Please try again in a bit.
      </p>
    )
  }

  if (breweries.length === 0) {
    return <p className="city-panel__message">No breweries found for this city.</p>
  }

  return (
    <div className="brewery-grid">
      {breweries.map((brewery) => (
        <BreweryCard key={brewery.id} brewery={brewery} />
      ))}
    </div>
  )
}

export default BreweriesTab
