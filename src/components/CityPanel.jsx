import { useBreweries } from '../hooks/useBreweries'
import { useCrawls } from '../hooks/useCrawls'
import BreweriesTab from './BreweriesTab'
import CrawlsTab from './CrawlsTab'
import MapTab from './MapTab'

function CityPanel({ city, tab, activeCrawlId, onActiveCrawlIdChange, onSelectCrawl }) {
  const { breweries, status } = useBreweries(city)
  const { crawls, status: crawlsStatus } = useCrawls(city)

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
          breweries={breweries}
          status={status}
          crawls={crawls}
          crawlsStatus={crawlsStatus}
          activeCrawlId={activeCrawlId}
          onActiveCrawlIdChange={onActiveCrawlIdChange}
        />
      )}
    </main>
  )
}

export default CityPanel
