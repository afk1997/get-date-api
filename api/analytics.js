/**
 * Vercel Serverless Function: Analytics Data
 * Returns analytics statistics from Vercel KV
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Set CORS headers
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

  try {
    // Fetch all analytics data in parallel
    const [
      totalHits,
      dailyHits,
      timezones,
      countries,
      cities,
      regions,
      recentRequests
    ] = await Promise.all([
      kv.get('analytics:total_hits'),
      kv.hgetall('analytics:daily_hits'),
      kv.hgetall('analytics:timezones'),
      kv.hgetall('analytics:countries'),
      kv.hgetall('analytics:cities'),
      kv.hgetall('analytics:regions'),
      kv.lrange('analytics:recent_requests', 0, 99)
    ]);

    // Sort and format data
    const sortedTimezones = sortObject(timezones || {});
    const sortedCountries = sortObject(countries || {});
    const sortedCities = sortObject(cities || {});
    const sortedRegions = sortObject(regions || {});

    // Parse recent requests
    const parsedRecentRequests = (recentRequests || []).map(item => {
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    }).filter(Boolean);

    // Format daily hits for chart
    const dailyHitsArray = Object.entries(dailyHits || {})
      .map(([date, hits]) => ({ date, hits: parseInt(hits) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Return analytics data
    return res.status(200).json({
      summary: {
        totalHits: parseInt(totalHits || 0),
        uniqueCountries: Object.keys(countries || {}).length,
        uniqueCities: Object.keys(cities || {}).length,
        uniqueTimezones: Object.keys(timezones || {}).length
      },
      dailyHits: dailyHitsArray,
      timezones: sortedTimezones,
      countries: sortedCountries,
      cities: sortedCities.slice(0, 20), // Top 20 cities
      regions: sortedRegions.slice(0, 20), // Top 20 regions
      recentRequests: parsedRecentRequests.slice(0, 50) // Last 50 requests
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
}

/**
 * Helper function to sort object by values in descending order
 */
function sortObject(obj) {
  return Object.entries(obj)
    .map(([key, value]) => ({ name: key, count: parseInt(value) }))
    .sort((a, b) => b.count - a.count);
}
