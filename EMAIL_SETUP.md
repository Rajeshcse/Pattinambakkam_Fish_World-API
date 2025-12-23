# Email Setup Guide (Gmail)

## Quick Setup for Gmail

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as device
4. Enter: `Pattinambakkam Fish World API`
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File

Replace these lines in your `.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_actual_gmail@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # The app password from step 2 (remove spaces)
FROM_NAME=Pattinambakkam_Fish_World
FROM_EMAIL=your_actual_gmail@gmail.com
```

### Step 4: Test Email

After updating, restart your server and test the password reset endpoint.

---

## Alternative: SendGrid (Recommended for Production)

SendGrid is more reliable for production and offers 100 free emails/day.

### Setup Steps:

1. **Sign up**: [SendGrid](https://sendgrid.com)
2. **Create API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Give it full access
   - Copy the API key

3. **Update .env**:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=<your_sendgrid_api_key>
FROM_NAME=Pattinambakkam_Fish_World
FROM_EMAIL=verified_email@yourdomain.com  # Must verify this email in SendGrid
```

---

## Environment Variables for Render

When deploying to Render, add these environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_NAME=Pattinambakkam_Fish_World
FROM_EMAIL=your_email@gmail.com
```
