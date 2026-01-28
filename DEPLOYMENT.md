# Production Deployment Guide

## Environment Setup

### 1. Copy Production Environment
```bash
cp .env.production .env
```

### 2. Update Production Values
Edit `.env` with your actual production values:
- `VITE_API_BASE_URL`: Your production API URL (e.g., https://api.yourdomain.com)
- `GROQ_API_KEY`: Your production Groq API key
- `MYSQL_*`: Secure database passwords
- `CORS_ORIGINS`: Your production frontend URLs

### 3. Deploy with Production Compose
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Production URLs

### Development (Local)
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Production (Your Domain)
- Frontend: https://yourdomain.com
- Backend API: https://api.yourdomain.com

## Environment Variables

### Required for Production:
- `VITE_API_BASE_URL`: Production API endpoint
- `CORS_ORIGINS`: Allowed frontend domains
- `GROQ_API_KEY`: Valid Groq API key
- Database credentials

### Optional:
- `BACKEND_HOST`: Set to `0.0.0.0` for production
- Custom ports if needed

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong passwords** for database
3. **Restrict CORS origins** to your domains only
4. **Use HTTPS** in production
5. **Keep API keys secure** and rotate regularly

## Docker Networks

Production uses dedicated network `crm-network` for better isolation and security.
