import { isFirebaseConfigured } from '../firebase'
import AdminGearButton from './AdminGearButton'

function TopBar({ search, onSearchChange, selectedCity, onOpenAdmin, onOpenReportForm }) {
  return (
    <header className="top-bar">
      <div className="top-bar__row">
        <div className="top-bar__left">
          <a className="top-bar__title" href={import.meta.env.BASE_URL}>
            JBeer Crawl Planner
          </a>
          <input
            type="search"
            className="top-bar__search"
            placeholder="Search cities…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="top-bar__right">
          {isFirebaseConfigured && (
            <button type="button" className="top-bar__report-link" onClick={onOpenReportForm}>
              Report Issue | Suggest Change
            </button>
          )}
          {isFirebaseConfigured && <AdminGearButton onClick={onOpenAdmin} />}
        </div>
      </div>

      {selectedCity && (
        <>
          <hr className="top-bar__rule" />
          <h2 className="top-bar__city-name">
            {selectedCity.name}, {selectedCity.stateAbbr}
          </h2>
        </>
      )}
    </header>
  )
}

export default TopBar
