// Open Brewery DB breweries known to be permanently closed (or otherwise
// wrong), filtered out of every API result. Keyed by the brewery's Open
// Brewery DB id (stable across requests) since it isn't our data to edit
// directly - see src/api/breweryDb.js.
export const EXCLUDED_BREWERY_IDS = new Set([
  '94bf785c-e76a-4a41-8720-e9fb53d72ed4', // Wildcard Brewing Company, Redding, CA - closed
])
