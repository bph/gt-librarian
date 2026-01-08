/**
 * UTM parameter utilities for tracking chatbot-generated links
 */

export interface UtmParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
}

export interface UtmConfig {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_target_domain?: string;
}

// Global configuration for UTM parameters
let globalUtmConfig: UtmConfig = {};

/**
 * Set global UTM configuration
 * Called by custom elements when they initialize with UTM attributes
 * @param config - UTM configuration object
 */
export function setUtmConfig(config: UtmConfig): void {
  globalUtmConfig = { ...config };
}

/**
 * Get current UTM configuration
 * @returns Current global UTM config
 */
export function getUtmConfig(): UtmConfig {
  return { ...globalUtmConfig };
}

/**
 * Check if a URL belongs to the target domain
 * @param url - The URL to check
 * @param targetDomain - The target domain to match (e.g., "woocommerce.com")
 * @returns true if the URL matches the target domain
 */
export function isTargetUrl(url: string, targetDomain: string): boolean {
  if (!targetDomain) {
    return false;
  }

  try {
    // Handle relative URLs - we'll skip them for now
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }

    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const target = targetDomain.toLowerCase();

    // Match exact domain, www subdomain, or any subdomain
    return hostname === target ||
           hostname === `www.${target}` ||
           hostname.endsWith(`.${target}`);
  } catch (error) {
    // Invalid URL, return false
    return false;
  }
}

/**
 * Get UTM parameters with optional context
 * Uses global configuration if available
 * @param context - Optional context for utm_content (e.g., "response-link", "source-link")
 * @returns UTM parameters object
 */
export function getUtmParams(context?: string): UtmParams | null {
  const config = globalUtmConfig;

  // Only return params if we have at least source, medium, and campaign
  if (!config.utm_source || !config.utm_medium || !config.utm_campaign) {
    return null;
  }

  return {
    utm_source: config.utm_source,
    utm_medium: config.utm_medium,
    utm_campaign: config.utm_campaign,
    utm_content: context,
  };
}

/**
 * Append UTM parameters to a URL
 * Preserves existing query parameters and hash fragments
 * Does not override existing UTM parameters
 *
 * @param url - The URL to append parameters to
 * @param params - The UTM parameters to append
 * @returns URL with UTM parameters appended
 */
export function appendUtmParams(url: string, params: UtmParams): string {
  try {
    // Handle relative URLs - we'll skip them for now
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }

    const urlObj = new URL(url);
    const searchParams = urlObj.searchParams;

    // Only add UTM parameters if they don't already exist
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

    for (const key of keys) {
      const value = params[key];
      if (value && !searchParams.has(key)) {
        searchParams.set(key, value);
      }
    }

    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn('Failed to append UTM parameters to URL:', url, error);
    return url;
  }
}

/**
 * Add UTM tracking parameters to URLs matching the configured target domain
 * This is the main function to use for enhancing links
 *
 * @param url - The URL to enhance
 * @param context - Optional context for utm_content parameter
 * @returns Enhanced URL with UTM parameters (if matches target domain), or original URL
 */
export function enhanceUrl(url: string, context?: string): string {
  const config = globalUtmConfig;

  // Only enhance if we have a target domain configured
  if (!config.utm_target_domain) {
    return url;
  }

  // Check if URL matches target domain
  if (!isTargetUrl(url, config.utm_target_domain)) {
    return url;
  }

  // Get UTM parameters with context
  const utmParams = getUtmParams(context);
  if (!utmParams) {
    return url;
  }

  return appendUtmParams(url, utmParams);
}
