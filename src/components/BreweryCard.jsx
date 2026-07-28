function formatAddress(brewery) {
  const line = [brewery.street, brewery.city, brewery.state_province]
    .filter(Boolean)
    .join(', ')
  return [line, brewery.postal_code].filter(Boolean).join(' ')
}

function formatPhone(phone) {
  const digits = phone?.replace(/\D/g, '')
  if (digits?.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function BreweryCard({ brewery }) {
  const address = formatAddress(brewery)

  return (
    <div className="brewery-card">
      <div className="brewery-card__header">
        <h3 className="brewery-card__name">{brewery.name}</h3>
        <div className="brewery-card__badges">
          {brewery.brewery_type && (
            <span className="brewery-card__type">{brewery.brewery_type}</span>
          )}
          {brewery.source === 'custom' && (
            <span className="brewery-card__custom-badge">Community added</span>
          )}
        </div>
      </div>

      {address && <p className="brewery-card__address">{address}</p>}

      <div className="brewery-card__links">
        {brewery.phone && (
          <a href={`tel:${brewery.phone.replace(/\D/g, '')}`}>
            {formatPhone(brewery.phone)}
          </a>
        )}
        {brewery.website_url && (
          <a href={brewery.website_url} target="_blank" rel="noreferrer">
            Website ↗
          </a>
        )}
        {address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${brewery.name} ${address}`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Map ↗
          </a>
        )}
      </div>
    </div>
  )
}

export default BreweryCard
