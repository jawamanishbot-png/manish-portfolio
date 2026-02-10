import admin from 'firebase-admin';

const ADMIN_TOKEN = 'manish-portfolio-admin-2026';

export const analyticsSummary = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Auth check (same as list.js)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring('Bearer '.length);
    const isStaticToken = token === ADMIN_TOKEN;
    const isSessionToken = token.startsWith('session_');

    if (!isStaticToken && !isSessionToken) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }

    const db = admin.firestore();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Get date for 7 days ago
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // Get date for 30 days ago
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];

    // Fetch all events from the last 30 days
    const snapshot = await db.collection('analytics')
      .where('date', '>=', monthAgoStr)
      .orderBy('date', 'desc')
      .get();

    const events = [];
    snapshot.forEach((doc) => events.push(doc.data()));

    // Page views
    const pageViews = events.filter((e) => e.event === 'page_view');
    const todayViews = pageViews.filter((e) => e.date === todayStr);
    const weekViews = pageViews.filter((e) => e.date >= weekAgoStr);

    // Unique visitors (by ip_hash)
    const todayVisitors = new Set(todayViews.map((e) => e.ip_hash)).size;
    const weekVisitors = new Set(weekViews.map((e) => e.ip_hash)).size;
    const totalVisitors = new Set(pageViews.map((e) => e.ip_hash)).size;

    // Device breakdown
    const mobileCount = pageViews.filter((e) => e.device === 'mobile').length;
    const desktopCount = pageViews.filter((e) => e.device === 'desktop').length;

    // Top referrers
    const referrerCounts = {};
    pageViews.forEach((e) => {
      const ref = e.referrer || 'Direct';
      try {
        const hostname = ref === 'Direct' ? 'Direct' : new URL(ref).hostname;
        referrerCounts[hostname] = (referrerCounts[hostname] || 0) + 1;
      } catch {
        referrerCounts[ref || 'Direct'] = (referrerCounts[ref || 'Direct'] || 0) + 1;
      }
    });
    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    // Button clicks
    const clicks = events.filter((e) => e.event === 'click');
    const clickCounts = {};
    clicks.forEach((e) => {
      const label = e.path || 'unknown';
      clickCounts[label] = (clickCounts[label] || 0) + 1;
    });
    const topClicks = Object.entries(clickCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));

    // Daily views for the last 7 days (for chart)
    const dailyViews = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = pageViews.filter((e) => e.date === dateStr).length;
      dailyViews.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }

    return res.status(200).json({
      views: {
        today: todayViews.length,
        week: weekViews.length,
        month: pageViews.length,
      },
      visitors: {
        today: todayVisitors,
        week: weekVisitors,
        month: totalVisitors,
      },
      devices: {
        mobile: mobileCount,
        desktop: desktopCount,
      },
      topReferrers,
      topClicks,
      dailyViews,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ error: error.message });
  }
};
