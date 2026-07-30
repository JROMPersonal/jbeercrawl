function AboutPage({ onOpenReportForm }) {
  return (
    <main className="city-panel">
      <div className="city-panel__content about-page">
        <p>
          JBeer Crawl helps you plan a visit around multiple breweries in a
          city - your hometown or somewhere new. Pick a city, browse its
          breweries, and build a route between the ones you want to hit.
        </p>
        <p>
          Or skip the planning: browse "JBeer Crawls" (aka Brewery Hops,
          Beer Tours, Brewery Tours) that other users have already put
          together, and follow their route instead. Crawls are created by
          the community, tied to a single city, and visible to everyone who
          visits the site.
        </p>
        <p>
          A crawl can't be edited once it's created - but you can start from
          an existing one, add stops on the map, and save the result as a
          new crawl without touching the original. Every route on the Map
          tab comes with real driving directions and a one-click link to
          open it in Google Maps.
        </p>

        <h2 className="about-page__subtitle">Usage Guide</h2>
        <p>Click a city to see 3 tabs:</p>
        <ul className="about-page__list">
          <li>
            <strong>Breweries</strong> - every brewery added to JBeer Crawl
            for that city.
            <span className="about-page__cta">
              Add one yourself with{' '}
              <span className="about-page__chip">+ Add Brewery</span> -
              please include as much info as possible.
            </span>
          </li>
          <li>
            <strong>JBeer Crawls</strong> - all the user-created JBeer
            Crawls. Click one to open its route on the Map tab, with a link
            to the route in Google Maps.
            <span className="about-page__cta">
              Create your own with{' '}
              <span className="about-page__chip">+ Add JBeer Crawl</span> -
              pick your breweries, then switch to the "Brewery Path" tab to
              drag them into the order you'll visit.
            </span>
          </li>
          <li>
            <strong>Map</strong> - a map of all breweries in the city, or
            the route for a JBeer Crawl you select.
            <span className="about-page__cta">
              Click a blue marker, then{' '}
              <span className="about-page__chip">+ Add to Route</span> to
              add that brewery to an existing crawl or start a new one -
              save it when you're ready.
            </span>
          </li>
        </ul>

        <h2 className="about-page__subtitle">Data &amp; tools</h2>
        <ul className="about-page__list">
          <li>
            Brewery data from{' '}
            <a href="https://www.openbrewerydb.org/" target="_blank" rel="noreferrer">
              Open Brewery DB
            </a>
          </li>
          <li>
            Maps from{' '}
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>
          </li>
          <li>
            Driving directions from{' '}
            <a href="https://project-osrm.org/" target="_blank" rel="noreferrer">
              OSRM
            </a>
          </li>
        </ul>

        <p>
          Bugs, questions, requests, ideas can all be submitted here:{' '}
          <button
            type="button"
            className="about-page__link"
            onClick={onOpenReportForm}
          >
            Report Issue | Suggest Change
          </button>
        </p>
      </div>
    </main>
  )
}

export default AboutPage
