/**
 * Vercel Serverless Function: Get Today's Date
 * Returns current date in DD/MM/YYYY format based on user's timezone
 */

export default function handler(req, res) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  // Detect timezone with priority: query param > Vercel header > UTC fallback
  const timezone =
    req.query.timezone ||
    req.headers['x-vercel-ip-timezone'] ||
    'UTC';

  // Validate timezone by attempting to use it
  try {
    // Test if timezone is valid by creating a formatter
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Get current date in the specified timezone
    const now = new Date();
    const formattedDate = formatter.format(now);

    // Return JSON response
    return res.status(200).json({
      date: formattedDate,
      timezone: timezone
    });

  } catch (error) {
    // Invalid timezone provided
    return res.status(400).json({
      error: 'Invalid timezone',
      message: `The timezone "${timezone}" is not valid. Please use a valid IANA timezone identifier (e.g., "Asia/Kolkata", "America/New_York", "Europe/London").`,
      providedTimezone: timezone
    });
  }
}
