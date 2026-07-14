// ============================================================
// Provider URL Construction Utility
// Ported from chatfire-AI/huobao-drama reference project.
// Prevents double-prefixing API version paths when a baseUrl
// already includes a path segment (e.g. "/v1").
// ============================================================

/**
 * Safely join a base URL, a required API prefix, and a path suffix.
 *
 * If the baseUrl's pathname already ends with `requiredPrefix`,
 * the prefix is NOT appended again — this avoids URLs like
 * `https://api.example.com/v1/v1/images/generations`.
 *
 * @param baseUrl        The provider base URL (e.g. "https://api.minimax.chat")
 * @param requiredPrefix The API version prefix that must be present (e.g. "/v1")
 * @param path           The endpoint path (e.g. "/images/generations")
 * @returns A fully-constructed URL string
 */
export function joinProviderUrl(baseUrl: string, requiredPrefix: string, path: string): string {
  const normalizedBase = (baseUrl || '').replace(/\/+$/, '')
  const normalizedPrefix = normalizeSegment(requiredPrefix)
  const normalizedPath = normalizeSegment(path)

  if (!normalizedBase) {
    return `${normalizedPrefix}${normalizedPath}`
  }

  try {
    const url = new URL(normalizedBase)
    const currentPath = url.pathname.replace(/\/+$/, '')
    const mergedPrefix = currentPath.endsWith(normalizedPrefix)
      ? currentPath
      : `${currentPath}${normalizedPrefix}`

    url.pathname = `${mergedPrefix}${normalizedPath}`.replace(/\/{2,}/g, '/')
    return url.toString()
  } catch {
    // baseUrl is not a valid URL (e.g. a plain hostname without scheme)
    const basePath = normalizedBase.endsWith(normalizedPrefix)
      ? normalizedBase
      : `${normalizedBase}${normalizedPrefix}`
    return `${basePath}${normalizedPath}`
  }
}

/**
 * Ensure a segment starts with "/" and has no trailing slashes.
 */
function normalizeSegment(segment: string): string {
  if (!segment) return ''
  return segment.startsWith('/') ? segment : `/${segment}`
}
