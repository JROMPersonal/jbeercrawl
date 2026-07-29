import { isFirebaseConfigured } from '../firebase'
import AdminGearButton from './AdminGearButton'

function TopBar({ selectedCity, onOpenAdmin, onOpenReportForm, onToggleCityDrawer }) {
  return (
    <header className="top-bar">
      <div className="top-bar__brand">
        <button
          type="button"
          className="top-bar__hamburger"
          onClick={onToggleCityDrawer}
          aria-label="Toggle city list"
        >
          ☰
        </button>
        <a className="top-bar__title" href={import.meta.env.BASE_URL}>
          JBeer Crawl
        </a>
      </div>

      <span className="top-bar__vline" aria-hidden="true" />

      <div className="top-bar__main">
        {selectedCity && (
          <h2 className="top-bar__city-name">
            {selectedCity.name}, {selectedCity.stateAbbr}
          </h2>
        )}

        <div className="top-bar__right">
          {isFirebaseConfigured && (
            <button type="button" className="top-bar__report-link" onClick={onOpenReportForm}>
              Report Issue | Suggest Change
            </button>
          )}
          {isFirebaseConfigured && <AdminGearButton onClick={onOpenAdmin} />}
        </div>
      </div>
    </header>
  )
}

export default TopBar
