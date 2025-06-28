# Gmail Email Troubleshooting Guide

## Quick Diagnosis

If emails are not being sent to Gmail, follow these steps:

### Step 1: Run the Email Test Script

```bash
cd EDUVERS_V2/EDUVERS
php test_email.php
```

This will show you:

-   Current mail configuration
-   Whether email sending works
-   Specific error messages

### Step 2: Check Your .env File

Make sure your `.env` file has these exact settings:

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

### Step 3: Verify Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Copy the 16-character password (no spaces)
5. Update your `.env` file with this password

### Step 4: Clear Laravel Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Step 5: Restart Laravel Server

```bash
php artisan serve
```

## Common Issues and Solutions

### Issue 1: "Authentication failed"

**Symptoms**: Error message mentions authentication failure
**Solution**:

-   Use App Password, not your regular Gmail password
-   Make sure 2FA is enabled on your Gmail account
-   Verify the app password is exactly 16 characters

### Issue 2: "Connection timeout"

**Symptoms**: Email test hangs or times out
**Solution**:

-   Check your internet connection
-   Verify firewall isn't blocking port 587
-   Try using port 465 with SSL instead of TLS

### Issue 3: "Email not received"

**Symptoms**: Test says email sent but nothing in inbox
**Solution**:

-   Check spam/junk folder
-   Verify email address is correct
-   Check Gmail settings for "Less secure app access" (not recommended)

### Issue 4: "Configuration error"

**Symptoms**: Laravel can't read mail configuration
**Solution**:

-   Make sure `.env` file exists and has correct format
-   Check for typos in environment variables
-   Clear config cache: `php artisan config:clear`

## Alternative: Use Mailtrap for Testing

If Gmail continues to have issues, use Mailtrap for testing:

1. Go to [mailtrap.io](https://mailtrap.io) and create free account
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

## Testing Commands

### Test via Admin Dashboard

1. Go to your admin dashboard
2. Use the "Test Email Sending" button
3. Check for success/error messages

### Test via API

```bash
# Test simple email
curl -X POST http://localhost:8000/api/admin/test-email-simple \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Test notification email
curl -X POST http://localhost:8000/api/admin/notifications/test-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test via Laravel Tinker

```bash
php artisan tinker
```

Then run:

```php
Mail::raw('Test email', function($message) {
    $message->to('your-email@gmail.com')->subject('Test');
});
```

## Debug Information

### Check Laravel Logs

```bash
tail -f storage/logs/laravel.log
```

### Check Mail Configuration

```bash
php artisan tinker
```

Then run:

```php
config('mail')
```

### Test SMTP Connection

```bash
telnet smtp.gmail.com 587
```

## Final Checklist

-   [ ] 2FA enabled on Gmail account
-   [ ] App password generated and copied correctly
-   [ ] `.env` file has correct Gmail settings
-   [ ] Laravel cache cleared
-   [ ] Server restarted
-   [ ] Email test script run successfully
-   [ ] Checked spam folder
-   [ ] Verified email address

## Still Having Issues?

If you're still having problems:

1. **Check Gmail Account Settings**: Make sure your Gmail account allows SMTP access
2. **Try Different Port**: Use port 465 with SSL instead of 587 with TLS
3. **Use Mailtrap**: Switch to Mailtrap for testing to isolate the issue
4. **Check Laravel Version**: Ensure you're using a compatible Laravel version
5. **Contact Support**: If all else fails, the issue might be with your Gmail account settings

## Production Recommendations

For production, consider using:

-   **SendGrid** - Professional email service
-   **Mailgun** - Reliable email delivery
-   **Amazon SES** - Cost-effective for high volume
-   **Postmark** - Transactional email specialist
