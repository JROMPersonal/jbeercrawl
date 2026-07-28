import portlandImage from '../assets/cities/portland-or.jpg'
import reddingImage from '../assets/cities/redding-ca.jpg'

// `breweryDbCity` / `breweryDbState` are the query values sent to the
// Open Brewery DB API (https://www.openbrewerydb.org/), which expects
// lowercase city/state names.
export const cities = [
  {
    id: 'portland-or',
    name: 'Portland',
    state: 'Oregon',
    stateAbbr: 'OR',
    breweryDbCity: 'portland',
    breweryDbState: 'oregon',
    image: portlandImage,
    imageCredit: {
      text: 'Ian Poellet',
      url: 'https://commons.wikimedia.org/wiki/File:Portland_Oregon_skyline_NW_Everett_and_17th.jpg',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  },
  {
    id: 'redding-ca',
    name: 'Redding',
    state: 'California',
    stateAbbr: 'CA',
    breweryDbCity: 'redding',
    breweryDbState: 'california',
    image: reddingImage,
    imageCredit: {
      text: 'King of Hearts',
      url: 'https://commons.wikimedia.org/wiki/File:Sundial_Bridge_Redding_November_2019_001.jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
]
