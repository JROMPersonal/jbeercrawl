import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// No StrictMode: Leaflet's L.Map is an imperative, non-React library that
// attaches directly to the DOM and doesn't tolerate StrictMode's dev-only
// double-mount/double-effect behavior — it was corrupting the tile grid
// (overlapping/jumbled tiles) and, combined with a since-fixed ref/cleanup
// bug in useAllBreweries, left data fetches stuck permanently "loading".
createRoot(document.getElementById('root')).render(<App />)
