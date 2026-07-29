import { useState } from 'react'
import { useCities } from './hooks/useCities'
import TopBar from './components/TopBar'
import CitySidebar from './components/CitySidebar'
import CityPanel from './components/CityPanel'
import AdminPage from './components/AdminPage'
import ReportForm from './components/ReportForm'
import './App.css'

function App() {
  const cities = useCities()
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('breweries')
  const [activeCrawlId, setActiveCrawlId] = useState('')
  const [view, setView] = useState('app')
  const [showReportForm, setShowReportForm] = useState(false)

  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null

  const handleSelectCity = (city) => {
    setSelectedCityId(city.id)
    setTab('breweries')
    setActiveCrawlId('')
  }

  const handleSelectCrawl = (crawl) => {
    setActiveCrawlId(crawl.id)
    setTab('map')
  }

  if (view === 'admin') {
    return <AdminPage cities={cities} onExit={() => setView('app')} />
  }

  return (
    <div className="app">
      <TopBar
        search={search}
        onSearchChange={setSearch}
        selectedCity={selectedCity}
        onOpenAdmin={() => setView('admin')}
        onOpenReportForm={() => setShowReportForm(true)}
      />

      <div className="app__body">
        <CitySidebar
          cities={cities}
          search={search}
          selectedCityId={selectedCityId}
          onSelectCity={handleSelectCity}
        />
        <CityPanel
          city={selectedCity}
          tab={tab}
          onTabChange={setTab}
          activeCrawlId={activeCrawlId}
          onActiveCrawlIdChange={setActiveCrawlId}
          onSelectCrawl={handleSelectCrawl}
        />
      </div>

      {showReportForm && <ReportForm onClose={() => setShowReportForm(false)} />}
    </div>
  )
}

export default App
