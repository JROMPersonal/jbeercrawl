import portlandImage from '../assets/cities/portland-or.jpg'
import reddingImage from '../assets/cities/redding-ca.jpg'
import seattleImage from '../assets/cities/seattle-wa.jpg'
import sanDiegoImage from '../assets/cities/san-diego-ca.jpg'
import santaCruzImage from '../assets/cities/santa-cruz-ca.jpg'
import grassValleyImage from '../assets/cities/grass-valley-ca.jpg'

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
  {
    id: 'seattle-wa',
    name: 'Seattle',
    state: 'Washington',
    stateAbbr: 'WA',
    breweryDbCity: 'seattle',
    breweryDbState: 'washington',
    image: seattleImage,
    imageCredit: {
      text: 'M.O. Stevens',
      url: 'https://commons.wikimedia.org/wiki/File:Downtown_Seattle_skyline_from_Space_Needle_May_2011.JPG',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  },
  {
    id: 'san-diego-ca',
    name: 'San Diego',
    state: 'California',
    stateAbbr: 'CA',
    breweryDbCity: 'san_diego',
    breweryDbState: 'california',
    image: sanDiegoImage,
    imageCredit: {
      text: 'Boatguy619',
      url: 'https://commons.wikimedia.org/wiki/File:San_Diego_skyline_18.jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
  {
    id: 'santa-cruz-ca',
    name: 'Santa Cruz',
    state: 'California',
    stateAbbr: 'CA',
    breweryDbCity: 'santa_cruz',
    breweryDbState: 'california',
    image: santaCruzImage,
    imageCredit: {
      text: 'Matt314',
      url: 'https://commons.wikimedia.org/wiki/File:Santa_Cruz,_California_-_Boardwalk.jpg',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    },
  },
  {
    id: 'grass-valley-ca',
    name: 'Grass Valley',
    state: 'California',
    stateAbbr: 'CA',
    breweryDbCity: 'grass_valley',
    breweryDbState: 'california',
    image: grassValleyImage,
    imageCredit: {
      text: 'AstroDominant',
      url: 'https://commons.wikimedia.org/wiki/File:View_of_Grass_Valley,_CA_2025.jpg',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
]
