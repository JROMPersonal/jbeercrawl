import { useEffect, useState } from 'react'
import { subscribeCrawlsForCity } from '../api/crawls'
import { isFirebaseConfigured } from '../firebase'
import CrawlCard from './CrawlCard'
import AddCrawlForm from './AddCrawlForm'

function CrawlsTab({ city, breweries, breweriesStatus }) {
  const [crawls, setCrawls] = useState([])
  const [status, setStatus] = useState('loading')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus('unconfigured')
      return
    }

    setStatus('loading')
    const unsubscribe = subscribeCrawlsForCity(
      city.id,
      (data) => {
        setCrawls(data)
        setStatus('ready')
      },
      () => setStatus('error'),
    )

    return unsubscribe
  }, [city.id])

  if (status === 'unconfigured') {
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
          placeholder="Search beer crawls…"
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

      {status === 'loading' && (
        <p className="city-panel__message">Loading beer crawls…</p>
      )}

      {status === 'error' && (
        <p className="city-panel__message">
          Couldn't load beer crawls right now. Please try again in a bit.
        </p>
      )}

      {status === 'ready' && filteredCrawls.length === 0 && (
        <p className="city-panel__message">
          {crawls.length === 0
            ? 'No beer crawls yet for this city — be the first to add one.'
            : 'No beer crawls match your search.'}
        </p>
      )}

      {status === 'ready' && filteredCrawls.length > 0 && (
        <div className="crawl-grid">
          {filteredCrawls.map((crawl) => (
            <CrawlCard key={crawl.id} crawl={crawl} />
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
