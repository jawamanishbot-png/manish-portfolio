import admin from 'firebase-admin';

export const trackEvent = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, path, referrer } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Missing event field' });
    }

    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

    const doc = {
      event,
      path: path || '/',
      referrer: referrer || '',
      device: isMobile ? 'mobile' : 'desktop',
      user_agent: userAgent.substring(0, 200),
      ip_hash: hashIP(req.ip || req.headers['x-forwarded-for'] || ''),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
    };

    const db = admin.firestore();
    await db.collection('analytics').add(doc);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return res.status(500).json({ error: 'Failed to track event' });
  }
};

// Simple hash to anonymize IPs - we don't store raw IPs
function hashIP(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'v_' + Math.abs(hash).toString(36);
}
