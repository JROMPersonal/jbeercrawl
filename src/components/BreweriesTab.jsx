import { useState } from 'react'
import { isFirebaseConfigured } from '../firebase'
import BreweryCard from './BreweryCard'
import AddBreweryForm from './AddBreweryForm'

function BreweriesTab({ city, breweries, status }) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      {isFirebaseConfigured && (
        <div className="breweries-tab__toolbar">
          <button type="button" className="button" onClick={() => setShowForm(true)}>
            + Add Brewery
          </button>
        </div>
      )}

      {status === 'loading' && (
        <p className="city-panel__message">Loading breweries…</p>
      )}

      {status === 'error' && (
        <p className="city-panel__message">
          Couldn't load breweries right now. Please try again in a bit.
        </p>
      )}

      {status === 'ready' && breweries.length === 0 && (
        <p className="city-panel__message">No breweries found for this city.</p>
      )}

      {status === 'ready' && breweries.length > 0 && (
        <div className="brewery-grid">
          {breweries.map((brewery) => (
            <BreweryCard key={brewery.id} brewery={brewery} />
          ))}
        </div>
      )}

      {showForm && <AddBreweryForm city={city} onClose={() => setShowForm(false)} />}
    </div>
  )
}

export default BreweriesTab
