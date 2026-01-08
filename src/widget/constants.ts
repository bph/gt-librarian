export const UTM_ATTRIBUTES = [
  "utm-source",
  "utm-medium",
  "utm-campaign",
  "utm-target-domain",
];

// Default avatar SVG as data URI - simple bot icon
export const DEFAULT_AVATAR = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="12" fill="#2271b1"/>
  <circle cx="32" cy="28" r="16" fill="#ffffff"/>
  <rect x="22" y="38" width="20" height="18" rx="2" fill="#ffffff"/>
  <circle cx="26" cy="26" r="3" fill="#2271b1"/>
  <circle cx="38" cy="26" r="3" fill="#2271b1"/>
  <path d="M 26 32 Q 32 36 38 32" stroke="#2271b1" stroke-width="2" fill="none" stroke-linecap="round"/>
  <rect x="24" y="42" width="6" height="2" rx="1" fill="#2271b1" opacity="0.3"/>
  <rect x="34" y="42" width="6" height="2" rx="1" fill="#2271b1" opacity="0.3"/>
  <rect x="24" y="48" width="16" height="2" rx="1" fill="#2271b1" opacity="0.3"/>
  <circle cx="32" cy="16" r="2" fill="#ffffff"/>
  <rect x="30" y="12" width="4" height="4" fill="#ffffff"/>
</svg>
`)}`;
