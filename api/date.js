/**
 * Vercel Serverless Function: Get Today's Date
 * Returns current date in DD/MM/YYYY format based on user's timezone
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
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

    // Track analytics (non-blocking)
    trackAnalytics(req, timezone).catch(err => {
      console.error('Analytics tracking error:', err);
    });

    // Return JSON response with custom message
    return res.status(200).json({
      message: `Animals Treated on ${formattedDate}`,
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

/**
 * Track analytics data in Vercel KV
 */
async function trackAnalytics(req, timezone) {
  try {
    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Extract request information
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.headers['x-real-ip'] ||
               'unknown';

    const country = req.headers['x-vercel-ip-country'] || 'unknown';
    const city = req.headers['x-vercel-ip-city'] || 'unknown';
    const region = req.headers['x-vercel-ip-country-region'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Increment total hits counter
    await kv.incr('analytics:total_hits');

    // Increment daily hits
    await kv.hincrby('analytics:daily_hits', date, 1);

    // Track timezone usage
    await kv.hincrby('analytics:timezones', timezone, 1);

    // Track country statistics
    await kv.hincrby('analytics:countries', country, 1);

    // Track city statistics
    const cityKey = `${city}, ${country}`;
    await kv.hincrby('analytics:cities', cityKey, 1);

    // Track region statistics
    const regionKey = `${region}, ${country}`;
    await kv.hincrby('analytics:regions', regionKey, 1);

    // Store recent requests (last 100)
    await kv.lpush('analytics:recent_requests', JSON.stringify({
      timestamp,
      ip: ip.substring(0, 10) + '***', // Anonymize IP for privacy
      country,
      city,
      region,
      timezone,
      userAgent: userAgent.substring(0, 100) // Truncate user agent
    }));

    // Keep only last 100 requests
    await kv.ltrim('analytics:recent_requests', 0, 99);

    // Set expiry for daily hits (30 days)
    await kv.expire('analytics:daily_hits', 60 * 60 * 24 * 30);

  } catch (error) {
    // Silently fail - don't block the main response
    console.error('Analytics error:', error);
  }
}
