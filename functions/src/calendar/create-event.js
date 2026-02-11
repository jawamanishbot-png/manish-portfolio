import { google } from 'googleapis';

const ADMIN_TOKEN = 'manish-portfolio-admin-2026';

/**
 * Create a Google Calendar event with Google Meet link.
 * Uses a service account with domain-wide delegation, or
 * OAuth2 credentials set via environment variables.
 */
export const createCalendarEvent = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Auth check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }
    const token = authHeader.substring('Bearer '.length);
    if (token !== ADMIN_TOKEN && !token.startsWith('session_')) {
      return res.status(403).json({ error: 'Invalid admin token' });
    }

    const { attendeeEmail, topic, date, startTime, durationMinutes = 25 } = req.body;

    if (!attendeeEmail || !date || !startTime) {
      return res.status(400).json({ error: 'Missing attendeeEmail, date, or startTime' });
    }

    // Build OAuth2 client from refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Parse start/end times
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const event = {
      summary: `Consultation: ${topic || 'Booking Request'}`,
      description: `Consultation call with ${attendeeEmail}\n\nTopic: ${topic || 'General discussion'}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: attendeeEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: `booking_${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === 'video'
    )?.uri;

    return res.status(200).json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      meetLink: meetLink || null,
      start: response.data.start.dateTime,
      end: response.data.end.dateTime,
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return res.status(500).json({ error: error.message });
  }
};
