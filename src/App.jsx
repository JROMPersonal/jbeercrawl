import { useState } from 'react'
import { useCities } from './hooks/useCities'
import { isFirebaseConfigured } from './firebase'
import CitySidebar from './components/CitySidebar'
import CityPanel from './components/CityPanel'
import AdminGearButton from './components/AdminGearButton'
import AdminPage from './components/AdminPage'
import './App.css'

function App() {
  const cities = useCities()
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? null)
  const [view, setView] = useState('app')

  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null

  if (view === 'admin') {
    return <AdminPage cities={cities} onExit={() => setView('app')} />
  }

  return (
    <div className="app">
      {isFirebaseConfigured && <AdminGearButton onClick={() => setView('admin')} />}
      <CitySidebar
        cities={cities}
        selectedCityId={selectedCityId}
        onSelectCity={(city) => setSelectedCityId(city.id)}
      />
      <CityPanel city={selectedCity} />
    </div>
  )
}

export default App
