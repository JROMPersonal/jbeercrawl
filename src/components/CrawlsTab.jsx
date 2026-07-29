import { useState } from 'react'
import CrawlCard from './CrawlCard'
import AddCrawlForm from './AddCrawlForm'

function CrawlsTab({ city, crawls, crawlsStatus, breweries, breweriesStatus, onSelectCrawl }) {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  if (crawlsStatus === 'unconfigured') {
    return (
      <p className="city-panel__message">
        Beer Crawls need a Firestore project configured (see .env.example)
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
          placeholder="Search Beer Crawls…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button
          type="button"
          className="button"
          onClick={() => setShowForm(true)}
        >
          + Add Beer Crawl
        </button>
      </div>

      {crawlsStatus === 'loading' && (
        <p className="city-panel__message">Loading beer crawls…</p>
      )}

      {crawlsStatus === 'error' && (
        <p className="city-panel__message">
          Couldn't load beer crawls right now. Please try again in a bit.
        </p>
      )}

      {crawlsStatus === 'ready' && filteredCrawls.length === 0 && (
        <p className="city-panel__message">
          {crawls.length === 0
            ? 'No beer crawls yet for this city — be the first to add one.'
            : 'No beer crawls match your search.'}
        </p>
      )}

      {crawlsStatus === 'ready' && filteredCrawls.length > 0 && (
        <div className="crawl-grid">
          {filteredCrawls.map((crawl) => (
            <CrawlCard key={crawl.id} crawl={crawl} onSelect={onSelectCrawl} />
          ))}
        </div>
      )}

      {showForm && (
        <AddCrawlForm
          cityId={city.id}
          breweries={breweries}
          breweriesStatus={breweriesStatus}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default CrawlsTab
