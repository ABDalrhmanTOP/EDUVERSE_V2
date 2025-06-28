# Email Setup Guide - Fix Email Sending Issue

## Current Problem

Your emails are being logged to files instead of being sent to your Gmail inbox because the email configuration is set to `log` mode.

## Step-by-Step Solution

### Step 1: Prepare Your Gmail Account

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
    - Go to Google Account Settings
    - Security → 2-Step Verification → App passwords
    - Generate a new app password for "Mail"
    - Copy the 16-character password

### Step 2: Update Your .env File

Replace your current mail settings in `.env` with:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="EduVerse"
```

### Step 3: Clear Laravel Cache

Run these commands in your Laravel project directory:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Step 4: Restart Your Laravel Server

```bash
php artisan serve
```

### Step 5: Test Email Configuration

1. Go to your admin dashboard
2. Use the "Test Email Sending" button in the notification tester
3. Check your Gmail inbox (and spam folder)

## Alternative: Use Mailtrap (Free Testing)

If you want to test without using your real Gmail:

1. Go to [mailtrap.io](https://mailtrap.io) and create a free account
2. Create a new inbox
3. Go to inbox settings → SMTP Settings
4. Use these settings in your `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=notifications@eduverse.com
MAIL_FROM_NAME="EduVerse"
```

## Troubleshooting

### If emails still don't work:

1. Check your Gmail app password is correct
2. Make sure 2FA is enabled on your Gmail account
3. Check your spam folder
4. Verify the email address in your .env file matches your Gmail

### If you get authentication errors:

-   Use the app password, not your regular Gmail password
-   Make sure you copied the 16-character app password correctly

## Test Commands

After setup, you can test using these endpoints:

-   `POST /api/admin/notifications/test-email` - Test notification email
-   `POST /api/admin/test-email-simple` - Test simple email

Both are available in your admin dashboard notification tester.
