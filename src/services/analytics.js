const getApiBase = () => {
  const env = import.meta.env;
  if (env.VITE_USE_EMULATOR === 'true' && typeof window !== 'undefined') {
    return `http://localhost:5001/${env.VITE_FIREBASE_PROJECT_ID}/us-central1`;
  }
  return '';
};

const API_BASE = getApiBase();

/**
 * Track a page view or click event (fire-and-forget)
 */
export const trackEvent = (event, path) => {
  try {
    fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        path: path || window.location.pathname,
        referrer: document.referrer || '',
      }),
    }).catch(() => {});
  } catch {
    // Analytics should never break the app
  }
};

/**
 * Track a page view (called once on load)
 */
export const trackPageView = () => {
  trackEvent('page_view', window.location.pathname);
};

/**
 * Track a button click
 */
export const trackClick = (label) => {
  trackEvent('click', label);
};

/**
 * Fetch analytics summary (admin only)
 */
export const getAnalytics = async (token) => {
  const res = await fetch(`${API_BASE}/api/analytics/summary`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};
