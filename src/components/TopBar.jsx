import { isFirebaseConfigured } from '../firebase'
import AdminGearButton from './AdminGearButton'

function TopBar({
  search,
  onSearchChange,
  selectedCity,
  tab,
  onTabChange,
  onOpenAdmin,
  onOpenReportForm,
}) {
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        <span className="top-bar__title">Beer Crawl Planner</span>
        <input
          type="search"
          className="top-bar__search"
          placeholder="Search cities…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {selectedCity && (
          <>
            <span className="top-bar__divider" aria-hidden="true">
              /
            </span>
            <span className="top-bar__city-name">
              {selectedCity.name}, {selectedCity.stateAbbr}
            </span>
          </>
        )}
      </div>

      {selectedCity && (
        <nav className="tab-bar top-bar__tabs">
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
            Beer Crawls
          </button>
          <button
            type="button"
            className={`tab-bar__button${tab === 'map' ? ' tab-bar__button--active' : ''}`}
            onClick={() => onTabChange('map')}
          >
            Map
          </button>
        </nav>
      )}

      <div className="top-bar__right">
        {isFirebaseConfigured && (
          <button type="button" className="top-bar__report-link" onClick={onOpenReportForm}>
            Report an issue / suggest a change
          </button>
        )}
        {isFirebaseConfigured && <AdminGearButton onClick={onOpenAdmin} />}
      </div>
    </header>
  )
}

export default TopBar
