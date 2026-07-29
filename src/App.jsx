import { useState } from 'react'
import { useCities } from './hooks/useCities'
import TopBar from './components/TopBar'
import CitySidebar from './components/CitySidebar'
import CityPanel from './components/CityPanel'
import AdminPage from './components/AdminPage'
import AboutPage from './components/AboutPage'
import ReportForm from './components/ReportForm'
import './App.css'

function App() {
  const cities = useCities()
  const [selectedCityId, setSelectedCityId] = useState(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('breweries')
  const [activeCrawlId, setActiveCrawlId] = useState('')
  const [view, setView] = useState('about')
  const [showReportForm, setShowReportForm] = useState(false)
  const [showCityDrawer, setShowCityDrawer] = useState(false)

  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null

  const handleSelectCity = (city) => {
    setSelectedCityId(city.id)
    setTab('breweries')
    setActiveCrawlId('')
    setShowCityDrawer(false)
    setView('app')
  }

  const handleSelectCrawl = (crawl) => {
    setActiveCrawlId(crawl.id)
    setTab('map')
  }

  const handleOpenAllCitiesMap = () => {
    setTab('usa-map')
    setShowCityDrawer(false)
    setView('app')
  }

  if (view === 'admin') {
    return <AdminPage cities={cities} onExit={() => setView('app')} />
  }

  return (
    <div className="app">
      <TopBar
        selectedCity={selectedCity}
        onOpenAdmin={() => setView('admin')}
        onOpenAbout={() => setView('about')}
        onOpenReportForm={() => setShowReportForm(true)}
        onToggleCityDrawer={() => setShowCityDrawer((open) => !open)}
      />

      <div className="app__divider" aria-hidden="true" />

      <div className="app__body">
        <CitySidebar
          cities={cities}
          search={search}
          onSearchChange={setSearch}
          selectedCityId={selectedCityId}
          onSelectCity={handleSelectCity}
          isOpen={showCityDrawer}
          onClose={() => setShowCityDrawer(false)}
          onOpenAllCitiesMap={handleOpenAllCitiesMap}
          isAllCitiesMapActive={tab === 'usa-map'}
        />
        {view === 'about' ? (
          <AboutPage onOpenReportForm={() => setShowReportForm(true)} />
        ) : (
          <CityPanel
            city={selectedCity}
            cities={cities}
            tab={tab}
            onTabChange={setTab}
            activeCrawlId={activeCrawlId}
            onActiveCrawlIdChange={setActiveCrawlId}
            onSelectCrawl={handleSelectCrawl}
          />
        )}
      </div>

      {showReportForm && <ReportForm onClose={() => setShowReportForm(false)} />}
    </div>
  )
}

export default App
