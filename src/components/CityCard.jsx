function CityCard({ city, isSelected, onSelect }) {
  const hasImage = Boolean(city.image)

  return (
    <button
      type="button"
      className={`city-card${isSelected ? ' city-card--selected' : ''}${hasImage ? '' : ' city-card--no-image'}`}
      style={hasImage ? { backgroundImage: `url(${city.image})` } : undefined}
      onClick={() => onSelect(city)}
      aria-pressed={isSelected}
    >
      <span className="city-card__overlay" />
      <span className="city-card__label">
        {city.name}, {city.stateAbbr}
      </span>
    </button>
  )
}

export default CityCard
