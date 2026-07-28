const BASE_URL = 'https://api.openbrewerydb.org/v1/breweries'

/**
 * Fetches breweries for a city from the Open Brewery DB API.
 * @param {{ breweryDbCity: string, breweryDbState: string }} city
 * @returns {Promise<Array>}
 */
export async function fetchBreweriesForCity(city) {
  const params = new URLSearchParams({
    by_city: city.breweryDbCity,
    by_state: city.breweryDbState,
    per_page: '50',
  })

  const response = await fetch(`${BASE_URL}?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`Open Brewery DB request failed (${response.status})`)
  }

  return response.json()
}
