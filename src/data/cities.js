import reddingImage from '../assets/cities/redding-ca.jpg'
import ashevilleImage from '../assets/cities/asheville-nc.jpg'
import atlantaImage from '../assets/cities/atlanta-ga.jpg'
import austinImage from '../assets/cities/austin-tx.jpg'
import chicoImage from '../assets/cities/chico-ca.jpg'
import grassValleyImage from '../assets/cities/grass-valley-ca.jpg'
import niagaraFallsImage from '../assets/cities/niagara-falls-on.jpg'
import portlandImage from '../assets/cities/portland-or.jpg'
import sacramentoImage from '../assets/cities/sacramento-ca.jpg'
import saltLakeCityImage from '../assets/cities/salt-lake-city-ut.jpg'
import sanDiegoImage from '../assets/cities/san-diego-ca.jpg'
import sanFranciscoImage from '../assets/cities/san-francisco-ca.jpg'
import santaCruzImage from '../assets/cities/santa-cruz-ca.jpg'
import seattleImage from '../assets/cities/seattle-wa.jpg'
import tampaImage from '../assets/cities/tampa-fl.jpg'

// `breweryDbCity` / `breweryDbState` are the query values sent to the
// Open Brewery DB API (https://www.openbrewerydb.org/), which expects
// lowercase city/state names. `country` disambiguates state abbreviations
// that collide with a country code (e.g. "CA" = California or Canada) when
// geocoding a custom brewery's address (see src/utils/geocode.js).
export const cities = [
  {
    id: 'redding-ca',
    name: 'Redding',
    state: 'California',
    stateAbbr: 'CA',
    country: 'United States',
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
    id: 'asheville-nc',
    name: 'Asheville',
    state: 'North Carolina',
    stateAbbr: 'NC',
    country: 'United States',
    breweryDbCity: 'asheville',
    breweryDbState: 'north_carolina',
    image: ashevilleImage,
    imageCredit: {
      text: 'Michael Tracey',
      url: 'https://commons.wikimedia.org/wiki/File:Asheville_at_dusk_(cropped).jpg',
      license: 'CC0 1.0',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
  },
  {
    id: 'atlanta-ga',
    name: 'Atlanta',
    state: 'Georgia',
    stateAbbr: 'GA',
    country: 'United States',
    breweryDbCity: 'atlanta',
    breweryDbState: 'georgia',
    image: atlantaImage,
    imageCredit: {
      text: 'AtlChampion',
      url: 'https://commons.wikimedia.org/wiki/File:A2ATL20250614-0721_(cropped).jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
  {
    id: 'austin-tx',
    name: 'Austin',
    state: 'Texas',
    stateAbbr: 'TX',
    country: 'United States',
    breweryDbCity: 'austin',
    breweryDbState: 'texas',
    image: austinImage,
    imageCredit: {
      text: 'Quintin Soloviev',
      url: 'https://commons.wikimedia.org/wiki/File:Skyline_of_Austin,_Texas_(cropped).jpg',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'chico-ca',
    name: 'Chico',
    state: 'California',
    stateAbbr: 'CA',
    country: 'United States',
    breweryDbCity: 'chico',
    breweryDbState: 'california',
    image: chicoImage,
    imageCredit: {
      text: 'Frank Schulenburg',
      url: 'https://commons.wikimedia.org/wiki/File:Chico,_W._3rd_and_Main_(2024)-L1005763.jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
  {
    id: 'grass-valley-ca',
    name: 'Grass Valley',
    state: 'California',
    stateAbbr: 'CA',
    country: 'United States',
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
  {
    id: 'niagara-falls-on',
    name: 'Niagara Falls',
    state: 'Ontario',
    stateAbbr: 'ON',
    country: 'Canada',
    breweryDbCity: 'niagara_falls',
    breweryDbState: 'ontario',
    image: niagaraFallsImage,
    imageCredit: {
      text: 'Salwa Farwaneh',
      url: 'https://commons.wikimedia.org/wiki/File:Niagara_Falls_Ontario_Canada_aerial_view.jpg',
      license: 'CC0 1.0',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
  },
  {
    id: 'portland-or',
    name: 'Portland',
    state: 'Oregon',
    stateAbbr: 'OR',
    country: 'United States',
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
    id: 'sacramento-ca',
    name: 'Sacramento',
    state: 'California',
    stateAbbr: 'CA',
    country: 'United States',
    breweryDbCity: 'sacramento',
    breweryDbState: 'california',
    image: sacramentoImage,
    imageCredit: {
      text: 'Quintin Soloviev',
      url: 'https://commons.wikimedia.org/wiki/File:Sacramento,_California_skyline_2026_(cropped).jpg',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'salt-lake-city-ut',
    name: 'Salt Lake City',
    state: 'Utah',
    stateAbbr: 'UT',
    country: 'United States',
    breweryDbCity: 'salt_lake_city',
    breweryDbState: 'utah',
    image: saltLakeCityImage,
    imageCredit: {
      text: 'Eltiempo10',
      url: 'https://commons.wikimedia.org/wiki/File:Salt_Lake_City_smog_haze_skyline_01.jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
  {
    id: 'san-diego-ca',
    name: 'San Diego',
    state: 'California',
    stateAbbr: 'CA',
    country: 'United States',
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
    id: 'san-francisco-ca',
    name: 'San Francisco',
    state: 'California',
    stateAbbr: 'CA',
    country: 'United States',
    breweryDbCity: 'san_francisco',
    breweryDbState: 'california',
    image: sanFranciscoImage,
    imageCredit: {
      text: 'Daniel L. Lu',
      url: 'https://commons.wikimedia.org/wiki/File:Aerial_view_of_downtown_San_Francisco_from_the_north_dllu.jpg',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  },
  {
    id: 'santa-cruz-ca',
    name: 'Santa Cruz',
    state: 'California',
    stateAbbr: 'CA',
    country: 'United States',
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
    id: 'seattle-wa',
    name: 'Seattle',
    state: 'Washington',
    stateAbbr: 'WA',
    country: 'United States',
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
    id: 'tampa-fl',
    name: 'Tampa',
    state: 'Florida',
    stateAbbr: 'FL',
    country: 'United States',
    breweryDbCity: 'tampa',
    breweryDbState: 'florida',
    image: tampaImage,
    imageCredit: {
      text: 'Trevorrrrvalent',
      url: 'https://commons.wikimedia.org/wiki/File:Tampa_Skyline_from_Ballast_Point_Park_April_2024.jpg',
      license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
]
