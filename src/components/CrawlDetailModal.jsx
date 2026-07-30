import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { useIsMobile } from '../hooks/useIsMobile'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useLocatedBreweries } from '../hooks/useLocatedBreweries'
import { TILE_URL, TILE_ATTRIBUTION, formatAddress } from '../utils/leafletSetup'
import {
  ROUTE_COLOR,
  TRAVEL_MODES,
  haversineMiles,
  buildGoogleMapsUrl,
  fetchRoute,
  legKey,
  pathMidpoint,
} from '../utils/routeUtils'
import BreweryCard from './BreweryCard'
import MapFitBounds from './MapFitBounds'
import AddCrawlForm from './AddCrawlForm'

function stopIcon(number, highlighted) {
  return L.divIcon({
    className: 'crawl-stop-icon',
    html: `<div class="crawl-stop-icon__inner${
      highlighted ? ' crawl-stop-icon__inner--hovered' : ''
    }">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

// When a marker is hovered from the brewery list (rather than the mouse
// already being on the marker itself), its tooltip can end up partially
// cut off by the map's edge - especially near the top, since the tooltip
// opens above the marker. Pan (without changing zoom) just enough to bring
// it fully into view whenever that happens.
function CloseOnMapClick({ onClose }) {
  useMapEvents({ click: onClose })
  return null
}

function KeepHoveredMarkerVisible({ hoveredStop }) {
  const map = useMap()

  useEffect(() => {
    if (!hoveredStop) return
    map.panInside(hoveredStop.position, {
      paddingTopLeft: [30, 80],
      paddingBottomRight: [30, 30],
    })
  }, [hoveredStop, map])

  return null
}

function CrawlDetailModal({ crawl, cityId, cityName, breweries, breweriesStatus, onClose }) {
  const [drivingRoutes, setDrivingRoutes] = useState({})
  const [routingStatus, setRoutingStatus] = useState('idle')
  const [hoveredBreweryId, setHoveredBreweryId] = useState(null)
  const [hoverSource, setHoverSource] = useState(null)
  const [showStartFromForm, setShowStartFromForm] = useState(false)
  const [travelMode, setTravelMode] = useState('driving')
  const [hoveredLegKey, setHoveredLegKey] = useState(null)
  const [openLegKey, setOpenLegKey] = useState(null)
  const [mobileTab, setMobileTab] = useState('breweries')
  const markerRefs = useRef({})
  const isMobile = useIsMobile()

  useEscapeKey(onClose)

  const located = useLocatedBreweries(breweries)
  const locatedById = useMemo(() => {
    const map = new Map()
    for (const entry of located) map.set(entry.brewery.id, entry)
    return map
  }, [located])

  const stops = useMemo(() => {
    return crawl.breweries
      .map((crawlBrewery) => locatedById.get(crawlBrewery.id))
      .filter(Boolean)
      .map((stop, index) => ({ ...stop, stopNumber: index + 1 }))
  }, [crawl, locatedById])

  const legs = useMemo(
    () =>
      stops.slice(0, -1).map((stop, i) => ({
        from: stop,
        to: stops[i + 1],
        distance: haversineMiles(stop.position, stops[i + 1].position),
      })),
    [stops],
  )

  useEffect(() => {
    if (legs.length === 0) {
      setDrivingRoutes({})
      setRoutingStatus('idle')
      return
    }

    let cancelled = false
    setRoutingStatus('loading')

    Promise.all(
      legs.map((leg) =>
        fetchRoute(leg.from.position, leg.to.position, travelMode)
          .then((result) => ({ key: legKey(leg), result }))
          .catch(() => ({ key: legKey(leg), result: null })),
      ),
    ).then((results) => {
      if (cancelled) return
      const next = {}
      for (const { key, result } of results) next[key] = result
      setDrivingRoutes(next)
      setRoutingStatus('done')
    })

    return () => {
      cancelled = true
    }
  }, [legs, travelMode])

  // Lets hovering a brewery in the left-hand list open that marker's
  // tooltip on the map (and vice versa, via the marker's own mouseover
  // handler setting the same hoveredBreweryId state below).
  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([breweryId, marker]) => {
      if (!marker) return
      if (breweryId === hoveredBreweryId) marker.openTooltip()
      else marker.closeTooltip()
    })
  }, [hoveredBreweryId])

  const totalMiles = legs.reduce((sum, leg) => {
    const driving = drivingRoutes[legKey(leg)]
    return sum + (driving?.distanceMiles ?? leg.distance)
  }, 0)

  const bounds = stops.length > 0 ? L.latLngBounds(stops.map((s) => s.position)) : null
  const skippedStops = crawl.breweries.length - stops.length
  const travelModeLabel =
    TRAVEL_MODES.find((mode) => mode.value === travelMode)?.label.toLowerCase() ?? 'driving'
  const hoveredStop =
    hoverSource === 'list' ? stops.find((s) => s.brewery.id === hoveredBreweryId) ?? null : null

  const openLeg = legs.find((leg) => legKey(leg) === openLegKey) ?? null
  let openLegPositions = null
  if (openLeg) {
    const driving = drivingRoutes[openLegKey]
    openLegPositions = driving?.positions ?? [openLeg.from.position, openLeg.to.position]
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal modal--crawl-detail" onClick={(event) => event.stopPropagation()}>
          <div className="crawl-detail__header">
            <div className="crawl-detail__header-main">
              <div className="crawl-detail__title-block">
                <h3 className="modal__title">{crawl.name}</h3>
                <p className="crawl-detail__creator">by {crawl.creatorName || 'Anonymous'}</p>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => setShowStartFromForm(true)}
              >
                Start New Crawl
              </button>
            </div>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          {skippedStops > 0 && (
            <p className="map-tab__note">
              {skippedStops} stop{skippedStops === 1 ? '' : 's'} in this crawl couldn't be
              located on the map.
            </p>
          )}

          {isMobile && (
            <div className="tab-bar tab-bar--modal crawl-detail__mobile-tabs">
              <button
                type="button"
                className={`tab-bar__button${
                  mobileTab === 'breweries' ? ' tab-bar__button--active' : ''
                }`}
                onClick={() => setMobileTab('breweries')}
              >
                Crawl Breweries
              </button>
              <button
                type="button"
                className={`tab-bar__button${
                  mobileTab === 'map' ? ' tab-bar__button--active' : ''
                }`}
                onClick={() => setMobileTab('map')}
              >
                Crawl Map
              </button>
            </div>
          )}

          <div className="crawl-detail__body">
            {(!isMobile || mobileTab === 'breweries') && (
              <div className="crawl-detail__list">
                {stops.map((stop) => (
                  <div
                    key={stop.brewery.id}
                    className={`crawl-detail__stop${
                      hoveredBreweryId === stop.brewery.id ? ' crawl-detail__stop--hovered' : ''
                    }`}
                    onMouseEnter={() => {
                      setHoveredBreweryId(stop.brewery.id)
                      setHoverSource('list')
                    }}
                    onMouseLeave={() => {
                      setHoveredBreweryId(null)
                      setHoverSource(null)
                    }}
                    onClick={() => {
                      const marker = markerRefs.current[stop.brewery.id]
                      if (!marker) return
                      marker.closeTooltip()
                      if (marker.isPopupOpen()) {
                        marker.closePopup()
                        setHoveredBreweryId(null)
                        setHoverSource(null)
                      } else {
                        marker.openPopup()
                        // On touch devices there's no real onMouseEnter, so tapping
                        // wouldn't otherwise trigger the marker glow or the
                        // pan-into-view assist below - set the same state a hover
                        // would so tapping gets full parity with hovering.
                        setHoveredBreweryId(stop.brewery.id)
                        setHoverSource('list')
                      }
                    }}
                  >
                    <span className="crawl-detail__stop-number">{stop.stopNumber}</span>
                    <BreweryCard brewery={stop.brewery} />
                  </div>
                ))}
                {stops.length === 0 && (
                  <p className="city-panel__message">
                    None of this crawl's breweries have location data to show.
                  </p>
                )}
              </div>
            )}

            {(!isMobile || mobileTab === 'map') && (
              <div className="crawl-detail__map">
                <div className="crawl-detail__map-toolbar">
                  <div className="crawl-detail__map-toolbar-left">
                    {stops.length >= 2 && (
                      <a
                        className="map-tab__gmaps-link"
                        href={buildGoogleMapsUrl(stops, travelMode)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Google Maps ↗
                      </a>
                    )}
                    <label className="map-tab__route-select">
                      <span>Mode:</span>
                      <select
                        value={travelMode}
                        onChange={(event) => setTravelMode(event.target.value)}
                      >
                        {TRAVEL_MODES.map((mode) => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <span className="map-tab__route-stats">
                    {stops.length} brewer{stops.length === 1 ? 'y' : 'ies'}
                    {legs.length > 0 && <> · {totalMiles.toFixed(1)} mi total</>}
                  </span>
                </div>

                {routingStatus === 'loading' && (
                  <p className="map-tab__note">Calculating {travelModeLabel} directions…</p>
                )}

                {bounds && (
                  <div
                    className={`crawl-detail__map-container${
                      (isMobile && legs.length > 0) || hoveredLegKey || openLegKey
                        ? ' map-tab__container--dimmed'
                        : ''
                    }`}
                  >
                    {routingStatus === 'loading' && (
                      <div className="map-tab__loading-overlay">
                        <img
                          src={`${import.meta.env.BASE_URL}jbeercrawl-icon.png`}
                          alt=""
                          className="map-tab__loading-icon"
                        />
                      </div>
                    )}

                    <MapContainer center={bounds.getCenter()} zoom={12} scrollWheelZoom>
                      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                      <MapFitBounds bounds={bounds} triggerKey={crawl.id} />
                      <KeepHoveredMarkerVisible hoveredStop={hoveredStop} />
                      <CloseOnMapClick onClose={() => setOpenLegKey(null)} />

                      {stops.map(({ brewery, position, stopNumber }) => (
                        <Marker
                          key={brewery.id}
                          position={position}
                          icon={stopIcon(stopNumber, hoveredBreweryId === brewery.id)}
                          ref={(marker) => {
                            markerRefs.current[brewery.id] = marker
                          }}
                          eventHandlers={{
                            click: () => setOpenLegKey(null),
                            mouseover: () => {
                              setHoveredBreweryId(brewery.id)
                              setHoverSource('marker')
                            },
                            mouseout: () => {
                              setHoveredBreweryId(null)
                              setHoverSource(null)
                            },
                            popupclose: () =>
                              setHoveredBreweryId((prev) => (prev === brewery.id ? null : prev)),
                          }}
                        >
                          <Tooltip direction="top" offset={[0, -14]}>
                            <strong>{brewery.name}</strong>
                            {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
                          </Tooltip>
                          <Popup>
                            <strong>
                              {stopNumber}. {brewery.name}
                            </strong>
                            {formatAddress(brewery) && <div>{formatAddress(brewery)}</div>}
                          </Popup>
                        </Marker>
                      ))}

                      {legs.map((leg) => {
                        const key = legKey(leg)
                        const driving = drivingRoutes[key]
                        const positions = driving?.positions ?? [
                          leg.from.position,
                          leg.to.position,
                        ]
                        return (
                          <Polyline
                            key={`glow-${key}`}
                            positions={positions}
                            ref={(layer) => {
                              const el = layer?.getElement?.()
                              if (el) el.style.pointerEvents = 'none'
                            }}
                            pathOptions={{
                              color: ROUTE_COLOR,
                              weight: 18,
                              // On mobile there's no real hover, so the whole
                              // route stays glowing rather than only lighting
                              // up on tap.
                              opacity: isMobile || key === hoveredLegKey ? 0.45 : 0,
                            }}
                          />
                        )
                      })}

                      {legs.map((leg) => {
                        const key = legKey(leg)
                        const driving = drivingRoutes[key]
                        const positions = driving?.positions ?? [
                          leg.from.position,
                          leg.to.position,
                        ]
                        const isHighlighted = isMobile || key === hoveredLegKey
                        return (
                          <Polyline
                            key={`line-${key}`}
                            positions={positions}
                            pathOptions={{
                              color: ROUTE_COLOR,
                              weight: isHighlighted ? 7 : 5,
                              opacity: isHighlighted ? 1 : 0.9,
                            }}
                          />
                        )
                      })}

                      {legs.map((leg) => {
                        const key = legKey(leg)
                        const driving = drivingRoutes[key]
                        const positions = driving?.positions ?? [
                          leg.from.position,
                          leg.to.position,
                        ]
                        const distance = driving?.distanceMiles ?? leg.distance
                        const label = driving ? travelModeLabel : 'straight-line'

                        return (
                          <Polyline
                            key={`hit-${key}`}
                            positions={positions}
                            pathOptions={{ color: ROUTE_COLOR, weight: 20, opacity: 0 }}
                            eventHandlers={{
                              click: () => setOpenLegKey((prev) => (prev === key ? null : key)),
                              mouseover: () => setHoveredLegKey(key),
                              mouseout: () => setHoveredLegKey(null),
                            }}
                          >
                            <Tooltip sticky className="route-leg-tooltip">
                              {leg.from.brewery.name} → {leg.to.brewery.name}:{' '}
                              {distance.toFixed(1)} mi ({label})
                            </Tooltip>
                          </Polyline>
                        )
                      })}

                      {openLeg && openLegPositions && (
                        <Popup
                          position={pathMidpoint(openLegPositions)}
                          eventHandlers={{ remove: () => setOpenLegKey(null) }}
                        >
                          {openLeg.from.brewery.name} → {openLeg.to.brewery.name}:{' '}
                          {(
                            drivingRoutes[openLegKey]?.distanceMiles ?? openLeg.distance
                          ).toFixed(1)}{' '}
                          mi ({drivingRoutes[openLegKey] ? travelModeLabel : 'straight-line'})
                        </Popup>
                      )}
                    </MapContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showStartFromForm && (
        <AddCrawlForm
          cityId={cityId}
          cityName={cityName}
          breweries={breweries}
          breweriesStatus={breweriesStatus}
          initialOrderedIds={stops.map((stop) => stop.brewery.id)}
          initialTab="map"
          onClose={() => setShowStartFromForm(false)}
          onCreated={onClose}
        />
      )}
    </>
  )
}

export default CrawlDetailModal
