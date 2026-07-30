import { useState } from 'react'
import CrawlCard from './CrawlCard'
import AddCrawlForm from './AddCrawlForm'
import CrawlDetailModal from './CrawlDetailModal'

function CrawlsTab({ city, crawls, crawlsStatus, breweries, breweriesStatus }) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [viewingCrawl, setViewingCrawl] = useState(null)

  if (crawlsStatus === 'unconfigured') {
    return (
      <p className="city-panel__message">
        JBeer Crawls need a Firestore project configured (see .env.example)
        before they can be created or shown here.
      </p>
    )
  }

  const query = search.trim().toLowerCase()
  const filteredCrawls = query
    ? crawls.filter(
        (crawl) =>
          crawl.name.toLowerCase().includes(query) ||
          crawl.breweries.some((b) => b.name.toLowerCase().includes(query)),
      )
    : crawls

  return (
    <div className="crawls-tab">
      <div className="crawls-tab__toolbar">
        <input
          type="search"
          className="crawls-tab__search"
          placeholder="Search JBeer Crawls…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button
          type="button"
          className="button"
          onClick={() => setShowForm(true)}
        >
          + Add JBeer Crawl
        </button>
      </div>

      {crawlsStatus === 'loading' && (
        <p className="city-panel__message">Loading JBeer Crawls…</p>
      )}

      {crawlsStatus === 'error' && (
        <p className="city-panel__message">
          Couldn't load JBeer Crawls right now. Please try again in a bit.
        </p>
      )}

      {crawlsStatus === 'ready' && filteredCrawls.length === 0 && (
        <p className="city-panel__message">
          {crawls.length === 0
            ? 'No JBeer Crawls yet for this city - be the first to add one.'
            : 'No JBeer Crawls match your search.'}
        </p>
      )}

      {crawlsStatus === 'ready' && filteredCrawls.length > 0 && (
        <div className="crawl-grid">
          {filteredCrawls.map((crawl) => (
            <CrawlCard key={crawl.id} crawl={crawl} onSelect={setViewingCrawl} />
          ))}
        </div>
      )}

      {showForm && (
        <AddCrawlForm
          cityId={city.id}
          cityName={`${city.name}, ${city.stateAbbr}`}
          breweries={breweries}
          breweriesStatus={breweriesStatus}
          onClose={() => setShowForm(false)}
        />
      )}

      {viewingCrawl && (
        <CrawlDetailModal
          crawl={viewingCrawl}
          cityId={city.id}
          cityName={`${city.name}, ${city.stateAbbr}`}
          breweries={breweries}
          breweriesStatus={breweriesStatus}
          onClose={() => setViewingCrawl(null)}
        />
      )}
    </div>
  )
}

export default CrawlsTab
