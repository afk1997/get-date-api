# Get Date API

A minimal Vercel serverless API that returns today's date in JSON format based on the user's timezone, with built-in analytics tracking.

## Features

- Automatic timezone detection from user's IP (via Vercel headers)
- Manual timezone override via query parameters
- CORS-enabled for cross-origin requests
- Date format: DD/MM/YYYY
- Proper error handling for invalid timezones
- Real-time analytics dashboard with live stats
- Privacy-focused analytics (IP addresses are anonymized)

## Project Structure

```
/api
  date.js          # Main date API with analytics tracking
  analytics.js     # Analytics data endpoint
/public
  index.html       # Analytics dashboard
package.json       # Project metadata with @vercel/kv dependency
vercel.json        # Vercel configuration
README.md          # Documentation
```

## API Endpoint

### GET /api/date

Returns the current date in the specified timezone.

#### Timezone Detection Priority

1. Query parameter: `?timezone=Asia/Kolkata`
2. Vercel IP timezone header: `x-vercel-ip-timezone` (auto-detected)
3. Fallback: UTC

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| timezone | string | No | IANA timezone identifier (e.g., "Asia/Kolkata", "America/New_York") |

#### Response Format

**Success (200)**
```json
{
  "message": "Animals Treated on 12/01/2026",
  "date": "12/01/2026",
  "timezone": "Asia/Kolkata"
}
```

**Error (400 - Invalid Timezone)**
```json
{
  "error": "Invalid timezone",
  "message": "The timezone \"Invalid/Timezone\" is not valid. Please use a valid IANA timezone identifier (e.g., \"Asia/Kolkata\", \"America/New_York\", \"Europe/London\").",
  "providedTimezone": "Invalid/Timezone"
}
```

**Error (405 - Method Not Allowed)**
```json
{
  "error": "Method not allowed",
  "message": "Only GET requests are supported"
}
```

## Usage Examples

### Basic Usage (Auto-detect from IP)
```bash
curl https://your-app.vercel.app/api/date
```

Response:
```json
{
  "message": "Animals Treated on 12/01/2026",
  "date": "12/01/2026",
  "timezone": "America/New_York"
}
```

### With Specific Timezone
```bash
curl https://your-app.vercel.app/api/date?timezone=Asia/Kolkata
```

Response:
```json
{
  "message": "Animals Treated on 12/01/2026",
  "date": "12/01/2026",
  "timezone": "Asia/Kolkata"
}
```

### JavaScript Fetch Example
```javascript
// Auto-detect timezone
fetch('https://your-app.vercel.app/api/date')
  .then(response => response.json())
  .then(data => console.log(data));

// Specific timezone
fetch('https://your-app.vercel.app/api/date?timezone=Europe/London')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Common Timezone Examples

- `UTC` - Coordinated Universal Time
- `Asia/Kolkata` - Indian Standard Time (IST)
- `America/New_York` - Eastern Time (US)
- `America/Los_Angeles` - Pacific Time (US)
- `Europe/London` - British Time
- `Europe/Paris` - Central European Time
- `Asia/Tokyo` - Japan Standard Time
- `Australia/Sydney` - Australian Eastern Time

[Full list of IANA timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## Analytics Dashboard

The API includes a real-time analytics dashboard that tracks usage statistics.

### Features

- **Total API hits** - Total number of requests
- **Geographic data** - Countries, cities, and regions
- **Timezone usage** - Popular timezones requested
- **Recent requests** - Last 50 requests with timestamps
- **Auto-refresh** - Updates every 30 seconds
- **Privacy-focused** - IP addresses are anonymized

### Access the Dashboard

Visit your deployed app's homepage:
```
https://your-app.vercel.app/
```

### Analytics API Endpoint

GET `/api/analytics` - Returns all analytics data in JSON format

**Response:**
```json
{
  "summary": {
    "totalHits": 1250,
    "uniqueCountries": 15,
    "uniqueCities": 45,
    "uniqueTimezones": 8
  },
  "dailyHits": [
    { "date": "2026-01-10", "hits": 150 },
    { "date": "2026-01-11", "hits": 200 }
  ],
  "timezones": [
    { "name": "Asia/Kolkata", "count": 450 },
    { "name": "America/New_York", "count": 320 }
  ],
  "countries": [
    { "name": "IN", "count": 500 },
    { "name": "US", "count": 450 }
  ],
  "cities": [...],
  "regions": [...],
  "recentRequests": [...]
}
```

### Data Tracked

- Total API hits (persistent)
- Daily hit counts (30-day retention)
- Timezone distribution
- Country, city, and region statistics
- Recent 100 requests (anonymized)
- User agent information

### Privacy

- IP addresses are anonymized (last digits masked)
- No personally identifiable information stored
- Data retention: 30 days for daily stats, indefinite for aggregates

## Deployment

### Deploy to Vercel

1. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to deploy your project

### Or Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Deploy

### Setting Up Vercel KV (Required for Analytics)

After deployment, you need to add Vercel KV storage for analytics:

1. Go to your project dashboard on Vercel
2. Click on the **"Storage"** tab
3. Click **"Create Database"**
4. Select **"KV (Redis)"**
5. Choose **"Continue"** and follow the prompts
6. The KV database will be automatically linked to your project
7. Redeploy your project (or it will auto-deploy on next push)

**Free Tier Limits:**
- 30,000 commands per month
- 256 MB storage
- Perfect for moderate traffic APIs

**Note:** The API will work without KV, but analytics won't be tracked. The dashboard will show an error message prompting you to set up KV.

## Local Development

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Run development server:
```bash
vercel dev
```

3. Test locally:
```bash
curl http://localhost:3000/api/date
```

## Technical Details

- **Runtime**: Node.js 18+
- **Function Memory**: 128 MB
- **Max Duration**: 10 seconds
- **Dependencies**: @vercel/kv (for analytics)
- **Date Format**: DD/MM/YYYY (day/month/year with leading zeros)
- **Storage**: Vercel KV (Redis)
- **Analytics**: Real-time tracking with privacy protection

## License

MIT
