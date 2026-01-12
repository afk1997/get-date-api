# Get Date API

A minimal Vercel serverless API that returns today's date in JSON format based on the user's timezone.

## Features

- Zero dependencies (uses native JavaScript Intl API)
- Automatic timezone detection from user's IP (via Vercel headers)
- Manual timezone override via query parameters
- CORS-enabled for cross-origin requests
- Date format: DD/MM/YYYY
- Proper error handling for invalid timezones

## Project Structure

```
/api
  date.js          # Serverless function
package.json       # Project metadata
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
- **Dependencies**: None (uses native Intl.DateTimeFormat API)
- **Date Format**: DD/MM/YYYY (day/month/year with leading zeros)

## License

MIT
