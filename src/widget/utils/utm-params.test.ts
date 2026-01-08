import { describe, expect, test, beforeEach } from '@jest/globals';
import {
  isTargetUrl,
  getUtmParams,
  appendUtmParams,
  enhanceUrl,
  setUtmConfig,
  getUtmConfig,
  UtmParams,
} from './utm-params';

describe('isTargetUrl', () => {
  test('returns true for exact domain match', () => {
    expect(isTargetUrl('https://woocommerce.com', 'woocommerce.com')).toBe(true);
    expect(isTargetUrl('https://woocommerce.com/', 'woocommerce.com')).toBe(true);
    expect(isTargetUrl('https://woocommerce.com/product/', 'woocommerce.com')).toBe(true);
    expect(isTargetUrl('http://woocommerce.com/product/', 'woocommerce.com')).toBe(true);
  });

  test('returns true for www subdomain', () => {
    expect(isTargetUrl('https://www.woocommerce.com', 'woocommerce.com')).toBe(true);
    expect(isTargetUrl('https://www.woocommerce.com/product/', 'woocommerce.com')).toBe(true);
  });

  test('returns true for any subdomain', () => {
    expect(isTargetUrl('https://staging.woocommerce.com', 'woocommerce.com')).toBe(true);
    expect(isTargetUrl('https://staging-1234.woocommerce.com/product/', 'woocommerce.com')).toBe(true);
  });

  test('returns false for different domains', () => {
    expect(isTargetUrl('https://example.com', 'woocommerce.com')).toBe(false);
    expect(isTargetUrl('https://google.com', 'woocommerce.com')).toBe(false);
    expect(isTargetUrl('https://woocommerce.org', 'woocommerce.com')).toBe(false);
  });

  test('returns false for relative URLs', () => {
    expect(isTargetUrl('/product/', 'woocommerce.com')).toBe(false);
    expect(isTargetUrl('../page', 'woocommerce.com')).toBe(false);
    expect(isTargetUrl('product/item', 'woocommerce.com')).toBe(false);
  });

  test('returns false for invalid URLs', () => {
    expect(isTargetUrl('not a url', 'woocommerce.com')).toBe(false);
    expect(isTargetUrl('', 'woocommerce.com')).toBe(false);
    expect(isTargetUrl('javascript:alert(1)', 'woocommerce.com')).toBe(false);
  });

  test('returns false when no target domain provided', () => {
    expect(isTargetUrl('https://woocommerce.com', '')).toBe(false);
  });

  test('works with different target domains', () => {
    expect(isTargetUrl('https://jetpack.com/product/', 'jetpack.com')).toBe(true);
    expect(isTargetUrl('https://www.jetpack.com/product/', 'jetpack.com')).toBe(true);
    expect(isTargetUrl('https://jetpack.com/product/', 'woocommerce.com')).toBe(false);
  });
});

describe('setUtmConfig and getUtmConfig', () => {
  beforeEach(() => {
    // Reset config before each test
    setUtmConfig({});
  });

  test('sets and gets UTM configuration', () => {
    const config = {
      utm_source: 'test-source',
      utm_medium: 'test-medium',
      utm_campaign: 'test-campaign',
      utm_target_domain: 'example.com',
    };
    setUtmConfig(config);
    expect(getUtmConfig()).toEqual(config);
  });

  test('overwrites previous configuration', () => {
    setUtmConfig({ utm_source: 'old' });
    setUtmConfig({ utm_source: 'new', utm_medium: 'medium' });
    expect(getUtmConfig()).toEqual({ utm_source: 'new', utm_medium: 'medium' });
  });
});

describe('getUtmParams', () => {
  beforeEach(() => {
    setUtmConfig({});
  });

  test('returns null when no config is set', () => {
    expect(getUtmParams()).toBeNull();
  });

  test('returns null when config is incomplete', () => {
    setUtmConfig({ utm_source: 'source' });
    expect(getUtmParams()).toBeNull();

    setUtmConfig({ utm_source: 'source', utm_medium: 'medium' });
    expect(getUtmParams()).toBeNull();
  });

  test('returns params when all required fields are set', () => {
    setUtmConfig({
      utm_source: 'test-source',
      utm_medium: 'test-medium',
      utm_campaign: 'test-campaign',
    });
    const params = getUtmParams();
    expect(params).toEqual({
      utm_source: 'test-source',
      utm_medium: 'test-medium',
      utm_campaign: 'test-campaign',
      utm_content: undefined,
    });
  });

  test('includes context in utm_content', () => {
    setUtmConfig({
      utm_source: 'test-source',
      utm_medium: 'test-medium',
      utm_campaign: 'test-campaign',
    });
    const params = getUtmParams('response-link');
    expect(params?.utm_content).toBe('response-link');
  });
});

describe('appendUtmParams', () => {
  const defaultParams: UtmParams = {
    utm_source: 'test-source',
    utm_medium: 'test-medium',
    utm_campaign: 'test-campaign',
    utm_content: 'test-content',
  };

  test('adds UTM parameters to URL without query params', () => {
    const url = 'https://woocommerce.com/product/';
    const result = appendUtmParams(url, defaultParams);
    expect(result).toContain('utm_source=test-source');
    expect(result).toContain('utm_medium=test-medium');
    expect(result).toContain('utm_campaign=test-campaign');
    expect(result).toContain('utm_content=test-content');
  });

  test('preserves existing query parameters', () => {
    const url = 'https://woocommerce.com/product/?key=value&foo=bar';
    const result = appendUtmParams(url, defaultParams);
    expect(result).toContain('key=value');
    expect(result).toContain('foo=bar');
    expect(result).toContain('utm_source=test-source');
  });

  test('preserves hash fragments', () => {
    const url = 'https://woocommerce.com/product/#section';
    const result = appendUtmParams(url, defaultParams);
    expect(result).toContain('#section');
    expect(result).toContain('utm_source=test-source');
  });

  test('preserves both query params and hash', () => {
    const url = 'https://woocommerce.com/product/?key=value#section';
    const result = appendUtmParams(url, defaultParams);
    expect(result).toContain('key=value');
    expect(result).toContain('#section');
    expect(result).toContain('utm_source=test-source');
  });

  test('does not override existing UTM parameters', () => {
    const url = 'https://woocommerce.com/product/?utm_source=existing';
    const result = appendUtmParams(url, defaultParams);
    expect(result).toContain('utm_source=existing');
    expect(result).not.toContain('utm_source=test-source');
    // But should add other UTM params
    expect(result).toContain('utm_medium=test-medium');
  });

  test('handles URLs with special characters', () => {
    const url = 'https://woocommerce.com/product/?q=test%20value';
    const result = appendUtmParams(url, defaultParams);
    // URLSearchParams normalizes %20 to +, both are valid encodings for spaces
    expect(result).toMatch(/q=test(\+|%20)value/);
    expect(result).toContain('utm_source=test-source');
  });

  test('returns original URL for relative URLs', () => {
    const url = '/product/';
    const result = appendUtmParams(url, defaultParams);
    expect(result).toBe(url);
  });

  test('returns original URL for invalid URLs', () => {
    const url = 'not a url';
    const result = appendUtmParams(url, defaultParams);
    expect(result).toBe(url);
  });

  test('skips undefined utm_content parameter', () => {
    const params: UtmParams = {
      utm_source: 'test-source',
      utm_medium: 'test-medium',
      utm_campaign: 'test-campaign',
    };
    const url = 'https://woocommerce.com/product/';
    const result = appendUtmParams(url, params);
    expect(result).toContain('utm_source=test-source');
    expect(result).not.toContain('utm_content');
  });
});

describe('enhanceUrl', () => {
  beforeEach(() => {
    setUtmConfig({});
  });

  test('does not enhance when no config is set', () => {
    const url = 'https://woocommerce.com/product/';
    const result = enhanceUrl(url);
    expect(result).toBe(url);
    expect(result).not.toContain('utm_source');
  });

  test('does not enhance when no target domain configured', () => {
    setUtmConfig({
      utm_source: 'test',
      utm_medium: 'test',
      utm_campaign: 'test',
    });
    const url = 'https://woocommerce.com/product/';
    const result = enhanceUrl(url);
    expect(result).toBe(url);
  });

  test('enhances URLs matching target domain', () => {
    setUtmConfig({
      utm_source: 'woocommerce',
      utm_medium: 'support-widget',
      utm_campaign: 'help-center',
      utm_target_domain: 'woocommerce.com',
    });
    const url = 'https://woocommerce.com/product/';
    const result = enhanceUrl(url);
    expect(result).toContain('utm_source=woocommerce');
    expect(result).toContain('utm_medium=support-widget');
    expect(result).toContain('utm_campaign=help-center');
  });

  test('enhances URLs with context', () => {
    setUtmConfig({
      utm_source: 'woocommerce',
      utm_medium: 'support-widget',
      utm_campaign: 'help-center',
      utm_target_domain: 'woocommerce.com',
    });
    const url = 'https://woocommerce.com/product/';
    const result = enhanceUrl(url, 'response-link');
    expect(result).toContain('utm_content=response-link');
  });

  test('does not enhance URLs not matching target domain', () => {
    setUtmConfig({
      utm_source: 'woocommerce',
      utm_medium: 'support-widget',
      utm_campaign: 'help-center',
      utm_target_domain: 'woocommerce.com',
    });
    const url = 'https://example.com/product/';
    const result = enhanceUrl(url);
    expect(result).toBe(url);
    expect(result).not.toContain('utm_source');
  });

  test('enhances www subdomain URLs', () => {
    setUtmConfig({
      utm_source: 'woocommerce',
      utm_medium: 'support-widget',
      utm_campaign: 'help-center',
      utm_target_domain: 'woocommerce.com',
    });
    const url = 'https://www.woocommerce.com/product/';
    const result = enhanceUrl(url);
    expect(result).toContain('utm_source=woocommerce');
  });

  test('enhances staging subdomain URLs', () => {
    setUtmConfig({
      utm_source: 'woocommerce',
      utm_medium: 'support-widget',
      utm_campaign: 'help-center',
      utm_target_domain: 'woocommerce.com',
    });
    const url = 'https://staging.woocommerce.com/product/';
    const result = enhanceUrl(url);
    expect(result).toContain('utm_source=woocommerce');
  });

  test('does not enhance relative URLs', () => {
    setUtmConfig({
      utm_source: 'woocommerce',
      utm_medium: 'support-widget',
      utm_campaign: 'help-center',
      utm_target_domain: 'woocommerce.com',
    });
    const url = '/product/';
    const result = enhanceUrl(url);
    expect(result).toBe(url);
  });

  test('handles invalid URLs gracefully', () => {
    setUtmConfig({
      utm_source: 'woocommerce',
      utm_medium: 'support-widget',
      utm_campaign: 'help-center',
      utm_target_domain: 'woocommerce.com',
    });
    const url = 'not a url';
    const result = enhanceUrl(url);
    expect(result).toBe(url);
  });

  test('works with different target domains', () => {
    setUtmConfig({
      utm_source: 'jetpack',
      utm_medium: 'help-chat',
      utm_campaign: 'support',
      utm_target_domain: 'jetpack.com',
    });
    const jetpackUrl = 'https://jetpack.com/product/';
    const wooUrl = 'https://woocommerce.com/product/';

    expect(enhanceUrl(jetpackUrl)).toContain('utm_source=jetpack');
    expect(enhanceUrl(wooUrl)).toBe(wooUrl);
  });
});
