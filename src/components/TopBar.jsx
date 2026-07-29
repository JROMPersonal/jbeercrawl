import { isFirebaseConfigured } from '../firebase'
import AdminGearButton from './AdminGearButton'

function TopBar({
  selectedCity,
  onOpenAdmin,
  onOpenAbout,
  onOpenReportForm,
  onToggleCityDrawer,
}) {
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
          <span className="top-bar__title-text">JBeer Crawl</span>
          <img
            className="top-bar__icon"
            src={`${import.meta.env.BASE_URL}jbeercrawl-icon.png`}
            alt=""
          />
        </a>
        <button type="button" className="top-bar__about-link" onClick={onOpenAbout}>
          About
        </button>
      </div>

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
