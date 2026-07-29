const SAFE_PROTOCOLS = ['http:', 'https:']

/**
 * Guards against javascript:/data:/vbscript: URIs being rendered as a
 * clickable href. User-submitted "website" fields (custom breweries/cities)
 * are free text with no format enforcement at entry, so anything that ends
 * up in an <a href> must be checked here regardless of where it came from.
 */
export function isSafeUrl(value) {
  if (!value) return false

  try {
    return SAFE_PROTOCOLS.includes(new URL(value).protocol)
  } catch {
    return false
  }
}
