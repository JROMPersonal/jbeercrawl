function CrawlCard({ crawl, onSelect }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(crawl)
    }
  }

  return (
    <div
      className="crawl-card"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(crawl)}
      onKeyDown={handleKeyDown}
      title="View this crawl's route on the map"
    >
      <div className="crawl-card__header">
        <h3 className="crawl-card__name">{crawl.name}</h3>
        <span className="crawl-card__count">
          {crawl.breweries.length} stop{crawl.breweries.length === 1 ? '' : 's'}
        </span>
      </div>

      <p className="crawl-card__creator">by {crawl.creatorName || 'Anonymous'}</p>

      <ol className="crawl-card__stops">
        {crawl.breweries.map((brewery, i) => (
          <li key={brewery.id ?? `${crawl.id}-${i}`}>{brewery.name}</li>
        ))}
      </ol>
    </div>
  )
}

export default CrawlCard
