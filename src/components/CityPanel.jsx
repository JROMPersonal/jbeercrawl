import { useEffect, useState } from 'react'
import { useBreweries } from '../hooks/useBreweries'
import BreweriesTab from './BreweriesTab'
import CrawlsTab from './CrawlsTab'

function CityPanel({ city }) {
  const [tab, setTab] = useState('breweries')
  const { breweries, status } = useBreweries(city)

  useEffect(() => {
    setTab('breweries')
  }, [city?.id])

  if (!city) {
    return (
      <main className="city-panel">
        <p className="city-panel__message">
          Pick a city on the left to see its breweries.
        </p>
      </main>
    )
  }

  return (
    <main className="city-panel">
      <h2 className="city-panel__title">
        {city.name}, {city.stateAbbr}
      </h2>

      <div className="tab-bar">
        <button
          type="button"
          className={`tab-bar__button${tab === 'breweries' ? ' tab-bar__button--active' : ''}`}
          onClick={() => setTab('breweries')}
        >
          Breweries
        </button>
        <button
          type="button"
          className={`tab-bar__button${tab === 'crawls' ? ' tab-bar__button--active' : ''}`}
          onClick={() => setTab('crawls')}
        >
          Beer Crawls
        </button>
      </div>

      {tab === 'breweries' && (
        <BreweriesTab breweries={breweries} status={status} />
      )}
      {tab === 'crawls' && (
        <CrawlsTab city={city} breweries={breweries} breweriesStatus={status} />
      )}
    </main>
  )
}

export default CityPanel
