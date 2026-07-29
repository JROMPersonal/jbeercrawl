import { useBreweries } from '../hooks/useBreweries'
import { useCrawls } from '../hooks/useCrawls'
import { useAllBreweries } from '../hooks/useAllBreweries'
import BreweriesTab from './BreweriesTab'
import CrawlsTab from './CrawlsTab'
import MapTab from './MapTab'
import UsaMapTab from './UsaMapTab'

function CityPanel({
  city,
  cities,
  tab,
  onTabChange,
  activeCrawlId,
  onActiveCrawlIdChange,
  onSelectCrawl,
}) {
  const { breweries, status } = useBreweries(city)
  const { crawls, status: crawlsStatus } = useCrawls(city)
  const { breweries: allBreweries, status: allBreweriesStatus } = useAllBreweries(
    cities,
    tab === 'usa-map',
  )

  if (!city) {
    return (
      <main className="city-panel">
        <div className="city-panel__content">
          <p className="city-panel__message">
            Pick a city on the left to see its breweries.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="city-panel">
      <div className="tab-bar city-panel__tabs">
        <button
          type="button"
          className={`tab-bar__button${tab === 'breweries' ? ' tab-bar__button--active' : ''}`}
          onClick={() => onTabChange('breweries')}
        >
          Breweries
        </button>
        <button
          type="button"
          className={`tab-bar__button${tab === 'crawls' ? ' tab-bar__button--active' : ''}`}
          onClick={() => onTabChange('crawls')}
        >
          JBeer Crawls
        </button>
        <button
          type="button"
          className={`tab-bar__button${tab === 'map' ? ' tab-bar__button--active' : ''}`}
          onClick={() => onTabChange('map')}
        >
          Map
        </button>
      </div>

      <div className="city-panel__content">
        {tab === 'breweries' && (
          <BreweriesTab city={city} breweries={breweries} status={status} />
        )}
        {tab === 'crawls' && (
          <CrawlsTab
            city={city}
            crawls={crawls}
            crawlsStatus={crawlsStatus}
            breweries={breweries}
            breweriesStatus={status}
            onSelectCrawl={onSelectCrawl}
          />
        )}
        {tab === 'map' && (
          <MapTab
            cityId={city.id}
            breweries={breweries}
            status={status}
            crawls={crawls}
            crawlsStatus={crawlsStatus}
            activeCrawlId={activeCrawlId}
            onActiveCrawlIdChange={onActiveCrawlIdChange}
          />
        )}
        {tab === 'usa-map' && (
          <UsaMapTab breweries={allBreweries} status={allBreweriesStatus} />
        )}
      </div>
    </main>
  )
}

export default CityPanel
