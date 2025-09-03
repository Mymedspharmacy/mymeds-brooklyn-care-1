# OpenFDA API Integration Setup Guide

## Overview
This guide covers the setup, configuration, and troubleshooting of the OpenFDA API integration for MyMeds Pharmacy.

## 🔧 Configuration

### Environment Variables
Add these to your `backend/env.production`:

```env
# OpenFDA API Configuration
OPENFDA_API_URL=https://api.fda.gov
OPENFDA_API_KEY=                    # Optional - for higher rate limits
OPENFDA_RATE_LIMIT=1000             # Requests per day
OPENFDA_TIMEOUT=10000               # Request timeout in ms
ENABLE_OPENFDA_INTEGRATION=true     # Enable/disable integration
```

### API Key (Optional)
1. Go to: https://open.fda.gov/apis/authentication/
2. Register for a free API key
3. Update `OPENFDA_API_KEY` in your environment

## 🚀 API Endpoints

### Public Endpoints (No Authentication Required)

#### Health Check
```bash
GET /api/openfda/health
```
**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "OpenFDA API is accessible",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Search Drugs
```bash
GET /api/openfda/search?query=aspirin&limit=10
```
**Parameters:**
- `query` (required): Drug name to search for
- `limit` (optional): Number of results (max 50, default 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "disclaimer": "...",
      "results": {
        "total": 100,
        "skip": 0,
        "limit": 10
      }
    },
    "results": [
      {
        "id": "drug_id",
        "openfda": {
          "brand_name": ["Aspirin"],
          "generic_name": ["ACETYLSALICYLIC ACID"],
          "manufacturer_name": ["Manufacturer"]
        },
        "products": [...]
      }
    ]
  }
}
```

### Admin Endpoints (Authentication Required)

#### Get Drug Details
```bash
GET /api/openfda/drug/{drugId}
```
**Headers:** `Authorization: Bearer <token>`

#### Get Drug Interactions
```bash
GET /api/openfda/drug/{drugId}/interactions
```
**Headers:** `Authorization: Bearer <token>`

#### Get Adverse Reactions
```bash
GET /api/openfda/drug/{drugId}/reactions
```
**Headers:** `Authorization: Bearer <token>`

#### Cache Statistics
```bash
GET /api/openfda/cache/stats
```
**Headers:** `Authorization: Bearer <token>`

#### Clear Cache
```bash
DELETE /api/openfda/cache
```
**Headers:** `Authorization: Bearer <token>`

## 🧪 Testing

### Run Test Script
```bash
node test-openfda.js
```

### Manual Testing
```bash
# Test health check
curl https://your-domain.com/api/openfda/health

# Test search
curl "https://your-domain.com/api/openfda/search?query=aspirin&limit=5"

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-domain.com/api/openfda/drug/drug_id
```

## 🔍 Troubleshooting

### Common Issues

#### 1. 404 Not Found
**Problem:** API returns 404 error
**Solution:** 
- Check if the endpoint URL is correct
- Verify the drug ID exists
- Try searching instead of direct ID lookup

#### 2. Rate Limiting (429)
**Problem:** Too many requests
**Solution:**
- Implement rate limiting (already done in service)
- Get an API key for higher limits
- Add delays between requests

#### 3. Timeout Errors
**Problem:** Requests timing out
**Solution:**
- Increase timeout value
- Check network connectivity
- Verify OpenFDA API status

#### 4. Search Not Working
**Problem:** Search queries return no results
**Solution:**
- Use simpler search terms
- Check query format
- Try different drug names

### Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check query parameters |
| 404 | Not Found | Drug doesn't exist |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Check OpenFDA status |
| 503 | Service Unavailable | OpenFDA API down |

### Debug Commands

```bash
# Check OpenFDA API status
curl -I https://api.fda.gov/drug/label.json

# Test simple search
curl "https://api.fda.gov/drug/label.json?search=aspirin&limit=1"

# Check your application logs
tail -f /var/log/mymeds/application.log | grep OpenFDA
```

## 📊 Monitoring

### Health Checks
The service includes automatic health checks:
- API connectivity
- Response times
- Error rates
- Cache performance

### Logs
OpenFDA requests are logged with:
- Query parameters
- Response times
- Error details
- Cache hits/misses

### Metrics
Monitor these metrics:
- Request success rate
- Average response time
- Cache hit ratio
- Rate limit usage

## 🔒 Security

### Rate Limiting
- Built-in rate limiting (1 second between requests)
- Configurable limits
- Automatic retry logic

### Error Handling
- Graceful error handling
- User-friendly error messages
- Detailed logging for debugging

### Caching
- 30-minute cache for search results
- Configurable cache timeout
- Cache invalidation on errors

## 📈 Performance Optimization

### Caching Strategy
- Search results cached for 30 minutes
- Drug details cached for 30 minutes
- Cache cleared on errors

### Rate Limiting
- 1-second delay between requests
- Configurable rate limits
- Automatic retry with backoff

### Error Recovery
- Automatic retry for transient errors
- Fallback to search when ID lookup fails
- Graceful degradation

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] API key obtained (optional)
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Health checks working
- [ ] Monitoring enabled
- [ ] Logs configured
- [ ] Cache working

### Environment Variables
```env
# Required
OPENFDA_API_URL=https://api.fda.gov
ENABLE_OPENFDA_INTEGRATION=true

# Optional
OPENFDA_API_KEY=your_api_key_here
OPENFDA_RATE_LIMIT=1000
OPENFDA_TIMEOUT=10000
```

## 📞 Support

### OpenFDA Resources
- [OpenFDA Documentation](https://open.fda.gov/apis/)
- [API Status Page](https://open.fda.gov/apis/status/)
- [Authentication Guide](https://open.fda.gov/apis/authentication/)

### Application Support
- Check application logs: `/var/log/mymeds/application.log`
- Monitor health endpoint: `/api/openfda/health`
- Review cache statistics: `/api/openfda/cache/stats`

## 🔄 Updates

### Service Updates
The OpenFDA service is automatically updated with:
- Better error handling
- Improved caching
- Enhanced rate limiting
- New features

### API Changes
OpenFDA API changes are handled by:
- Version checking
- Backward compatibility
- Automatic fallbacks
- Error recovery

---

**Last Updated:** January 2024
**Version:** 1.0.0
