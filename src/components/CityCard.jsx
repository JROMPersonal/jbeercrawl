function CityCard({ city, isSelected, onSelect }) {
  return (
    <button
      type="button"
      className={`city-card${isSelected ? ' city-card--selected' : ''}`}
      style={{ backgroundImage: `url(${city.image})` }}
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
