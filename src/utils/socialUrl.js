/**
 * Formats a social media link into a valid absolute HTTPS URL.
 * If the link is missing, empty, '#', or invalid, it falls back to the default platform URL.
 * If the link is missing http/https protocol (e.g., "facebook.com/company" or "www.twitter.com"), https:// is prepended.
 * If the link is a handle (e.g., "@company" or "company"), it is appended to the default platform URL.
 * 
 * @param {string} link - Raw link or handle from database
 * @param {string} defaultPlatformUrl - Default homepage URL for the social platform (e.g. "https://www.facebook.com")
 * @returns {string} Fully qualified absolute URL
 */
export const getSocialUrl = (link, defaultPlatformUrl) => {
  if (!link || typeof link !== 'string' || link === '#' || link.trim() === '' || link.trim() === 'javascript:void(0)') {
    return defaultPlatformUrl;
  }

  const trimmed = link.trim();

  // If already starts with http:// or https://
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Handle scheme-relative URLs like "//facebook.com"
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  // Domain or URL path missing scheme, e.g. "facebook.com/page", "www.instagram.com/page"
  if (trimmed.includes('.') || trimmed.includes('/')) {
    return `https://${trimmed}`;
  }

  // Handle username e.g. "@mycompany" or "mycompany"
  const handle = trimmed.replace(/^@/, '');
  const baseUrl = defaultPlatformUrl.replace(/\/$/, '');
  return `${baseUrl}/${handle}`;
};
