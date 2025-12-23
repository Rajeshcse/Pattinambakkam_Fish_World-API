# Pattinambakkam Fish World API - Deployment Guide

## 🚀 Deployment Checklist

### Prerequisites

Before deploying, ensure you have:

- [ ] MongoDB Atlas account and cluster created
- [ ] Cloudinary account for image uploads
- [ ] Email service configured (Gmail/SendGrid/etc.)
- [ ] WhatsApp Business number for order notifications
- [ ] Render.com account (or chosen deployment platform)

---

## 📋 Step-by-Step Deployment Guide

### 1. Prepare MongoDB Atlas

1. **Create MongoDB Atlas Account**: Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a Cluster**: Choose the free tier (M0)
3. **Create Database User**:
   - Go to Database Access
   - Add New Database User
   - Set username and strong password
   - Grant "Read and write to any database" permission
4. **Whitelist IP Addresses**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows access from anywhere - for production)
   - Note: For better security, use Render's specific IP ranges once deployed
5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with your database name (e.g., `pfw-production`)

### 2. Set Up Cloudinary

1. **Create Account**: Visit [https://cloudinary.com](https://cloudinary.com)
2. **Get Credentials**:
   - Go to Dashboard
   - Note your:
     - Cloud Name
     - API Key
     - API Secret
3. **Configure Upload Preset** (Optional):
   - Go to Settings > Upload
   - Create an upload preset for product images

### 3. Configure Email Service

#### Option A: Gmail (Quick Setup)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account > Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=<generated-app-password>
   ```

#### Option B: SendGrid (Recommended for Production)
1. Create account at [https://sendgrid.com](https://sendgrid.com)
2. Create API Key
3. Use these settings:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=<your-sendgrid-api-key>
   ```

### 4. Deploy to Render

#### Method 1: Using render.yaml (Recommended)

1. **Push Code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [https://render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Set Environment Variables**:
   After deployment is created, go to the service and add these environment variables:

   ```bash
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pfw-production?retryWrites=true&w=majority

   # JWT Secrets (IMPORTANT: Generate strong random strings)
   JWT_SECRET=<generate-32-char-random-string>
   JWT_REFRESH_SECRET=<generate-different-32-char-random-string>

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=<your-app-password>
   FROM_EMAIL=noreply@yourdomain.com

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>

   # WhatsApp
   ADMIN_WHATSAPP_NUMBER=919876543210
   ```

4. **Generate Strong Secrets**:
   Use this command to generate random secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

#### Method 2: Manual Setup

1. **Create Web Service**:
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure Service**:
   - Name: `pattinambakkam-fish-world-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`

3. **Add Environment Variables** (same as above)

### 5. Post-Deployment Steps

#### Create Admin User

Once deployed, create your first admin user:

1. **SSH into Render** (or use Render Shell):
   ```bash
   npm run create-admin
   ```

   OR manually promote existing user:
   ```bash
   npm run promote-admin user@example.com
   ```

2. **Edit the script before running**:
   - Open `scripts/createAdmin.js`
   - Update admin credentials
   - Run the script

#### Test Your API

1. **Check Health**:
   ```bash
   curl https://your-app.onrender.com/
   ```

2. **Test Registration**:
   ```bash
   curl -X POST https://your-app.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "phone": "9876543210",
       "password": "Test123"
     }'
   ```

3. **Access API Documentation**:
   ```
   https://your-app.onrender.com/api-docs
   ```

### 6. Update Frontend Configuration

Update your frontend to use the production API URL:

```javascript
const API_BASE_URL = 'https://your-app.onrender.com/api';
```

---

## 🔒 Security Recommendations

### Production Environment Variables

**CRITICAL**: Never commit these to git:
- ✅ Use strong, random JWT secrets (32+ characters)
- ✅ Use environment variables for all secrets
- ✅ Rotate secrets periodically
- ✅ Use different secrets for dev/staging/production

### MongoDB Atlas Security

1. **Enable Encryption at Rest**
2. **Use IP Whitelisting**: Replace `0.0.0.0/0` with specific IPs after deployment
3. **Enable Audit Logs** (paid tier)
4. **Regular Backups**: Enable automatic backups

### Application Security Checklist

- [✅] Helmet.js enabled (XSS, clickjacking protection)
- [✅] Rate limiting configured
- [✅] CORS properly configured
- [✅] Input validation on all endpoints
- [✅] Password hashing with bcrypt
- [✅] JWT tokens with expiration
- [ ] Consider adding request size limits
- [ ] Set up monitoring and alerts

---

## 📊 Monitoring & Maintenance

### Render Dashboard

Monitor your deployment:
- Check logs for errors
- Monitor CPU/Memory usage
- Set up alerts for downtime

### Recommended Monitoring Tools

1. **Uptime Monitoring**:
   - [UptimeRobot](https://uptimerobot.com) (Free)
   - [Better Uptime](https://betteruptime.com)

2. **Error Tracking**:
   - [Sentry](https://sentry.io) - Add to catch production errors
   - [LogRocket](https://logrocket.com) - Session replay

3. **Performance Monitoring**:
   - Render's built-in metrics
   - MongoDB Atlas monitoring

### Database Backups

1. MongoDB Atlas automatic backups (paid tier)
2. Manual export using `mongodump`:
   ```bash
   mongodump --uri="mongodb+srv://..." --out=./backup
   ```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Timeout

**Error**: `MongoServerError: querySrv ETIMEOUT`

**Solutions**:
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify connection string is correct
- Check database user credentials
- Ensure database user has proper permissions

#### 2. Environment Variables Not Loading

**Error**: `JWT_SECRET is not defined`

**Solutions**:
- Verify all env vars are set in Render dashboard
- Check for typos in variable names
- Restart the service after adding env vars

#### 3. Image Upload Failing

**Error**: Cloudinary errors

**Solutions**:
- Verify Cloudinary credentials are correct
- Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Ensure upload preset is configured (if using)

#### 4. Email Not Sending

**Error**: SMTP connection errors

**Solutions**:
- For Gmail: Ensure App Password is generated (not regular password)
- Check SMTP settings match your provider
- Verify firewall/network settings allow SMTP

#### 5. Rate Limiting Too Aggressive

**Issue**: Users getting blocked frequently

**Solutions**:
- Adjust rate limits in `middleware/rateLimiter.js`
- Consider increasing limits for production
- Implement Redis for distributed rate limiting (if scaling)

---

## 🔄 Updates & Rollbacks

### Deploying Updates

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```

2. Render will automatically deploy (if auto-deploy enabled)

### Manual Deployment

In Render dashboard:
- Go to your service
- Click "Manual Deploy"
- Choose branch to deploy

### Rollback

1. Go to Render Dashboard
2. Navigate to "Events"
3. Click on a previous successful deployment
4. Click "Rollback to this version"

---

## 📈 Scaling Considerations

### When to Upgrade from Free Tier

Free tier limitations:
- Sleeps after 15 minutes of inactivity
- 750 hours/month shared across all free services
- Limited CPU/RAM

Upgrade when:
- You have consistent traffic
- You need faster response times
- You want custom domain with SSL
- You need more than 512MB RAM

### Performance Optimization

1. **Enable Database Indexing**:
   - Add indexes on frequently queried fields
   - Monitor slow queries in MongoDB Atlas

2. **Caching**:
   - Add Redis for session storage
   - Cache frequently accessed data

3. **CDN**:
   - Use Cloudinary's CDN for images
   - Consider using a CDN for API responses

---

## 🎯 Production Checklist

Before going live:

### Environment & Configuration
- [ ] All environment variables set correctly
- [ ] Strong JWT secrets generated
- [ ] MongoDB Atlas configured and accessible
- [ ] Cloudinary configured
- [ ] Email service tested and working
- [ ] WhatsApp integration tested

### Security
- [ ] Helmet.js enabled
- [ ] CORS configured for your domain
- [ ] Rate limiting tested
- [ ] MongoDB IP whitelist configured
- [ ] Secrets not committed to git

### Testing
- [ ] All API endpoints tested
- [ ] Authentication flow tested
- [ ] File uploads working
- [ ] Email notifications working
- [ ] Order creation and WhatsApp notification tested
- [ ] Admin panel accessible

### Monitoring
- [ ] Uptime monitoring configured
- [ ] Error tracking set up (optional)
- [ ] Database backups enabled
- [ ] Logs reviewed for errors

### Documentation
- [ ] API documentation accessible
- [ ] Frontend updated with production URL
- [ ] Admin user created
- [ ] Team has access to credentials (secure storage)

---

## 📞 Support & Resources

### Render Documentation
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

### MongoDB Atlas
- [Getting Started](https://docs.atlas.mongodb.com/getting-started/)
- [Security Checklist](https://docs.atlas.mongodb.com/security-checklist/)

### Cloudinary
- [Node.js Integration](https://cloudinary.com/documentation/node_integration)
- [Upload API](https://cloudinary.com/documentation/upload_images)

---

## 🎉 You're Ready to Deploy!

Follow the steps above, and your API will be live. Good luck! 🚀
