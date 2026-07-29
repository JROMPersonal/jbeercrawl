import { useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import BreweryCard from './BreweryCard'
import AddBreweryForm from './AddBreweryForm'

function BreweriesTab({ city, breweries, status }) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const query = search.trim().toLowerCase()
  const filteredBreweries = query
    ? breweries.filter((brewery) => brewery.name.toLowerCase().includes(query))
    : breweries

  return (
    <div>
      <div className="breweries-tab__toolbar">
        <input
          type="search"
          className="breweries-tab__search"
          placeholder="Search Breweries…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {isFirebaseConfigured && (
          <button type="button" className="button" onClick={() => setShowForm(true)}>
            + Add Brewery
          </button>
        )}
      </div>

      {status === 'loading' && (
        <p className="city-panel__message">Loading breweries…</p>
      )}

      {status === 'error' && (
        <p className="city-panel__message">
          Couldn't load breweries right now. Please try again in a bit.
        </p>
      )}

      {status === 'ready' && filteredBreweries.length === 0 && (
        <p className="city-panel__message">
          {breweries.length === 0
            ? 'No breweries found for this city.'
            : 'No breweries match your search.'}
        </p>
      )}

      {status === 'ready' && filteredBreweries.length > 0 && (
        <div className="brewery-grid">
          {filteredBreweries.map((brewery) => (
            <BreweryCard key={brewery.id} brewery={brewery} />
          ))}
        </div>
      )}

      {showForm && <AddBreweryForm city={city} onClose={() => setShowForm(false)} />}
    </div>
  )
}

export default BreweriesTab
