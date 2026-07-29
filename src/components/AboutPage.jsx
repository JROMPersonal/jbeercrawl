function AboutPage() {
  return (
    <main className="city-panel">
      <div className="city-panel__content about-page">
        <h1 className="about-page__title">About JBeer Crawl</h1>

        <p>
          JBeer Crawl helps you plan brewery crawls across cities. Pick a
          city, browse its breweries, and build a route between the ones
          you want to hit — on foot or by car.
        </p>
        <p>
          Crawls are shared: anyone who opens the app can see them, add
          their own, or reorder the stops. On the Map tab, routes use real
          driving directions, and you can drop in extra stops on the fly
          and save them as a new crawl without touching the original.
        </p>

        <h2 className="about-page__subtitle">Data &amp; tools</h2>
        <ul className="about-page__list">
          <li>Brewery data from Open Brewery DB</li>
          <li>Maps from OpenStreetMap</li>
          <li>Driving directions from OSRM</li>
        </ul>

        <p>
          Found a bug or have an idea? Use "Report Issue | Suggest Change"
          in the top bar.
        </p>
      </div>
    </main>
  )
}

export default AboutPage
