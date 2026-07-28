import { useState } from 'react'
import { useCities } from './hooks/useCities'
import CitySidebar from './components/CitySidebar'
import CityPanel from './components/CityPanel'
import './App.css'

function App() {
  const cities = useCities()
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? null)

  const selectedCity = cities.find((city) => city.id === selectedCityId) ?? null

  return (
    <div className="app">
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
